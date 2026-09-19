# Branded Types in TypeScript

> Learn how branded types can prevent ID mix-ups and enforce domain rules across your TypeScript, Next.js, Drizzle, and Zod codebase.

- URL: https://pulkit.blog/branded-types-in-typescript/
- Published: December 26, 2025
- Tags: TypeScript, Type Safety, Branded Types, Drizzle ORM, Zod, Node.js

## Why String and Number Aren’t Enough

When your project is small, you can get away with using plain `string` and `number` for everything. But as your codebase grows, multiple entities, multiple IDs, different units of measure, **“just use `string`” turns into a source of subtle, expensive bugs**.

In this post, you’ll see:

- **Why plain primitives break down** in real-world codebases
- **How branded types work in TypeScript** (with a single reusable `Brand` helper)
- **How to push brands into Drizzle ORM and Zod**, so your types stay consistent end‑to‑end
- **How to handle raw values, numbers, and units** with brands
- **When to use brands vs unions, template literals, or wrappers**

---

## The Core Problem: All Strings Look the Same

In most TypeScript codebases, IDs and primitive values are just strings or numbers:

```typescript
type UserId = string;
type InvoiceId = string;
type SaleId = string;
```

This works until your app grows. Then you see code like:

```typescript
function getInvoice(id: InvoiceId) {
  return { id };
}

async function example() {
  const user = await getUser();
  getInvoice(user.latestSaleId);
}
```

If `latestSaleId` is a `string` and `getInvoice` expects a `string`, **TypeScript is perfectly happy**. But conceptually, this is wrong:

- `latestSaleId` is a `SaleId`
- `getInvoice` wants an `InvoiceId`

Both are strings, but they are **different concepts**. In a large codebase with dozens of ID types (user, org, tenant, order, invoice, payment, session…), this kind of mix-up becomes easy and dangerous.

You want the **type system to encode your domain**, not just primitive shapes.

---

## Your First Branded Type

A **branded type** lets you create a distinct type from a primitive, without changing its runtime representation.

Let’s start with a single branded `InvoiceId`:

```typescript
declare const __brand: unique symbol;

export type InvoiceId = string & { [__brand]: "invoiceId" };
```

Here:

- `InvoiceId` is still a `string` at runtime.
- The extra `{ [__brand]: "invoiceId" }` part only exists in the type system.
- Because `__brand` is a `unique symbol`, TypeScript treats `InvoiceId` as different from plain `string`.

You can now write:

```typescript
function getInvoice(id: InvoiceId) {
  return { id };
}

declare const invoiceId: InvoiceId;
declare const rawString: string;

getInvoice(invoiceId); // ✅

getInvoice(rawString); // ❌ Type error
```

You still pass strings at runtime, but the compiler prevents you from accidentally passing any old `string` that isn’t an `InvoiceId`.

---

### Creating an InvoiceId Value

Most of the time you will start from a plain string (for example from your database or an external API) and want to treat it as an `InvoiceId`:

```typescript
const rawId = "inv_123";

const invoiceId: InvoiceId = rawId as InvoiceId;
```

This does not change anything at runtime; it only tells TypeScript that this particular value should be considered an `InvoiceId`. Later in the post we will see safer ways to do this branding (with Zod and assertion functions), but this is the minimal starting point.

### Drizzle: Getting Branded IDs from the Database

You can also push the brand into your database schema so that Drizzle returns an `InvoiceId` automatically:

```typescript
import { pgTable, varchar } from "drizzle-orm/pg-core";

declare const __brand: unique symbol;

export type InvoiceId = string & { [__brand]: "invoiceId" };

export const invoices = pgTable("invoices", {
  id: varchar("id").$type<InvoiceId>().primaryKey(),
});

async function loadInvoice() {
  const invoice = await db.query.invoices.findFirst();
  if (!invoice) {
    return;
  }

  invoice.id; // InvoiceId
  getInvoice(invoice.id);
}
```

Now the schema is the single source of truth for the brand: everywhere else in your app, `invoice.id` is already typed as `InvoiceId`, and `getInvoice` can rely on that.

---

## Branded Types in One Reusable Helper

Copy‑pasting the `__brand` pattern for every type gets noisy quickly, so we can generalize it into a reusable helper:

```typescript
declare const brand: unique symbol;

type Brand<T, B extends string> = T & { readonly [brand]: B };

type UserId = Brand<string, "UserId">;
type InvoiceId = Brand<string, "InvoiceId">;
type SaleId = Brand<string, "SaleId">;
```

We’ll use this `Brand<T, B>` helper throughout the rest of the post:

- `Brand<T, B>` takes a base type `T` (like `string` or `number`) and intersects it with a phantom property keyed by a unique `symbol`.
- `declare const brand: unique symbol` exists only in the type system. No property is emitted at runtime.
- Each distinct brand string (`"UserId"`, `"InvoiceId"`, `"SaleId"`) produces a **distinct, non‑interchangeable type**, even though all are still just strings at runtime.

Now TypeScript can tell all these concepts apart while your runtime values stay simple.

---

## Using Branded Types in Your APIs

Once you have branded types, you can make your APIs much clearer:

```typescript
type UserId = Brand<string, "UserId">;
type InvoiceId = Brand<string, "InvoiceId">;

function getInvoice(id: InvoiceId) {
  return { id };
}

function getUserInvoices(userId: UserId) {
  return [];
}

declare const userId: UserId;
declare const invoiceId: InvoiceId;

getInvoice(invoiceId); // ✅
// getInvoice(userId)      // ❌ Type error

getUserInvoices(userId); // ✅
// getUserInvoices(invoiceId) // ❌ Type error
```

The more your domain grows, the more these branded types protect you from wiring things up incorrectly.

---

## Validating and Branding Input (Type Guards & Assertions)

The tricky part is turning **untyped input** (e.g. from `req.params` or query strings) into branded values.

### Type guards

Use a type guard to check a value and narrow it to a brand:

```typescript
type InvoiceId = Brand<string, "InvoiceId">;

function isInvoiceId(value: string): value is InvoiceId {
  return value.startsWith("inv_"); // basically validating if the string is like inv_123
}

function handleRequest(idParam: string) {
  if (!isInvoiceId(idParam)) {
    throw new Error("Invalid invoice ID");
  }

  const invoiceId = idParam;
  getInvoice(invoiceId); // invoiceId: InvoiceId
}
```

Inside the `if`, TypeScript knows `invoiceId` is an `InvoiceId`.

### Assertion functions

For cleaner call sites, you can wrap that check in an assertion:

```typescript
type PositiveSeconds = Brand<number, "PositiveSeconds">;

function isPositiveSeconds(value: number): value is PositiveSeconds {
  return value > 0;
}

function assertPositiveSeconds(
  value: number,
): asserts value is PositiveSeconds {
  if (!isPositiveSeconds(value)) {
    throw new Error("Expected a positive number of seconds");
  }
}

function waitForSeconds(seconds: PositiveSeconds) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

function scheduleReminder(seconds: number) {
  assertPositiveSeconds(seconds);
  return waitForSeconds(seconds);
}
```

At the boundary (e.g. controller, API handler), you validate once. After `assertPositiveSeconds`, the compiler treats `seconds` as a `PositiveSeconds` everywhere downstream.

<details>

<summary><strong>Wait, what do <code>asserts</code> and <code>is</code> mean here?</strong></summary>

If you’re confused by the `is` and `asserts` keywords in these function signatures, here’s what they do:

- `value is PositiveSeconds` in\
  `function isPositiveSeconds(value: number): value is PositiveSeconds`\
  is a **type predicate**. The function still returns a `boolean` at runtime, but at the type level it tells TypeScript:\
  “When this function returns `true`, you can treat `value` as `PositiveSeconds` inside the `if` block.”

- `asserts value is PositiveSeconds` in\
  `function assertPositiveSeconds(value: number): asserts value is PositiveSeconds`\
  makes this an **assertion function**. It doesn’t return a value; instead:
  - If it throws, execution stops.
  - If it returns without throwing, TypeScript assumes `value` is now definitely `PositiveSeconds` for all code that comes after the call.

So:

```typescript
if (isPositiveSeconds(seconds)) {
  // inside this block, seconds is PositiveSeconds
}

assertPositiveSeconds(seconds);
// after this line, seconds is PositiveSeconds everywhere below
```

Type predicates (`value is T`) narrow types inside conditionals, while assertion functions (`asserts value is T`) narrow types for all subsequent code if they return.

</details>

### Branding trusted values

Sometimes you generate values yourself and already know they’re valid. In those cases, a tiny helper is enough:

```typescript
type InvoiceId = Brand<string, "InvoiceId">;

function asInvoiceId(value: string): InvoiceId {
  return value as InvoiceId;
}

const id = asInvoiceId(`inv_${crypto.randomUUID()}`);
```

This does not validate; it just tells TypeScript, “this value is already safe”.

---

## Using Branded Types with Zod

Zod is your first line of defense for untrusted input (HTTP requests, forms, webhooks). You want it to emit values that are already branded.

### Why not use `z.string().brand()` directly?

Zod has a `.brand()` helper:

```typescript
import { z } from "zod";

const InvoiceIdSchema = z.string().uuid().brand("InvoiceId");

type ZodInvoiceId = z.infer<typeof InvoiceIdSchema>;
```

This works, but `ZodInvoiceId` is a **Zod-specific brand**, not your shared `InvoiceId` type. You’d end up with multiple “brands” for the same concept across your app.

### Use `.transform()` to apply your own brand

A better approach is to validate with Zod, then apply your `Brand`:

```typescript
import { z } from "zod";

type InvoiceId = Brand<string, "InvoiceId">;

const InvoiceIdSchema = z
  .string()
  .uuid()
  .transform((value) => value as InvoiceId);

type InvoiceIdFromZod = z.infer<typeof InvoiceIdSchema>; // InvoiceId
```

Usage:

```typescript
const result = InvoiceIdSchema.safeParse(input);

if (!result.success) {
  throw new Error("Invalid invoice ID");
}

const invoiceId = result.data; // InvoiceId

getInvoice(invoiceId);
```

Now:

- Zod emits `InvoiceId`
- Drizzle returns `InvoiceId`
- Your helpers accept and return `InvoiceId`

**One brand, shared across your whole stack.**

---

## Branding More Than Just IDs (Units, Currency, Content)

Branded types are not just for IDs. They work with any primitive or structural type.

### Units and time

```typescript
type Milliseconds = Brand<number, "Milliseconds">;
type Seconds = Brand<number, "Seconds">;

function sleep(seconds: Seconds) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

declare const delayMs: Milliseconds;
declare const delaySec: Seconds;

sleep(delaySec); // ✅
// sleep(delayMs) // ❌ Type error
```

No more accidentally mixing `ms` and `s`.

### Currency and other numeric domains

```typescript
type InrRupee = Brand<number, "InrRupee">;
type UsdCents = Brand<number, "UsdCents">;

interface Invoice {
  total: InrRupee;
}

declare const inr: InrRupee;
declare const usd: UsdCents;

const invoice: Invoice = { total: inr }; // ✅
// const bad: Invoice = { total: usd }  // ❌ Type error
```

You can add more domain rules (e.g. non‑negative) with the assertion patterns shown earlier.

### Safe vs unsafe content

```typescript
type SafeHtml = Brand<string, "SafeHtml">;

declare function sanitize(input: string): SafeHtml;

function render(html: SafeHtml) {
  document.body.innerHTML = html;
}

const userInput = `<script>alert('xss')</script>`;

render(sanitize(userInput)); // ✅
// render(userInput)        // ❌ Type error
```

The brand forces all HTML to go through your sanitizer before it ever touches `innerHTML`.

---

## When Branded Types Are Not the Best Tool

Branded types are great, but they are not always the simplest or clearest choice.

### Use unions for small closed sets

If a value can only be one of a few literals, a union is usually clearer:

```typescript
type TaskStatus = "pending" | "rejected" | "resolved";

interface Task {
  status: TaskStatus;
}
```

You get exhaustiveness checking in `switch` statements with no branding overhead.

### Use template literal types for patterns

When valid strings follow a pattern, template literal types can encode that pattern directly:

```typescript
type ThemeBase = "dark" | "light" | "system";
type ThemeContrast = "high" | "low" | "standard";

type Theme = `${ThemeBase}-${ThemeContrast}`;

function setTheme(theme: Theme) {
  return theme;
}

setTheme("dark-high"); // ✅
// setTheme("dark-regular") // ❌ Type error
```

No brands needed, the pattern is in the type itself.

### Use wrappers for strongest runtime guarantees

If you need heavyweight safety (e.g. security‑critical code), a wrapper type can enforce invariants at creation:

```typescript
interface Positive {
  value: number;
}

function createPositive(value: number): Positive {
  if (value <= 0) {
    throw new Error("Expected a positive number");
  }

  return { value };
}
```

This adds runtime cost and a new object, but the guarantee is very strong.

---

## Community Helpers: `ts-brand` and `effect`

If you don’t want to maintain your own `Brand` helper, two solid libraries exist:

- **[`ts-brand`](https://github.com/kourge/ts-brand)**: a tiny, focused branded-type utility.
- **[`effect`](https://effect.website)**: a full framework that includes a powerful `Brand` module with helpers like `Brand.refined`.

Example with `ts-brand`:

```typescript
import { Brand } from "ts-brand";

type UserId = Brand<string, "UserId">;

function getUser(id: UserId) {
  return id;
}
```

Example with `effect`:

```typescript
import { Brand } from "effect";

type Positive = number & Brand.Brand<"Positive">;

const asPositive = Brand.refined<Positive>(
  (value) => value > 0,
  (value) => Brand.error(`Non-positive value: ${value}`),
);
```

Both use the same phantom‑property trick you saw earlier, just packaged and maintained for you.

---

## When Branded Types Shine

Branded types are most valuable when:

- You have **many concepts that share the same primitive** (multiple IDs, currencies, units, etc.)
- You work in a **medium or large codebase** with many contributors
- You want to **encode domain rules into the type system** instead of relying on comments and discipline

They are less critical when:

- Your project is small and simple
- There are only one or two ID types
- You rarely pass raw strings or numbers around

For most serious TypeScript backends or larger frontends, the safety and clarity benefits often outweigh the small amount of extra type complexity.

---

## Bringing It All Together

With a small amount of setup, you can get an end‑to‑end safety net:

- **Branded types in TypeScript** to distinguish concepts like `UserId`, `InvoiceId`, `SaleId`, `Seconds`, `Milliseconds`
- **Drizzle ORM with `$type<Brand<...>>()`** so your database results carry the right brands automatically
- **Zod with `.transform()`** so validated input is branded consistently
- **Type guards and assertion functions** to convert untrusted primitives at the boundaries

Over time, this dramatically reduces accidental mix‑ups, clarifies your APIs, and pushes domain rules into the type system where the compiler can enforce them.

For a deeper dive into the theory and additional patterns, see Josh Goldberg’s article “[Branded Types](https://www.learningtypescript.com/articles/branded-types)”.

---

## Credits and Further Watching

[Watch on YouTube: Branded Types in TypeScript](https://www.youtube.com/watch?v=aP6w2OzidYM)

This post was inspired by the YouTube video [“Branded Types in TypeScript”](https://www.youtube.com/watch?v=aP6w2OzidYM); all credit to [the creator](https://x.com/DevSimplified) for the clear explanation and examples.

## Related writing

- [BullMQ Cron Jobs with Redis in Node.js](https://pulkit.blog/cron-jobs-with-bullmq.md): March 29, 2026
- [Kaksha: The App I Built for My Mother](https://pulkit.blog/kaksha.md): August 9, 2026
- [Prisma ORM with PostgreSQL](https://pulkit.blog/prisma-with-postgresql.md): August 17, 2024
