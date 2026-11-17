import {
  ANGLE_MAX,
  ANGLE_MIN,
  TAP_ANGLE,
  TAP_POWER,
  TAP_POWER_MIN,
  TAP_POWER_START,
  TARGETS,
  launch,
  segmentHitsCircle,
  stepArrow,
} from "./archeryPhysics";

// Same flight and hit test as the sketch: 60 frames a second, 4 small steps per frame, 0.8 slack.
function hits(angle, power, target) {
  let arrow = launch(angle, power);
  for (let step = 0; step < 2400; step++) {
    const next = stepArrow(arrow, 1 / 240);
    if (segmentHitsCircle(arrow, next, target, target.r, 0.8)) return true;
    if (next.h <= 0) return false;
    arrow = next;
  }
  return false;
}

// Every angle and pull a tap-only player can reach from the starting aim (0.62 rad, 60%).
const tapAngles = [];
for (let a = 0.62; a >= ANGLE_MIN; a -= TAP_ANGLE) tapAngles.push(a);
for (let a = 0.62 + TAP_ANGLE; a <= ANGLE_MAX; a += TAP_ANGLE) tapAngles.push(a);
const tapPowers = [];
for (let p = TAP_POWER_START; p >= TAP_POWER_MIN - 1e-9; p -= TAP_POWER) tapPowers.push(Math.round(p * 100) / 100);
for (let p = TAP_POWER_START + TAP_POWER; p <= 1 + 1e-9; p += TAP_POWER) tapPowers.push(Math.round(p * 100) / 100);

test.each(TARGETS.map((target, i) => [i + 1, target]))("target %i can be hit with tap buttons alone", (_n, target) => {
  const ways = tapAngles.flatMap((a) => tapPowers.filter((p) => hits(a, p, target)));
  // More than one way in, so it doesn't take a pixel-perfect combination.
  expect(ways.length).toBeGreaterThan(3);
});
