// Pixel art shared by the archery game and the My Story start screen, so both use the same
// archer, trees and colors.

// The site's palette (see :root in retro.css).
export const C = {
  bg: "#0f1a18",
  panel: "#1a2e2a",
  panel2: "#24403a",
  border: "#3a6a5a",
  muted: "#8ac7ad",
  accent: "#5cffb1",
  text: "#d4f5e9",
  deep: "#2f7d5c",
  tree: "#1d4a3c",
};

export const SKY = ["#0b1412", "#0d1816", "#0f1c19", "#122320", "#152a25", "#18322b"];

// The archer: 12 x 19 art pixels, facing right. (In the game the arms and bow are drawn on top, aimed.)
export const ARCHER = [
  "....hhhh....",
  "...hhHHhh...",
  "..hhHHHHhh..",
  "..hhHsssHh..",
  "..hhHsesHh..",
  "...hHsssH...",
  "....hHHh....",
  "...aaaaaa...",
  "..hHHHHHHh..",
  ".hHHHHHHHHh.",
  ".hHHqHHHHHh.",
  ".hHHqHHHHHh.",
  "..hHHHHHHh..",
  "..hHHHHHHh..",
  "..hhHHHHhh..",
  "...HH..HH...",
  "...HH..HH...",
  "...dd..dd...",
  "..dddd.dddd.",
];
export const ARCHER_COLORS = { h: C.tree, H: C.deep, s: C.text, e: C.bg, a: C.accent, q: C.border, d: C.bg };
export const ARCHER_PIVOT = { col: 11, row: 9 }; // where the bow hand is, inside the sprite
export const ARCHER_SHOULDER = { col: 7, row: 8 };

export const PINE = ["..g..", ".gGg.", ".gGg.", "gGGGg", "..t.."];
export const PINE_COLORS = { g: C.deep, G: C.tree, t: C.border };

