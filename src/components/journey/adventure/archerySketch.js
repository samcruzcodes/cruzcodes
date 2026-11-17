// The p5.js sketch for the archery challenge: a pixel-art shooting range at dusk, an archer on a
// rock, and six targets (one per story checkpoint) in three rounds.
//
// p5 only draws and simulates here. React owns the page: the buttons, the story card, the shot
// counter and the screen reader messages. This file tells React what happened through
// onEvent({ type: 'shot' | 'hit' | 'miss' | 'round' | 'complete' | 'aim' | 'replay', ... }).
//
// Like the road map, it draws a tiny canvas (about 180 x 120 "art pixels") that CSS scales up
// crisply, and it stops drawing (noLoop) whenever nothing is moving.
import {
  ANGLE_MAX,
  ANGLE_MIN,
  BOW,
  MIN_POWER,
  ROUNDS,
  TAP_POWER_MIN,
  TAP_POWER_START,
  TARGETS,
  WORLD_W,
  aimFromPull,
  arrowAngle,
  hitCloseness,
  launch,
  previewPoints,
  roundOf,
  segmentHitsCircle,
  stepArrow,
  targetAt,
} from "./archeryPhysics";
import { clamp, prefersReducedMotion } from "../../../utils";
import { ARCHER, ARCHER_COLORS, ARCHER_PIVOT, ARCHER_SHOULDER, C, PINE, PINE_COLORS, SKY } from "./pixelArt";

// A tiny 3 x 5 number font, for the digits above the targets (they match the checkpoint buttons).
const DIGITS = {
  1: [".#.", "##.", ".#.", ".#.", "###"],
  2: ["##.", "..#", ".#.", "#..", "###"],
  3: ["##.", "..#", ".##", "..#", "##."],
  4: ["#.#", "#.#", "###", "..#", "..#"],
  5: ["###", "#..", "##.", "..#", "##."],
  6: [".##", "#..", "###", "#.#", "###"],
};

// Picks the canvas size for a stage `width` x `height` CSS pixels. `s` converts world units to art pixels.
function makeLayout(width, height) {
  const w = Math.max(240, Math.round(width) || 0);
  const h = Math.max(200, Math.round(height) || 0);
  const ps = w >= 900 ? 5 : w >= 560 ? 4 : 3;
  const cols = Math.round(w / ps);
  const rows = Math.round(h / ps);
  return { ps, cols, rows, s: cols / WORLD_W, groundRow: rows - 12, key: `${cols}x${rows}` };
}

function makeRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Mounts the sketch inside `host`. Returns a controller; call destroy() when done.
//   options = { width, height, onEvent, hits, shots }
//   `hits` (target numbers already hit) and `shots` let the game pick up where it left off when it's reopened.
export function mountArcherySketch(P5, host, options) {
  let layout = makeLayout(options.width, options.height);
  const emit = (event) => options.onEvent?.(event);

  // --- game state
  const hits = new Set(); // target indexes that have been hit
  const stuck = new Map(); // target index -> the arrow in it
  let arrows = []; // arrows in the air
  let groundArrows = []; // arrows stuck in the ground
  let particles = [];
  let shots = options.shots || 0;
  let time = 0; // seconds, for the bobbing targets
  let shownRound = 0; // which round's targets are out
  let roundDelay = 0; // pause before the next round's targets appear
  let shake = 0;
  let recoil = 0;
  const flash = new Map(); // target index -> seconds left of the hit flash
  const aim = { angle: 0.62, power: 0, drawing: false, mode: null, valid: false };
  const keys = { up: false, down: false };
  let keyDrawTime = 0;
  let tapPower = TAP_POWER_START; // the pull the tap buttons have set (it stays put between shots)
  let lastAimEmit = 0;
  let fps = 60;

  let bg = null;
  let p = null;
  let ctx = null;

  const px = (x) => x * layout.s;
  const py = (h) => layout.groundRow - h * layout.s;

  const rect = (color, x, y, w = 1, h = 1) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };

  // A solid disc, pixel by pixel (no smoothed edges).
  const disc = (color, cx, cy, radius) => {
    ctx.fillStyle = color;
    const r = Math.max(1, Math.round(radius));
    for (let dy = -r; dy <= r; dy++) {
      const half = Math.floor(Math.sqrt(r * r - dy * dy + r * 0.5));
      ctx.fillRect(cx - half, cy + dy, half * 2 + 1, 1);
    }
  };

  const sprite = (rows, colors, left, top, target = ctx) => {
    rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        if (row[c] === ".") continue;
        target.fillStyle = colors[row[c]];
        target.fillRect(left + c, top + r, 1, 1);
      }
    });
  };

  // A pixel line from (x0, y0) to (x1, y1).
  const line = (color, x0, y0, x1, y1) => {
    ctx.fillStyle = color;
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= steps; i++) {
      ctx.fillRect(Math.round(x0 + ((x1 - x0) * i) / steps), Math.round(y0 + ((y1 - y0) * i) / steps), 1, 1);
    }
  };

  // --- the scenery, painted once per size
  const buildBackdrop = () => {
    const { cols, rows, groundRow } = layout;
    bg = document.createElement("canvas");
    bg.width = cols;
    bg.height = rows;
    const g = bg.getContext("2d");
    const random = makeRandom(cols * 31 + rows);

    SKY.forEach((color, i) => {
      g.fillStyle = color;
      const top = Math.floor((groundRow * i) / SKY.length);
      g.fillRect(0, top, cols, Math.ceil(groundRow / SKY.length) + 1);
    });
    for (let i = 0; i < 34; i++) {
      g.fillStyle = random() > 0.8 ? C.text : C.border;
      g.fillRect(Math.floor(random() * cols), Math.floor(random() * groundRow * 0.6), 1, 1);
    }
    // A crescent moon.
    const mx = Math.round(cols * 0.8);
    const my = Math.round(groundRow * 0.2);
    g.fillStyle = C.text;
    for (let dy = -6; dy <= 6; dy++) {
      const half = Math.floor(Math.sqrt(36 - dy * dy + 3));
      g.fillRect(mx - half, my + dy, half * 2 + 1, 1);
    }
    g.fillStyle = SKY[1];
    for (let dy = -6; dy <= 6; dy++) {
      const half = Math.floor(Math.sqrt(36 - dy * dy + 3));
      g.fillRect(mx - half + 4, my + dy - 1, half * 2 + 1, 1);
    }
    // Two rows of hills, with little pines along the far ones.
    const farLine = (x) => groundRow - (20 + 9 * Math.sin(x * 0.05) + 5 * Math.sin(x * 0.13 + 1));
    const nearLine = (x) => groundRow - (8 + 5 * Math.sin(x * 0.07 + 2) + 3 * Math.sin(x * 0.21));
    for (let x = 0; x < cols; x++) {
      g.fillStyle = "#14281f";
      g.fillRect(x, Math.round(farLine(x)), 1, groundRow);
    }
    for (let x = 6; x < cols - 6; x += 15 + Math.floor(random() * 12)) {
      sprite(PINE, PINE_COLORS, x, Math.round(farLine(x)) - 4, g);
    }
    for (let x = 0; x < cols; x++) {
      g.fillStyle = "#183629";
      g.fillRect(x, Math.round(nearLine(x)), 1, groundRow);
    }
    // The ground.
    g.fillStyle = C.panel2;
    g.fillRect(0, groundRow, cols, rows - groundRow);
    g.fillStyle = C.border;
    g.fillRect(0, groundRow, cols, 1);
    for (let x = 1; x < cols; x += 4 + Math.floor(random() * 4)) {
      g.fillStyle = C.deep;
      g.fillRect(x, groundRow - 1, 1, 1);
    }
    for (let i = 0; i < cols / 3; i++) {
      g.fillStyle = C.panel;
      g.fillRect(Math.floor(random() * cols), groundRow + 2 + Math.floor(random() * (rows - groundRow - 2)), 2, 1);
    }
  };

  // --- the round the visitor is on (the first one with a target still standing)
  const currentRound = () => {
    for (let r = 0; r < ROUNDS; r++) {
      if (TARGETS.some((_, i) => roundOf(i) === r && !hits.has(i))) return r;
    }
    return ROUNDS;
  };

  const targetsOut = () => TARGETS.map((t, i) => i).filter((i) => roundOf(i) <= shownRound);

  const movingTargetsOut = () => !prefersReducedMotion() && targetsOut().some((i) => TARGETS[i].bob && !hits.has(i));

  const targetPos = (i) => targetAt(TARGETS[i], time, prefersReducedMotion());

  // --- drawing
  const drawArrowPixels = (tipX, tipY, angle, length) => {
    const dx = Math.cos(angle);
    const dy = -Math.sin(angle);
    for (let i = 0; i < length; i++) rect(i < 2 ? C.text : i > length - 4 ? C.accent : C.muted, tipX - dx * i, tipY - dy * i);
    // fletching
    const tx = tipX - dx * (length - 1);
    const ty = tipY - dy * (length - 1);
    rect(C.accent, tx - dy, ty + dx);
    rect(C.accent, tx + dy, ty - dx);
  };

  const drawTarget = (i) => {
    const t = TARGETS[i];
    const pos = targetPos(i);
    const cx = Math.round(px(pos.x));
    const cy = Math.round(py(pos.h));
    const radius = t.r * layout.s;
    const done = hits.has(i);
    const lit = flash.get(i) > 0;

    // the post and base
    rect(C.border, cx - 1, cy + radius, 2, layout.groundRow - cy - radius);
    rect(C.panel2, cx - 4, layout.groundRow - 2, 9, 2);
    // the target: white, mint, white, deep green, and a bright bullseye
    disc(C.text, cx, cy, radius);
    disc(lit ? C.text : C.accent, cx, cy, radius * 0.74);
    disc(C.text, cx, cy, radius * 0.5);
    disc(done ? C.accent : C.deep, cx, cy, radius * 0.26);
    // a ring around targets still to hit (it blinks gently), so you can tell which ones count
    if (!done) {
      const blink = prefersReducedMotion() || Math.floor(time * 2) % 2 === 0;
      const ringColor = blink ? C.accent : C.border;
      for (let a = 0; a < 40; a++) {
        const ang = (a / 40) * Math.PI * 2;
        rect(ringColor, cx + Math.cos(ang) * (radius + 2.5), cy + Math.sin(ang) * (radius + 2.5));
      }
    }
    // the checkpoint number above it
    const rows = DIGITS[t.checkpoint + 1];
    const top = Math.round(cy - radius - 11);
    rect(done ? C.accent : C.bg, cx - 4, top - 1, 9, 7);
    rect(C.border, cx - 4, top - 1, 9, 1);
    rect(C.border, cx - 4, top + 5, 9, 1);
    rect(C.border, cx - 4, top - 1, 1, 7);
    rect(C.border, cx + 4, top - 1, 1, 7);
    rows.forEach((row, r) => {
      for (let c = 0; c < 3; c++) if (row[c] === "#") rect(done ? C.bg : C.text, cx - 1 + c, top + r);
    });
    // the arrow sticking out of it
    const arrow = stuck.get(i);
    if (arrow) {
      const wobble = prefersReducedMotion() ? 0 : Math.sin(time * 30) * Math.max(0, 0.5 - (time - arrow.at)) * 0.35;
      const tipX = px(pos.x + arrow.dx);
      const tipY = py(pos.h + arrow.dh);
      drawArrowPixels(tipX, tipY, arrow.angle + wobble, 13);
    }
  };

  const drawArcher = () => {
    const pivotX = Math.round(px(BOW.x));
    const pivotY = Math.round(py(BOW.h));
    const left = pivotX - ARCHER_PIVOT.col;
    const top = pivotY - ARCHER_PIVOT.row;
    const feet = top + ARCHER.length;

    // the rock the archer stands on
    if (feet < layout.groundRow) {
      rect(C.border, left + 1, feet, 15, 1);
      rect(C.panel2, left + 1, feet + 1, 15, layout.groundRow - feet - 1);
      for (let y = feet + 2; y < layout.groundRow; y += 3) rect(C.panel, left + 1, y, 15, 1);
    }
    sprite(ARCHER, ARCHER_COLORS, left, top);

    // Aim: where the bow points, and how far it's drawn.
    const angle = aim.angle;
    const dx = Math.cos(angle);
    const dy = -Math.sin(angle);
    const px_ = -dy; // perpendicular (screen)
    const py_ = dx;
    const draw = aim.drawing ? aim.power : 0;
    const bowX = pivotX - recoil * dx * 2;
    const bowY = pivotY - recoil * dy * 2;

    // bow limbs: an arc bulging forward
    let prev = null;
    for (let i = -9; i <= 9; i++) {
      const t = i / 9;
      const bulge = 2.5 * (1 - t * t) - draw * 1.2 * (1 - t * t);
      const x = bowX + px_ * i + dx * bulge;
      const y = bowY + py_ * i + dy * bulge;
      if (prev) line(C.text, prev[0], prev[1], x, y);
      prev = [x, y];
    }
    const tip1 = [bowX + px_ * -9, bowY + py_ * -9];
    const tip2 = [bowX + px_ * 9, bowY + py_ * 9];
    const nock = [bowX - dx * 6 * draw, bowY - dy * 6 * draw];
    line(C.muted, tip1[0], tip1[1], nock[0], nock[1]);
    line(C.muted, tip2[0], tip2[1], nock[0], nock[1]);
    // arms
    const shoulder = [left + ARCHER_SHOULDER.col, top + ARCHER_SHOULDER.row];
    line(C.deep, shoulder[0], shoulder[1], bowX, bowY);
    if (aim.drawing) line(C.deep, shoulder[0], shoulder[1], nock[0], nock[1]);
    // the arrow on the string
    if (aim.drawing || recoil <= 0) {
      const tipX = nock[0] + dx * 12;
      const tipY = nock[1] + dy * 12;
      drawArrowPixels(tipX, tipY, angle, 12);
    }

    if (aim.drawing) {
      // the dotted preview of where the arrow starts out
      previewPoints(angle, Math.max(aim.power, MIN_POWER)).forEach((point, i, all) => {
        rect(i < all.length * 0.5 ? C.accent : C.border, px(point.x), py(point.h));
      });
      // the power bar above the archer's head
      const barX = left - 3;
      const barY = top - 9;
      rect(C.border, barX, barY, 18, 4);
      rect(C.bg, barX + 1, barY + 1, 16, 2);
      rect(aim.power >= 0.98 ? C.text : C.accent, barX + 1, barY + 1, Math.round(16 * aim.power), 2);
    }
  };

  const render = () => {
    ctx.save();
    if (shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * 2), Math.round((Math.random() - 0.5) * 2));
    ctx.drawImage(bg, 0, 0);

    for (const g of groundArrows) drawArrowPixels(px(g.x), py(0) + 1, g.angle, 9);
    targetsOut().forEach(drawTarget);
    drawArcher();
    for (const a of arrows) {
      drawArrowPixels(px(a.x), py(a.h), arrowAngle(a), 12);
    }
    for (const part of particles) rect(part.color, part.x, part.y, part.size, part.size);
    ctx.restore();
  };

  // --- simulation
  const burst = (x, y, colors, count, spread) => {
    if (prefersReducedMotion()) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = (0.4 + Math.random()) * spread;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - spread * 0.4,
        life: 0.35 + Math.random() * 0.3,
        color: colors[i % colors.length],
        size: Math.random() > 0.7 ? 2 : 1,
      });
    }
  };

  const advanceRound = () => {
    const round = currentRound();
    if (round >= ROUNDS) {
      emit({ type: "complete", shots });
      return;
    }
    shownRound = round;
    emit({ type: "round", round: round + 1, targets: TARGETS.filter((_, i) => roundOf(i) === round).map((t) => t.checkpoint) });
  };

  const handleHit = (index, arrow, next, pos) => {
    const target = TARGETS[index];
    const closeness = hitCloseness(next, pos, target.r);
    hits.add(index);
    stuck.set(index, { dx: next.x - pos.x, dh: next.h - pos.h, angle: arrowAngle(arrow), at: time });
    flash.set(index, 0.16);
    const bullseye = closeness < 0.3;
    burst(px(next.x), py(next.h), bullseye ? [C.text, C.accent] : [C.accent, C.deep], bullseye ? 18 : 10, 26);
    if (bullseye && !prefersReducedMotion()) shake = 0.18;
    emit({ type: "hit", target: index, checkpoint: target.checkpoint, bullseye, shots });
    // The round is done when both its targets are down: bring out the next two after a beat.
    if (currentRound() !== shownRound) roundDelay = prefersReducedMotion() ? 0.05 : 0.9;
  };

  // The target (if any) that the arrow's last small move went through.
  const targetHitBy = (from, to) =>
    targetsOut().find((i) => !hits.has(i) && roundOf(i) === shownRound && segmentHitsCircle(from, to, targetPos(i), TARGETS[i].r, 0.8));

  const stepArrows = (dt) => {
    const remaining = [];
    for (const arrow of arrows) {
      let current = arrow;
      let over = false;
      for (let sub = 0; sub < 4 && !over; sub++) {
        const next = stepArrow(current, dt / 4);
        const hitIndex = targetHitBy(current, next);
        if (hitIndex !== undefined) {
          handleHit(hitIndex, current, next, targetPos(hitIndex));
          over = true;
        } else if (next.h <= 0) {
          groundArrows.push({ x: next.x, angle: arrowAngle(next) });
          if (groundArrows.length > 14) groundArrows.shift();
          burst(px(next.x), py(0), [C.muted, C.border], 6, 14);
          emit({ type: "miss", shots });
          over = true;
        } else if (next.x > WORLD_W + 30 || next.x < -20) {
          emit({ type: "miss", shots });
          over = true;
        }
        current = next;
      }
      if (!over) remaining.push(current);
    }
    arrows = remaining;
  };

  const needsFrames = () =>
    arrows.length > 0 ||
    particles.length > 0 ||
    (aim.drawing && aim.mode !== "tap") || // a bow held by the tap buttons stands still
    keys.up ||
    keys.down ||
    roundDelay > 0 ||
    shake > 0 ||
    recoil > 0 ||
    flash.size > 0;

  const wake = () => p?.loop();

  const emitAim = (force = false) => {
    const now = performance.now();
    if (!force && now - lastAimEmit < 100) return;
    lastAimEmit = now;
    emit({ type: "aim", angle: aim.angle, power: aim.power, drawing: aim.drawing });
  };

  const fire = () => {
    if (aim.power < MIN_POWER) return false;
    arrows.push(launch(aim.angle, aim.power));
    shots += 1;
    recoil = 1;
    emit({ type: "shot", shots });
    return true;
  };

  const endAim = (shoot) => {
    if (aim.drawing && shoot) fire();
    aim.drawing = false;
    aim.mode = null;
    aim.power = 0;
    keyDrawTime = 0;
    emitAim(true);
    wake();
  };

  const sketch = (sk) => {
    p = sk;
    sk.setup = () => {
      sk.pixelDensity(1);
      const canvas = sk.createCanvas(layout.cols, layout.rows);
      canvas.elt.setAttribute("aria-hidden", "true");
      canvas.elt.setAttribute("role", "presentation");
      ctx = sk.drawingContext;
      ctx.imageSmoothingEnabled = false;
      sk.noSmooth();
      sk.noLoop();
      buildBackdrop();
    };

    sk.draw = () => {
      const dt = Math.min(sk.deltaTime / 1000, 0.05);
      time += dt;

      // keys: aim up/down, and the draw grows while the key is held
      if (keys.up || keys.down) {
        aim.angle = clamp(aim.angle + ((keys.up ? 1 : 0) - (keys.down ? 1 : 0)) * 0.7 * dt, 0.03, 1.45);
        emitAim();
      }
      if (aim.drawing && aim.mode === "key") {
        keyDrawTime += dt;
        aim.power = clamp(keyDrawTime / 1.1, 0, 1);
        emitAim();
      }

      stepArrows(dt);

      if (roundDelay > 0) {
        roundDelay -= dt;
        if (roundDelay <= 0) advanceRound();
      }
      recoil = Math.max(0, recoil - dt * 6);
      shake = Math.max(0, shake - dt);
      for (const [i, left] of flash) {
        if (left - dt <= 0) flash.delete(i);
        else flash.set(i, left - dt);
      }
      particles = particles.filter((part) => {
        part.life -= dt;
        part.vy += 60 * dt;
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        return part.life > 0;
      });

      render();

      // Only moving targets keeping it awake? Then 30 frames a second is plenty.
      if (needsFrames()) {
        if (fps !== 60) sk.frameRate((fps = 60));
      } else if (movingTargetsOut()) {
        if (fps !== 30) sk.frameRate((fps = 30));
      } else {
        sk.noLoop();
      }
    };
  };

  const instance = new P5(sketch, host);
  if (!host.querySelector("canvas")) {
    instance.remove();
    throw new Error("The archery canvas could not be created.");
  }

  // Pick up where the visitor left off: those targets already have an arrow in them.
  (options.hits || []).forEach((i) => {
    if (TARGETS[i]) {
      hits.add(i);
      stuck.set(i, { dx: -1.5, dh: 0.8, angle: 0.5, at: -10 });
    }
  });
  shownRound = currentRound();
  const startRound = Math.min(shownRound, ROUNDS - 1);
  emit({ type: "round", round: startRound + 1, targets: TARGETS.filter((_, i) => roundOf(i) === startRound).map((t) => t.checkpoint) });
  p.redraw();
  if (movingTargetsOut()) wake();

  return {
    // Press: start pulling the bow back with the pointer.
    startAim() {
      aim.drawing = true;
      aim.mode = "pointer";
      aim.power = 0;
      aim.valid = false;
      emitAim(true);
      wake();
    },
    // Drag: (dx, dy) is how far the pointer is from where it was pressed (y down).
    aimPull(dx, dy, maxPull) {
      if (!aim.drawing || aim.mode !== "pointer") return;
      const result = aimFromPull(dx, dy, maxPull);
      aim.angle = result.angle;
      aim.power = result.power;
      aim.valid = result.valid;
      emitAim();
      wake();
    },
    // Release: shoot (if the bow was drawn far enough).
    release() {
      if (aim.mode === "pointer") endAim(aim.power >= MIN_POWER);
    },
    cancelAim() {
      if (aim.drawing) endAim(false);
    },
    // Keyboard: up / down tilt the bow while held.
    setKeys(next) {
      keys.up = !!next.up;
      keys.down = !!next.down;
      if (keys.up || keys.down) wake();
    },
    // Tap buttons (no dragging, no holding): each tap tilts the bow or changes the pull by one step,
    // and the bow stays drawn at that pull, with the aim dots showing, until you shoot.
    // Returns the new aim, or null while a pointer pull or a key draw is in progress.
    nudge({ angle = 0, power = 0 }) {
      if (aim.drawing && aim.mode !== "tap") return null;
      aim.angle = clamp(aim.angle + angle, ANGLE_MIN, ANGLE_MAX);
      tapPower = clamp(Math.round((tapPower + power) * 100) / 100, TAP_POWER_MIN, 1);
      aim.drawing = true;
      aim.mode = "tap";
      aim.power = tapPower;
      emitAim(true);
      wake();
      return { angle: aim.angle, power: tapPower };
    },
    // Tap "Shoot": fire at the angle and pull the buttons set, then draw again at the same pull.
    tapShoot() {
      if (aim.drawing && aim.mode !== "tap") return;
      aim.power = tapPower;
      fire();
      aim.drawing = true;
      aim.mode = "tap";
      emitAim(true);
      wake();
    },
    // Keyboard: hold to draw the bow, let go to shoot. (It takes over from a bow held by the tap buttons.)
    keyDraw(on) {
      if (on && (!aim.drawing || aim.mode === "tap")) {
        aim.drawing = true;
        aim.mode = "key";
        aim.power = 0;
        keyDrawTime = 0;
        wake();
      } else if (!on && aim.drawing && aim.mode === "key") {
        endAim(aim.power >= MIN_POWER);
      }
    },
    // Start over (the story cards stay available; this only resets the targets).
    replay() {
      hits.clear();
      stuck.clear();
      arrows = [];
      groundArrows = [];
      particles = [];
      shots = 0;
      roundDelay = 0;
      shake = 0;
      flash.clear();
      aim.drawing = false;
      aim.power = 0;
      shownRound = 0;
      emit({ type: "replay" });
      emit({ type: "round", round: 1, targets: TARGETS.filter((_, i) => roundOf(i) === 0).map((t) => t.checkpoint) });
      p.redraw();
      if (movingTargetsOut()) wake();
    },
    // The stage changed size: redraw for the new canvas (the game itself carries on).
    resize(width, height) {
      const next = makeLayout(width, height);
      if (next.key === layout.key) return;
      layout = next;
      p.resizeCanvas(layout.cols, layout.rows, true);
      ctx = p.drawingContext;
      ctx.imageSmoothingEnabled = false;
      p.noSmooth();
      buildBackdrop();
      p.redraw();
    },
    destroy() {
      p.noLoop();
      try {
        p.remove();
      } catch (error) {
        // Closing the game must never fail just because p5's cleanup hiccuped.
        console.warn("p5 cleanup problem (ignored):", error);
      }
      bg = null;
      p = null;
      ctx = null;
    },
  };
}
