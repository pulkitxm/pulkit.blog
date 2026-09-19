# Choreographing Multi-Step Motion

> Keyframe animations let you choreograph multi-step sequences that play automatically, loop forever, or pause mid-flight. Learn when to reach for keyframes over transitions, how fill-mode controls the before and after, and how to stack independent animations on a single element.

- URL: https://pulkit.blog/design-engineering/keyframe-animations/
- Published: March 15, 2026
- Tags: CSS, Keyframes, Animations, Motion Design
- Part of: [Design Engineering](https://pulkit.blog/design-engineering.md)

CSS transitions get you from A to B. Keyframe animations get you from A to B to C to D and back again, on loop, without anyone clicking anything. They are the tool you reach for when the animation needs to run on its own.

## TL;DR

- **Use keyframes for autonomous motion.** Infinite loops, entry animations, and multi-step sequences are where keyframes shine
- **Use transitions for interactive state.** Hover, focus, and anything the user can interrupt mid-flight
- **`@keyframes` + `animation`.** Define named keyframes with percentage stops, then apply them with the `animation` shorthand
- **Fill mode matters.** `forwards` keeps the end state, `backwards` applies the first keyframe before the animation starts, `both` does both
- **Pause and resume.** `animation-play-state` lets you freeze an animation and pick it back up, something transitions cannot do
- **Stack animations.** Comma-separate multiple animations on one element; each runs independently

## Keyframes vs Transitions

Before reaching for `@keyframes`, consider whether a transition would do the job. Here is a simple way to decide.

**Use keyframe animations when:**

- You need infinite loops (a spinner, a marquee, a pulsing dot)
- The animation runs automatically without user interaction (page-load entrance)
- You need multiple intermediate steps (a blinking cursor, a color cycle)
- Simple enter or exit effects that do not need to support interruption (a dialog sliding in)

**Use CSS transitions when:**

- User interaction triggers the change (hover, click, focus)
- You need smooth interruption handling (unhover mid-animation and it reverses)

Transitions handle interruption gracefully; unhover mid-animation and the browser smoothly reverses. Keyframes do not reverse mid-flight; they run to completion or you remove them entirely. That is their weakness for interactive state, and their strength for everything else.

## Creating Keyframe Animations

Define a keyframe animation with the `@keyframes` [at-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Syntax/At-rules). Give it a name and a set of stops expressed as percentages.

```css
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
```

Apply it to an element with the `animation` property. The shorthand takes the name, duration, and timing function as its first three values.

```css
.element {
  animation: fade-in 1s ease;
}
```

That interpolates opacity from 0 to 1 over one second.

**Interactive demo: Fade in.** [Try it on the page](https://pulkit.blog/design-engineering/keyframe-animations/).

I use the `animation` shorthand only for name, duration, and timing function. I declare everything else (`iteration-count`, `fill-mode`, `direction`, `delay`) as separate properties. It keeps things readable when animations get more complex.

### Iteration Count

`animation-iteration-count` controls how many times the animation runs. The default is `1`. Set it to `infinite` for loops. Values between 1 and infinite exist but I rarely use them; it is usually one-shot or forever.

## Multiple Steps

A keyframe rule is not limited to a start and end. You can add stops at any percentage. A blinking cursor is a clean example: one keyframe at 50% toggles visibility, and CSS fills in 0% and 100% automatically using the element's existing styles.

```css
@keyframes blink {
  50% {
    visibility: hidden;
  }
}

.cursor {
  animation: blink 1s step-end infinite;
}
```

Notice the `step-end` timing function. For a blink, you want an instant toggle, not a smooth fade. `step-end` jumps to each keyframe value at the end of each step interval, giving the classic on-off blink.

**Interactive demo: Blinking cursor.** [Try it on the page](https://pulkit.blog/design-engineering/keyframe-animations/).

If your multi-step animation has more than three or four stops, or involves coordinated timing across properties, it can get unwieldy in pure CSS. That is usually when I reach for a JavaScript animation library like Motion instead.

## Maintaining the End State

By default, when a keyframe animation finishes, the element snaps back to its pre-animation styles. That is rarely what you want for entrance animations, dialogs, or anything that should stay in its final position.

The `animation-fill-mode` property controls this.

- **`forwards`** keeps the values from the last keyframe after the animation ends
- **`backwards`** applies the values from the first keyframe before the animation starts (useful with delays)
- **`both`** does both

**Interactive demo: Fill mode.** [Try it on the page](https://pulkit.blog/design-engineering/keyframe-animations/).

`forwards` is by far the most common. Any time you animate an element in and want it to stay, set `animation-fill-mode: forwards`.

### The Backwards Trick

`backwards` solves a specific problem with delayed animations. Say you have an entrance animation that fades from opacity 0 to 1, with a 1s delay. Without `backwards`, the element is fully visible during the delay, then jumps to opacity 0 when the animation starts. With `backwards`, the first keyframe (opacity 0) is applied immediately, so the element is hidden during the delay too.

**Interactive demo: Backwards fill.** [Try it on the page](https://pulkit.blog/design-engineering/keyframe-animations/).

When you need both behaviors, use `both`. It applies the first keyframe before the animation starts (like `backwards`) and retains the last keyframe after it ends (like `forwards`).

## Pausing Animations

Keyframe animations have a feature transitions lack entirely: you can pause them. Set `animation-play-state` to `paused` and the element freezes in place. Switch it back to `running` and it picks up exactly where it left off.

```css
.box {
  animation: bounce-x 2s cubic-bezier(0.645, 0.045, 0.355, 1) infinite alternate;
  animation-play-state: paused;
}

.box.playing {
  animation-play-state: running;
}
```

I am also using `animation-direction: alternate` here so the element animates back and forth instead of teleporting to the start on each iteration.

**Interactive demo: Play state.** [Try it on the page](https://pulkit.blog/design-engineering/keyframe-animations/).

I have never needed `animation-play-state` in a production project, but it is worth knowing about. If you are choosing between keyframes and transitions and the ability to pause matters, keyframes are the only option.

## Stacking Multiple Animations

You can apply more than one animation to the same element by comma-separating them. Each animation runs independently with its own timing, duration, and iteration count.

```css
.element {
  animation:
    spin 3s linear infinite,
    pulse 1s ease-in-out infinite alternate;
}
```

This is useful for composing effects. One animation handles rotation while another handles scale, each at different speeds.

**Interactive demo: Stacked animations.** [Try it on the page](https://pulkit.blog/design-engineering/keyframe-animations/).

Keep stacked animations simple. Two or three is fine; beyond that the behavior gets hard to reason about and you are better off reaching for a JavaScript library with a proper timeline API.

## A Practical Pattern

Skeleton loaders are one of the most common uses of infinite keyframe animations. A gradient slides across placeholder shapes, signaling that content is loading.

**Interactive demo: Skeleton loader.** [Try it on the page](https://pulkit.blog/design-engineering/keyframe-animations/).

The shimmer is a single `@keyframes` rule that translates a gradient from left to right, running infinitely. Every placeholder element shares the same animation. Simple, effective, and impossible to build with transitions since there is no state change driving it.

```css
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton {
  animation: shimmer 1.5s ease-in-out infinite;
}
```

## Conclusion

Keyframe animations are the right tool when motion needs to happen without user input. Loops, entrance sequences, multi-step choreography, and anything that should pause and resume are all keyframe territory. Transitions remain the better choice for interactive state changes where interruption matters.

The properties you will use most are `animation-fill-mode: forwards` (to keep the end state), `animation-iteration-count: infinite` (for loops), and `animation-direction: alternate` (to animate back and forth). Stack animations by comma-separating them, and reach for a JavaScript library when the choreography outgrows what CSS can express clearly.

## Related writing

- [Offloading Motion to the GPU](https://pulkit.blog/design-engineering/offloading-motion-to-the-gpu.md): February 3, 2026
- [Invisible Scissors](https://pulkit.blog/design-engineering/clip-path-reveals.md): March 25, 2026
- [Smooth Operators](https://pulkit.blog/design-engineering/css-transitions.md): February 27, 2026
