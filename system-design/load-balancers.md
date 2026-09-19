# Load Balancers

> Learn how load balancers enable horizontal scalability by distributing traffic across multiple servers. Understand load balancing algorithms, request flow, and key advantages for building resilient systems.

- URL: https://pulkit.blog/system-design/load-balancers/
- Published: January 11, 2026
- Tags: System Design, Load Balancing, Scalability, Networking, Infrastructure
- Part of: [System Design](https://pulkit.blog/system-design.md)

You've built an API server. It's handling 100 requests per second just fine. Then your app goes viral. Traffic spikes to 500 requests per second. Your single server can't keep up. Requests are timing out. Users are complaining.

The obvious solution? Add more servers. But here's the problem: how do clients know which server to connect to? Do they pick randomly? What if one server goes down? What if one server is overloaded while others sit idle?

This is exactly what load balancers solve. They're the infrastructure that makes horizontal scaling actually work.

## TL;DR

- **Load balancers** are the single point of contact between clients and your backend servers
- They abstract away the complexity of multiple servers, making your system appear as one unified service
- **Static IP or DNS**: Clients only need to know the load balancer's address, not individual server IPs
- **Horizontal scalability**: Add or remove backend servers without clients knowing
- **Request flow**: Client → Load Balancer → Backend Server → Load Balancer → Client
- **Load balancing algorithms**: Round Robin, Weighted Round Robin, Least Connections, Hash-based routing
- **Key advantages**: Scalability (add servers seamlessly) and Availability (route around failures)
- **Configuration is key**: Choose the right algorithm based on your infrastructure and traffic patterns

## What is a Load Balancer?

![Load balancer sits between clients and backend servers, distributing traffic](https://pulkit.blog/assets/content/blogs/load-balancers/overview.webp)

A load balancer is infrastructure that sits between your clients and your backend servers. It's the only point of contact for any client trying to reach your application.

Think about what happens without a load balancer. If you have three API servers, clients would need to know the IP address of each server. Which one should they connect to? What if one goes down? How do they know which server has capacity?

This is messy. Load balancers solve this by providing a single, stable endpoint.

### The Single Point of Contact

![Clients connect to load balancer's static IP or DNS name](https://pulkit.blog/assets/content/blogs/load-balancers/single-point-of-contact.webp)

Every load balancer has either:

- **Static IP address**: A fixed IP that never changes
- **Static DNS name**: A domain name like `api.pulkitxm.com`

Clients only need to know this one address. They don't care how many servers are behind it. They don't need to track which servers are healthy or which have capacity.

```typescript
const API_BASE = "https://api.pulkitxm.com";

async function fetchUserProfile(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${userId}`);
  return response.json();
}
```

The client makes a request to `api.pulkitxm.com`. Behind the scenes, the load balancer decides which of your backend servers should handle it. The client never knows the difference.

### Abstracting Distributedness

This abstraction is powerful. Your system might have one server, five servers, or five hundred servers. From the client's perspective, it's all the same. They talk to the load balancer, and the load balancer handles the rest.

This means you can:

- Add servers during traffic spikes
- Remove servers during quiet periods
- Replace failing servers without downtime
- Scale horizontally without changing client code

The load balancer hides the distributed nature of your system, making it appear as a single, unified service.

## How Load Balancers Work

![Request flow through a load balancer](https://pulkit.blog/assets/content/blogs/load-balancers/request-flow.webp)

Let's trace through a typical request:

**Step 1: Client has the load balancer's address**

Your authentication service is available at `auth.pulkitxm.com`. This DNS name resolves to your load balancer's IP address.

**Step 2: Client makes a request**

```bash
GET https://auth.pulkitxm.com/login
```

The request arrives at the load balancer.

**Step 3: Load balancer picks a backend server**

The load balancer has three backend servers registered:

```text
Server 1: 10.0.1.10:8080
Server 2: 10.0.1.11:8080
Server 3: 10.0.1.12:8080
```

Using its configured algorithm ([more on this soon](#load-balancing-algorithms)), it picks Server 2.

**Step 4: Load balancer forwards the request**

The load balancer makes the exact same request to Server 2:

```bash
GET http://10.0.1.11:8080/login
```

**Step 5: Server responds**

Server 2 processes the request and sends back a response.

**Step 6: Load balancer returns the response**

The load balancer receives the response from Server 2 and forwards it back to the client.

From the client's perspective, they made one request to `auth.pulkitxm.com` and got a response. They have no idea which backend server handled it.

### Service-to-Service Communication

When I draw a user icon in these diagrams, it doesn't just mean human users. It represents any client making a request.

In a microservices architecture, services talk to each other through load balancers:

```text
Order Service → Payment Service Load Balancer → Payment Service Servers
```

The order service doesn't need to know which payment service server to connect to. It talks to the load balancer, and the load balancer routes the request appropriately.

This is what makes distributed systems manageable. Every service exposes a single endpoint (its load balancer), and other services connect to that endpoint.

## Load Balancing Algorithms

The core job of a load balancer is to pick which backend server should handle each request. This decision is made using a **load balancing algorithm**.

Different algorithms optimize for different scenarios. Let's look at the most common ones.

### Round Robin

![Round robin distributes requests sequentially across servers](https://pulkit.blog/assets/content/blogs/load-balancers/round-robin.webp)

The simplest algorithm. Requests are distributed in order:

```text
Request 1 → Server 1
Request 2 → Server 2
Request 3 → Server 3
Request 4 → Server 1
Request 5 → Server 2
Request 6 → Server 3
...
```

Each server gets an equal share of requests. If you have three servers, each handles roughly 33% of the traffic.

**When to use it:**

- Your infrastructure is uniform (all servers have the same specs)
- Requests have similar processing times
- You want simple, predictable distribution

**Example:**

You're running a stateless REST API. Each server is identical: 4 CPU cores, 16GB RAM. Every request takes roughly the same time to process (50-100ms). Round robin works perfectly here.

This is the default algorithm for most load balancers, and it works well for the majority of use cases.

### Weighted Round Robin

![Weighted round robin distributes requests based on server capacity](https://pulkit.blog/assets/content/blogs/load-balancers/weighted-round-robin.webp)

What if your servers aren't identical? Maybe you have:

```text
Server 1: 4GB RAM
Server 2: 8GB RAM
Server 3: 4GB RAM
```

Server 2 has twice the capacity. With regular round robin, it would only get 33% of requests, leaving capacity unused.

Weighted round robin lets you assign weights:

```text
Server 1: weight = 1
Server 2: weight = 2
Server 3: weight = 1
```

Now requests are distributed in a 1:2:1 ratio:

```text
Request 1 → Server 1
Request 2 → Server 2
Request 3 → Server 2
Request 4 → Server 3
Request 5 → Server 1
Request 6 → Server 2
Request 7 → Server 2
Request 8 → Server 3
...
```

Server 2 gets twice as many requests because it has twice the capacity.

**When to use it:**

- Your infrastructure is non-uniform (different server specs)
- You're gradually migrating to new hardware
- Some servers are more powerful than others

**Configuration example:**

```typescript
const servers = [
  { host: "10.0.1.10", port: 8080, weight: 1 },
  { host: "10.0.1.11", port: 8080, weight: 2 },
  { host: "10.0.1.12", port: 8080, weight: 1 },
];
```

### Least Connections

![Least connections picks the server with fewest active connections](https://pulkit.blog/assets/content/blogs/load-balancers/least-connections.webp)

Every time a load balancer forwards a request to a backend server, it creates a connection. When the server responds, the connection closes.

The number of active connections to a server indicates how busy it is. A server with 10 active connections is busier than one with 2 active connections.

Least connections algorithm picks the server with the fewest active connections:

```text
Server 1: 5 connections
Server 2: 2 connections  ← Pick this one
Server 3: 8 connections
```

**When to use it:**

- Your requests have highly variable processing times
- Some requests take milliseconds, others take minutes
- You want to avoid overloading busy servers

**Example:**

You're running a video processing service. Some videos take 2 seconds to process, others take 5 minutes. If you use round robin, you might send three long-running requests to Server 1 while Server 2 sits idle.

With least connections, the load balancer sees that Server 1 is busy (3 active connections) and routes new requests to Server 2 (0 active connections). This keeps response times more consistent.

**The key insight:**

When response times vary significantly, you want to send new requests to servers that are relatively free. Least connections achieves this by tracking active connections as a proxy for server load.

### Hash-Based Routing

![Hash-based routing ensures requests from the same user go to the same server](https://pulkit.blog/assets/content/blogs/load-balancers/hash-based.webp)

Sometimes you need **stickiness**: requests from the same user should always go to the same server.

Hash-based routing picks a parameter (user ID, IP address, session token) and hashes it:

```typescript
function getServer(userId: string): Server {
  const hash = hashFunction(userId);
  const serverIndex = hash % servers.length;
  return servers[serverIndex];
}
```

Because hash functions are deterministic, the same input always produces the same output. This means:

```text
User 123 → hash(123) % 3 = 1 → Server 2
User 456 → hash(456) % 3 = 0 → Server 1
User 789 → hash(789) % 3 = 2 → Server 3

// Later...
User 123 → hash(123) % 3 = 1 → Server 2 (same server!)
```

**When to use it:**

- You need session affinity (sticky sessions)
- Servers cache user-specific data locally
- You want consistent routing for the same user

**Example:**

You're building a chat application. Each server maintains WebSocket connections and caches recent messages in memory. If a user's requests bounce between servers, they'd have to re-establish connections and re-fetch cached data.

With hash-based routing on user ID, all requests from the same user go to the same server. The server can maintain the WebSocket connection and keep the cache warm.

**Trade-off:**

Hash-based routing gives you stickiness but sacrifices even distribution. If one user generates 50% of your traffic, one server will handle 50% of the load. Use it only when you need the stickiness it provides.

## Key Advantages of Load Balancers

### Scalability

![Adding servers behind a load balancer scales capacity](https://pulkit.blog/assets/content/blogs/load-balancers/scalability.webp)

This is the big one. Load balancers enable horizontal scalability.

**Without load balancer:**

```text
Single server: 100 requests/second capacity
Traffic: 150 requests/second
Result: Server overloaded, requests timing out
```

You're stuck. You can't add another server because clients don't know how to connect to it.

**With load balancer:**

```text
Server 1: 100 requests/second
Server 2: 100 requests/second
Total capacity: 200 requests/second
Traffic: 150 requests/second
Result: Handled easily
```

And when traffic grows to 250 requests/second? Add a third server:

```text
Server 1: 100 requests/second
Server 2: 100 requests/second
Server 3: 100 requests/second
Total capacity: 300 requests/second
```

The load balancer automatically starts routing requests to the new server. No client changes needed. No downtime. Just more capacity.

This is why load balancers are essential for horizontal scalability. They let you add capacity by adding servers, not by upgrading existing ones.

### Availability

![Load balancer routes around failed servers](https://pulkit.blog/assets/content/blogs/load-balancers/availability.webp)

Even if one server crashes, your system stays up.

**Scenario:**

```text
Server 1: Running
Server 2: Crashed
Server 3: Running
```

The load balancer detects that Server 2 isn't responding (via health checks) and stops sending requests to it:

```text
Request 1 → Server 1
Request 2 → Server 3
Request 3 → Server 1
Request 4 → Server 3
```

Server 2 is down, but your users don't notice. The load balancer seamlessly routes traffic to healthy servers.

**Health checks:**

Load balancers periodically ping each backend server:

```bash
GET http://10.0.1.11:8080/health
```

If a server doesn't respond or returns an error, the load balancer marks it as unhealthy and stops routing traffic to it. When the server recovers and starts responding to health checks again, the load balancer adds it back to the pool.

```typescript
interface HealthCheck {
  path: string;
  interval: number;
  timeout: number;
  unhealthyThreshold: number;
  healthyThreshold: number;
}

const healthCheck: HealthCheck = {
  path: "/health",
  interval: 10000,
  timeout: 2000,
  unhealthyThreshold: 3,
  healthyThreshold: 2,
};
```

This configuration checks `/health` every 10 seconds. If a server fails 3 consecutive checks, it's marked unhealthy. Once it passes 2 consecutive checks, it's marked healthy again.

### The Combined Power

Scalability + Availability = Resilient systems that can grow.

You can:

- Scale up during traffic spikes
- Scale down during quiet periods
- Handle server failures gracefully
- Deploy new versions with zero downtime (blue-green deployments)
- Perform maintenance without taking your system offline

All of this is possible because the load balancer abstracts away the complexity of multiple servers.

## Load Balancer Types

There are different types of load balancers operating at different layers of the network stack:

### Layer 4 (Transport Layer)

Operates at the TCP/UDP level. Makes routing decisions based on:

- Source IP address
- Destination IP address
- Source port
- Destination port

**Characteristics:**

- Fast (no need to inspect packet contents)
- Protocol-agnostic (works with any TCP/UDP traffic)
- Can't make decisions based on HTTP headers or URLs

**Use case:**

You need raw performance and don't need HTTP-specific features.

### Layer 7 (Application Layer)

Operates at the HTTP level. Makes routing decisions based on:

- URL path
- HTTP headers
- Cookies
- Request method

**Characteristics:**

- More flexible (can route based on application-level data)
- Slower (needs to parse HTTP)
- Can do SSL termination, URL rewriting, header manipulation

**Use case:**

You need intelligent routing based on request content.

**Example:**

```text
/api/users/*    → User Service
/api/orders/*   → Order Service
/api/products/* → Product Service
```

A Layer 7 load balancer can route requests to different backend services based on the URL path.

## Real-World Load Balancers

### AWS Elastic Load Balancer (ELB)

AWS offers three types:

**Application Load Balancer (ALB):**

- Layer 7 (HTTP/HTTPS)
- Content-based routing
- WebSocket support
- Best for microservices

**Network Load Balancer (NLB):**

- Layer 4 (TCP/UDP)
- Ultra-high performance
- Static IP addresses
- Best for raw throughput

**Classic Load Balancer (CLB):**

- Legacy option
- Both Layer 4 and Layer 7
- Being phased out

### NGINX

Open-source web server that also functions as a load balancer.

```nginx
upstream backend {
    least_conn;  # or: ip_hash, round_robin (default)
    server 10.0.1.10:8080 weight=1;
    server 10.0.1.11:8080 weight=2;
    server 10.0.1.12:8080 weight=1;
}

server {
    listen 80;
    server_name api.pulkitxm.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Features:**

- Highly configurable
- Can run on your own servers
- Free and open-source
- Layer 7 capabilities

### HAProxy

Another popular open-source load balancer.

```text
frontend http_front
    bind *:80
    default_backend http_back

backend http_back
    balance roundrobin
    server server1 10.0.1.10:8080 check
    server server2 10.0.1.11:8080 check
    server server3 10.0.1.12:8080 check
```

**Features:**

- High performance
- Advanced health checking
- Detailed statistics
- Both Layer 4 and Layer 7

## Conclusion

Load balancers are the glue that makes distributed systems work. They provide a single point of contact, abstract away the complexity of multiple servers, and enable horizontal scalability.

The key takeaways:

1. **Single endpoint**: Clients only need to know the load balancer's address
2. **Horizontal scaling**: Add servers seamlessly without client changes
3. **High availability**: Route around failures automatically
4. **Algorithm matters**: Choose based on your infrastructure and traffic patterns
5. **Health checks**: Ensure traffic only goes to healthy servers

When you're building a system that needs to scale, load balancers are essential. They're not just nice to have, they're fundamental infrastructure that enables everything else.

As an exercise, explore AWS Load Balancer documentation or set up NGINX as a load balancer locally. Understanding the configuration options and seeing it work firsthand will solidify these concepts.

Load balancers have become so ubiquitous that we barely think about them. But understanding how they work, why they matter, and how to configure them properly is crucial for building scalable, resilient systems.

## Related writing

- [Communication Protocols](https://pulkit.blog/system-design/communication-protocols.md): January 23, 2026
- [Consistent Hashing](https://pulkit.blog/system-design/consistent-hashing.md): January 24, 2026
- [Rate Limiting](https://pulkit.blog/system-design/rate-limiting.md): April 11, 2026
