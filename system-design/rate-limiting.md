# Rate Limiting

> Learn how rate limiters protect your systems from being overwhelmed. Understand where to place them, why Redis is the go-to database, five popular algorithms, and how to scale with sharding. Includes the practical insight of building rate limiters as libraries instead of services.

- URL: https://pulkit.blog/system-design/rate-limiting/
- Published: April 11, 2026
- Tags: System Design, Rate Limiting, Redis, API Design, Scalability
- Part of: [System Design](https://pulkit.blog/system-design.md)

Your API launches. Traffic is steady. Then a bot starts hammering your login endpoint with thousands of requests per second. Or a misbehaving client enters a retry loop. Or someone launches a brute-force attack against your authentication service. Your database buckles under load. Response times spike. Your perfectly healthy system is now on its knees.

Rate limiting is how you prevent this. It caps the number of requests a client can make within a given time window. Anything beyond that limit gets rejected immediately. Simple concept, but the implementation decisions matter a lot.

## TL;DR

- **Rate limiting** caps requests per user/IP/token within a time window
- **HTTP 429** (Too Many Requests) is the standard rejection response
- **Placement options** include proxy/gateway level, application middleware, or embedded as a library
- **Redis** is the go-to store because it's fast, supports key expiration, and has atomic `INCR`/`EXPIRE` commands
- **Five algorithms** each with trade-offs: Fixed Window, Sliding Window Log, Sliding Window Counter, Token Bucket, Leaky Bucket
- **Build a library, not a service**: packaging rate limiting as a library that talks directly to Redis eliminates unnecessary network hops
- **Scaling** means sharding Redis by user ID or IP, since the bottleneck is compute (writes on every request), not storage
- **Race conditions** in concurrent environments are solved with Lua scripts or Redis sorted sets

## What is Rate Limiting

![Rate limiter either allows or rejects incoming requests](https://pulkit.blog/assets/content/blogs/rate-limiting/rate-limiter-overview.webp)

A rate limiter sits in the request path and decides whether to allow or reject each request. If the client is within the allowed threshold, the request goes through. If they've exceeded the limit, the request is rejected immediately.

When a request is rejected, the standard HTTP response is **429 Too Many Requests**. Along with the status code, well-designed rate limiters return headers that help clients understand their current state:

```text
X-Ratelimit-Limit: 100
X-Ratelimit-Remaining: 0
X-Ratelimit-Retry-After: 30
```

`X-Ratelimit-Limit` tells the client how many requests are allowed per window. `X-Ratelimit-Remaining` shows how many are left. `X-Ratelimit-Retry-After` tells the client how long to wait before trying again.

### Why Rate Limit

**Prevent abuse and attacks.** Brute-force login attempts, DDoS attacks, and scraping bots all generate high request volumes. Rate limiting stops them before they can cause damage.

**Reduce cost.** If you're using paid third-party APIs (payment gateways, credit checks, SMS providers), every call costs money. Rate limiting prevents runaway costs from misbehaving clients.

**Protect your infrastructure.** Even without malicious intent, a single client in a retry loop can overwhelm your database. Rate limiting ensures no single client can monopolize your resources.

Almost every major platform enforces rate limits. Twitter limits tweet creation to 300 per 3 hours. Google Docs API allows 300 read requests per user per 60 seconds. Stripe throttles API requests per key. It's table stakes for any production API.

## Where Does a Rate Limiter Fit

There are two fundamental approaches to placing a rate limiter. Each has trade-offs.

### At the Proxy or API Gateway

![Rate limiter at the proxy level blocks requests before they reach your service](https://pulkit.blog/assets/content/blogs/rate-limiting/placement-proxy.webp)

If your architecture has a front-end proxy (NGINX, HAProxy) or an API gateway, you can check the rate limiter there. When a request arrives, the proxy consults the rate limiter. If the request is over the limit, it returns 429 immediately. The request never reaches your backend service at all.

```typescript
async function proxyHandler(req: Request): Promise<Response> {
  const clientIp = req.headers.get("x-forwarded-for") ?? "unknown";
  const allowed = await checkRateLimit(clientIp);

  if (!allowed) {
    return new Response("Too Many Requests", { status: 429 });
  }

  return forwardToBackend(req);
}
```

This is ideal when you want to protect your backend from even seeing excess traffic.

### As Application Middleware

![Rate limiter as middleware inside the service](https://pulkit.blog/assets/content/blogs/rate-limiting/placement-middleware.webp)

If you don't have a proxy, or you want per-endpoint granularity, implement rate limiting as middleware in your application. The request reaches your service, but the middleware checks the rate limiter before invoking the actual handler.

```typescript
async function rateLimitMiddleware(
  req: Request,
  next: () => Promise<Response>,
): Promise<Response> {
  const userId = extractUserId(req);
  const endpoint = new URL(req.url).pathname;
  const key = `${userId}:${endpoint}`;

  const allowed = await checkRateLimit(key);

  if (!allowed) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": "30" },
    });
  }

  return next();
}
```

This gives you granular control. You can set different limits per endpoint: maybe your `/api/login` endpoint allows 5 requests per minute while `/api/search` allows 100.

### Which One to Pick

If you have a proxy and want to shield your entire backend, put the rate limiter at the proxy. If you need per-endpoint or per-user granularity inside your service, use middleware. Many production systems use both: a coarse global limit at the proxy and fine-grained limits in the application.

## Choosing the Database

Before picking a database, think about the access pattern. For every incoming request, you need to:

1. **Read** the current request count for this client
2. **Write** an incremented count
3. **Expire** the count after the time window passes

That's a key-value access pattern with expiration. You need something fast, since this check happens on every single request. Disk-based databases are too slow. You need an in-memory store.

**Redis** fits perfectly. It provides two commands that do exactly what rate limiting needs:

- `INCR` increments a counter by 1 atomically
- `EXPIRE` sets a TTL on a key so it auto-deletes after the time window

```typescript
async function checkRateLimit(key: string): Promise<boolean> {
  const current = await redis.incr(`ratelimit:${key}`);

  if (current === 1) {
    await redis.expire(`ratelimit:${key}`, 60);
  }

  return current <= 100;
}
```

The first time a key is incremented, it's created with value 1 and you set a 60-second expiry. Every subsequent request increments the counter. After 60 seconds, the key disappears and the cycle starts fresh.

The data model is simple: `user_id -> count` with a TTL. Redis stores this in memory, so reads and writes are sub-millisecond. For a rate limiter that's consulted on every request, that speed matters.

## Rate Limiting Algorithms

There are five common algorithms for rate limiting. Each makes different trade-offs between accuracy, memory usage, and burst handling.

### 1. Fixed Window Counter

The simplest approach. Divide time into fixed windows (say, 1-minute intervals). Maintain a counter for each window. Increment on every request. Reject when the counter exceeds the limit. When the window ends, the counter resets.

```typescript
async function fixedWindow(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const windowKey = `${key}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;
  const count = await redis.incr(windowKey);

  if (count === 1) {
    await redis.expire(windowKey, windowSeconds);
  }

  return count <= limit;
}
```

**Pros:** Memory efficient. Easy to understand. One counter per key per window.

**Cons:** Burst problem at window edges.

![The edge-burst problem in fixed window counters](https://pulkit.blog/assets/content/blogs/rate-limiting/fixed-window-edge.webp)

If the limit is 5 requests per minute, a client can send 5 requests at the end of one window and 5 more at the start of the next. That's 10 requests in a span of just a few seconds, despite the "5 per minute" limit. The algorithm is correct per-window, but the boundary creates a loophole.

### 2. Sliding Window Log

The fixed window approach divides time into discrete chunks. The sliding window log takes a different approach: instead of counting requests in a fixed bucket, it keeps a log of every request's timestamp.

Think of it as a guest book. Every time someone enters, you write down the exact time. When someone new shows up, you shred entries older than your window, count what is left, and decide whether they can enter.

Incoming traffic is checked against the timestamps still inside `[now − windowSize, now]`. Expired stamps are removed before you compare against the limit. Accepted requests get appended to the log. Denied requests are never logged because they never counted toward the quota.

**Interactive demo: Sliding window log.** [Try it on the page](https://pulkit.blog/system-design/rate-limiting/).

Scaled up to longer windows, the mechanics stay identical: at **t = 59** seconds inside a **60-second** quota you can still be full while **t = 61** drops the earliest stamp so a slot frees up, there is never a sharp calendar-minute reset.

In Redis, a [sorted set](https://redis.io/docs/latest/develop/data-types/sorted-sets) is perfect for this. The score is the timestamp, the member is a unique identifier for the request:

```typescript
async function slidingWindowLog(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowMs;

  await redis.zremrangebyscore(key, 0, windowStart);
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, Math.ceil(windowMs / 1000));

  const count = await redis.zcard(key);
  return count <= limit;
}
```

`ZREMRANGEBYSCORE` removes all entries with a score (timestamp) less than the window start. `ZADD` adds the new request with its timestamp as the score. `ZCARD` returns the count of remaining entries.

**Pros:** Perfectly accurate. No edge-burst problem. Every rolling window is exact. Great for strict rate limiting where precision matters (like financial APIs or authentication endpoints).

**Cons:** Memory-heavy. You're storing every single request timestamp. If you allow 1000 requests per hour per user and have 1 million active users, that's potentially 1 billion entries. Each entry in a Redis sorted set takes roughly 50-100 bytes (member + score + overhead), so you're looking at 50-100 GB just for rate limiting data. That's why most systems use the sliding window counter instead, which approximates this behavior with just two counters per user.

### 3. Sliding Window Counter

The sliding window counter keeps the rolling boundary you get from a log, but avoids storing timestamps. Storage is tiny: typically **two keys per client**, one counter for each of the last two aligned fixed windows, the same coarse buckets fixed-window counters already use.

Align the clock into windows of length `windowSeconds` (minute boundaries when the window is 60 seconds). At any instant `now`, only two of those buckets can overlap the sliding interval **`[now − windowSeconds, now]`**: the bucket you are inside now (**current**) and the one that ended immediately before it (**previous**). Everything older has fully fallen outside the horizon.

Rough idea: pretend traffic was evenly spread inside each bucket, then estimate how much of **previous’s** traffic still sticks into the trailing window. Weight that bucket by overlap; add what you’ve already accrued in **current**.

Let `elapsed` ∈ \[0, 1) be progress through **current**: `elapsed = 0` at the boundary where the previous bucket just ended and `elapsed → 1` as you reach the next boundary.

```text
effective_estimate = previous_count × (1 − elapsed) + current_count
```

Intuition: `(1 − elapsed)` is how large a slice of the previous fixed window still overlaps your sliding horizon. Twenty percent through the minute means roughly eighty percent of the previous bucket’s arrivals still sits inside `[now − 60 s, now]`, so last minute’s counter is scaled by `0.8`. Requests already counted against **current** enter the estimate in full, they are all inside the horizon with this common (slightly pessimistic) variant.

Nothing here is mathematically identical to trimming by timestamp, it’s cheap and usually close: **counts per bucket**, not per request.

```typescript
async function slidingWindowCounter(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const now = Date.now() / 1000;
  const currentWindow = Math.floor(now / windowSeconds);
  const previousWindow = currentWindow - 1;
  const elapsed = (now % windowSeconds) / windowSeconds;

  const [currentCount, previousCount] = await Promise.all([
    redis.get(`${key}:${currentWindow}`).then((v) => Number(v) || 0),
    redis.get(`${key}:${previousWindow}`).then((v) => Number(v) || 0),
  ]);

  const effectiveCount = previousCount * (1 - elapsed) + currentCount;

  if (effectiveCount >= limit) {
    return false;
  }

  await redis.incr(`${key}:${currentWindow}`);
  await redis.expire(`${key}:${currentWindow}`, windowSeconds * 2);
  return true;
}
```

TTL on the active key is stretched (here `windowSeconds * 2`) so the minute before’s counter is still readable while you overlap it; keys for older buckets fall off naturally.

**Pros:** **Memory efficient**, two counters, not millions of timestamps. Smooths fixed-window bursts because the overlap weight bleeds quota across boundaries instead of a hard reset stripe. Operators like Cloudflare publish error rates measured on huge traffic (**\~0.003% misclassified** among hundreds of millions of requests).

**Cons:** **Approximate**. It assumes traffic is roughly uniform inside each fixed window. Real clusters (everyone hits you on the second, or the top of the hour) can skew the estimate, occasionally a bit loose or a bit tight compared to a true sliding log. For many APIs that margin is acceptable next to the memory win.

### 4. Token Bucket

Instead of counting requests, imagine a bucket that holds tokens. Tokens are added at a fixed rate. Each request consumes one token. If the bucket is empty, the request is rejected. The bucket has a maximum capacity, which allows short bursts.

```typescript
async function tokenBucket(
  key: string,
  capacity: number,
  refillRate: number,
): Promise<boolean> {
  const now = Date.now();
  const bucket = await redis.hgetall(`bucket:${key}`);

  let tokens = Number(bucket.tokens ?? capacity);
  const lastRefill = Number(bucket.lastRefill ?? now);

  const elapsed = (now - lastRefill) / 1000;
  tokens = Math.min(capacity, tokens + elapsed * refillRate);

  if (tokens < 1) {
    return false;
  }

  await redis.hmset(`bucket:${key}`, {
    tokens: (tokens - 1).toString(),
    lastRefill: now.toString(),
  });
  await redis.expire(`bucket:${key}`, Math.ceil(capacity / refillRate) + 60);

  return true;
}
```

**Pros:** Allows controlled bursts. A user who's been idle accumulates tokens and can send a burst of requests. Memory efficient (two values per key). Used by Amazon and Stripe.

**Cons:** Two parameters to tune (bucket size and refill rate), which can be tricky to get right.

### 5. Leaky Bucket

Similar to token bucket, but requests are processed at a fixed, constant rate. Incoming requests are added to a queue. If the queue is full, new requests are dropped. Requests are pulled from the queue and processed at a steady rate.

```typescript
async function leakyBucket(
  key: string,
  capacity: number,
  leakRate: number,
): Promise<boolean> {
  const now = Date.now();
  const bucket = await redis.hgetall(`leak:${key}`);

  let waterLevel = Number(bucket.level ?? 0);
  const lastLeak = Number(bucket.lastLeak ?? now);

  const elapsed = (now - lastLeak) / 1000;
  waterLevel = Math.max(0, waterLevel - elapsed * leakRate);

  if (waterLevel >= capacity) {
    return false;
  }

  await redis.hmset(`leak:${key}`, {
    level: (waterLevel + 1).toString(),
    lastLeak: now.toString(),
  });
  await redis.expire(`leak:${key}`, Math.ceil(capacity / leakRate) + 60);

  return true;
}
```

**Pros:** Produces a perfectly smooth, constant outflow rate. Memory efficient. Used by Shopify.

**Cons:** A burst of traffic fills the queue with old requests. Recent requests get dropped even if the old ones are no longer relevant. Same tuning challenge as token bucket.

### Picking an Algorithm

| Algorithm              | Burst Handling     | Memory   | Accuracy    | Good For                  |
| ---------------------- | ------------------ | -------- | ----------- | ------------------------- |
| Fixed Window           | Poor (edge bursts) | Very low | Approximate | Simple use cases          |
| Sliding Window Log     | Exact              | High     | Perfect     | Strict accuracy needs     |
| Sliding Window Counter | Smoothed           | Low      | Very good   | Most production systems   |
| Token Bucket           | Allows bursts      | Low      | Good        | APIs with burst tolerance |
| Leaky Bucket           | Prevents bursts    | Low      | Good        | Steady throughput needs   |

For most systems, start with fixed window counter. It's simple and works well enough. When you need more precision, move to sliding window counter. If your use case benefits from allowing bursts (like API gateways), consider token bucket.

## A Library, Not a Service

This is where realistic system design diverges from textbook diagrams.

The instinct is to build a rate limiter "service" with its own load balancer, API servers, and Redis backend. Draw the boxes, add arrows. It looks impressive on a whiteboard.

![Comparison of rate limiter as a service versus as a library](https://pulkit.blog/assets/content/blogs/rate-limiting/service-vs-library.webp)

But look at what happens when your payment service needs to check the rate limiter: the request goes from your service to the rate limiter's load balancer, to one of its API servers, which talks to Redis, gets the response, sends it back through the load balancer, back to your service. That's 4+ network hops before you've even started processing the actual request.

For something that runs on every single request, those hops add up. Your p99 latency shoots up. You've broken the fundamental requirement that rate limiting should not add massive overhead.

The better approach: make the rate limiter a library. Package the rate limiting logic (the algorithm, the Redis commands) as a library that your services import directly.

```typescript
import { createRateLimiter } from "@your-org/rate-limiter";

const limiter = createRateLimiter({
  redis: { host: "redis-shard-1.internal", port: 6379 },
  algorithm: "sliding-window-counter",
  defaultLimit: 100,
  defaultWindow: 60,
});

async function handler(req: Request): Promise<Response> {
  const userId = extractUserId(req);
  const allowed = await limiter.check(userId);

  if (!allowed) {
    return new Response("Too Many Requests", { status: 429 });
  }

  return processRequest(req);
}
```

Your service imports the library and talks directly to Redis. One network hop. No load balancer. No API server. No unnecessary infrastructure.

"But doesn't that duplicate logic across services?" Yes. That's what libraries are for. You write the logic once, package it as a library (npm package, pip package, Maven artifact), and every service that needs rate limiting imports it. The logic lives in one place (the library code), but runs wherever it's needed.

Your rate limiter "service" is now just Redis and a library. That's it. This is how production systems actually work.

## Scaling the Rate Limiter

Since the rate limiter is now just a Redis database and a library, scaling the rate limiter means scaling Redis.

### The Storage Math

Let's figure out how much storage we actually need. If you're rate limiting by user ID:

| Field               | Size        |
| ------------------- | ----------- |
| User ID (integer)   | 4 bytes     |
| Count (integer)     | 4 bytes     |
| **Total per entry** | **8 bytes** |

For IP-based limiting: IP address (16 bytes) + count (4 bytes) = 20 bytes per entry.

With 100 million users at 20 bytes each, total storage is about 2 GB. That comfortably fits in a single Redis instance. **Storage is not the bottleneck.**

### The Compute Problem

The bottleneck is writes. For every single incoming request, you're doing `INCR` on a Redis key. At 100,000 requests per second across your platform, that's 100,000 write operations per second hitting Redis. A single Redis instance can handle a lot (around 100k operations/second), but as traffic grows, you'll need to distribute the load.

### Vertical Scaling

Start here. Upgrade your Redis instance: more CPU, more RAM, faster network. A single well-provisioned Redis node can handle surprisingly high throughput. Don't shard until you actually need to.

### Why Read Replicas Don't Help

This is a write-heavy workload. Every request writes (increments a counter). Read replicas only help when you have a high read-to-write ratio. For rate limiting, reads and writes are roughly 1:1. Adding read replicas doesn't reduce the write load on the primary.

### Sharding

![Sharded rate limiter with hash-based routing to Redis shards](https://pulkit.blog/assets/content/blogs/rate-limiting/scaling-sharding.webp)

When one Redis node can't handle the write throughput, shard. Since you're rate limiting per user (or per IP or per token), the data is naturally partitioned. Each user's counter only lives on one shard. No cross-shard queries needed.

```typescript
function getShardForUser(userId: string, shards: Redis[]): Redis {
  const hash = hashCode(userId);
  return shards[hash % shards.length];
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const shard = getShardForUser(userId, redisShards);
  const count = await shard.incr(`ratelimit:${userId}`);

  if (count === 1) {
    await shard.expire(`ratelimit:${userId}`, 60);
  }

  return count <= 100;
}
```

The library needs to know about all Redis shards. Store shard addresses in a central config (a file on S3, a database entry, a config service). When the library initializes, it reads the config and creates connections to all shards.

```typescript
async function initRateLimiter(): Promise<Redis[]> {
  const config = await fetchShardConfig();
  return config.shards.map(
    (addr) => new Redis({ host: addr.host, port: addr.port }),
  );
}
```

On each request, hash the user ID, pick a shard, and do the rate limiting operations on that shard. Simple, scalable, minimal overhead.

## Race Conditions in Distributed Environments

There's a subtle problem with the basic `INCR` approach. In a highly concurrent environment, two requests can arrive at the same time:

1. Request A reads the counter: value is 99
2. Request B reads the counter: value is 99
3. Both check: 99 < 100, so both are allowed
4. Request A increments to 100
5. Request B increments to 101

The limit was 100, but 101 requests got through. This is a classic read-check-write race condition.

### Lua Scripts

The most common solution is a Lua script that runs atomically in Redis. Redis executes Lua scripts as a single atomic operation, so no interleaving can happen.

```lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])

local current = redis.call("INCR", key)
if current == 1 then
  redis.call("EXPIRE", key, window)
end

if current > limit then
  return 0
end
return 1
```

```typescript
const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local current = redis.call("INCR", key)
if current == 1 then
  redis.call("EXPIRE", key, window)
end
if current > limit then
  return 0
end
return 1
`;

async function atomicRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const result = await redis.eval(
    RATE_LIMIT_SCRIPT,
    1,
    `ratelimit:${key}`,
    limit,
    windowSeconds,
  );
  return result === 1;
}
```

The `INCR` + conditional `EXPIRE` + limit check all happen as one atomic operation. No race condition possible.

### Sorted Sets

For sliding window log implementations, Redis sorted sets naturally handle atomicity. `ZADD`, `ZREMRANGEBYSCORE`, and `ZCARD` can be combined in a Lua script or a `MULTI`/`EXEC` transaction to prevent races.

## Hands-on

I've created runnable demos you can clone and run locally: [rate-limiter](https://github.com/pulkitxm/systems/tree/main/traffic-control/rate-limiter). It is TypeScript on top of Redis with atomic Lua scripts for fixed window, sliding window log, sliding window counter, and leaky bucket, plus a script that shows the read-check-write race versus a Lua-backed limiter under concurrent requests.

## Conclusion

Rate limiting protects your system from being overwhelmed, whether by malicious attacks, misbehaving clients, or unexpected traffic spikes. The core mechanics are straightforward: track request counts in Redis, reject when limits are exceeded, return 429.

The key design decisions come down to placement (proxy vs. middleware), algorithm choice (start with fixed window, graduate to sliding window counter), and architecture (library, not service).

Start simple. One Redis instance, a fixed window counter, rate limiting as middleware in your application. As traffic grows, switch to a more accurate algorithm. When one Redis node isn't enough, shard by user ID. Keep the architecture minimal: a database and a library, not a distributed service with its own load balancers.

The goal isn't to build the most sophisticated rate limiter possible. The goal is to protect your system without adding the very overhead you're trying to prevent.

## Related writing

- [Bloom Filters](https://pulkit.blog/system-design/bloom-filters.md): January 24, 2026
- [Caching](https://pulkit.blog/system-design/caching.md): January 8, 2026
- [Load Balancers](https://pulkit.blog/system-design/load-balancers.md): January 11, 2026
