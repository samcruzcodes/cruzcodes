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
import { stepCar, checkpointNear } from "./journeyDrive";
import { ROAD_RADIUS, buildRoute, nearestOnRoad, pointAt } from "./journeyRoute";

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

// The car at 16 headings (every 22.5 degrees), made from the same artwork: each frame is a list of
// [dx, dy, color] pixels around the car's center. Pixels are looked up in the original sprite
// (nearest neighbor), so the car stays crisp at any angle and the four straight-on frames are
// exactly the hand-drawn sprite.
export const CAR_FRAME_COUNT = 16;
export function buildCarFrames(sprite = CAR) {
  const w = sprite[0].length;
  const h = sprite.length;
  const reach = Math.ceil(Math.hypot(w, h) / 2);
  return Array.from({ length: CAR_FRAME_COUNT }, (_, k) => {
    const angle = (k * 2 * Math.PI) / CAR_FRAME_COUNT;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const pixels = [];
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const col = Math.round(dx * cos + dy * sin + (w - 1) / 2);
        const row = Math.round(-dx * sin + dy * cos + (h - 1) / 2);
        const ch = sprite[row]?.[col];
        if (ch && ch !== ".") pixels.push([dx, dy, SPRITE_COLORS[ch]]);
      }
    }
    return pixels;
  });
}
const CAR_FRAMES = buildCarFrames();

// Which of the 16 frames to use for a heading in radians (0 = facing right, clockwise on screen).
export const frameForHeading = (heading) =>
  ((Math.round((heading * CAR_FRAME_COUNT) / (2 * Math.PI)) % CAR_FRAME_COUNT) + CAR_FRAME_COUNT) % CAR_FRAME_COUNT;

// The shortest way to turn from angle `a` to angle `b`, as a signed amount.
const angleDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

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

const NO_INPUT = { up: false, down: false, left: false, right: false };
const PULSE_SECONDS = 0.5;

// Mounts the sketch inside `host`. Returns a small controller; call destroy() when done.
//   initial = { layout, selected, onReach(index) }
// onReach is called when the visitor DRIVES up to a checkpoint (React then updates the card).
export function mountJourneySketch(P5, host, initial) {
  let layout = initial.layout;
  let route = buildRoute(layout);
  let selected = initial.selected;
  const onReach = initial.onReach || (() => {});
  let visible = true;

  // The car has two ways of moving:
  //  * automatic: it follows the road from `dist` (art pixels along it) to the selected checkpoint
  //  * manual ("Drive Yourself"): it's a free car at car.x / car.y with a heading and speed
  // `offset` smooths the hand-over between them (it fades to nothing, so the car glides back onto
  // the road instead of jumping).
  let dist = route.cps[selected].s;
  let litDist = dist; // how far the road has been driven (only ever grows)
  let tweenSpeed = 0; // for the smooth-damp easing
  let moving = false; // automatic travel in progress
  let manual = false; // the visitor is in control
  let driving = false; // "Drive Yourself" is switched on
  let input = NO_INPUT;
  let offset = { x: 0, y: 0 };
  let pulse = null; // { index, age }: the little ring when you drive up to a checkpoint
  const start = pointAt(route, dist);
  const car = { x: start.x, y: start.y, heading: Math.atan2(start.dy, start.dx), speed: 0 };

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

  // Lights the road from the start up to the farthest point driven so far.
  const syncProgress = () => {
    let end = 0;
    while (end < cells.length && cells[end].s <= litDist) end++;
    for (let i = painted; i < end; i++) {
      const cell = cells[i];
      fillRect(progressLayer.ctx, ROAD_LIT[cell.slot], cell.x, cell.y, 1, 1);
    }
    painted = Math.max(painted, end);
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

  // Where the car is drawn right now.
  const carPose = () => {
    if (manual) return { x: car.x, y: car.y };
    const here = pointAt(route, dist);
    return { x: here.x + offset.x, y: here.y + offset.y };
  };

  const render = () => {
    p.drawingContext.drawImage(sceneLayer.canvas, 0, 0);
    p.drawingContext.drawImage(progressLayer.canvas, 0, 0);

    const pose = carPose();

    // A dark square tile on the road at each checkpoint, with a little flag on it. The frame and
    // flag turn mint once reached, the last stop has a checkered finish flag, and the selected
    // tile gets a second, white frame (so it isn't only color that tells them apart).
    route.cps.forEach((cp, i) => {
      const cx = Math.round(cp.x);
      const cy = Math.round(cp.y);
      const reached = litDist >= cp.s - 0.5;
      p.fill(C.bg);
      p.rect(cx - 5, cy - 5, 11, 11);
      drawRing(cx, cy, 5, 1, reached ? C.accent : C.border);
      if (i === selected) drawRing(cx, cy, 6, 1, C.text);
      // The car covers the tile when it's parked there, so skip the flag then.
      if (Math.hypot(pose.x - cp.x, pose.y - cp.y) > 7) drawFlag(cx, cy, reached, i === route.cps.length - 1);
    });

    // A quick ring around a checkpoint you just drove up to.
    if (pulse) {
      const cp = route.cps[pulse.index];
      const t = pulse.age / PULSE_SECONDS;
      drawRing(Math.round(cp.x), Math.round(cp.y), 7 + Math.round(t * 7), 1, t < 0.5 ? C.accent : C.border);
    }

    // The car, turned to its heading.
    const driven = manual ? Math.abs(car.speed) > 4 : moving;
    const bounce = driven && Math.floor(p.millis() / 110) % 2 ? 1 : 0;
    const cx = Math.round(pose.x);
    const cy = Math.round(pose.y) - bounce;
    for (const [dx, dy, color] of CAR_FRAMES[frameForHeading(car.heading)]) fillRectP5(color, cx + dx, cy + dy, 1, 1);
  };

  const goalDist = () => route.cps[selected].s;

  // Unity-style SmoothDamp: eases toward the target and keeps its momentum if the target changes
  // mid-trip, so clicking around quickly never makes the car jump or stutter.
  const stepAuto = (dt) => {
    const goal = goalDist();
    const before = dist;
    const smoothTime = 0.12;
    const omega = 2 / smoothTime;
    const x = omega * dt;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const maxChange = 320 * smoothTime;
    const change = Math.max(-maxChange, Math.min(maxChange, dist - goal));
    const temp = (tweenSpeed + omega * change) * dt;
    tweenSpeed = (tweenSpeed - omega * temp) * exp;
    dist = dist - change + (change + temp) * exp;
    if (Math.abs(goal - dist) < 0.2 && Math.abs(tweenSpeed) < 4) {
      dist = goal;
      tweenSpeed = 0;
      moving = false;
    }
    // Turn toward where the road is heading (smoothly, so corners look like corners).
    const here = pointAt(route, dist);
    const sign = dist >= before ? 1 : -1;
    if (dist !== before && Math.abs(here.dx) + Math.abs(here.dy) > 0.01) {
      const target = Math.atan2(here.dy * sign, here.dx * sign);
      car.heading += angleDiff(car.heading, target) * (1 - Math.exp(-14 * dt));
    }
  };

  // The visitor drives: move the car, light the road it covers, and notice checkpoints.
  const stepManual = (dt) => {
    const next = stepCar(car, input, dt, route);
    car.x = next.x;
    car.y = next.y;
    car.heading = next.heading;
    car.speed = next.speed;
    litDist = Math.max(litDist, next.near.s);

    const reached = checkpointNear(route, car.x, car.y);
    if (reached >= 0 && reached !== selected) {
      selected = reached;
      litDist = Math.max(litDist, route.cps[reached].s);
      if (!prefersReducedMotion()) pulse = { index: reached, age: 0 };
      onReach(reached);
    }
  };

  const anyInput = () => input.up || input.down || input.left || input.right;

  // Is anything still changing? If not, we stop drawing until something happens.
  const isActive = () =>
    moving ||
    pulse !== null ||
    (!manual && Math.hypot(offset.x, offset.y) > 0.05) ||
    (driving && (anyInput() || (manual && Math.abs(car.speed) > 0.3)));

  const takeControl = () => {
    const pose = carPose();
    car.x = pose.x;
    car.y = pose.y;
    car.speed = 0;
    manual = true;
    moving = false;
    tweenSpeed = 0;
    offset = { x: 0, y: 0 };
  };

  // Hand the car back to the automatic path: glide onto the road, then drive to the selected stop.
  const goAuto = () => {
    if (manual) {
      const near = nearestOnRoad(route, car.x, car.y);
      dist = near.s;
      offset = { x: car.x - near.x, y: car.y - near.y };
      manual = false;
      car.speed = 0;
    }
    tweenSpeed = 0;
    moving = true;
  };

  // Park at the selected stop right now (reduced motion, offscreen, new layout).
  const parkAtSelected = () => {
    moving = false;
    manual = false;
    tweenSpeed = 0;
    car.speed = 0;
    offset = { x: 0, y: 0 };
    dist = goalDist();
    litDist = Math.max(litDist, dist);
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
      const dt = Math.min(sk.deltaTime / 1000, 0.05);
      // A key is still held when an automatic trip ends: carry on driving from there.
      if (driving && !manual && !moving && anyInput()) takeControl();
      if (manual) stepManual(dt);
      else if (moving) stepAuto(dt);
      if (!manual) {
        offset = { x: offset.x * Math.exp(-10 * dt), y: offset.y * Math.exp(-10 * dt) };
        if (Math.hypot(offset.x, offset.y) < 0.05) offset = { x: 0, y: 0 };
        litDist = Math.max(litDist, dist);
      }
      if (pulse) {
        pulse.age += dt;
        if (pulse.age >= PULSE_SECONDS) pulse = null;
      }
      syncProgress();
      render();
      if (!isActive()) sk.noLoop();
    };
  };

  const instance = new P5(sketch, host);
  if (!host.querySelector("canvas")) {
    instance.remove();
    throw new Error("The story map canvas could not be created.");
  }

  const goTo = () => {
    if (prefersReducedMotion() || !visible) {
      parkAtSelected();
      p.redraw();
    } else {
      goAuto();
      p.loop();
    }
  };

  return {
    // React picked another checkpoint (button, Previous/Next): drive there along the road,
    // from wherever the car is, even if the visitor was driving it.
    setSelected(index) {
      if (index === selected) return;
      selected = index;
      goTo();
    },
    // The visitor clicked the checkpoint that's already selected: if they've driven away from it,
    // take the car back there.
    goToSelected() {
      if (manual) goTo();
    },
    // The container changed size: rebuild for the new canvas.
    setLayout(next) {
      if (next.key === layout.key) return;
      const driven = litDist / route.length;
      layout = next;
      route = buildRoute(layout);
      parkAtSelected();
      litDist = Math.max(dist, driven * route.length);
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
        input = NO_INPUT;
        parkAtSelected();
        p.noLoop();
      } else {
        p.redraw();
      }
    },
    // "Drive Yourself" on/off. Turning it off sends the car back to the selected stop.
    setDriving(on) {
      if (driving === !!on) return;
      driving = !!on;
      if (!driving) {
        input = NO_INPUT;
        if (manual) goTo();
      }
    },
    // The keys / touch buttons currently held. Only does anything while driving.
    setInput(next) {
      input = { ...NO_INPUT, ...next };
      if (!driving || !visible || !anyInput()) return;
      if (!manual) takeControl();
      p.loop();
    },
    destroy() {
      p.noLoop();
      try {
        p.remove();
      } catch (error) {
        // Leaving the page must never fail just because p5's cleanup hiccuped.
        console.warn("p5 cleanup problem (ignored):", error);
      }
      freeLayers();
      sceneLayer = progressLayer = p = null;
    },
  };
}
