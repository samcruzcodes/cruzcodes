// The geometry for the My Story road. Plain math, no p5 and no React, so both the canvas sketch
// and the HTML checkpoint buttons use the exact same numbers (and it can be unit tested).
//
// Everything is measured in "art pixels": the canvas is tiny (about 160 x 100) and the browser
// scales it up with crisp edges (CSS image-rendering: pixelated), which gives the chunky
// retro look for almost no memory.

// Containers narrower than this get the tall (phone) road.
export const WIDE_MIN_WIDTH = 560;

// The tall (phone) road is never wider than this many CSS pixels (keep .journeyStage--tall's
// max-width in retro.css the same).
export const TALL_MAX_WIDTH = 384;

// How far apart (in art pixels) the sampled points along the road are.
export const SAMPLE_STEP = 0.5;

// Half the road's width, in art pixels (the road is 2 * ROAD_RADIUS + 1 wide).
export const ROAD_RADIUS = 3;

// The road is a smooth curve through waypoints, written as fractions of the canvas (0 to 1).
// Checkpoints sit at the crest or trough of each bend, and their buttons (`side`) sit away from
// the road so the little car stays visible when it parks.
const ease = (u) => (1 - Math.cos(Math.PI * u)) / 2;

// Walks through the anchors, adding a few eased points between each pair (easing `axis`, so the
// road flattens out at every anchor instead of making a sharp V). Returns the waypoints and
// which waypoint each anchor became.
function windThrough(anchors, axis) {
  const steps = 4;
  const points = [];
  const at = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [x0, y0] = anchors[i];
    const [x1, y1] = anchors[i + 1];
    at.push(points.length);
    for (let k = 0; k < steps; k++) {
      const u = k / steps;
      points.push(axis === "y" ? [x0 + (x1 - x0) * u, y0 + (y1 - y0) * ease(u)] : [x0 + (x1 - x0) * ease(u), y0 + (y1 - y0) * u]);
    }
  }
  at.push(points.length);
  points.push(anchors[anchors.length - 1]);
  return { points, at };
}

const SIDES = { wide: ["down", "up", "down", "up", "down", "up"], tall: ["left", "right", "left", "right", "left", "right"] };

const SHAPES = (() => {
  // Wide: gentle S-curves left to right; checkpoints alternate low / high.
  const wideAnchors = [[-0.02, 0.5]];
  for (let i = 0; i < 6; i++) wideAnchors.push([0.09 + i * 0.164, i % 2 ? 0.36 : 0.64]);
  wideAnchors.push([1.02, 0.5]);

  // Tall (phones): one road snaking down the canvas, checkpoints at the left / right turns.
  const tallAnchors = [[0.5, -0.02]];
  for (let i = 0; i < 6; i++) tallAnchors.push([i % 2 ? 0.76 : 0.24, 0.08 + i * 0.168]);
  tallAnchors.push([0.5, 1.02]);

  const build = (kind, anchors, axis) => {
    const { points, at } = windThrough(anchors, axis);
    return { points, cps: SIDES[kind].map((side, i) => ({ at: at[i + 1], side })) };
  };
  return { wide: build("wide", wideAnchors, "y"), tall: build("tall", tallAnchors, "x") };
})();

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// Picks the canvas size for a container that is `width` CSS pixels wide (the space available,
// not the map itself, so it can switch back to the wide road when there's room).
// `ps` = CSS pixels per art pixel; cols x rows = the canvas buffer size in art pixels.
export function getLayout(width) {
  const w = Math.max(240, Math.round(width) || 0);
  const kind = w >= WIDE_MIN_WIDTH ? "wide" : "tall";
  const ps = kind === "wide" ? 4 : 3;
  const usable = kind === "wide" ? w : Math.min(w, TALL_MAX_WIDTH);
  const cols = Math.round(usable / ps);
  const heightPx = kind === "wide" ? clamp(Math.round(w / 2.4), 360, 400) : Math.round(usable * 1.15);
  const rows = Math.round(heightPx / ps);
  return { kind, ps, cols, rows, key: `${kind}-${cols}x${rows}` };
}

// Smooth curve through the waypoints (Catmull-Rom), as a dense list of [x, y]. Also records
// which dense point is each waypoint, so checkpoints sit exactly on the road.
function curveThrough(pts, perSegment = 16) {
  const dense = [];
  const waypointIndex = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    waypointIndex.push(dense.length);
    for (let k = 0; k < perSegment; k++) {
      const t = k / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      dense.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  waypointIndex.push(dense.length);
  dense.push(pts[pts.length - 1]);
  return { dense, waypointIndex };
}

const routeCache = new Map();

// Everything for one layout: the road as evenly spaced points (`xs`/`ys`, SAMPLE_STEP apart),
// its length, and each checkpoint's spot on the road (`x`, `y`, `s` = distance along the road)
// plus where its button goes (`pinX`, `pinY`, `side`).
export function buildRoute(layout) {
  if (routeCache.has(layout.key)) return routeCache.get(layout.key);

  const shape = SHAPES[layout.kind];
  const toPx = ([x, y]) => [x * layout.cols, y * layout.rows];
  const { dense, waypointIndex } = curveThrough(shape.points.map(toPx));

  // Distance along the dense curve at every point.
  const dist = [0];
  for (let i = 1; i < dense.length; i++) {
    dist.push(dist[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  }
  const length = dist[dist.length - 1];

  // Re-sample at an even spacing.
  const count = Math.floor(length / SAMPLE_STEP) + 1;
  const xs = new Float32Array(count);
  const ys = new Float32Array(count);
  let j = 0;
  for (let n = 0; n < count; n++) {
    const d = n * SAMPLE_STEP;
    while (j < dist.length - 2 && dist[j + 1] < d) j++;
    const span = dist[j + 1] - dist[j] || 1;
    const t = clamp((d - dist[j]) / span, 0, 1);
    xs[n] = dense[j][0] + (dense[j + 1][0] - dense[j][0]) * t;
    ys[n] = dense[j][1] + (dense[j + 1][1] - dense[j][1]) * t;
  }

  // Where buttons may sit: far enough from the edges that a 44px button (and, on the wide road,
  // its label) stays inside the canvas.
  const marginX = Math.ceil((layout.kind === "wide" ? 80 : 26) / layout.ps);
  const marginY = Math.ceil(26 / layout.ps);
  const offset = Math.round((layout.kind === "wide" ? 56 : 45) / layout.ps);
  const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  const cps = shape.cps.map(({ at, side }) => {
    const [x, y] = toPx(shape.points[at]);
    const [dx, dy] = dirs[side];
    return {
      x,
      y,
      s: dist[waypointIndex[at]],
      side,
      pinX: clamp(x + dx * offset, marginX, layout.cols - marginX),
      pinY: clamp(y + dy * offset, marginY, layout.rows - marginY),
    };
  });

  const route = { layout, xs, ys, length, cps };
  routeCache.set(layout.key, route);
  return route;
}

// The point `s` art pixels along the road, plus which way the road is heading there.
export function pointAt(route, s) {
  const last = route.xs.length - 1;
  const f = clamp(s / SAMPLE_STEP, 0, last);
  const i = Math.min(last - 1, Math.floor(f));
  const t = f - i;
  const x = route.xs[i] + (route.xs[i + 1] - route.xs[i]) * t;
  const y = route.ys[i] + (route.ys[i + 1] - route.ys[i]) * t;
  return { x, y, dx: route.xs[i + 1] - route.xs[i], dy: route.ys[i + 1] - route.ys[i] };
}

// The closest spot on the road to (x, y): its position, how far along the road it is (`s`), and
// how far away it is (`d`). The road has only about a thousand sample points, so a plain scan
// is cheap enough to do every frame.
export function nearestOnRoad(route, x, y) {
  let best = 0;
  let bestD2 = Infinity;
  for (let i = 0; i < route.xs.length; i++) {
    const d2 = (route.xs[i] - x) ** 2 + (route.ys[i] - y) ** 2;
    if (d2 < bestD2) {
      bestD2 = d2;
      best = i;
    }
  }
  return { x: route.xs[best], y: route.ys[best], s: best * SAMPLE_STEP, d: Math.sqrt(bestD2) };
}
