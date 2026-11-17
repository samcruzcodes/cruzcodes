// The archery challenge's rules: plain math (no p5, no React), so it can be unit tested.
import { clamp } from "../../../utils";
//
// The world is 160 units wide and measured from the ground up: (x, h) = across, height above the
// ground. The sketch scales it to whatever size the screen is, so a shot behaves the same on a
// phone and a big monitor.

export const WORLD_W = 160;
export const GRAVITY = 65; // units per second squared

// Where the archer's bow hand is, and how far the arrow starts in front of it.
export const BOW = { x: 20, h: 13, reach: 6 };

// An arrow leaves at SPEED_MIN..SPEED_MAX units/second, depending on how far you draw.
const SPEED_MIN = 30;
const SPEED_MAX = 100;
export const MIN_POWER = 0.12; // a tiny tug does nothing (so a click without a pull isn't a shot)

// Aim limits, in radians (about 2 and 83 degrees).
export const ANGLE_MIN = 0.03;
export const ANGLE_MAX = 1.45;

// One tap of the tap buttons (the no-drag way to play): 2 degrees of aim, or 5% of pull. The tap
// pull starts at 60% and goes from 15% to 100%. archeryPhysics.test.js checks every target can be
// hit in these steps.
export const TAP_ANGLE = (2 * Math.PI) / 180;
export const TAP_POWER = 0.05;
export const TAP_POWER_START = 0.6;
export const TAP_POWER_MIN = 0.15;

// The six targets, one per story checkpoint (`checkpoint` = its index in `journey` in data.js).
// They come in three rounds of two, each round harder than the last: farther away, smaller,
// and (from round 2) bobbing up and down. Motion is skipped for reduced-motion visitors.
export const TARGETS = [
  { checkpoint: 0, x: 66, h: 16, r: 9 },
  { checkpoint: 1, x: 88, h: 30, r: 8 },
  { checkpoint: 2, x: 104, h: 20, r: 6.5, bob: { amp: 6, hz: 0.3, phase: 0 } },
  { checkpoint: 3, x: 122, h: 36, r: 6, bob: { amp: 8, hz: 0.35, phase: 1.5 } },
  { checkpoint: 4, x: 134, h: 24, r: 5, bob: { amp: 9, hz: 0.45, phase: 0.7 } },
  { checkpoint: 5, x: 148, h: 42, r: 4.6, bob: { amp: 9, hz: 0.55, phase: 2.2 } },
];
export const ROUNDS = 3;
export const roundOf = (targetIndex) => Math.floor(targetIndex / 2);

export const launchSpeed = (power) => SPEED_MIN + (SPEED_MAX - SPEED_MIN) * clamp(power, 0, 1);

// Where the arrow starts for a given aim.
const arrowStart = (angle) => ({
  x: BOW.x + Math.cos(angle) * BOW.reach,
  h: BOW.h + Math.sin(angle) * BOW.reach,
});

export function launch(angle, power) {
  const start = arrowStart(angle);
  const speed = launchSpeed(power);
  return { x: start.x, h: start.h, vx: Math.cos(angle) * speed, vh: Math.sin(angle) * speed };
}

// Moves an arrow forward `dt` seconds (gravity only: no wind, no drag, so it's easy to learn).
export function stepArrow(arrow, dt) {
  const vh = arrow.vh - GRAVITY * dt;
  return { x: arrow.x + arrow.vx * dt, h: arrow.h + vh * dt, vx: arrow.vx, vh };
}

// The way the arrow is pointing (nose along its motion).
export const arrowAngle = (arrow) => Math.atan2(arrow.vh, arrow.vx);

// Where the aim preview dots go: the first part of the flight only, so you still have to judge
// the rest yourself.
export function previewPoints(angle, power, { count = 12, spacing = 0.07 } = {}) {
  const points = [];
  let arrow = launch(angle, power);
  for (let i = 0; i < count; i++) {
    for (let s = 0; s < 4; s++) arrow = stepArrow(arrow, spacing / 4);
    if (arrow.h < 0) break;
    points.push({ x: arrow.x, h: arrow.h });
  }
  return points;
}

// Where a target is at `time` seconds (bobbing up and down, unless motion is reduced).
export function targetAt(target, time, reduceMotion = false) {
  if (!target.bob || reduceMotion) return { x: target.x, h: target.h };
  const { amp, hz, phase } = target.bob;
  return { x: target.x, h: target.h + amp * Math.sin(2 * Math.PI * hz * time + phase) };
}

// Did the arrow's path from `from` to `to` pass through the circle? (Checks the whole segment, so a
// fast arrow can't skip over a small target between frames.) `slack` is a little forgiveness.
export function segmentHitsCircle(from, to, center, radius, slack = 1) {
  const reach = radius + slack;
  const dx = to.x - from.x;
  const dh = to.h - from.h;
  const lengthSq = dx * dx + dh * dh;
  const t = lengthSq === 0 ? 0 : clamp(((center.x - from.x) * dx + (center.h - from.h) * dh) / lengthSq, 0, 1);
  const nearest = { x: from.x + dx * t, h: from.h + dh * t };
  return Math.hypot(nearest.x - center.x, nearest.h - center.h) <= reach;
}

// How close to the middle (0 = dead center, 1 = the edge).
export const hitCloseness = (point, center, radius) => Math.hypot(point.x - center.x, point.h - center.h) / radius;

// Turns a "pull back and release" drag into a shot. (dx, dy) is how far the pointer is from where
// it was pressed, in screen pixels (y down); you pull AWAY from where you want to shoot, like
// drawing a bow. `maxPull` is the pull (in pixels) that counts as full power.
export function aimFromPull(dx, dy, maxPull) {
  const pull = Math.hypot(dx, dy);
  const power = clamp(pull / maxPull, 0, 1);
  // Shot direction is opposite the pull. Pulling forward (shot would go backwards) aims straight up.
  const angle = dx >= 0 ? ANGLE_MAX : clamp(Math.atan2(dy, -dx), ANGLE_MIN, ANGLE_MAX);
  return { angle, power, valid: power >= MIN_POWER };
}

// The angle and power that put the arrow through the middle of a still target (or null if it's
// out of reach). Used by the tests to check every target can be hit, and by browser tests.
// Several angles work; `prefer` picks which of them (0 = flattest, 1 = highest).
export function solveShot(target, prefer = 0.5) {
  const solutions = [];
  for (let angle = 0.06; angle <= 1.4; angle += 0.005) {
    const start = arrowStart(angle);
    const dx = target.x - start.x;
    const dh = target.h - start.h;
    const lift = dx * Math.tan(angle) - dh;
    if (dx <= 0 || lift <= 0) continue;
    const speed = Math.sqrt((GRAVITY * dx * dx) / (2 * Math.cos(angle) ** 2 * lift));
    const power = (speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN);
    if (power >= MIN_POWER && power <= 1) solutions.push({ angle, power });
  }
  return solutions.length ? solutions[Math.round((solutions.length - 1) * prefer)] : null;
}
