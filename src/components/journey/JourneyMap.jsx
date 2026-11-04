import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import CheckpointButton from "./CheckpointButton";
import { buildRoute, getLayout } from "./journeyRoute";
import { loadSketch } from "./loadSketch";

const checkpointState = (index, selected) =>
  index === selected ? "current" : index < selected ? "reached" : "upcoming";

// The "Play My Story" map. React owns everything that matters (which stop is selected, the
// buttons, the labels). The p5.js canvas underneath is decoration that just draws the road and
// drives the car; it is created once, never recreated when you pick a stop.
export default function JourneyMap({ items, selected, onSelect, onFail }) {
  const stageRef = useRef(null);
  const canvasHostRef = useRef(null);
  const controllerRef = useRef(null);
  const [layout, setLayout] = useState(() => getLayout(1000));
  const [ready, setReady] = useState(false);
  const route = useMemo(() => buildRoute(layout), [layout]);

  // Latest values for the p5 effect below, which only runs once.
  const latest = useRef({ layout, selected, onFail });
  latest.current = { layout, selected, onFail };

  // Size the map to its container (before the first paint, so nothing jumps) and keep it in sync.
  useLayoutEffect(() => {
    // Measure the space around the map (not the map itself, which the tall road caps).
    const space = stageRef.current.parentElement;
    const update = () => {
      const next = getLayout(space.getBoundingClientRect().width);
      setLayout((prev) => (prev.key === next.key ? prev : next));
    };
    update();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(space);
    return () => observer.disconnect();
  }, []);

  // Load p5 once the map is near the screen, start the sketch, and clean up everything on unmount.
  useEffect(() => {
    let cancelled = false;
    let started = false;
    let controller = null;
    let observer = null;
    let visible = true;

    const start = async () => {
      if (started) return;
      started = true;
      try {
        const { P5, mountJourneySketch } = await loadSketch();
        if (cancelled) return;
        controller = mountJourneySketch(P5, canvasHostRef.current, {
          layout: latest.current.layout,
          selected: latest.current.selected,
        });
        controller.setVisible(visible);
        controllerRef.current = controller;
        setReady(true);
      } catch (error) {
        if (!cancelled) latest.current.onFail(error);
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      start();
    } else {
      // Also tells the sketch to stop drawing while the map is scrolled out of view.
      observer = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) start();
          controller?.setVisible(visible);
        },
        { rootMargin: "200px" }
      );
      observer.observe(stageRef.current);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      controller?.destroy();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.setSelected(selected);
  }, [selected]);

  useEffect(() => {
    controllerRef.current?.setLayout(layout);
  }, [layout]);

  const showLabels = layout.kind === "wide";

  return (
    <div
      ref={stageRef}
      className={`journeyStage journeyStage--${layout.kind}${ready ? " is-ready" : ""}`}
      style={{ aspectRatio: `${layout.cols} / ${layout.rows}` }}
    >
      {/* Decorative: everything it shows is also in the buttons and cards. */}
      <div ref={canvasHostRef} className="journeyCanvas" aria-hidden="true" />

      <ol className="journeyPins" aria-label="Story checkpoints">
        {items.map((item, i) => {
          const cp = route.cps[i];
          return (
            <li
              key={item.id}
              className={`journeyPin journeyPin--${cp.side}`}
              style={{
                left: `${(cp.pinX / layout.cols) * 100}%`,
                top: `${(cp.pinY / layout.rows) * 100}%`,
              }}
            >
              <CheckpointButton
                item={item}
                index={i}
                state={checkpointState(i, selected)}
                onSelect={onSelect}
                labelVisible={showLabels}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
