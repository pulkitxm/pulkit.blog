# High Availability

> Learn how to build resilient systems through data redundancy, automatic failover, and leader election. Understand backup strategies, database replication, disaster recovery patterns, and how leader election enables zero-downtime auto-recovery.

- URL: https://pulkit.blog/system-design/high-availability/
- Published: January 23, 2026
- Tags: System Design, High Availability, Distributed Systems, Leader Election
- Part of: [System Design](https://pulkit.blog/system-design.md)

Your server crashes. That's annoying, but manageable. Spin up another one, route traffic there. API servers are typically stateless. Losing one is like losing a waiter at a restaurant: inconvenient, but the kitchen keeps cooking.

Now imagine your database crashes. Not just "process died and needs restart." The disk failed. Corrupted. Unrecoverable. All your user data, orders, transactions: gone. That's not inconvenience. That's a business-ending catastrophe.

This is why redundancy matters. You can't prevent failures. You can survive them.

## TL;DR

**Data Redundancy:**

- **Stateless vs stateful**: API servers are replaceable. Databases hold your business. Treat them differently
- **Redundancy is survival**: When data loss happens, having copies is the difference between recovery and shutdown
- **Multiple levels**: Redundancy can be at row, table, or database level. Choose based on criticality
- **Backup and restore**: Daily incremental + weekly full backups. Simple, effective, essential
- **Continuous redundancy**: Real-time replication to a standby database. Zero data loss on failure
- **Cross-region backups**: One copy in another data center. Natural disasters can't kill your business
- **Sync vs async replication**: Sync is safer, async is faster. Pick based on your tolerance for data loss
- **Standby replicas**: Dedicated copy that doesn't serve traffic. Just waits for disaster
- **Automatic failover**: Detect failure, promote replica, redirect traffic. Minimal downtime

**Leader Election:**

- **The monitoring problem**: Someone needs to watch your servers. But who watches the watcher?
- **Orchestrators**: Components that monitor servers and spin up replacements when needed
- **The recursion problem**: Orchestrators need orchestrators. Where does it stop?
- **Leader election as base case**: The point where your system can self-heal without external intervention
- **Leader-follower setup**: One leader monitors workers, workers monitor servers, workers elect new leader if needed
- **Zero human intervention**: System recovers automatically from any single point of failure

## Why Databases Are Different

API servers sit behind a load balancer. Request comes in, any server can handle it. If server 3 goes down, servers 1, 2, and 4 pick up the slack. The only impact? Requests mid-flight on server 3 fail. Users retry, life goes on.

```text
Load Balancer
     │
     ├── API Server 1 ✓
     ├── API Server 2 ✓
     ├── API Server 3 ✗ (crashed)
     └── API Server 4 ✓

Traffic automatically routes to healthy servers.
```

This works because API servers don't remember anything. They're stateless. Every request carries all the information needed. Server 1 handles your login, server 4 handles your next page load. Neither server cares.

Databases are the opposite. They hold your state. Your users. Your orders. Your payment history. Your entire business.

```text
Single Database
     │
     └── 💾 All your data
         (users, orders, payments, everything)

If this fails catastrophically, you're done.
```

When your database disk fails, you can't just "spin up another one." There's no other copy. The data doesn't exist anywhere else. You're not debugging a bug. You're explaining to customers why their accounts vanished.

![API servers are stateless and replaceable, databases are stateful and critical](https://pulkit.blog/assets/content/blogs/high-availability/stateless-vs-stateful.webp)

This isn't theoretical. [GitLab famously lost 6 hours of production data in 2017](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31). A combination of human error and incomplete backups. They had 5 different backup mechanisms. None worked correctly when needed.

The lesson: redundancy isn't optional. It's how your business survives the inevitable.

## Levels of Redundancy

![Redundancy can be implemented at different granularities](https://pulkit.blog/assets/content/blogs/high-availability/redundancy-levels.webp)

When you think about making data redundant, the first question is: at what level?

### Row or Document Level

Replicate individual records across databases. Useful for specific high-value data.

```typescript
async function createCriticalRecord(data: CriticalData): Promise<void> {
  await primaryDb.insert("critical_records", data);
  await secondaryDb.insert("critical_records", data);
}
```

Financial transactions, user authentication data, audit logs. Things where losing a single record is unacceptable.

### Table Level

Dump entire tables and restore them elsewhere. Useful for periodic snapshots of important data.

```bash
pg_dump -t users -t orders mydb > critical_tables.sql
```

### Database Level

Full database backup or real-time replication. The most common approach for complete protection.

```bash
pg_basebackup -D /backup/postgres -Fp -Xs -P
```

The right level depends on what you're protecting and how much you can afford to lose.

| Level    | Protection       | Complexity | Recovery Time |
| -------- | ---------------- | ---------- | ------------- |
| Row      | Individual items | High       | Instant       |
| Table    | Critical tables  | Medium     | Minutes       |
| Database | Everything       | Low        | Minutes-Hours |

Most systems use database-level redundancy as the foundation, with additional row-level protection for the most critical data.

## Backup and Restore

![Backup strategy with daily incremental and weekly full backups](https://pulkit.blog/assets/content/blogs/high-availability/backup-strategy.webp)

The simplest form of redundancy. Take copies of your data regularly. Store them somewhere safe. If disaster strikes, restore from the most recent backup.

### The Basic Strategy

**Daily incremental backups**: Capture what changed since the last backup. Small, fast, low overhead.

```bash
pg_dump --data-only --inserts mydb > incremental_$(date +%Y%m%d).sql
```

**Weekly full backups**: Complete snapshot of everything. Larger, slower, but comprehensive.

```bash
pg_basebackup -D /backup/full_$(date +%Y%m%d) -Fp -Xs -P
```

**Cross-region copy**: At least one copy in a different data center. Fire floods the building? Your data survives in another continent.

```text
Primary DC (Mumbai)
├── Daily incremental (local)
├── Weekly full (local)
└── Weekly full (replicated to Singapore)
```

### The Recovery Point Objective

When disaster strikes at 3 PM on Wednesday, how much data do you lose?

If your last backup was Tuesday night, you lose everything from Wednesday. Every order placed. Every user registered. Every payment processed. Gone.

This is your **Recovery Point Objective (RPO)**: the maximum acceptable data loss measured in time.

| Backup Frequency | Worst-case Data Loss |
| ---------------- | -------------------- |
| Daily            | Up to 24 hours       |
| Hourly           | Up to 1 hour         |
| Every 15 minutes | Up to 15 minutes     |
| Real-time        | Near zero            |

An e-commerce site doing ₹10 lakhs in daily sales can't afford to lose a day of orders. A personal blog probably can. Your RPO determines your backup frequency.

### The Recovery Time Objective

How long can you be down?

Restoring a 500GB database from backup takes time. Hours, potentially. During that time, your service is offline. Users see errors. Revenue stops.

This is your **Recovery Time Objective (RTO)**: the maximum acceptable downtime.

Backups alone have slow RTO. You need to:

1. Detect the failure
2. Provision new hardware
3. Restore the backup
4. Verify data integrity
5. Switch traffic

Each step takes time. For faster recovery, you need something more than backups.

## Continuous Redundancy

![Primary database with standby replica maintaining real-time sync](https://pulkit.blog/assets/content/blogs/high-availability/continuous-redundancy.webp)

Backups are point-in-time snapshots. Between backups, new data exists only in one place. If that place fails, recent data is lost.

Continuous redundancy fixes this. You maintain a live copy of your database, synchronized in real-time.

### The Standby Replica

A standby replica is a second database that mirrors your primary. Every write to the primary is replicated to the standby.

```text
Primary DB                      Standby DB
├── users table     ──sync──→   ├── users table
├── orders table    ──sync──→   ├── orders table
└── payments table  ──sync──→   └── payments table
```

The standby doesn't serve any traffic. No reads, no writes. It just sits there, maintaining an up-to-date copy of your data. Waiting for disaster.

When the primary fails:

1. Detect the failure
2. Promote the standby to primary
3. Redirect application traffic
4. Business continues

No restore from backup needed. The data is already there, current, ready to serve.

### Synchronous vs Asynchronous Replication

How does data get to the replica? The short version: asynchronous is faster but risks small data loss windows, synchronous is slower but guarantees zero data loss.

I talked about replication modes in great detail here: [Replication Modes](https://pulkit.blog/system-design/understanding-database-scaling-sharding.md#replication-modes).

Most systems use asynchronous replication. The performance hit of synchronous isn't worth it for non-critical data. Financial systems, where losing even one transaction is unacceptable, pay the latency cost.

### Setting Up Replication

Let's walk through setting up streaming replication in PostgreSQL. The concept applies to other databases too, though the specific commands differ.

**Step 1: Configure the Primary**

First, tell PostgreSQL to generate enough information for replicas to follow along. Edit `postgresql.conf`:

```text
wal_level = replica
max_wal_senders = 3
wal_keep_size = 1GB
```

What these mean:

- `wal_level = replica`: Write-Ahead Log (WAL) contains enough detail for replicas to reconstruct changes. WAL is PostgreSQL's transaction log, every change goes here before hitting the actual tables.
- `max_wal_senders = 3`: Allow up to 3 replicas to connect simultaneously. Each replica needs one "sender" process.
- `wal_keep_size = 1GB`: Keep at least 1GB of WAL files around. If a replica disconnects temporarily, it can catch up from these files instead of needing a full resync.

**Step 2: Allow Replica Connections**

PostgreSQL blocks replication connections by default. Add this to `pg_hba.conf`:

```text
host replication replicator replica_ip/32 md5
```

This says: allow the user `replicator` to connect for replication purposes from `replica_ip`, authenticated with password (`md5`). Create this user if it doesn't exist:

```sql
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'secure_password';
```

Restart PostgreSQL for changes to take effect.

**Step 3: Initialize the Replica**

The replica needs a copy of the primary's data before it can start following changes. `pg_basebackup` handles this:

```bash
pg_basebackup -h primary_ip -D /var/lib/postgresql/data -U replicator -P -R
```

Breaking this down:

- `-h primary_ip`: Connect to the primary server
- `-D /var/lib/postgresql/data`: Where to put the data on the replica
- `-U replicator`: Connect as the replication user we created
- `-P`: Show progress (useful for large databases)
- `-R`: Auto-generate the configuration files the replica needs to follow the primary

This copies the entire database. For a 100GB database, expect this to take a while.

**Step 4: Start the Replica**

```bash
sudo systemctl start postgresql
```

The replica automatically connects to the primary and starts receiving WAL stream. Every transaction on the primary flows to the replica within milliseconds (for async) or before commit (for sync).

**Step 5: Verify It's Working**

On the primary, check connected replicas:

```sql
SELECT client_addr, state, sent_lsn, replay_lsn
FROM pg_stat_replication;
```

You should see your replica listed with `state = streaming`. The `sent_lsn` and `replay_lsn` columns show how caught up the replica is. If they're close together, replication is healthy.

## Disaster Recovery

![Cross-region backup for disaster recovery](https://pulkit.blog/assets/content/blogs/high-availability/disaster-recovery.webp)

A standby replica protects against database crashes. But what if the entire data center goes down?

Fire. Flood. Power grid failure. Natural disasters. Political unrest affecting infrastructure. These aren't hypotheticals. AWS us-east-1 has had multiple significant outages. [OVH had a fire that destroyed two data centers](https://www.datacenterdynamics.com/en/analysis/ovhcloud-fire-france-data-center/#:~:text=The%2030%2C000%20servers%20inside%20were,No%20one%20was%20hurt.).

If all your infrastructure is in one location, you're betting your business that nothing bad will happen to that location. Ever.

### Cross-Region Backups

The minimum: store one copy of your backups in a different geographic region.

```text
Primary DC (Mumbai)
├── Production database
├── Standby replica
└── Local backups

Secondary DC (Singapore)
└── Weekly backup copy
```

If Mumbai is underwater, you have data in Singapore. Recovery takes longer (restore from backup, not failover to replica), but you can recover.

### Cross-Region Replication

For faster recovery, run a replica in another region.

```text
Mumbai DC                        Singapore DC
├── Primary DB ──────async──────→ DR Replica
├── Standby                       (24/7 sync)
└── App Servers                   └── Cold standby app servers
```

Network latency makes synchronous replication impractical across regions. Async replication with a small lag (seconds to minutes) is the standard.

Recovery:

1. Detect Mumbai outage
2. Promote Singapore replica
3. Start Singapore app servers
4. Update DNS or load balancer
5. Service restored

This is expensive. You're paying for infrastructure in two regions. But for businesses where downtime costs more than the infrastructure, it's worth it.

### RPO[^1] and RTO[^2] for Different Strategies

| Strategy              | RPO             | RTO       | Cost    |
| --------------------- | --------------- | --------- | ------- |
| Daily backups         | Up to 24 hours  | Hours     | Low     |
| Hourly backups        | Up to 1 hour    | Hours     | Low     |
| Local standby replica | Seconds-minutes | Minutes   | Medium  |
| Cross-region replica  | Seconds-minutes | Minutes   | High    |
| Multi-region active   | Near zero       | Near zero | Highest |

Choose based on what your business can afford to lose and how long it can be offline.

## Automatic Failover

![Automatic failover detecting primary failure and promoting replica](https://pulkit.blog/assets/content/blogs/high-availability/automatic-failover.webp)

Having a replica is useless if nobody promotes it when the primary dies. Manual failover means someone needs to wake up at 3 AM, assess the situation, and execute the promotion. That's slow and error-prone.

Automatic failover removes the human from the critical path.

### How It Works

A monitoring system continuously checks the primary's health:

```typescript
interface HealthCheck {
  endpoint: string;
  interval: number;
  timeout: number;
  failureThreshold: number;
}

const primaryHealthCheck: HealthCheck = {
  endpoint: "tcp://primary:5432",
  interval: 5000,
  timeout: 2000,
  failureThreshold: 3,
};
```

If the primary fails consecutive health checks:

1. **Confirm failure**: Is it really down, or just a network blip?
2. **Fence the primary**: Ensure it can't accept writes (prevent split-brain)
3. **Promote replica**: Tell the replica it's now the primary
4. **Redirect traffic**: Update connection strings or DNS

```typescript
async function handlePrimaryFailure(): Promise<void> {
  const confirmed = await confirmFailure(primary, 3);
  if (!confirmed) return;

  await fencePrimary(primary);
  await promoteReplica(standby);
  await updateDns("db.myapp.com", standby.ip);
  await alertOps("Primary failed. Standby promoted.");
}
```

### Tools for Automatic Failover

**PostgreSQL:**

- **Patroni**: Distributed consensus for HA PostgreSQL. Uses etcd/Consul/ZooKeeper
- **repmgr**: Replication manager with automatic failover
- **pg\_auto\_failover**: Simpler setup, fewer dependencies

**MySQL:**

- **MySQL InnoDB Cluster**: Built-in HA solution
- **Orchestrator**: Topology management and failover

**Managed Services:**

- **AWS RDS**: Multi-AZ deployment with automatic failover
- **Google Cloud SQL**: Regional instances with automatic failover
- **Azure Database**: Zone-redundant high availability

Managed services handle all of this for you. You pay more, but you don't need to configure, monitor, or test failover yourself.

### The Split-Brain Problem

What if the primary isn't actually dead? Maybe there was a network partition. The monitoring system can't reach the primary, but the primary is still running, still accepting writes.

Now you have two primaries. Two databases accepting writes independently. Data diverges. When the network heals, you have conflicting data. This is split-brain, and it's catastrophic.

```text
Network partition:

Monitoring ──✗── Primary (still running, taking writes)
     │
     └── Promotes Replica (now also taking writes)

Two primaries. Data diverging. Disaster.
```

Prevention:

**Fencing**: Before promoting the replica, ensure the primary can't accept writes. STONITH (Shoot The Other Node In The Head) - literally power off the old primary.

**Quorum**: Require majority agreement before failover. If monitoring can't reach the primary but the replica can, don't failover.

**Witness node**: Third node that breaks ties. If monitoring and witness both can't reach primary, it's probably really down.

```text
       Primary ───── Witness
          │            │
          └──── Monitoring
               (needs 2/3 agreement)
```

Split-brain is rare but devastating. Any automatic failover system must address it.

## Putting It Together

A production-ready setup combines multiple strategies:

```text
┌─────────────────────────────────────────────────┐
│                  Mumbai DC                       │
│  ┌─────────┐      ┌─────────┐                   │
│  │ Primary │──────│ Standby │                   │
│  │   DB    │ sync │   DB    │                   │
│  └────┬────┘      └─────────┘                   │
│       │                                          │
│       │ async replication                        │
│       │                                          │
└───────┼─────────────────────────────────────────┘
        │
        │ cross-region
        │
┌───────┼─────────────────────────────────────────┐
│       ▼            Singapore DC                  │
│  ┌─────────┐                                    │
│  │   DR    │                                    │
│  │ Replica │                                    │
│  └─────────┘                                    │
│                                                  │
│  ┌─────────┐                                    │
│  │ Weekly  │                                    │
│  │ Backup  │                                    │
│  └─────────┘                                    │
└─────────────────────────────────────────────────┘
```

**Normal operation**: Primary serves all traffic. Standby receives synchronous replication. DR replica receives async replication.

**Primary disk failure**: Automatic failover to standby. Near-zero downtime, zero data loss.

**Mumbai DC outage**: Manual failover to Singapore DR replica. Possible small data loss (async lag), but business continues.

**Total catastrophe**: Restore from Singapore backup. Hours of downtime, up to a week of data loss, but you survive.

Each layer adds cost and complexity. But each layer also adds resilience. How much you invest depends on what you're protecting.

## Hands-on Practice

I've created hands-on demos you can run locally in my [systems repo](https://github.com/pulkitxm/systems):

- [db-replica](https://github.com/pulkitxm/systems/tree/main/databases/db-replica): PostgreSQL streaming replication with primary and standby. Includes scripts to test replication and simulate failover.
- [scaling-db/read-replicas](https://github.com/pulkitxm/systems/tree/main/databases/scaling-db/read-replicas): Read replica setup for scaling reads across multiple database instances.

When you've done this yourself, you'll understand not just how redundancy works, but what happens when it's needed. That understanding is invaluable when you're debugging a production issue at 3 AM.

## Leader Election for Auto Recovery

We've covered how to make your data redundant. But there's a deeper question: who manages all this failover? When a server dies, something needs to detect it and spin up a replacement. But what happens when that "something" dies?

This is where leader election becomes essential. It's the mechanism that lets your system recover from failures automatically, with zero human intervention.

## The Monitoring Problem

You have three servers behind a load balancer, handling HTTP requests:

```text
        User
          │
          ▼
    Load Balancer
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
Server  Server  Server
   1       2       3
```

Server 2 crashes. What happens? Nothing automatic. Someone needs to detect the failure, spin up a new server, and add it to the load balancer.

Enter the **orchestrator**: a component whose job is to monitor your servers. When one goes down, it spins up a new one and puts it behind the load balancer.

![Orchestrator monitoring servers and handling failures](https://pulkit.blog/assets/content/blogs/high-availability/orchestrator-problem.webp)

The orchestrator continuously pings servers. If one stops responding, it marks it unhealthy, removes it from the load balancer, provisions a new server, and adds it back. No human intervention needed.

But here's the question: **who monitors the orchestrator?**

## The Recursion Problem

If the orchestrator crashes, servers can fail without replacement. You need something to monitor the orchestrator. But what monitors that? And what monitors the thing that monitors the orchestrator?

![The infinite recursion of orchestrators monitoring orchestrators](https://pulkit.blog/assets/content/blogs/high-availability/recursion-problem.webp)

This is infinite recursion. Every monitoring layer needs its own monitor. You could have orchestrators all the way down, but that's impractical and expensive.

You need a base case. A point where the system can recover without external intervention.

**That base case is leader election.**

## Leader Election: The Base Case

Leader election is a distributed systems concept where nodes in a cluster can automatically select one of themselves to be the leader. When the leader fails, the remaining nodes elect a new one.

This breaks the infinite recursion because you don't need external monitoring at the top level. The system monitors itself and self-heals.

```text
Traditional approach:
  Component A monitors B
  Component C monitors A
  Component D monitors C
  ... (infinite)

With leader election:
  Leader monitors workers
  Workers monitor each other
  If leader dies → workers elect new leader
  System self-heals ✓
```

## The Leader-Follower Setup

Instead of a single orchestrator, you run multiple orchestrator nodes in a leader-follower configuration.

![Leader-follower orchestrator setup with workers monitoring servers](https://pulkit.blog/assets/content/blogs/high-availability/leader-follower-setup.webp)

Here's how the responsibilities break down:

**Orchestrator Workers**:

- Monitor the backend servers
- If a server is unhealthy, spin up a new one
- Report status to the leader

**Orchestrator Leader**:

- Monitor the workers
- If a worker dies, spin up a new worker
- Coordinate work distribution

## Failure Scenarios

Let's walk through each failure scenario:

### Scenario 1: Backend Server Dies

```text
Server 2 stops responding
     ↓
Worker detects failure
     ↓
Worker spins up Server 4
     ↓
Worker adds Server 4 to load balancer
     ↓
System recovered ✓
```

No human intervention. The worker handles it.

### Scenario 2: Orchestrator Worker Dies

```text
Worker 1 stops responding
     ↓
Leader detects failure
     ↓
Leader spins up Worker 3
     ↓
Leader assigns servers to Worker 3
     ↓
System recovered ✓
```

No human intervention. The leader handles it.

### Scenario 3: Orchestrator Leader Dies

This is where leader election kicks in:

```text
Leader stops responding
     ↓
Workers detect leader is gone
     ↓
Workers run leader election algorithm
     ↓
Worker 2 becomes new leader
     ↓
New leader takes over responsibilities
     ↓
System recovered ✓
```

No human intervention. The system self-heals.

![Failure scenarios and how they are handled with leader election](https://pulkit.blog/assets/content/blogs/high-availability/failure-scenarios.webp)

## Leader Election Algorithms

When workers detect the leader is dead, they need a way to agree on who becomes the new leader. This is the job of leader election algorithms.

The key challenges:

1. **Agreement**: All workers must agree on the same leader
2. **Availability**: Election must complete even if some workers are down
3. **No split-brain**: Can't have two workers both thinking they're the leader

Common algorithms:

**Bully Algorithm**: The simplest. Node with highest ID wins. When a node detects leader failure, it sends election messages to all higher-ID nodes. If none respond, it becomes leader. If any respond, it waits for them to become leader.

**Raft**: More sophisticated. Uses terms (epochs) and voting. A candidate requests votes from peers. If it gets majority, it becomes leader. Widely used in production systems.

**Paxos**: Theoretically elegant but complex to implement. Forms the basis for many consensus systems.

**ZooKeeper/etcd**: Often you don't implement leader election yourself. Tools like ZooKeeper and etcd provide distributed coordination primitives that handle leader election for you.

## The Real-World Analogy

Think about how your team works:

- You have a manager who runs standups
- If the manager is sick one day, someone else steps up
- The team doesn't stop functioning because the manager is absent

```text
Normal day:
  Manager runs standup
  Team members do their work
  Manager handles coordination

Manager is sick:
  Team notices manager is absent
  Senior developer volunteers to run standup
  Team continues functioning

Manager returns:
  Manager takes back responsibilities
  System returns to normal
```

This is exactly how leader election works in distributed systems. There's always someone who can step up. The system never stops functioning because of a single failure.

## Implementation Sketch

Here's a simplified view of how this might look:

```typescript
interface OrchestratorNode {
  id: string;
  isLeader: boolean;
  peers: string[];
}

class Orchestrator {
  private node: OrchestratorNode;
  private leaderHeartbeatTimeout: number = 5000;

  async start(): Promise<void> {
    if (this.node.isLeader) {
      this.runAsLeader();
    } else {
      this.runAsWorker();
    }
  }

  private async runAsLeader(): Promise<void> {
    while (this.node.isLeader) {
      await this.sendHeartbeatsToWorkers();
      await this.checkWorkerHealth();
      await this.replaceDeadWorkers();
      await sleep(1000);
    }
  }

  private async runAsWorker(): Promise<void> {
    let lastLeaderHeartbeat = Date.now();

    while (!this.node.isLeader) {
      await this.checkServerHealth();
      await this.replaceDeadServers();

      if (Date.now() - lastLeaderHeartbeat > this.leaderHeartbeatTimeout) {
        await this.initiateLeaderElection();
      }

      await sleep(1000);
    }
  }

  private async initiateLeaderElection(): Promise<void> {
    const votes = await this.requestVotesFromPeers();
    const majority = Math.floor(this.node.peers.length / 2) + 1;

    if (votes >= majority) {
      this.node.isLeader = true;
      await this.announceLeadership();
    }
  }
}
```

## Hands-on: Simulate Leader Election

I've created a leader election demo you can run locally in my [systems repo](https://github.com/pulkitxm/systems):

- [leader-election](https://github.com/pulkitxm/systems/tree/main/coordination/leader-election): Simulates the Bully Algorithm using JavaScript timers. Kill the leader and watch the remaining nodes elect a new one automatically.

You don't need multiple machines. Each "node" is simulated using timers to mimic independent processes. Run it, kill the leader, and watch the system recover with zero human intervention.

## Tools That Use Leader Election

Many production systems rely on leader election:

- **Kubernetes**: etcd uses Raft for leader election. The control plane is highly available because of this.
- **Kafka**: Uses ZooKeeper (or KRaft now) for controller election.
- **PostgreSQL with Patroni**: Uses consensus for automatic failover.
- **Redis Sentinel**: Elects a leader to coordinate failover.
- **Consul**: Uses Raft for leader election among servers.

You're likely already using systems built on leader election, even if you didn't realize it.

## Conclusion

High availability requires two things: redundant data and automatic recovery.

Redundancy gives you copies of your data. Backups, replicas, cross-region storage. When hardware fails, you have something to fall back to.

Leader election gives you automatic recovery. Instead of humans waking up at 3 AM to failover a database, the system does it itself. The orchestrator monitors servers, workers monitor each other, and when the leader dies, a new one is elected.

The key insight: **leader election is the base condition of your recursion**. You can have components monitoring other components, but at some point you need a self-healing mechanism. Leader election provides that.

When you configure systems where the orchestration layer can automatically recover from node failures, you've reached the base case. Your entire system becomes auto-recoverable with zero human intervention.

Your API servers are cattle. Your database is a pet. And your orchestration layer? It's a self-healing organism.

## Related writing

- [Introduction to Big Data Tools](https://pulkit.blog/system-design/big-data-tools.md): January 24, 2026
- [Circuit Breakers](https://pulkit.blog/system-design/circuit-breakers.md): January 13, 2026
- [Consistent Hashing](https://pulkit.blog/system-design/consistent-hashing.md): January 24, 2026

[^1]: Recovery Point Objective - How much data you can afford to lose
[^2]: Recovery Time Objective - How long until service is restored
