# Understanding Database Scaling and Sharding Patterns

> Master database scaling from vertical to horizontal scaling, read replicas, sharding strategies, and partitioning techniques. Learn when to use synchronous vs asynchronous replication and how to choose the right shard key.

- URL: https://pulkit.blog/system-design/understanding-database-scaling-sharding/
- Published: January 7, 2026
- Tags: System Design, Database, Sharding, Replication, Scalability
- Part of: [System Design](https://pulkit.blog/system-design.md)

One of the fastest ways to break a production system is to underestimate the database.

Things often look fine in staging. Then real traffic arrives: your read volume spikes, your write rate grows, indexes stop fitting in memory, and one slow query starts cascading into timeouts across the stack.

Understanding how to scale databases is critical. These techniques apply to most databases out there, both relational (PostgreSQL, MySQL) and non-relational (MongoDB, Cassandra). Always read your specific database's documentation for implementation details.

## TL;DR

- **Vertical Scaling**: Add more CPU, RAM, disk to your existing server. Simple but has physical limits and requires downtime
- **Horizontal Scaling**: Add more servers to distribute load. Two main approaches: read replicas and sharding
- **Read Replicas**: Offload reads to replica databases when your read:write ratio is high (like 90:10)
- **Replication Modes**: Synchronous gives strong consistency but slower writes; Asynchronous gives faster writes but eventual consistency
- **Sharding**: Split data across multiple independent databases when one node can't handle the load
- Each approach has trade-offs. Start simple, scale when needed

## Before You Scale

Scaling adds cost and complexity. Before you reach for bigger instances, replicas, or shards, make sure you have the basics covered:

- **Query optimization**: remove N+1 patterns, avoid full table scans, validate query plans
- **Indexing**: add the right composite indexes for your hot paths
- **Connection pooling**: cap connections, reuse them, prevent connection storms
- **Caching**: cache hot reads (and be explicit about staleness)
- **Data modeling**: reduce unnecessary joins, avoid oversized rows in hot tables

Many “database scaling problems” are actually “one bad query under real load” problems.

### Connection Pooling (Often the Biggest Early Win)

Without pooling, each request can create its own DB connection. Under load, the database spends time and memory on connection management instead of queries.

```typescript
import { Pool } from "pg";

const pool = new Pool({
  host: "db.example.com",
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

async function getUser(id: string) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}
```

## Vertical Scaling

The simplest approach to scaling is vertical scaling, making your existing database server more powerful.

![Diagram showing vertical scaling by adding more CPU, RAM, and disk to a single server](https://pulkit.blog/assets/content/blogs/database-scaling/vertical-scaling.webp)

**What it means:**

- Add more CPU cores
- Increase RAM
- Upgrade to faster SSDs
- Move to a bigger instance type (in cloud)

**Pros:**

- No code changes required
- No complexity in your application
- Works for both reads and writes

**Cons:**

- Requires downtime during reboot/migration
- Has physical hardware limitations (you can't add infinite RAM)
- Gets exponentially expensive at higher tiers
- Single point of failure remains

Vertical scaling is usually your first step. It's simple and effective until you hit the ceiling.

## Horizontal Scaling

Instead of making one server bigger, horizontal scaling means adding more servers to distribute the load.

![Diagram showing horizontal scaling by adding multiple servers to distribute load](https://pulkit.blog/assets/content/blogs/database-scaling/horizontal-scaling.webp)

**What it means:**

- Add multiple database servers
- Distribute traffic/data across them
- Scale by adding more nodes, not bigger nodes
- More complex but can scale indefinitely

**Pros:**

- No theoretical limit to scale
- Better fault tolerance (if one node fails, others continue)
- Can be more cost-effective at large scale
- No downtime when adding nodes

**Cons:**

- Requires code changes and routing logic
- More operational complexity
- Need to handle data consistency across nodes
- Network latency between nodes

There are two main approaches to horizontal scaling: **Read Replicas** and **Sharding**.

### Read Replicas

When your application is read-heavy (common scenario: 90% reads, 10% writes), you can scale horizontally using read replicas.

**How it works:**

![Diagram showing primary database with multiple read replicas for scaling read operations](https://pulkit.blog/assets/content/blogs/database-scaling/read-replicas.webp)

1. You have a primary (master) database that handles all writes
2. One or more replica databases receive copies of the data
3. Your application routes read queries to replicas
4. Write queries still go to the master

**Key points:**

- The master is now free to focus on writes
- You can add multiple replicas to handle more read load
- Your API servers need to know which database to connect to for reads vs writes

```typescript
import { Pool } from "pg";

const masterDb = new Pool({ host: "master.db.example.com" });
const replicaDb = new Pool({ host: "replica.db.example.com" });

async function getUser(id: string) {
  const result = await replicaDb.query("SELECT * FROM users WHERE id = $1", [
    id,
  ]);
  return result.rows[0] ?? null;
}

async function updateUser(id: string, data: UserData) {
  await masterDb.query("UPDATE users SET name = $1 WHERE id = $2", [
    data.name,
    id,
  ]);
}
```

#### Replication Modes

When you have replicas, changes on the master need to be sent to replicas to maintain consistency. There are two modes of replication:

##### 1. Synchronous Replication

The master waits for the replica to confirm it received the data before acknowledging the write to the client.

```text
Client → API → Master → Replica
                  ↓         ↓
              (write)   (write)
                  ↓         ↓
              (wait) ← (confirm)
                  ↓
              (ack to client)
```

**Characteristics:**

- **Strong consistency**: Read from any replica, get the latest data
- **Zero replication lag**: Replicas are always up-to-date
- **Slower writes**: Every write waits for replica confirmation

Use synchronous replication when data consistency is critical (financial transactions, inventory systems).

##### 2. Asynchronous Replication

The master acknowledges the write immediately and sends data to replicas in the background.

```text
Client → API → Master → (async) → Replica
                  ↓
              (write)
                  ↓
              (ack to client immediately)
```

**Characteristics:**

- **Eventual consistency**: Replicas might be slightly behind
- **Some replication lag**: Usually milliseconds, but can grow under load
- **Faster writes**: No waiting for replica confirmation

Use asynchronous replication when you can tolerate slight delays (social media feeds, analytics, caching layers).

##### Read-Your-Writes (Practical Tip)

Even with tiny replication lag, a user can update something and then immediately read stale data from a replica. A common approach is:

- For requests that follow a write (or for the same user session), read from the master for a short window
- For everything else, read from replicas

This keeps the system fast while preserving the “I just updated it, why don’t I see it?” user experience.

#### CAP Trade-offs (Why Sync vs Async Feels Different)

Once you replicate data across nodes, you're implicitly making trade-offs described by the **CAP theorem**. It states that a distributed system can only guarantee **two out of three** properties:

```text
        Consistency
            /\
           /  \
          /    \
         /  ??  \
        /________\
 Availability    Partition Tolerance
```

- **Consistency (C)**: Every read returns the most recent write. All nodes see the same data at the same time.
- **Availability (A)**: Every request gets a response, even if it might not be the latest data.
- **Partition Tolerance (P)**: The system continues to work even when network partitions (communication failures between nodes) occur.

**The catch**: Network partitions are unavoidable in distributed systems. So you're really choosing between **CP** (consistency over availability) or **AP** (availability over consistency).

| Replication Mode | CAP Bias | Behavior During Partition                   |
| ---------------- | -------- | ------------------------------------------- |
| Synchronous      | CP       | Writes block or fail until replicas confirm |
| Asynchronous     | AP       | Writes succeed, but replicas may lag        |

**When to choose CP (Synchronous)**:

- Banking transactions (can't have two nodes disagree on account balance)
- Inventory systems (overselling is worse than temporarily blocking)
- Any system where incorrect data causes real harm

**When to choose AP (Asynchronous)**:

- Social media feeds (stale posts for a few seconds is fine)
- Analytics dashboards (near real-time is good enough)
- Caching layers (eventual consistency is acceptable)

Most systems aren't purely one or the other. You might use synchronous replication for payment writes but async for user activity logs,pick based on what matters for each data type.

### Sharding

![Diagram showing data distributed across multiple database shards](https://pulkit.blog/assets/content/blogs/database-scaling/sharding.webp)

When one node cannot handle all your data or load, you split the data into multiple exclusive subsets called **shards**.

**How it works:**

- Each shard holds a portion of your data
- Writes for a particular row/document go to one specific shard
- Shards are independent, no replication between them
- Your application (or a proxy) routes requests to the correct shard

```text
                    ┌─────────┐
                    │   API   │
                    └────┬────┘
           ┌─────────────┼─────────────┐
           ↓             ↓             ↓
      ┌─────────┐   ┌─────────┐   ┌─────────┐
      │ Shard 1 │   │ Shard 2 │   │ Shard 3 │
      │ (A-I)   │   │ (J-R)   │   │ (S-Z)   │
      └─────────┘   └─────────┘   └─────────┘
```

**Key considerations:**

- **Shard key selection**: Choose wisely. A bad shard key leads to hot spots
- **Routing logic**: API servers need to know which shard to connect to
- **Cross-shard queries**: Queries spanning multiple shards are expensive
- **Resharding**: Adding/removing shards is complex

```typescript
function getShardForUser(userId: string): Database {
  const firstChar = userId[0].toLowerCase();
  if (firstChar >= "a" && firstChar <= "m") {
    return shardA; // handles a-m
  }
  return shardB; // handles n-z
}

async function getUser(userId: string) {
  const shard = getShardForUser(userId);
  return shard.query("SELECT * FROM users WHERE id = $1", [userId]);
}
```

**Note:** Some databases have built-in proxies or native support for sharding and replication. Examples include Citus for PostgreSQL, PostgreSQL's built-in streaming replication, Redis Cluster and Sentinel, and ClickHouse with Zookeeper for coordination. Each shard can also have its own replicas for read scaling.

## Sharding vs Partitioning

![Diagram comparing sharding across servers vs partitioning within a single server](https://pulkit.blog/assets/content/blogs/database-scaling/sharding-vs-partioning.webp)

These terms are often mixed up. Here’s the clean way to think about them:

- **Partitioning**: splitting data inside one database instance
- **Sharding**: distributing data across multiple database instances (multiple machines)

You can have partitioning without sharding (one machine). If you shard, you’re always partitioning the dataset in some way (multiple machines).

### Why People Get Confused

In practice, teams often say “we partitioned the database” when they mean “we sharded the database”, because the dataset is being split either way. A precise phrasing that stays correct:

The database is sharded across servers, and the data is partitioned across those shards.

Think of it this way:

- You have a 100GB database
- You partition it into 5 chunks: 30GB, 10GB, 30GB, 20GB, 10GB
- These partitions are **mutually exclusive** (no overlap in data)
- Each partition can either:
  - Live on one dedicated database server, or
  - Multiple partitions can share one server
- This depends on the number of shards you have

### Understanding Database Servers

A database server is just a database process (mysqld, mongod, postgres) running on an EC2 machine or any other server. When we represent databases in diagrams, we typically show them as simple cylinder icons.

Let's walk through a real-world scaling journey:

**Stage 1: Starting Small**

- You put your database in production
- It's serving real traffic at 100 writes per second (WPS)
- Everything works fine

**Stage 2: Vertical Scaling**

- You're getting more users
- Database is unable to handle the load
- You scale up by giving it more CPU, RAM, and disk
- Capacity increases to 200 WPS
- This is **vertical scaling** + **read replicas** (bigger server + read distribution)

**Stage 3: Hitting the Vertical Limit**

- Your product goes viral
- Your bulky database can't handle the load anymore
- You've scaled up to 1000 WPS
- But you know you can't scale "up" further
- **Vertical scaling has a physical hardware limit**

**Stage 4: Enter Horizontal Scaling**

Now you need to resort to **horizontal scaling** because you're getting 1500 WPS but your single server maxes out at 1000 WPS.

Here's the math:

**Before (Single Server):**

```text
API Server → Database (1000 WPS max)
Current load: 1500 WPS needed
```

**After (Two Shards with 50-50 split):**

```text
            ┌─ Shard 1 (50% data) → 750 WPS
API Server ─┤
            └─ Shard 2 (50% data) → 750 WPS

Total capacity: 1500 WPS
```

**Key insight**: By adding one more database server and splitting the data 50-50:

- Each database now handles 750 WPS (instead of 1500 WPS)
- Each shard holds 50% of the data
- The load is reduced on each node
- You can now handle higher throughput

### How to Partition Data

There are two main categories of partitioning:

1. **Horizontal Partitioning**: Split rows across partitions
2. **Vertical Partitioning**: Split columns across partitions

When we "split" the 100GB data, we could use either approach. Deciding which one to pick depends on:

- **Load**: How much traffic each partition will receive
- **Use case**: What your application does
- **Access pattern**: How your application queries the data

### Horizontal Partitioning (Row-based Split)

![Diagram showing horizontal partitioning splitting data by rows](https://pulkit.blog/assets/content/blogs/database-scaling/horizontal-partitioning.webp)

This is the most common approach. You split data by **rows** based on some criteria.

**Example**: Partition by alphabets, useful for name-based lookups or dictionary-like data.

Original table (100GB):

```text
products table: product_id, name, category, price, stock, ...
```

Partition by first letter of product name:

```text
Partition A: Names starting with A-D  → 30GB
Partition B: Names starting with E-H  → 10GB
Partition C: Names starting with I-M  → 30GB
Partition D: Names starting with N-R  → 20GB
Partition E: Names starting with S-Z  → 10GB
```

Each partition has **all columns** but only a **subset of rows**.

**Query example:**

```sql
-- Query hits only Partition A (products starting with 'A' or 'B')
SELECT * FROM products WHERE name LIKE 'Apple%';

-- Query hits only Partition E
SELECT * FROM products WHERE name = 'Samsung Galaxy S23';

-- Range query might hit multiple partitions
SELECT * FROM products WHERE name BETWEEN 'Dell' AND 'Samsung';
```

**Implementation in code:**

```typescript
function getPartitionForProduct(productName: string): string {
  const firstChar = productName[0].toUpperCase();
  if (firstChar <= "D") return "partition_a";
  if (firstChar <= "H") return "partition_b";
  if (firstChar <= "M") return "partition_c";
  if (firstChar <= "R") return "partition_d";
  return "partition_e";
}

async function getProduct(name: string) {
  const partition = getPartitionForProduct(name);
  return db[partition].query("SELECT * FROM products WHERE name = $1", [name]);
}
```

**Use cases for horizontal partitioning:**

- Alphabet-based: Product catalogs, directories, dictionaries
- Time-series data: Logs, metrics (partition by date/month)
- User data: Social apps (partition by user\_id or region)
- Transaction logs: Financial systems (partition by timestamp)
- Multi-tenant apps: SaaS platforms (partition by tenant\_id)

### Vertical Partitioning (Column-based Split)

![Diagram showing vertical partitioning splitting data by columns](https://pulkit.blog/assets/content/blogs/database-scaling/vertical-partitioning.webp)

Split data by **columns**, keeping frequently accessed columns together and separating rarely used ones.

**Example: E-commerce Users Table**

Original table (100GB):

```text
users: user_id, name, email, country, address, preferences, bio, avatar_url, ...
```

Vertical partitioning:

```text
Partition 1 (Hot data - frequently accessed):
  user_id, name, email, country → 20GB

Partition 2 (Cold data - rarely accessed):
  user_id, address, preferences, bio, avatar_url → 80GB
```

Each partition has **all rows** but only a **subset of columns**.

**Query example:**

```sql
-- Fast: hits only Partition 1
SELECT name, email FROM users WHERE user_id = 500;

-- Slow: requires JOIN across partitions
SELECT name, email, address, bio FROM users WHERE user_id = 500;
```

**Use cases:**

- Large tables with some rarely accessed columns
- Separating BLOBs (images, documents) from metadata
- Optimizing for specific access patterns
- Reducing I/O for common queries

### Practical Partitioning Example

Let's say you have 100GB of total data. You horizontally partition it into 5 mutually exclusive partitions:

```text
            100GB Total Data
                  ↓
    ┌──────┬──────┬──────┬──────┬──────┐
    │ 30GB │ 10GB │ 30GB │ 20GB │ 10GB │
    │  A   │  B   │  C   │  D   │  E   │
    └──────┴──────┴──────┴──────┴──────┘
```

Now you need to decide how to distribute these 5 partitions across your database servers (shards).

**Option 1: One partition per server (5 shards)**

```text
Shard 1: Partition A [30GB]
Shard 2: Partition B [10GB]
Shard 3: Partition C [30GB]
Shard 4: Partition D [20GB]
Shard 5: Partition E [10GB]
```

- Maximum parallelism
- Highest cost (5 servers)
- Each shard handles less load

**Option 2: Multiple partitions per server (2 shards)**

```text
Shard 1: Partition A [30GB] + Partition C [30GB] → 60GB total
Shard 2: Partition B [10GB] + Partition D [20GB] + Partition E [10GB] → 40GB total
```

- Cost-effective (2 servers)
- Each shard handles more load
- Need to balance distribution carefully

**Option 3: Mixed approach (3 shards)**

```text
Shard 1: Partition A [30GB] + Partition B [10GB] → 40GB
Shard 2: Partition C [30GB]                      → 30GB
Shard 3: Partition D [20GB] + Partition E [10GB] → 30GB
```

- Balanced approach
- Can optimize based on access patterns

### Factors to Consider

The choice depends on:

**1. Load Distribution**

- If Partition A gets 50% of all queries, give it a dedicated shard
- If Partitions D and E are rarely accessed, combine them

**2. Budget**

- More shards = more servers = higher cost
- Find the sweet spot between performance and cost

**3. Access Patterns**

```text
Partition A: 1000 queries/sec  → Needs dedicated shard
Partition B: 100 queries/sec   → Can share with others
Partition E: 50 queries/sec    → Can share with others
```

**4. Growth Expectations**

- If Partition C is expected to grow rapidly, give it room to breathe
- Plan for resharding as data grows

**5. Fault Tolerance**

- More shards = better fault tolerance
- If Shard 1 fails, Shards 2-5 continue working
- But also more points of failure to monitor

**Remember**: The database as a whole is **sharded** (distributed across servers), while the data is **partitioned** (split into chunks). This depends on the number of shards you have.

### Common Sharding Strategies

When you shard your database, you need a strategy to decide which data goes where:

**1. Range-based Sharding**

```text
User IDs 1-1,000,000     → Shard 1
User IDs 1,000,001-2M    → Shard 2
User IDs 2M-3M           → Shard 3
```

- **Pros**: Simple to implement, easy to add new shards
- **Cons**: Risk of uneven distribution (hot spots) if IDs aren't uniformly distributed

**2. Hash-based Sharding**

```typescript
function getShard(userId: string): number {
  const hash = hashFunction(userId);
  return hash % numberOfShards;
}

// Example: hash("user_123") % 4 = 2 → Goes to Shard 2
```

- **Pros**: Even distribution of data
- **Cons**: Range queries become expensive, resharding is difficult

**3. Geographic Sharding**

```text
US users       → US datacenter shard
EU users       → EU datacenter shard
Asia users     → Asia datacenter shard
```

- **Pros**: Lower latency, data residency compliance (GDPR)
- **Cons**: Uneven distribution if user base isn't geographically balanced

**4. Entity-based (Tenant) Sharding**

```text
Company A's data → Shard 1
Company B's data → Shard 2
Company C's data → Shard 3
```

- **Pros**: Easy data isolation, good for multi-tenant SaaS
- **Cons**: Large tenants can create hot spots

### Challenges with Sharding

**1. Cross-shard Queries**

```sql
-- This is expensive if users are on different shards
SELECT * FROM orders
WHERE user_id IN (123, 456, 789);
```

You have to query multiple shards and aggregate results in your application.

**2. Resharding**

When you need to add more shards:

- Existing data needs to be redistributed
- Can cause downtime or require complex migration strategies
- Hash-based sharding is especially painful (hash % 4 becomes hash % 5)

**3. Referential Integrity**

Foreign keys don't work across shards:

```sql
-- This won't work if users and orders are on different shards
ALTER TABLE orders
ADD FOREIGN KEY (user_id) REFERENCES users(id);
```

You have to handle this at the application level.

**4. Distributed Transactions**

ACID transactions across shards are complex and slow. You often need to:

- Use eventual consistency
- Implement saga patterns
- Use two-phase commit (slow and fragile)

### Best Practices for Sharding

**Choose the Right Shard Key**

Your shard key determines how data is distributed. Choose wisely:

**Good shard keys:**

- High cardinality (many unique values)
- Evenly distributed
- Frequently used in queries
- Example: `user_id` for a social media app

**Bad shard keys:**

- Low cardinality (few unique values)
- Skewed distribution
- Example: `country` (USA might have 80% of users)

**Design for Single-Shard Queries**

```typescript
// Good: Query stays within one shard
const user = await db.users.findOne({ user_id: "123" });
const posts = await db.posts.find({ user_id: "123" });

// Bad: Query needs to scan all shards
const posts = await db.posts.find({ likes: { $gt: 100 } });
```

Structure your data so most queries can be answered from a single shard.

**Plan for Growth**

```text
Start: 2 shards (can handle current load)
Year 1: 4 shards
Year 2: 8 shards
Year 3: 16 shards
```

Use a sharding strategy that makes adding shards easier:

- Consistent hashing (minimal data movement)
- Directory-based sharding (centralized mapping)

**Monitor Shard Health**

Keep track of:

```text
Shard 1: 45% storage, 600 WPS, 50ms avg latency
Shard 2: 78% storage, 1200 WPS, 120ms avg latency (warning: hot spot)
Shard 3: 32% storage, 450 WPS, 45ms avg latency
```

Shard 2 is becoming a hot spot and needs attention (maybe split it further or redistribute data).

### Sharding vs Partitioning: The Four Scenarios

Here's how partitioning and sharding can be combined (or not):

|                   | **No Partitioning**                                                                                                                                                                                                                        | **With Partitioning**                                                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No Sharding**   | **Scenario 1**: Single database with all data in one table/collection on one server.<br><br>**Use case**: Small applications, prototypes<br>**Max scale**: \~100-200 WPS                                                                   | **Scenario 2**: One database with data logically split into partitions (by date, region, etc.) on one server.<br><br>**Use case**: Medium applications with time-series data<br>**Max scale**: \~500-1000 WPS |
| **With Sharding** | **Scenario 3**: Data distributed across multiple database servers. Each shard holds a portion without internal partitioning.<br><br>**Use case**: Large applications needing horizontal scale<br>**Max scale**: Thousands of WPS per shard | **Scenario 4**: Each shard has partitioned data + read replicas. The ultimate setup for massive scale.<br><br>**Use case**: Tech giants, global applications<br>**Max scale**: Virtually unlimited            |

#### Scenario 1: No Sharding, No Partitioning

```text
┌─────────────────┐
│   Database      │
│  [All Data]     │  ← Everything in one place
└─────────────────┘
```

- Simplest setup
- All data in one table
- Easy to query and maintain
- Limited by single server capacity

#### Scenario 2: No Sharding, With Partitioning

```text
┌─────────────────────────┐
│      Database           │
│  [2024 Data]            │  ← Partitioned by year
│  [2023 Data]            │
│  [2022 Data]            │
└─────────────────────────┘
```

- Better query performance (queries scan less data)
- Easier to archive old data
- Still limited by single server
- Good for time-series data

#### Scenario 3: With Sharding, No Partitioning

```text
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Shard 1    │  │  Shard 2    │  │  Shard 3    │
│  [A-I data] │  │  [J-R data] │  │  [S-Z data] │
└─────────────┘  └─────────────┘  └─────────────┘
```

- Scales horizontally
- Each shard is a simple database
- Application handles routing
- Can add more shards as needed

#### Scenario 4: With Sharding + Partitioning + Read Replicas

```text
┌─────────────────────┐     ┌─────────────────────┐
│  Shard 1 (Master)   │     │  Shard 2 (Master)   │
│   [2024 A-M Data]   │     │   [2024 N-Z Data]   │
│   [2023 A-M Data]   │     │   [2023 N-Z Data]   │
└──────┬──────────────┘     └──────┬──────────────┘
       │                           │
       ├─ Replica 1                ├─ Replica 1
       └─ Replica 2                └─ Replica 2
```

- Maximum scalability and performance
- Each shard partitions data internally
- Read replicas handle read load
- Complex but handles any scale
- This is how companies like Facebook, Twitter scale

### Detailed Comparison

| Aspect                  | Partitioning                          | Sharding                               |
| ----------------------- | ------------------------------------- | -------------------------------------- |
| **Scope**               | Within one database instance          | Across multiple database instances     |
| **Physical Location**   | Same server                           | Different servers                      |
| **Primary Goal**        | Query performance, data organization  | Load distribution, capacity scaling    |
| **Complexity**          | Low to moderate                       | High                                   |
| **Cost**                | No additional hardware                | Requires multiple servers              |
| **Application Changes** | Minimal or none                       | Significant routing logic needed       |
| **Query Complexity**    | Database handles internally           | Application must route requests        |
| **Fault Tolerance**     | Single point of failure               | Better (one shard fails, others work)  |
| **Examples**            | PostgreSQL table partitioning by date | MongoDB sharded cluster across servers |

### Real-World Examples

**PostgreSQL Table Partitioning** (Partitioning, not Sharding)

```sql
-- Create parent table
CREATE TABLE measurements (
    id SERIAL,
    logdate DATE NOT NULL,
    temperature INT
) PARTITION BY RANGE (logdate);

-- Create partitions for different months
CREATE TABLE measurements_2024_01 PARTITION OF measurements
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE measurements_2024_02 PARTITION OF measurements
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Query automatically uses the right partition
SELECT * FROM measurements WHERE logdate = '2024-01-15';
```

All partitions are on the same PostgreSQL instance.

**MongoDB Sharded Cluster** (True Sharding)

```javascript
// Enable sharding for a database
sh.enableSharding("myapp");

// Shard a collection by user_id
sh.shardCollection("myapp.users", { user_id: "hashed" });

// MongoDB automatically distributes data across shards
// mongos router handles query routing transparently
```

Data is distributed across multiple MongoDB instances (shards).

**Why This Matters**

When your architect says "let's shard the database," clarify:

- Do they mean table partitioning on one server? (Easier, limited scaling)
- Or true sharding across multiple servers? (Harder, unlimited scaling)

The implementation complexity and operational overhead are vastly different!

## When to Use What

| Scenario                                     | Solution                         |
| -------------------------------------------- | -------------------------------- |
| CPU/Memory bottleneck, simple setup          | Vertical scaling                 |
| Read-heavy workload (90%+ reads)             | Read replicas                    |
| Need strong consistency                      | Synchronous replication          |
| Can tolerate slight delays, need speed       | Asynchronous replication         |
| Single node can't hold all data              | Sharding                         |
| Vertical scaling limit reached               | Horizontal scaling with sharding |
| Need both read scaling and data distribution | Sharding + Replicas per shard    |

## Hands-on Practice

I've created demos you can run locally to experiment with these concepts: [scaling-db](https://github.com/pulkitxm/systems/tree/main/databases/scaling-db)

- [read-replicas](https://github.com/pulkitxm/systems/tree/main/databases/scaling-db/read-replicas): Set up a primary with multiple read replicas, test read distribution, and measure replication lag.
- [sharding](https://github.com/pulkitxm/systems/tree/main/databases/scaling-db/sharding): Hash-based sharding across multiple PostgreSQL instances with a shard manager.

## Conclusion

Database scaling isn't one-size-fits-all. Start with the simplest solution that works:

1. **First**: Optimize your queries and add indexes
2. **Then**: Vertical scaling (bigger server)
3. **Next**: Read replicas (if read-heavy)
4. **Finally**: Sharding (when data/load exceeds single node capacity)

Each step adds complexity. Only move to the next level when you've exhausted the current one. And always, read your database's documentation. The implementation details matter.

## Related writing

- [Database Transaction Internals: ACID, WAL, MVCC & Locking](https://pulkit.blog/system-design/db-transaction-internals.md): January 3, 2026
- [Load Balancers](https://pulkit.blog/system-design/load-balancers.md): January 11, 2026
- [Rate Limiting](https://pulkit.blog/system-design/rate-limiting.md): April 11, 2026
