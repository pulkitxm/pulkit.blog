# Message Queues vs Streams: SQS, RabbitMQ, Kafka, Pub/Sub

> Message queues vs streams explained with SQS, RabbitMQ, Kafka, and Redis Pub/Sub, covering ack, dead letter queues, and async processing at scale.

- URL: https://pulkit.blog/system-design/async-processing/
- Published: January 10, 2026
- Tags: System Design, Message Queues, RabbitMQ, AWS SQS, Kafka, Redis Pub/Sub, Dead Letter Queue
- Part of: [System Design](https://pulkit.blog/system-design.md)

Most web interactions are synchronous. You click, the server processes, you get a response. Loading your feed, logging in, making a payment. All synchronous. Request in, response out, done.

But some operations take time. Minutes. Hours. Making users stare at a spinner that long isn't just bad UX, it's impractical. This is where async processing comes in.

## TL;DR

- **Sync**: Request handled immediately, response returned. Most web interactions
- **Async**: Request acknowledged instantly, work happens in background. For long-running tasks
- **Message queues** (SQS, RabbitMQ): One message → one consumer. Consumers **pull**. Delete after processing
- **Message streams** (Kafka, Kinesis): One message → multiple consumer types. Consumers **pull**. "Write once, read by many"
- **Real-time Pub/Sub** (Redis): Messages **pushed** to subscribers instantly. Zero buffering. Miss it if not connected
- **Queue lifecycle**: Consume → Process → Delete. Crash before delete? Message reappears
- **Stream lifecycle**: Consume → Process → Commit offset. Messages stay for configured retention
- **Dead letter queues**: Catch poison messages after N failures. Prevents blocking
- **Delivery**: At-least-once is common. Handle duplicates with idempotent consumers
- **Scaling**: Add workers based on queue depth. Keep them stateless

## Sync vs Async Processing

![User sends request and server handles it immediately - this is synchronous](https://pulkit.blog/assets/content/blogs/async-processing/sync.webp)

Logging in is synchronous:

1. Enter credentials
2. Server validates
3. Session created
4. You're in

Milliseconds. Done. The request waited for completion.

Now imagine ordering food on Zomato. The restaurant takes 30 minutes to prepare your biryani. Should the app freeze for 30 minutes? Should your HTTP connection stay open that long?

![Long-running tasks shouldn't block the user](https://pulkit.blog/assets/content/blogs/async-processing/async.webp)

Instead:

1. You place the order
2. App responds: "Order confirmed! Preparing your food"
3. You browse memes, watch reels, whatever
4. Kitchen prepares the food
5. Status updates: "Out for delivery"

That's async. You got immediate feedback. The actual work happened in the background.

## When to Go Async

**Long-running tasks:**

- Generating PDF reports (seconds to minutes)
- Processing uploaded images (resizing, filters)
- Running ML inference
- Exporting large datasets
- Provisioning cloud resources

**Tasks that don't need instant results:**

- Sending emails and push notifications
- Updating search indexes
- Syncing to analytics systems
- Generating thumbnails

**Tasks that can fail and retry:**

- Webhook deliveries
- Payment confirmations
- Third-party API calls

Pattern is always the same: acknowledge immediately, process in background, update status when done.

## How Async Processing Works

![Typical async flow with API, broker, and workers](https://pulkit.blog/assets/content/blogs/async-processing/async-flow.webp)

Let's trace through a food order:

1. You tap "Place Order" in Zomato
2. API creates database entry: `order_id: xyz, status: confirmed`
3. API pushes task to queue: "Notify restaurant about order xyz"
4. API responds instantly: "Order placed!"
5. Worker pulls task from queue
6. Worker calls restaurant's system, waits for acknowledgment
7. Worker updates database: `status: preparing`
8. You see "Restaurant is preparing your order"

You weren't blocked. You could close the app, come back later, and check status anytime.

## Message Queues

The key component enabling async is the **message queue** (or message broker). SQS and RabbitMQ are popular examples.

![Message queues help services communicate through messages](https://pulkit.blog/assets/content/blogs/async-processing/message-queues.webp)

A queue sits between producers (who create tasks) and consumers (who process them). Two services communicate without knowing about each other.

### Why Queues?

**1. Decoupling**

Your order service doesn't care how notifications work. It pushes a message and moves on.

```text
Order Service ──→ Queue ──→ Notification Service
      │                            │
      │    (don't know about       │
      │     each other)            │
      └────────────────────────────┘
```

**2. Load Buffering**

![Brokers buffer messages - consumers process at their own pace](https://pulkit.blog/assets/content/blogs/async-processing/message-buffering.webp)

IPL final night. Zomato gets 50,000 orders per minute. The SMS gateway handles 1,000 per minute.

Without queue: SMS service dies, orders fail, angry customers.

With queue: Messages pile up. SMS service processes at its pace. Everyone gets their "Order Confirmed" text eventually.

```typescript
interface OrderPlaced {
  orderId: string;
  customerPhone: string;
  restaurantName: string;
}

async function onOrderPlaced(order: Order): Promise<void> {
  await sqs.sendMessage({
    QueueUrl: NOTIFICATION_QUEUE_URL,
    MessageBody: JSON.stringify({
      orderId: order.id,
      customerPhone: order.phone,
      restaurantName: order.restaurant.name,
    } satisfies OrderPlaced),
  });
}
```

Order service fires the message and moves on. SMS worker picks it up whenever it can.

**3. Message Retention**

Queues hold messages for a configurable period. SQS retains up to 14 days. Consumer down for maintenance? Messages wait. Consumer comes back, picks up where it left off.

**4. Automatic Retry**

When you read a message, it's not deleted immediately. You must explicitly delete it after processing.

![If consumer crashes before deleting, message reappears](https://pulkit.blog/assets/content/blogs/async-processing/message-requque.webp)

Flow:

1. Consumer reads message
2. Message becomes "invisible" (visibility timeout)
3. Consumer processes it
4. Consumer deletes message
5. Done

What if consumer crashes at step 3? Message was never deleted. After visibility timeout, it reappears. Another consumer picks it up.

```typescript
async function processSmsNotifications(): Promise<void> {
  while (true) {
    const response = await sqs.receiveMessage({
      QueueUrl: NOTIFICATION_QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20,
    });

    const message = response.Messages?.[0];
    if (!message) continue;

    try {
      const notification: OrderPlaced = JSON.parse(message.Body ?? "{}");

      await smsGateway.send({
        to: notification.customerPhone,
        text: `Order confirmed! ${notification.restaurantName} is preparing your food.`,
      });

      await sqs.deleteMessage({
        QueueUrl: NOTIFICATION_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      });
    } catch (error) {
      console.error("Failed to send SMS:", error);
    }
  }
}
```

Delete happens only after success. Crash mid-way? Message retries automatically.

### Handling Duplicates

This retry mechanism has a side effect: messages can deliver more than once.

Scenario:

1. Consumer reads message
2. Sends SMS successfully
3. Crashes before deleting message
4. Message reappears (visibility timeout expired)
5. Another consumer picks it up
6. SMS sent again

Customer gets two identical texts. Annoying, but not catastrophic here. For critical operations, make consumers **idempotent**:

```typescript
async function processSmsNotification(
  notification: OrderPlaced,
): Promise<void> {
  const alreadySent = await redis.get(`sms_sent:${notification.orderId}`);
  if (alreadySent) {
    console.log(`SMS already sent for ${notification.orderId}, skipping`);
    return;
  }

  await smsGateway.send({
    to: notification.customerPhone,
    text: `Order confirmed! ${notification.restaurantName} is preparing your food.`,
  });

  await redis.set(`sms_sent:${notification.orderId}`, "true", "EX", 86400);
}
```

Track what you've processed. Skip duplicates.

### Dead Letter Queues

What happens when a message fails repeatedly? Maybe the payload is malformed. Maybe a dependency is permanently down. Retrying forever wastes resources.

Dead Letter Queues (DLQ) catch these poison messages. After N failed attempts, the message moves to a separate queue for inspection.

```text
Main Queue ──→ Consumer ──→ Success ──→ Delete
                  │
                  └──→ Fail (attempt 1)
                  └──→ Fail (attempt 2)
                  └──→ Fail (attempt 3)
                          │
                          ▼
                    Dead Letter Queue
```

SQS configuration:

```typescript
const mainQueue = await sqs.createQueue({
  QueueName: "image-processing",
  Attributes: {
    RedrivePolicy: JSON.stringify({
      deadLetterTargetArn: dlqArn,
      maxReceiveCount: "3",
    }),
  },
});
```

After 3 failures, message goes to DLQ. You can:

- Alert on DLQ depth (something's wrong)
- Inspect messages manually
- Fix the bug, replay messages back to main queue
- Archive for debugging

DLQs prevent one bad message from blocking your entire pipeline.

### Delivery Semantics

When a producer sends a message, how many times does the consumer receive it? This is the delivery guarantee. Networks fail, consumers crash, acknowledgments get lost. The system must decide how to handle these failures.

Three delivery guarantees exist:

**At-most-once**: Message delivered zero or one time. Fire and forget. Fast, but you might lose messages.

```typescript
await queue.send(message);
```

**At-least-once**: Message delivered one or more times. Most common. Safe, but you might get duplicates.

```typescript
while (!acknowledged) {
  await queue.send(message);
  await waitForAck();
}
```

**Exactly-once**: Message delivered exactly one time. Ideal, but expensive and complex.

| Guarantee     | Lost messages? | Duplicates? | Complexity |
| ------------- | -------------- | ----------- | ---------- |
| At-most-once  | Possible       | No          | Low        |
| At-least-once | No             | Possible    | Medium     |
| Exactly-once  | No             | No          | High       |

Most systems use **at-least-once** with **idempotent consumers**. You accept that duplicates happen and handle them in your code. This is simpler than trying to achieve exactly-once delivery.

Exactly-once requires coordination between producer, broker, and consumer. Kafka supports it, but with performance overhead. For most use cases, idempotency is the pragmatic choice.

## Example: Image Processing

![Image upload triggers async processing for multiple sizes](https://pulkit.blog/assets/content/blogs/async-processing/image-processing.webp)

User uploads a profile picture on your app. You need to create multiple sizes: thumbnail (50x50), medium (200x200), large (800x800). Original might be 5MB, processing takes a few seconds per size.

Should the upload API wait 15 seconds? No.

**Step 1: Upload**

```typescript
async function uploadProfilePic(file: File, userId: string): Promise<Image> {
  const imageId = generateId();
  const s3Key = `uploads/${userId}/${imageId}/original.jpg`;

  await s3.upload({
    Bucket: IMAGE_BUCKET,
    Key: s3Key,
    Body: file,
  });

  const image = await db.image.create({
    data: {
      id: imageId,
      userId,
      status: "processing",
      originalKey: s3Key,
    },
  });

  await sqs.sendMessage({
    QueueUrl: IMAGE_PROCESSING_QUEUE,
    MessageBody: JSON.stringify({
      imageId,
      userId,
      s3Key,
      sizes: ["thumbnail", "medium", "large"],
    }),
  });

  return image;
}
```

Upload original to S3, create DB record with `status: processing`, push task to queue, return immediately. User sees a placeholder while processing happens.

**Step 2: Processing**

```typescript
interface ImageTask {
  imageId: string;
  userId: string;
  s3Key: string;
  sizes: string[];
}

const SIZE_MAP = {
  thumbnail: { width: 50, height: 50 },
  medium: { width: 200, height: 200 },
  large: { width: 800, height: 800 },
};

async function processImage(task: ImageTask): Promise<void> {
  const originalBuffer = await downloadFromS3(task.s3Key);

  for (const size of task.sizes) {
    const dimensions = SIZE_MAP[size];
    const resized = await sharp(originalBuffer)
      .resize(dimensions.width, dimensions.height)
      .jpeg({ quality: 80 })
      .toBuffer();

    await s3.upload({
      Bucket: IMAGE_BUCKET,
      Key: `processed/${task.userId}/${task.imageId}/${size}.jpg`,
      Body: resized,
    });
  }

  await db.image.update({
    where: { id: task.imageId },
    data: { status: "ready" },
  });
}
```

Worker downloads original, creates resized versions, uploads them, updates status. User's profile pic appears once ready.

## Queue Options

### AWS SQS

![AWS SQS is a managed message queue](https://pulkit.blog/assets/content/blogs/async-processing/amazon-sqs.webp)

Managed queue. No servers. Auto-scales. Pay per request.

```typescript
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: "us-east-1" });

async function sendTask(task: ImageTask): Promise<void> {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(task),
    }),
  );
}

async function receiveTask(): Promise<ImageTask | null> {
  const response = await sqs.send(
    new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20,
    }),
  );

  const message = response.Messages?.[0];
  if (!message) return null;

  return {
    ...JSON.parse(message.Body ?? "{}"),
    receiptHandle: message.ReceiptHandle,
  };
}

async function deleteTask(receiptHandle: string): Promise<void> {
  await sqs.send(
    new DeleteMessageCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: receiptHandle,
    }),
  );
}
```

Key features:

- 14-day retention
- Configurable visibility timeout
- Dead letter queues for failures
- FIFO queues for ordering

### RabbitMQ

![RabbitMQ is an open-source message broker](https://pulkit.blog/assets/content/blogs/async-processing/rabbitmq.webp)

Open-source. Self-hosted or managed. More features, more control, more ops overhead.

```typescript
import amqp from "amqplib";

async function setupRabbitMQ(): Promise<amqp.Channel> {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue("image_processing", { durable: true });
  return channel;
}

async function sendTask(channel: amqp.Channel, task: ImageTask): Promise<void> {
  channel.sendToQueue("image_processing", Buffer.from(JSON.stringify(task)), {
    persistent: true,
  });
}

async function consumeTasks(channel: amqp.Channel): Promise<void> {
  channel.consume("image_processing", async (msg) => {
    if (!msg) return;

    const task: ImageTask = JSON.parse(msg.content.toString());

    try {
      await processImage(task);
      channel.ack(msg);
    } catch (error) {
      channel.nack(msg, false, true);
    }
  });
}
```

Key features:

- Exchanges and routing keys
- Pub/sub, work queues, RPC patterns
- Fine-grained acknowledgments
- Configurable durability

| Feature  | SQS                  | RabbitMQ                     |
| -------- | -------------------- | ---------------------------- |
| Hosting  | Managed              | Self-hosted or managed       |
| Scaling  | Automatic            | Manual                       |
| Routing  | Simple               | Advanced (exchanges, topics) |
| Protocol | HTTP                 | AMQP                         |
| Ordering | FIFO queues          | Built-in                     |
| Cost     | Pay per request      | Infrastructure               |
| Best for | AWS apps, simplicity | Complex routing, on-prem     |

## Scaling Workers

Queue depth grows. Messages pile up. How do you scale?

### Horizontal Scaling

Add more workers. Each pulls from the same queue independently.

```text
Queue (1000 messages)
  ├── Worker 1 (processing)
  ├── Worker 2 (processing)
  ├── Worker 3 (processing)
  └── Worker 4 (processing)
```

Twice the workers = roughly half the time to clear the backlog. Works until you hit other bottlenecks (database, external APIs).

### Auto-scaling Based on Queue Depth

Don't run 10 workers at 3 AM when the queue is empty. Scale based on demand.

AWS example with CloudWatch:

```typescript
const scalingPolicy = {
  PolicyName: "scale-on-queue-depth",
  ServiceNamespace: "ecs",
  ResourceId: "service/cluster/image-processor",
  ScalableDimension: "ecs:service:DesiredCount",
  PolicyType: "TargetTrackingScaling",
  TargetTrackingScalingPolicyConfiguration: {
    TargetValue: 100,
    CustomizedMetricSpecification: {
      MetricName: "ApproximateNumberOfMessagesVisible",
      Namespace: "AWS/SQS",
      Dimensions: [{ Name: "QueueName", Value: "image-processing" }],
      Statistic: "Average",
    },
    ScaleInCooldown: 300,
    ScaleOutCooldown: 60,
  },
};
```

Target: 100 messages per worker. Queue hits 500 messages? Spin up 5 workers. Queue drains? Scale back down.

### Scaling Considerations

**Scale-out is faster than scale-in.** Spin up workers quickly (60s cooldown). Scale down slowly (300s cooldown). Prevents flapping.

**Workers should be stateless.** Any worker can process any message. No local state, no sticky sessions.

**Watch downstream limits.** 10 workers hammering a database that handles 5 concurrent connections = trouble. Add connection pooling or rate limiting.

**Batch processing helps.** Instead of one message at a time:

```typescript
const response = await sqs.receiveMessage({
  QueueUrl: QUEUE_URL,
  MaxNumberOfMessages: 10,
  WaitTimeSeconds: 20,
});

for (const message of response.Messages ?? []) {
  await processMessage(message);
  await sqs.deleteMessage({
    QueueUrl: QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle,
  });
}
```

Fewer network round-trips. Higher throughput per worker.

## Message Streams

Queues work great when all consumers do the same thing. But what if one event needs to trigger multiple different operations?

### The Multi-Consumer Problem

You're building an e-commerce platform. When a product is listed, you need to:

1. Index it in Elasticsearch (for search)
2. Update category counts in the database
3. Trigger recommendation engine retraining

Three different operations from one event.

**Approach 1: One Queue, Consumer Does Everything**

![One broker with consumer doing multiple things](https://pulkit.blog/assets/content/blogs/async-processing/streams-approach-1.webp)

Single RabbitMQ queue. Consumer handles all three:

```typescript
async function onProductListed(event: ProductListedEvent): Promise<void> {
  await elasticsearch.index({
    index: "products",
    id: event.productId,
    body: event.product,
  });

  await db.category.update({
    where: { id: event.categoryId },
    data: { productCount: { increment: 1 } },
  });

  await recommendationService.triggerRetrain(event.categoryId);
}
```

**Problem**: What if Elasticsearch write succeeds but DB update fails? Search shows the product, but category count is wrong. What if recommendation call times out after DB succeeded? Inconsistent state.

**Approach 2: Multiple Queues**

![Two brokers with two sets of consumers](https://pulkit.blog/assets/content/blogs/async-processing/streams-approach-2.webp)

Three separate queues. API writes to all three:

```typescript
async function listProduct(product: Product): Promise<void> {
  await db.product.create({ data: product });

  await searchQueue.sendMessage({ productId: product.id, product });
  await categoryQueue.sendMessage({ categoryId: product.categoryId });
  await recommendationQueue.sendMessage({ categoryId: product.categoryId });
}
```

**Problem**: API writes to three places. What if write to first queue succeeds, then API crashes before writing to others? Same inconsistency, just moved upstream.

**Root Cause**

We're writing to multiple destinations. Any failure after a success = inconsistent state.

What we need: **write once, read by many**.

### Enter Message Streams

![Message streams allow multiple consumer types to read the same message](https://pulkit.blog/assets/content/blogs/async-processing/streams-vs-queues.webp)

Message streams (Kafka, Kinesis) differ from queues in one key way: **multiple consumer types read the same message**.

In a queue:

- Message → one consumer
- All consumers identical
- Delete after processing

In a stream:

- Message written once
- Multiple consumer groups read independently
- Each group iterates at its own pace
- Messages retained (not deleted on read)

**Approach 3: One Stream, Multiple Consumers**

![Using Kafka with multiple consumer types](https://pulkit.blog/assets/content/blogs/async-processing/streams-approach-3.webp)

```typescript
async function listProduct(product: Product): Promise<void> {
  await db.product.create({ data: product });

  await kafka.send({
    topic: "product-listed",
    messages: [
      {
        key: product.categoryId,
        value: JSON.stringify({
          productId: product.id,
          categoryId: product.categoryId,
          product,
        }),
      },
    ],
  });
}
```

API writes one message. Three consumer groups (search, category-counter, recommendations) all read it independently.

Search consumer down? Category counter keeps working. Recommendations slow? Search keeps indexing. Eventually, all three will have processed everything. Consistency achieved.

### Queues vs Streams

| Aspect            | Queues (SQS, RabbitMQ)     | Streams (Kafka, Kinesis)             |
| ----------------- | -------------------------- | ------------------------------------ |
| Consumer model    | One message → one consumer | One message → multiple groups        |
| Message lifecycle | Deleted after processing   | Retained for configured period       |
| Consumer types    | All do the same thing      | Different groups do different things |
| After processing  | Delete                     | Commit offset                        |
| Replay            | No (message gone)          | Yes (reprocess from any offset)      |
| Best for          | Task distribution          | Event sourcing, multiple downstream  |

### Kafka Basics

![Kafka is a distributed streaming platform](https://pulkit.blog/assets/content/blogs/async-processing/kafka.webp)

Kafka is the most popular stream. Core concepts every engineer should know:

**Topics and Partitions**

A **topic** is a named category where messages live. Think of it like a folder. All product-listing events go to the `product-listed` topic. All order events go to the `orders` topic. Producers write to topics. Consumers read from topics.

But a single topic can receive millions of messages per second. One consumer can't keep up. You need parallelism.

That's where **partitions** come in.

A partition is a subset of a topic. It's an ordered, immutable sequence of messages. Each message in a partition gets a sequential ID called an **offset**.

![A topic split into multiple partitions, each with sequential offsets](https://pulkit.blog/assets/content/blogs/async-processing/topics-partitions.webp)

Key insight: **ordering is guaranteed within a partition, not across partitions**.

If you send messages A, B, C to partition 0, consumers will always see A before B before C. But if A goes to partition 0 and B goes to partition 1, no ordering guarantee exists between them.

**How Messages Get Assigned to Partitions**

When you send a message, Kafka decides which partition it goes to:

1. **With a key**: Kafka hashes the key and picks a partition. Same key always goes to the same partition.
2. **Without a key**: Round-robin across partitions.

```typescript
await kafka.send({
  topic: "product-listed",
  messages: [
    {
      key: categoryId,
      value: JSON.stringify(event),
    },
  ],
});
```

Using `categoryId` as the key means all products in the same category go to the same partition. This guarantees ordering for category-related operations.

**Why This Matters**

Imagine you're updating category counts. Product A (category: electronics) arrives, then Product B (category: electronics) arrives. If they go to different partitions and different consumers process them, the count might be wrong.

```text
Without key:
  Product A → Partition 0 → Consumer 1 → count = 1
  Product B → Partition 1 → Consumer 2 → count = 1  (doesn't see Product A's update)
  Final count: 1 (wrong, should be 2)

With category key:
  Product A → Partition 0 → Consumer 1 → count = 1
  Product B → Partition 0 → Consumer 1 → count = 2  (sees Product A's update)
  Final count: 2 (correct)
```

Same key = same partition = guaranteed ordering for that key. Different keys can process in parallel without conflicts.

**Consumer Groups**

A **consumer group** is a set of consumers sharing work on a topic:

```text
Topic: product-listed (3 partitions)

Search Group:
├── Consumer 1 → Partition 0
├── Consumer 2 → Partition 1
└── Consumer 3 → Partition 2

Category Counter Group:
├── Consumer A → Partition 0, 1
└── Consumer B → Partition 2
```

Rules:

- One partition → one consumer (within a group)
- Max parallelism = partition count
- 3 partitions, 5 consumers = 2 idle

**Committing Offsets**

Instead of deleting messages, you **commit offsets**. This is your position in the partition:

```typescript
const consumer = kafka.consumer({ groupId: "search-indexer" });

await consumer.subscribe({ topic: "product-listed" });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value?.toString() ?? "{}");

    await elasticsearch.index({
      index: "products",
      id: event.productId,
      body: event.product,
    });
  },
});
```

Commit says "I've processed up to here." Consumer restarts? Resumes from last committed offset.

**Retention**

Messages aren't deleted on read. They're kept based on **retention policy** (e.g., 7 days):

- **Replay**: New consumer groups can process historical messages
- **Recovery**: Bug in consumer? Fix it, reprocess from the beginning
- **Speed differences**: Fast consumers don't wait for slow ones

```text
Retention: 7 days

Day 1: [msg1, msg2, msg3]
Day 4: [msg1, msg2, msg3, ..., msg500]
Day 8: [msg200, ..., msg700]  ← Old messages deleted
```

### Choosing Between Them

| Scenario                                     | Choose |
| -------------------------------------------- | ------ |
| One event → one type of work                 | Queue  |
| One event → multiple types of work           | Stream |
| Need to replay messages                      | Stream |
| Simple task distribution                     | Queue  |
| Event sourcing / audit log                   | Stream |
| Multiple downstream systems need same events | Stream |
| Fire-and-forget notifications                | Queue  |

## Real-time Pub/Sub

Queues and streams have something in common: consumers **pull** messages. They ask for data when they're ready. This gives them flexibility. Each consumer moves at its own pace while messages buffer.

But what if you don't want consumers to pull? What if you want to **push** data to them the moment it arrives?

That's real-time Pub/Sub.

### Push vs Pull

![Pub/Sub pushes messages to subscribers instead of them pulling](https://pulkit.blog/assets/content/blogs/async-processing/pubsub.webp)

In queues and streams:

- Consumer polls: "Got anything for me?"
- Broker responds with messages (or nothing)
- Consumer processes, comes back later

In Pub/Sub:

- Subscriber connects and waits
- Publisher sends message to channel
- Broker immediately pushes to all connected subscribers

No polling. No waiting. Instant delivery.

### Redis Pub/Sub

Redis is famous for caching, but it also has a Pub/Sub system built in. Simple and fast.

**Publisher:**

```typescript
import Redis from "ioredis";

const redis = new Redis();

async function publishConfigChange(config: AppConfig): Promise<void> {
  await redis.publish("config-updates", JSON.stringify(config));
}
```

**Subscriber:**

```typescript
import Redis from "ioredis";

const subscriber = new Redis();

subscriber.subscribe("config-updates");

subscriber.on("message", (channel, message) => {
  const config: AppConfig = JSON.parse(message);
  console.log(`Received config update on ${channel}:`, config);
  applyConfig(config);
});
```

Publisher sends. All connected subscribers receive instantly.

### Use Cases

**1. Configuration Push**

You have 50 API servers. An admin changes a feature flag. Instead of waiting for each server to poll for changes, push the update to all of them immediately.

```text
Admin Dashboard → Redis Pub/Sub → All 50 API Servers
                                  (instantly updated)
```

**2. Message Broadcast**

Chat applications. User sends a message. Server publishes to a channel. All connected clients subscribed to that channel receive it in real-time.

```typescript
async function sendChatMessage(
  roomId: string,
  message: ChatMessage,
): Promise<void> {
  await db.message.create({ data: message });

  await redis.publish(`room:${roomId}`, JSON.stringify(message));
}
```

All users in the room get the message pushed to them. No polling required.

**3. Real-time Notifications**

User gets a new follower. Push notification to their active sessions immediately.

```typescript
async function notifyNewFollower(
  userId: string,
  follower: User,
): Promise<void> {
  await redis.publish(
    `notifications:${userId}`,
    JSON.stringify({
      type: "new_follower",
      follower: { id: follower.id, name: follower.name },
    }),
  );
}
```

### The Catch: No Buffering

Here's the critical difference. Queues and streams buffer messages. Consumer offline? Messages wait. Consumer comes back? Picks up where it left off.

Pub/Sub doesn't buffer anything.

```text
Timeline:
  t=0: Subscriber A connects
  t=1: Subscriber B connects
  t=2: Publisher sends message → A and B receive it
  t=3: Subscriber C connects
  t=4: Publisher sends message → A, B, and C receive it

  C never gets the message from t=2. It wasn't connected.
```

If you're not connected when the message is sent, you don't get it. Ever. The message is gone.

### When to Use What

| Need                         | Solution        |
| ---------------------------- | --------------- |
| Guaranteed delivery          | Queue or Stream |
| Process later if offline     | Queue or Stream |
| Replay historical messages   | Stream          |
| Instant push, connected only | Pub/Sub         |
| Configuration broadcast      | Pub/Sub         |
| Real-time chat/notifications | Pub/Sub         |
| Background job processing    | Queue           |

**Pub/Sub is not a replacement for queues or streams.** It solves a different problem: low-latency push to connected clients. If reliability matters more than speed, use a queue. If you need both, use a queue for persistence and Pub/Sub for instant notification.

### Combining Them

Common pattern: use both.

```typescript
async function processOrder(order: Order): Promise<void> {
  await db.order.create({ data: order });

  await sqs.sendMessage({
    QueueUrl: ORDER_PROCESSING_QUEUE,
    MessageBody: JSON.stringify(order),
  });

  await redis.publish(
    `user:${order.userId}:orders`,
    JSON.stringify({ type: "order_created", orderId: order.id }),
  );
}
```

SQS ensures the order gets processed (even if workers are temporarily down). Redis Pub/Sub notifies connected clients immediately. Best of both worlds.

## Conclusion

Async processing is essential for responsive systems. Task takes more than a few seconds? Move it to the background.

The pattern:

1. Receive request
2. Create DB record (status: pending)
3. Push to queue or stream
4. Return immediately
5. Workers process and update status
6. User checks back or gets notified

Three tools, three purposes:

**Queues** (SQS, RabbitMQ): One event, one type of work. Consumers pull. Messages deleted after processing. Reliable delivery.

**Streams** (Kafka, Kinesis): One event, multiple consumer types. Consumers pull. Messages retained. Write once, read by many.

**Pub/Sub** (Redis): Real-time push to connected subscribers. Zero buffering. Miss it if not connected. Lowest latency.

Trade-off is complexity: queues to monitor, workers to scale, duplicates to handle. But for long tasks, the UX win is worth it. Nobody wants to stare at a spinner for five minutes.

I've created a Kafka demo you can run locally: [github.com/pulkitxm/systems/tree/main/messaging/kafka](https://github.com/pulkitxm/systems/tree/main/messaging/kafka). It sets up Kafka with Docker Compose and includes producer/consumer scripts to see topics, partitions, and consumer groups in action.

Start with RabbitMQ locally. Push messages, consume them. Try Kafka to see consumer groups in action. Set up Redis Pub/Sub to feel the difference between pull and push. Once you understand all three, you'll know exactly which fits each problem.

## Related writing

- [Introduction to Big Data Tools](https://pulkit.blog/system-design/big-data-tools.md): January 24, 2026
- [Bloom Filters](https://pulkit.blog/system-design/bloom-filters.md): January 24, 2026
- [Caching](https://pulkit.blog/system-design/caching.md): January 8, 2026
