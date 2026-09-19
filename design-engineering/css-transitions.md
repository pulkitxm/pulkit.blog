# Smooth Operators

> CSS transitions interpolate between UI states so changes feel intentional. Learn the four transition properties, why to avoid 'all', when transitions beat keyframes, and how to keep hover effects off touch devices.

- URL: https://pulkit.blog/design-engineering/css-transitions/
- Published: February 27, 2026
- Tags: CSS, Transitions, Easing, Motion Design, UI Animation
- Part of: [Design Engineering](https://pulkit.blog/design-engineering.md)

Elements on a page have state. A button has default and hover. A toast has off-screen and visible. By default, when that state changes, the update is instant. One frame you see A, the next you see B.

CSS transitions are the glue between those states. They interpolate from the current value to the new one over time. The result feels intentional instead of abrupt.

## TL;DR

- **Four properties.** `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay` control what animates, how long, how it eases, and when it starts
- **Be explicit.** Avoid `all`; list the properties you want to transition so you do not accidentally animate layout or other changes
- **Transitions are interruptible.** Unhover mid-transition and the element smoothly reverses. Keyframe animations run to completion
- **Transitions for enter/exit.** When the end state can change mid-animation (e.g. toast stack), transitions handle it; keyframes do not
- **Hover only when supported.** Use `@media (hover: hover) and (pointer: fine)` so touch taps do not stick hover state

## The Anatomy of a Transition

The `transition` shorthand bundles four sub-properties:

```css
.box {
  transition: transform 0.2s ease 100ms;
}
```

That means: transition the `transform` property over `0.2s` with the `ease` timing function and a `100ms` delay before the transition starts.

- **transition-property:** What to animate. `transform`, `opacity`, `background-color`, or `all` (use sparingly)
- **transition-duration:** How long the transition runs. e.g. `200ms`, `1s`
- **transition-timing-function:** Easing. `ease`, `ease-in`, `ease-out`, `ease-in-out`, or `cubic-bezier(...)`
- **transition-delay:** Time to wait before starting. e.g. `100ms`, `0.5s`

When the value of `transform` changes (e.g. on hover from `scale(1)` to `scale(1.5)`), the browser interpolates between the two over 0.2s with ease.

**Interactive demo: Transition basics.** [Try it on the page](https://pulkit.blog/design-engineering/css-transitions/).

Hover and unhover before the transition finishes and it smoothly reverses. That behavior is central to transitions and we will come back to it.

## Being Explicit About Properties

Listing the properties you transition keeps the effect predictable. If you use `transition: all 0.2s ease`, any property that changes will animate. That can include things you did not intend, such as layout or color flashes when other CSS or state updates.

```css
.button {
  transition: 0.2s ease;
  transition-property: color, background-color, border-color;
}
```

Same duration and easing for multiple properties: set them once in the shorthand, then specify only the property names. That reduces repetition and keeps behavior consistent. I avoid the shorthand for delay; `transition-delay: 1s` is clearer than a fourth value in the shorthand.

**Interactive demo: Transition property.** [Try it on the page](https://pulkit.blog/design-engineering/css-transitions/).

The left box uses `all`, so both transform and background transition. The right box only transitions `transform`; the background change is instant. Being explicit avoids animating properties you do not care about and can prevent layout or paint surprises.

## Transitions Are Interruptible

When you hover and then unhover mid-transition, the browser does not finish the first animation and then start another. It transitions from the current value back to the non-hover value. The transition is interrupted and the new “destination” becomes the original state.

That is different from CSS keyframe animations. If a keyframe animation is applied on hover and you unhover, the animation is removed and the element snaps back to its base state; there is no smooth reversal from the current intermediate value. So for hover or other reversible state changes, transitions are usually the right tool.

**Interactive demo: Interruptible transition.** [Try it on the page](https://pulkit.blog/design-engineering/css-transitions/).

Hover the left button and move the cursor away quickly: the circle smoothly reverses. The right side uses a keyframe; once started, it runs to the end. Interruptibility is why transitions fit so well for hover and focus.

## Enter Animations with Transitions

Transitions are not only for hover. They work for elements entering or leaving the view, especially when the final position can change while the animation is running.

Consider a stack of toasts. When a new toast is added while the previous one is still animating in, the previous toast’s target position changes. With CSS transitions, the browser simply updates the target; the element smoothly moves to its new position. With a keyframe animation, the element would jump or behave oddly because the animation was defined for a fixed end state.

**Interactive demo: Toast stack.** [Try it on the page](https://pulkit.blog/design-engineering/css-transitions/).

Add several toasts in quick succession. Each new toast shifts the positions of the ones below; with transitions on `transform`, those shifts are animated. That is why libraries like Sonner use transitions for toast stack layout: the “destination” can change mid-flight and the result still looks correct.

## Disabling Hover on Touch Devices

Many transitions are triggered by hover. On touch devices, tapping an element can leave it in the hover state until something else is focused or tapped. That often feels like a bug: the user did not mean to “hover,” they tapped once.

You can restrict hover-dependent styles to devices that support hover and a fine pointer (e.g. mouse, trackpad):

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: scale(1.02);
  }
}
```

Then the hover effect only runs when the user has a pointer that can actually hover. In Tailwind v3 you can enable this globally with `future.hoverOnlyWhenSupported: true` in your config; in Tailwind v4 it is the default, so hover utilities are already limited to supported contexts.

## Common Transition Patterns

Most of the time you are transitioning a small set of properties: `transform`, `opacity`, and sometimes color or background. Keeping transitions short (around 200ms for micro-interactions) and explicit keeps the UI feeling responsive.

**Button hover:** color and background with the same duration and easing.

**Interactive demo: Button hover.** [Try it on the page](https://pulkit.blog/design-engineering/css-transitions/).

**Card reveal:** hide the description by default and reveal it on hover with `transform` and `opacity`. Use transform (e.g. `translateY`) so the animation stays on the compositor and does not trigger layout.

**Interactive demo: Card reveal.** [Try it on the page](https://pulkit.blog/design-engineering/css-transitions/).

**Press feedback:** a short transition on `transform` with `scale(0.97)` or similar on `:active` gives immediate tactile feedback. Pair with `ease-out` so the press feels snappy. You already saw this pattern in the transforms post; it is one of the most common transition use cases.

## Conclusion

Transitions are the simplest way to animate state changes in CSS. You declare which property (or properties) to animate, how long, and how it eases. The browser interpolates between the old and new values and handles interruption when the state changes again.

Prefer explicit property lists over `all`. Use transitions for reversible state (hover, focus) and for enter/exit where the target can change (toast stacks). Restrict hover-only effects to devices that support hover. Once this is second nature, you can layer on keyframes and animation libraries for more complex choreography.

## Related writing

- [Easing Curves That Feel Natural](https://pulkit.blog/design-engineering/easing-curves-that-feel-natural.md): January 27, 2026
- [Invisible Scissors](https://pulkit.blog/design-engineering/clip-path-reveals.md): March 25, 2026
- [Choreographing Multi-Step Motion](https://pulkit.blog/design-engineering/keyframe-animations.md): March 15, 2026
