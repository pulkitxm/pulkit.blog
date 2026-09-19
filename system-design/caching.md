# Caching

> Understand caching fundamentals: what it is, why it matters, and how to use it. Learn about cache architecture, key-value access patterns, and real-world examples with Redis and Memcached.

- URL: https://pulkit.blog/system-design/caching/
- Published: January 8, 2026
- Tags: System Design, Caching, Redis, Memcached, CDN
- Part of: [System Design](https://pulkit.blog/system-design.md)

Caching is one of the most effective ways to get performance out of your system. The idea is simple: store frequently accessed data in a place that's faster to access. That's it. But understanding when to cache, what to cache, and how caching actually works under the hood can make the difference between a sluggish application and one that flies.

## TL;DR

- **Caching** is a technique to avoid expensive operations by storing frequently accessed data in faster storage
- **Cache** is the place where you store that data. It's anything that helps you save expensive network I/O, disk I/O, or CPU computation
- **Caches are temporary storage**. If your cache goes down, your system still works (just slower)
- **Don't cache everything**. Caches are expensive (RAM-based), so only cache data that's likely to be accessed again soon
- **Key-value access pattern**: Caches are essentially glorified hash tables. You put data in with a key, you get data out with a key
- **Popular caches**: Redis and Memcached are the most widely used caching solutions
- **Caches aren't just RAM**. Any storage that's "nearer" to you and helps avoid expensive operations is a cache
- **Lazy population**: Populate cache on miss. Most common approach. Always set an expiry
- **Eager population**: Proactively push data to cache when you know it will be accessed (live scores, viral content)
- **Scaling caches**: Same as databases. Vertical scaling → read replicas → sharding
- **Cache at different levels**: Client-side, CDN, remote cache (Redis), even database itself
- **Don't over-cache**: Every cache layer adds staleness. More layers = more invalidation headaches

## What is Caching?

![Caching is a technique to avoid expensive operations by storing frequently accessed data in faster storage](https://pulkit.blog/assets/content/blogs/caching/cache-db.webp)

A cache is anything that helps you avoid an expensive network I/O, disk I/O, or computation. In any computer system, there are only three things that can be expensive:

1. **Network I/O**: Making API calls, database queries over the network
2. **Disk I/O**: Reading from or writing to disk
3. **CPU computation**: Complex calculations, data transformations

When you cache, you're storing results from these expensive operations somewhere faster so you don't have to repeat them.

### A Practical Example

Let's say you want to get a user's profile information. The typical flow looks like this:

1. Request comes to your API server
2. API server talks to the database
3. Database joins five or six different tables to compute the profile
4. Response is sent back to the user

Joining five or six tables is expensive. Every single request triggers this expensive operation. Now imagine this:

1. Request comes to your API server
2. API server checks Redis (the cache)
3. Redis has the data → return immediately
4. No database query needed

```typescript
async function getProfile(userId: string): Promise<Profile> {
  const cacheKey = `profile:${userId}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const profile = await db.query(
    `
    SELECT u.*, p.*, s.*
    FROM users u
    JOIN preferences p ON u.id = p.user_id
    JOIN settings s ON u.id = s.user_id
    WHERE u.id = $1
  `,
    [userId],
  );

  await redis.set(cacheKey, JSON.stringify(profile), "EX", 3600);

  return profile;
}
```

The first request still hits the database. But every subsequent request for the same profile goes to Redis. No expensive joins, no database load.

## How Caching Works

The typical caching architecture looks like this:

![The typical caching architecture looks like this](https://pulkit.blog/assets/content/blogs/caching/request-flow.webp)

Here's the flow:

1. **Request arrives** at the API server
2. **Check the cache** first. Does it have the data?
3. **Cache hit**: Data exists in cache → return it immediately
4. **Cache miss**: Data not in cache → query the database
5. **Populate cache**: Store the result in cache for future requests
6. **Return response** to the user

This pattern is called **cache-aside** or **lazy loading**. The cache is always checked first, and populated on misses.

### What Happens if the Cache Goes Down?

This is the beauty of caching: it's a supplement, not a dependency.

If your cache goes down:

- Requests still work
- They just go directly to the database
- Performance degrades, but the system keeps functioning

```typescript
async function getProfile(userId: string): Promise<Profile> {
  const cacheKey = `profile:${userId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    // Cache is down - fall through to database
  }

  const profile = await db.getProfile(userId);

  try {
    await redis.set(cacheKey, JSON.stringify(profile), "EX", 3600);
  } catch (error) {
    // Cache write failed - that's okay, we have the data
  }

  return profile;
}
```

The cache makes things faster. The database is the source of truth. If the cache fails, you're back to where you started (without caching), not in a broken state.

## Why Not Cache Everything?

Caches are typically RAM-based. Redis stores data in memory. RAM is expensive. Much more expensive than disk.

If you decide to cache your entire database in Redis, you'd need massive amounts of RAM. For a 1TB database, you'd need 1TB of RAM. That's not practical.

Instead, you cache strategically:

| Cache This                     | Don't Cache This      |
| ------------------------------ | --------------------- |
| Frequently accessed data       | Rarely accessed data  |
| Expensive to compute           | Cheap to compute      |
| Data that doesn't change often | Highly volatile data  |
| Hot data (recent items)        | Cold data (old items) |

The key insight: **cache the subset of data that's most likely to be accessed in the near future.**

### How Do You Know What to Cache?

Look at your access patterns:

- **Recently published content** is more likely to be accessed (tweets, news articles)
- **Active user sessions** are accessed on every request
- **Popular items** get more traffic than unpopular ones
- **Computed aggregations** are expensive but don't change often

```typescript
const CACHE_TTL = {
  USER_SESSION: 3600,
  RECENT_TWEETS: 300,
  TRENDING_TOPICS: 60,
  USER_PROFILE: 1800,
};

async function cacheTweet(tweet: Tweet): Promise<void> {
  const isRecent = Date.now() - tweet.createdAt < 24 * 60 * 60 * 1000;

  if (isRecent) {
    await redis.set(
      `tweet:${tweet.id}`,
      JSON.stringify(tweet),
      "EX",
      CACHE_TTL.RECENT_TWEETS,
    );
  }
}
```

## Caches Are Glorified Hash Tables

At their core, caches have a simple access pattern: **key-value**.

```text
PUT(key, value)  → stores data
GET(key)         → retrieves data
DEL(key)         → removes data
```

That's it. No complex queries. No joins. No aggregations. Just:

- Put something in with a key
- Get it out with that same key

```typescript
interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

const profileKey = (userId: string) => `profile:${userId}`;
const sessionKey = (token: string) => `session:${token}`;
const tweetKey = (tweetId: string) => `tweet:${tweetId}`;
```

When you're checking the cache, you check if a specific key exists. If it does, you get the value. If not, you compute it and store it with that key for next time.

## Caches Are Not Just RAM

A common misconception: "Caches store data in RAM."

Redis stores data in RAM. But that doesn't mean all caches are RAM-based. The definition of a cache is broader:

**A cache is any storage that's "nearer" to you, so that you avoid an expensive operation.**

"Near" is relative:

- RAM is nearer than disk
- Local disk is nearer than network storage
- CDN edge server is nearer than origin server
- API server memory is nearer than Redis

```typescript
class MultiLevelCache {
  private localCache = new Map<string, { value: string; expiry: number }>();

  async get(key: string): Promise<string | null> {
    const local = this.localCache.get(key);
    if (local && local.expiry > Date.now()) {
      return local.value;
    }

    const remote = await redis.get(key);
    if (remote) {
      this.localCache.set(key, {
        value: remote,
        expiry: Date.now() + 60000,
      });
      return remote;
    }

    return null;
  }
}
```

In this example, the API server's memory acts as a first-level cache before Redis. Both are caches. Both help avoid expensive operations.

## Real-World Caching Examples

### 1. Google News

News articles have a clear access pattern: recent articles are accessed far more than old ones. An article published a week ago? Barely anyone reads it. An article published 10 minutes ago? Everyone's reading it.

Google News caches recently published articles. When millions of users try to read the same breaking news story, it's served from cache. No database query for each request.

### 2. Authentication Tokens

Every request to your backend needs authentication. The token is checked on every single request. If you hit the database for every token validation:

```text
1000 requests/second × 1 DB query each = 1000 DB queries/second
```

That's unnecessary load on your database. Instead, cache authentication tokens:

```typescript
async function validateToken(token: string): Promise<User | null> {
  const cacheKey = `auth:${token}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const user = await db.getUserByToken(token);
  if (user) {
    await redis.set(cacheKey, JSON.stringify(user), "EX", 900);
  }

  return user;
}
```

When a user is online, they're making requests constantly. Their token is accessed repeatedly. Caching it reduces database load dramatically.

### 3. Live Streaming

When streaming a cricket match or football game, users are watching the most recent part of the stream. Maybe they rewind 10 minutes to see a replay. Nobody's going back 2 hours.

The last 10-15 minutes of the stream is cached on CDN edge servers. When millions of viewers request the same segment, it's served from the nearest CDN node, not the origin server.

```text
Origin Server (far) → CDN Edge (near) → User

* Most recent segments cached at edge
* Older segments fetched from origin on demand
```

## Popular Caching Solutions

### Redis

![Redis is the most popular caching solution today](https://pulkit.blog/assets/content/blogs/caching/redis.webp)

Redis is the most popular caching solution today. It's an in-memory data store that supports:

- Key-value storage
- Data structures (lists, sets, sorted sets, hashes)
- TTL (time-to-live) for automatic expiration
- Pub/sub messaging
- Atomic operations

```typescript
import Redis from "ioredis";

const redis = new Redis({
  host: "localhost",
  port: 6379,
});

await redis.set("user:abc", JSON.stringify(user), "EX", 3600);

const user = await redis.get("user:abc");

await redis.del("user:abc");

await redis.hset("profile:abc", {
  name: "Alex",
  email: "alex@example.com",
});

await redis.lpush("notifications:abc", JSON.stringify(notification));
```

### Memcached

![Memcached is simpler than Redis. It's a pure key-value store without the advanced data structures. It's lightweight and fast, good for simple caching needs](https://pulkit.blog/assets/content/blogs/caching/memcached.webp)

Memcached is simpler than Redis. It's a pure key-value store without the advanced data structures. It's lightweight and fast, good for simple caching needs.

| Feature         | Redis                             | Memcached          |
| --------------- | --------------------------------- | ------------------ |
| Data structures | Lists, sets, hashes, sorted sets  | Key-value only     |
| Persistence     | Optional disk persistence         | Memory only        |
| Replication     | Built-in                          | External solutions |
| Complexity      | More features                     | Simpler            |
| Use case        | General caching, sessions, queues | Simple caching     |

## When Should You Use Caching?

Cache when you see a pattern of frequent access to the same data:

| Scenario                       | Cache? | Why                         |
| ------------------------------ | ------ | --------------------------- |
| User profiles                  | ✅      | Accessed on every page load |
| Authentication tokens          | ✅      | Checked on every request    |
| Recent posts/tweets            | ✅      | Hot content, many reads     |
| Search results                 | ✅      | Same searches repeat        |
| Database aggregations          | ✅      | Expensive to compute        |
| One-time reports               | ❌      | Accessed once, then never   |
| Real-time sensor data          | ❌      | Changes constantly          |
| User-specific, rarely accessed | ❌      | Low hit rate                |

Don't add a cache just because you can. Caching adds complexity:

- Cache invalidation (when to update/delete cached data)
- Cache consistency (cache vs database can get out of sync)
- Additional infrastructure to maintain

Add caching when you've identified a clear pattern of repeated expensive operations.

## Populating the Cache

![Populating the cache](https://pulkit.blog/assets/content/blogs/caching/populating-cache.webp)

Cache typically sits between your API server and your database. Logically, that's where it belongs. When a request comes in, the API server checks the cache first. If the data exists, return it. If not, query the database, store the result in cache, then return to the user.

But how does data get into the cache in the first place? There are two main approaches: **lazy population** and **eager population**.

### Lazy Population (Most Common)

![Lazy population means you don't proactively push data into the cache. Instead, you let requests come in, experience cache misses, and then populate the cache.](https://pulkit.blog/assets/content/blogs/caching/lazy-update.webp)

Lazy population means you don't proactively push data into the cache. Instead, you let requests come in, experience cache misses, and then populate the cache.

```typescript
async function getBlog(blogId: string): Promise<Blog> {
  const cacheKey = `blog:${blogId}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const blog = await db.query(
    `
    SELECT b.*, a.name as author_name, array_agg(t.name) as tags
    FROM blogs b
    JOIN authors a ON b.author_id = a.id
    JOIN blog_tags bt ON b.id = bt.blog_id
    JOIN tags t ON bt.tag_id = t.id
    WHERE b.id = $1
    GROUP BY b.id, a.name
  `,
    [blogId],
  );

  await redis.set(cacheKey, JSON.stringify(blog), "EX", 1800);

  return blog;
}
```

The first request for a blog hits the database (cache miss). Subsequent requests get served from cache (cache hit). Simple.

**Why "lazy"?** Because you're not proactively pushing data. Your cache only contains data for which a request actually came in.

**Always set an expiry.** This is critical. When you set something in the cache, always set a TTL (time-to-live). If you don't:

- Keys stay forever
- Your cache fills up
- Classic memory leak

```typescript
await redis.set(key, value, "EX", 300);

await redis.set(key, value);
```

Once the TTL expires, the key is automatically deleted. This ensures your cache only contains relevant, recently-accessed data.

### Eager Population

![Eager population](https://pulkit.blog/assets/content/blogs/caching/eager-update.webp)

Sometimes lazy population isn't enough. You know certain data will be accessed heavily, so you proactively push it to the cache. This is eager population.

There are two approaches:

#### 1. Write to Both Database and Cache

When you write to your database, you also write to your cache in the same request.

**Example: Live Cricket Scores**

Imagine you're building Cricinfo or Cricbuzz. During a live match, thousands of users are reading the score. With lazy population:

1. Score gets updated in MySQL
2. Cache still has old score (hasn't expired yet)
3. Users see stale data until cache expires
4. Then cache miss → fetch new score → update cache

That's a poor experience. The score changed, but users are waiting for cache expiry.

With eager population:

```typescript
async function updateScore(matchId: string, newScore: Score): Promise<void> {
  await db.query("UPDATE matches SET score = $1 WHERE id = $2", [
    newScore,
    matchId,
  ]);

  await redis.set(`match:${matchId}`, JSON.stringify(newScore), "EX", 3600);
}
```

When the commentator updates the score, it goes to both database and cache simultaneously. The next read request gets the updated score immediately. No waiting for expiry.

```text
Commentator updates score
         │
         ▼
    ┌─────────┐
    │   API   │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ MySQL │ │ Redis │
└───────┘ └───────┘

* Both updated in the same request
* Next read gets fresh data from cache
```

#### 2. Proactively Push Anticipated Data

Sometimes you know data will be accessed before anyone requests it. You proactively cache it.

**Example: Celebrity Tweets**

When someone with 100,000 followers posts a tweet, that tweet is going to be read by a lot of people very soon. Instead of waiting for the first request (which would be a cache miss), you proactively push it to cache.

```typescript
async function createTweet(userId: string, content: string): Promise<Tweet> {
  const tweet = await db.createTweet(userId, content);

  const user = await db.getUser(userId);

  if (user.followerCount > 50000) {
    await redis.set(`tweet:${tweet.id}`, JSON.stringify(tweet), "EX", 3600);
  }

  return tweet;
}
```

The tweet is in the cache before anyone even requests it. First request? Cache hit. No miss penalty for viral content.

**Example: YouTube Recommendations**

YouTube's recommendation engine decides which videos to show on users' home feeds. These videos are about to get a surge of traffic. Even if the video is two years old, if the recommendation engine is pushing it to millions of users, YouTube can proactively cache that video's metadata.

```typescript
async function addToRecommendationFeed(
  videoId: string,
  userIds: string[],
): Promise<void> {
  if (userIds.length > 10000) {
    const videoMetadata = await db.getVideoMetadata(videoId);
    await redis.set(
      `video:${videoId}`,
      JSON.stringify(videoMetadata),
      "EX",
      7200,
    );
  }

  await recommendationService.pushToFeeds(videoId, userIds);
}
```

The video was published years ago (cold data), but it's about to become hot. Proactive caching saves thousands of cache misses.

### Lazy vs Eager: When to Use Which

| Approach               | When to Use                                 | Example                        |
| ---------------------- | ------------------------------------------- | ------------------------------ |
| Lazy population        | General case, unpredictable access patterns | Blog posts, user profiles      |
| Eager (write-through)  | Data changes frequently and must be fresh   | Live scores, stock prices      |
| Eager (proactive push) | You can predict what will be accessed       | Viral content, recommendations |

Most applications use lazy population for 90% of their caching. Eager population is for specific high-traffic, time-sensitive scenarios.

## Scaling the Cache

![Scaling the cache](https://pulkit.blog/assets/content/blogs/caching/scaling.webp)

Cache is just a faster database. The scaling techniques are identical to how you'd scale any database. I wrote about scaling databases in depth here as well -> "[Before You Scale](https://pulkit.blog/system-design/understanding-database-scaling-sharding.md#before-you-scale)".

### Vertical Scaling

The simplest approach: make your cache server bigger.

- More RAM → cache more data
- More CPU → handle more operations
- Faster network → lower latency

This works until you hit hardware limits. A single Redis instance can handle a lot, but eventually you need more.

### Horizontal Scaling: Read Replicas

When your cache is read-heavy (most caches are), add read replicas.

```text
              ┌─────────────┐
              │   Master    │ ← All writes
              └──────┬──────┘
                     │
           ┌─────────┼─────────┐
           │         │         │
           ▼         ▼         ▼
      ┌─────────┐┌─────────┐┌─────────┐
      │ Replica ││ Replica ││ Replica │ ← Reads distributed
      └─────────┘└─────────┘└─────────┘
```

- Writes go to master
- Reads are distributed across replicas
- Same data replicated across all nodes
- API server knows addresses of all nodes and routes accordingly

This scales reads. If one replica can handle 100k reads/second, three replicas can handle 300k reads/second.

### Horizontal Scaling: Sharding

When you have too much data for a single node, shard your cache.

```text
                    ┌─────────┐
                    │   API   │
                    └────┬────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           ▼             ▼             ▼
      ┌─────────┐   ┌─────────┐   ┌─────────┐
      │ Shard 1 │   │ Shard 2 │   │ Shard 3 │
      │  (A-I)  │   │  (J-R)  │   │  (S-Z)  │
      └─────────┘   └─────────┘   └─────────┘
```

- Data is partitioned across multiple cache nodes
- Each shard holds a mutually exclusive subset of data
- API server routes requests to the correct shard (hash-based or range-based)
- Each shard can have its own replicas

```typescript
function getShardForKey(key: string): Redis {
  const hash = hashFunction(key);
  const shardIndex = hash % shards.length;
  return shards[shardIndex];
}

async function get(key: string): Promise<string | null> {
  const shard = getShardForKey(key);
  return shard.get(key);
}

async function set(key: string, value: string, ttl: number): Promise<void> {
  const shard = getShardForKey(key);
  await shard.set(key, value, "EX", ttl);
}
```

### Scaling Summary

| Stage         | Technique           | When to Use                        |
| ------------- | ------------------- | ---------------------------------- |
| Start         | Single node         | Low traffic, small dataset         |
| More reads    | Read replicas       | Read-heavy workload                |
| More data     | Sharding            | Dataset doesn't fit in single node |
| Maximum scale | Sharding + replicas | High traffic + large dataset       |

The scaling techniques for caches are identical to databases because caches are just faster databases. Everything you learned about database scaling applies here.

## Caching at Different Levels

![Caching at different levels](https://pulkit.blog/assets/content/blogs/caching/caching-at-different-levels.webp)

Redis is the most common cache, but it's not the only place where you can cache. Literally every component in your infrastructure can cache something. The question is: should it?

### The Staleness and Invalidation Problem

Before we dive into different caching layers, a warning: **caching comes with staleness**.

When you cache something, until that key expires, you're serving potentially stale data. The actual value in your database might have changed, but you're still returning the cached version.

Some data cannot be cached:

```typescript
async function getAccountBalance(accountId: string): Promise<number> {
  return db.query("SELECT balance FROM accounts WHERE id = $1", [accountId]);
}
```

Bank account balances, financial summaries, real-time inventory - these need the most recent, consistent data. Your friend sends you money, you open your banking app, and if it shows the old balance from cache? That's a terrible experience.

**Invalidation** is the other challenge. When data changes, you need to update or delete the cached version. If you cache at multiple layers, you need to invalidate at multiple layers. That's a lot of coordination.

### Client-Side Caching

![Client-side caching](https://pulkit.blog/assets/content/blogs/caching/client-side-cache.webp)

The closest cache to the user is on the user's device itself: browser storage, mobile app storage.

**What to cache on the client:**

- **Images**: Your browser automatically caches images. Website logos, icons, photos - once loaded, they're served from local cache
- **JavaScript bundles**: Why fetch the same JS files on every page load? Cache them locally
- **User preferences**: Theme settings, language preferences, basic profile info
- **Recent activity**: Amazon Prime Video caches your watch progress in the browser. When you reopen the app, it shows where you left off

```typescript
const CACHE_KEY = "user_preferences";

function getUserPreferences(): UserPreferences {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }
  return DEFAULT_PREFERENCES;
}

function saveUserPreferences(prefs: UserPreferences): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(prefs));
}
```

**The massive benefit**: No network request at all. Data is served instantly from the device. This is the fastest possible cache.

**The tradeoff**: If you're watching a video on your phone and switch to your laptop, the laptop shows different watch progress. Client-side caches aren't synced across devices.

### Content Delivery Networks (CDN)

![Content Delivery Networks](https://pulkit.blog/assets/content/blogs/caching/cdn.webp)

CDNs are geographically distributed caching servers. They're designed to serve static content (images, videos, JS bundles) from a location close to the user.

**The problem CDNs solve:**

Let's say your servers are in India. A user in the US makes a request:

```text
US User → Atlantic Ocean → India Server → Atlantic Ocean → US User
```

That's a round trip across the globe. Latency is high.

With a CDN:

```text
US User → US CDN Server → Response
```

The CDN server in the US has a cached copy. No trans-Atlantic trip needed.

**How CDNs work:**

```text
User (India) ──→ Mumbai CDN ──→ (if miss) ──→ Origin Server (Sydney)
                     │                              │
                     │◄─────── cache response ──────┘
                     │
                     └──→ Return to user
```

1. User's request goes to the **nearest CDN server** (automatic, that's the magic of CDNs)
2. If CDN has the data → serve immediately
3. If CDN doesn't have the data → request from **origin server**
4. Origin server responds, CDN caches it, then returns to user
5. Subsequent requests from that region are served from CDN

**CDNs use lazy population.** You don't proactively push to every CDN node worldwide. The first request from a region populates that region's cache.

```typescript
const CDN_BASE = "https://cdn.example.com";

function getImageUrl(imagePath: string): string {
  return `${CDN_BASE}/images/${imagePath}`;
}
```

**Popular CDNs**: Cloudflare, Akamai, AWS CloudFront, Fastly

Like any cache, CDN entries have TTL. After expiration, the next request goes to origin, refreshing the cache.

### Remote Cache (Redis)

![Remote cache](https://pulkit.blog/assets/content/blogs/caching/remote-cache.webp)

This is what we've been discussing throughout this article. A centralized cache accessible by all your API servers over the network.

**Characteristics:**

- Centralized (one cluster, multiple servers connect to it)
- Accessible over network (not local to any single server)
- Stores data in memory (fast)
- Shared across your entire infrastructure

```text
┌──────────┐     ┌──────────┐     ┌──────────┐
│ API 1    │     │ API 2    │     │ API 3    │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     └────────────────┼────────────────┘
                      │
                      ▼
               ┌─────────────┐
               │    Redis    │
               │   (Cache)   │
               └─────────────┘
                      │
                      ▼
               ┌─────────────┐
               │  Database   │
               └─────────────┘
```

All API servers share the same cache. User hits API Server 1, data gets cached. Next request hits API Server 2, cache hit - same data served.

**Remember:**

- Always set TTL on keys (memory leak otherwise)
- Cache size is tiny compared to database (be selective about what you cache)

### Database as Cache

Here's a less obvious form of caching: **storing pre-computed values in your database**.

**Example: Total posts count**

In a blogging app, you want to show how many posts a user has written on their profile. The straightforward approach:

```sql
SELECT COUNT(*) FROM posts WHERE user_id = abc;
```

This query runs every time someone views the profile. If the user has 10,000 posts, that's an expensive count operation every time.

**The caching approach:**

Add a `total_posts` column to the users table:

```sql
ALTER TABLE users ADD COLUMN total_posts INT DEFAULT 0;
```

Now, whenever a post is published:

```typescript
async function createPost(userId: string, content: string): Promise<Post> {
  return db.transaction(async (trx) => {
    const post = await trx("posts")
      .insert({ user_id: userId, content })
      .returning("*");

    await trx("users").where("id", userId).increment("total_posts", 1);

    return post[0];
  });
}
```

Both operations happen in the same transaction. The count is always accurate, and you never run that expensive `COUNT(*)` query.

```sql
-- Before: expensive
SELECT COUNT(*) FROM posts WHERE user_id = abc;

-- After: instant
SELECT total_posts FROM users WHERE id = abc;
```

This is caching. You're storing a pre-computed value to avoid an expensive computation. The "cache" just happens to be in your database.

### The Over-Caching Trap

Just because you can cache at every layer doesn't mean you should.

Imagine you cache data at:

1. Client-side (browser)
2. CDN
3. Load balancer
4. API server memory
5. Redis
6. Database (pre-computed columns)

Now the underlying data changes. To show fresh data, you need to invalidate:

1. Redis cache
2. Load balancer cache
3. CDN cache (every edge node worldwide)
4. API server local cache
5. Client-side cache (good luck with that)

That's a nightmare. Each layer adds:

- More staleness (data is older by the time it reaches the user)
- More invalidation complexity (more places to update/delete)
- More debugging difficulty (which layer has the stale data?)

**Pick your battles.** One or two well-chosen caching layers is usually enough. Don't cache at every layer just because you can.

| Layer        | Best For                          | Invalidation Difficulty |
| ------------ | --------------------------------- | ----------------------- |
| Client-side  | Static assets, user preferences   | Hard (user controls it) |
| CDN          | Static files, images, videos      | Medium (API available)  |
| Remote cache | Dynamic data, sessions, hot paths | Easy (you control it)   |
| Database     | Expensive aggregations            | Easy (same transaction) |

## Conclusion

Caching is about avoiding expensive operations by storing frequently accessed data somewhere faster. The key principles:

1. **Cache is a supplement**, not a replacement for your database
2. **Cache strategically** - only data that's likely to be accessed again
3. **Key-value access** - caches are simple hash tables
4. **"Near" is relative** - anything that helps avoid expensive operations is a cache
5. **Lazy population** works for most cases. Use eager population when you can predict access patterns
6. **Always set TTL** - keys without expiry are memory leaks
7. **Scale like a database** - vertical scaling, then replicas, then sharding
8. **Cache at the right level** - client, CDN, remote cache, or database depending on your use case
9. **Don't over-cache** - every layer adds staleness and invalidation complexity

When you see the same data being requested over and over, when you're making the same expensive database query repeatedly, when you're computing the same result multiple times - that's when caching shines. But remember: if you need consistent, real-time data, caching isn't the answer. Pick your battles, cache strategically, and your system will fly.

## Related writing

- [Bloom Filters](https://pulkit.blog/system-design/bloom-filters.md): January 24, 2026
- [Rate Limiting](https://pulkit.blog/system-design/rate-limiting.md): April 11, 2026
- [Message Queues vs Streams: SQS, RabbitMQ, Kafka, Pub/Sub](https://pulkit.blog/system-design/async-processing.md): January 10, 2026
