// Loads p5.js and the archery sketch only when the game overlay opens, so they stay out of the
// rest of the site (p5 is the same download the road map uses, so it's often already cached).
// Tests replace this file with a fake (jest.mock) because jsdom has no canvas.
export function loadArchery() {
  return Promise.all([import("p5"), import("./archerySketch")]).then(([p5Module, sketch]) => ({
    P5: p5Module.default || p5Module,
    mountArcherySketch: sketch.mountArcherySketch,
  }));
}
