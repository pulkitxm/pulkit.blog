const themeKey = "portfolio-theme";
let selectedTheme;
try {
  selectedTheme = localStorage.getItem(themeKey);
} catch {}
if (selectedTheme === "light" || selectedTheme === "dark") {
  document.documentElement.dataset.theme = selectedTheme;
}
document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("[data-theme-toggle]");
  button?.addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(themeKey, theme);
    } catch {}
  });
  for (const carousel of document.querySelectorAll("[data-carousel]")) {
    const track = carousel.querySelector("[data-carousel-track]");
    if (!track) {
      continue;
    }
    const previous = carousel.querySelector("[data-carousel-previous]");
    const next = carousel.querySelector("[data-carousel-next]");
    const status = carousel.querySelector("[data-carousel-status]");
    const total = track.children.length;
    const current = () => Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
    const show = (index) => {
      track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
    };
    const update = () => {
      const index = current();
      status.textContent = `${index + 1} / ${total}`;
      previous.disabled = index === 0;
      next.disabled = index === total - 1;
    };
    previous.addEventListener("click", () => show(Math.max(current() - 1, 0)));
    next.addEventListener("click", () => show(Math.min(current() + 1, total - 1)));
    track.addEventListener("scroll", update, { passive: true });
    update();
  }
});

function entryTransition(event, otherUrl) {
  const transition = event.viewTransition;
  if (!transition) {
    return;
  }
  if (!otherUrl || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    transition.skipTransition();
    return;
  }
  const current = new URL(window.location.href);
  const other = new URL(otherUrl);
  const titles = [...document.querySelectorAll("[data-title]")];
  const title =
    titles.find((candidate) => candidate.closest("a")?.href === other.href) ??
    (current.pathname.startsWith(other.pathname)
      ? titles.find((candidate) => candidate.tagName === "H1")
      : null);
  if (current.origin !== other.origin || current.pathname === other.pathname || !title) {
    transition.skipTransition();
    return;
  }
  title.style.viewTransitionName = "entry-title";
  const clear = () => title.style.removeProperty("view-transition-name");
  const captured = event.type === "pageswap" ? transition.finished : transition.ready;
  captured.then(clear, clear);
}

window.addEventListener("pageswap", (event) => {
  entryTransition(event, event.activation?.entry?.url);
});
window.addEventListener("pagereveal", (event) => {
  entryTransition(event, window.navigation?.activation?.from?.url);
});
