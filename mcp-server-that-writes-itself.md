# An MCP Server That Writes Itself

> A plain-language look at how to put an MCP server in front of a Hono API, reuse your existing auth and OpenAPI file, and let tools generate themselves from your routes.

- URL: https://pulkit.blog/mcp-server-that-writes-itself/
- Published: April 22, 2026
- Tags: MCP, Hono, OpenAPI, Next.js, AI, Agents, TypeScript

I was building an MCP server for [Noveum.ai](https://noveum.ai). We already had a [Hono on Next.js](https://hono.dev/docs/getting-started/nextjs#_2-hello-world) API with a lot of routes, things like traces, datasets, eval jobs, and more. We wanted tools like Claude Desktop, Cursor, and VS Code to call that API without a separate custom plugin for every editor. We also did not want to copy auth or business logic into a second system.

The Model Context Protocol is built for that. The part people skip over is how you structure the server when you are not greenfield, you are wrapping a REST API. If you get the shape right, new routes show up as new agent tools when you deploy. If you get it wrong, you are stuck hand-maintaining a second list of "tools" forever.

This post explains what MCP is in plain terms, how we wired it to Hono and OpenAPI, and how the server can generate most of its own tool list. The code is generic, but the approach is what we use at Noveum.

## TL;DR

- **MCP** is a small standard for how chat apps and agents talk to your backend. It exposes **tools** (things the model can call), **resources** (handy read-only data), and **prompts** (ready-made workflows the user can run).
- For a product hosted on the internet, the client talks to your server over **normal HTTPS** at a URL like `/api/mcp`, not a local subprocess. It sends the same **credential** you already accept on REST, whatever that is, in the `Authorization` header as `Bearer <token>`. No new password type, no new login flow.
- If you publish an **OpenAPI** description of your Hono API, you can build **one MCP tool per route** from that file and run each call through your real handlers with `app.request(...)`. You do not duplicate your logic or your auth.
- A short **block list** keeps dangerous routes (logins, admin, webhooks, key management, and the like) out of the list the model can even see.
- **Resources** are a few “read this first” API calls. **Prompts** are step-by-step instructions so the model knows to poll for async jobs instead of assuming the first response is the final one.
- You can mount all of it on one **Next.js route** in the same app and process you already run.

## What MCP Actually Is

[Model Context Protocol](https://modelcontextprotocol.io) is a shared plug shape for AI tools. You build one server, and Cursor, Claude Desktop, VS Code, and others can all use it the same way. You are not writing a new plugin for every editor.

Under the hood the messages are [JSON-RPC](https://www.jsonrpc.org/specification) style, small JSON objects with a `method` name and `params`. You do not need to memorize the shape to follow the rest of the post.

### The Three Primitives

Every MCP server offers three kinds of thing. Keeping them straight helps you design a good server.

| Primitive    | Who triggers it          | Mental model               | Example                                 |
| ------------ | ------------------------ | -------------------------- | --------------------------------------- |
| **Tool**     | The model, autonomously  | A function call            | `get_traces`, `run_quality_analysis`    |
| **Resource** | The host or user         | A read-only file or URL    | `noveum://projects`, `noveum://scorers` |
| **Prompt**   | The user (slash command) | A pre-baked system message | `/debug_traces`, `/run_evaluation`      |

The model chooses **tools** on its own. The app or the user often pulls in **resources** to seed context. The user runs **prompts** as slash commands. If something should load every time the user opens a session, it is probably a resource, not a tool. If something is a fixed multi-step flow, it is often a **prompt**.

### A Typical Session

A typical session looks like this:

![MCP session sequence: Client and Server exchange initialize, serverInfo, notifications/initialized, tools/list, resources/list, prompts/list, and tools/call with JSON-RPC style messages.](https://pulkit.blog/assets/content/blogs/mcp-server-that-writes-itself/typical-session.webp)

The spec allows two ways to connect. **stdio** is for a local process the editor starts on your machine. **HTTP** is for a URL on the public internet, which is what you want for a live product. The client `POST`s JSON to something like `https://noveum.ai/api/mcp` and sends your bearer token in a header. No install on the user's laptop. Some setups also use streaming responses for long tasks, but a plain request and response is enough to start.

### Auth

MCP does not force one login style, so the easiest path is to reuse whatever you already check on your REST API, whether that is an API key, a personal access token, or a session token. Pass it in the `Authorization` header as `Authorization: Bearer <token>` and let the editor store it in config next to the server URL. If you do not have a token system yet, any opaque string your server knows how to verify works for a first pass. Later you can swap in full OAuth if you outgrow pasted tokens, but you do not need that on day one.

## Why Your OpenAPI File Matters

If your API has a real [OpenAPI](https://www.openapis.org) document, you can stop hand-writing MCP tools. Each route in the spec already has a name, text for humans, and shapes for inputs. That is almost exactly what an MCP tool needs.

With [Hono](https://hono.dev) and something like [`hono-openapi`](https://github.com/rhinobase/hono-openapi), the same Zod types you use to validate requests also fill the spec. One set of types feeds your docs, your clients, and your generated tools.

The catch is that vague docs hurt agents more than they hurt people. A summary that says "Update resource" is useless when the model is picking among dozens of tools. Before I wrote MCP glue at Noveum, I tightened the spec: clear summaries, real descriptions, response examples on the busy routes. The MCP layer only reflects what is in that file. Garbage in, garbage out.

## The Architecture

You can run the MCP handler inside the same Next.js app as your API. No second service, no extra port. The flow looks like this:

```text
┌────────────┐     ┌─────────────┐     ┌────────────────────┐     ┌─────────┐
│    IDE     │────▶│  Next.js    │────▶│  withMcpAuth       │────▶│  Hono   │
│ (Cursor)   │POST │  /api/mcp   │     │  + McpServer       │     │  app    │
└────────────┘     └─────────────┘     └────────────────────┘     └─────────┘
                                              │   │   │
                                              │   │   └── prompts (hand-written)
                                              │   └────── resources (curated GETs)
                                              └────────── tools (from OpenAPI)
```

You need four pieces:

1. One Next.js route that serves `/api/mcp`.
2. The same auth check you already use for REST.
3. A small setup function that registers tools, resources, and prompts.
4. A loop over the OpenAPI file that registers one tool per allowed route.

## The Next.js Entry Point

The `mcp-handler` package wraps the official MCP SDK so you can expose a handler from a route file. The whole entry can be six lines:

```typescript
import { mcpHandler } from "@repo/api";

export const runtime = "nodejs";

export const GET = mcpHandler;
export const POST = mcpHandler;
export const DELETE = mcpHandler;
```

Put this at `app/api/mcp/[[...path]]/route.ts`. The `[[...path]]` folder name lets the library handle extra path segments. Use `runtime = "nodejs"` so you can use Prisma, Redis, and other Node-only code. Export `GET`, `POST`, and `DELETE` because the client uses those for session setup and cleanup.

The real logic lives in the imported `mcpHandler`.

## Wiring the Handler and Auth

`createMcpHandler` sets up the MCP server. `withMcpAuth` runs your auth check first and blocks bad requests:

```typescript
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const innerHandler = createMcpHandler(
  async (server: McpServer) => {
    await initializeMcpServer(server);
  },
  {
    serverInfo: { name: "myapp", version: "1.0.0" },
    instructions:
      "Read the projects and filter-values resources first, then query tools with real IDs.",
  },
  {
    basePath: "/api",
    disableSse: true,
  },
);

export const mcpHandler = withMcpAuth(innerHandler, verifyApiKey, {
  required: true,
});
```

Quick read on the options:

- `basePath: "/api"` lines up with the file path so the public URL is `/api/mcp`.
- `disableSse: true` turns off streaming responses. Plain JSON is easier on serverless. You can enable streaming later if you need live progress.
- `instructions` is optional text some clients add to the system message. Use it for global rules, like which resource to read first.
- `withMcpAuth` with `required: true` means no token, no response.

The function that verifies the token can be the same one you use for REST, cache and database included. In the example below I happen to be checking an API key record, but swap in whatever your REST middleware does today:

```typescript
export async function verifyApiKey(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;

  let record = await apiKeyCache.get(bearerToken);
  if (!record) {
    record = await db.apiKey.findFirst({
      where: {
        /* hashed lookup */
      },
    });
    if (!record) return undefined;
    await apiKeyCache.set(bearerToken, record);
  }

  return {
    token: bearerToken,
    clientId: "myapp-api-key",
    scopes: ["myapp.api"],
    extra: {
      apiKeyId: record.id,
      organizationId: record.organizationId,
      userId: record.userId,
    },
  };
}
```

Same auth check as your REST API means one mental model for users. The SDK also passes the verified token into each tool handler, so when you call Hono you can set `Authorization: Bearer` with that same value. The model acts as the user who owns the token.

## Server Initialization

The `initializeMcpServer` function is where the real work lives:

```typescript
export async function initializeMcpServer(server: McpServer): Promise<void> {
  const spec = await loadFilteredOpenApi(app);
  registerOpenApiTools(server, app, spec);
  registerResources(server, app);
  registerPrompts(server);
}
```

Three layers, in order: auto-generated tools from the spec, hand-written resources, hand-written prompts. Every fresh `McpServer` instance gets populated from this function, which means you can redeploy and new endpoints show up as tools on the next connection without touching any MCP code.

## Auto-Generating Tools From OpenAPI

This is the core idea. Inside something like `openapi-to-tools.ts` you do the following.

### 1. Load the spec in-process

Hono lets you call your own app with `app.request(url)` inside the same Node process. No HTTP round trip to yourself. Use that to read the OpenAPI JSON your app already serves:

```typescript
export async function loadFilteredOpenApi(app: Hono) {
  const res = await app.request("http://internal/api/openapi");
  if (!res.ok) {
    throw new Error(`openapi fetch failed: ${res.status}`);
  }
  const spec = (await res.json()) as OpenApiDoc;
  return filterOpenApiSpec(spec);
}
```

If that file powers your docs page, your tool list always matches what humans see in the API reference.

### 2. Block dangerous routes

Agents should not create API keys, hit admin panels, or touch webhooks. Drop those paths and operation names before you register any tool. A short list of prefixes and substrings is enough to start:

```typescript
const DENY_PATH_PREFIXES = [
  "/api/auth",
  "/api/webhooks",
  "/api/payments",
  "/api/admin",
  "/api/uploads",
  "/api/mcp",
] as const;

const DENY_PATH_SUBSTRINGS = [
  "/api-keys",
  "/credentials",
  "/signed-upload-url",
] as const;

const DENY_OPERATION_ID_SUBSTRINGS = ["apiKey", "credential", "signedUpload"];
```

If a route matches the list, it never appears in `tools/list`, so the model never tries to call it.

### 3. Turn every remaining operation into an MCP tool

For each `(path, method)` pair that survives the filter:

- **Name**: slug of `operationId`, falling back to a `method_path_slug`. MCP caps tool names at 48 characters, so hash-and-truncate anything longer and keep a `usedNames` set to de-dupe collisions.
- **Title**: `summary`.
- **Description**: `description` plus an auto-generated bulleted list of the path, query, and body parameters. The parameter list matters a lot. Agents pick tools off of descriptions, not schemas.
- **Input schema**: JSON Schema from the spec, converted to a Zod shape on the fly. Path params, query params, and `application/json` request body all end up as keys on the same input object, with the body nested under a single `body` key.
- **Handler**: rebuild the URL with path-param substitution and query string, forward the incoming Bearer on `Authorization`, and call `app.request(...)` to run the real REST handler.

Tool names in MCP are length-limited, so you may need to trim long `operationId` strings and add a short hash to avoid collisions:

```typescript
const MCP_TOOL_NAME_MAX_LEN = 48;

function shortenToMcpToolLimit(fullName: string): string {
  if (fullName.length <= MCP_TOOL_NAME_MAX_LEN) return fullName;
  const hash = createHash("sha256").update(fullName).digest("hex").slice(0, 6);
  const suffix = `_${hash}`;
  const headLen = MCP_TOOL_NAME_MAX_LEN - suffix.length;
  return `${fullName.slice(0, headLen)}${suffix}`;
}
```

Converting OpenAPI JSON Schema to Zod is mostly mechanical. One edge case is an **empty enum** in the spec, which can crash `z.enum([])`. Map that to `z.never()` so a bad spec line does not break every tool at startup:

```typescript
function jsonSchemaToZod(schema, root, required): ZodTypeAny {
  // ... type switches, $ref resolution ...
  if (
    Array.isArray(schema.enum) &&
    schema.enum.every((x) => typeof x === "string")
  ) {
    if (schema.enum.length === 0) {
      return required ? z.never() : z.never().optional();
    }
    const en = z.enum(schema.enum as [string, ...string[]]);
    return required ? en : en.optional();
  }
  // ...
}
```

For object types, allowing extra fields with `.passthrough()` avoids spurious errors when the client sends a bit more than the spec shows.

### 4. The tool handler

The tool implementation builds the same URL your REST client would and calls the app:

```typescript
server.registerTool(
  toolName,
  { title, description, inputSchema },
  async (args, { extra }) => {
    const { url, method, body } = buildRequest(path, httpMethod, args);
    const headers = new Headers({
      "content-type": "application/json",
      authorization: `Bearer ${extra.authInfo.token}`,
    });

    const res = await app.request(url, { method, headers, body });

    const { payload, truncatedChars } = await readResponsePreview(
      res,
      MAX_TOOL_RESPONSE_CHARS,
    );

    return {
      isError: !res.ok,
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { status: res.status, body: payload, truncatedChars },
            null,
            2,
          ),
        },
      ],
    };
  },
);
```

Why this matters:

- Same process means every middleware and validator you already wrote still runs. You are not maintaining two code paths.
- The token on the outer MCP request is the one you pass into Hono, so permissions match whoever owns it.
- Big JSON bodies eat the model’s context. Truncate the response, say around 200KB, and say how much you cut. The model can then ask for a smaller page or a filter.

The net effect: a new REST endpoint becomes a new MCP tool on the next deploy. No parallel catalog. No drift.

## Resources

**Tools** are actions. **Resources** are small bundles of data the app can pin into context, like a cheat sheet. They cut down on back and forth, because the model can read a project list or filter options once.

Most of mine are just fixed GETs to the same API, with the same bearer token as any other call:

```typescript
server.registerResource(
  "scorers",
  "myapp://scorers",
  {
    title: "Available Scorers",
    description:
      "All scorers available for evaluation jobs. Read this before creating an eval job.",
    mimeType: "application/json",
  },
  async (uri, { extra }) => {
    const data = await forwardJson(
      app,
      "/api/v1/scorers",
      extra.authInfo.token,
    );
    return {
      contents: [{ uri: uri.href, text: JSON.stringify(data) }],
    };
  },
);
```

Practical tips:

- Expose the data people need first, for example project lists and valid filter values, so the model does not guess bad enums.
- If a resource needs a `projectId` and the call omits it, return a small JSON object with a short `hint` instead of a stack trace. The model can fix the call on the next turn.
- Keep responses small. Some clients auto-attach resources to every message.

## Prompts

**Prompts** are slash-style shortcuts that fill in a longer instruction for the model. They are the best place to teach ordering, for example "read filter values, then list traces, then open spans for errors." A tiny example:

```typescript
server.registerPrompt(
  "debug_traces",
  {
    description: "Walk through error traces and summarise root causes",
    argsSchema: { project: z.string().optional() },
  },
  ({ project }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are debugging traces in the ${project ?? "user's"} project.
1. Read myapp://filter-values to see environments and statuses.
2. Call list_traces with status=error and size=20.
3. For each error trace, call get_trace_spans to find the failing span.
4. Summarise by failure mode, not by individual trace.

${WORKERS_AND_POLLING}`,
        },
      },
    ],
  }),
);
```

If work runs in a queue, the first POST often returns a job id, not a finished result. Models love to call that a success. Append a short shared block to every async prompt that says which GET to poll, how often, and which status values count as done:

```typescript
const WORKERS_AND_POLLING = `
---
Background work (read this every time):
- Heavy work runs in background workers. Kickoff POSTs return immediately with a runId.
- Poll the documented GET until status is terminal.
- Queue map: ETL → etl-jobs, evaluation → eval-jobs, analysis → synthetic-runs.
- Polling cadence: ETL every 3s then 15s; evaluation every 2s (cap ~5min); analysis every 5s.
- Terminal statuses: completed | failed | cancelled.
`.trim();
```

Reuse that block anywhere a prompt touches background jobs so the model does not treat "accepted" as "finished."

## Why This Design Works

1. The OpenAPI file stays the single list of routes. Docs, clients, and tools stay aligned.
2. `app.request` means one implementation of your rules, not two.
3. The same `Bearer` token as REST means users already know how to connect.
4. Plain JSON and no required streaming keeps hosting simple on serverless.
5. Filtering before you register tools means risky endpoints never show up in the model’s menu. Truncation keeps huge responses from blowing the context.

The ongoing work is documentation quality. Each new route needs a name and a sentence a model can use to choose it, not just a type signature.

## Trying It Locally

Once the route is wired up, the MCP Inspector is the fastest way to smoke-test everything:

```bash
bun dev   # starts Next.js on :3000

export KEY=nv_xxxxxxxxxxxxxxxxxxxxxx

bunx @modelcontextprotocol/inspector http://localhost:3000/api/mcp \
  --header "Authorization: Bearer $KEY"
```

You can click through tools, try arguments, and read resources. If a tool is missing, check your block list. If the name looks weird, your `operationId` may be long or repeated. A 401 usually means the auth check did not return a user.

To wire it up to Cursor for real:

```json
{
  "mcpServers": {
    "myapp": {
      "url": "http://localhost:3000/api/mcp",
      "headers": { "Authorization": "Bearer nv_xxxxxxxxxxxxxxxxxxxxxx" }
    }
  }
}
```

Drop that into `~/.cursor/mcp.json`, restart Cursor, and you should see your server in the MCP panel with all of its tools, resources, and prompts listed.

## Wrapping Up

MCP is not a second product. It is a thin front door on top of the API you already have. A route handler, an auth check, code that reads OpenAPI and registers tools, a few resources, a few prompts, and you are in business.

Tighten your spec first, then add the route. After that, new endpoints can show up as tools without you maintaining a hand-written list.

If you want to trade notes on large APIs, weird schemas, or prompts for long-running jobs, you can use my [contact form](https://pulkit.page/contact/).

A tiny runnable version of this whole thing (Hono + OpenAPI + a \~200-line MCP handler, tools generated from the spec, deny list, walkthrough demo client) lives at [pulkitxm/systems → `ai-agents/mcp-server/`](https://github.com/pulkitxm/systems/tree/main/ai-agents/mcp-server). Clone it, `bun install`, `bun run server`, `bun run demo`, and you can watch an MCP session happen end to end.

Happy shipping!

## Related writing

- [Git Worktrees](https://pulkit.blog/git-worktrees.md): May 29, 2026
- [Branded Types in TypeScript](https://pulkit.blog/branded-types-in-typescript.md): December 26, 2025
- [Build a Contact Form with Resend in Next.js](https://pulkit.blog/contact-form-with-resend.md): December 13, 2024
