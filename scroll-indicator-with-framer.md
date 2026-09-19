# Scroll Indicator with Framer Motion useScroll

> Build a horizontal scroll indicator with Framer Motion using the useScroll and useTransform hooks to track scroll progress in React.

- URL: https://pulkit.blog/scroll-indicator-with-framer/
- Published: July 24, 2024
- Tags: React, Framer Motion, Scroll Indicator, useScroll, useTransform, UI Components, Frontend

## The Idea

Creating a visually appealing and functional portfolio website is essential for showcasing your skills and projects. I recently explored website designs from popular examples for my portfolio ([pulkitxm.com](https://pulkitxm.com)) and found one animation that really excites me: the horizontal scroll percentage indicator. It is useful for tracking how much of the webpage you have scrolled.

## The concept

![Horizontal scroll indicator at top of webpage](https://pulkit.blog/assets/content/blogs/creating-a-dynamic-horizontal-scroll-percentage-indicator-with-react-and-framer-motion/a1036438-6dac-4c32-bcf3-78d877cd2de8.webp)

As you can see here, it basically sits at the top of the webpage, and yes, it is as minimalist as it looks.

## The Implementation

In this article, we'll implement this using React and Framer Motion.

I have my react project bootstrapped, starting by installing

![Terminal showing framer-motion installation](https://pulkit.blog/assets/content/blogs/creating-a-dynamic-horizontal-scroll-percentage-indicator-with-react-and-framer-motion/ba462a68-961b-4df5-b230-3011f8297166.webp)

```bash
pnpm add framer-motion
```

To get a good viewport to observe the scroll effect, I am adding a test height.

```jsx
export default function App() {
  return (
    <main>
      <div
        style={{
          height: "300vh",
        }}
      />
    </main>
  );
}
```

Now let's add the main div that's gonna act like the scroll indicator

```jsx
import { motion } from "framer-motion";

export default function App() {
  return (
    <main>
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "20vw",
          height: "10px",
          backgroundColor: "black",
          borderRadius: "0 10px 10px 0",
        }}
      />
      <div
        style={{
          height: "300vh",
        }}
      />
    </main>
  );
}
```

You can read more about [**The \<motion /> component**](https://www.framer.com/motion/introduction/#:~:text=%23-,The%20%3Cmotion%20/%3E%20component,-The%20core%20of), but in a nutshell, it is a component from Framer Motion that allows you to animate elements in a simple and declarative way.

And the styles are simple. The element is fixed at the top left of the screen, with a width of 0 (the main property that will act like a slider) and a height of 10 pixels. It has a black background and rounded corners on the right side.

Now let's animate it to move when we scroll. We'll use the `useScroll()` hook from framer-motion.

```jsx
import { useScroll } from "framer-motion";

const { scrollYProgress } = useScroll();
```

Now, to animate the changing values received from `scrollYProgress`, we will use the `useTransform` hook from framer-motion.

```jsx
const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
```

Here, the width will provide an animated value based on `scrollYProgress`. As you scroll from the top to the bottom of the page, the width changes from "0%" to "100%". This is done by mapping the `scrollYProgress` values (which range from 0 to 1) to the corresponding width values.

```jsx
import { motion, useScroll, useTransform } from "framer-motion";

export default function App() {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "102%"]);
  return (
    <main>
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "10px",
          backgroundColor: "black",
          borderRadius: "0 10px 10px 0",
          width,
        }}
      />
      <div
        style={{
          height: "300vh",
        }}
      />
    </main>
  );
}
```

So, we use the width as a style prop for the `motion.div`. And that's pretty much it for animating the scroll indicator.

## The Output

[Live demo: Scroll indicator demo with Framer Motion](https://codesandbox.io/embed/6vzzk4?view=preview&module=%2Fsrc%2FApp.tsx)

And there you have it! You've just created a sleek horizontal scroll percentage indicator with React and Framer Motion. Now your portfolio site is not only functional but also has that extra touch of interactivity. Happy coding, and may your scrolls always be smooth! 🚀✨

## Related writing

- [React Context Menu with react-contexify](https://pulkit.blog/context-menu-in-react.md): August 10, 2024
- [React Image Gallery with PhotoSwipe](https://pulkit.blog/image-gallery-with-photoswipe.md): August 12, 2024
- [Typewriter Effect in React](https://pulkit.blog/typewriter-effect-in-react.md): April 28, 2024
