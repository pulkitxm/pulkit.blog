# Bloom Filters

> Learn how Bloom filters work: a probabilistic data structure that tells you with 100% certainty when something doesn't exist. Understand hash functions, bit arrays, false positives, and real-world use cases like recommendation engines and web crawlers.

- URL: https://pulkit.blog/system-design/bloom-filters/
- Published: January 24, 2026
- Tags: System Design, Data Structures, Bloom Filters, Probabilistic, Redis
- Part of: [System Design](https://pulkit.blog/system-design.md)

Instagram wants to recommend reels to you. But does it make sense to recommend a reel you've already watched? No. You'd see the exact same video you saw an hour ago. That's a terrible experience.

So whenever Instagram recommends something, it needs to ensure you're seeing something new. Not something you've already watched. But how do you efficiently check if a user has seen a particular reel among millions of reels they've watched over months?

This is exactly where Bloom filters shine.

## TL;DR

- **Bloom filters** are probabilistic data structures that tell you with 100% certainty when something does NOT exist
- **When it says no**: The element is definitely not in the set. Guaranteed
- **When it says yes**: The element might be present. You need to verify
- **How it works**: Hash the key, set bits in a bit array, check bits for existence
- **Space efficient**: Stores existence of thousands of items in a tiny bit array (no actual keys stored)
- **False positives**: Bloom filter can say "yes" when the element isn't there. This rate increases as you add more keys
- **No deletions**: Once you add something, you can't remove it (bits are shared)
- **Sizing matters**: Pick the right size based on expected keys and acceptable false positive rate
- **Real-world uses**: Recommendation engines, web crawlers, feed generation, Tinder, Medium
- **Redis support**: Redis offers Bloom filters as a native data structure. Use it

## The Problem

Let's say you're building Instagram's recommendation engine. You need to track everything a user has watched so you don't recommend it again.

The naive approach? Store everything in a set:

```typescript
const watchedPosts = new Set<string>();

watchedPosts.add("post_1");
watchedPosts.add("post_9");
watchedPosts.add("post_7");
watchedPosts.add("post_1024");

function hasUserWatched(postId: string): boolean {
  return watchedPosts.has(postId);
}
```

This works. But think about the scale. People watch hundreds of reels every single day. Over months, the set of all posts watched by a user becomes massive.

To check if a key exists in a set implemented as a hash table or binary search tree, you have to load the entire set into memory. When millions of users watch thousands of reels daily, the memory and compute required becomes prohibitively expensive.

Can we do better?

## The Key Insight

Here's a crucial observation: once someone has watched a reel, they can't "unwatch" it. The view is registered. It's done.

In a normal set, you can add and remove elements. But for tracking watched content, we only ever add. We never remove.

This constraint lets us relax the data structure. We don't need the full power of a set. We just need to know: "Has this user definitely NOT seen this post?"

If we can answer that question with 100% certainty, we can discard posts the user has seen and only recommend new ones. Even if we occasionally miss recommending something (false positive[^1]), that's okay. Performance matters more than perfect recall.

This trade-off is the foundation of Bloom filters.

## What is a Bloom Filter?

A Bloom filter is a probabilistic data structure. It can tell you with 100% certainty that an element does NOT belong to a set. But when it says an element IS present, it might be wrong.

The word "filter" in Bloom filter refers to a **bit array**. Not a byte array. An array of individual bits. Each bit is either 0 or 1.

The name comes from Burton Howard Bloom, who invented it in 1970.

### How It Works

Let's walk through a simple example. Say we have an 8-bit Bloom filter:

```text
Index:  0   1   2   3   4   5   6   7
Bits:  [0] [0] [0] [0] [0] [0] [0] [0]
```

We want to store the existence of words: "apple", "ball", and "cat".

**Adding "apple":**

1. Pass "apple" through a hash function
2. Take the result modulo 8 (our filter size)
3. Let's say we get 2
4. Set bit at index 2 to 1

```text
Index:  0   1   2   3   4   5   6   7
Bits:  [0] [0] [1] [0] [0] [0] [0] [0]
                ↑
              apple
```

**Adding "ball":**

1. Hash "ball", mod 8
2. Let's say we get 6
3. Set bit at index 6 to 1

```text
Index:  0   1   2   3   4   5   6   7
Bits:  [0] [0] [1] [0] [0] [0] [1] [0]
                ↑               ↑
              apple            ball
```

**Adding "cat":**

1. Hash "cat", mod 8
2. Let's say we get 2 (same as apple!)
3. Set bit at index 2 to 1 (already 1, no change)

```text
Index:  0   1   2   3   4   5   6   7
Bits:  [0] [0] [1] [0] [0] [0] [1] [0]
                ↑               ↑
             apple/cat         ball
```

Notice that "apple" and "cat" hash to the same index. This is called a **collision**, and it's expected. We're compressing arbitrary data into a tiny bit array.

### Checking for Existence

Now let's check if some words exist:

**Does "dog" exist?**

1. Hash "dog", mod 8
2. Let's say we get 5
3. Check bit at index 5 → it's 0
4. **Definitely NOT present**

```text
Index:  0   1   2   3   4   5   6   7
Bits:  [0] [0] [1] [0] [0] [0] [1] [0]
                            ↑
                    dog → 0 = NOT PRESENT ✓
```

The Bloom filter says no. We can be 100% certain that "dog" was never added.

**Does "elephant" exist?**

1. Hash "elephant", mod 8
2. Let's say we get 6
3. Check bit at index 6 → it's 1
4. **Might be present** (false positive!)

```text
Index:  0   1   2   3   4   5   6   7
Bits:  [0] [0] [1] [0] [0] [0] [1] [0]
                                ↑
                  elephant → 1 = MAYBE PRESENT?
```

We never added "elephant". But it hashes to the same index as "ball". The Bloom filter incorrectly says it might be present. This is a **false positive**.

## The Golden Rule

**When Bloom filter says NO → Element is definitely NOT present (100% certain)**

**When Bloom filter says YES → Element MIGHT be present (need to verify)**

This asymmetry is what makes Bloom filters useful. For recommendation engines, we care about the "no" case. If the Bloom filter says a user hasn't seen a post, we can confidently recommend it.

## Space Efficiency

Let's compare the space used:

**Storing actual words:**

- "apple" = 5 bytes
- "ball" = 4 bytes
- "cat" = 3 bytes
- Total = 12 bytes (plus overhead for the set data structure)

**Bloom filter:**

- 8 bits = 1 byte

We stored the existence of 3 words in just 1 byte. That's a massive space saving.

In practice, you'd use larger Bloom filters (1 KB, 10 KB, etc.) to reduce false positive rates. But even then, the space savings are significant. A 10 KB Bloom filter can track millions of items.

This is because **Bloom filters don't store the actual keys**. They only store existence information compressed into a bit array. You can't retrieve the original keys from a Bloom filter. You can only ask "is this key present?"

## False Positive Rate

As you add more keys to a Bloom filter, more bits get set to 1. Eventually, most bits are 1. At that point, almost any query returns "might be present."

```text
Empty:     [0][0][0][0][0][0][0][0]  → Low false positive rate
Some keys: [0][1][1][0][1][0][1][0]  → Medium false positive rate
Many keys: [1][1][1][1][1][1][1][1]  → Everything says "present"!
```

The false positive rate increases as:

- More keys are added
- The Bloom filter size stays the same

This is the fundamental trade-off. You need to size your Bloom filter based on:

1. Expected number of keys
2. Acceptable false positive rate

There's a mathematical formula for this:

$$
m = \frac{-n \cdot \ln(p)}{(\ln 2)^2}
$$

Where:

- $m$ = number of bits needed
- $n$ = expected number of elements
- $p$ = desired false positive probability

For example, if you expect 1 million keys and want a 1% false positive rate:

$$
m = \frac{-1,000,000 \cdot \ln(0.01)}{(\ln 2)^2} \approx 9,585,059 \text{ bits} \approx 1.14 \text{ MB}
$$

About 1 MB to track a million items with 1% false positives. Not bad.

## Multiple Hash Functions

Real Bloom filters use multiple hash functions, not just one. Each key is hashed by k different functions, and k bits are set.

```typescript
function addToBloomFilter(key: string): void {
  const hash1 = murmurhash(key) % filterSize;
  const hash2 = sha256(key) % filterSize;
  const hash3 = fnv1a(key) % filterSize;

  bitArray[hash1] = 1;
  bitArray[hash2] = 1;
  bitArray[hash3] = 1;
}

function mightExist(key: string): boolean {
  const hash1 = murmurhash(key) % filterSize;
  const hash2 = sha256(key) % filterSize;
  const hash3 = fnv1a(key) % filterSize;

  return (
    bitArray[hash1] === 1 && bitArray[hash2] === 1 && bitArray[hash3] === 1
  );
}
```

With multiple hash functions, all k bits must be set for a "might exist" response. This reduces false positives because it's less likely that all k bits were coincidentally set by other keys.

The optimal number of hash functions is:

$$
k = \frac{m}{n} \cdot \ln 2
$$

Where:

- $k$ = number of hash functions
- $m$ = number of bits
- $n$ = expected number of elements

## The Deletion Problem

You cannot delete from a standard Bloom filter.

Why? Because bits are shared. If "apple" and "cat" both hash to index 2, you can't unset that bit when removing "apple" it would incorrectly indicate "cat" isn't present.

```text
Before: [0][0][1][0][0][0][1][0]  → apple and cat both at index 2

If we "remove" apple by unsetting bit 2:
After:  [0][0][0][0][0][0][1][0]  → Now "cat" appears not present!
```

This is why Bloom filters work best for append-only use cases:

- Tracking watched content
- Caching negative lookups
- Checking if URL was crawled

If you need deletions, look into **Counting Bloom Filters** or **Cuckoo Filters** (alternatives that support removal).

## Scaling a Bloom Filter

What happens when your Bloom filter fills up and false positives become unacceptable?

**You cannot resize a Bloom filter in place.**

The hash function results depend on the filter size (mod operation). If you change the size, all the mappings change.

Your options:

1. **Recreate with larger size**: Create a new, larger Bloom filter. Go back to your source of truth (database), iterate through all keys, and re-insert them into the new filter.

2. **Start big**: Estimate the maximum keys you'll need and provision a large enough filter from the start. This is the recommended approach.

```typescript
interface BloomFilterConfig {
  expectedElements: number;
  falsePositiveRate: number;
}

function calculateOptimalSize(config: BloomFilterConfig): number {
  const { expectedElements, falsePositiveRate } = config;
  const bits = Math.ceil(
    (-expectedElements * Math.log(falsePositiveRate)) /
      Math.pow(Math.log(2), 2),
  );
  return bits;
}

const config: BloomFilterConfig = {
  expectedElements: 10_000_000,
  falsePositiveRate: 0.01,
};

const filterSize = calculateOptimalSize(config);
```

## Bloom Filters with Redis

You don't need to implement Bloom filters from scratch. Redis offers them as a native data structure through the [RedisBloom](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter) module.

Here's how you use it via Redis CLI:

```bash
# Create a Bloom filter named "watched_posts"
# 0.01 = 1% false positive rate
# 1000000 = expected capacity of 1 million items
BF.RESERVE watched_posts 0.01 1000000

# Add items to the filter
BF.ADD watched_posts post_123
BF.ADD watched_posts post_456

# Check if an item exists
BF.EXISTS watched_posts post_123  # Returns 1 (might exist)
BF.EXISTS watched_posts post_789  # Returns 0 (definitely not)

# Add multiple items at once
BF.MADD watched_posts post_1 post_2 post_3
```

| Command                               | What it does                                                               |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `BF.RESERVE name error_rate capacity` | Creates a new Bloom filter with specified false positive rate and capacity |
| `BF.ADD name item`                    | Adds an item to the filter                                                 |
| `BF.EXISTS name item`                 | Checks if item might exist (1) or definitely doesn't (0)                   |
| `BF.MADD name item1 item2 ...`        | Adds multiple items in one call                                            |

In TypeScript with ioredis:

```typescript
import Redis from "ioredis";

const redis = new Redis();

async function markAsWatched(userId: string, postId: string): Promise<void> {
  await redis.call("BF.ADD", `watched:${userId}`, postId);
}

async function hasUserWatched(
  userId: string,
  postId: string,
): Promise<boolean> {
  const result = await redis.call("BF.EXISTS", `watched:${userId}`, postId);
  return result === 1;
}

async function recommendPost(userId: string, postId: string): Promise<boolean> {
  const mightHaveWatched = await hasUserWatched(userId, postId);

  if (!mightHaveWatched) {
    return true;
  }

  return false;
}
```

When creating a Bloom filter in Redis, you specify:

- **Error rate**: The desired false positive rate (e.g., 0.01 for 1%)
- **Capacity**: Expected number of elements

Redis handles the optimal sizing internally.

## Real-World Use Cases

### Recommendation Engines

Track what users have seen. Only recommend content they definitely haven't consumed.

```text
User requests feed
    ↓
Generate candidate posts
    ↓
For each candidate:
    Check Bloom filter → "Definitely not seen?"
        Yes → Include in feed
        No  → Skip (might have seen)
    ↓
Return filtered feed
```

Medium uses Bloom filters for article recommendations. For every article you read, it's added to your Bloom filter. The recommendation engine only suggests articles that pass the "definitely not read" check.

### Web Crawlers

Track which URLs have already been crawled. Don't waste resources re-crawling.

```typescript
async function crawl(startUrl: string): Promise<void> {
  const queue = [startUrl];

  while (queue.length > 0) {
    const url = queue.shift()!;

    const alreadyCrawled = await redis.call("BF.EXISTS", "crawled_urls", url);
    if (alreadyCrawled) {
      continue;
    }

    const html = await fetch(url);
    await processPage(html);

    await redis.call("BF.ADD", "crawled_urls", url);

    const links = extractLinks(html);
    queue.push(...links);
  }
}
```

### Database Query Optimization

Check if a key might exist before hitting the database. If the Bloom filter says no, skip the database query entirely.

```typescript
async function getUser(userId: string): Promise<User | null> {
  const mightExist = await redis.call("BF.EXISTS", "user_ids", userId);

  if (!mightExist) {
    return null;
  }

  return await db.query("SELECT * FROM users WHERE id = $1", [userId]);
}
```

This is particularly useful for negative lookups. If most queries are for non-existent keys, Bloom filters save massive database load.

### Tinder Feed

Don't show profiles you've already swiped on. Whether you swiped left or right, that profile shouldn't appear again.

```typescript
async function getNextProfiles(userId: string): Promise<Profile[]> {
  const candidates = await getCandidateProfiles(userId);

  const unseen = [];
  for (const profile of candidates) {
    const seen = await redis.call("BF.EXISTS", `swiped:${userId}`, profile.id);
    if (!seen) {
      unseen.push(profile);
    }
  }

  return unseen.slice(0, 10);
}

async function recordSwipe(userId: string, profileId: string): Promise<void> {
  await redis.call("BF.ADD", `swiped:${userId}`, profileId);
}
```

### Spell Checkers

Dictionary lookups. If a word is definitely not in the dictionary, it's misspelled.

### Cache Lookups

Before checking a distributed cache, check a local Bloom filter. If the key is definitely not cached, don't bother with the network request.

## When NOT to Use Bloom Filters

Bloom filters aren't always the answer:

| Use Case                | Bloom Filter? | Why                                            |
| ----------------------- | ------------- | ---------------------------------------------- |
| Need exact answers      | ❌             | False positives are unacceptable               |
| Need to delete items    | ❌             | Standard Bloom filters don't support deletion  |
| Small dataset           | ❌             | Just use a regular set                         |
| Need to retrieve values | ❌             | Bloom filters only store existence, not values |
| Financial transactions  | ❌             | Can't afford false positives                   |

If you can't tolerate false positives, Bloom filters aren't for you. For example, checking if a bank account exists before a transfer, a false positive could cause real problems.

## Hands-on Practice

I've created hands-on demos you can run locally, here: [bloom-filters](https://github.com/pulkitxm/systems/tree/main/data-structures/bloom-filters): TypeScript implementation of Bloom filters from scratch. Includes demos for basic usage, false positive rate visualization, and Redis integration.

## Conclusion

Bloom filters are elegant. They trade perfect accuracy for massive space and time efficiency.

| Aspect       | Bloom Filter             | Regular Set         |
| ------------ | ------------------------ | ------------------- |
| Space        | Tiny (bits)              | Large (stores keys) |
| "Not exists" | 100% accurate            | 100% accurate       |
| "Exists"     | May have false positives | 100% accurate       |
| Deletion     | Not supported            | Supported           |
| Lookup time  | O(k) hash functions      | O(1) to O(log n)    |

The key insight: **when Bloom filter says no, it's definitely no**. This makes them perfect for filtering out things you've seen before, URLs you've crawled, or keys that don't exist in your cache.

Use them when:

- You're okay with occasional false positives
- You need space efficiency
- You only add, never remove
- You need fast existence checks at scale

Redis makes it trivial to use Bloom filters in production. Create one with `BF.RESERVE`, add with `BF.ADD`, check with `BF.EXISTS`. That's it.

## Related writing

- [Caching](https://pulkit.blog/system-design/caching.md): January 8, 2026
- [Rate Limiting](https://pulkit.blog/system-design/rate-limiting.md): April 11, 2026
- [Message Queues vs Streams: SQS, RabbitMQ, Kafka, Pub/Sub](https://pulkit.blog/system-design/async-processing.md): January 10, 2026

[^1]: A false positive is when the Bloom filter says an element is present, but it actually isn't.
