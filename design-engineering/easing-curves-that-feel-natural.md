# Easing Curves That Feel Natural

> Master easing curves to make your animations feel natural. Learn why linear is almost always wrong, how cubic-bezier works, and which easing to use for different interactions.

- URL: https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/
- Published: January 27, 2026
- Tags: CSS, Cubic Bezier, Motion Design, UI Animation, Framer Motion
- Part of: [Design Engineering](https://pulkit.blog/design-engineering.md)

Linear animation is the default. It's also almost always wrong.

When something moves at constant speed from start to finish, it feels robotic. Mechanical. Unnatural. Real objects don't move this way. They accelerate out of rest and decelerate into their final position.

Easing is what makes animation feel alive. It's the difference between "this is a computer" and "this feels like a real thing."

But easing isn't just about feel. It directly affects how fast your interface *seems*. Two identical animations with different easing curves will feel like they have different durations. The wrong curve makes your UI feel sluggish even when the actual performance is fine. The right curve makes it feel snappy even when the duration is longer.

## TL;DR

- **Linear is wrong** for most UI animations. It feels robotic because nothing in nature moves at constant speed
- **Ease-out** is your default for UI. Elements decelerate into their final position, feels responsive and snappy
- **Ease-in** is rare in UI. Only use for exits, it makes entrances feel sluggish
- **Ease-in-out** works for elements morphing or moving while staying on screen
- **Ease** is the elegant choice for hover effects and subtle color transitions
- **Cubic-bezier** gives you full control. Four numbers that define acceleration and deceleration
- **Custom curves** with stronger acceleration feel more energetic than built-in presets

## Why Linear Feels Wrong

Watch a ball rolling across a table. It doesn't move at constant speed. Friction slows it down. Now watch a ball being thrown. It accelerates as it leaves your hand, then decelerates as it travels.

Linear motion (constant speed from start to finish) exists only in physics problems without friction. In the real world, everything accelerates and decelerates.

**Interactive demo: Ball drop.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

Your brain has spent your entire life learning how objects move. When something on screen violates those expectations, it registers as wrong. Not consciously. You just feel it.

```css
/* This feels robotic */
.element {
  transition: transform 300ms linear;
}
```

The element moves at exactly the same speed from start to finish. No acceleration at the beginning. No deceleration at the end. It just... moves. And then stops abruptly.

## The Four Standard Easings

CSS gives you four built-in easing functions. Each serves a different purpose.

### Ease Out as Your Default

The element starts fast and slows down as it reaches its destination.

```css
.element {
  transition: transform 300ms ease-out;
}
```

**Interactive demo: Easing curve.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

**Use for**: Almost everything that appears or moves into position. Modals opening, dropdowns appearing, elements sliding into view.

**Why it works**: When you push a physical object, it has momentum at the start and slows down due to friction. Ease-out mimics this. The element "settles" into its final position.

**Mental model**: The element is already moving and coming to rest at its destination.

**Pro tip**: Add a subtle scale-down effect on button press for instant responsiveness. A `scale(0.97)` on the `:active` state with `ease-out` makes buttons feel tactile:

```css
.button {
  transition: transform 150ms ease-out;
}

.button:active {
  transform: scale(0.97);
}
```

This tiny detail makes the difference between "I clicked" and "the button responded to me."

**Interactive demo: Button press.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

### Ease In

The element starts slow and speeds up.

```css
.element {
  transition: transform 300ms ease-in;
}
```

**Interactive demo: Easing curve.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

**Use for**: Elements leaving the screen. Modals closing, items being dismissed.

**Why it works**: When something is about to leave your view, you want it to accelerate away. Ease-in makes it feel like the element is "getting out of the way."

**Mental model**: The element is gathering speed to leave.

**Caution**: Ease-in at the start of an interaction feels sluggish. The element appears slow to respond. That's why you rarely use it for entrances.

### Ease In Out

Slow start, fast middle, slow end.

```css
.element {
  transition: transform 300ms ease-in-out;
}
```

**Interactive demo: Easing curve.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

**Use for**: Elements that are already visible and need to transform. A progress bar growing, a card expanding into a detail view, a sidebar resizing. Also good for looping animations where there's no clear entry or exit.

**Why it works**: It mimics how a car accelerates from a stop and decelerates to a stop. The element doesn't just appear or disappear. It moves through space while staying on screen.

**Mental model**: The element is at rest, moves, then comes to rest again. Like sliding a book across a table.

Think of Apple's Dynamic Island. It morphs between states while staying on screen. If you were to convert its spring animation into an easing type, it would be ease-in-out.

### Ease as the Elegant Choice

CSS's default. Similar to ease-in-out but asymmetrical: it starts faster and ends slower.

```css
.element {
  transition: transform 300ms ease;
}
```

**Interactive demo: Easing curve.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

This is what you get if you don't specify anything. But don't dismiss it as a generic default.

**Use for**: Hover effects, color transitions, opacity changes. Smaller, more gentle animations where you want elegance over energy.

**Why it works**: The asymmetry creates a subtle sophistication. It's neither as aggressive as ease-out nor as symmetrical as ease-in-out. For hover states on buttons, links, or cards, this gentleness is exactly right.

**Mental model**: A refined, unhurried movement. Professional rather than playful.

The Sonner toast library uses `ease` instead of `ease-out` even though toasts enter and exit the screen. Why? Because `ease` makes the component feel more polished. Sometimes the "correct" easing isn't the best choice. Context and character matter.

## Cubic Bezier for Full Control

All easing functions are cubic bezier curves under the hood. The four standard easings are just presets:

```css
ease        = cubic-bezier(0.25, 0.1, 0.25, 1.0)
ease-in     = cubic-bezier(0.42, 0, 1.0, 1.0)
ease-out    = cubic-bezier(0, 0, 0.58, 1.0)
ease-in-out = cubic-bezier(0.42, 0, 0.58, 1.0)
linear      = cubic-bezier(0, 0, 1, 1)
```

The four numbers define two control points on a curve:

```text
cubic-bezier(x1, y1, x2, y2)

x1, y1 = first control point
x2, y2 = second control point
```

**Interactive demo: Cubic bezier playground.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

**X values** (0 to 1): Position in time. 0 is the start, 1 is the end.

**Y values** (can exceed 0-1): Position in the animation. Values above 1 create overshoot. Values below 0 create undershoot.

### Creating Custom Curves

**Snappy ease-out** (faster deceleration):

```css
.element {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

This is more aggressive than standard ease-out. The element reaches near its final position quickly, then slowly settles. Great for UI that needs to feel responsive.

**Overshoot** (bounce past target and settle):

```css
.element {
  transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

The y2 value (1.56) exceeds 1, so the element overshoots its target before settling back. Creates a playful, bouncy feel.

**Interactive demo: Easing personalities.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

**Undershoot first** (pull back before moving):

```css
.element {
  transition: transform 400ms cubic-bezier(0.68, -0.6, 0.32, 1.6);
}
```

Negative y1 makes the element move backward first, then forward with overshoot. Use sparingly. This is attention-grabbing.

## Common Easing Patterns

Here's my mental model for choosing easing:

| Interaction        | Easing             | Why                               |
| ------------------ | ------------------ | --------------------------------- |
| Element appears    | ease-out           | Coming to rest at destination     |
| Element disappears | ease-in            | Accelerating away                 |
| Element morphs     | ease-in-out        | Staying on screen, changing shape |
| Hover effect       | ease               | Elegant, unhurried transition     |
| Button press       | ease-out           | Immediate feedback                |
| Loading spinner    | linear             | Constant motion, no destination   |
| Marquee            | linear             | Flowing, not arriving             |
| Hold to confirm    | linear             | Visualizing time passage          |
| Dragging           | none or linear     | Following user input 1:1          |
| Snap after drag    | ease-out or spring | Settling into position            |

```typescript
const EASING = {
  enter: "cubic-bezier(0.16, 1, 0.3, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  move: "cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};
```

## Duration and Easing Work Together

Easing doesn't exist in isolation. A 200ms ease-out feels different from a 500ms ease-out.

**Shorter durations** (100-200ms): Need more aggressive easing to be noticeable. A subtle ease-out at 100ms barely registers.

**Longer durations** (300-500ms): Subtler easing works. Too aggressive and it feels cartoonish.

```css
/* Short duration, aggressive easing */
.tooltip {
  transition: opacity 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Longer duration, gentler easing */
.modal {
  transition: transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

As a rule: if you increase duration, consider softening the easing. If you decrease duration, consider sharpening the easing.

## Tools for Working with Easing

**Chrome DevTools**: The cubic-bezier editor in the Styles panel lets you visually edit curves and preview them.

[**cubic-bezier.com**](https://cubic-bezier.com): Interactive tool for creating and comparing curves.

[**easings.net**](https://easings.net): Visual reference for common easing functions with their cubic-bezier values.

[**Framer Motion**](https://www.framer.com/motion): If you're in React, spring animations often feel better than cubic-bezier for interactive elements.

## When to Break the Rules

Sometimes linear is correct:

- **Continuous rotation** (loading spinners)
- **Following user input** (dragging)
- **Color transitions** (can look better linear)
- **Infinite scrolling marquees**
- **Visualizing time passage** (progress bars, hold-to-confirm interactions)

```css
/* Linear is correct for continuous rotation */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

For a "hold to delete" button, you want the progress to fill linearly. Why? Because you're showing the user how much time is left. Time passes linearly, so the animation should too. Any easing would make the remaining time feel unpredictable.

```css
/* Linear is correct for time-based progress */
.hold-progress {
  transition: width 2s linear;
}

.button:active .hold-progress {
  width: 100%;
}
```

**Interactive demo: Hold to delete.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

A marquee scrolling text is another case. Constant speed feels correct because the text is moving through a window, not arriving at a destination. Easing would make it feel like the text is "trying to get somewhere" rather than flowing.

**Interactive demo: Marquee.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

And sometimes dramatic easing is wrong:

- **Banking/finance apps**: keep it subtle
- **Accessibility contexts**: reduce motion preferences
- **High-frequency interactions**: tooltips, hover states

## Beyond the Presets

The built-in CSS easing functions are starting points, not destinations. Their accelerations are often too subtle for energetic UI.

Compare the built-in `ease-out` to a custom curve:

```css
/* Built-in: subtle, safe */
.element {
  transition: transform 300ms ease-out;
}

/* Custom: snappier, more energetic */
.element {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

The custom curve has a stronger initial acceleration. The element "pops" into position rather than gently settling. Neither is universally better. It depends on the personality you want.

Build a collection of custom curves for different intensities:

```typescript
const EASING = {
  subtle: "cubic-bezier(0.4, 0, 0.2, 1)",
  standard: "cubic-bezier(0.16, 1, 0.3, 1)",
  energetic: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  dramatic: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
};
```

Many open-source libraries ship with carefully tuned curves. Vaul (the drawer component) uses a curve specifically designed to mimic iOS sheet behavior. That single detail makes the component feel native on mobile. When you find a curve that feels right in someone else's work, inspect it and learn from it.

## Respecting Reduced Motion

Not everyone experiences motion the same way. For some users, animations can cause discomfort, nausea, or seizures. The `prefers-reduced-motion` media query lets you respect user preferences.

**Interactive demo: Reduced motion.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

### The Media Query

```css
@media (prefers-reduced-motion: reduce) {
  .element {
    transition: none;
    animation: none;
  }
}
```

But "reduce" doesn't mean "remove entirely." The goal is to minimize vestibular triggers while maintaining usability.

### What to Reduce

**Remove**: Parallax effects, auto-playing videos, large-scale movements, zooming animations, spinning or rotating elements.

**Keep but simplify**: Opacity fades, color transitions, small-scale position changes. These rarely cause issues and help users understand state changes.

```css
.modal {
  transition:
    opacity 200ms ease-out,
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  .modal {
    /* Keep opacity, remove transform */
    transition: opacity 150ms ease-out;
    transform: none !important;
  }
}
```

### Implementation Patterns

**CSS approach** (best for simple cases):

```css
.element {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  .element {
    transition: opacity 150ms ease-out;
    transform: none;
  }
}
```

**JavaScript approach** (for complex animations):

```typescript
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const animationConfig = prefersReducedMotion
  ? { opacity: [0, 1], duration: 150, easing: "ease-out" }
  : {
      opacity: [0, 1],
      transform: ["translateY(-8px) scale(0.95)", "translateY(0) scale(1)"],
      duration: 200,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    };
```

**Framer Motion approach**:

```tsx
import { useReducedMotion } from "framer-motion";

function Modal({ isOpen, children }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{
        opacity: isOpen ? 1 : 0,
        scale: shouldReduceMotion ? 1 : isOpen ? 1 : 0.95,
        y: shouldReduceMotion ? 0 : isOpen ? 0 : -8,
      }}
      transition={{
        duration: shouldReduceMotion ? 0.15 : 0.2,
        ease: shouldReduceMotion ? "easeOut" : [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Testing Reduced Motion

**macOS**: System Preferences > Accessibility > Display > Reduce motion

**Windows**: Settings > Ease of Access > Display > Show animations in Windows

**Chrome DevTools**: Rendering tab > Emulate CSS media feature > prefers-reduced-motion

Always test your site with reduced motion enabled. What seems like a minor animation to you might be the difference between usable and unusable for someone else.

## All Easings Compared

Here's a side-by-side comparison of all the standard easing curves. Each curve animates using its own easing function, so you can see how they feel in practice. Click on any legend item to toggle its visibility.

**Interactive demo: Easing curve.** [Try it on the page](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural/).

## Conclusion

Easing is the soul of animation. Without it, motion feels dead. With the wrong easing, motion feels wrong.

Start with ease-out for entrances, ease-in for exits. That covers 80% of cases. When you need more control, learn cubic-bezier. Understand that the four numbers control acceleration and deceleration, and that y-values above 1 create overshoot.

The best way to learn is to experiment. Take the same animation and try different easing values. Feel the difference. Your intuition will develop faster than any theory can teach.

And when something feels off but you can't explain why, it's probably the easing.

## Related writing

- [Smooth Operators](https://pulkit.blog/design-engineering/css-transitions.md): February 27, 2026
- [The Physics Behind Natural Motion](https://pulkit.blog/design-engineering/the-physics-behind-natural-motion.md): January 28, 2026
- [Invisible Scissors](https://pulkit.blog/design-engineering/clip-path-reveals.md): March 25, 2026
