// Small helpers used in more than one place.

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// 7 -> "07", for chapter numbers like "Chapter 07".
export const pad2 = (n) => String(n).padStart(2, "0");

// True when the visitor has asked their device for less motion. (Checked each time it's needed, since the
// setting can change while the page is open; the guard is for test environments without matchMedia.)
export const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scrolls an element to the top of the screen because the visitor asked to go there (a button press):
// smoothly, unless they've asked for less motion.
export function scrollToElement(element) {
  element?.scrollIntoView?.({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}
