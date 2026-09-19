# Tailwind Obfuscation

> I wanted to rename every Tailwind class on my site so nobody could read my CSS. It didn't hide anything, but it did make every page smaller. Here's what I built and what I learned.

- URL: https://pulkit.blog/tailwind-obfuscation/
- Published: September 20, 2026
- Tags: Tailwind CSS, CSS, Build Tools, Performance, Web Performance

I was working on this site the other day, writing Tailwind classes like I always do, when I opened the page source and saw this:

```html
<div class="mx-auto max-w-190 px-7 max-sm:px-5.5">
```

Anyone who knows Tailwind can read that like a sentence: centered, max width, padding, less padding on small screens. My whole design was sitting there in plain English on every element of every page.

So I had an idea. JavaScript minifiers rename variables to single letters, so why not do the same to class names at build time? Rename everything to short, meaningless names, and nobody can read my CSS anymore.

I built it. Now the same element ships like this:

```html
<div class="x r2 v6 md">
```

After shipping it, I noticed a few things. It doesn't actually hide anything. The browser needs the full stylesheet to draw the page, so anyone can open DevTools and still read every computed value. Renaming `gap-4` to `x7` removes the Tailwind vocabulary, not the design.

What it did do was make every page smaller. The stylesheet dropped 16% and the HTML about 7 to 11% after gzip, which is roughly 2 KB less on every page load.

It also broke something I only noticed after it shipped. My YouTube, PDF and CodeSandbox embeds load their iframe only when you click, and the script gives that iframe its classes from a `data-frame-class` attribute. I only renamed `class` attributes, so those iframes shipped with names that no longer existed, and every one of them collapsed to the browser's default 300×150. Every page looked identical on load, which is exactly what my check compared, so it passed.

There are two catches. The names aren't stable: adding a single class can shift most of them, so they should never be used in tests or scripts. And a class name can reach the page through more than `class="..."`: data attributes, inline scripts, inline styles. The renamer has to find all of them, not just the obvious one.

So my original goal was a dead end, but the size win was real, and I kept it. If you want to try it on your own site, here's the prompt I'd hand to a coding agent.

<details>

<summary>Prompt: obfuscate Tailwind classes at build time</summary>

```text
Add a production-only build step that renames every class in my compiled
Tailwind stylesheet to a short generated name, and rewrites the built HTML
to match. Development builds must keep the original class names.

Find the edge cases first
- Before writing the renamer, build the site without it and inventory every
  place a stylesheet class name appears in the output other than a class="..."
  attribute: other attributes (data-*, aria-*, JSON in attributes), inline
  <script> blocks, inline <style> blocks, JSON payloads, shipped JS files,
  other stylesheets, and anything rendered inside a shadow root.
- For each place, trace what reads it at runtime. Does a script copy it onto
  an element (className, classList, setAttribute, innerHTML)? Is it rendered
  into the page or into a shadow root with its own styles? Decide per place
  whether it must be renamed, kept, or left alone, and report the inventory
  with your decision before implementing.
- Treat anything you did not find in this inventory as unsupported, and say
  so rather than guessing.

Where it runs
- After Tailwind has compiled the final CSS and all HTML pages are written,
  and before any step that fingerprints or hashes the CSS file.
- Operate on the build output directory only. Never touch source files.

Renaming the CSS
- Parse the compiled stylesheet with Lightning CSS and use its Selector
  visitor to find class names. Recurse into nested selectors inside :is(),
  :where(), :not(), :has() and :nth-child(... of ...), because Tailwind
  puts classes for variants like **: and [&_a]: there.
- Assign names in a deterministic order: a..z, then a0, b0, and so on.
  Every name must start with a letter.
- Skip any generated name that already appears as a class token anywhere in
  the output, including attributes that scripts later turn into classes, so
  a renamed class never collides with one that was kept.

Classes that must keep their names
- Any class that appears as a whole word in JavaScript that touches the
  page: shipped JS files and inline executable <script> blocks (no type,
  module, or text/javascript). Not JSON or ld+json blocks.
- Any class used by another stylesheet that styles the page, such as KaTeX
  or a lightbox library, and any class used by an inline <style> block.
- Ignore scripts and styles that only render inside a shadow root; they
  cannot see the page's classes.

Rewriting the HTML
- Rewrite class="..." attributes and every attribute your inventory found
  that a script copies onto an element as classes (for example
  data-frame-class). Name the rule by pattern, such as data-*-class, not by
  a single attribute, so a new embed that follows the convention is covered.
- Leave the contents of <script>, <style> and HTML comments untouched,
  including JSON payloads that contain HTML strings, unless your inventory
  shows that the page itself (not a shadow root) injects that HTML.
- Match only the attribute quoting the build actually emits. Do not widen
  the match to single quotes unless attribute and text escaping guarantee
  that ' can never appear raw inside another value.
- Decode HTML entities in each class token before looking it up, because
  arbitrary variants like [&>p]:mb-2 are written as [&amp;>p]:mb-2.
- Leave any class that is not in the rename map exactly as it was.

Verification
- Unit tests for: name generation (unique, valid identifiers), HTML
  rewriting (scripts, styles, comments and escaped code are untouched,
  entities are decoded, data-*-class attributes are renamed), classes kept
  because of inline scripts and inline styles, collision avoidance with
  tokens in data-*-class attributes, and an end-to-end run on a small
  fixture directory. Show that each new test fails without the fix.
- Build the site with and without the step, then load every route in a
  headless browser at desktop and mobile widths in light and dark mode.
  Compare getComputedStyle for every element and its ::before and
  ::after. There must be zero differences.
- Do the same comparison after interaction: click every element that
  creates or reveals content (lazy iframes and video players, tabs,
  lightboxes, menus, copy buttons, toggles), then compare the newly created
  elements too. Page-load parity alone misses anything built on click.
- Add a static check to CI: every token in a data-*-class attribute of the
  built HTML must be a class defined in a shipped stylesheet.
- Report raw and gzipped sizes of the stylesheet and HTML before and after.
- Log how many classes were renamed and how many were kept.
```

</details>

## Related writing

- [Offloading Motion to the GPU](https://pulkit.blog/design-engineering/offloading-motion-to-the-gpu.md): February 3, 2026
- [The Cookie Sync Pattern](https://pulkit.blog/cookie-sync-pattern.md): May 4, 2026
- [Invisible Scissors](https://pulkit.blog/design-engineering/clip-path-reveals.md): March 25, 2026
