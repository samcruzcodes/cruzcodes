import { useState } from "react";
import { journey } from "../../data";
import Icon from "../Icon";
import CheckpointButton from "./CheckpointButton";
import JourneyMap from "./JourneyMap";
import StoryCard from "./StoryCard";

const total = journey.length;

// My Story on the About page, two ways (both read the same `journey` array in data.js):
//   Play My Story: a road trip. Pick a checkpoint (or Previous/Next) and the little car drives
//                  there; the story card below follows.
//   Read My Story: every card in order, no canvas, nothing to click through.
// "Drive Yourself" (inside Play) lets you steer the car with WASD / the arrow keys (or on-screen
// buttons on a touch screen). It's off until you switch it on, and checkpoints you drive up to
// open their card just like clicking them does.
// If the p5.js map can't load, "Play" quietly becomes a plain row of checkpoint buttons.
export default function StoryJourney() {
  const [mode, setMode] = useState("play");
  const [selected, setSelected] = useState(0); // kept when you switch modes
  const [visitedMax, setVisitedMax] = useState(0); // the farthest checkpoint reached so far
  const [driving, setDriving] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");

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

  const chooseMode = (next) => {
    if (next !== "play") setDriving(false);
    setMode(next);
  };

  const atStart = selected === 0;
  const atEnd = selected === total - 1;

  return (
    <section className="journey" aria-labelledby="story-title">
      <div className="journeyHead">
        <h2 id="story-title" className="retro-title aboutStoryTitle">
          My Story
        </h2>

        <div className="journeyToggle" role="group" aria-label="How to explore my story">
          <button
            type="button"
            className="journeyToggleBtn"
            aria-pressed={mode === "play"}
            onClick={() => chooseMode("play")}
          >
            Play My Story
          </button>
          <button
            type="button"
            className="journeyToggleBtn"
            aria-pressed={mode === "read"}
            onClick={() => chooseMode("read")}
          >
            Read My Story
          </button>
        </div>
      </div>

      <p className="journeyIntro">
        {mode === "play"
          ? "Follow the road from where it started to what I'm building now: pick a stop, or hit Next to keep driving."
          : "Prefer to skim? Here's the whole story, start to finish."}
      </p>

      {mode === "play" ? (
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
      ) : (
        <ol className="storyList">
          {journey.map((item, i) => (
            <li key={item.id}>
              <StoryCard item={item} index={i} total={total} variant="read" current={i === selected} />
            </li>
          ))}
        </ol>
      )}

      <p className="visuallyHidden" role="status">
        {announcement}
      </p>
    </section>
  );
}
