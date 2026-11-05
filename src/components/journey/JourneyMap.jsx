import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

// Typing somewhere, or a dialog (the photo viewer) is open: don't steal keys.
const isTypingTarget = (target) =>
  target instanceof Element &&
  Boolean(target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])"));

const checkpointState = (index, selected, visitedMax) =>
  index === selected ? "current" : index < selected || index <= visitedMax ? "reached" : "upcoming";

// The "Play My Story" map. React owns everything that matters (which stop is selected, the
// buttons, the labels). The p5.js canvas underneath is decoration that just draws the road and
// drives the car; it is created once, never recreated when you pick a stop.
//
// `driving` = "Drive Yourself" is on. Only then does this listen for WASD / arrow keys (and only
// until driving is switched off), so it never grabs keys while you're browsing the site.
export default function JourneyMap({
  items,
  selected,
  visitedMax,
  driving,
  onSelect,
  onReach,
  onExitDriving,
  onFail,
}) {
  const stageRef = useRef(null);
  const canvasHostRef = useRef(null);
  const controllerRef = useRef(null);
  const [layout, setLayout] = useState(() => getLayout(1000));
  const [ready, setReady] = useState(false);
  const route = useMemo(() => buildRoute(layout), [layout]);

  // Latest values for effects below that only run once.
  const latest = useRef({ layout, selected, driving, onReach, onExitDriving, onFail });
  latest.current = { layout, selected, driving, onReach, onExitDriving, onFail };

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
          // Scrolled away: stop listening for driving keys.
          if (!visible && latest.current.driving) latest.current.onExitDriving();
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

  // The keyboard listeners exist ONLY while "Drive Yourself" is on, and are removed when it's off
  // (or the map goes away).
  useEffect(() => {
    if (!driving) return undefined;
    const section = stageRef.current.closest(".journey");
    const keys = keysHeld.current;
    const touch = touchHeld.current;

    const releaseAll = () => {
      Object.assign(keys, NO_INPUT);
      Object.assign(touch, NO_INPUT);
      sendInput();
    };

    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return; // browser shortcuts stay theirs
      if (isTypingTarget(event.target) || document.querySelector("dialog[open]")) return;
      if (event.code === "Escape" || event.key === "Escape") {
        latest.current.onExitDriving();
        return;
      }
      const direction = DRIVE_KEYS[event.code];
      if (!direction) return;
      event.preventDefault(); // so the arrow keys don't scroll the page while driving
      if (keys[direction]) return; // key repeat
      keys[direction] = true;
      sendInput();
    };

    const onKeyUp = (event) => {
      const direction = DRIVE_KEYS[event.code];
      if (!direction || !keys[direction]) return;
      keys[direction] = false;
      sendInput();
    };

    // Clicking or tabbing to anything outside My Story ends driving, so the keys go back to the page.
    const leaveIfOutside = (event) => {
      if (section && event.target instanceof Node && !section.contains(event.target)) {
        latest.current.onExitDriving();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);
    document.addEventListener("visibilitychange", releaseAll);
    document.addEventListener("pointerdown", leaveIfOutside, true);
    document.addEventListener("focusin", leaveIfOutside);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("visibilitychange", releaseAll);
      document.removeEventListener("pointerdown", leaveIfOutside, true);
      document.removeEventListener("focusin", leaveIfOutside);
      releaseAll();
    };
    // sendInput only reads refs, so it's safe to leave out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driving]);

  // Clicking the stop you're already on is how you tell the car to come back to it (after a drive).
  const selectStop = (index) => {
    if (index === selected) controllerRef.current?.goToSelected();
    else onSelect(index);
  };

  const showLabels = layout.kind === "wide";

  return (
    <div className="journeyMap">
      <div
        ref={stageRef}
        className={`journeyStage journeyStage--${layout.kind}${ready ? " is-ready" : ""}${driving ? " is-driving" : ""}`}
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
