# Database Transaction Internals: ACID, WAL, MVCC & Locking

> Database transaction internals explained: how ACID, WAL, MVCC, and locking work across PostgreSQL, MySQL, and MongoDB to keep data consistent.

- URL: https://pulkit.blog/system-design/db-transaction-internals/
- Published: January 3, 2026
- Tags: System Design, Database, Transactions, ACID, WAL, MVCC, Locking, PostgreSQL, MySQL, MongoDB
- Part of: [System Design](https://pulkit.blog/system-design.md)

Building reliable applications requires understanding database transactions. When you transfer money between accounts, update inventory after a purchase, or maintain referential integrity across tables, transactions ensure your data stays consistent. But how do databases actually guarantee that either all operations succeed or none do? Let's explore the internals of database transactions and understand what happens under the hood.

## TL;DR

- **Transactions group operations** into an all-or-nothing unit. When you BEGIN, the database assigns a transaction ID and creates a snapshot
- **ACID properties** are implemented through concrete mechanisms: Write-Ahead Logs (atomicity/durability), constraints (consistency), and MVCC (isolation)
- **Isolation levels** trade consistency for performance. Read Committed is usually enough; use Repeatable Read or Serializable only when needed
- **MVCC** maintains multiple row versions so readers don't block writers. PostgreSQL stores versions inline, MySQL uses undo logs
- **MongoDB transactions** are expensive due to two-phase commit across shards. Design your schema to keep related data in one document
- **Deadlocks** happen when transactions wait for each other's locks. Always acquire locks in the same order
- **Keep transactions short** to avoid lock contention and table bloat. Retry on serialization errors

## What is a Transaction?

A database transaction is a single unit of work that groups one or more operations together. Think of it as an all-or-nothing deal: either every operation in the transaction completes successfully, or the database reverts to its state before the transaction started.

But internally, it's much more than just a boundary around operations. When you start a transaction, the database does three critical things:

1. Assigns a unique transaction ID or timestamp
2. Creates a snapshot or read view of the current database state
3. Allocates transactional metadata structures in memory

From this point forward, every read and write is tagged with your transaction's identity until you either commit or abort.

Here's a classic example:

```sql
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;
```

In this money transfer, both updates must succeed. If the first update executes but the system crashes before the second, we'd have $100 disappearing into thin air. Transactions prevent this nightmare scenario. Nothing here is applied directly to disk in place. Everything flows through logs, buffers, and visibility rules.

## ACID

ACID is the cornerstone of transactional databases. These four properties ensure data integrity even when things go wrong. Let's understand each property and how databases implement them.

![ACID properties diagram showing Atomicity, Consistency, Isolation, and Durability](https://pulkit.blog/assets/content/blogs/db-transaction-internals/acid-properties.webp)

### Atomicity

Atomicity ensures that all operations within a transaction are treated as a single, indivisible unit. Either everything succeeds, or nothing happens at all. But atomicity isn't enforced at commit time. It's enforced continuously as your transaction runs.

**How it works:** Databases use a Write-Ahead Log (WAL) to implement atomicity. The rule is simple but powerful: changes must be written to the log before they're written to data pages.

For every modification, the database appends a log record describing:

- What was changed
- The transaction ID
- Enough information to undo or redo the change

If a crash occurs mid-transaction, recovery is straightforward:

- Committed transactions are replayed (redo)
- In-flight transactions are reversed (undo)

PostgreSQL's implementation is elegant: it doesn't overwrite rows on UPDATE. Instead, it creates new row versions. Aborting a transaction is often just marking those versions as invisible. Crash recovery replays WAL records to reach a consistent state, applying only the transactions that reached their commit log record.

### Consistency

Consistency guarantees that a transaction brings the database from one valid state to another, respecting all defined constraints, triggers, and cascades. Unlike the other ACID properties, consistency isn't enforced by the transaction system alone. It's enforced by constraints, indexes, and triggers.

```sql
CREATE TABLE accounts (
  id INT PRIMARY KEY,
  balance DECIMAL CHECK (balance >= 0)
);
```

If a transaction tries to set balance to -50, the database rejects it. The CHECK constraint ensures consistency. Foreign keys, unique constraints, and triggers all contribute to maintaining consistency.

What matters internally is when these checks happen. By default, constraints are checked immediately after each statement. But you can also defer constraint checks until commit time:

```sql
-- Default: checked after each statement
BEGIN;
UPDATE accounts SET balance = -50 WHERE id = 1; -- Fails immediately!
COMMIT;

-- Deferred: checked at commit
BEGIN;
SET CONSTRAINTS ALL DEFERRED;
UPDATE accounts SET balance = -50 WHERE id = 1; -- Allowed temporarily
UPDATE accounts SET balance = 50 WHERE id = 1;  -- Fix it before commit
COMMIT; -- Checks pass, transaction succeeds
```

This flexibility allows temporary constraint violations inside a transaction while guaranteeing the database is valid once the commit record is written to the log. If any constraint fails at commit time, the transaction never reaches the commit log record. Atomicity ensures nothing leaks.

### Isolation

Isolation ensures that concurrent transactions don't interfere with each other. Each transaction should execute as if it's the only transaction running, even when hundreds are executing simultaneously.

This is where things get interesting. Perfect isolation would mean running transactions serially (one after another), but that would kill performance. Instead, databases implement different isolation levels that trade perfect isolation for better throughput.

Running transactions concurrently means the database must answer one question repeatedly: Which version of this data is visible to this transaction right now?

**Implementation techniques:**

1. **Locking:** The traditional approach. Transactions acquire locks on data they read or write. Other transactions must wait for locks to be released.

2. **Multi-Version Concurrency Control (MVCC):** PostgreSQL and MySQL (InnoDB) use this. Instead of blocking readers and writers, the database maintains multiple versions of each row. Each version has metadata indicating which transaction created it and which transaction invalidated it. When you read data, you see a consistent snapshot from when your transaction started. Writers don't block readers, and readers don't block writers.

Here's how MVCC works in PostgreSQL:

```sql
-- Transaction 1
BEGIN;
SELECT balance FROM accounts WHERE id = 1; -- Sees 100

-- Transaction 2 (concurrent)
BEGIN;
UPDATE accounts SET balance = 200 WHERE id = 1;
COMMIT;

-- Back to Transaction 1
SELECT balance FROM accounts WHERE id = 1; -- Still sees 100!
COMMIT;
```

PostgreSQL achieves this by storing a transaction ID (xmin) with each row version. When you query, it checks if the row version is visible to your transaction based on when your transaction started.

### Durability

Durability promises that once a transaction commits, its changes persist even if the system crashes immediately after. This is guaranteed by forcing log records to stable storage before acknowledging the commit.

A commit is considered complete only after:

- The transaction's commit record is flushed to disk
- The database guarantees it can replay this change after a crash

Data pages may still be in memory. That's fine. The log is the source of truth.

**Implementation strategies:**

1. **Write-Ahead Logging:** Changes are first written to the WAL, which is flushed to disk before COMMIT returns. The WAL is append-only, making it much faster than updating scattered data pages.

2. **Checkpoints:** Periodically, the database writes dirty pages from memory to disk. This reduces recovery time because the database only needs to replay the WAL from the last checkpoint, not from the beginning of time.

3. **Replication:** In distributed systems, data is replicated across multiple nodes. A transaction isn't committed until it's written to multiple machines.

```sql
-- PostgreSQL configuration for durability
synchronous_commit = on  -- Wait for WAL flush before COMMIT returns
fsync = on              -- Force WAL to physical disk
wal_level = replica     -- Write enough WAL for replication
```

## Isolation Levels and Tradeoffs

SQL defines four isolation levels, each trading stronger guarantees for better performance. Isolation levels aren't abstract rules. They directly affect how snapshots and locks are managed.

### 1. Read Uncommitted

The weakest level. Transactions can see uncommitted changes from other transactions (dirty reads). Almost never used in practice because it's too dangerous.

### 2. Read Committed

The default in PostgreSQL and most databases. Each statement gets a new snapshot. You only see committed data, but the data can change between reads within your transaction.

```sql
-- Your transaction
BEGIN;
SELECT balance FROM accounts WHERE id = 1; -- Returns 100

-- Another transaction commits
UPDATE accounts SET balance = 200 WHERE id = 1;

-- Your transaction
SELECT balance FROM accounts WHERE id = 1; -- Returns 200 now!
```

This can lead to non-repeatable reads, but it's fast and works well for most applications.

### 3. Repeatable Read

One snapshot for the entire transaction. PostgreSQL's MVCC makes this efficient. You see a consistent snapshot throughout your transaction. The same SELECT returns the same results every time.

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT * FROM accounts; -- Snapshot taken here
-- All subsequent reads see this same snapshot
COMMIT;
```

A common issue at lower isolation levels is phantom reads, where new rows appear in your results between queries:

```sql
-- Transaction 1
BEGIN;
SELECT COUNT(*) FROM accounts WHERE balance > 1000; -- Returns 5

-- Transaction 2 (concurrent)
INSERT INTO accounts (id, balance) VALUES (100, 2000);
COMMIT;

-- Transaction 1
SELECT COUNT(*) FROM accounts WHERE balance > 1000; -- Returns 6 (phantom row!)
```

PostgreSQL prevents phantom reads at Repeatable Read (unlike the SQL standard, which only prevents them at Serializable). It uses predicate locking to detect conflicting inserts. This makes it very powerful for applications that need consistency without the overhead of full serialization.

### 4. Serializable

The strongest guarantee. Transactions execute as if they ran serially, one after another. Even Repeatable Read can't prevent all anomalies. Consider this scenario:

```sql
-- Two transactions allocating the last seat on a flight

-- Transaction 1: Check available seats
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT seats FROM flights WHERE id = 1; -- Returns 1 seat available

-- Transaction 2: Also checks seats (concurrent)
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT seats FROM flights WHERE id = 1; -- Also sees 1 seat available

-- Transaction 1: Book the seat
UPDATE flights SET seats = 0 WHERE id = 1;
COMMIT;

-- Transaction 2: Also books the seat
UPDATE flights SET seats = 0 WHERE id = 1; -- Goes to -1!
COMMIT;
```

Both transactions saw 1 seat and both booked it. Serializable prevents this.

```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT seats FROM flights WHERE id = 1;
UPDATE flights SET seats = seats - 1 WHERE id = 1;
COMMIT; -- One transaction succeeds, the other gets serialization error
```

PostgreSQL implements this using Serializable Snapshot Isolation (SSI). It tracks what you read and what you write. If two transactions have conflicting read-write patterns, one gets aborted with a serialization error. You need to catch this error and retry the transaction.

## How Different Databases Implement Transactions

### PostgreSQL

PostgreSQL uses MVCC with append-only storage. When you UPDATE a row, PostgreSQL doesn't modify the old row; it creates a new version. The old version remains visible to transactions that started before the update. This design heavily favors read concurrency and predictable performance.

**Key implementation details:**

- Each row has hidden columns: `xmin` (transaction that created it) and `xmax` (transaction that deleted it)
- When you query, PostgreSQL filters versions based on your transaction's snapshot
- VACUUM process cleans up old row versions that no transaction can see anymore
- Excellent for read-heavy workloads because readers never block

```sql
-- Check transaction IDs
SELECT xmin, xmax, * FROM accounts;
```

### MySQL (InnoDB)

InnoDB also uses MVCC but stores old row versions in a separate undo log rather than in the table. This makes the primary table more compact but requires reading the undo log to reconstruct old versions.

**Key implementation details:**

- Undo logs stored in the system tablespace or separate undo tablespaces
- Table pages stay compact, but reconstructing old versions requires undo log lookups
- Uses next-key and gap locks in Repeatable Read to prevent phantom reads
- More aggressive locking than PostgreSQL by default, resulting in stronger protection against phantoms but higher lock contention under write-heavy workloads

```sql
-- InnoDB specific transaction
START TRANSACTION WITH CONSISTENT SNAPSHOT;
-- Creates a consistent read view
```

### MongoDB

MongoDB added multi-document ACID transactions in version 4.0 (for replica sets) and 4.2 (for sharded clusters). This was a game-changer for use cases requiring transactional guarantees. But MongoDB's distributed nature makes transactions more expensive than in traditional RDBMS.

**Implementation approach:**

- Uses logical timestamps for snapshot isolation
- WiredTiger storage engine provides document-level concurrency control
- Transactions have a 60-second time limit by default
- Uses two-phase commit protocol across shards, which adds latency

```typescript
const session = client.startSession();

session.startTransaction();
try {
  await accounts.updateOne(
    { _id: 1 },
    { $inc: { balance: -100 } },
    { session },
  );

  await accounts.updateOne({ _id: 2 }, { $inc: { balance: 100 } }, { session });

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

Transactions are durable and isolated, but they're expensive. This is why MongoDB strongly encourages schema design that keeps related data within a single document. Transactions exist for correctness, not throughput.

## Lock Management and Deadlocks

Even with MVCC, locks are unavoidable for writes. Understanding locks helps you avoid deadlocks and performance issues. Databases maintain lock tables and wait-for graphs to track who's waiting for what.

**Lock types:**

1. **Shared locks (S):** Multiple transactions can hold shared locks on the same data. Used for reads.

2. **Exclusive locks (X):** Only one transaction can hold an exclusive lock. Used for writes.

3. **Row-level locks:** Lock individual rows. Best for concurrency.

4. **Table-level locks:** Lock entire tables. Simple but can hurt performance.

**Deadlock example:**

```sql
-- Transaction 1
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- Now needs a lock on id = 2

-- Transaction 2
BEGIN;
UPDATE accounts SET balance = balance + 50 WHERE id = 2;
-- Now needs a lock on id = 1

-- Deadlock! Each transaction waits for the other's lock
```

Databases detect deadlocks using wait-for graphs. When cycles are detected, one transaction is aborted to break the deadlock. Always acquire locks in a consistent order to avoid this class of failure.

## Practical Considerations

### Keep Transactions Short

Long-running transactions hold locks longer and prevent VACUUM from cleaning up old row versions in PostgreSQL. This leads to table bloat and degraded performance. The rule of thumb: keep transactions as short as possible.

```sql
-- Bad
BEGIN;
SELECT * FROM large_table; -- Takes 10 minutes
UPDATE accounts SET balance = balance + 100;
COMMIT;

-- Good: Split into separate transactions
SELECT * FROM large_table;

BEGIN;
UPDATE accounts SET balance = balance + 100;
COMMIT;
```

### Table Bloat (Dead Tuples) and VACUUM

MVCC is great for concurrency, but it comes with a hidden bill: **old row versions**.

In PostgreSQL, an `UPDATE` doesn't overwrite a row in place. It creates a new row version and marks the old one as dead (a **dead tuple**). If you update the same row 5 times, you might have 1 live version + 5 dead versions sitting in the same table file.

Over time, dead tuples accumulate and you get **table bloat**:

- Queries scan more pages than they need to
- Indexes get larger
- Cache hit ratios get worse
- Storage keeps growing even if your “logical” row count stays flat

This is what **VACUUM** is for. VACUUM is PostgreSQL's garbage collector:

- It identifies dead tuples that **no active transaction can still see**
- Marks their space as reusable for future inserts/updates
- Helps prevent transaction ID wraparound (anti-wraparound vacuum)

Important nuance: regular `VACUUM` typically **does not shrink** the physical file on disk. It makes space reusable inside the file. If you need to shrink the file, you usually reach for `VACUUM FULL` (which rewrites the table and is much more disruptive).

You can observe bloat with a simple before/after:

```sql
-- How many dead tuples are we carrying?
SELECT
  schemaname,
  relname,
  n_live_tup,
  n_dead_tup
FROM pg_stat_user_tables
WHERE relname = 'accounts';

-- Table size (logical bloat shows up here)
SELECT pg_size_pretty(pg_total_relation_size('accounts')) AS total_size;

-- Clean up dead tuples (space becomes reusable)
VACUUM (VERBOSE) accounts;
```

Here’s what a typical `VACUUM VERBOSE` looks like (trimmed):

```text
INFO:  vacuuming "transactions_db.public.accounts"
INFO:  finished vacuuming "transactions_db.public.accounts": index scans: 0
pages: 0 removed, 1 remain, 1 scanned (100.00% of total)
tuples: 3 removed, 1 remain, 0 are dead but not yet removable
removable cutoff: 894, which was 0 XIDs old when operation ended
new relfrozenxid: 893, which is 4 XIDs ahead of previous value
buffer usage: 7 hits, 4 misses, 4 dirtied
WAL usage: 3 records, 1 full page images, 8506 bytes
```

How to read this:

- `tuples: 3 removed, 1 remain`: VACUUM reclaimed **3 dead row versions**; **1 live** row remains.
- `0 are dead but not yet removable`: nothing is being held back by an old snapshot right now.
- `pages: ... scanned`: how much of the table was scanned (small tables often show 100%).
- `new relfrozenxid ...`: anti-wraparound bookkeeping; VACUUM also advances freezing metadata.
- `WAL usage ...`: VACUUM can generate WAL (especially for visibility map / hint bits / full page images).

If you run this and notice something weird like “size increased after VACUUM”, you're not crazy.

- `pg_total_relation_size` includes **table + indexes + TOAST**, not just the heap.
- Regular `VACUUM` usually **does not shrink** the physical file; it makes space **reusable** inside the file.
- On small tables, a tiny change (a couple pages, index cleanup, visibility map updates) can swing the reported size by a noticeable amount.
- `n_live_tup` / `n_dead_tup` are **statistics** and can be stale until vacuum/analyze updates them.

To make this more concrete, break the size down:

```sql
SELECT
  pg_size_pretty(pg_relation_size('accounts'))        AS table_only,
  pg_size_pretty(pg_indexes_size('accounts'))         AS indexes_only,
  pg_size_pretty(pg_total_relation_size('accounts'))  AS total;
```

Example (toy table, a few UPDATEs, then VACUUM): you might see total size go up, like **24 kB → 56 kB**, even though VACUUM removed dead tuples.

**VACUUM can create/update extra on-disk files for the relation.** A PostgreSQL “table” is not always one file. Internally it can have multiple *forks*:

- **main fork**: the actual table data pages
- **FSM (Free Space Map)**: tracks where free space exists (so inserts can reuse it)
- **VM (Visibility Map)**: tracks pages where tuples are all-visible (so index-only scans can skip heap checks)

On a fresh/small table, FSM/VM may be tiny or not even created yet. The first manual `VACUUM (VERBOSE)` can create or grow these forks. Since `pg_total_relation_size(...)` includes *everything*, the total can jump even though you “cleaned up” rows.

Here’s what that looks like in outputs (trimmed):

```text
-- Before VACUUM: size
 total_size
-----------
 24 kB

-- VACUUM VERBOSE summary
tuples: 3 removed, 1 remain, 0 are dead but not yet removable

-- After VACUUM: size
 total_size
-----------
 56 kB
```

If you want to **see the forks directly**, run:

```sql
SELECT
  pg_size_pretty(pg_relation_size('accounts'))                              AS heap_main,
  pg_size_pretty(pg_relation_size('accounts', 'fsm'))                       AS fsm,
  pg_size_pretty(pg_relation_size('accounts', 'vm'))                        AS vm,
  pg_size_pretty(pg_indexes_size('accounts'))                               AS indexes,
  pg_size_pretty(pg_total_relation_size('accounts'))                        AS total;
```

Sample output (toy table):

```text
 heap_main |  fsm  |  vm   | indexes | total
----------+-------+-------+---------+-------
 24 kB     | 24 kB | 8 kB  | 0 bytes | 56 kB
```

Think of it like this: VACUUM “cleans your room” (reclaims dead tuples), but it may also add **labels and shelves** (FSM/VM metadata) so the database can stay fast later. The room looks bigger on paper, but it’s now organized for reuse and performance.

One more gotcha: **long-running transactions can “hold back” VACUUM**. If a transaction is still open, PostgreSQL must keep old versions around because that transaction might still need them for its snapshot. This is why “keep transactions short” is not just about locks, it's also about keeping bloat under control.

### Choose the Right Isolation Level

Don't default to SERIALIZABLE for everything. Read Committed works fine for most applications and performs better.

### Handle Serialization Failures

When using REPEATABLE READ or SERIALIZABLE, be prepared for serialization errors. These aren't bugs. They're the database telling you a conflict was detected. Always implement retry logic:

```typescript
async function transferMoney(
  from: number,
  to: number,
  amount: number,
  maxRetries = 3,
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await db.transaction(async (trx) => {
        await trx("accounts").where("id", from).decrement("balance", amount);

        await trx("accounts").where("id", to).increment("balance", amount);
      });
      return;
    } catch (error) {
      if ((error as { code?: string }).code === "40001" && i < maxRetries - 1) {
        continue;
      }
      throw error;
    }
  }
}
```

### Use Savepoints for Partial Rollbacks

Savepoints are like checkpoints within a transaction. They let you undo part of your work without throwing away everything.

Imagine you're processing an order with multiple items. You want to save the order even if some items fail validation:

```sql
BEGIN;

-- Step 1: Create the order
INSERT INTO orders (id, total) VALUES (1, 100);

-- Step 2: Mark a savepoint (checkpoint)
SAVEPOINT before_items;

-- Step 3: Try to add items
INSERT INTO order_items (order_id, item) VALUES (1, 'laptop');  -- Works fine

-- Step 4: This one fails (invalid item)
INSERT INTO order_items (order_id, item) VALUES (1, 'invalid'); -- ERROR!

-- Step 5: Roll back only to the savepoint
ROLLBACK TO SAVEPOINT before_items;
-- Now we're back to just after creating the order
-- The order still exists, but the failed items are gone

-- Step 6: Commit everything that's left
COMMIT;
```

Final result: The order exists in the database with the laptop, but the invalid item was rolled back. Without savepoints, you'd have to either abort the entire transaction (losing the order) or handle the error in application code.

## Hands-on Practice

I've created SQL scripts you can run locally to experiment with everything covered here: [github.com/pulkitxm/systems/tree/main/databases/relationa\_db\_transactions](https://github.com/pulkitxm/systems/tree/main/databases/relationa_db_transactions). It includes demos for isolation levels, MVCC, deadlocks, savepoints, and WAL behavior.

## Conclusion

Transactions aren't just SQL syntax. They're carefully layered systems built from logs, snapshots, and recovery algorithms. ACID isn't a promise, it's an engineering discipline enforced every time your database writes a byte.

By understanding how ACID properties are implemented through Write-Ahead Logs, MVCC, and locking mechanisms, you stop guessing about isolation levels, retries, and performance. You start designing with intent.

Whether you're using PostgreSQL's elegant MVCC implementation, MySQL's InnoDB engine, or MongoDB's newer transaction support, the core concepts remain the same. Keep your transactions short, choose appropriate isolation levels, and always handle failures gracefully.

The next time you write `BEGIN TRANSACTION`, you'll know exactly what machinery springs into action beneath that simple command.

## Related writing

- [Non-Relational Databases](https://pulkit.blog/system-design/non-relational-databases.md): January 8, 2026
- [Understanding Database Scaling and Sharding Patterns](https://pulkit.blog/system-design/understanding-database-scaling-sharding.md): January 7, 2026
- [Message Queues vs Streams: SQS, RabbitMQ, Kafka, Pub/Sub](https://pulkit.blog/system-design/async-processing.md): January 10, 2026
