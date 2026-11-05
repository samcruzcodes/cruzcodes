import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { journey } from "../../data";
import { scrollToElement } from "../../utils";
import Icon from "../Icon";
import StartMenu from "./StartMenu";
import StoryCard from "./StoryCard";

const total = journey.length;

// The game overlay is its own download, fetched only when someone asks for it.
const loadAdventure = () => import("./adventure/AdventureOverlay");
const AdventureOverlay = lazy(loadAdventure);

// ...and so is the full-screen road trip.
const loadRoadTrip = () => import("./RoadTripOverlay");
const RoadTripOverlay = lazy(loadRoadTrip);

const warmAll = () => {
  loadAdventure();
  loadRoadTrip();
};

// My Story on the About page. It opens on a retro start screen with a choice (all three read the
// same `journey` array in data.js):
//   PLAY: the full-screen archery adventure (a native modal dialog, see adventure/).
//   READ: every story card in order, with a Back to Menu button.
//   Explore the Road Trip (a quiet link on the start screen, and inside the game): the road trip,
//                  also a full-screen native dialog (see RoadTripOverlay). The pixel road sits beside
//                  the story of the stop you're on; pick a stop, use Previous/Next, or "Drive Yourself"
//                  (WASD / arrow keys / on-screen buttons) and the story follows. Nothing is locked.
// If the p5.js map can't load, the road trip quietly becomes a plain row of checkpoint buttons.
//
// Which stop is selected, and how far you've been, live here and are shared by both overlays and the
// Read view; the archery game's unlock progress is separate and only the game can change it.
export default function StoryJourney() {
  const [view, setView] = useState("menu"); // "menu" | "read"
  const [selected, setSelected] = useState(0); // kept when you switch modes
  const [visitedMax, setVisitedMax] = useState(0); // the farthest checkpoint reached so far
  const [adventure, setAdventure] = useState(false); // the full-screen archery game is open
  const [roadTrip, setRoadTrip] = useState(false); // the full-screen road trip is open
  // The archery game's progress, kept here so it survives closing and reopening the game. Only the
  // game can change it: visiting Read or the road trip never unlocks anything, and the shared
  // `selected` checkpoint above is a separate thing.
  const [unlocked, setUnlocked] = useState(() => new Set());
  const [shots, setShots] = useState(0);
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
      scrollToElement(section);
    }
  }, [view]);

  const goTo = (next, scrollBack = false) => {
    moved.current = { scrollBack };
    setView(next);
  };

  const select = (index) => {
    if (index < 0 || index >= total || index === selected) return;
    setSelected(index);
    setVisitedMax((max) => Math.max(max, index));
    // Short status for screen readers (the card itself isn't a live region, so it isn't read twice).
    setAnnouncement(`Checkpoint ${index + 1} of ${total}: ${journey[index].title}`);
  };

  const unlockChapter = (index) => setUnlocked((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));

  const restartAdventure = () => {
    setUnlocked(new Set());
    setShots(0);
  };

  const openAdventure = () => setAdventure(true);

  const closeAdventure = () => {
    setAdventure(false);
    setAnnouncement(`Adventure closed. Back at checkpoint ${selected + 1} of ${total}: ${journey[selected].title}.`);
  };

  // From inside the game: close it (never two modals at once), then go to the story / the road trip.
  const leaveAdventureTo = (next) => {
    setAdventure(false);
    if (next === "road") setRoadTrip(true);
    else goTo(next);
  };

  const openRoadTrip = () => setRoadTrip(true);

  const closeRoadTrip = () => {
    setRoadTrip(false);
    setAnnouncement(`Road trip closed. Back at checkpoint ${selected + 1} of ${total}: ${journey[selected].title}.`);
  };

  const readFromRoadTrip = () => {
    setRoadTrip(false);
    goTo("read");
  };

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
          onRoadTrip={openRoadTrip}
          onWarm={warmAll}
        />
      ) : (
        <>
          <div className="journeyHead">
            <h2 id="story-title" ref={titleRef} tabIndex={-1} className="retro-title aboutStoryTitle">
              My Story
            </h2>
            {backButton}
          </div>

          <p className="journeyIntro">Prefer to skim? Here's the whole story, start to finish.</p>
        </>
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

      {roadTrip && (
        <Suspense fallback={null}>
          <RoadTripOverlay
            items={journey}
            selected={selected}
            visitedMax={visitedMax}
            onSelect={select}
            onClose={closeRoadTrip}
            onRead={readFromRoadTrip}
          />
        </Suspense>
      )}

      <p className="visuallyHidden" role="status">
        {announcement}
      </p>
    </section>
  );
}
