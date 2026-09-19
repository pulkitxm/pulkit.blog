# Offloading Motion to the GPU

> Fix janky CSS animations by understanding the rendering pipeline. Learn which properties trigger GPU acceleration, why transform beats width, and when to choose CSS over JavaScript.

- URL: https://pulkit.blog/design-engineering/offloading-motion-to-the-gpu/
- Published: February 3, 2026
- Tags: CSS, Animations, Performance, Motion Design, GPU Acceleration
- Part of: [Design Engineering](https://pulkit.blog/design-engineering.md)

There's something special about CSS animations. No dependencies, no JavaScript, just HTML and CSS. It feels like you are writing code how it was meant to be written.

But getting CSS animations right means understanding what happens under the hood. Why some properties animate smoothly while others stutter. When the GPU gets involved. And most importantly, when to reach for CSS versus when to reach for JavaScript.

## TL;DR

- **60fps is the goal.** Your frame budget is 16.67ms. Miss it and users feel the jank
- **The rendering pipeline matters.** Style → Layout → Paint → Composite. Skip steps for performance
- **Transform and opacity are your friends.** They run on the GPU and don't trigger layout or paint
- **CSS animations are hardware-accelerated.** They keep running smoothly even when JavaScript is busy
- **JavaScript animations have their place.** Interruptibility, spring physics, and complex sequences
- **Use CSS for simple stuff.** Hover effects, enter animations, infinite loops, bundle-sensitive projects

## Choosing Between CSS and JavaScript

CSS animations are perfect for simple interactions. A button that scales on hover, a card that fades in on load, a loading spinner that rotates forever. For these cases, CSS is the obvious choice.

But here's where it gets interesting. The best interfaces don't just move things around. They respond to user input in ways that feel physical. Think about pulling down to refresh on your phone. The content stretches, bounces back, and settles. That's not a fixed duration animation. That's physics responding to your gesture.

CSS can't do that. It can't track velocity when you interrupt an animation. It can't create true spring physics where the settling time depends on how hard you pulled. It can't coordinate complex sequences that respond to changing state.

Does that mean you should always use JavaScript? No. It means you should understand what each tool does well.

**CSS excels at:**

- Transitions between two known states
- Infinite animations that loop forever
- Hardware-accelerated transforms that never drop frames
- Zero-dependency, zero-bundle-size motion

**JavaScript excels at:**

- Interruptible animations that preserve momentum
- Spring physics that feel natural
- Complex orchestrations across multiple elements
- Gesture-driven interactions

The goal isn't to pick a side. It's to know when each approach makes sense. Let's focus on CSS and explore what it does well and how to squeeze every bit of performance out of it.

## Let's Fix a Broken Animation

Nothing teaches better than fixing something broken. Here's a demo with two grids animating identically, but using different CSS properties. Click "Block Main Thread" to simulate JavaScript doing heavy work.

**Interactive demo: Janky vs smooth.** [Try it on the page](https://pulkit.blog/design-engineering/offloading-motion-to-the-gpu/).

Both grids animate a pulsing effect. The left grid animates `width` and `height`. The right grid animates only `transform: scale()`. Same visual result, completely different performance.

When you block the main thread, the left grid freezes completely. The right grid keeps pulsing smoothly. That's GPU acceleration in action, the transform animation runs on a separate thread and doesn't care what JavaScript is doing.

Let's look at the broken code:

```css
@keyframes janky-pulse {
  0%,
  100% {
    width: 100%;
    height: 100%;
  }
  50% {
    width: 40%;
    height: 40%;
  }
}

.janky-box {
  animation: janky-pulse 800ms ease-in-out infinite;
}
```

And the fixed version:

```css
@keyframes smooth-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.4);
  }
}

.smooth-box {
  animation: smooth-pulse 800ms ease-in-out infinite;
}
```

The difference? The first version changes `width` and `height`, which trigger layout calculations on the main thread. When the main thread is blocked, the animation freezes. The second version uses `transform: scale()`, which the GPU handles on a separate compositor thread, completely independent of JavaScript.

## The Rendering Pipeline

Understanding why some animations are smooth and others aren't requires understanding how browsers render pages. Every frame goes through up to four steps.

![Diagram showing the browser rendering pipeline with four stages: Style, Layout, Paint, and Composite](https://pulkit.blog/assets/content/blogs/offloading-motion-to-the-gpu/rendering-pipeline.webp)

- **Style** calculates which CSS rules apply to which elements. This happens on every frame where styles might change.

- **Layout** (also called "reflow") calculates the position and size of every element. Change `width`, `height`, `margin`, `padding`, `top`, `left`, `right`, `bottom`, or `font-size`? Layout runs.

- **Paint** fills in pixels. Text, colors, images, borders, shadows. Change `background`, `color`, `border-radius`, or `box-shadow`? Paint runs.

- **Composite** takes all the painted layers and combines them into the final image. This is where the GPU shines.

The key insight is that these steps cascade. If you trigger Layout, you also trigger Paint and Composite. If you trigger Paint, you also trigger Composite. But if you only trigger Composite, you skip Layout and Paint entirely.

```text
width change:      Style → Layout → Paint → Composite  (slowest)
background change: Style → Paint → Composite           (slow)
transform change:  Style → Composite                   (fastest)
```

## GPU Acceleration

Modern browsers have a superpower. They can offload certain animations to the GPU, freeing up the main thread to do other work.

Two properties get this special treatment: `transform` and `opacity`.

When you animate these properties, the browser creates a separate layer for the element and hands it to the GPU. The GPU can move, rotate, scale, and fade that layer without touching the main thread. Your JavaScript can be running expensive calculations, and the animation stays smooth.

**Interactive demo: Gpu acceleration.** [Try it on the page](https://pulkit.blog/design-engineering/offloading-motion-to-the-gpu/).

Add some load to the page using the button above. Notice how the transform animation keeps running smoothly while the width animation stutters. That's GPU acceleration in action.

This is why you hear "only animate transform and opacity" repeated everywhere. It's not a style preference. It's a performance reality.

```css
.element {
  transform: translateX(0);
  opacity: 1;
  transition:
    transform 300ms ease-out,
    opacity 300ms ease-out;
}

.element:hover {
  transform: translateX(20px) scale(1.05);
  opacity: 0.9;
}
```

### What About will-change?

The `will-change` property tells the browser to prepare a layer in advance.

```css
.element {
  will-change: transform;
}
```

This can help with complex animations, but use it sparingly. Every `will-change` element consumes GPU memory. Applying it everywhere defeats the purpose.

The rule I follow: don't add `will-change` until you've measured a problem. If an animation stutters and DevTools shows paint or layout issues, then consider `will-change`. Otherwise, leave it out.

## The 60fps Goal

Your monitor refreshes 60 times per second (or more, but let's use 60 as the baseline). To achieve smooth animation, your browser needs to produce a new frame every 16.67 milliseconds.

```text
1 second = 1000ms
60 frames per second = 1000ms / 60 = 16.67ms per frame
```

Miss that budget and you drop a frame. Drop enough frames and users notice. Drop a lot and they feel it as jank.

![Diagram showing frame timing with 16.67ms budgets and dropped frames](https://pulkit.blog/assets/content/blogs/offloading-motion-to-the-gpu/frame-budget.webp)

What eats into your frame budget?

- **JavaScript execution.** Event handlers, framework code, data processing
- **Style calculation.** Complex selectors, many elements
- **Layout.** Changes to geometry properties
- **Paint.** Changes to appearance properties
- **Composite.** Merging layers

CSS animations that only touch `transform` and `opacity` use almost none of this budget. The GPU handles them in parallel. You get smooth 60fps even while JavaScript does heavy lifting.

JavaScript animations using `requestAnimationFrame` compete with other main thread work. They're still smooth when the thread is idle, but they stutter when it's busy.

## When CSS Beats JavaScript

CSS animations win in specific scenarios.

### Hover Effects

A button that scales on hover doesn't need JavaScript.

```css
.button {
  transition: transform 150ms ease-out;
}

.button:hover {
  transform: scale(1.05);
}

.button:active {
  transform: scale(0.98);
}
```

**Interactive demo: Hover button.** [Try it on the page](https://pulkit.blog/design-engineering/offloading-motion-to-the-gpu/).

This runs at 60fps regardless of what else is happening on your page. No React re-renders. No state management. Just CSS doing what CSS does well.

### Enter Animations

When an element appears, CSS can handle the entrance.

```css
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeSlideIn 300ms ease-out;
}
```

For simple fades and slides, this is all you need. No JavaScript, no animation library, no bundle size.

### Infinite Animations

Loading spinners, pulsing indicators, scrolling marquees. These should always be CSS.

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

**Interactive demo: Infinite animation.** [Try it on the page](https://pulkit.blog/design-engineering/offloading-motion-to-the-gpu/).

A JavaScript spinner would need to run code 60 times per second forever. A CSS spinner tells the GPU "rotate this layer continuously" and never touches the main thread again.

### Bundle-Sensitive Projects

If you're optimizing for initial load time, every kilobyte counts. Framer Motion adds \~30KB to your bundle. React Spring is similar. For landing pages or static sites where animation needs are simple, CSS keeps things light.

## When JavaScript Beats CSS

JavaScript animations have capabilities CSS can't match.

### Interruptibility

When you click rapidly between states, CSS transitions restart from the beginning. JavaScript animations can preserve velocity and curve smoothly to new targets.

**Interactive demo: Interruptibility comparison.** [Try it on the page](https://pulkit.blog/design-engineering/offloading-motion-to-the-gpu/).

Click the targets rapidly. The CSS version jumps. The JavaScript version (using spring physics) flows. For interactive UI where users move faster than animations complete, JavaScript handles it better.

### Spring Physics

CSS can approximate springs with `linear()` or cubic-bezier overshoot, but it can't do true physics simulation. The duration is fixed. Real springs settle based on their physical properties.

```tsx
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 20,
  }}
/>
```

The motion feels different. Springs respond to velocity. They overshoot and settle naturally. CSS can fake this for simple cases, but complex interactions need the real thing.

### Complex Sequences

Coordinating multiple elements with precise timing, orchestrating staggered reveals, chaining animations based on state. CSS can do some of this with delays, but JavaScript gives you programmatic control.

```typescript
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};
```

### State-Driven Animation

When animation needs to respond to React state, data, or user input beyond simple hover/focus, JavaScript integrates more naturally with your application architecture.

## Performance Under Pressure

Here's where CSS and JavaScript diverge most clearly.

CSS animations using `transform` and `opacity` get promoted to their own compositor layer. The GPU handles them independently from everything else happening on the page. Your JavaScript could be parsing a massive JSON response, and the CSS animation won't skip a beat.

JavaScript animations work differently. Framer Motion, React Spring, and similar libraries use `requestAnimationFrame` to update element positions. Each frame, your code runs on the main thread. If the main thread is busy doing other work, your animation waits its turn. Frames get dropped.

**Interactive demo: Performance stress test.** [Try it on the page](https://pulkit.blog/design-engineering/offloading-motion-to-the-gpu/).

Increase the item count and add some artificial load. The CSS side keeps moving at 60fps. The JavaScript side starts stuttering. This isn't a criticism of Framer Motion. It's just physics. You can't run JavaScript off the main thread.

The bundle size difference matters too. CSS animations ship with the browser. Framer Motion adds around 30KB to your bundle. That's not huge, but it's not nothing either, especially if you're only using it for a few hover effects.

## Building a Notification Dot

Let's put this into practice. We'll build a pulsing notification dot that runs forever without draining batteries.

**Interactive demo: Notification dot.** [Try it on the page](https://pulkit.blog/design-engineering/offloading-motion-to-the-gpu/).

The bad version:

```css
@keyframes pulse-bad {
  0% {
    width: 8px;
    height: 8px;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    width: 12px;
    height: 12px;
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
  100% {
    width: 8px;
    height: 8px;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}
```

Animating `width` and `height` triggers layout on every frame. The browser recalculates the position of everything around the dot 60 times per second. Forever.

The good version:

```css
@keyframes pulse-good {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    transform: scale(1.5);
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}
```

Same visual effect. `transform: scale()` instead of `width` and `height`. The GPU handles it. Battery life preserved.

```css
.notification-dot {
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: pulse-good 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

Run this in Chrome DevTools Performance panel. The good version shows almost no main thread activity. The bad version shows layout calculations on every frame.

## What to Animate in CSS

A quick reference for choosing the right property.

| Want to...       | Use                         | Avoid                                      |
| ---------------- | --------------------------- | ------------------------------------------ |
| Move something   | `transform: translate()`    | `top`, `left`, `right`, `bottom`, `margin` |
| Resize something | `transform: scale()`        | `width`, `height`                          |
| Rotate something | `transform: rotate()`       | Nothing to avoid here                      |
| Fade something   | `opacity`                   | `visibility` (can't transition)            |
| Change colors    | `background-color`, `color` | These are fine but do trigger paint        |

The pattern is clear. For spatial changes, always reach for `transform`. For visibility, always reach for `opacity`.

## Respecting User Preferences

Not everyone wants animations. Some users experience motion sickness. Others simply prefer reduced motion for focus.

```css
@media (prefers-reduced-motion: reduce) {
  .notification-dot {
    animation: none;
  }
}
```

For our notification dot, removing the pulse entirely is appropriate. The dot still shows there's a notification. The animation is decorative, not functional.

For animations that communicate state changes, replace movement with instant transitions:

```css
@media (prefers-reduced-motion: reduce) {
  .modal {
    animation: none;
    opacity: 1;
  }
}
```

## Making the Choice

After everything we've covered, here's how I think about it.

**Reach for CSS when:**

- The animation runs between two predictable states (hover on, hover off)
- The animation loops continuously without user interaction
- You need guaranteed smoothness regardless of JavaScript load
- Every kilobyte of bundle size matters

**Reach for JavaScript when:**

- Users might interrupt the animation mid-flight
- The animation needs to feel physical and responsive
- You're orchestrating multiple elements with complex timing
- The animation state depends on application data

Most projects need both. A marketing site might use CSS for scroll-triggered reveals and JavaScript for an interactive product demo. A dashboard might use CSS for loading indicators and JavaScript for drag-and-drop reordering.

The worst choice is using the wrong tool because you only know one approach. Learn both. Then pick based on what the interaction actually needs.

## Conclusion

CSS animations are a powerful tool when used correctly. They run on the GPU, stay smooth under load, and add zero bytes to your JavaScript bundle.

The key is knowing what to animate. Stick to `transform` and `opacity`. Avoid properties that trigger layout. Test with DevTools. Respect reduced motion preferences.

For hover effects, enter animations, and infinite loops, CSS is the right choice. For interruptible state changes, spring physics, and complex sequences, reach for JavaScript.

The goal isn't to animate everything with CSS. It's to understand when CSS is the right tool and use it well.

## Related writing

- [Choreographing Multi-Step Motion](https://pulkit.blog/design-engineering/keyframe-animations.md): March 15, 2026
- [Invisible Scissors](https://pulkit.blog/design-engineering/clip-path-reveals.md): March 25, 2026
- [Smooth Operators](https://pulkit.blog/design-engineering/css-transitions.md): February 27, 2026
