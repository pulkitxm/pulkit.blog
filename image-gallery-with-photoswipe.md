# React Image Gallery with PhotoSwipe

> Build a React image gallery with PhotoSwipe and react-photoswipe-gallery to add animated, responsive image zoom to your app

- URL: https://pulkit.blog/image-gallery-with-photoswipe/
- Published: August 12, 2024
- Tags: React, PhotoSwipe, react-photoswipe-gallery, Image Gallery, UI Components, Frontend

In one of my recent projects([image-tweaker](https://github.com/Pulkitxm/image-tweaker)), I provided users with the ability to upload images, which were then displayed in a collection on the dashboard. I was searching for a way to give these images a cool animated view, and that's when I discovered [PhotoSwipe](https://photoswipe.com)!

PhotoSwipe is a powerful, easy-to-use JavaScript library that allows you to create beautiful, animated image galleries. It provides a smooth and responsive experience, making your image collections look stunning on any device.

Let's make an image gallery in React with the [react-photoswipe-gallery](https://www.npmjs.com/package/react-photoswipe-gallery).

### Let's Start by Bootstrapping a Fresh React-TS App

```bash
pnpm create vite@latest react-app-gallery -- --template react
cd react-app-gallery
pnpm install
pnpm dev
```

And just like that, we have our plain Vite React app ready to go!

This will set up a new React project with TypeScript support. You should see a default Vite React app running at [`http://localhost:3000`](http://localhost:3000).

![Default Vite React app running in browser](https://pulkit.blog/assets/content/blogs/react-image-gallery-with-photoswipe/40786bd6-5690-47a8-a52c-b7bf7aba230c.webp)

### Clean Up the Default Setup

You can also remove the default CSS in `App.css` and `index.css`.

```tsx
export default function App() {
  return <div>App</div>;
}
```

### Adding PhotoSwipe

Now let's start adding the dependencies

```bash
pnpm add react-photoswipe-gallery photoswipe
```

Include the CSS file from `photoswipe`. (As a best practice, I typically add these types of default CSS files in `main.tsx`.)

```tsx
import "photoswipe/dist/photoswipe.css";
```

### Creating the Image Gallery

Now, let's create a simple image gallery using `react-photoswipe-gallery`. Update `App.tsx` with the following code:

Add some images and include their links in App.tsx, like this:

```tsx
import Image1 from "./assets/image1.png";
import Image2 from "./assets/image2.png";
import Image3 from "./assets/image3.png";
```

make an array of images(you can use external links as well)

```tsx
const images = [Image1, Image2, Image3];
```

Now, to add the `photoswipe` gallery, let's wrap the images in `Gallery`.

```tsx
import { Gallery, Item } from "react-photoswipe-gallery";

import Image1 from "./assets/image1.png";
import Image2 from "./assets/image2.png";
import Image3 from "./assets/image3.png";

export default function App() {
  const images = [Image1, Image2, Image3];
  return <Gallery>// images here</Gallery>;
}
```

A single image inside the gallery looks like this:

```tsx
<Item original={image} width="1024" height="768">
  {({ ref, open }) => (
    <img
      ref={ref}
      onClick={open}
      src={image}
      style={{
        width: "200px",
        height: "200px",
      }}
    />
  )}
</Item>
```

This code creates an image item within a gallery using the `react-photoswipe-gallery` library. Here's a breakdown of this spooky code:

- `<Item>`: This is a component from the `react-photoswipe-gallery` library that represents a single image item in the gallery.
  - `original={image}`: This prop sets the original, full-size image source.
- `{({ ref, open }) => (...)}`: This is a render prop function that provides two arguments:
  - `ref`: A reference to the image element, used to track and manipulate the DOM element.
  - `open`: A function that opens the image in the gallery when called.

But we have an array of images, so we simply map the array

```tsx
{
  images.map((image, index) => (
    <Item key={index} original={image} width="1024" height="768">
      {({ ref, open }) => (
        <img
          ref={ref}
          onClick={open}
          src={image}
          style={{
            width: "200px",
            height: "200px",
          }}
        />
      )}
    </Item>
  ));
}
```

Currently, the image appears quite congested.

![Three images displayed without spacing](https://pulkit.blog/assets/content/blogs/react-image-gallery-with-photoswipe/a8b7da7f-f81c-494c-a15c-44d489fbc207.webp)

Just so as to add some breathing space let's add some styles

```tsx
style={{
  width: "200px",
  height: "200px",
  margin: 10,
  cursor: "pointer",
  borderRadius: 10,
}}
```

And yes, it works fine now, here's the complete code

```tsx
import { Gallery, Item } from "react-photoswipe-gallery";

import Image1 from "./assets/image1.png";
import Image2 from "./assets/image2.png";
import Image3 from "./assets/image3.png";

export default function App() {
  const images = [Image1, Image2, Image3];
  return (
    <Gallery>
      {images.map((image, index) => (
        <Item key={index} original={image} width="1024" height="768">
          {({ ref, open }) => (
            <img
              ref={ref}
              onClick={open}
              src={image}
              style={{
                width: "200px",
                height: "200px",
                margin: 10,
                cursor: "pointer",
                borderRadius: 10,
              }}
            />
          )}
        </Item>
      ))}
    </Gallery>
  );
}
```

### Here's the final version!

[Live demo: Image gallery demo with PhotoSwipe](https://codesandbox.io/embed/m3x8ct?view=preview&module=%2Fsrc%2FApp.tsx)

With these changes, your image gallery should now look much cleaner and more user-friendly. The added margin and rounded corners give each image some breathing room and a polished appearance. Enjoy your improved gallery!

## Related writing

- [React Context Menu with react-contexify](https://pulkit.blog/context-menu-in-react.md): August 10, 2024
- [Scroll Indicator with Framer Motion useScroll](https://pulkit.blog/scroll-indicator-with-framer.md): July 24, 2024
- [Typewriter Effect in React](https://pulkit.blog/typewriter-effect-in-react.md): April 28, 2024
