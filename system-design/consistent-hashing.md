# Consistent Hashing

> Learn how consistent hashing solves the data ownership problem in distributed systems. Understand hash-based routing, the ring abstraction, and how to scale up and down with minimal data movement.

- URL: https://pulkit.blog/system-design/consistent-hashing/
- Published: January 24, 2026
- Tags: System Design, Distributed Systems, Consistent Hashing, Load Balancing
- Part of: [System Design](https://pulkit.blog/system-design.md)

Consistent hashing is one of the most popular algorithms in distributed systems. It helps you answer one question: **Who owns this data?**

That's it. Data ownership. Nothing else.

## TL;DR

- **Consistent hashing** solves the data ownership problem: which node owns which key?
- **Hash-based routing** works fine for stateless backends (load balancer + API servers)
- **The problem**: When nodes change in a stateful system, hash-based routing causes massive data movement
- **Consistent hashing solution**: Minimize data movement when nodes are added or removed
- **The k/n rule**: On average, only k/n keys migrate during scaling (k = total keys, n = nodes)
- **Ring abstraction**: Visually a ring, but implemented as a simple sorted array with binary search
- **Scale up**: Only keys between the new node and its left neighbor need to move
- **Scale down**: Only keys from the removed node move to its right neighbor
- **Simple implementation**: A sorted array and binary search
- **Real-world use**: DynamoDB, Cassandra, BitTorrent, Akamai, distributed caches

## Hash-Based Routing

Before we understand consistent hashing, let's see why we need it.

Say we have a load balancer with three backend servers. When a user request comes in, how does the load balancer decide which server to forward it to?

One popular approach: **hash-based routing**.

![Hash-based routing uses a hash function to determine which server handles each request](https://pulkit.blog/assets/content/blogs/consistent-hashing/hash-based-routing.webp)

```typescript
function routeRequest(userId: string, serverCount: number): number {
  const hash = sha256(userId);
  const serverIndex = hash % serverCount;
  return serverIndex;
}

const server = routeRequest("user_123", 3);
```

You take the user ID (or request ID, or IP address), pass it through a hash function like SHA-256 or SHA-128, take the modulo by the number of servers, and you get a server index: 0, 1, or 2.

When a request comes in, the load balancer extracts the user information, passes it through the hash function, gets the value, does the mod, and forwards the request.

### Server Failure

Let's say you're overprovisioned. Traffic dropped, so you want to remove one server. What happens?

The hash function changes from `mod 3` to `mod 2`.

```typescript
const server = routeRequest("user_123", 2);
```

The next request that comes in gets routed correctly. No problem.

Why? Because the **backend servers are stateless**. Every server is equally capable of handling any request. It doesn't matter which server the request goes to, they all can handle it.

This is why hash-based routing is one of the most common ways of routing for stateless backends. Load balancer + API servers. Round robin works too, but hash-based is more common.

## Stateful Backends

Now, what happens when we have something stateful? Like distributed storage?

Instead of stateless API servers, let's say you have storage nodes. A distributed key-value store. Given a key, store the value. Given a key, get the value.

```typescript
function getStorageNode(key: string, nodeCount: number): number {
  const hash = sha256(key);
  return hash % nodeCount;
}

await storeKey("k1", "value1", getStorageNode("k1", 3));
```

The proxy uses hash-based routing to route requests to the corresponding storage node.

Let's say we have 6 keys distributed across 3 nodes:

| Key | Hash % 3 | Node   |
| --- | -------- | ------ |
| k1  | 2        | node 2 |
| k2  | 0        | node 0 |
| k3  | 1        | node 1 |
| k4  | 2        | node 2 |
| k5  | 1        | node 1 |
| k6  | 0        | node 0 |

Now node 0 owns k2 and k6. Node 1 owns k3 and k5. Node 2 owns k1 and k4.

The proxy knows: all requests for k3 and k5 always go to node 1. All requests for k1 and k4 always go to node 2. **Statefulness maintained.**

But what if you need to remove node 2?

### Rehashing Problem

When you remove a node, your hash function changes from `mod 3` to `mod 2`. Suddenly, the mapping changes dramatically.

Let's recalculate:

| Key | Old (% 3) | New (% 2) | Moved? |
| --- | --------- | --------- | ------ |
| k1  | 2         | 0         | Yes    |
| k2  | 0         | 1         | Yes    |
| k3  | 1         | 1         | No     |
| k4  | 2         | 0         | Yes    |
| k5  | 1         | 0         | Yes    |
| k6  | 0         | 0         | No     |

**Four out of six keys need to move.** That's 67% data movement!

![The rehashing problem causes massive data movement when nodes change](https://pulkit.blog/assets/content/blogs/consistent-hashing/rehashing-problem.webp)

With millions or billions of keys, this is a massive amount of data transfer. Before you can serve requests from the new configuration, you have to:

1. Calculate new ownership for every key
2. Move data between nodes
3. Wait for the entire rebalancing to complete

This is the fundamental limitation of hash-based routing. You've given your power to a hash function. When the hash function changes (because node count changes), your entire mapping changes.

**Can we minimize data movement?**

This is where consistent hashing comes in.

## Consistent Hashing

Just like hash-based routing helps determine ownership (which node owns which key), consistent hashing also answers the same question. But it does so in a way that **minimizes data movement** when nodes are added or removed.

The core concept was introduced in a 1997 MIT paper [Consistent Hashing and Random Trees](https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf), but it gained mainstream popularity after Amazon's famous [DynamoDB paper](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) in 2007. Since then, consistent hashing has become foundational in distributed systems. [**BitTorrent**](https://www.bittorrent.com) uses it for peer-to-peer networks, [**Akamai**](https://www.akamai.com) uses it for web caches, and countless databases use it for data partitioning.

### Ring Abstraction

A popular way to visualize consistent hashing is as a ring. Let's use SHA-128 as our hash function. It generates a 128-bit number, so our range is 0 to $2^{128} - 1$.

For simplicity, let's use a smaller range: 0 to 15 (0 to $2^4 - 1$).

![Consistent hashing ring with nodes placed at hash positions, keys owned by next clockwise node](https://pulkit.blog/assets/content/blogs/consistent-hashing/ring.webp)

**Step 1: Place nodes on the ring**

Each storage node occupies a slot in the ring. How? Pass the node's identifier (IP address, hostname, etc.) through the hash function.

```typescript
const node0Slot = sha128("node0_ip") % 16;
const node1Slot = sha128("node1_ip") % 16;
const node2Slot = sha128("node2_ip") % 16;
```

Let's say:

- node 0 hashes to slot 3
- node 1 hashes to slot 12
- node 2 hashes to slot 8

```text
        0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15
Ring:  [ ] [ ] [ ] [0] [ ] [ ] [ ] [ ] [2] [ ] [ ] [ ] [1] [ ] [ ] [ ]
                    ↑                   ↑               ↑
                  node0               node2           node1
```

**Step 2: Determine key ownership**

To find which node owns a key:

1. Hash the key
2. Find the first node clockwise from that position

```typescript
function getOwner(key: string): Node {
  const slot = sha128(key) % 16;
  return findNextNodeClockwise(slot);
}
```

Let's say key k1 hashes to slot 0. The first node clockwise is node 0 at slot 3. So **node 0 owns k1**.

Let's say key k2 hashes to slot 10. The first node clockwise is node 1 at slot 12. So **node 1 owns k2**.

This beautifully answers the question: who owns a particular key?

The key insight: **the hash space is huge and constant** (typically $2^{128}$ or $2^{256}$). Both nodes and keys map to this same space. The hash function no longer depends on the number of nodes, it's always `hash(key) % HUGE_CONSTANT`. Only the association logic (find next clockwise node) changes when nodes are added or removed.

> **The k/n Rule**: On average, consistent hashing requires only **k/n** keys to be migrated during scale-up or scale-down, where k is the total number of keys and n is the number of nodes. Compare this to traditional hashing where nearly all keys might need to move.

### Array Implementation

The ring looks like a ring, but you don't implement a circular linked list. That would be inefficient.

In reality, it's a **sorted array** with **binary search**.

```typescript
interface Node {
  id: string;
  slot: number;
}

const ring: Node[] = [
  { id: "node0", slot: 3 },
  { id: "node2", slot: 8 },
  { id: "node1", slot: 12 },
];

function getOwner(key: string): Node {
  const slot = sha128(key) % 16;

  for (let i = 0; i < ring.length; i++) {
    if (ring[i].slot >= slot) {
      return ring[i];
    }
  }

  return ring[0];
}
```

With binary search, finding the owner is O(log n) where n is the number of nodes. For 1000 nodes, that's about 10 comparisons.

The array stays sorted by slot position. One array. Binary search.

## Scaling Up

Now let's see how consistent hashing minimizes data movement.

![Adding a node only affects keys in a small range between the new node and its left neighbor](https://pulkit.blog/assets/content/blogs/consistent-hashing/scale-up.webp)

We have three nodes at slots 3, 8, and 12. Let's add a fourth node.

```typescript
const node3Slot = sha128("node3_ip") % 16;
```

Let's say node 3 hashes to slot 1.

```text
Before:
        0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15
Ring:  [ ] [ ] [ ] [0] [ ] [ ] [ ] [ ] [2] [ ] [ ] [ ] [1] [ ] [ ] [ ]

After:
        0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15
Ring:  [ ] [3] [ ] [0] [ ] [ ] [ ] [ ] [2] [ ] [ ] [ ] [1] [ ] [ ] [ ]
            ↑
         new node
```

**Which keys are affected?**

Only keys in the range (12, 1] , keys that hash to slots 13, 14, 15, 0, or 1.

Before node 3: These keys were owned by node 0 (the next clockwise node from their position).

After node 3: These keys are now owned by node 3.

**Everything else stays the same.** Keys owned by node 1 and node 2 don't move at all.

### Operations

How do you actually do this operationally?

1. You know node 3 is slotted at position 1
2. Find the node immediately to the right (clockwise): node 0 at slot 3
3. Keys that were going to node 0 (from the slot range 13-1) now go to node 3
4. Take a snapshot of node 0
5. Create node 3 using that snapshot
6. Add node 3 to the ring, start serving requests
7. Delete the keys from node 0 that now belong to node 3

You're not touching keys in other nodes. Just the node immediately to the right.

## Scaling Down

Similar process for removing a node.

Let's remove node 0 (at slot 3).

```text
Before:
        0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15
Ring:  [ ] [3] [ ] [0] [ ] [ ] [ ] [ ] [2] [ ] [ ] [ ] [1] [ ] [ ] [ ]

After:
        0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15
Ring:  [ ] [3] [ ] [ ] [ ] [ ] [ ] [ ] [2] [ ] [ ] [ ] [1] [ ] [ ] [ ]
                    ↑
               removed
```

**Which keys are affected?**

Keys that were owned by node 0 (slots 2-3). They now go to the next clockwise node: node 2 at slot 8.

**How to do it operationally:**

1. Copy all keys from node 0 to node 2
2. Remove node 0 from the ring
3. Done

You're literally copy-pasting everything from node 0 to node 2. No complex routing decisions. No partial key movement. Just dump and load.

This is why consistent hashing is so popular. It's **operationally simple**.

## Hash Function

A good hash function for consistent hashing has two properties:

1. **Computationally efficient**: Fast to compute, as it's called on every read and write
2. **Uniform distribution**: Spreads data evenly without noticeable correlation

SHA-256 is commonly used:

```typescript
import { createHash } from "crypto";

function hash(key: string, totalSlots: number): number {
  const hsh = createHash("sha256");
  hsh.update(key);
  const hexDigest = hsh.digest("hex");
  return parseInt(hexDigest, 16) % totalSlots;
}
```

The hash function converts any string to a position in the hash space. Since `totalSlots` is huge and constant (like $2^{128}$), this function is completely independent of the number of nodes in your system.

## Virtual Nodes

There's one problem with basic consistent hashing: uneven distribution.

If nodes hash to unevenly spaced slots, some nodes own much larger key ranges than others.

```text
        0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15
Ring:  [ ] [ ] [ ] [0] [ ] [1] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [2]
                    ↑   ↑                                           ↑
```

Node 0 owns slots 16, 0, 1, 2, 3 (5 slots). Node 1 owns slots 4, 5 (2 slots). Node 2 owns slots 6-15 (10 slots).

Node 2 handles 5x more keys than node 1!

The solution: **virtual nodes**.

Instead of placing each physical node once on the ring, place it multiple times.

```typescript
function addNodeToRing(nodeId: string, virtualNodes: number): void {
  for (let i = 0; i < virtualNodes; i++) {
    const virtualId = `${nodeId}_${i}`;
    const slot = sha128(virtualId) % RING_SIZE;
    ring.push({ id: nodeId, slot });
  }
  ring.sort((a, b) => a.slot - b.slot);
}

addNodeToRing("node0", 100);
addNodeToRing("node1", 100);
addNodeToRing("node2", 100);
```

With 100 virtual nodes per physical node, the distribution becomes much more even. Each physical node owns roughly 1/3 of the key space.

## Implementation

Here's a complete, minimal implementation:

```typescript
interface ConsistentHash {
  ring: { slot: number; nodeId: string }[];
  ringSize: number;
}

function createRing(ringSize: number): ConsistentHash {
  return { ring: [], ringSize };
}

function addNode(
  ch: ConsistentHash,
  nodeId: string,
  virtualNodes: number = 100,
): void {
  for (let i = 0; i < virtualNodes; i++) {
    const slot = hash(`${nodeId}_${i}`) % ch.ringSize;
    ch.ring.push({ slot, nodeId });
  }
  ch.ring.sort((a, b) => a.slot - b.slot);
}

function removeNode(ch: ConsistentHash, nodeId: string): void {
  ch.ring = ch.ring.filter((n) => n.nodeId !== nodeId);
}

function getNode(ch: ConsistentHash, key: string): string {
  const slot = hash(key) % ch.ringSize;

  let left = 0;
  let right = ch.ring.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (ch.ring[mid].slot < slot) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  if (ch.ring[left].slot >= slot) {
    return ch.ring[left].nodeId;
  }

  return ch.ring[0].nodeId;
}
```

Usage:

```typescript
const ch = createRing(1_000_000);

addNode(ch, "192.168.1.1");
addNode(ch, "192.168.1.2");
addNode(ch, "192.168.1.3");

const owner = getNode(ch, "user_123");
```

One array. Binary search. That's it.

## Use Cases

### Distributed Databases

**DynamoDB**, **Cassandra**, and **Riak** all use consistent hashing to determine which node stores which data.

When you write a key to DynamoDB, it:

1. Hashes the partition key
2. Uses consistent hashing to find the owning node
3. Writes to that node (and replicas)

### Distributed Caches

**Memcached** clients use consistent hashing to distribute keys across cache servers.

```typescript
const cacheNodes = ["cache1:11211", "cache2:11211", "cache3:11211"];

async function getFromCache(key: string): Promise<string | null> {
  const node = getNode(consistentHash, key);
  const client = getMemcachedClient(node);
  return await client.get(key);
}
```

When a cache node fails, only keys owned by that node become cache misses. Other nodes continue serving their keys.

### Load Balancers

Consistent hashing enables **sticky sessions** with minimal disruption during scaling.

```typescript
function routeRequest(sessionId: string): Server {
  return getNode(consistentHash, sessionId);
}
```

All requests for a session go to the same server. When you add or remove servers, most sessions stay on their original server.

### Content Delivery Networks

**Akamai** and other CDNs use consistent hashing to route requests to edge servers. This ensures content is cached efficiently across the network.

## When to Use

| Use Case                      | Consistent Hashing? | Why                                            |
| ----------------------------- | ------------------- | ---------------------------------------------- |
| Distributed storage           | ✅                   | Minimize data movement during scaling          |
| Distributed cache             | ✅                   | Minimize cache invalidation during node churn  |
| Sticky sessions               | ✅                   | Maintain session affinity with graceful change |
| Stateless API load balancing  | ❌                   | Simple mod works fine                          |
| Small, fixed cluster          | ❌                   | Overhead not worth it                          |
| Needs exact even distribution | ❌                   | Use explicit partitioning instead              |

## Key Takeaways

1. **Consistent hashing solves one problem**: Who owns this data?

2. **Minimal data movement**: When nodes change, only a fraction of keys move.

3. **Operationally simple**: Adding a node? Snapshot the right neighbor. Removing a node? Copy to the right neighbor.

4. **Virtual nodes**: Solve the uneven distribution problem by placing each physical node multiple times on the ring.

5. **Use it for stateful systems**: Distributed databases, caches, anything where data movement is expensive.

## Practice

I've created hands-on demos you can run locally: [consistent-hashing](https://github.com/pulkitxm/systems/tree/main/data-structures/consistent-hashing). TypeScript implementation with demos for basic usage, scaling comparison (simple hash vs consistent hash), and virtual nodes.

## Conclusion

Consistent hashing answers one question: **Who owns this key?**

It answers it in a way that minimizes disruption when your cluster changes.

| Aspect         | Hash-Based Routing | Consistent Hashing     |
| -------------- | ------------------ | ---------------------- |
| Data movement  | O(n) keys move     | O(n/m) keys move       |
| Implementation | Simple mod         | Sorted array + bsearch |
| Node addition  | Rehash everything  | Only affected range    |
| Node removal   | Rehash everything  | Only affected range    |
| Best for       | Stateless backends | Stateful backends      |

Where n = total keys and m = number of nodes.

Implement it yourself. You'll have fun.

## Related writing

- [Introduction to Big Data Tools](https://pulkit.blog/system-design/big-data-tools.md): January 24, 2026
- [Circuit Breakers](https://pulkit.blog/system-design/circuit-breakers.md): January 13, 2026
- [High Availability](https://pulkit.blog/system-design/high-availability.md): January 23, 2026
