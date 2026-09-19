# The Cookie Sync Pattern

> How to make localStorage state work with SSR. No more hydration mismatches, no more flash of wrong content. A pattern that works for themes, sidebars, user preferences, and any persisted UI state.

- URL: https://pulkit.blog/cookie-sync-pattern/
- Published: May 4, 2026
- Tags: Next.js, React, SSR, Hydration, localStorage, State Management, Performance

You've seen this before. You persist something to localStorage (a theme preference, a sidebar width, a collapsed panel state), and it works great. Until you refresh the page.

For a split second, the page renders with the wrong state. Light mode flashes before dark mode kicks in. The sidebar snaps from its default width to wherever you left it. A panel expands, then collapses. The server rendered one thing, the client hydrated with another, and React had to patch the difference.

This is the localStorage + SSR problem. And it's not a bug in your code or your state library. It's a fundamental mismatch between what the server knows and what the client knows.

Here's the pattern I use to fix it.

## The Problem

localStorage is client-only. The server has no access to it. So when you use `atomWithStorage` (Jotai), `persist` middleware (Zustand), or any localStorage-based persistence, you're creating a gap:

```text
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER (Node.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  • No access to localStorage                                    │
│  • State initializes with defaults:                             │
│      theme = "light"                                            │
│      sidebarWidth = 224                                         │
│      panelCollapsed = false                                     │
│  • Renders HTML with default state                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                         HTML sent to browser
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│  • State library reads localStorage immediately                 │
│  • Finds persisted values:                                      │
│      theme = "dark"                                             │
│      sidebarWidth = 300                                         │
│      panelCollapsed = true                                      │
│  • First render uses these values → MISMATCH                    │
│  • React patches DOM → visible "flash"                          │
└─────────────────────────────────────────────────────────────────┘
```

Two things happen:

1. **Hydration mismatch warning**: React complains that server HTML doesn't match client markup
2. **Visual flash**: The UI renders with defaults, then snaps to the persisted state

The root cause is simple: the server can't read localStorage. So server and client start with different state, and React has to reconcile the difference visibly.

## The Solutions

There are a few ways to handle this. Let me walk through each one.

### Option 1: Accept the Flash

The simplest approach is to do nothing. Zero complexity. But the UX is jarring and React throws hydration warnings into your console. For a portfolio site, maybe acceptable. For a product, not great.

### Option 2: CSS Transition Gate

Hide or fade the affected component until the client has resolved the correct state:

```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

return (
  <div
    style={{
      opacity: mounted ? 1 : 0,
      transition: "opacity 200ms ease",
    }}
  >
    {/* content that depends on localStorage state */}
  </div>
);
```

This masks the problem with a fade. It works, but you're still rendering the wrong state briefly; you're just hiding it. And if the fade is too slow, users notice. If it's too fast, you might still catch the shift.

### Option 3: Loading/Skeleton State

Render a placeholder until the client has the real values:

```tsx
const [ready, setReady] = useState(false);

useEffect(() => {
  setReady(true);
}, []);

if (!ready) {
  return <Skeleton />;
}

return <ActualComponent />;
```

This is explicit about the loading state, which can be good UX for data-fetching scenarios. But for simple preferences like "is this panel collapsed?" or "what theme did they pick?", adding a skeleton feels heavy-handed. You're not fetching anything, you just need to read a value that already exists locally.

### Option 4: Cookie Sync (The Clean One)

The idea: sync localStorage to a cookie so the server can read it. On subsequent requests, the server knows the user's preferences and renders the correct state from the start. No mismatch, no flash.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                            REQUEST LIFECYCLE                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. BOOTSTRAP SCRIPT (runs before React hydrates)                        │
│     └─ Reads localStorage → writes preferences to cookie                 │
│                                                                          │
│  2. SSR (server receives next request with cookie)                       │
│     └─ Reads cookie → renders HTML with correct state                    │
│                                                                          │
│  3. HYDRATION (client takes over)                                        │
│     └─ State library initializes with cookie values                      │
│     └─ Matches server HTML → no mismatch, no flash                       │
│                                                                          │
│  4. USER INTERACTION                                                     │
│     └─ Changes update state + localStorage + cookie                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

The first visit still uses defaults (no cookie exists yet). But every visit after that renders correctly from the server. Let me show you the implementation.

## The Implementation

I'll use a resizable sidebar as the example, but this pattern works for any localStorage state: themes, collapsed panels, sort preferences, table column widths, whatever.

### Step 1: Define Your Preferences

First, define what you're persisting and create utilities to parse and persist the cookie:

```typescript
export const PREFS_COOKIE = "ui_prefs";

export interface UIPrefs {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
}

export const DEFAULT_PREFS: UIPrefs = {
  sidebarCollapsed: false,
  sidebarWidth: 224,
};

export function parsePrefs(cookieValue: string | undefined): UIPrefs {
  if (!cookieValue) return DEFAULT_PREFS;

  try {
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded);

    return {
      sidebarCollapsed: parsed.sidebarCollapsed === true,
      sidebarWidth: clamp(Number(parsed.sidebarWidth), 192, 384),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function persistPrefs(prefs: UIPrefs): void {
  const value = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${PREFS_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
```

### Step 2: The Bootstrap Script

This is the key piece. An inline script that runs **before React hydrates**, reading localStorage and writing to a cookie:

Use **`JSON.parse` for both keys.** Your React code should persist the **same shapes** jotai-style (`JSON.stringify` per value), otherwise the bootstrap and your client get out of sync.

```typescript
export const SIDEBAR_LS_COLLAPSED = "sidebar-collapsed";
export const SIDEBAR_LS_WIDTH = "sidebar-width";

export const BOOTSTRAP_SCRIPT = `(function(){try{
  var c = JSON.parse(localStorage.getItem(${JSON.stringify(
    SIDEBAR_LS_COLLAPSED,
  )}) || "false") === true;
  var wRaw = JSON.parse(localStorage.getItem(${JSON.stringify(SIDEBAR_LS_WIDTH)}) || "224");
  var w = Math.min(384, Math.max(192, Number(wRaw) || 224));
  var prefs = JSON.stringify({ sidebarCollapsed: c, sidebarWidth: w });
  document.cookie = "ui_prefs=" + encodeURIComponent(prefs) + "; Path=/; Max-Age=31536000; SameSite=Lax";
}catch(e){}})();`;
```

This runs synchronously before React. On the user's **next navigation or refresh**, the server receives this cookie and renders HTML that matches what localStorage will provide.

### Step 3: Server Layout

Read the cookie and pass the preferences down:

```tsx
import { cookies } from "next/headers";
import Script from "next/script";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const prefsCookie = cookieStore.get(PREFS_COOKIE)?.value;

  const prefsTrusted =
    typeof prefsCookie === "string" && prefsCookie.length > 0;
  const prefs = parsePrefs(prefsCookie);

  return (
    <html suppressHydrationWarning>
      <body>
        <Script id="prefs-bootstrap" strategy="beforeInteractive">
          {BOOTSTRAP_SCRIPT}
        </Script>

        <AppShell prefsTrusted={prefsTrusted} prefs={prefs}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
```

The `prefsTrusted` flag tells components whether the server had real preferences or used defaults. This matters for handling first visits correctly.

### Step 4: Client Component

The component that uses these preferences needs to handle three cases: trusted cookie values, first visit, and subsequent user changes.

```tsx
"use client";

import { useAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useSyncExternalStore, useEffect } from "react";

interface SidebarProps {
  prefsTrusted: boolean;
  prefs: UIPrefs;
}

export function Sidebar({ prefsTrusted, prefs }: SidebarProps) {
  const atomsToHydrate = prefsTrusted
    ? new Map([
        [sidebarCollapsedAtom, prefs.sidebarCollapsed],
        [sidebarWidthAtom, prefs.sidebarWidth],
      ])
    : new Map();

  useHydrateAtoms(atomsToHydrate);

  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom);
  const [width, setWidth] = useAtom(sidebarWidthAtom);

  const clientReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const layoutKnown = prefsTrusted || clientReady;
  const displayCollapsed = layoutKnown
    ? collapsed
    : DEFAULT_PREFS.sidebarCollapsed;
  const displayWidth = layoutKnown ? width : DEFAULT_PREFS.sidebarWidth;

  useEffect(() => {
    persistPrefs({ sidebarCollapsed: collapsed, sidebarWidth: width });
  }, [collapsed, width]);

  return (
    <aside style={{ width: displayCollapsed ? 68 : displayWidth }}>
      {/* sidebar content */}
    </aside>
  );
}
```

Let me break down what's happening:

**`useHydrateAtoms`**: Only hydrate when we have trusted cookie values. This primes Jotai with the server-side values so there's no mismatch.

**`useSyncExternalStore`**: A safe pattern for detecting client-side rendering. Server returns `false`, client returns `true`. No hydration mismatch because both snapshots are used correctly. After hydrate, it switches to `true`.

**`layoutKnown`**: When `prefsTrusted` (cookie exists), use real values immediately. When not trusted (first visit), use defaults until `clientReady` flips. This ensures server HTML always matches the client's first render.

**`useEffect` for cookie sync**: Whenever the user changes preferences, persist to the cookie so the next SSR request has the updated values.

## Why a Cookie?

You might wonder if you can just configure Jotai (or Zustand, or Redux) differently to avoid this. The answer is no, because the problem isn't the state library.

localStorage doesn't exist on the server. Node.js has no `localStorage` API. The only way to get client-side data to the server during a render is via **HTTP headers**, and the `Cookie` header is the standard way to do that.

The bootstrap script approach works because:

1. It runs synchronously before React hydrates
2. It reads localStorage (client-side)
3. It writes a cookie (which gets sent with the next request)
4. The server can read that cookie during rendering

You're not replacing your state library. You're adding a sync layer that bridges client-only storage to server-readable storage.

## First Visit vs. Subsequent Visits

On the first visit, there's no cookie yet:

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────┐
│   Request   │ ──► │   Server    │ ──► │ No cookie → use defaults    │
│  (no cookie)│     │             │     │                             │
└─────────────┘     └─────────────┘     └─────────────────────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENT                                    │
├─────────────────────────────────────────────────────────────────────┤
│  1. Bootstrap script runs → writes cookie from localStorage         │
│  2. React hydrates → prefsTrusted = false                           │
│  3. useSyncExternalStore → clientReady = false (SSR snapshot)       │
│  4. Component uses defaults → matches server HTML                   │
│  5. After hydrate: clientReady = true → shows real values           │
│  6. Smooth transition if state differs from defaults                │
└─────────────────────────────────────────────────────────────────────┘
```

On subsequent visits, the cookie exists:

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────┐
│   Request   │ ──► │   Server    │ ──► │ Cookie found → parse prefs  │
│ (with cookie)│    │             │     │ Use actual user values      │
└─────────────┘     └─────────────┘     └─────────────────────────────┘
                                                      │
                                                      ▼
                                        ┌─────────────────────────────┐
                                        │ Render HTML with correct    │
                                        │ state from the start        │
                                        └─────────────────────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENT                                    │
├─────────────────────────────────────────────────────────────────────┤
│  1. Bootstrap script runs → refreshes cookie (in case LS changed)   │
│  2. React hydrates → prefsTrusted = true                            │
│  3. State initialized with cookie values                            │
│  4. localStorage has same values → NO MISMATCH                      │
│  5. No flash, no React warning                                      │
└─────────────────────────────────────────────────────────────────────┘
```

The first visit still has the potential for a flash if the user has existing localStorage values from before you implemented this. But subsequent visits are perfect.

## Trade-offs

| Approach                | Pros                         | Cons                                     |
| ----------------------- | ---------------------------- | ---------------------------------------- |
| **Cookie sync**         | SSR matches client, no flash | Extra cookie, bootstrap script           |
| **CSS transition gate** | Simple to implement          | Still renders wrong state, just hides it |
| **Skeleton/loading**    | Explicit loading UX          | Heavy for simple preferences             |
| **Accept the flash**    | Zero complexity              | Poor UX, hydration warnings              |

Cookie sync is more setup upfront, but it's a one-time cost. After that, it just works. The cookie adds a few bytes to every request, maybe 50-100 bytes for typical UI preferences. Negligible.

## Works With Any State Library

I showed Jotai in the examples, but the pattern is the same for any state library:

**Zustand**: Create a bootstrap script that reads from Zustand's `persist` middleware localStorage key. Parse it, write to cookie, read cookie on server.

**Redux Persist**: Same idea. The bootstrap script reads from Redux Persist's localStorage key (usually `persist:root` or similar), extracts the values you need, writes to cookie.

**React Context**: If you're using plain Context with localStorage, create a server component that reads the cookie and passes values to a client provider.

**No library (just useState + localStorage)**: Works too. The server passes cookie values as props, the client component initializes state with those props, then syncs to localStorage.

The principle is always the same: localStorage is client-only, cookies are server-readable. The bootstrap script bridges them.

## Real-World Use Cases

This pattern applies to more than sidebars:

- **Theme preferences**: Dark mode, high contrast, font size
- **Layout preferences**: Collapsed panels, split pane ratios, table column widths
- **Sort/filter state**: Remembered sort order, active filters
- **Onboarding state**: Which tooltips have been dismissed
- **Feature flags**: Client-side feature toggles that affect layout

Anywhere you're persisting UI state to localStorage and that state affects the initial render, you'll benefit from cookie sync.

## Wrapping Up

The localStorage hydration flash is one of those problems that seems minor until you notice it. Then it's all you can see. Light mode flashing before dark mode. Sidebars snapping. Panels jumping around.

Cookie sync solves it cleanly for returning users, and first visits degrade gracefully to defaults. It's a bit more code upfront, but the result is a page that looks right from the first paint.

If you have questions or found a better approach, reach out on any of my [socials](https://pulkit.page/contact/). Happy building!

## Related writing

- [Next.js Build Output Symbols (● ○ ƒ) and SSG](https://pulkit.blog/ssg-in-nextjs.md): January 1, 2026
- [React Virtualized List from Scratch](https://pulkit.blog/virtualized-list.md): January 4, 2026
- [Build a Contact Form with Resend in Next.js](https://pulkit.blog/contact-form-with-resend.md): December 13, 2024
