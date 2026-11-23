import { ANGLE_START, TAP_ANGLE, TAP_POWER, TAP_POWER_START } from "./archeryPhysics";
import { mountArcherySketch } from "./archerySketch";

// jsdom has no canvas, so p5 is a stand-in that runs the sketch function and draws nothing. The
// controller and the events it sends (what the readout shows) are the real ones.
function FakeP5(sketch, host) {
  sketch(this);
  host.appendChild(document.createElement("canvas"));
}
FakeP5.prototype.redraw = () => {};
FakeP5.prototype.loop = () => {};
FakeP5.prototype.noLoop = () => {};
FakeP5.prototype.remove = () => {};

function mount() {
  const events = [];
  const game = mountArcherySketch(FakeP5, document.createElement("div"), {
    width: 800,
    height: 480,
    onEvent: (event) => events.push(event),
  });
  const lastAim = () => events.filter((e) => e.type === "aim").at(-1);
  return { game, events, lastAim };
}

test("Shoot before touching Power fires at the starting tap pull, and the readout says so", () => {
  const { game, events, lastAim } = mount();
  game.tapShoot();
  expect(events.filter((e) => e.type === "shot")).toHaveLength(1);
  expect(lastAim()).toMatchObject({ angle: ANGLE_START, power: TAP_POWER_START });
});

test("after a pointer shot the readout shows the tap pull again, not 0%", () => {
  const { game, lastAim } = mount();
  game.startAim();
  expect(lastAim().power).toBe(0); // a fresh pull starts from nothing
  game.aimPull(-120, 60, 170);
  game.release();
  expect(lastAim()).toMatchObject({ drawing: false, power: TAP_POWER_START });
});

test("Restart puts the readout back to the starting aim and pull", () => {
  const { game, lastAim } = mount();
  game.nudge({ angle: TAP_ANGLE, power: TAP_POWER });
  game.nudge({ power: TAP_POWER });
  expect(lastAim().power).toBeCloseTo(TAP_POWER_START + 2 * TAP_POWER);
  game.replay();
  expect(lastAim()).toMatchObject({ angle: ANGLE_START, power: TAP_POWER_START, drawing: false });
  // ...and the next tap starts from there.
  expect(game.nudge({ power: TAP_POWER }).power).toBeCloseTo(TAP_POWER_START + TAP_POWER);
});
