// "Drive Yourself": the arcade driving rules for the little car. Plain math (no p5, no React) so
// it can be unit tested. Positions are in art pixels, like journeyRoute.js.
//
// Kept deliberately simple: the car accelerates, brakes, and turns while it's moving. There are no
// walls. The grass just slows you down, and an invisible corridor around the road gently holds
// you in (so you can cut corners but never get lost or stuck).
import { clamp } from "../../utils";
import { ROAD_RADIUS, nearestOnRoad } from "./journeyRoute";

// Speeds are in CSS pixels per second, so the car feels the same on the wide map (4px art
// pixels) and the phone map (3px). They're divided by the layout's pixel size when used.
export const DRIVE = {
  maxSpeed: 240,
  maxReverse: 100,
  accel: 380,
  brake: 560,
  friction: 90, // how fast it coasts to a stop with no keys held
  grass: 0.55, // top speed multiplier off the road
  turnRate: 3, // radians per second at full grip
  fullGripSpeed: 60, // below this the steering gets weaker (but never zero)
  minGrip: 0.55, // ...it keeps at least this much, so you can always turn around
  turning: 0.75, // top speed multiplier while a turn key is held (tight turns need less speed)
  phone: 0.8, // top speed multiplier on the phone map, whose bends are tighter
  recover: 2.2, // how firmly the car nose swings back toward the road near the corridor edge
};

// How far (art pixels) the car can wander from the road before it's held in.
const CORRIDOR = { wide: 11, tall: 8 };

// How close (art pixels) counts as "at" a checkpoint. Generous on purpose: no precise parking.
export const REACH_RADIUS = 8;

// Which checkpoint (index) the point is close enough to, or -1.
export function checkpointNear(route, x, y, radius = REACH_RADIUS) {
  let found = -1;
  let best = radius;
  route.cps.forEach((cp, i) => {
    const d = Math.hypot(cp.x - x, cp.y - y);
    if (d <= best) {
      best = d;
      found = i;
    }
  });
  return found;
}

// Moves the car for `dt` seconds. `car` is { x, y, heading (radians, 0 = right), speed }.
// `input` is { up, down, left, right }. Returns the new car plus where it is on the road.
export function stepCar(car, input, dt, route) {
  const { ps, cols, rows, kind } = route.layout;
  const k = 1 / ps;
  const offRoad = nearestOnRoad(route, car.x, car.y).d > ROAD_RADIUS + 1.5;
  const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const grip = (offRoad ? DRIVE.grass : 1) * (steer ? DRIVE.turning : 1) * (kind === "tall" ? DRIVE.phone : 1);

  // Speed
  let speed = car.speed;
  const throttle = (input.up ? 1 : 0) - (input.down ? 1 : 0);
  if (throttle > 0) speed += (speed < 0 ? DRIVE.brake : DRIVE.accel) * k * dt;
  else if (throttle < 0) speed -= (speed > 0 ? DRIVE.brake : DRIVE.accel * 0.7) * k * dt;
  else speed -= Math.sign(speed) * Math.min(Math.abs(speed), DRIVE.friction * k * dt);
  if (offRoad) speed *= Math.exp(-1.2 * dt);
  speed = clamp(speed, -DRIVE.maxReverse * k * grip, DRIVE.maxSpeed * k * grip);

  // Steering: weaker when barely moving, and flipped when reversing (like a real car).
  const bite = clamp(Math.abs(speed) / (DRIVE.fullGripSpeed * k), DRIVE.minGrip, 1);
  let heading = car.heading + steer * DRIVE.turnRate * bite * (speed < 0 ? -1 : 1) * dt;

  let x = car.x + Math.cos(heading) * speed * dt;
  let y = car.y + Math.sin(heading) * speed * dt;

  // The corridor around the road: slide back along its edge instead of crashing.
  const limit = CORRIDOR[kind];
  let near = nearestOnRoad(route, x, y);
  if (near.d > limit * 0.7 && speed > 0) {
    // Close to the edge: the car's nose gently swings back toward the road (so a hairpin turn
    // never leaves you stuck pushing against the edge).
    const toward = Math.atan2(near.y - y, near.x - x);
    const turn = Math.atan2(Math.sin(toward - heading), Math.cos(toward - heading));
    heading += clamp(turn, -1, 1) * DRIVE.recover * Math.min(1.5, (near.d - limit * 0.7) / (limit * 0.3)) * dt;
  }
  if (near.d > limit) {
    x = near.x + ((x - near.x) / near.d) * limit;
    y = near.y + ((y - near.y) / near.d) * limit;
    speed *= Math.exp(-1.5 * dt);
  }

  // The edge of the map: stop there (checked last, so nothing can push the car outside it).
  const cx = clamp(x, 2, cols - 3);
  const cy = clamp(y, 2, rows - 3);
  if (cx !== x || cy !== y) speed = 0;
  x = cx;
  y = cy;
  near = nearestOnRoad(route, x, y);

  return { x, y, heading, speed, near };
}
