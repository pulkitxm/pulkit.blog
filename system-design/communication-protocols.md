# Communication Protocols

> Understand how clients and servers communicate over the network. TCP fundamentals, HTTP, WebSockets, Server-Sent Events, and API paradigms like REST, GraphQL, gRPC, and tRPC.

- URL: https://pulkit.blog/system-design/communication-protocols/
- Published: January 23, 2026
- Tags: System Design, Networking, HTTP, WebSockets, REST, GraphQL, gRPC
- Part of: [System Design](https://pulkit.blog/system-design.md)

Two machines need to talk to each other. One machine (the client) wants something done. The other machine (the server) does the heavy lifting. This is the client-server model, and it's how almost everything on the internet works.

Your browser asks a server for a webpage. Your phone asks a server for your messages. Your laptop asks a server to spin up an EC2 instance. The pattern is always the same: client demands, server delivers.

But how do they actually communicate? What format do they use? What happens at the network level? Understanding this is fundamental to building any distributed system.

## TL;DR

- **TCP**: Reliable transport with 3-way handshake. Connections stay open until explicitly closed
- **HTTP**: Text format over TCP. Request-response model. Keep-alive reuses connections
- **WebSockets**: Bidirectional real-time. Single persistent connection for chat, gaming, collaboration
- **SSE**: Server-to-client push over HTTP. Simpler than WebSockets with auto-reconnection
- **REST**: Resource URLs + HTTP verbs. Universal standard for APIs
- **GraphQL**: Single endpoint, client requests exactly what it needs
- **gRPC**: Binary protocol with Protocol Buffers. High-performance service-to-service
- **tRPC**: End-to-end TypeScript type safety with zero schema duplication

## The Client-Server Model

The client-server model is straightforward. One machine (client) sends requests. Another machine (server) processes them and sends responses.

```text
Client                          Server
  │                                │
  │──── "Give me profile #123" ───→│
  │                                │ (looks up profile)
  │←─── "Here's profile #123" ─────│
  │                                │
```

The client could be anything: a mobile app, a web browser, a CLI tool, another server. The server could be your API, a database, a file storage service. The model is universal.

But here's the key question: how do these bytes actually travel from one machine to another?

## TCP

When two machines communicate over the internet, they need a common network connecting them. The two main protocols for this are [TCP](https://en.wikipedia.org/wiki/Transmission_Control_Protocol) and [UDP](https://en.wikipedia.org/wiki/User_Datagram_Protocol). For 99% of web applications, you're using TCP.

Why TCP? It's reliable. TCP guarantees:

- **Ordered delivery**: Packets arrive in the order they were sent
- **No data loss**: Missing packets get retransmitted
- **Error checking**: Corrupted data is detected and fixed

UDP is faster but unreliable. Good for video streaming where a dropped frame doesn't matter. Bad for bank transactions where a dropped packet means lost money.

### The 3-Way Handshake

Before any data flows, TCP requires a handshake to establish the connection.

![TCP 3-way handshake showing SYN, SYN-ACK, ACK packet exchange](https://pulkit.blog/assets/content/blogs/communication-protocols/tcp-3-way-handshake.webp)

Three packets cross the network before you can send a single byte of actual data. If your client is in India and your server is in the US, each packet takes \~150ms. That's 450ms just to establish the connection.

This is expensive. But TCP requires it for reliability.

### The 2-Way Teardown

When the job is done and either party wants to close the connection:

![TCP 2-way teardown showing FIN and ACK packet exchange](https://pulkit.blog/assets/content/blogs/communication-protocols/tcp-2-way-teardown.webp)

Two more packets. More latency.

### Connections Stay Open

Here's something many developers get wrong: **TCP connections don't automatically close after data exchange**.

The TCP specification doesn't say "send data, get response, connection dies." The connection stays open until:

1. **Network interruption**: A router reboots, a cable gets unplugged
2. **Explicit termination**: Either party sends a FIN packet

This matters. If you establish a TCP connection and neither party closes it, that connection remains open. Forever. This is the foundation for persistent connections and connection pooling.

## HTTP

TCP handles moving bytes. But what bytes should you send? In what format? This is where protocols come in.

![Protocol layers showing how HTTP sits on top of TCP](https://pulkit.blog/assets/content/blogs/communication-protocols/protocol-layer-stack.webp)

A protocol is an agreed-upon format. Like human languages: if I speak Hindi and you speak Japanese, we can't communicate. We need a common language.

HTTP (Hypertext Transfer Protocol) is that common language for web communication. Your client sends an HTTP request. Your server parses it, understands what to do, and sends back an HTTP response.

```text
Client sends:
  GET /profile/123 HTTP/1.1
  Host: api.example.com
  Accept: application/json

Server responds:
  HTTP/1.1 200 OK
  Content-Type: application/json

  {"id": 123, "name": "Alice"}
```

Both parties understand this format. That's it. HTTP is just text structured in a specific way.

### Custom Protocols Are Valid

HTTP is common, but it's not mandatory. TCP doesn't care what data you send. You can define your own protocol.

Let's say you're building a key-value store. You could define a custom format:

```text
Format: COMMAND KEY\n

Examples:
  GET mykey\n        → retrieve value for "mykey"
  SET mykey value\n  → store "value" under "mykey"
  DEL mykey\n        → delete "mykey"
```

As long as your server understands this format, it works. Redis does exactly this. It doesn't use HTTP. It has a custom protocol ([RESP](https://redis.io/docs/latest/develop/reference/protocol-spec)) optimized for its use case.

```text
Redis protocol (RESP):
  *3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$7\r\nmyvalue\r\n

Translates to: SET mykey myvalue
```

The tradeoff: custom protocols are more efficient but require custom clients. HTTP works everywhere because browsers and libraries already support it.

Want to build your own? I've created a [hands-on demo](https://github.com/pulkitxm/systems/tree/main/networking/custom-protocol) showing how to implement a custom key-value store protocol over TCP with TypeScript. You'll see exactly how to define command formats, parse requests, and compare the efficiency against HTTP.

## HTTP 1.1

HTTP has multiple versions: HTTP/1.1, HTTP/2, HTTP/3. Despite newer versions existing, HTTP/1.1 is still the most widely deployed. Understanding it is essential.

### Request-Response Cycle

In HTTP 1.1, communication is strictly request-response:

1. Client establishes TCP connection (3-way handshake)
2. Client sends HTTP request
3. Server processes request
4. Server sends HTTP response
5. Connection typically terminates

![HTTP 1.1 flow showing request-response cycle with overhead](https://pulkit.blog/assets/content/blogs/communication-protocols/http-1-1-flow.webp)

### The Connection Problem

HTTP 1.1 servers typically terminate the connection after sending a response. This means every request requires:

- 3 packets for TCP setup
- Request data
- Response data
- 2 packets for TCP teardown

For a page that loads 50 resources (HTML, CSS, JS, images), that's 50 separate TCP connections. 250+ packets just for handshakes and teardowns.

### Keep-Alive

![Connection keep-alive reduces overhead by reusing TCP connections](https://pulkit.blog/assets/content/blogs/communication-protocols/connection-keep-alive.webp)

The `Connection: keep-alive` header tells the server: "Don't close this connection. I'll reuse it."

```text
GET /resource HTTP/1.1
Host: example.com
Connection: keep-alive
```

If the server supports this (most modern servers do), the connection stays open. Subsequent requests reuse the same TCP connection.

```text
Without keep-alive:
  Request 1: [handshake] [request] [response] [teardown]
  Request 2: [handshake] [request] [response] [teardown]
  Request 3: [handshake] [request] [response] [teardown]

With keep-alive:
  [handshake]
  Request 1: [request] [response]
  Request 2: [request] [response]
  Request 3: [request] [response]
  [teardown]
```

Massive reduction in overhead. This is why connection pooling exists in HTTP clients.

### HTTP 1.1 Limitations

Even with keep-alive, HTTP 1.1 has fundamental limitations:

**Head-of-line blocking**: One connection, one request at a time. If the first request takes 5 seconds, all subsequent requests wait.

**No server push**: The server can only respond to requests. It can't proactively send data.

**Verbose headers**: Headers are sent in plain text with every request, even if identical.

HTTP/2 and HTTP/3 address some of these issues with multiplexing and header compression. But they're still fundamentally request-response models.

## WebSockets

HTTP is unidirectional. Client asks, server responds. But what if the server needs to send data without the client asking?

Think about:

- **Chat applications**: You need to receive messages as soon as someone sends them
- **Live notifications**: Instagram likes appearing in real-time on a live stream
- **Stock tickers**: Price updates every millisecond

With HTTP, you'd have to poll: client asks "any new messages?" every few seconds. Wasteful and not truly real-time.

WebSockets solve this. They enable **bidirectional communication**: the server can push data to the client anytime, without the client requesting it.

### How WebSockets Work

WebSockets start as an HTTP request (the upgrade handshake) and then switch to a persistent TCP connection.

```text
1. Client sends HTTP upgrade request:
   GET /chat HTTP/1.1
   Host: server.example.com
   Upgrade: websocket
   Connection: Upgrade

2. Server accepts:
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade

3. Connection is now a WebSocket:
   - Bidirectional
   - Persistent
   - Low overhead
```

After the upgrade, both parties can send messages at any time. No request-response. No handshakes. Just data.

### Why WebSockets Are Fast

![HTTP vs WebSocket connection overhead comparison](https://pulkit.blog/assets/content/blogs/communication-protocols/https-vs-ws.webp)

With WebSockets, you pay the connection cost once. Every subsequent message is pure data transfer. For real-time applications, this is transformative.

### When to Use WebSockets

WebSockets aren't always the answer. They add complexity:

- **Connection management**: You need to handle reconnection, heartbeats, timeouts
- **Scaling challenges**: Persistent connections consume server resources
- **Infrastructure requirements**: Load balancers need WebSocket support

Use WebSockets when you need:

![Real-time use cases for WebSockets](https://pulkit.blog/assets/content/blogs/communication-protocols/real-time-use-case.webp)

| Use Case              | Why WebSockets                        |
| --------------------- | ------------------------------------- |
| Chat applications     | Real-time message delivery            |
| Live notifications    | Server-initiated updates              |
| Stock tickers         | Millisecond price updates             |
| Collaborative editing | Multiple users editing simultaneously |
| Gaming                | Real-time player interactions         |
| Live dashboards       | Streaming metrics and data            |

Don't use WebSockets for:

- Standard CRUD operations
- Infrequent updates (use polling or long polling)
- Simple request-response patterns

### The Polling Alternative

Before WebSockets, real-time was achieved through polling:

**Short polling**: Client asks repeatedly at fixed intervals.

```typescript
setInterval(async () => {
  const messages = await fetch("/api/messages");
  updateUI(messages);
}, 5000);
```

Simple but wasteful. You're making requests even when there's nothing new.

**Long polling**: Client asks, server holds the connection until there's data.

```typescript
async function longPoll() {
  const response = await fetch("/api/messages?wait=true");
  updateUI(response);
  longPoll();
}
```

Better, but still has connection overhead on each response.

WebSockets eliminate this overhead entirely. One connection, continuous data flow.

## Server-Sent Events (SSE)

WebSockets are powerful but sometimes overkill. What if you only need the server to push data to the client, not the other way around?

Server-Sent Events (SSE) is a simpler alternative. It's unidirectional: server pushes to client over a standard HTTP connection.

### How SSE Works

SSE uses a long-lived HTTP connection. The server keeps the connection open and sends events as they occur.

![SSE flow showing server pushing events to client over HTTP](https://pulkit.blog/assets/content/blogs/communication-protocols/sse-flow.webp)

The connection stays open. Server sends data whenever it wants. Client receives it instantly.

### SSE Event Format

SSE has a simple text-based format:

```text
event: stock-update
data: {"symbol": "AAPL", "price": 150.25}
id: 1001

event: stock-update
data: {"symbol": "AAPL", "price": 150.30}
id: 1002
```

Each event can have:

- `event`: Event type (optional, defaults to "message")
- `data`: The payload (can span multiple lines)
- `id`: Event ID for reconnection
- `retry`: Reconnection timeout in milliseconds

### Client-Side Implementation

The browser provides a native `EventSource` API:

```typescript
const eventSource = new EventSource("/api/stock-updates");

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateStockPrice(data);
};

eventSource.onerror = (error) => {
  console.error("SSE connection failed:", error);
};

eventSource.addEventListener("stock-update", (event) => {
  const data = JSON.parse(event.data);
  handleStockUpdate(data);
});
```

### Server-Side Implementation

Here's a simple SSE endpoint in Node.js:

```typescript
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const interval = setInterval(() => {
    sendEvent({ timestamp: Date.now(), value: Math.random() });
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
  });
});
```

### SSE vs WebSockets

| Feature         | SSE                           | WebSockets              |
| --------------- | ----------------------------- | ----------------------- |
| Direction       | Server → Client only          | Bidirectional           |
| Protocol        | HTTP                          | WebSocket (upgrade)     |
| Reconnection    | Automatic with last event ID  | Manual implementation   |
| Binary data     | Text only (Base64 for binary) | Native binary support   |
| Browser support | Native EventSource API        | Native WebSocket API    |
| Infrastructure  | Works with standard HTTP      | Needs WebSocket support |
| Complexity      | Lower                         | Higher                  |

### When to Use SSE

SSE is ideal when:

- Server needs to push updates, but client doesn't send data back
- You want automatic reconnection with event replay
- You need to work with HTTP-only infrastructure (proxies, load balancers)
- Simplicity matters more than bidirectional communication

Common use cases:

- Live news feeds
- Stock price updates
- Build/deployment status
- Notification streams
- Real-time dashboards

Use WebSockets instead when:

- Client needs to send data frequently
- You need binary data transfer
- Bidirectional communication is essential (chat, gaming)

## API Design Paradigms

We've covered how data travels over the network. But how do you structure your API? What format should requests and responses follow?

This is where API paradigms come in. They're patterns for organizing your endpoints, defining data shapes, and handling client-server contracts.

### REST

REST (Representational State Transfer) is the most widely used API paradigm. It maps HTTP methods to CRUD operations on resources.

```text
GET    /users          → List all users
GET    /users/123      → Get user 123
POST   /users          → Create a user
PUT    /users/123      → Update user 123
DELETE /users/123      → Delete user 123
```

Resources are nouns. HTTP methods are verbs. URLs are hierarchical.

```typescript
// Fetching a user's orders
const response = await fetch("/users/123/orders");
const orders = await response.json();

// Creating an order
const newOrder = await fetch("/users/123/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ product_id: 456, quantity: 2 }),
});
```

**Strengths:**

- Universal understanding. Every developer knows REST
- Cacheable. HTTP caching works out of the box
- Stateless. Each request contains all needed information
- Tooling. Extensive ecosystem (Postman, Swagger, OpenAPI)

**Weaknesses:**

- Over-fetching: GET `/users/123` returns everything, even if you only need the name
- Under-fetching: Need user + orders + reviews? That's 3 requests
- Rigid structure: Adding fields requires API versioning

### GraphQL

GraphQL flips the model. Instead of multiple endpoints, you have one. The client specifies exactly what data it wants.

```graphql
# Single request for user, their orders, and reviews
query {
  user(id: 123) {
    name
    email
    orders(last: 5) {
      id
      total
      items {
        productName
        quantity
      }
    }
    reviews {
      rating
      comment
    }
  }
}
```

One request. Exactly the data you need. No more, no less.

```typescript
const response = await fetch("/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: `
      query GetUser($id: ID!) {
        user(id: $id) {
          name
          email
          orders { id total }
        }
      }
    `,
    variables: { id: "123" },
  }),
});
```

**Strengths:**

- No over-fetching or under-fetching
- Single endpoint simplifies client code
- Strong typing with schema
- Introspection: clients can discover available data
- Great for mobile apps where bandwidth matters

**Weaknesses:**

- Complexity: Requires learning a new query language
- Caching: HTTP caching doesn't work well (everything is POST)
- N+1 queries: Naive implementations hit the database repeatedly
- Security: Malicious queries can request deeply nested data

### gRPC

gRPC uses Protocol Buffers (protobuf) for serialization. It's binary, strongly typed, and designed for service-to-service communication.

First, you define your service in a `.proto` file:

```protobuf
syntax = "proto3";

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(ListUsersRequest) returns (stream User);
  rpc CreateUser(CreateUserRequest) returns (User);
}

message GetUserRequest {
  string id = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  int32 age = 4;
}
```

The protobuf compiler generates client and server code in your language:

```typescript
// Generated client usage
const client = new UserServiceClient("localhost:50051");

const user = await client.getUser({ id: "123" });
console.log(user.name);

// Streaming: server sends multiple users
const stream = client.listUsers({ limit: 100 });
for await (const user of stream) {
  console.log(user.name);
}
```

**Strengths:**

- Performance: Binary serialization is 5-10x faster than JSON
- Streaming: Native support for server/client/bidirectional streaming
- Strong contracts: Proto files are the source of truth
- Code generation: Type-safe clients in any language
- HTTP/2: Multiplexing, header compression built-in

**Weaknesses:**

- Browser support: Limited (needs grpc-web proxy)
- Debugging: Binary format isn't human-readable
- Learning curve: Protobuf syntax, tooling setup
- Overkill for simple APIs

**Best for:** Microservices communication, high-throughput internal APIs, polyglot environments.

### tRPC

tRPC is TypeScript-specific. It shares types between your server and client with zero code generation.

Define your API on the server:

```typescript
// server/routers/user.ts
import { router, publicProcedure } from "../trpc";
import { z } from "zod";

export const userRouter = router({
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({ where: { id: input.id } });
      return user;
    }),

  createUser: publicProcedure
    .input(z.object({ name: z.string(), email: z.string().email() }))
    .mutation(async ({ input }) => {
      return db.user.create({ data: input });
    }),
});
```

Use it on the client with full type inference:

```typescript
// client/pages/user.tsx
import { trpc } from "../utils/trpc";

function UserProfile({ userId }: { userId: string }) {
  const { data: user } = trpc.user.getUser.useQuery({ id: userId });

  // TypeScript knows user.name, user.email exist
  // Autocomplete works. Typos are caught at compile time.
  return <div>{user?.name}</div>;
}
```

Change the server response? TypeScript immediately shows errors in all clients.

**Strengths:**

- Zero schema duplication: Types flow from server to client
- Compile-time safety: Catch errors before runtime
- Great DX: Autocomplete, refactoring, go-to-definition
- Simple setup: No code generation step

**Weaknesses:**

- TypeScript only: Both client and server must be TypeScript
- Monorepo friendly: Works best when client and server share code
- Less suitable for public APIs: No language-agnostic schema

**Best for:** Full-stack TypeScript apps, Next.js projects, internal tools.

### Choosing an API Paradigm

| Paradigm | Best For                                                 | Avoid When                    |
| -------- | -------------------------------------------------------- | ----------------------------- |
| REST     | Public APIs, simple CRUD, broad compatibility            | Complex nested data needs     |
| GraphQL  | Mobile apps, complex data requirements, multiple clients | Simple APIs, caching critical |
| gRPC     | Microservices, high-performance internal APIs            | Browser clients, simple needs |
| tRPC     | Full-stack TypeScript, rapid development                 | Multi-language environments   |

Most teams should start with REST. It's simple, well-understood, and works everywhere. Move to GraphQL when over-fetching becomes painful. Use gRPC for internal service communication where performance matters. Choose tRPC for TypeScript-only full-stack applications.

## Choosing the Right Protocol

| Protocol              | Best For                      | Latency | Complexity | Server Resources |
| --------------------- | ----------------------------- | ------- | ---------- | ---------------- |
| HTTP 1.1              | Standard APIs                 | Medium  | Low        | Low              |
| HTTP 1.1 + Keep-Alive | High-frequency APIs           | Lower   | Low        | Medium           |
| SSE                   | Server push, live feeds       | Low     | Low        | Medium           |
| WebSockets            | Real-time bidirectional       | Lowest  | High       | High             |
| gRPC                  | Service-to-service, streaming | Lowest  | Medium     | Medium           |

Most applications should start with REST over HTTP. It's simple, well-understood, and works everywhere. Add SSE when you need server push without client responses. Use WebSockets for bidirectional real-time communication. Consider gRPC for high-performance internal services.

## Hands-on Practice

I've created hands-on demos you can run locally:

- [websocket-chat](https://github.com/pulkitxm/websocket-chat): A real-time chat application built with Socket.IO. See WebSocket bidirectional communication in action. Send messages between multiple clients and watch server-initiated pushes work in real-time.

- [custom-protocol](https://github.com/pulkitxm/systems/tree/main/networking/custom-protocol): Build your own protocol over TCP like Redis. This TypeScript implementation shows how to define a custom key-value store protocol, parse commands, and format responses. Compare its efficiency against HTTP and understand why databases use custom protocols.

When you've built these yourself, you'll understand not just how these protocols work, but why different systems choose different communication patterns. That hands-on experience is invaluable when you're designing your next distributed system.

## Summary

Communication protocols are the foundation of distributed systems:

1. **TCP provides reliable transport**: 3-way handshake, ordered delivery, guaranteed transmission. The cost is latency.

2. **HTTP is the common language**: A text format both parties understand. Request-response model. Simple and universal.

3. **HTTP 1.1 creates connections per request**: Expensive without keep-alive. Connection pooling mitigates this.

4. **WebSockets enable bidirectional flow**: Server can push data to client and vice versa. Essential for chat, gaming, collaboration.

5. **SSE is simpler for server push**: When you only need server-to-client updates, SSE is lighter than WebSockets with automatic reconnection.

6. **REST is the universal API standard**: Resource-based URLs, HTTP verbs, stateless. Start here unless you have specific needs.

7. **GraphQL solves over/under-fetching**: Client specifies exactly what data it needs. Great for mobile and complex UIs.

8. **gRPC excels at service communication**: Binary protocol, streaming support, code generation. Ideal for microservices.

9. **tRPC provides end-to-end type safety**: Zero schema duplication for TypeScript full-stack apps.

Everything in computer science is about abstractions. TCP abstracts reliable transmission. HTTP abstracts message format. REST abstracts resource operations. Each layer solves a specific problem. Understanding these layers lets you choose the right abstraction for your use case.

## Related writing

- [Load Balancers](https://pulkit.blog/system-design/load-balancers.md): January 11, 2026
- [Message Queues vs Streams: SQS, RabbitMQ, Kafka, Pub/Sub](https://pulkit.blog/system-design/async-processing.md): January 10, 2026
- [Introduction to Big Data Tools](https://pulkit.blog/system-design/big-data-tools.md): January 24, 2026
