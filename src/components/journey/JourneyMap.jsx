import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import CheckpointButton from "./CheckpointButton";
import DriveTouchPad from "./DriveTouchPad";
import { buildRoute, getLayout } from "./journeyRoute";
import { loadSketch } from "./loadSketch";

// Physical keys (so WASD works on any keyboard layout) -> the direction they mean.
const DRIVE_KEYS = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

const NO_INPUT = { up: false, down: false, left: false, right: false };

const checkpointState = (index, selected, visitedMax) =>
  index === selected ? "current" : index < selected || index <= visitedMax ? "reached" : "upcoming";

// The road trip map. React owns everything that matters (which stop is selected, the buttons, the
// labels). The p5.js canvas underneath is decoration that just draws the road and drives the car; it
// is created once, never recreated when you pick a stop.
//
// `driving` = "Drive Yourself" is on. Even then, keys only drive the car while the road itself has
// keyboard focus (the visitor chose to put it there): the handlers are on that one element, so
// nothing is captured anywhere else, Tab and Shift+Tab are never touched, and everything is let go
// the moment focus leaves.
//   rangeRef:        gets the focusable road element, so the page around can focus it ("Focus Driving Area")
//   onRangeActive:   told when the road gains / loses keyboard focus
//   describedBy:     id of the text that explains the keys
export default function JourneyMap({
  items,
  selected,
  visitedMax,
  driving,
  onSelect,
  onReach,
  onFail,
  rangeRef,
  onRangeActive,
  describedBy,
}) {
  const stageRef = useRef(null);
  const setStage = useCallback(
    (node) => {
      stageRef.current = node;
      if (rangeRef) rangeRef.current = node;
    },
    [rangeRef]
  );
  const canvasHostRef = useRef(null);
  const controllerRef = useRef(null);
  const [layout, setLayout] = useState(() => getLayout(1000));
  const [ready, setReady] = useState(false);
  const route = useMemo(() => buildRoute(layout), [layout]);

  // Latest values for effects below that only run once.
  const latest = useRef({ layout, selected, driving, onReach, onFail, onRangeActive });
  latest.current = { layout, selected, driving, onReach, onFail, onRangeActive };

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
          onReach: (index) => latest.current.onReach(index),
        });
        controller.setVisible(visible);
        controller.setDriving(latest.current.driving);
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

  useEffect(() => {
    controllerRef.current?.setDriving(driving);
  }, [driving, ready]);

  // Driving input: keyboard + touch buttons are merged into one set of held directions.
  const keysHeld = useRef({ ...NO_INPUT });
  const touchHeld = useRef({ ...NO_INPUT });

  const sendInput = () => {
    const keys = keysHeld.current;
    const touch = touchHeld.current;
    controllerRef.current?.setInput({
      up: keys.up || touch.up,
      down: keys.down || touch.down,
      left: keys.left || touch.left,
      right: keys.right || touch.right,
    });
  };

  const onTouchHold = (direction, held) => {
    if (touchHeld.current[direction] === held) return;
    touchHeld.current[direction] = held;
    sendInput();
  };

  const releaseAll = () => {
    Object.assign(keysHeld.current, NO_INPUT);
    Object.assign(touchHeld.current, NO_INPUT);
    sendInput();
  };

  // Switching driving off lets go of everything.
  useEffect(() => {
    if (!driving) releaseAll();
    // releaseAll only reads refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driving]);

  // Keys, only while the road itself has focus. (Key presses that started on a checkpoint button
  // bubble up here too; they are the button's business, not the car's.)
  const onKeyDown = (event) => {
    if (!driving || event.target !== event.currentTarget) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return; // browser shortcuts stay theirs
    const direction = DRIVE_KEYS[event.code];
    if (!direction) return;
    event.preventDefault(); // so the arrow keys steer instead of scrolling
    if (keysHeld.current[direction]) return; // key repeat
    keysHeld.current[direction] = true;
    sendInput();
  };

  const onKeyUp = (event) => {
    if (event.target !== event.currentTarget) return;
    const direction = DRIVE_KEYS[event.code];
    if (!direction || !keysHeld.current[direction]) return;
    keysHeld.current[direction] = false;
    sendInput();
  };

  const onFocus = (event) => {
    if (event.target === event.currentTarget) latest.current.onRangeActive?.(true);
  };

  const onBlur = (event) => {
    if (event.target !== event.currentTarget) return;
    releaseAll(); // focus left the road: the car coasts to a stop
    latest.current.onRangeActive?.(false);
  };

  // Clicking the stop you're already on is how you tell the car to come back to it (after a drive).
  const selectStop = (index) => {
    if (index === selected) controllerRef.current?.goToSelected();
    else onSelect(index);
  };

  const showLabels = layout.kind === "wide";

  return (
    <div className="journeyMap">
      <div
        ref={setStage}
        className={`journeyStage journeyStage--${layout.kind}${ready ? " is-ready" : ""}${driving ? " is-driving" : ""}`}
        style={{ aspectRatio: `${layout.cols} / ${layout.rows}` }}
        // Only focusable while driving is on: then it's the "driving area" you can Tab to.
        tabIndex={driving ? 0 : undefined}
        role={driving ? "group" : undefined}
        aria-label={driving ? "Road trip driving area" : undefined}
        aria-describedby={driving ? describedBy : undefined}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onFocus={onFocus}
        onBlur={onBlur}
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
                  state={checkpointState(i, selected, visitedMax)}
                  onSelect={selectStop}
                  labelVisible={showLabels}
                />
              </li>
            );
          })}
        </ol>
      </div>

      {driving && <DriveTouchPad onHold={onTouchHold} />}
    </div>
  );
}
