import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { journey } from "../../data";
import Icon from "../Icon";
import CheckpointButton from "./CheckpointButton";
import JourneyMap from "./JourneyMap";
import StartMenu from "./StartMenu";
import StoryCard from "./StoryCard";

const total = journey.length;

// The game overlay is its own download, fetched only when someone asks for it.
const loadAdventure = () => import("./adventure/AdventureOverlay");
const AdventureOverlay = lazy(loadAdventure);

// My Story on the About page. It opens on a retro start screen with a choice (all three read the
// same `journey` array in data.js):
//   PLAY: the full-screen archery adventure (a native modal dialog, see adventure/).
//   READ: every story card in order, with a Back to Menu button.
//   Explore the Road Trip (a quiet link on the start screen, and inside the game): the original
//                  road trip. Pick a checkpoint (or Previous/Next) and the little car drives there;
//                  "Drive Yourself" lets you steer it with WASD / the arrow keys or on-screen buttons.
// If the p5.js map can't load, the road trip quietly becomes a plain row of checkpoint buttons.
export default function StoryJourney() {
  const [view, setView] = useState("menu"); // "menu" | "road" | "read"
  const [selected, setSelected] = useState(0); // kept when you switch modes
  const [visitedMax, setVisitedMax] = useState(0); // the farthest checkpoint reached so far
  const [driving, setDriving] = useState(false);
  const [adventure, setAdventure] = useState(false); // the full-screen archery game is open
  // The archery game's progress, kept here so it survives closing and reopening the game. Only the
  // game can change it: visiting Read or the road trip never unlocks anything, and the shared
  // `selected` checkpoint above is a separate thing.
  const [unlocked, setUnlocked] = useState(() => new Set());
  const [shots, setShots] = useState(0);
  const [mapFailed, setMapFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const moved = useRef(null); // set when the visitor changes view, so we can tidy up after the change

  // After a view change: put focus on the section heading (the old button is gone), without
  // scrolling; and if "Back to Menu" was pressed from far down the page, bring the menu into view.
  useEffect(() => {
    if (!moved.current) return;
    const { scrollBack } = moved.current;
    moved.current = null;
    titleRef.current?.focus({ preventScroll: true });
    const section = sectionRef.current;
    if (scrollBack && section && section.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [view]);

  const goTo = (next, scrollBack = false) => {
    setDriving(false);
    moved.current = { scrollBack };
    setView(next);
  };

  const onMapFail = (error) => {
    console.warn("My Story map couldn't start, so Play My Story is showing the simple version.", error);
    setDriving(false);
    setMapFailed(true);
  };

  const select = (index) => {
    if (index < 0 || index >= total || index === selected) return;
    setSelected(index);
    setVisitedMax((max) => Math.max(max, index));
    // Short status for screen readers (the card itself isn't a live region, so it isn't read twice).
    setAnnouncement(`Checkpoint ${index + 1} of ${total}: ${journey[index].title}`);
  };

  const turnDriving = (on) => {
    setDriving(on);
    setAnnouncement(on ? "Driving on. Use W A S D or the arrow keys. Escape exits." : "Driving off.");
  };

  const unlockChapter = (index) => setUnlocked((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));

  const restartAdventure = () => {
    setUnlocked(new Set());
    setShots(0);
  };

  const openAdventure = () => {
    setDriving(false);
    setAdventure(true);
  };

  const closeAdventure = () => {
    setAdventure(false);
    setAnnouncement(`Adventure closed. Back at checkpoint ${selected + 1} of ${total}: ${journey[selected].title}.`);
  };

  // From inside the game: close it and go to the story / the road trip.
  const leaveAdventureTo = (next) => {
    setAdventure(false);
    goTo(next);
  };

  const atStart = selected === 0;
  const atEnd = selected === total - 1;

  const backButton = (
    <button type="button" className="journeyBackBtn" onClick={() => goTo("menu", true)}>
      <Icon name="chevronLeft" />
      Back to Menu
    </button>
  );

  return (
    <section ref={sectionRef} className="journey" aria-labelledby="story-title">
      {view === "menu" ? (
        <StartMenu
          titleRef={titleRef}
          onPlay={openAdventure}
          onRead={() => goTo("read")}
          onRoadTrip={() => goTo("road")}
          onWarm={loadAdventure}
        />
      ) : (
        <>
          <div className="journeyHead">
            <h2 id="story-title" ref={titleRef} tabIndex={-1} className="retro-title aboutStoryTitle">
              My Story
            </h2>
            {backButton}
          </div>

          <p className="journeyIntro">
            {view === "road"
              ? "Follow the road from where it started to what I'm building now: pick a stop, or hit Next to keep driving."
              : "Prefer to skim? Here's the whole story, start to finish."}
          </p>
        </>
      )}

      {view === "road" && (
        <div className="journeyPlay">
          {mapFailed ? (
            <ol className="journeyStepper" aria-label="Story checkpoints">
              {journey.map((item, i) => (
                <li key={item.id}>
                  <CheckpointButton
                    item={item}
                    index={i}
                    state={i === selected ? "current" : i < selected ? "reached" : "upcoming"}
                    onSelect={select}
                    labelVisible={false}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <JourneyMap
              items={journey}
              selected={selected}
              visitedMax={visitedMax}
              driving={driving}
              onSelect={select}
              onReach={select}
              onExitDriving={() => turnDriving(false)}
              onFail={onMapFail}
            />
          )}

          <div className="journeyNav">
            <button
              type="button"
              className="journeyNavBtn journeyNavBtn--prev"
              aria-disabled={atStart}
              onClick={() => select(selected - 1)}
            >
              <Icon name="chevronLeft" />
              <span className="journeyNavLabel">Previous</span>
            </button>
            {!mapFailed && (
              <button
                type="button"
                className="journeyDriveBtn"
                aria-pressed={driving}
                aria-describedby="journey-drive-hint"
                onClick={() => turnDriving(!driving)}
              >
                Drive Yourself
              </button>
            )}
            <button
              type="button"
              className="journeyNavBtn journeyNavBtn--next"
              aria-disabled={atEnd}
              onClick={() => select(selected + 1)}
            >
              <span className="journeyNavLabel">Next</span>
              <Icon name="chevronRight" />
            </button>
          </div>

          {!mapFailed && (
            <p id="journey-drive-hint" className="journeyHint">
              {driving
                ? "WASD / Arrow Keys to Drive • Esc to Exit"
                : "Want to drive? Switch on Drive Yourself, then use WASD or the arrow keys."}
            </p>
          )}

          <StoryCard
            key={journey[selected].id}
            item={journey[selected]}
            index={selected}
            total={total}
            variant="play"
          />
        </div>
      )}

      {view === "read" && (
        <>
          <ol className="storyList">
            {journey.map((item, i) => (
              <li key={item.id}>
                <StoryCard item={item} index={i} total={total} variant="read" current={i === selected} />
              </li>
            ))}
          </ol>
          <div className="journeyBackRow">{backButton}</div>
        </>
      )}

      {adventure && (
        <Suspense fallback={null}>
          <AdventureOverlay
            items={journey}
            selected={selected}
            unlocked={unlocked}
            shots={shots}
            onSelect={select}
            onUnlock={unlockChapter}
            onShots={setShots}
            onRestart={restartAdventure}
            onClose={closeAdventure}
            onRead={() => leaveAdventureTo("read")}
            onRoadTrip={() => leaveAdventureTo("road")}
          />
        </Suspense>
      )}

      <p className="visuallyHidden" role="status">
        {announcement}
      </p>
    </section>
  );
}
