// The pixel-art picture on the My Story start screen: a night landscape with the archer, a
// dotted arrow arc to a target, and a winding road with the little car (the two halves of My
// Story). It's an inline SVG made of crisp rectangles from the same art as the games, so it
// needs no image files and doesn't load p5.
import { ARCHER, ARCHER_COLORS, C, PINE, PINE_COLORS, SKY } from "./adventure/pixelArt";

export const SCENE_W = 160;
export const SCENE_H = 44;
const GROUND = 32; // the row where the ground starts

const round = Math.round;

function build() {
  const shapes = [];
  const rect = (x, y, w, h, fill, cls) => shapes.push({ type: "rect", x, y, w, h, fill, cls });
  const path = (d, fill) => shapes.push({ type: "path", d, fill });

  const sprite = (rows, colors, left, top) => {
    rows.forEach((row, r) => {
      let c = 0;
      while (c < row.length) {
        if (row[c] === ".") {
          c++;
          continue;
        }
        let end = c;
        while (end + 1 < row.length && row[end + 1] === row[c]) end++;
        rect(left + c, top + r, end - c + 1, 1, colors[row[c]]);
        c = end + 1;
      }
    });
  };

  // A pixel disc, one row at a time.
  const disc = (cx, cy, radius, fill) => {
    for (let dy = -radius; dy <= radius; dy++) {
      const half = Math.floor(Math.sqrt(radius * radius - dy * dy + radius * 0.5));
      rect(cx - half, cy + dy, half * 2 + 1, 1, fill);
    }
  };

  // The outline of hills, as one stepped path.
  const hills = (height, fill) => {
    let d = `M0 ${GROUND}V${height(0)}`;
    for (let x = 1; x <= SCENE_W; x++) d += `H${x}V${height(Math.min(x, SCENE_W - 1))}`;
    path(`${d}V${GROUND}Z`, fill);
  };

  // sky
  SKY.forEach((color, i) => rect(0, Math.floor((GROUND * i) / SKY.length), SCENE_W, Math.ceil(GROUND / SKY.length) + 1, color));
  [
    [6, 3], [15, 9], [27, 2], [38, 11], [52, 5], [63, 14], [74, 3], [86, 9], [97, 2], [108, 13], [118, 6],
    [128, 2], [148, 12], [155, 5], [44, 17], [92, 17],
  ].forEach(([x, y], i) => rect(x, y, 1, 1, i % 4 === 0 ? C.text : C.border, i % 3 === 0 ? "startStar" : undefined));
  // a crescent moon: the pixels inside one disc but not inside a second, shifted one
  for (let y = 2; y <= 14; y++) {
    let x = 86;
    while (x <= 102) {
      const lit = (px) => (px - 94) ** 2 + (y - 8) ** 2 <= 30 && (px - 97) ** 2 + (y - 7) ** 2 > 30;
      if (!lit(x)) {
        x++;
        continue;
      }
      let end = x;
      while (lit(end + 1)) end++;
      rect(x, y, end - x + 1, 1, C.text);
      x = end + 1;
    }
  }

  // far and near hills, with little pines on the far ones
  const far = (x) => round(GROUND - (11 + 6 * Math.sin(x * 0.06) + 3 * Math.sin(x * 0.17 + 1)));
  const near = (x) => round(GROUND - (4 + 3 * Math.sin(x * 0.08 + 2) + 2 * Math.sin(x * 0.21)));
  hills(far, "#14281f");
  [46, 58, 70, 84, 100, 114, 146].forEach((x) => sprite(PINE, PINE_COLORS, x, far(x) - 4));
  hills(near, "#183629");

  // the ground
  rect(0, GROUND, SCENE_W, SCENE_H - GROUND, C.panel2);
  rect(0, GROUND, SCENE_W, 1, C.border);
  for (let x = 3; x < SCENE_W; x += 7) rect(x, GROUND - 1, 1, 1, C.deep);

  // the winding road (the road trip), with a dashed middle and a little car on it
  const roadY = (x) => round(39 + 2.4 * Math.sin(x * 0.075));
  for (let x = 0; x < SCENE_W; x++) {
    const y = roadY(x);
    rect(x, y - 2, 1, 5, C.border);
    rect(x, y - 1, 1, 3, C.panel);
    if (Math.floor(x / 4) % 2 === 0) rect(x, y, 1, 1, C.muted);
  }
  const carX = 74;
  const carY = roadY(carX + 4) - 5;
  sprite(
    [".kk..kk..", "ddddddddd", "dBBBBwwBd", "dBBBBwwBh", "dBBBBwwBd", "ddddddddd", ".kk..kk.."],
    { B: C.accent, d: C.bg, k: C.muted, w: C.bg, h: C.text },
    carX,
    carY
  );

  // the archer on a rock, drawing a bow
  const archerLeft = 12;
  const archerTop = GROUND - 6 - ARCHER.length;
  rect(archerLeft + 1, GROUND - 6, 15, 1, C.border);
  rect(archerLeft + 1, GROUND - 5, 15, 5, C.panel2);
  rect(archerLeft + 1, GROUND - 3, 15, 1, C.panel);
  sprite(ARCHER, ARCHER_COLORS, archerLeft, archerTop);
  const hand = { x: archerLeft + 11, y: archerTop + 9 };
  for (let i = -8; i <= 8; i++) rect(hand.x + 1 + round(2.5 * (1 - (i / 8) ** 2)), hand.y + i, 1, 1, C.text);
  rect(hand.x + 1, hand.y - 8, 1, 17, C.muted);
  rect(hand.x - 8, hand.y, 14, 1, C.muted); // the arrow
  rect(hand.x + 6, hand.y, 2, 1, C.text);
  rect(hand.x - 9, hand.y - 1, 1, 1, C.accent);
  rect(hand.x - 9, hand.y + 1, 1, 1, C.accent);

  // the target, and the dotted arc the arrow will take to it
  const target = { x: 132, y: 19, r: 8 };
  rect(target.x - 1, target.y + target.r, 2, GROUND - target.y - target.r, C.border);
  disc(target.x, target.y, target.r, C.text);
  disc(target.x, target.y, round(target.r * 0.74), C.accent);
  disc(target.x, target.y, round(target.r * 0.5), C.text);
  disc(target.x, target.y, round(target.r * 0.26), C.deep);
  const x0 = hand.x + 12;
  const x1 = target.x - target.r - 2;
  for (let i = 0; i <= 9; i++) {
    const t = i / 9;
    rect(round(x0 + (x1 - x0) * t), round(hand.y + (target.y - hand.y) * t - 15 * 4 * t * (1 - t)), 1, 1, i < 5 ? C.accent : C.border);
  }
  return shapes;
}

// Built once, when this file is first loaded.
export const START_SCENE = build();
