# Circuit Breakers

> Learn how circuit breakers prevent cascading failures in distributed systems. Understand why services fail together, how to implement circuit breakers, and practical patterns for building resilient microservices.

- URL: https://pulkit.blog/system-design/circuit-breakers/
- Published: January 13, 2026
- Tags: System Design, Resilience, Microservices, Fault Tolerance, Distributed Systems
- Part of: [System Design](https://pulkit.blog/system-design.md)

Your database gets overwhelmed. Response times spike. Connections pile up. Timeouts start. One slow service drags down another. Then another. Within minutes, your entire system is on its knees.

This is a cascading failure. One component's degradation triggers a chain reaction that brings down services that were perfectly healthy moments ago.

Circuit breakers exist to stop this cascade.

## TL;DR

- **Cascading failures** happen when one service's slowness or failure propagates to dependent services
- **Slowness is worse than failure**: A slow service holds connections open, exhausting resources upstream
- **Circuit breakers** prevent calls to unhealthy services, allowing graceful degradation
- **Three states**: Closed (normal), Open (blocking calls), Half-Open (testing recovery)
- **Implementation**: Store service health status in a database, check before making calls
- **Fallback strategies**: Return cached data, default values, or partial responses
- **Caching config**: Cache circuit breaker state locally to avoid hammering the config database
- **Real-time updates**: Use Redis Pub/Sub to push config changes to all servers instantly

## The Problem: Cascading Failures

![A ride-sharing system architecture showing multiple interconnected services](https://pulkit.blog/assets/content/blogs/circuit-breakers/service-architecture.webp)

Imagine you're building a ride-sharing app like Uber or Ola. When a user opens the app to book a ride, several things happen:

1. **API Gateway** receives the request
2. **Ride Service** handles the booking logic
3. **Driver Service** finds available drivers nearby
4. **Maps Service** calculates ETAs and routes
5. **Surge Pricing Service** determines the fare multiplier
6. **Wallet Service** checks user's payment balance

```text
User → API Gateway → Ride Service → Driver Service
                          ↓
                    Maps Service
                          ↓
                  Surge Pricing → Analytics DB
```

Everything talks to everything. This is normal in microservices. But it's also where the danger lies.

### When Things Go Wrong

Let's say the Analytics DB gets overloaded. Maybe there's a sudden surge in ride requests during a concert ending. Maybe a batch job is running. Doesn't matter. The database is struggling.

**Stage 1: Slowdown begins**

Analytics DB normally responds in 10ms. Now it's taking 800ms. The Surge Pricing Service waits patiently. Its response time goes from 30ms to 830ms.

**Stage 2: Connections pile up**

Every request to Surge Pricing Service is now holding an HTTP connection open for 800ms instead of 30ms. Your connection pool fills up. New requests queue.

**Stage 3: Timeouts cascade**

The Ride Service has a 2-second timeout. Surge Pricing is taking 830ms, but under load, queuing adds another 1.5 seconds. Timeouts start firing.

**Stage 4: Resource exhaustion**

Ride Service connections are stuck waiting for Surge Pricing. API Gateway connections are stuck waiting for Ride Service. Thread pools fill up everywhere.

**Stage 5: Complete outage**

Your perfectly healthy Driver Service and Maps Service can't get connections. Everything fails. Users see "Something went wrong" screens. Nobody can book a ride.

![Cascading failure spreading from a slow database through multiple services](https://pulkit.blog/assets/content/blogs/circuit-breakers/cascading-failure.webp)

All because one analytics database got slow.

### Why Slowness Is Worse Than Failure

Here's the counterintuitive part: a service that fails fast is less dangerous than a service that's slow.

If Surge Pricing Service immediately returned an error, Ride Service would handle it quickly. Connection freed, move on. Maybe charge base fare without surge. Users wouldn't even notice.

But when Surge Pricing Service is slow:

- Connections stay open for seconds instead of milliseconds
- Each server has finite connection limits
- Slow responses consume resources without providing value
- The damage spreads faster than you can react

A dead service is easy to route around. A dying service takes everyone down with it.

## What is a Circuit Breaker?

A circuit breaker is a pattern that prevents your service from making calls to an unhealthy downstream service. Instead of waiting for timeouts, you fail fast and gracefully.

The name comes from electrical circuit breakers. When there's a fault, the circuit "breaks" to prevent damage. Same concept here.

### The Three States

![Circuit breaker state machine showing Closed, Open, and Half-Open states with transitions](https://pulkit.blog/assets/content/blogs/circuit-breakers/three-states.webp)

Circuit breakers operate in three states:

**1. Closed (Normal Operation)**

Everything is fine. Requests flow through normally. The circuit breaker monitors for failures.

```text
Service A ──[closed]──→ Service B
           (calls pass)
```

**2. Open (Blocking Calls)**

Too many failures detected. The circuit "opens" and blocks all calls to the failing service. Instead of waiting for timeouts, calls fail immediately.

```text
Service A ──[open]──✗ Service B
         (instant failure)
```

**3. Half-Open (Testing Recovery)**

After some time, the circuit breaker allows a few test requests through to see if the service has recovered. If they succeed, the circuit closes. If they fail, it stays open.

```text
Service A ──[half-open]──→ Service B
              (limited test calls)
```

### How It Prevents Cascading Failures

![Comparison showing system behavior with and without circuit breaker](https://pulkit.blog/assets/content/blogs/circuit-breakers/with-without-comparison.webp)

Without circuit breaker:

```text
Surge Pricing is slow
→ Ride Service waits and times out
→ API Gateway waits and times out
→ User waits 30 seconds, sees error
```

With circuit breaker:

```text
Surge Pricing is slow
→ Circuit breaker opens after detecting failures
→ Ride Service gets instant "service unavailable"
→ Ride Service uses base fare without surge
→ User books ride in 200ms, pays normal price
```

The cascade is broken. The slow service is isolated. The rest of the system continues functioning.

## Implementing a Circuit Breaker

![Services checking a central circuit breaker database before making calls](https://pulkit.blog/assets/content/blogs/circuit-breakers/implementation.webp)

There are sophisticated circuit breaker libraries (Hystrix, resilience4j, Polly), but understanding the core concept is more important than any specific implementation.

### The Basic Idea

Before making a call to another service, check if that service is healthy. If it's not, don't make the call.

```typescript
async function getSurgePricing(zoneId: string): Promise<SurgeMultiplier> {
  const isHealthy = await checkServiceHealth("surge-pricing");

  if (!isHealthy) {
    return { multiplier: 1.0, reason: "default" };
  }

  try {
    return await surgePricingService.getMultiplier(zoneId);
  } catch (error) {
    await markServiceUnhealthy("surge-pricing");
    return { multiplier: 1.0, reason: "default" };
  }
}
```

That's the essence. Everything else is optimization.

### Storing Circuit State

You need a central place to store the health status of each service. A simple key-value store works:

```sql
CREATE TABLE circuit_breaker (
  service_name VARCHAR(255) PRIMARY KEY,
  is_healthy BOOLEAN DEFAULT true,
  failure_count INT DEFAULT 0,
  last_failure_time TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Or in Redis:

```typescript
interface CircuitState {
  isHealthy: boolean;
  failureCount: number;
  lastFailureTime: number;
  lastSuccessTime: number;
}

async function getCircuitState(serviceName: string): Promise<CircuitState> {
  const state = await redis.hgetall(`circuit:${serviceName}`);
  return {
    isHealthy: state.isHealthy === "true",
    failureCount: parseInt(state.failureCount ?? "0"),
    lastFailureTime: parseInt(state.lastFailureTime ?? "0"),
    lastSuccessTime: parseInt(state.lastSuccessTime ?? "0"),
  };
}
```

### The Check-Before-Call Pattern

Every service that calls another service checks the circuit breaker first:

```typescript
async function callWithCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  const circuit = await getCircuitState(serviceName);

  if (!circuit.isHealthy) {
    const timeSinceFailure = Date.now() - circuit.lastFailureTime;
    const recoveryWindow = 30000;

    if (timeSinceFailure < recoveryWindow) {
      return fallback();
    }
  }

  try {
    const result = await fn();
    await recordSuccess(serviceName);
    return result;
  } catch (error) {
    await recordFailure(serviceName);
    return fallback();
  }
}

async function recordFailure(serviceName: string): Promise<void> {
  const circuit = await getCircuitState(serviceName);
  const newFailureCount = circuit.failureCount + 1;
  const threshold = 5;

  await redis.hmset(`circuit:${serviceName}`, {
    failureCount: newFailureCount,
    lastFailureTime: Date.now(),
    isHealthy: newFailureCount < threshold ? "true" : "false",
  });
}

async function recordSuccess(serviceName: string): Promise<void> {
  await redis.hmset(`circuit:${serviceName}`, {
    failureCount: 0,
    lastSuccessTime: Date.now(),
    isHealthy: "true",
  });
}
```

### Using It in Practice

```typescript
async function calculateRideFare(
  rideRequest: RideRequest,
): Promise<FareDetails> {
  const baseDistance = await mapsService.getDistance(
    rideRequest.pickup,
    rideRequest.dropoff,
  );

  const drivers = await callWithCircuitBreaker(
    "driver-service",
    () => driverService.findNearby(rideRequest.pickup),
    () => [],
  );

  const surge = await callWithCircuitBreaker(
    "surge-pricing",
    () => surgePricingService.getMultiplier(rideRequest.zoneId),
    () => ({ multiplier: 1.0, reason: "default" }),
  );

  const walletBalance = await callWithCircuitBreaker(
    "wallet-service",
    () => walletService.getBalance(rideRequest.userId),
    () => ({ balance: null, canPay: true }),
  );

  return {
    baseFare: baseDistance.km * RATE_PER_KM,
    surgeMultiplier: surge.multiplier,
    totalFare: baseDistance.km * RATE_PER_KM * surge.multiplier,
    driversAvailable: drivers.length,
    walletBalance: walletBalance.balance,
  };
}
```

Each downstream call is wrapped. If a service is struggling, we get fallback values instead of waiting for timeouts. The ride booking still works, just with less information.

## Fallback Strategies

When the circuit is open, you need to return something. What you return depends on your use case.

### 1. Cached Data

If you have recent data cached, return that:

```typescript
async function getDriverLocations(zoneId: string): Promise<DriverLocation[]> {
  const cacheKey = `drivers:${zoneId}`;

  const circuit = await getCircuitState("driver-service");

  if (!circuit.isHealthy) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    return [];
  }

  const drivers = await driverService.findInZone(zoneId);
  await redis.set(cacheKey, JSON.stringify(drivers), "EX", 30);
  return drivers;
}
```

### 2. Default Values

Return sensible defaults:

```typescript
function getDefaultSurge(): SurgeInfo {
  return {
    multiplier: 1.0,
    reason: "pricing_unavailable",
    message: "Standard pricing applied",
  };
}
```

### 3. Partial Response

Return what you have, mark what's missing:

```typescript
interface RideEstimateResponse {
  estimate: RideEstimate;
  eta?: number;
  surge?: SurgeInfo;
  degraded: boolean;
  unavailableServices: string[];
}

async function getRideEstimate(
  request: RideRequest,
): Promise<RideEstimateResponse> {
  const estimate = await mapsService.calculateRoute(
    request.pickup,
    request.dropoff,
  );
  const unavailableServices: string[] = [];

  let eta: number | undefined;
  try {
    eta = await callWithCircuitBreaker(
      "driver-service",
      () => driverService.getNearestETA(request.pickup),
      () => {
        unavailableServices.push("driver-eta");
        return undefined;
      },
    );
  } catch {
    unavailableServices.push("driver-eta");
  }

  return {
    estimate,
    eta,
    degraded: unavailableServices.length > 0,
    unavailableServices,
  };
}
```

### 4. Queue for Later

For non-critical operations, queue the work for when the service recovers:

```typescript
async function sendRideReceipt(ride: CompletedRide): Promise<void> {
  const circuit = await getCircuitState("notification-service");

  if (!circuit.isHealthy) {
    await queue.push("pending-receipts", {
      type: "ride_receipt",
      rideId: ride.id,
      scheduledAt: Date.now(),
    });
    return;
  }

  await notificationService.sendReceipt(ride);
}
```

## Tripping the Circuit

When should the circuit open? There are two approaches.

### Automatic: Failure Threshold

The circuit breaker tracks failures. After N consecutive failures or a failure rate above X%, it opens:

```typescript
interface CircuitConfig {
  failureThreshold: number;
  failureRateThreshold: number;
  sampleWindow: number;
  recoveryTimeout: number;
}

const defaultConfig: CircuitConfig = {
  failureThreshold: 5,
  failureRateThreshold: 0.5,
  sampleWindow: 60000,
  recoveryTimeout: 30000,
};

async function shouldOpenCircuit(serviceName: string): Promise<boolean> {
  const stats = await getRecentStats(serviceName, defaultConfig.sampleWindow);

  if (stats.consecutiveFailures >= defaultConfig.failureThreshold) {
    return true;
  }

  if (stats.totalCalls > 10) {
    const failureRate = stats.failures / stats.totalCalls;
    if (failureRate >= defaultConfig.failureRateThreshold) {
      return true;
    }
  }

  return false;
}
```

### Manual: Operator Override

Sometimes you know something is wrong before failures pile up. Maybe you're doing maintenance. Maybe you saw alerts. Manual control lets you trip circuits preemptively:

```typescript
async function tripCircuit(serviceName: string, reason: string): Promise<void> {
  await redis.hmset(`circuit:${serviceName}`, {
    isHealthy: "false",
    manualOverride: "true",
    overrideReason: reason,
    overrideTime: Date.now(),
  });
}

async function resetCircuit(serviceName: string): Promise<void> {
  await redis.hmset(`circuit:${serviceName}`, {
    isHealthy: "true",
    manualOverride: "false",
    failureCount: 0,
  });
}
```

This is often the most practical approach when starting out. Fully automated circuit breakers require careful tuning. Manual ones just require someone watching dashboards.

## The Config Query Problem

![Multiple API servers querying circuit breaker database creating a bottleneck](https://pulkit.blog/assets/content/blogs/circuit-breakers/config-bottleneck.webp)

There's an obvious issue with the implementation so far. Every request to every service queries the circuit breaker database:

```text
Request 1 → Check circuit → Query DB → Make call
Request 2 → Check circuit → Query DB → Make call
Request 3 → Check circuit → Query DB → Make call
...
```

At 10,000 requests per second across 5 services, that's 50,000 circuit breaker queries per second. You've created a new bottleneck.

### Solution: Local Caching

Cache the circuit state in each API server's memory:

```typescript
const circuitCache = new Map<
  string,
  { state: CircuitState; expiresAt: number }
>();

async function getCircuitState(serviceName: string): Promise<CircuitState> {
  const cached = circuitCache.get(serviceName);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.state;
  }

  const state = await redis.hgetall(`circuit:${serviceName}`);
  const parsed: CircuitState = {
    isHealthy: state.isHealthy === "true",
    failureCount: parseInt(state.failureCount ?? "0"),
    lastFailureTime: parseInt(state.lastFailureTime ?? "0"),
    lastSuccessTime: parseInt(state.lastSuccessTime ?? "0"),
  };

  circuitCache.set(serviceName, {
    state: parsed,
    expiresAt: Date.now() + 5000,
  });

  return parsed;
}
```

Now each server queries the database at most once every 5 seconds per service. Much better.

### The Staleness Problem

But caching introduces staleness. If you trip a circuit manually, servers won't know for up to 5 seconds. During that window, they'll keep hammering the failing service.

For many systems, 5 seconds of delay is acceptable. For critical systems, you need real-time updates.

### Solution: Push Updates with Pub/Sub

![Redis Pub/Sub pushing circuit breaker updates to all API servers instantly](https://pulkit.blog/assets/content/blogs/circuit-breakers/pubsub-updates.webp)

Use Redis Pub/Sub to push circuit state changes to all servers immediately:

```typescript
const subscriber = new Redis();
subscriber.subscribe("circuit-updates");

subscriber.on("message", (channel, message) => {
  const update = JSON.parse(message);
  const cached = circuitCache.get(update.serviceName);

  if (cached) {
    cached.state = update.state;
    cached.expiresAt = Date.now() + 60000;
  } else {
    circuitCache.set(update.serviceName, {
      state: update.state,
      expiresAt: Date.now() + 60000,
    });
  }
});

async function updateCircuitState(
  serviceName: string,
  state: Partial<CircuitState>,
): Promise<void> {
  const current = await redis.hgetall(`circuit:${serviceName}`);
  const updated = { ...current, ...state };

  await redis.hmset(`circuit:${serviceName}`, updated);

  await redis.publish(
    "circuit-updates",
    JSON.stringify({ serviceName, state: updated }),
  );
}
```

Now when you trip a circuit:

1. State is written to Redis
2. Update is published to Pub/Sub channel
3. All subscribed servers receive update instantly
4. Local caches are updated immediately

Best of both worlds: low overhead from caching, instant propagation from Pub/Sub.

## Monitoring Circuit Breakers

Circuit breakers are infrastructure. They need monitoring like any other critical component.

### Key Metrics

```typescript
interface CircuitMetrics {
  serviceName: string;
  state: "closed" | "open" | "half-open";
  failureCount: number;
  successCount: number;
  fallbackCount: number;
  lastStateChange: number;
  avgResponseTime: number;
}

async function recordMetrics(
  serviceName: string,
  success: boolean,
  responseTime: number,
): Promise<void> {
  const key = `metrics:circuit:${serviceName}`;
  const now = Date.now();
  const bucket = Math.floor(now / 60000);

  await redis
    .multi()
    .hincrby(`${key}:${bucket}`, success ? "success" : "failure", 1)
    .hincrby(`${key}:${bucket}`, "responseTime", responseTime)
    .hincrby(`${key}:${bucket}`, "count", 1)
    .expire(`${key}:${bucket}`, 3600)
    .exec();
}
```

### Alerting

Set up alerts for:

- Circuit opened (immediate attention needed)
- Circuit stayed open for > 5 minutes (something is seriously wrong)
- Fallback rate > 10% (degraded experience for users)
- Circuit flapping (opening and closing repeatedly)

```typescript
async function checkCircuitHealth(): Promise<void> {
  const circuits = await getAllCircuits();

  for (const circuit of circuits) {
    if (!circuit.isHealthy) {
      const openDuration = Date.now() - circuit.lastFailureTime;

      if (openDuration > 300000) {
        await alerting.send({
          severity: "critical",
          message: `Circuit for ${circuit.serviceName} has been open for ${Math.round(openDuration / 60000)} minutes`,
        });
      }
    }
  }
}
```

## When Not to Use Circuit Breakers

Circuit breakers add complexity. Don't use them everywhere:

**Skip circuit breakers for:**

- Synchronous, transactional operations (database writes that must succeed)
- Internal service calls within the same process
- Operations where fallback doesn't make sense
- Simple systems with few dependencies

**Use circuit breakers for:**

- External API calls (third-party services)
- Non-critical enrichment services
- Services with known reliability issues
- High-traffic paths where cascading failures are likely

## Conclusion

Cascading failures are one of the most common ways distributed systems fail. One slow service can bring down an entire platform. Circuit breakers prevent this by:

1. Detecting when downstream services are struggling
2. Failing fast instead of waiting for timeouts
3. Returning fallback values to maintain partial functionality
4. Giving failing services time to recover

The implementation doesn't need to be complex. A simple health check in a database, queried before each call, is often enough. Add local caching to reduce overhead. Add Pub/Sub for instant updates. Monitor and alert on circuit state changes.

Start simple: manual circuit breakers that you trip when you see problems. As you gain confidence, add automatic failure detection. Tune thresholds based on real traffic patterns.

The goal isn't to prevent all failures. That's impossible. The goal is to prevent one failure from becoming many. Circuit breakers are how you build systems that bend under pressure instead of breaking.

## Related writing

- [Introduction to Big Data Tools](https://pulkit.blog/system-design/big-data-tools.md): January 24, 2026
- [Consistent Hashing](https://pulkit.blog/system-design/consistent-hashing.md): January 24, 2026
- [High Availability](https://pulkit.blog/system-design/high-availability.md): January 23, 2026
