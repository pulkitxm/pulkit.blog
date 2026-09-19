# BullMQ Cron Jobs with Redis in Node.js

> Schedule cron jobs in Node.js with BullMQ repeatable jobs and Redis: workers, scheduler internals, graceful shutdown, and DB sync. Full TypeScript code.

- URL: https://pulkit.blog/cron-jobs-with-bullmq/
- Published: March 29, 2026
- Tags: BullMQ, Repeatable Jobs, Cron Jobs, Redis, Node.js, TypeScript, Backend

I was building cron jobs at [Noveum.ai](https://noveum.ai). We needed users to schedule automated analysis reports on their own terms: daily at 6 AM, every Monday at noon, every 15 minutes during business hours. The kind of thing where the schedule lives in a database and each user can create, edit, or delete their own.

Before writing any code, I looked at how [Vercel handles cron](https://vercel.com/docs/cron-jobs). It's dead simple: you define a schedule in `vercel.json`, and Vercel hits your API route at that interval. No infrastructure to manage, no Redis, no workers. For simple periodic tasks, it's perfect.

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 8 * * *"
    }
  ]
}
```

But it didn't fit our use case. We wanted to self-host the whole thing inside our AWS VPC: workers talking to Redis and our databases on private networks, not a platform-managed cron hitting a public API route. Vercel cron schedules are also static, defined at deploy time, and we needed dynamic schedules created at runtime by users. On top of that we needed retries with exponential backoff, concurrency control, long-running jobs that go well beyond serverless timeouts, and distributed workers that can scale horizontally. That's what led me to [BullMQ](https://docs.bullmq.io). Since we are already using it for our workers and it was super easy to set up cron jobs with it, it was a no-brainer.

This is what we ended up building:

![](https://pulkit.blog/assets/content/blogs/cron-jobs-with-bullmq/noveum-cron-dash.webp)

![](https://pulkit.blog/assets/content/blogs/cron-jobs-with-bullmq/cron-runs.webp)

![](https://pulkit.blog/assets/content/blogs/cron-jobs-with-bullmq/create-cron-form.webp)

In this post, I'll walk through how to build a production-grade cron system with BullMQ and Redis: what cron expressions are, why common alternatives hit limits, how BullMQ implements scheduling with repeatable jobs, then hands-on setup, workers, error handling, and keeping your database in sync with Redis.

## What Are Cron Jobs?

Cron comes from Unix. It's a time-based scheduler that runs commands at specified intervals. You define a schedule using a **cron expression**, a compact string with five fields:

```text
┌───────────── minute (0–59)
│ ┌───────────── hour (0–23)
│ │ ┌───────────── day of month (1–31)
│ │ │ ┌───────────── month (1–12)
│ │ │ │ ┌───────────── day of week (0–7, where 0 and 7 = Sunday)
│ │ │ │ │
* * * * *
```

Some common patterns:

| Expression     | Meaning                              |
| -------------- | ------------------------------------ |
| `0 8 * * *`    | Every day at 8:00 AM                 |
| `*/15 * * * *` | Every 15 minutes                     |
| `0 9 * * 1-5`  | Weekdays at 9:00 AM                  |
| `0 0 1 * *`    | First day of every month at midnight |
| `30 14 * * 0`  | Every Sunday at 2:30 PM              |

## Why Not Vercel Cron / node-cron / setInterval?

Before reaching for BullMQ, it's worth understanding where simpler tools fit and where they fall short.

**Vercel Cron** is great when you need to run a serverless function on a fixed schedule. You define it once in `vercel.json`, deploy, and it just works. If you want long-lived workers self-hosted inside your own AWS VPC with private access to Redis and internal services, that is a different shape than the platform calling a public URL on a timer. The schedules are static, so you can't let users create their own. It's also bound by serverless function timeouts, has no built-in retry or backoff, and you have a limited number of cron jobs depending on your plan.

**`node-cron` and `setInterval`** run in-process. The moment your server restarts, all schedules are gone. There's no persistence, no retries, and no way to distribute work across multiple servers. Fine for a dev script, not for production.

**BullMQ** sits in a different category entirely. Schedules are persisted in Redis, so they survive restarts. Failed jobs automatically retry with configurable exponential backoff. You get concurrency control, long-running job support, and distributed workers, so multiple processes or servers can consume from the same queue. Most importantly, schedules can be created, modified, and removed at runtime through your API.

| Feature                 | Vercel Cron                           | node-cron / setInterval              | BullMQ             |
| ----------------------- | ------------------------------------- | ------------------------------------ | ------------------ |
| Self-hosted in your VPC | No (platform invokes your deployment) | Yes, if your Node process runs there | Yes                |
| Persistence             | Survives deploys                      | None                                 | Redis-backed       |
| Dynamic schedules       | No (deploy-time only)                 | No (code-time only)                  | Yes (runtime API)  |
| Retries & backoff       | No                                    | No                                   | Yes (configurable) |
| Concurrency control     | No                                    | No                                   | Yes                |
| Long-running jobs       | Limited by function timeout           | Yes                                  | Yes                |
| Distributed workers     | No                                    | No                                   | Yes                |
| Setup complexity        | Minimal                               | Minimal                              | Moderate           |

If Vercel cron covers your use case, use it. Reach for BullMQ when you need the extra control.

## How BullMQ Manages Cron Jobs Under the Hood

BullMQ doesn't have a separate "cron scheduler" daemon. There's no long-running process with a timer that wakes up and says "time to run this job." Instead, the entire mechanism is built on top of [repeatable jobs](https://docs.bullmq.io/guide/jobs/repeatable), which are really just **delayed jobs that keep re-adding themselves**.

Here's what happens step by step:

### 1. Registration

When you call `queue.add("my-job", data, { repeat: { pattern: "0 8 * * *" } })`, BullMQ does two things:

- Creates a **repeatable job configuration** in Redis. This is a metadata entry (not a regular job) that stores the cron pattern, timezone, job name, and a generated [`repeatJobKey`](https://api.docs.bullmq.io/classes/v5.Job.html#repeatJobKey). This config is what persists across restarts.
- Immediately schedules the **first delayed job** for the next matching time. If you register at 4:07 AM and the pattern is every hour, the first job gets scheduled for 5:00 AM. BullMQ [aligns to the cron boundaries](https://docs.bullmq.io/guide/jobs/repeatable), so the first run always lands "on the hour."

### 2. Execution and chaining

From the [BullMQ docs](https://docs.bullmq.io/guide/jobs/repeatable): "Every time a repeatable job is picked up for processing, the next repeatable job is added to the queue with a proper delay." This is the core trick: each run chains into the next. The cron pattern is evaluated, the next timestamp is computed, and a new delayed job is placed in the queue.

This means repeatable jobs are fundamentally just **delayed jobs** with automatic re-scheduling. There's no background scheduler polling Redis on an interval. The chain is self-sustaining as long as workers are processing. The newer [Job Schedulers API](https://docs.bullmq.io/guide/job-schedulers) (BullMQ 5.16.0+) works the same way, noting that "the scheduler will only generate new jobs when the last job begins processing."

### 3. Deduplication

BullMQ is [smart enough not to add the same repeatable job](https://docs.bullmq.io/guide/jobs/repeatable) if the repeat options are the same. It generates a unique key for each repeatable job based on the job name, cron pattern, and any custom `jobId` you provide. If you call `queue.add()` with the same repeat options twice, it won't create a duplicate. This is important for deploy safety: your startup code can register repeatable jobs idempotently without worrying about creating duplicates each time the app restarts.

### 4. What if no workers are running?

This is a common concern. The BullMQ docs are explicit here: "If there are no workers running, repeatable jobs will not accumulate next time a worker is online" ([source](https://docs.bullmq.io/guide/jobs/repeatable)). Since the next occurrence is only scheduled when the current one is picked up, jobs don't pile up. If workers are offline for 3 hours and you have a job that runs every 15 minutes, you won't come back to 12 queued jobs. You'll have at most one delayed job waiting, and processing resumes from there.

The repeatable configuration itself stays in Redis regardless. It doesn't expire or get lost because workers are offline. When workers come back, the chain picks up from the next scheduled time.

## Setting Up

Install BullMQ:

```sh
npm install bullmq
```

BullMQ uses Redis under the hood. You'll need a Redis instance running, whether locally via Docker or a managed service like Upstash or AWS ElastiCache.

First, set up the Redis connection:

```typescript
import type { ConnectionOptions } from "bullmq";

function createRedisConnection(): ConnectionOptions {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;

  if (!host || !port) {
    throw new Error("REDIS_HOST and REDIS_PORT are required");
  }

  return {
    host,
    port: parseInt(port, 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
  };
}
```

The [`maxRetriesPerRequest: null`](https://docs.bullmq.io/guide/connections) is important: BullMQ requires this for workers to function properly. Without it, you'll get errors when the worker tries to block-wait for jobs.

Now create a queue:

```typescript
import { Queue } from "bullmq";

const connection = createRedisConnection();

const scheduledQueue = new Queue("scheduled-reports", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 25,
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});
```

The `defaultJobOptions` matter in production:

- **`removeOnComplete: 50`**: keeps the last 50 completed jobs in Redis for debugging, then auto-cleans. Without this, completed jobs pile up forever.
- **`removeOnFail: 25`**: same idea for failed jobs.
- **`attempts: 2`**: retry once on failure (2 total attempts).
- **`backoff`**: [exponential backoff](https://docs.bullmq.io/guide/retrying-failing-jobs) starting at 5 seconds. First retry at \~5s, second at \~10s, and so on.

## Adding Repeatable (Cron) Jobs

This is the core of the whole system. To schedule a repeating job, you call `queue.add()` with a `repeat` option:

```typescript
interface ScheduledJobData {
  jobId: string;
  scheduleId: string;
  userId: string;
  reportType: string;
}

async function addScheduledJob(data: ScheduledJobData, cronExpression: string) {
  const job = await scheduledQueue.add("generate-report", data, {
    repeat: {
      pattern: cronExpression,
      tz: "UTC",
    },
  });

  console.log("Scheduled job registered", {
    scheduleId: data.scheduleId,
    cronExpression,
    repeatJobKey: job.repeatJobKey,
  });

  return job;
}
```

A few things happening here:

- **`repeat.pattern`** takes a standard cron expression.
- **`repeat.tz`** sets the timezone. I'd recommend always using `"UTC"` and converting in your application layer, which avoids a whole class of timezone bugs.
- **`job.repeatJobKey`** is a stable key BullMQ generates for this repeatable job. You'll need it later for removal.

BullMQ deduplicates repeatable jobs by their combination of job name, cron pattern, and any `jobId` you provide. If you call `addScheduledJob` with the same parameters twice, it won't create a duplicate; it just returns the existing one.

### Managing Repeatable Jobs

To list all active schedules using [`getRepeatableJobs()`](https://api.docs.bullmq.io/classes/v5.Queue.html#getRepeatableJobs):

```typescript
async function getSchedules() {
  const jobs = await scheduledQueue.getRepeatableJobs();
  return jobs.map((job) => ({
    key: job.key,
    name: job.name,
    pattern: job.pattern,
    next: new Date(job.next),
  }));
}
```

To remove a schedule using [`removeRepeatableByKey()`](https://api.docs.bullmq.io/classes/v5.Queue.html#removeRepeatableByKey):

```typescript
async function removeSchedule(repeatJobKey: string) {
  await scheduledQueue.removeRepeatableByKey(repeatJobKey);
}
```

You can also find and remove by scanning through repeatable jobs:

```typescript
async function removeScheduleById(scheduleId: string) {
  const repeatableJobs = await scheduledQueue.getRepeatableJobs();

  for (const job of repeatableJobs) {
    if (job.key.includes(scheduleId)) {
      await scheduledQueue.removeRepeatableByKey(job.key);
      return true;
    }
  }

  return false;
}
```

## Building the Worker

The worker is the process that actually picks up and executes jobs when BullMQ fires them according to the cron schedule.

```typescript
import { Worker, type Job, UnrecoverableError } from "bullmq";

const connection = createRedisConnection();

const worker = new Worker<ScheduledJobData>(
  "scheduled-reports",
  async (job: Job<ScheduledJobData>) => {
    console.log("Processing scheduled job", {
      jobId: job.id,
      scheduleId: job.data.scheduleId,
      attempt: job.attemptsMade + 1,
    });

    const result = await generateReport(job.data);

    if (!result.success) {
      if (result.error === "cancelled") {
        throw new UnrecoverableError("Job was cancelled");
      }
      throw new Error(result.error || "Report generation failed");
    }

    return result;
  },
  {
    connection,
    concurrency: 3,
    lockDuration: 1800000,
    lockRenewTime: 300000,
    stalledInterval: 1800000,
  },
);
```

The worker options are tuned for long-running jobs:

- **`concurrency: 3`**: process up to 3 jobs simultaneously.
- **`lockDuration: 1800000`** (30 minutes): how long a job can run before BullMQ considers it [stalled](https://docs.bullmq.io/guide/workers/stalled-jobs). Set this higher than your longest expected job.
- **`lockRenewTime: 300000`** (5 minutes): how often the worker renews the lock. Must be less than `lockDuration`.
- **`stalledInterval: 1800000`**: how often BullMQ checks for stalled jobs.

The [`UnrecoverableError`](https://docs.bullmq.io/guide/retrying-failing-jobs#unrecoverable-errors) is a BullMQ feature: throwing it tells BullMQ "don't retry this job, it's permanently failed." Use it for cancellations, invalid data, or any case where retrying won't help.

### Error Handling

Hook into worker events to log failures:

```typescript
worker.on("completed", (job) => {
  console.log("Job completed", {
    jobId: job.id,
    scheduleId: job.data.scheduleId,
  });
});

worker.on("failed", (job, err) => {
  console.error("Job failed", {
    jobId: job?.id,
    scheduleId: job?.data?.scheduleId,
    error: err.message,
    attempt: job?.attemptsMade,
  });
});

worker.on("error", (err) => {
  console.error("Worker error", { error: err.message });
});
```

### Graceful Shutdown

In production, you want your worker to finish active jobs before shutting down instead of killing them mid-execution. Here's the pattern:

```typescript
let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("Starting graceful shutdown");

  const SHUTDOWN_TIMEOUT = 120_000;

  try {
    await Promise.race([
      waitForActiveJobs(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Shutdown timeout")),
          SHUTDOWN_TIMEOUT,
        ),
      ),
    ]);
  } catch (err) {
    console.warn("Shutdown timeout, forcing close");
  } finally {
    await worker.close();
    await scheduledQueue.close();
    console.log("Worker stopped");
  }
}

async function waitForActiveJobs() {
  const MAX_CHECKS = 120;
  for (let i = 0; i < MAX_CHECKS; i++) {
    const active = await scheduledQueue.getActiveCount();
    if (active === 0) return;
    console.log(`Waiting for ${active} active jobs...`);
    await new Promise((r) => setTimeout(r, 1000));
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

The idea: when we receive a shutdown signal, stop accepting new jobs and wait up to 2 minutes for active ones to complete. If they don't finish in time, force-close. This avoids both data loss (killing mid-job) and hanging deploys (waiting forever).

## Keeping Schedules in Sync

Here's a production problem that catches people off guard: your database says "schedule X runs at `0 8 * * *`," but Redis disagrees. This happens when:

- Redis gets flushed or restarted without persistence
- Someone updates a schedule via the API but the Redis write fails
- A deploy rolls back the code but not the Redis state
- You migrate to a new Redis instance

The fix is a **reconciliation script** that compares what your database says against what Redis has, and brings them in line:

```typescript
import { Queue } from "bullmq";

interface DbSchedule {
  id: string;
  cronExpression: string;
  userId: string;
  reportType: string;
  enabled: boolean;
}

async function syncSchedules(dbSchedules: DbSchedule[], queue: Queue) {
  const enabledSchedules = dbSchedules.filter((s) => s.enabled);
  const repeatableJobs = await queue.getRepeatableJobs();

  const desiredIds = new Set(enabledSchedules.map((s) => s.id));

  const existingByScheduleId = new Map<
    string,
    { key: string; pattern: string }
  >();
  const orphaned: string[] = [];

  for (const job of repeatableJobs) {
    const scheduleId = extractScheduleId(job.key);
    if (scheduleId && desiredIds.has(scheduleId)) {
      existingByScheduleId.set(scheduleId, {
        key: job.key,
        pattern: job.pattern ?? "",
      });
    } else {
      orphaned.push(job.key);
    }
  }

  let removed = 0;
  for (const key of orphaned) {
    await queue.removeRepeatableByKey(key);
    removed++;
  }

  let added = 0;
  let updated = 0;
  let unchanged = 0;

  for (const schedule of enabledSchedules) {
    const existing = existingByScheduleId.get(schedule.id);

    if (existing && existing.pattern === schedule.cronExpression) {
      unchanged++;
      continue;
    }

    if (existing) {
      await queue.removeRepeatableByKey(existing.key);
    }

    await queue.add(
      "generate-report",
      {
        jobId: `scheduled-${schedule.id}`,
        scheduleId: schedule.id,
        userId: schedule.userId,
        reportType: schedule.reportType,
      },
      {
        repeat: {
          pattern: schedule.cronExpression,
          tz: "UTC",
        },
      },
    );

    existing ? updated++ : added++;
  }

  console.log("Schedule sync complete", {
    total: enabledSchedules.length,
    added,
    updated,
    unchanged,
    removedOrphans: removed,
  });
}

function extractScheduleId(jobKey: string): string | null {
  const match = jobKey.match(/scheduled-([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}
```

The logic is straightforward:

1. Load all enabled schedules from your database
2. Load all repeatable jobs from Redis
3. Remove orphaned Redis jobs (exist in Redis but not in DB)
4. For each DB schedule: if Redis has it with the same pattern, skip. If the pattern changed, remove the old one and add the new one. If it's missing, add it.

Run this script on deploy, on a health check interval, or after any Redis incident. It's idempotent, so running it multiple times is safe.

At Noveum, we run this as a Kubernetes [init container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/) on the worker deployment. Before the worker pod starts accepting jobs, the init container runs the sync script to reconcile the database with Redis:

```yaml
initContainers:
  - name: sync-schedules
    image: your-workers-image:latest
    command: ["tsx", "scripts/sync-schedules.ts"]
```

This guarantees that every time a worker pod starts (fresh deploy, restart after a crash, scaling event), Redis has the correct set of repeatable jobs before the worker begins processing. The main container only starts after the init container exits successfully, so there's no window where the worker is running with stale or missing schedules.

## Why This Architecture Is Resilient

One of the biggest advantages of BullMQ with Redis is that the **schedule itself lives in Redis, not in your application code**. There is no "scheduler process" running a `setInterval` or a `node-cron` somewhere. The cron pattern, the next run time, and the repeatable job metadata all live in Redis as durable state.

In our setup at Noveum, we have three moving pieces:

1. **Next.js app** (via API routes): this is where users create, update, and delete schedules. The API calls `queue.add(..., { repeat: { pattern, tz } })` to register a repeatable job in Redis.
2. **Worker processes**: these run the BullMQ `Worker` that picks up and executes jobs when they fire.
3. **Redis**: this holds the queue, the repeatable job definitions, and all job state.

The key insight is that **none of the scheduling logic runs inside your Next.js app or your workers**. BullMQ's repeatable job mechanism is a Redis-native operation. Once a repeatable job is registered, Redis knows the cron pattern and the next execution time. When that time comes, BullMQ promotes the job into the waiting queue automatically.

This means:

- **Next.js goes down?** Doesn't matter. Existing schedules keep ticking because they're already registered in Redis. You only lose the ability to create or edit schedules until the API is back.
- **Workers go down?** Jobs pile up in the Redis queue. The moment a worker comes back online, it drains the backlog and processes everything that was waiting.
- **Both Next.js and workers go down?** The cron schedules are still not affected. Redis continues to track the repeatable patterns and queue new job instances on schedule. When your workers recover, they pick up right where things left off.

The only real failure mode is **Redis itself going down**. If Redis is gone, the schedules, the queue, and all job state go with it. That's why Redis persistence (RDB snapshots, AOF, or a managed Redis service with automatic backups) matters. And even in that worst case, the reconciliation script we built earlier can rebuild all repeatable jobs from your database.

Compare this to `node-cron` or `setInterval`, where the scheduler, the executor, and the state all live in the same Node process. If that process dies, everything is gone. With BullMQ, you've cleanly separated **who registers schedules** (API), **who executes jobs** (workers), and **who holds the schedule state** (Redis). Each can fail independently without taking down the others.

## Wrapping Up

The full architecture looks like this: a **Queue** backed by Redis holds the cron patterns, a **Worker** process picks up jobs when they fire, your **API** lets users create and manage schedules, and an optional **sync script** reconciles the database with Redis when things drift.

For sending emails as part of your cron jobs (weekly digests, reports, notifications), I've covered that in a [previous post about email delivery with Resend](https://pulkit.blog/contact-form-with-resend.md).

I've put together a working example with all the code from this post that you can run locally: [cron-jobs on GitHub](https://github.com/pulkitxm/systems/tree/main/messaging/cron-jobs). It includes the queue setup, worker with task handlers, schedule management scripts, and the reconciliation logic, all wired up with Docker Compose for Redis.

If your scheduling needs are simple, like a fixed cron that hits an API route, Vercel cron or `node-cron` will serve you well. But when users need to define their own schedules, when jobs run for minutes instead of seconds, when you need retries and distributed processing, that's where BullMQ earns its place. It's more setup upfront, but the reliability and flexibility in production makes it worth it.

## Related writing

- [Prisma ORM with PostgreSQL](https://pulkit.blog/prisma-with-postgresql.md): August 17, 2024
- [AWS S3 with Node.js: Upload Files with SDK v3](https://pulkit.blog/aws-s3-with-nodejs.md): August 8, 2024
- [Branded Types in TypeScript](https://pulkit.blog/branded-types-in-typescript.md): December 26, 2025
