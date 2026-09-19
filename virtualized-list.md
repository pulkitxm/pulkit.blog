# React Virtualized List from Scratch

> Build a React virtualized list from scratch with the simple scroll math that renders only visible rows to keep huge lists smooth.

- URL: https://pulkit.blog/virtualized-list/
- Published: January 4, 2026
- Tags: React, Virtualized List, List Virtualization, Virtualization, Frontend, Performance, Web Development, DOM

When building modern web applications, rendering large lists is a very common requirement. Think of activity feeds, logs, search results, tables, or infinite scrolling views. Rendering hundreds or thousands of DOM nodes at once might look fine initially, but as the list grows, performance quickly takes a hit.

This is where **virtualized lists** come in, a performance optimization technique that can make your app feel buttery smooth even with massive datasets.

In this post, I'll walk you through what virtualized lists are, why they matter, and how you can implement a basic version in React using simple math and browser primitives. Let's dive in!

## The Problem With Large Lists

By default, React renders every item in a list. And that's usually fine for small datasets.

But here's what happens as your list grows:

- **10 items** → Everything is smooth
- **100 items** → Still acceptable
- **10,000 items** → Scrolling becomes janky
- **100,000 items** → The browser struggles badly

The issue isn't React itself. The real bottleneck is the browser handling a massive DOM tree. Layout, paint, and memory usage increase dramatically.

Yet, on the screen, the user can only see maybe 10 to 20 items at a time.

**Rendering the rest is pure waste.**

## What Is a Virtualized List?

A virtualized list renders **only the items that are visible in the viewport**, plus a small buffer. The rest of the list isn't rendered at all.

The illusion of a full list is created by:

1. A scroll container with fixed height
2. A spacer element that represents the full height of the list
3. Only rendering visible rows and positioning them correctly

As you scroll, old rows are removed and new ones are rendered in their place.

To the user, it feels like a normal list. To the browser, it's extremely lightweight.

## Core Idea Behind Virtualization

At any scroll position, we calculate:

- Which item index should appear at the top
- How many items fit in the viewport
- Which subset of items should be rendered

Everything else is skipped.

The key inputs we need are:

- Total number of items
- Fixed height of each item
- Height of the scroll container
- Current scroll position

![Virtualized list example](https://pulkit.blog/assets/content/blogs/virtualized-list/example.gif)

## The Math That Powers Virtualization

Here's the simple math that makes virtualization work:

**1. Find the first visible item:**

```text
startIndex = floor(scrollTop / itemHeight)
```

If you've scrolled 500px down and each item is 50px tall, the first visible item is at index 10 (500 ÷ 50).

**2. Calculate how many items fit in the viewport:**

```text
visibleCount = ceil(containerHeight / itemHeight)
```

If your container is 400px tall and each item is 50px, you can see 8 items at once (400 ÷ 50).

**3. Find the last item to render:**

```text
endIndex = startIndex + visibleCount + overscan
```

We add a buffer (overscan) of extra items above and below the viewport for smoother scrolling.

With these three calculations, we know exactly which items should exist in the DOM at any moment.

## Implementation: Building the VirtualList Component

Now let's build the virtualized list step by step.

### Step 1: Set Up Component Props and State

First, we define the TypeScript interface and set up our component with state:

```typescript
import { useRef, useState } from "react";

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  overscan = 5,
  renderItem,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ... rest of the implementation
}
```

We accept:

- `items`: The full array of data (generic type `T`)
- `height`: Container height in pixels
- `itemHeight`: Fixed height for each item
- `overscan`: Buffer items to render (default 5)
- `renderItem`: Function to render each item

We track `scrollTop` in state to recalculate visible items on scroll.

### Step 2: Calculate Which Items to Render

Inside the component, we calculate which items should be visible:

```typescript
const totalHeight: number = items.length * itemHeight;
const startIndex: number = Math.floor(scrollTop / itemHeight);
const visibleCount: number = Math.ceil(height / itemHeight);
const endIndex: number = Math.min(
  items.length - 1,
  startIndex + visibleCount + overscan,
);

const visibleItems: T[] = items.slice(startIndex, endIndex + 1);
```

Here we:

1. Calculate the total height needed for all items
2. Find the first visible item index based on scroll position
3. Calculate how many items fit in the viewport
4. Find the last item to render (with overscan buffer)
5. Slice the array to get only visible items

### Step 3: Render the Component

Now we return the JSX with a scrollable container and absolutely positioned items:

```typescript
<div
  ref={containerRef}
  style={{ height, overflow: "auto" }}
  onScroll={(e: React.UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop)}
>
  <div style={{ height: totalHeight, position: "relative" }}>
    {visibleItems.map((item: T, i: number) => {
      const index: number = startIndex + i
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            top: index * itemHeight,
            height: itemHeight,
            width: "100%"
          }}
        >
          {renderItem(item, index)}
        </div>
      )
    })}
  </div>
</div>
```

**Key points:**

- The outer div is our scroll container that updates `scrollTop` on scroll
- The inner div with `totalHeight` creates the illusion of a full list
- Each visible item is positioned absolutely at its correct location using `top: index * itemHeight`

<details>

<summary>Complete VirtualList Component Code</summary>

```typescript
import { useRef, useState } from "react"

interface VirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  overscan?: number
  renderItem: (item: T, index: number) => React.ReactNode
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  overscan = 5,
  renderItem
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalHeight: number = items.length * itemHeight
  const startIndex: number = Math.floor(scrollTop / itemHeight)
  const visibleCount: number = Math.ceil(height / itemHeight)
  const endIndex: number = Math.min(
    items.length - 1,
    startIndex + visibleCount + overscan
  )

  const visibleItems: T[] = items.slice(startIndex, endIndex + 1)

  return (
    <div
      ref={containerRef}
      style={{ height, overflow: "auto" }}
      onScroll={(e: React.UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((item: T, i: number) => {
          const index: number = startIndex + i
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: index * itemHeight,
                height: itemHeight,
                width: "100%"
              }}
            >
              {renderItem(item, index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

</details>

## Using the Virtualized List

Here's how you can use this component in your app:

```typescript
const items: string[] = Array.from({ length: 100000 }, (_, i) => `Row ${i}`)

export default function App() {
  return (
    <VirtualList<string>
      items={items}
      height={400}
      itemHeight={40}
      renderItem={(item: string, index: number) => (
        <div style={{ padding: "0 12px" }}>
          {index}: {item}
        </div>
      )}
    />
  )
}
```

Even with **100,000 items**, only a handful of rows are rendered at any time. Scrolling stays smooth and memory usage remains low.

## Live Demo: Virtualized vs Normal Lists

Here's a live comparison showing the performance difference between virtualized and normal lists. Try scrolling through both to see how virtualization keeps everything smooth even with thousands of items:

[Live demo: Virtualized list demo comparing performance with normal lists](https://codesandbox.io/embed/hr8wwf?view=preview&module=%2Fsrc%2FApp.tsx)

## When Should You Use Virtualized Lists?

Not every list needs virtualization. Here's a quick guide:

**Use virtualization when:**

- You're rendering 500+ items
- Each item has a fixed or predictable height
- Performance is noticeably degraded
- You're building infinite scroll features
- You're working with data-heavy dashboards

**Skip virtualization when:**

- You have fewer than 100 items
- Item heights vary significantly
- The list is rarely scrolled
- You need complex interactions between items

## Taking It Further

This implementation covers the basics, but there's a lot more you can add:

1. **Variable Heights**: Support items with different heights (more complex math involved)
2. **Horizontal Virtualization**: Apply the same concept horizontally
3. **Sticky Headers**: Keep section headers visible while scrolling
4. **Keyboard Navigation**: Ensure accessibility with proper focus management
5. **Loading States**: Add skeleton screens or spinners for async data

If you want to skip building this yourself, check out libraries like [react-window](https://github.com/bvaughn/react-window) or [react-virtualized](https://github.com/bvaughn/react-virtualized). They're battle-tested and handle edge cases you might not think of.

## Conclusion

Virtualized lists are a powerful performance optimization technique that can dramatically improve your app's responsiveness when dealing with large datasets. By rendering only what's visible, you keep the DOM lean and your app snappy.

The math behind it is surprisingly simple, just a few calculations based on scroll position and item height. And the best part? Your users will notice the difference immediately.

So next time you're building a feature that involves rendering a large list, remember: don't render what you can't see! Your browser (and your users) will thank you.

Happy coding, and may your lists always scroll smoothly!

## Related writing

- [React Context Menu with react-contexify](https://pulkit.blog/context-menu-in-react.md): August 10, 2024
- [The Cookie Sync Pattern](https://pulkit.blog/cookie-sync-pattern.md): May 4, 2026
- [React Image Gallery with PhotoSwipe](https://pulkit.blog/image-gallery-with-photoswipe.md): August 12, 2024
