# Non-Relational Databases

> Explore the world of NoSQL databases: Document DBs, Key-Value Stores, and Graph Databases. Learn when to use each type, their trade-offs, and why they scale horizontally out of the box.

- URL: https://pulkit.blog/system-design/non-relational-databases/
- Published: January 8, 2026
- Tags: Database, NoSQL, MongoDB, Redis, Neo4j
- Part of: [System Design](https://pulkit.blog/system-design.md)

![Non-Relational Databases](https://pulkit.blog/assets/content/blogs/non-relational-databases/types.webp)

Non-relational databases, often called NoSQL databases, represent a broad category of databases that differ from traditional relational databases like MySQL, PostgreSQL, or Oracle. But here's the catch: while all relational databases share similar characteristics (SQL queries, rows and columns, ACID transactions), non-relational databases are not all alike. Each type has its own query language, storage mechanism, and set of guarantees.

## TL;DR

- **Non-relational databases** is a broad term for databases that aren't SQL-based. They don't all work the same way
- **Key advantage**: Most NoSQL databases shard out of the box, enabling horizontal scaling without complex setup
- **Document DBs** (MongoDB, Elasticsearch): Closest to relational databases, support complex queries and partial updates. Great for catalogs and notifications
- **Key-Value Stores** (Redis, DynamoDB, Aerospike): Simple GET/PUT/DEL operations. Extremely fast and scalable. Most access patterns are key-based anyway
- **Graph DBs** (Neo4j, Neptune, DGraph): Built for graph algorithms. Use when you need social networks, recommendations, or fraud detection
- **Trade-off**: NoSQL gives up features like foreign keys and ACID transactions for horizontal scalability
- You can use relational databases as key-value stores by limiting your access patterns

## The Horizontal Scaling Advantage

A common misconception is that non-relational databases scale while relational databases don't. This isn't entirely accurate. The real difference is that non-relational databases shard out of the box.

Relational databases assume all data lives in one node. That's how they provide foreign key checks, cascading deletes, triggers, and full ACID transactions. Non-relational databases don't make this assumption, which means they can distribute data across multiple nodes without special configuration.

If you don't use foreign key checks, don't heavily leverage transactions, and limit your access patterns, you can split relational databases horizontally too. NoSQL just makes this easier by not providing those features in the first place.

Think of it as a trade-off: relational databases give you strong guarantees and features. Non-relational databases drop some of those features to make horizontal scaling simpler.

## Document Databases

![Document DB](https://pulkit.blog/assets/content/blogs/non-relational-databases/document-db.webp)

Document databases are the closest to relational databases in the NoSQL world. They're mostly JSON-based and support complex queries including aggregations, filters, and sorting.

**Popular examples:** MongoDB, Elasticsearch

### Why Document DBs Feel Familiar

Unlike relational databases where SQL is standardized, non-relational databases have no standard query language or storage format. But document DBs come close to what you'd expect from a traditional database:

- Complex queries with filters, aggregations, and sorting
- Partial updates without rewriting the entire document
- Indexes for fast lookups
- Rich data modeling with nested structures

### Partial Updates

Consider this document:

```json
{
  "user_id": "u_12345",
  "name": "Emma",
  "city": "Los Angeles",
  "profile": {
    "bio": "Love traveling and photography",
    "interests": ["travel", "photography", "hiking"]
  }
}
```

When you want to add a new interest, you can issue a simple update:

```javascript
db.users.updateOne(
  { user_id: "u_12345" },
  { $push: { "profile.interests": "cooking" } },
);
```

This updates only the `total_posts` field. The database applies this change in place without reading or rewriting the entire document.

Why does this matter? Imagine the document is 1KB. Without partial updates, you'd need to:

1. Read the entire 1KB document
2. Update the integer in memory
3. Write the entire 1KB document back

That's 2KB of data transfer just to increment one number. With partial updates, you send a tiny command and the database handles it efficiently. This makes a huge difference at scale.

**Warning:** Not all databases support partial updates. Many key-value stores require you to read the entire value, modify it, and write it back. Document databases giving you this feature is a big deal.

### When to Use Document DBs

**In-App Notifications:**

```json
{
  "notification_id": "n_789",
  "user_id": "u_12345",
  "type": "like",
  "message": "John liked your post",
  "read": false,
  "metadata": {
    "post_id": "p_456",
    "liker_avatar": "https://..."
  },
  "created_at": "2026-01-07T10:30:00Z"
}
```

Notifications are inherently unstructured. Different notification types have different metadata. Document DBs handle this naturally without requiring schema migrations for every new notification type.

**Product Catalogs:**

```json
{
  "product_id": "p_001",
  "title": "Wireless Headphones",
  "price": 149.99,
  "category": "Electronics",
  "specifications": {
    "battery_life": "30 hours",
    "driver_size": "40mm",
    "noise_cancellation": true
  },
  "seller_notes": "Limited edition color available"
}
```

Different products have different attributes. A laptop has RAM and storage specs. A shirt has size and color. Document DBs let sellers add custom fields without breaking the schema.

## Key-Value Stores

![Key-Value DB](https://pulkit.blog/assets/content/blogs/non-relational-databases/key-value-db.webp)

Key-value stores are the simplest databases. They restrict access to basic operations: GET a key, PUT a key, DELETE a key. That's it.

**Popular examples:** Redis, DynamoDB, Aerospike

### The Power of Simplicity

```text
GET(key) → value
PUT(key, value) → success
DEL(key) → success
```

No complex queries. No aggregations. No joins. Just key-based access.

This extreme simplicity gives key-value stores their superpower: they can shard and scale to hundreds of nodes without any hiccups. When your access pattern is "given this key, give me the data," distributing that across machines is trivial.

```typescript
async function getUserProfile(userId: string): Promise<Profile | null> {
  return await redis.get(`profile:${userId}`);
}

async function setUserProfile(userId: string, profile: Profile): Promise<void> {
  await redis.set(`profile:${userId}`, JSON.stringify(profile));
}

async function deleteUserProfile(userId: string): Promise<void> {
  await redis.del(`profile:${userId}`);
}
```

### When Key-Value Is Enough

Amazon's DynamoDB paper reveals something interesting. When Amazon analyzed their workloads (which were primarily relational database driven), they found most access patterns were key-based:

- Primary key lookups
- At most one indexed attribute
- Simple GET/PUT operations

They weren't using foreign keys, complex joins, or heavy transactions. The relational features were overkill.

This is more common than you think. Consider these use cases:

| Use Case      | Key                    | Value           |
| ------------- | ---------------------- | --------------- |
| User Profile  | `profile:{user_id}`    | Profile JSON    |
| Order Details | `order:{order_id}`     | Order JSON      |
| Auth Token    | `token:{token_string}` | Auth object     |
| Message       | `message:{message_id}` | Message content |
| Session       | `session:{session_id}` | Session data    |

All of these are: "Given an ID, give me the data." No complex queries needed.

```typescript
interface OrderStore {
  getOrder(orderId: string): Promise<Order | null>;
  saveOrder(order: Order): Promise<void>;
  deleteOrder(orderId: string): Promise<void>;
}

const orderStore: OrderStore = {
  async getOrder(orderId) {
    const data = await redis.get(`order:${orderId}`);
    return data ? JSON.parse(data) : null;
  },

  async saveOrder(order) {
    await redis.set(`order:${order.id}`, JSON.stringify(order));
  },

  async deleteOrder(orderId) {
    await redis.del(`order:${orderId}`);
  },
};
```

### What Key-Value Stores Can't Do

The limitation is clear: no operations on values. You can't query "all users with balance > 1000" because that would require scanning every key and inspecting every value.

```typescript
// This is NOT how key-value stores work
const highBalanceUsers = await redis.query(
  "SELECT * FROM users WHERE balance > 1000",
);

// You'd have to do this instead (terrible for large datasets)
const allKeys = await redis.keys("user:*");
const highBalanceUsers = [];
for (const key of allKeys) {
  const user = JSON.parse(await redis.get(key));
  if (user.balance > 1000) {
    highBalanceUsers.push(user);
  }
}
```

If you need to filter, aggregate, or query based on attributes inside the value, you need a document database or relational database.

### Key-Value on Top of Relational DBs

Here's an interesting insight: key-value is just an access pattern. You can build key-value semantics on top of any database:

```sql
CREATE TABLE kv_store (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT
);

-- GET
SELECT value FROM kv_store WHERE key = 'user:emma';

-- PUT
INSERT INTO kv_store (key, value) VALUES ('user:emma', '{"name": "Emma", "city": "Los Angeles"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- DEL
DELETE FROM kv_store WHERE key = 'user:emma';
```

If you limit your access patterns, you can use any database as a key-value store. The specialized key-value databases just optimize heavily for this pattern.

## Graph Databases

![Graph DB](https://pulkit.blog/assets/content/blogs/non-relational-databases/graph-db.webp)

Graph databases are for when you actually need graph algorithms. They store data as nodes, edges, and relationships, just like the graph data structures you studied in algorithms class.

**Popular examples:** Neo4j, Amazon Neptune, DGraph

### What Makes Graphs Special

```text
Emma ──FRIENDS──> Alex
│                 │
LIVES_IN       FRIENDS
│                 │
v                 v
Los Angeles    Olivia
               │   │
            LIKES  LIKES
               │   │
               v   v
          Shopping Movies
               ^
               │
            LIKES
               │
             Alex
```

Graph databases excel at traversing relationships. Finding "friends of friends," "people who like what my friends like," or "shortest path between two entities" are natural operations.

### Graph Queries with Cypher (Neo4j)

```cypher
// Find all friends of Emma
MATCH (emma:Person {name: "Emma"})-[:FRIENDS]->(friend)
RETURN friend.name

// Find friends of friends (2 hops)
MATCH (emma:Person {name: "Emma"})-[:FRIENDS*2]->(fof)
WHERE NOT (emma)-[:FRIENDS]->(fof) AND emma <> fof
RETURN DISTINCT fof.name

// Find what Alex's friends like
MATCH (alex:Person {name: "Alex"})-[:FRIENDS]->(friend)
MATCH (friend)-[:LIKES]->(interest)
RETURN friend.name, interest.name
ORDER BY friend.name

// Recommendations: What do my friends like that I don't?
MATCH (me:Person {name: "Alex"})-[:FRIENDS]->(friend)-[:LIKES]->(interest)
WHERE NOT (me)-[:LIKES]->(interest)
RETURN interest.name, COUNT(*) as popularity
ORDER BY popularity DESC
```

### When to Use Graph Databases

**Social Networks:**

```cypher
// Mutual friends between Emma and Alex
MATCH (emma:Person {name: "Emma"})-[:FRIENDS]->(mutual)<-[:FRIENDS]-(alex:Person {name: "Alex"})
RETURN mutual.name

// Find people who live in the same city as Emma
MATCH (emma:Person {name: "Emma"})-[:LIVES_IN]->(city)<-[:LIVES_IN]-(neighbor)
WHERE neighbor <> emma
RETURN neighbor.name, city.name
```

**Recommendation Engines:**

```cypher
// "People like you also like" - find interests based on friends
MATCH (me:Person {name: "Olivia"})-[:FRIENDS]->(friend)-[:LIKES]->(interest)
WHERE NOT (me)-[:LIKES]->(interest)
RETURN interest.name, COUNT(*) as score
ORDER BY score DESC
LIMIT 5

// Find people with similar interests
MATCH (me:Person {name: "Alex"})-[:LIKES]->(interest)<-[:LIKES]-(similar)
WHERE similar <> me
RETURN similar.name, COUNT(interest) as common_interests
ORDER BY common_interests DESC
```

**Fraud Detection:**

```cypher
// Find circular money transfers (potential money laundering)
MATCH path = (a:Account)-[:TRANSFERRED*3..6]->(a)
WHERE ALL(r IN relationships(path) WHERE r.amount > 10000)
RETURN path
```

### The Graph Database Warning

Just because you can model something as a graph doesn't mean you should use a graph database.

You could model users and orders as:

```text
User ──placed──> Order ──contains──> Product
```

But if all you do is "given user ID, get their orders" or "given order ID, get order details," a key-value store or document DB is far better. Graph databases are optimized for traversing relationships and running graph algorithms, not for simple lookups.

Graph databases trade-offs:

- Not optimized for ACID transactions
- Not optimized for simple CRUD operations
- Not optimized for tabular data
- Excellent for relationship-heavy queries

**Use a graph database because you need graph algorithms, not because your data can be represented as a graph.**

## Choosing the Right Database

| Need                                     | Choose          | Example                |
| ---------------------------------------- | --------------- | ---------------------- |
| Complex queries, flexible schema         | Document DB     | MongoDB, Elasticsearch |
| Simple key-based access, high throughput | Key-Value Store | Redis, DynamoDB        |
| Graph algorithms, relationship traversal | Graph DB        | Neo4j, Neptune         |
| ACID transactions, complex joins         | Relational DB   | PostgreSQL, MySQL      |

## Conclusion

Non-relational databases aren't a single category; they're a diverse ecosystem of specialized tools. Document DBs give you flexibility with complex queries. Key-value stores give you simplicity and scale. Graph DBs give you relationship superpowers.

The key insight is that NoSQL databases trade features (foreign keys, transactions, constraints) for horizontal scalability. If you don't need those features, you get easier scaling. If you do need them, stick with relational databases.

Most importantly: don't choose a database based on what's trendy. Choose based on your access patterns. If 90% of your queries are "given this ID, get the data," a key-value store might be all you need, even if your data could theoretically be modeled as a graph.

## Related writing

- [Database Transaction Internals: ACID, WAL, MVCC & Locking](https://pulkit.blog/system-design/db-transaction-internals.md): January 3, 2026
- [Bloom Filters](https://pulkit.blog/system-design/bloom-filters.md): January 24, 2026
- [Caching](https://pulkit.blog/system-design/caching.md): January 8, 2026
