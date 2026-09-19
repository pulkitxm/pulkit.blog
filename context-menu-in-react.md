# React Context Menu with react-contexify

> Build a custom React context menu with react-contexify, adding items, separators, submenus, and right-click triggers for fast in-app actions.

- URL: https://pulkit.blog/context-menu-in-react/
- Published: August 10, 2024
- Tags: React, Context Menu, react-contexify, UI Components, Frontend

Creating a custom context menu in React can significantly enhance the user experience by providing quick access to relevant actions. With the help of the [react-contexify](https://www.npmjs.com/package/react-contexify) library, you can easily implement a sleek and functional context menu tailored to your application's needs. In this guide, we'll walk you through the steps to create a custom context menu in React, ensuring your users have a seamless and intuitive interaction with your app. Let's dive in and unlock the potential of context menus in your React projects!

I have bootstrapped a new React TypeScript project for this walkthrough.

### Adding react-contexify as a Dependency

```bash
pnpm add react-contexify
```

Add the default css in the main.jsx

```jsx
import "react-contexify/ReactContexify.css";
```

Add basic styles in the index.css

```css
body {
  margin: 0;
  padding: 0;
}
```

### Business Logic

I am creating a div that spans the full height and width of the screen.

```tsx
export default function App() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
      }}
    />
  );
}
```

Next, I will add the context menu to this div. This means that whenever a right-click event is triggered, a custom menu will appear.

Start of by adding a `/src/components/ContextMenu.tsx`

```tsx
import { Menu } from "react-contexify";

export default function ContextMenu() {
  return <Menu></Menu>;
}
```

We can incorporate multiple `<Items />` into the `Menu` component.

```tsx
<Menu>
  <Item>Item1</Item>
  <Item>Item2</Item>
</Menu>
```

However, merely adding an item will not be sufficient. Each item should perform a specific action when clicked. We could do that:

```tsx
<Item
  onClick={() => {
    alert("Hello");
  }}
>
  Hello
</Item>
```

Additionally, to separate two sections, we can add a `<Separator />`.

```tsx
<Menu>
  <Item
    onClick={() => {
      console.log("Hello");
    }}
  >
    Hello
  </Item>
  <Separator />
  <Item>World</Item>
</Menu>
```

Additionally, we can incorporate submenus.

```tsx
<Menu>
  //above code
  <Separator />
  <Submenu label={<>Hover me</>}>
    <Item onClick={() => {}}>Another</Item>
    <Item onClick={() => {}}>One</Item>
  </Submenu>
</Menu>
```

Now that we have created our Menu, you can experiment with it and add as many Items as necessary. Let's integrate it and observe it in action.

Additionally, you may notice this error

![Console error showing missing Menu ID](https://pulkit.blog/assets/content/blogs/react-contexify-context-menu/4824af70-c43f-4ee9-832d-7edcabcb9cac.webp)

Let's fix both! Add an ID to the `<ContextMenu/>`

```tsx
<Menu id="context-menu">
```

Add the ContextMenu in the App Component

```tsx
import { Fragment } from "react";
import ContextMenu from "./ContextMenu";

<Fragment>
  <div
    style={{
      height: "100vh",
      width: "100vw",
    }}
  />
  <ContextMenu />
</Fragment>;
```

### Final Integrations

Now, to enable the menu to trigger on a right-click event

```tsx
import { useContextMenu } from "react-contexify";

const { show } = useContextMenu({ id: "context-menu" });
```

**Note: The ID mentioned here and the one in the** `<ContextMenu />` **should be the same.**

Now the last step add the `onContextMenu` event in the `<div/>`

```tsx
<div
  style={{
    height: "100vh",
    width: "100vw",
  }}
  onContextMenu={(e) => {
    show({
      event: e,
    });
  }}
/>
```

Voilà! You can now see the menu in action.

![Context menu displayed on right-click with multiple options](https://pulkit.blog/assets/content/blogs/react-contexify-context-menu/a79f3b33-1b19-42ab-834b-943be2b7275d.webp)

Final Code:

```tsx
// App.tsx
import { Fragment } from "react";
import "./index.css";
import ContextMenu from "./ContextMenu";
import { useContextMenu } from "react-contexify";

export default function App() {
  const { show } = useContextMenu({ id: "context-menu" });
  return (
    <Fragment>
      <div
        style={{
          height: "100vh",
          width: "100vw",
        }}
        onContextMenu={(e) => {
          show({
            event: e,
          });
        }}
      />
      <ContextMenu />
    </Fragment>
  );
}
```

```tsx
// ContextMenu.tsx
import { Item, Menu, Separator, Submenu } from "react-contexify";

export default function ContextMenu() {
  return (
    <Menu id="context-menu">
      <Item
        onClick={() => {
          console.log("Hello");
        }}
      >
        Hello
      </Item>
      <Separator />
      <Item>World</Item>
      <Separator />
      <Submenu label={<>Hover me</>}>
        <Item onClick={() => {}}>Another</Item>
        <Item onClick={() => {}}>One</Item>
      </Submenu>
    </Menu>
  );
}
```

In conclusion, creating a custom context menu in React using the react-contexify library can greatly enhance the user experience by providing quick and easy access to relevant actions. By following the steps outlined in this guide, you can implement a sleek and functional context menu tailored to your application's needs. Experiment with different items and configurations to best suit your users' needs. Happy coding!

## Related writing

- [React Image Gallery with PhotoSwipe](https://pulkit.blog/image-gallery-with-photoswipe.md): August 12, 2024
- [Scroll Indicator with Framer Motion useScroll](https://pulkit.blog/scroll-indicator-with-framer.md): July 24, 2024
- [Typewriter Effect in React](https://pulkit.blog/typewriter-effect-in-react.md): April 28, 2024
