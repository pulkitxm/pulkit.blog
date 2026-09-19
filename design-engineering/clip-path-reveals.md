# Invisible Scissors

> clip-path trims elements into circles and polygons, but it is also a powerful animation tool. Learn how inset clipping works, build before and after sliders without extra wrappers, reveal images without layout shift, and fire reveals with Intersection Observer.

- URL: https://pulkit.blog/design-engineering/clip-path-reveals/
- Published: March 25, 2026
- Tags: CSS, clip-path, Reveals, Motion Design
- Part of: [Design Engineering](https://pulkit.blog/design-engineering.md)

You have probably seen `clip-path` used to turn a box into a triangle or a circle. It is a layout neutral way to change what gets painted. That same idea is what makes `clip-path` so good for motion. Once you start animating the shape of the clip, you get wipes, reveals, and masks that stay on the compositor friendly path.

## TL;DR

- **`clip-path` hides pixels, not layout.** The element still occupies the same box as before, similar to `transform`
- **Basic shapes** include `circle`, `ellipse`, `polygon`, `inset`, and `url()` for SVG paths
- **`inset(top right bottom left)`** is the workhorse for wipes and sliders because every value maps to a straight edge you can drive with a pointer or a timeline
- **Before and after comparisons** can clip the top layer with `inset(0 var(--r) 0 0)` instead of juggling extra overflow wrappers
- **Image reveals** can animate from `inset(100%)` to `inset(0)` so the asset is already sized and no height animation causes reflow
- **Scroll triggers** pair naturally with the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) so the reveal starts when the user can actually see it

## What gets clipped

`clip-path` defines a region. Pixels outside that region are not drawn. Pixels inside stay visible. It is a visual cut, not a change to width, height, or document flow.

**Interactive demo: Clip path basics.** [Try it on the page](https://pulkit.blog/design-engineering/clip-path-reveals/).

Because layout is unchanged, you can stack two full size layers, clip only the top one, and get a perfect split without resizing either child.

## Why inset shows up in so many animations

`circle(50% at 50% 50%)` is intuitive. The radius is `50%` and the position is the center of the element. Other keywords like `ellipse`, `polygon`, and `url("...")` (an SVG clip source) cover more exotic shapes.

For interactive wipes and scroll reveals, `inset` is usually the right default. It takes up to four offsets, top, right, bottom, and left, measured from each edge toward the center. A value of `100%` on every side (`inset(100%)`) clips the whole element away. `inset(0)` shows everything.

**Interactive demo: Inset.** [Try it on the page](https://pulkit.blog/design-engineering/clip-path-reveals/).

`inset(0 50% 0 0)` pulls the clip inward from the right by half the width, so only the left half of the layer stays visible. Swap which edge you inset and you change the direction of the wipe.

## Before and after sliders

A classic pattern is two images aligned in the same box. The top image gets a clip that follows the handle. As the user drags, you update one inset value from `0%` to `100%`.

**Interactive demo: Comparison slider.** [Try it on the page](https://pulkit.blog/design-engineering/clip-path-reveals/).

`comparison-slider-demo.tsx`

```tsx
"use client";

import { useCallback, useRef, useState } from "react";

export function ComparisonSliderDemo() {
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPct(Math.round((x / rect.width) * 100));
  }, []);

  const rightInset = 100 - pct;

  return (
    <div
      ref={containerRef}
      className="relative aspect-video overflow-hidden"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragging.current = true;
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        updateFromClientX(e.clientX);
      }}
      onPointerUp={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        dragging.current = false;
      }}
      onPointerCancel={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        dragging.current = false;
      }}
    >
      <div className="absolute inset-0 bg-amber-500" aria-hidden />
      <div
        className="absolute inset-0 bg-emerald-500"
        style={{ clipPath: `inset(0 ${rightInset}% 0 0)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
        style={{
          left: `${pct}%`,
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
}
```

You could solve the same problem with two elements and `overflow: hidden` plus animated widths, but `clip-path` keeps both layers full size and often stays cheaper to paint during the drag because you are not thrashing layout.

## A vertical split on type

The same stacking trick works for typography. Layer a stroked outline and a solid fill, then clip each layer with complementary insets. Moving the split line reads as a single treatment instead of a literal slider.

**Interactive demo: Text mask.** [Try it on the page](https://pulkit.blog/design-engineering/clip-path-reveals/).

`text-mask-demo.tsx`

```tsx
"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import type { DemoRef } from "../demo-showcase";

export const TextMaskDemo = forwardRef<DemoRef>(function TextMaskDemo(_, ref) {
  const [key, setKey] = useState(0);
  const [splitPct, setSplitPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    replay: () => {
      setKey((k) => k + 1);
      setSplitPct(50);
    },
  }));

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const p = Math.min(Math.max((y / rect.height) * 100, 10), 90);
    setSplitPct(Math.round(p));
  }, []);

  const bottomHide = 100 - splitPct;
  const dashedClip = `inset(0 0 ${bottomHide}% 0)`;
  const solidClip = `inset(${splitPct}% 0 0 0)`;

  return (
    <div key={key} className="flex size-full flex-col items-center justify-center gap-4 p-6">
      <div
        ref={containerRef}
        className="relative flex h-40 w-full max-w-md cursor-ns-resize touch-none select-none items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950"
        onPointerMove={onPointerMove}
      >
        <div className="relative flex h-24 items-center justify-center">
          <span
            className="absolute font-bold text-5xl text-transparent"
            style={{
              clipPath: dashedClip,
              WebkitTextStroke: "2px rgb(163 163 163)",
            }}
          >
            reveal
          </span>
          <span
            className="absolute bg-linear-to-r from-sky-500 to-purple-600 bg-clip-text font-bold text-5xl text-transparent"
            style={{ clipPath: solidClip }}
          >
            reveal
          </span>
        </div>
      </div>
      <p className="max-w-md text-center text-neutral-600 text-sm dark:text-neutral-400">
        Move the pointer vertically. The dashed outline uses{" "}
        <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-800">{dashedClip}</code> and
        the gradient fill uses{" "}
        <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-800">{solidClip}</code>.
      </p>
    </div>
  );
});
```

Here the outline uses something like `inset(0 0 calc(100% - var(--y)) 0)` while the fill uses `inset(var(--y) 0 0 0)`, both driven from the same pointer position.

## Reveals without reflow

Animating `height` from `0` to `auto` is still awkward on the web. Animating `clip-path` from fully clipped to `inset(0)` gives a similar feeling with a fixed box. The content is already there, you are only changing what is visible, so surrounding layout does not jump when the reveal finishes.

**Interactive demo: Image reveal.** [Try it on the page](https://pulkit.blog/design-engineering/clip-path-reveals/).

`image-reveal-demo.tsx`

```tsx
"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { DemoRef } from "../demo-showcase";

const CLIP_REVEAL_MS = 850;

export const ImageRevealDemo = forwardRef<DemoRef>(function ImageRevealDemo(_, ref) {
  const [replayNonce, setReplayNonce] = useState(0);
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    replay: () => {
      setReplayNonce((n) => n + 1);
    },
  }));

  useEffect(() => {
    setOpen(false);
    if (replayNonce === 0) {
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setOpen(true);
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    const openAfterClose = window.setTimeout(() => {
      setOpen(true);
    }, CLIP_REVEAL_MS + 50);
    return () => {
      clearTimeout(openAfterClose);
    };
  }, [replayNonce]);

  return (
    <div className="flex size-full flex-col items-center justify-center gap-4 p-6">
      <div
        className="aspect-video w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 shadow-md dark:border-neutral-700"
        style={{
          clipPath: open ? "inset(0)" : "inset(100%)",
          transition: `clip-path ${CLIP_REVEAL_MS / 1000}s cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      >
        <div
          className="size-full min-h-48 bg-linear-to-br from-violet-600 via-fuchsia-600 to-orange-500"
          aria-hidden={true}
        />
      </div>
      <p className="max-w-md text-center text-neutral-600 text-sm dark:text-neutral-400">
        The panel keeps its size in the layout. Only the clip animates from{" "}
        <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-800">inset(100%)</code> to{" "}
        <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-800">inset(0)</code>, so
        nothing reflows around it.
      </p>
    </div>
  );
});
```

That difference matters for images and hero media where you do not want the page to reflow as the file appears.

## Triggering when the element is on screen

A reveal that runs while the element is below the fold might finish before the user scrolls to it. You want the animation tied to visibility.

The Intersection Observer API is the lightweight choice. Create an observer with a sensible `threshold`, toggle a class or state when `isIntersecting` is true, and run the `clip-path` transition in CSS or inline styles. If you already ship [Framer Motion](https://www.framer.com/motion/), its `useInView` hook wraps the same idea with a React friendly API, at the cost of pulling the library into that bundle.

**Interactive demo: Scroll reveal.** [Try it on the page](https://pulkit.blog/design-engineering/clip-path-reveals/).

`scroll-reveal-demo.tsx`

```tsx
"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { DemoRef } from "../demo-showcase";

const panels = [
  {
    from: "from-slate-600",
    id: "slate",
    to: "to-slate-800",
  },
  {
    from: "from-rose-500",
    id: "rose",
    to: "to-orange-600",
  },
  {
    from: "from-emerald-500",
    id: "emerald",
    to: "to-teal-700",
  },
] as const;

function RevealPanel({ from, to }: { from: string; to: string; remountId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const root = el.closest("[data-scroll-reveal-root]");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
        }
      },
      {
        root: root instanceof Element ? root : null,
        rootMargin: "0px",
        threshold: 0.35,
      },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="shrink-0 px-2 pb-4">
      <div
        className={cn(
          "h-28 w-full max-w-full rounded-xl bg-linear-to-br shadow-md transition-[clip-path] duration-700 ease-out",
          from,
          to,
        )}
        style={{
          clipPath: visible ? "inset(0)" : "inset(0 100% 0 0)",
        }}
      />
    </div>
  );
}

export const ScrollRevealDemo = forwardRef<DemoRef>(function ScrollRevealDemo(_, ref) {
  const [remountId, setRemountId] = useState("0");

  useImperativeHandle(ref, () => ({
    replay: () => {
      setRemountId(String(Date.now()));
    },
  }));

  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 p-4">
      <div
        data-scroll-reveal-root={true}
        className="h-64 w-full max-w-sm overflow-y-auto overflow-x-hidden rounded-xl border border-neutral-200 bg-neutral-100/80 dark:border-neutral-700 dark:bg-neutral-900/80"
      >
        <div className="py-3">
          <p className="px-4 pb-2 text-center text-neutral-500 text-xs dark:text-neutral-400">
            Scroll inside this box
          </p>
          <div className="h-24 shrink-0" aria-hidden={true} />
          {panels.map((p) => (
            <RevealPanel
              key={`${remountId}-${p.id}`}
              remountId={remountId}
              from={p.from}
              to={p.to}
            />
          ))}
          <div className="h-40 shrink-0" aria-hidden={true} />
        </div>
      </div>
      <p className="max-w-sm text-center text-neutral-600 text-sm dark:text-neutral-400">
        Each strip uses an IntersectionObserver with this scroll container as{" "}
        <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-800">root</code>. When it
        crosses the threshold,{" "}
        <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-800">clip-path</code> eases
        from off-screen to full.
      </p>
    </div>
  );
});
```

Pass the scrollable container as the `root` option when the reveal lives inside an overflow element so thresholds are measured against the right viewport.

## Conclusion

`clip-path` is a mask you can animate. `inset` gives you predictable edges for sliders, scroll reveals, and progressive disclosure without resizing the DOM, and it lands on the compositor in modern browsers so it stays cheap to paint. When you need diagonals or organic cuts, `polygon()` can morph between shapes as long as both states share the same number of points, though it is easier to get wrong than four straight edges.

Pair reveals with Intersection Observer so they fire when the user can see them, profile on real devices when using complex `path()` or `url(#svg)` clips, and once you know what to look for you will notice this pattern on every polished production site you visit.

## Related writing

- [Smooth Operators](https://pulkit.blog/design-engineering/css-transitions.md): February 27, 2026
- [Easing Curves That Feel Natural](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural.md): January 27, 2026
- [Choreographing Multi-Step Motion](https://pulkit.blog/design-engineering/keyframe-animations.md): March 15, 2026
