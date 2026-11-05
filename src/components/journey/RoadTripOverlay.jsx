import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import CheckpointButton from "./CheckpointButton";
import JourneyMap from "./JourneyMap";
import StoryCard from "./StoryCard";
import useModalDialog from "./useModalDialog";

const pad = (n) => String(n).padStart(2, "0");

// How long the "MILESTONE REACHED!" banner stays up.
const BANNER_MS = 2400;

// The "Now exploring" bar: the chapter number, where you are, and your progress. It is shown twice,
// and CSS shows one at a time: on phones as a compact summary right under the road (so you see what
// you just picked or drove to without scrolling), and from tablets up as the header of the story
// panel. `children` are the extras each one adds (the title and View Story button, or Hide).
function NowExploring({ items, selected, visitedMax, className, children }) {
  const total = items.length;
  const visited = Math.max(visitedMax, selected) + 1;
  return (
    <div className={`roadNow ${className}`}>
      <span className="roadNowNum" key={selected} aria-hidden="true">
        {selected + 1}
      </span>
      <div className="roadNowText">
        <p className="roadNowLabel">Now exploring</p>
        <p className="roadProgress">
          Chapter {selected + 1} of {total} · Visited {visited} of {total}
        </p>
        {/* Six little squares: filled = visited, with a frame on the one you're at. */}
        <span className="roadPips" aria-hidden="true">
          {items.map((entry, i) => (
            <span
              key={entry.id}
              className={`roadPip${i <= Math.max(visitedMax, selected) ? " is-visited" : ""}${i === selected ? " is-here" : ""}`}
            />
          ))}
        </span>
      </div>
      {children}
    </div>
  );
}

// The road trip, full screen: the pixel-art road on one side and the story of the stop you're on on
// the other, so picking (or driving to) a stop and reading about it happen in the same view.
//
// Nothing here is locked: every stop can be read in any order, by clicking, with Previous / Next, or
// by driving there. Driving is optional.
//
// What's selected (and which stops have been visited) belongs to StoryJourney, so closing this and
// coming back, or reading the story, keeps your place. This only owns what's about the overlay itself:
// whether you're driving, whether the road has keyboard focus, and the messages it shows.
//
// It's a native <dialog> (see useModalDialog): focus stays inside it, the page behind is inert, and
// Esc closes it, except while you're driving, when Esc stops driving first.
export default function RoadTripOverlay({ items, selected, visitedMax, onSelect, onClose, onRead }) {
  const { dialogRef, titleRef } = useModalDialog();
  const rangeRef = useRef(null);
  const driveBtnRef = useRef(null);
  const bannerTimer = useRef(null);
  const focusRoadNext = useRef(false); // put keyboard focus on the road once driving switches on
  const focusDriveNext = useRef(false); // ...and back on the Drive button once it switches off

  const [driving, setDriving] = useState(false);
  const [rangeActive, setRangeActive] = useState(false); // the road has keyboard focus
  const [mapFailed, setMapFailed] = useState(false);
  const [reached, setReached] = useState(null); // { index, key }: the milestone you just drove up to
  const [storyOpen, setStoryOpen] = useState(false); // narrow screens: the full chapter is shown
  const storyRef = useRef(null);
  const viewBtnRef = useRef(null);
  const moveForStory = useRef(null); // "show": scroll to the story once it's open; "hide": back to the button
  const [status, setStatus] = useState("");

  const total = items.length;
  const item = items[selected];

  useEffect(() => () => clearTimeout(bannerTimer.current), []);

  // Move focus after driving switches on / off (the road only becomes focusable once it's on).
  useEffect(() => {
    if (driving && focusRoadNext.current) {
      focusRoadNext.current = false;
      rangeRef.current?.focus();
    } else if (!driving && focusDriveNext.current) {
      focusDriveNext.current = false;
      driveBtnRef.current?.focus();
    }
  }, [driving]);

  // View Story / Hide Story (narrow screens): only ever moves the page because you asked it to.
  useEffect(() => {
    const move = moveForStory.current;
    moveForStory.current = null;
    if (move === "show" && storyOpen) {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      storyRef.current?.scrollIntoView?.({ block: "start", behavior: reduce ? "auto" : "smooth" });
      const heading = storyRef.current?.querySelector("h3");
      heading?.setAttribute("tabindex", "-1"); // so it can take focus (it isn't a tab stop)
      heading?.focus({ preventScroll: true });
    } else if (move === "hide" && !storyOpen) {
      viewBtnRef.current?.focus();
    }
  }, [storyOpen]);

  const toggleStory = () => {
    moveForStory.current = storyOpen ? "hide" : "show";
    setStoryOpen(!storyOpen);
  };

  const startDriving = () => {
    focusRoadNext.current = true;
    setDriving(true);
    setStatus("Driving on. The road has keyboard focus: W or Up to go, S or Down to reverse, A and D to steer. Escape stops driving.");
  };

  const stopDriving = () => {
    focusDriveNext.current = true;
    setDriving(false);
    setRangeActive(false);
    setStatus("Driving stopped.");
  };

  // Picking a stop by any means (a checkpoint, Previous, Next): the story updates right away.
  const chooseStop = (index) => {
    if (index < 0 || index >= total || index === selected) return;
    onSelect(index);
    setStatus(`Chapter ${index + 1} of ${total}: ${items[index].title}.`);
  };

  // Driving up to a stop: forgiving (the road decides when you're close enough), no waiting.
  const reachStop = (index) => {
    if (index === selected) return;
    onSelect(index);
    setReached({ index, key: `${index}-${Date.now()}` });
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setReached(null), BANNER_MS);
    setStatus(`Milestone reached! Chapter ${index + 1} of ${total}: ${items[index].title}.`);
  };

  const onMapFail = (error) => {
    console.warn("The road trip map couldn't start; the stops are still available as buttons.", error);
    setDriving(false);
    setMapFailed(true);
  };

  const atStart = selected === 0;
  const atEnd = selected === total - 1;

  let hint;
  if (!driving) hint = "Want to drive? Choose Drive Yourself, then use W A S D or the arrow keys.";
  else if (!rangeActive) hint = "Driving is on. Use the on-screen buttons, or choose Focus Driving Area and use W A S D or the arrow keys.";
  else hint = null; // the ready message below

  return (
    <dialog
      ref={dialogRef}
      className="adventure roadTrip"
      aria-labelledby="road-title"
      // Esc while driving stops driving; otherwise it closes the road trip.
      onCancel={(event) => {
        event.preventDefault();
        if (driving) stopDriving();
        else onClose();
      }}
      // Chrome can close a dialog natively on a second Esc after a prevented one; keep React in step.
      // Only when it really is closed now: in development, StrictMode runs the open/close effect twice,
      // and the first close's event arrives after the dialog was already opened again.
      onClose={(event) => {
        if (!event.currentTarget.open) onClose();
      }}
    >
      <div className="adventureShell">
        <header className="adventureBar">
          <h2 id="road-title" ref={titleRef} tabIndex={-1} className="retro-title adventureTitle">
            <span className="roadTitleLead">My Story: </span>Road Trip
          </h2>
          <div className="adventureBarBtns">
            <button type="button" className="adventureBtn" onClick={onRead}>
              Read<span className="roadWide"> My Story</span>
            </button>
            <button type="button" className="adventureBtn adventureBtn--exit" onClick={onClose}>
              <Icon name="xmark" />
              Exit
            </button>
          </div>
        </header>

        <div className="roadBody">
          <section className="roadMapCol" aria-label="Road trip">
            <p className="roadHint">Choose a stop or drive the road to explore my story.</p>

            <div className="roadMapWrap">
              {/* Decorative: the milestone is also announced in words and shown in the story panel. */}
              {reached && (
                <div className="roadBanner" aria-hidden="true" key={reached.key}>
                  <strong>Milestone reached!</strong>
                  <span>
                    Chapter {pad(reached.index + 1)} — {items[reached.index].title}
                  </span>
                </div>
              )}

              {mapFailed ? (
                <ol className="journeyStepper" aria-label="Story checkpoints">
                  {items.map((entry, i) => (
                    <li key={entry.id}>
                      <CheckpointButton
                        item={entry}
                        index={i}
                        state={i === selected ? "current" : i < selected || i <= visitedMax ? "reached" : "upcoming"}
                        onSelect={chooseStop}
                        labelVisible={false}
                      />
                    </li>
                  ))}
                </ol>
              ) : (
                <JourneyMap
                  items={items}
                  selected={selected}
                  visitedMax={visitedMax}
                  driving={driving}
                  onSelect={chooseStop}
                  onReach={reachStop}
                  onFail={onMapFail}
                  rangeRef={rangeRef}
                  onRangeActive={setRangeActive}
                  describedBy="road-keys-desc"
                />
              )}
            </div>

            {/* Phones: what you're on, right under the road and its controls (see NowExploring). */}
            <NowExploring items={items} selected={selected} visitedMax={visitedMax} className="roadNow--summary">
              <p className="roadNowTitle">{item.title}</p>
              <button
                type="button"
                ref={viewBtnRef}
                className="roadStoryToggle adventureBtn"
                aria-expanded={storyOpen}
                aria-controls="road-story-body"
                onClick={toggleStory}
              >
                {storyOpen ? "Hide Story" : "View Story"}
              </button>
            </NowExploring>

            <div className="journeyNav">
              <button
                type="button"
                className="journeyNavBtn journeyNavBtn--prev"
                aria-disabled={atStart}
                onClick={() => chooseStop(selected - 1)}
              >
                <Icon name="chevronLeft" />
                <span className="journeyNavLabel">Previous</span>
              </button>
              {!mapFailed && (
                <button
                  type="button"
                  ref={driveBtnRef}
                  className={`journeyDriveBtn${driving ? " is-on" : ""}`}
                  onClick={driving ? stopDriving : startDriving}
                >
                  {driving ? "Stop Driving" : "Drive Yourself"}
                </button>
              )}
              <button
                type="button"
                className="journeyNavBtn journeyNavBtn--next"
                aria-disabled={atEnd}
                onClick={() => chooseStop(selected + 1)}
              >
                <span className="journeyNavLabel">Next</span>
                <Icon name="chevronRight" />
              </button>
            </div>

            {!mapFailed && (
              <div className="roadDriveRow">
                {driving && (
                  <button type="button" className="adventureBtn" onClick={() => rangeRef.current?.focus()}>
                    Focus Driving Area
                  </button>
                )}
                {rangeActive ? (
                  <p className="journeyHint journeyHint--ready">
                    <span className="roadHintLabel">KEYBOARD READY</span> — W/↑ Go · S/↓ Reverse · A/D Steer · Esc stops driving
                    · Tab leaves
                  </p>
                ) : (
                  <p className="journeyHint">{hint}</p>
                )}
                {/* What the keys do, for the road's accessible description. */}
                {driving && (
                  <span id="road-keys-desc" className="visuallyHidden">
                    W or Up Arrow to go, S or Down Arrow to reverse, A and D or Left and Right Arrow to steer. Escape stops
                    driving. Tab leaves the road.
                  </span>
                )}
              </div>
            )}
          </section>

          <section ref={storyRef} className="roadStory" aria-label="Current milestone" data-open={storyOpen}>
            <NowExploring items={items} selected={selected} visitedMax={visitedMax} className="roadNow--panel">
              {/* Phones only (the summary under the road opens it): a way back up. */}
              <button type="button" className="roadStoryHide adventureBtn" onClick={toggleStory}>
                Hide Story
              </button>
            </NowExploring>

            <div id="road-story-body" className="roadStoryBody">
              <StoryCard key={item.id} item={item} index={selected} total={total} variant="play" noun="Chapter" />
            </div>
          </section>
        </div>

        <p className="visuallyHidden" role="status">
          {status}
        </p>
      </div>
    </dialog>
  );
}
