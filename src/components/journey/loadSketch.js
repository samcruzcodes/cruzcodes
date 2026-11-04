// Loads p5.js and the sketch only when the map asks for them, so they become their own
// downloads (webpack chunks) instead of weighing down the rest of the site.
// Tests replace this file with a fake (jest.mock) because jsdom has no canvas.
export function loadSketch() {
  return Promise.all([import("p5"), import("./journeySketch")]).then(([p5Module, sketch]) => ({
    P5: p5Module.default || p5Module,
    mountJourneySketch: sketch.mountJourneySketch,
  }));
}
