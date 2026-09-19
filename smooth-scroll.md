# Smooth Scrolling in Next.js

> How to add buttery smooth scrolling to a Next.js app using Lenis, GSAP ScrollTrigger, and Locomotive Scroll. The tradeoffs, the setup, and when you actually need it.

- URL: https://pulkit.blog/smooth-scroll/
- Published: March 3, 2026
- Tags: Next.js, Scroll, GSAP, Lenis, Web Development, Frontend

You've visited those websites. The ones where scrolling feels like gliding through silk. Every section flows into the next, parallax layers shift at different speeds, and the whole page feels like it has weight and momentum. Then you go back to your own project and it feels like dragging a cardboard box across concrete.

That's the gap smooth scrolling fills. And it's not as complicated as it looks.

## What Is Smooth Scrolling?

By default, the browser scrolls in discrete steps. On most systems, each scroll tick jumps a fixed number of pixels. It's fast and functional, but it feels mechanical. There's no easing, no momentum, no interpolation between positions.

Smooth scrolling replaces the browser's native scroll with a virtual one. Instead of jumping, the page lerps (linearly interpolates) toward the target scroll position over time. The result is that buttery, weighted feeling where the page seems to coast to a stop instead of snapping.

```text
Native scroll:   Jump → Jump → Jump → Stop
Smooth scroll:   Ease ~~~~ Glide ~~~~ Coast → Settle
```

Under the hood, most smooth scroll libraries do the same thing:

1. Hijack the native scroll event
2. Track the target scroll position
3. On each animation frame, interpolate the current position toward the target
4. Apply the interpolated position via `transform: translateY()` or similar

That last part is important. Good libraries use transforms instead of actually scrolling the page, which means the animation stays on the GPU compositor thread and doesn't trigger layout recalculations.

## When You Actually Need It

Before we get into implementation, let's be honest: you don't always need smooth scrolling.

**Use it when:**

- You're building a portfolio, landing page, or marketing site where the scroll experience is part of the design
- You have scroll-driven animations (parallax, reveal effects, pinned sections) that benefit from interpolated scroll values
- You want consistent scroll behavior across all browsers and devices

**Skip it when:**

- You're building a content-heavy app (docs, dashboards, long-form text) where users just want to get to their content
- Accessibility is a primary concern and you can't guarantee a good fallback
- Performance on low-end devices matters more than polish

Smooth scroll libraries intercept the native scroll, which means they can break expected behaviors: browser find-in-page, anchor links, keyboard navigation, and accessibility tools. The good libraries handle most of these edge cases, but it's still a tradeoff.

## The Libraries

There are three main options in the ecosystem right now:

| Library                                 | Approach                            | Bundle Size           | Active     |
| --------------------------------------- | ----------------------------------- | --------------------- | ---------- |
| **Lenis**                               | requestAnimationFrame lerp          | \~4KB gzip            | Yes        |
| **GSAP ScrollTrigger + ScrollSmoother** | GSAP-powered with pin/parallax      | Part of GSAP (\~24KB) | Yes        |
| **Locomotive Scroll v5**                | Virtual scroll with data attributes | \~12KB gzip           | Maintained |

**Lenis** is the current go-to. It's lightweight, works well with any animation library, and has first-class React/Next.js support. Studio Freight (now Darkroom) built it and it's used on a ton of awwwards-winning sites.

**GSAP ScrollSmoother** is the premium option. If you're already using GSAP for animations (and you probably should be), ScrollSmoother integrates seamlessly. The catch: it requires a GSAP Club membership for production use.

**Locomotive Scroll** was the king for a while. v5 is a rewrite that's much lighter than v4. It's still solid but Lenis has largely taken over its mindshare.

I'll show you how to set up each one.

## Setting Up Lenis in Next.js

Lenis is the simplest to get running. Install it:

```bash
pnpm add lenis
```

Create a provider component that initializes Lenis and makes it available throughout your app:

```tsx
"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

Then wrap your layout:

```tsx
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
```

And add the required CSS. Lenis needs the html element to be set up correctly:

```css
html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}
```

That's it. Your entire app now has smooth scrolling. The `duration` controls how long it takes for the scroll to catch up (higher = more floaty), and the `easing` function controls the deceleration curve.

## Setting Up Locomotive Scroll v5

Locomotive Scroll is just as straightforward. Install it:

```bash
pnpm add locomotive-scroll
```

Since Locomotive Scroll relies on the `window` object, you need to import it dynamically in Next.js:

```tsx
"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      const locomotiveScroll = new LocomotiveScroll();
    })();
  }, []);

  return <main>{/* your content */}</main>;
}
```

The async import is necessary because Locomotive Scroll accesses `window` on initialization. Without it, you'll get a "window is not defined" error during server-side rendering.

Locomotive also gives you `data-scroll` attributes for quick parallax effects:

```tsx
<div data-scroll data-scroll-speed="0.5">
  This element scrolls at half speed
</div>

<h1 data-scroll data-scroll-speed="0.7">
  This one is a bit faster
</h1>
```

The `data-scroll-speed` attribute controls how fast an element moves relative to the scroll. Values less than 1 make it slower (parallax effect), values greater than 1 make it faster.

## Integrating with GSAP ScrollTrigger

This is where smooth scrolling gets really powerful. GSAP's ScrollTrigger lets you trigger animations based on scroll position, and when combined with smooth scrolling, the animations feel incredibly fluid.

First, install GSAP:

```bash
pnpm add gsap
```

If you're using Lenis, you need to sync it with GSAP's ticker so ScrollTrigger knows about the smooth scroll position:

```tsx
"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

The key lines here are `lenis.on("scroll", ScrollTrigger.update)` which tells ScrollTrigger to recalculate whenever Lenis scrolls, and hooking Lenis into GSAP's ticker instead of using a separate `requestAnimationFrame` loop. This keeps everything in sync on the same frame.

Now you can create scroll-triggered animations:

```tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.from(ref.current, {
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        end: "top 20%",
        scrub: true,
      },
      opacity: 0,
      y: 100,
      ease: "power3.out",
    });
  }, []);

  return <div ref={ref}>{children}</div>;
}
```

The `scrub: true` ties the animation directly to scroll progress instead of playing it once. As you scroll through the trigger zone, the animation progresses proportionally. With smooth scrolling, this scrubbing feels incredibly smooth because the scroll position itself is being interpolated.

## Parallax Sections

Parallax is the most common thing people build with smooth scrolling. The idea is simple: different layers move at different speeds to create a sense of depth.

Here's a parallax hero section using GSAP and Lenis:

```tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ParallaxHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=500px",
        scrub: true,
      },
    });

    tl.to(bgRef.current, { y: 150, scale: 1.1 }, 0);
    tl.to(titleRef.current, { y: -80 }, 0);
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden">
      <div ref={bgRef} className="absolute inset-0">
        <Image
          src="/hero-bg.webp"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>
      <h1
        ref={titleRef}
        className="relative z-10 flex h-full items-center justify-center text-6xl font-bold text-white"
      >
        Your Title Here
      </h1>
    </section>
  );
}
```

The background moves down at 150px while the title moves up at 80px over the same scroll distance. The `0` at the end of each `.to()` means both animations start at the same position in the timeline. Combined with smooth scrolling, the depth effect is very convincing.

## Pinned Sections

Another popular pattern: pinning a section in place while content scrolls past it. Think of a product showcase where the image stays fixed while feature descriptions scroll by.

```tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function PinnedShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    ScrollTrigger.create({
      trigger: imageRef.current,
      pin: true,
      start: "top 100px",
      end: () => {
        const container = containerRef.current;
        if (!container) return "+=500";
        return `+=${container.offsetHeight - window.innerHeight}`;
      },
    });
  }, []);

  return (
    <div ref={containerRef} className="flex gap-12">
      <div ref={imageRef} className="w-1/2">
        <Image src="/showcase.webp" alt="" width={600} height={400} />
      </div>
      <div className="w-1/2 space-y-96">
        <div className="rounded-lg bg-neutral-100 p-8">
          <h3 className="text-2xl font-semibold">Feature One</h3>
          <p>Description of the first feature.</p>
        </div>
        <div className="rounded-lg bg-neutral-100 p-8">
          <h3 className="text-2xl font-semibold">Feature Two</h3>
          <p>Description of the second feature.</p>
        </div>
        <div className="rounded-lg bg-neutral-100 p-8">
          <h3 className="text-2xl font-semibold">Feature Three</h3>
          <p>Description of the third feature.</p>
        </div>
      </div>
    </div>
  );
}
```

The image stays pinned while the right column scrolls past. The pin starts when the image reaches 100px from the top of the viewport and ends when the container's content has been fully scrolled through.

## Horizontal Scroll Sections

One more pattern that works beautifully with smooth scrolling: horizontal scroll sections. The user scrolls vertically, but a section moves horizontally.

```tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const scrollDistance = track.scrollWidth - window.innerWidth;

    gsap.to(track, {
      x: -scrollDistance,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        end: () => `+=${scrollDistance}`,
      },
    });
  }, []);

  return (
    <section ref={containerRef} className="overflow-hidden">
      <div ref={trackRef} className="flex gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex h-screen w-screen flex-shrink-0 items-center justify-center bg-neutral-900 text-4xl text-white"
          >
            Section {i + 1}
          </div>
        ))}
      </div>
    </section>
  );
}
```

The container is pinned, and the inner track translates left as the user scrolls down. The total scroll distance equals the overflow width of the track, so each horizontal panel maps to an equivalent amount of vertical scroll.

## Performance Considerations

Smooth scrolling is GPU work. A few things to keep in mind:

**Use `will-change: transform` sparingly.** It promotes elements to their own compositor layer, which helps with animation performance but uses more memory. Apply it to elements that are actively animating, not everything on the page.

**Avoid animating layout properties.** Stick to `transform` and `opacity`. Animating `top`, `left`, `width`, or `height` triggers layout recalculations on every frame, which kills performance.

**Test on real devices.** Smooth scrolling feels great on a MacBook Pro. It might stutter on a 3-year-old Android phone. Use Chrome DevTools performance tab to profile and watch for dropped frames.

**Respect `prefers-reduced-motion`.** Some users have motion sensitivity. Disable smooth scrolling when the user has requested reduced motion:

```tsx
useEffect(() => {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mediaQuery.matches) return;

  const lenis = new Lenis();
  // ... setup
}, []);
```

## Wrapping Up

Smooth scrolling transforms how a page feels. It takes the same content and makes scrolling through it feel intentional and crafted instead of mechanical.

Start with Lenis if you want something lightweight. Add GSAP ScrollTrigger if you need scroll-driven animations. Use Locomotive Scroll if you like the data-attribute API for quick parallax. And always, always test on actual devices.

The best smooth scroll implementations are the ones you barely notice. The page just feels good. That's the goal.

If you have questions or want to share what you built, reach out on any of my [socials](https://pulkit.page/contact/). Happy scrolling!

## Related writing

- [Build a Contact Form with Resend in Next.js](https://pulkit.blog/contact-form-with-resend.md): December 13, 2024
- [Open Graph Images in Next.js](https://pulkit.blog/og-images-in-nextjs.md): November 15, 2024
- [SEO for Next.js Portfolio](https://pulkit.blog/seo-for-nextjs-portfolio.md): December 21, 2025
