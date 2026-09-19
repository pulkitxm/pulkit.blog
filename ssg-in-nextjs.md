# Next.js Build Output Symbols (● ○ ƒ) and SSG

> Next.js build output symbols decoded: ● means SSG (prerendered as static HTML), ○ Static, ƒ Dynamic, plus how SSG, SSR and ISR work.

- URL: https://pulkit.blog/ssg-in-nextjs/
- Published: January 1, 2026
- Tags: Next.js, SSG, SSR, ISR, Build Output, React, Web Development

When building a Next.js application, understanding how your pages are rendered is crucial for optimizing performance and user experience. Two of the most powerful rendering methods Next.js offers are Server-Side Rendering (SSR) and Static Site Generation (SSG). In this post, I'll break down both concepts, show you the key differences, and walk you through practical examples so you can see exactly when and how to use each approach.

We'll build a simple page that fetches data from an API, first using SSR, then convert it to SSG, and observe the performance differences through server logs.

## SSR vs SSG

**Server-Side Rendering (SSR)** generates your page on the server **every time a user requests it**. Every request fetches fresh data and renders a new page.

**Static Site Generation (SSG)** generates pages at **build time**. The HTML is created once during build and served to all users.

| Feature            | SSR                              | SSG                          |
| ------------------ | -------------------------------- | ---------------------------- |
| **When Generated** | On each request                  | At build time                |
| **Performance**    | \~150-300ms                      | \~20-50ms                    |
| **Data Freshness** | Always up-to-date                | Frozen at build time         |
| **Use Case**       | Dashboards, personalized content | Blogs, docs, marketing pages |

## Building Our Example: A Todo Page

Let's build a practical example using the [JSONPlaceholder API](https://jsonplaceholder.typicode.com). We'll create a page that displays a todo item, first with SSR, then convert it to SSG.

The API endpoint we'll use is: [`https://jsonplaceholder.typicode.com/todos/1`](https://jsonplaceholder.typicode.com/todos/1)

Which returns:

```json
{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

### With Server-Side Rendering (SSR)

Let's start by creating a dynamic route that uses SSR. Create a new file at `app/todos/[id]/page.tsx`:

```typescript
interface Todo {
  userId: number
  id: number
  title: string
  completed: boolean
}

async function getTodo(id: string): Promise<Todo> {
  console.log(`[SSR] Fetching todo with ID: ${id} at ${new Date().toISOString()}`)

  const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch todo')
  }

  const data = await res.json()
  console.log(`[SSR] Successfully fetched todo: ${data.title}`)

  return data
}

export default async function TodoPage({ params }: { params: { id: string } }) {
  const todo = await getTodo(params.id)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
            SSR Mode
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Todo #{todo.id}
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Title</p>
            <p className="text-lg text-gray-800">{todo.title}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">User ID</p>
            <p className="text-lg text-gray-800">{todo.userId}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  todo.completed ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <span className="text-lg text-gray-800">
                {todo.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            This page is rendered on the server for every request
          </p>
        </div>
      </div>
    </div>
  )
}
```

![Todo page rendered with Server-Side Rendering showing todo details](https://pulkit.blog/assets/content/blogs/ssg-in-nextjs/todo-1-ssr.webp)

#### Key Points in the SSR Implementation:

1. **`cache: 'no-store'`**: This tells Next.js to fetch fresh data on every request, making it truly dynamic (no caching)
2. **Console logs**: Track when the function runs, you'll see these in your terminal on every request
3. **Async Server Component**: Fetching data directly in the component using React Server Components

#### SSR Server Logs

When you run your Next.js development server and navigate to `http://localhost:3000/todos/1`, you'll see logs like this in your terminal:

```bash
[SSR] Fetching todo with ID: 1 at 2025-12-13T17:17:15.184Z
[SSR] Successfully fetched todo: delectus aut autem
 GET /todos/1 200 in 66ms
[SSR] Fetching todo with ID: 2 at 2025-12-13T17:17:18.359Z
[SSR] Successfully fetched todo: quis ut nam facilis et officia qui
 GET /todos/2 200 in 88ms
```

**Every time you refresh the page**, you'll see new logs with updated timestamps. This proves that the server is fetching data and rendering the page on each request.

Try it yourself:

1. Navigate to `/todos/1`
2. Check your terminal, you'll see the fetch log
3. Refresh the page
4. See new logs with fresh timestamps

This is SSR in action, **every request triggers a new fetch and render**.

### With Static Site Generation (SSG)

Now let's convert our page to use SSG. We'll use the [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) function to tell Next.js which pages to pre-render at build time.

Update `app/todos/[id]/page.tsx`:

```typescript
// same code as above

export async function generateStaticParams() {
  const ids = await fetch("https://jsonplaceholder.typicode.com/todos");
  const data = await ids.json();
  return data.map((todo: Todo) => ({
    id: todo.id.toString(),
  }));
}
```

#### Key Changes for SSG:

1. **Added `generateStaticParams`**: This function tells Next.js which pages to pre-render
2. **Badge changed to "SSG Mode"**: Visual indicator of the rendering method

#### SSG Build Logs

Now when you build your application with:

```bash
pnpm build
```

You'll see logs like this during the build process:

```bash
Route (app)                              Size     First Load JS
┌ ○ /                                    5.42 kB        92.4 kB
├ ○ /_not-found                          871 B          87.9 kB
└ ● /todos/[id]                          338 B          87.4 kB
   ├ /todos/1
   ├ /todos/2
   ├ /todos/3
   └ [+97 more paths]
```

### Reading the `next build` output (● ○ ƒ symbols)

The symbol in front of each route tells you exactly how Next.js renders it:

- **● (SSG)**: prerendered as static HTML at build time (what `/todos/[id]` shows above, generated via `generateStaticParams`).
- **○ (Static)**: prerendered as static content with no data fetching, like `/` and `/_not-found` above.
- **ƒ (Dynamic)**: server-rendered on demand (SSR), a fresh response on every request. Older Next.js versions marked this **λ (Lambda)**.
- **ISR**: routes that export a `revalidate` value stay **●**, but are regenerated in the background after the interval you set (see the ISR section below).

Notice the key differences:

1. **Logs only appear during build**, not on each request
2. **All pages are generated at once**, todos 1, 2, and 3
3. **Timestamps are close together**, they're all built in sequence

After the build completes, when you run:

```bash
pnpm start
```

And navigate to `/todos/1`, `/todos/2`, or `/todos/3`, **you won't see any new logs in your terminal**. The pages are served as static HTML files, no server processing needed!

Try this:

1. Build your app: `pnpm build`
2. Watch the build logs, you'll see all todos being fetched
3. Start the production server: `pnpm start`
4. Visit `/todos/1` and refresh multiple times
5. Check your terminal, **no new logs appear**

This proves that the pages are truly static and not being re-rendered on each request.

## Comparing the Logs: SSR vs SSG

Let's put the log outputs side by side to see the difference:

**SSR (Development):**

```bash
pnpm dev
# Visit /todos/1
[SSR] Fetching todo with ID: 1 at 2024-12-13T10:23:45.123Z
[SSR] Successfully fetched todo: delectus aut autem

# Refresh the page
[SSR] Fetching todo with ID: 1 at 2024-12-13T10:24:02.456Z
[SSR] Successfully fetched todo: delectus aut autem

# Refresh again
[SSR] Fetching todo with ID: 1 at 2024-12-13T10:24:15.789Z
[SSR] Successfully fetched todo: delectus aut autem
```

**SSG (Build + Production):**

```bash
pnpm build
[SSG] Generating static params at build time
[SSG] Fetching todo with ID: 1 at 2024-12-13T10:30:15.456Z
[SSG] Successfully fetched todo: delectus aut autem
[SSG] Fetching todo with ID: 2 at 2024-12-13T10:30:15.789Z
[SSG] Successfully fetched todo: quis ut nam facilis et officia qui
[SSG] Fetching todo with ID: 3 at 2024-12-13T10:30:16.012Z
[SSG] Successfully fetched todo: fugiat veniam minus

pnpm start
# Visit /todos/1, /todos/2, /todos/3, refresh as many times as you want
# No logs appear! Pages are served as static files
```

The difference is clear:

- **SSR**: Logs on every request
- **SSG**: Logs only during build, never during serving

## Performance Comparison

The difference is dramatic:

**SSR Response Times:** \~150-300ms per request (server processing required)
**SSG Response Times:** \~20-50ms per request (static file serving)

SSG is **5-10x faster** than SSR because there's no server processing, just serving static HTML files.

## What About ISR?

Next.js also supports **Incremental Static Regeneration (ISR)**, which lets you update static pages after the site is built, without rebuilding the whole app. You simply export a `revalidate` value in your page file, like this:

```typescript
// Enable ISR - revalidate every hour to check for newly published blogs
export const revalidate = 3600; // 1 hour in seconds
```

I use ISR for future blog posts on this site, so new content gets picked up automatically after publishing, no full rebuild needed!

## Conclusion

Understanding SSR and SSG is fundamental to building performant Next.js applications:

- **SSR**: Renders on every request, use for dynamic, personalized content
- **SSG**: Pre-rendered at build time, use for static content
- **Performance**: SSG is significantly faster but less flexible
- **Logs**: SSR logs on each request, SSG logs only during build

The best part? Next.js makes it easy to use both in the same application. You can have your blog posts as SSG and your user dashboard as SSR, pick the right tool for each page.

Start with SSG where possible, and reach for SSR when you truly need dynamic content. Your users (and your hosting bills) will thank you!

## Related writing

- [The Cookie Sync Pattern](https://pulkit.blog/cookie-sync-pattern.md): May 4, 2026
- [Build a Contact Form with Resend in Next.js](https://pulkit.blog/contact-form-with-resend.md): December 13, 2024
- [Open Graph Images in Next.js](https://pulkit.blog/og-images-in-nextjs.md): November 15, 2024
