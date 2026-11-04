// The p5.js sketch for "Play My Story": a tiny pixel-art map with a winding road and a little car.
//
// p5 only draws here. React owns which checkpoint is selected and tells this controller about it
// (setSelected / setLayout / setVisible / destroy); all the text, links and buttons are real HTML.
//
// How it stays light:
//  * The canvas is only ~160 x 100 "art pixels" and CSS scales it up crisply (image-rendering:
//    pixelated), so it uses very little memory even on a high-density screen.
//  * The scenery and the dim road are painted ONCE into an off-screen canvas. The bright
//    "already driven" road is painted incrementally into a second one. (Plain canvases, not
//    p5.Graphics: p5 would leave extra hidden <canvas> elements in the page for those.)
//  * The loop only runs while the car is moving. Otherwise it is noLoop() and we redraw() once
//    whenever something changes.
import { ROAD_RADIUS, buildRoute, pointAt } from "./journeyRoute";

// The site's palette (see :root in retro.css).
const C = {
  bg: "#0f1a18",
  grid: "#14241f",
  panel2: "#24403a",
  border: "#3a6a5a",
  muted: "#8ac7ad",
  accent: "#5cffb1",
  text: "#d4f5e9",
  roadDeep: "#2f7d5c",
  treeDark: "#1d4a3c",
  rock: "#4a6b62",
};

// Road colors: [fill, edge, dashes]. Driven road = bright and solid-looking; the rest is dim.
const ROAD_DIM = [C.panel2, C.border, C.border];
const ROAD_LIT = [C.roadDeep, C.accent, C.text];

// Sprites are strings: one character per art pixel, "." = transparent.
const SPRITE_COLORS = {
  B: C.accent,
  d: C.bg,
  k: C.muted,
  w: C.bg,
  h: C.text,
  g: C.roadDeep,
  G: C.treeDark,
  t: C.border,
  r: C.rock,
  R: C.border,
  a: C.accent,
  f: C.text,
};

// The car, facing right (top-down). Rotated for the other three directions.
const CAR = [".kk..kk..", "ddddddddd", "dBBBBwwBd", "dBBBBwwBh", "dBBBBwwBd", "ddddddddd", ".kk..kk.."];

const DECOR = {
  pine: ["..g..", ".gGg.", ".gGg.", "gGGGg", "..t.."],
  bush: [".ggg.", "gggGg", "GGGGG"],
  rock: [".rr", "rRR"],
  flower: [".g.", "gag", ".g."],
};
const DECOR_PICKS = ["pine", "pine", "pine", "pine", "bush", "bush", "rock", "flower", "flower"];

// Turns a sprite 90 degrees clockwise.
const rotate = (rows) =>
  Array.from({ length: rows[0].length }, (_, r) =>
    Array.from({ length: rows.length }, (_, c) => rows[rows.length - 1 - c][r]).join("")
  );
const CAR_SPRITES = [CAR, rotate(CAR), rotate(rotate(CAR)), rotate(rotate(rotate(CAR)))]; // E, S, W, N

// Small seeded random numbers so the scenery is the same every visit.
function makeRandom(seedText) {
  let a = 0;
  for (const ch of seedText) a = (a * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Every pixel the road covers: its position, which colour slot it uses, and how far along the
// road it is (so we can light it up from the start up to the car).
function buildRoadCells(route) {
  const { cols, rows } = route.layout;
  const outer = (ROAD_RADIUS + 0.5) ** 2;
  const inner = (ROAD_RADIUS - 0.5) ** 2;
  const found = new Map();

  for (let n = 0; n < route.xs.length; n++) {
    const sx = route.xs[n];
    const sy = route.ys[n];
    for (let y = Math.floor(sy) - ROAD_RADIUS - 1; y <= Math.ceil(sy) + ROAD_RADIUS + 1; y++) {
      for (let x = Math.floor(sx) - ROAD_RADIUS - 1; x <= Math.ceil(sx) + ROAD_RADIUS + 1; x++) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
        const d2 = (x + 0.5 - sx) ** 2 + (y + 0.5 - sy) ** 2;
        if (d2 > outer) continue;
        const key = y * cols + x;
        const prev = found.get(key);
        if (!prev || d2 < prev.d2) found.set(key, { x, y, d2, n });
      }
    }
  }

  return [...found.values()]
    .sort((a, b) => a.n - b.n)
    .map((c) => ({
      x: c.x,
      y: c.y,
      s: c.n * 0.5,
      // 0 = fill, 1 = edge, 2 = centre dash (3 on, 3 off)
      slot: c.d2 > inner ? 1 : c.d2 < 0.8 && Math.floor(c.n / 6) % 2 === 0 ? 2 : 0,
    }));
}

// Trees, bushes, rocks and flowers that stay off the road and away from the checkpoint buttons.
function placeDecor(route) {
  const { cols, rows, kind, key } = route.layout;
  const random = makeRandom(key);
  const placed = [];
  const target = Math.round((cols * rows) / (kind === "wide" ? 450 : 600));

  for (let attempt = 0; attempt < target * 6 && placed.length < target; attempt++) {
    const name = DECOR_PICKS[Math.floor(random() * DECOR_PICKS.length)];
    const sprite = DECOR[name];
    const w = sprite[0].length;
    const h = sprite.length;
    const x = Math.floor(random() * (cols - w - 4)) + 2;
    const y = Math.floor(random() * (rows - h - 4)) + 2;
    const cx = x + w / 2;
    const cy = y + h / 2;

    let ok = true;
    for (let n = 0; n < route.xs.length && ok; n += 4) {
      if (Math.hypot(route.xs[n] - cx, route.ys[n] - cy) < ROAD_RADIUS + Math.max(w, h) / 2 + 2) ok = false;
    }
    // The pad + button + label area of each checkpoint.
    for (const cp of route.cps) {
      if (!ok) break;
      if (Math.abs(cp.pinX - cx) < 18 && Math.abs(cp.pinY - cy) < 18) ok = false;
      if (Math.hypot(cp.x - cx, cp.y - cy) < 10) ok = false;
    }
    for (const other of placed) {
      if (!ok) break;
      if (Math.abs(other.x - x) < 8 && Math.abs(other.y - y) < 8) ok = false;
    }
    if (ok) placed.push({ x, y, sprite });
  }
  return placed;
}

// Dots from (x0, y0) toward (x1, y1), skipping the first `skip` and last `trim` pixels.
function dotsBetween(x0, y0, x1, y1, skip, trim) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const dots = [];
  for (let d = skip; d <= len - trim; d++) {
    dots.push([Math.round(x0 + ((x1 - x0) * d) / len), Math.round(y0 + ((y1 - y0) * d) / len)]);
  }
  return dots;
}

// Mounts the sketch inside `host`. Returns a small controller; call destroy() when done.
export function mountJourneySketch(P5, host, initial) {
  let layout = initial.layout;
  let route = buildRoute(layout);
  let selected = initial.selected;
  let visible = true;

  let dist = route.cps[selected].s; // where the car is, in art pixels along the road
  let speed = 0; // how fast it is going (for the smooth-damp easing)
  let moving = false;
  let facing = 0; // 0 right, 1 down, 2 left, 3 up
  let cells = [];
  let sceneLayer = null;
  let progressLayer = null;
  let painted = 0; // how many road cells are already lit in progressLayer
  let p = null;

  // Fills a rectangle on one of the off-screen layers.
  const fillRect = (ctx, color, x, y, w, h) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  // Fills a rectangle on the p5 canvas.
  const fillRectP5 = (color, x, y, w, h) => {
    p.fill(color);
    p.rect(x, y, w, h);
  };

  // Draws a sprite with whichever fill function it's given.
  const paintSprite = (fill, sprite, left, top) => {
    sprite.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== ".") fill(SPRITE_COLORS[row[c]], left + c, top + r, 1, 1);
      }
    });
  };

  const makeLayer = (cols, rows) => {
    const canvas = document.createElement("canvas");
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  };

  const freeLayers = () => {
    for (const layer of [sceneLayer, progressLayer]) {
      if (layer) layer.canvas.width = layer.canvas.height = 0; // lets the browser free the memory now
    }
  };

  // Scenery + dim road, painted once per layout.
  const buildScene = () => {
    const { cols, rows } = layout;
    cells = buildRoadCells(route);
    painted = 0;

    freeLayers();
    sceneLayer = makeLayer(cols, rows);
    progressLayer = makeLayer(cols, rows);

    const g = sceneLayer.ctx;
    fillRect(g, C.bg, 0, 0, cols, rows);
    // Faint pixel grid.
    for (let x = 0; x < cols; x += 8) fillRect(g, C.grid, x, 0, 1, rows);
    for (let y = 0; y < rows; y += 8) fillRect(g, C.grid, 0, y, cols, 1);
    // Stems from each road pad to its checkpoint button.
    for (const cp of route.cps) {
      for (const [x, y] of dotsBetween(cp.x, cp.y, cp.pinX, cp.pinY, 6, layout.kind === "wide" ? 6 : 8)) {
        fillRect(g, C.border, x, y, 1, 1);
      }
    }
    for (const { x, y, sprite } of placeDecor(route)) {
      paintSprite((color, px, py, w, h) => fillRect(g, color, px, py, w, h), sprite, x, y);
    }
    for (const cell of cells) fillRect(g, ROAD_DIM[cell.slot], cell.x, cell.y, 1, 1);
  };

  // Lights the road from the start up to the car (and un-lights it when going backwards).
  const syncProgress = () => {
    let end = 0;
    while (end < cells.length && cells[end].s <= dist) end++;
    if (end < painted) {
      progressLayer.ctx.clearRect(0, 0, layout.cols, layout.rows);
      painted = 0;
    }
    for (let i = painted; i < end; i++) {
      const cell = cells[i];
      fillRect(progressLayer.ctx, ROAD_LIT[cell.slot], cell.x, cell.y, 1, 1);
    }
    painted = end;
  };

  const drawRing = (cx, cy, half, thick, color) => {
    p.fill(color);
    p.rect(cx - half, cy - half, half * 2 + 1, thick);
    p.rect(cx - half, cy + half - thick + 1, half * 2 + 1, thick);
    p.rect(cx - half, cy - half + thick, thick, half * 2 + 1 - thick * 2);
    p.rect(cx + half - thick + 1, cy - half + thick, thick, half * 2 + 1 - thick * 2);
  };

  // A tiny flag on a checkpoint tile (3 pixels wide, 7 tall); the last stop gets a checkered one.
  const drawFlag = (cx, cy, reached, finish) => {
    const pole = reached ? C.text : C.border;
    const cloth = reached ? C.accent : C.border;
    p.fill(pole);
    p.rect(cx - 2, cy - 3, 1, 7);
    if (finish) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          p.fill((r + c) % 2 ? C.bg : reached ? C.text : C.muted);
          p.rect(cx - 1 + c, cy - 3 + r, 1, 1);
        }
      }
    } else {
      p.fill(cloth);
      p.rect(cx - 1, cy - 3, 3, 1);
      p.rect(cx - 1, cy - 2, 2, 1);
      p.rect(cx - 1, cy - 1, 1, 1);
    }
  };

  const render = () => {
    p.drawingContext.drawImage(sceneLayer.canvas, 0, 0);
    p.drawingContext.drawImage(progressLayer.canvas, 0, 0);

    const here = pointAt(route, dist);

    // A dark square tile on the road at each checkpoint, with a little flag on it. The frame and
    // flag turn mint once reached, the last stop has a checkered finish flag, and the selected
    // tile gets a second, white frame (so it isn't only color that tells them apart).
    route.cps.forEach((cp, i) => {
      const cx = Math.round(cp.x);
      const cy = Math.round(cp.y);
      const reached = dist >= cp.s - 0.5;
      p.fill(C.bg);
      p.rect(cx - 5, cy - 5, 11, 11);
      drawRing(cx, cy, 5, 1, reached ? C.accent : C.border);
      if (i === selected) drawRing(cx, cy, 6, 1, C.text);
      // The car covers the tile when it's parked there, so skip the flag then.
      if (Math.hypot(here.x - cp.x, here.y - cp.y) > 7) drawFlag(cx, cy, reached, i === route.cps.length - 1);
    });

    // The car, turned toward where the road is heading.
    const sign = route.cps[selected].s < dist ? -1 : 1;
    const dx = here.dx * sign;
    const dy = here.dy * sign;
    if (Math.abs(dx) + Math.abs(dy) > 0.01) {
      const horizontal = facing % 2 === 0;
      if (horizontal && Math.abs(dy) > Math.abs(dx) * 1.3) facing = dy > 0 ? 1 : 3;
      else if (!horizontal && Math.abs(dx) > Math.abs(dy) * 1.3) facing = dx > 0 ? 0 : 2;
      else if (horizontal) facing = dx > 0 ? 0 : 2;
      else facing = dy > 0 ? 1 : 3;
    }
    const car = CAR_SPRITES[facing];
    const bounce = moving && Math.floor(p.millis() / 110) % 2 ? 1 : 0;
    paintSprite(
      fillRectP5,
      car,
      Math.round(here.x - car[0].length / 2),
      Math.round(here.y - car.length / 2) - bounce
    );
  };

  // Unity-style SmoothDamp: eases toward the target and keeps its momentum if the target changes
  // mid-trip, so clicking around quickly never makes the car jump or stutter.
  const step = (dt) => {
    const goal = route.cps[selected].s;
    const smoothTime = 0.12;
    const omega = 2 / smoothTime;
    const x = omega * dt;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const maxChange = 320 * smoothTime;
    const change = Math.max(-maxChange, Math.min(maxChange, dist - goal));
    const temp = (speed + omega * change) * dt;
    speed = (speed - omega * temp) * exp;
    dist = dist - change + (change + temp) * exp;
    if (Math.abs(goal - dist) < 0.2 && Math.abs(speed) < 4) {
      dist = goal;
      speed = 0;
    }
  };

  const stopMoving = () => {
    moving = false;
    speed = 0;
    dist = route.cps[selected].s;
    p?.noLoop();
  };

  const sketch = (sk) => {
    p = sk;
    sk.setup = () => {
      sk.pixelDensity(1);
      const canvas = sk.createCanvas(layout.cols, layout.rows);
      canvas.elt.setAttribute("aria-hidden", "true");
      canvas.elt.setAttribute("role", "presentation");
      sk.noStroke();
      sk.noSmooth();
      sk.noLoop();
      buildScene();
      syncProgress();
    };
    sk.draw = () => {
      if (moving) {
        step(Math.min(sk.deltaTime / 1000, 0.05));
        if (dist === route.cps[selected].s) moving = false;
      }
      syncProgress();
      render();
      if (!moving) sk.noLoop();
    };
  };

  const instance = new P5(sketch, host);
  if (!host.querySelector("canvas")) {
    instance.remove();
    throw new Error("The story map canvas could not be created.");
  }

  return {
    // React picked another checkpoint: drive there (or jump, if motion is off or it's offscreen).
    setSelected(index) {
      if (index === selected) return;
      selected = index;
      if (prefersReducedMotion() || !visible) {
        stopMoving();
        p.redraw();
      } else {
        moving = true;
        p.loop();
      }
    },
    // The container changed size: rebuild for the new canvas.
    setLayout(next) {
      if (next.key === layout.key) return;
      layout = next;
      route = buildRoute(layout);
      stopMoving();
      p.resizeCanvas(layout.cols, layout.rows, true);
      p.noStroke();
      p.noSmooth();
      buildScene();
      if (visible) p.redraw();
    },
    // Scrolled offscreen: stop animating (the car just parks); back on screen: repaint.
    setVisible(isVisible) {
      visible = isVisible;
      if (!visible) {
        stopMoving();
      } else {
        p.redraw();
      }
    },
    destroy() {
      p.noLoop();
      p.remove();
      freeLayers();
      sceneLayer = progressLayer = p = null;
    },
  };
}
