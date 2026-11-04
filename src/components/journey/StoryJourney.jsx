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
// If the p5.js map can't load, "Play" quietly becomes a plain row of checkpoint buttons.
export default function StoryJourney() {
  const [mode, setMode] = useState("play");
  const [selected, setSelected] = useState(0); // kept when you switch modes
  const [mapFailed, setMapFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const onMapFail = (error) => {
    console.warn("My Story map couldn't start, so Play My Story is showing the simple version.", error);
    setMapFailed(true);
  };

  const select = (index) => {
    if (index < 0 || index >= total || index === selected) return;
    setSelected(index);
    // Short status for screen readers (the card itself isn't a live region, so it isn't read twice).
    setAnnouncement(`Checkpoint ${index + 1} of ${total}: ${journey[index].title}`);
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
            onClick={() => setMode("play")}
          >
            Play My Story
          </button>
          <button
            type="button"
            className="journeyToggleBtn"
            aria-pressed={mode === "read"}
            onClick={() => setMode("read")}
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
            <JourneyMap items={journey} selected={selected} onSelect={select} onFail={onMapFail} />
          )}

          <div className="journeyNav">
            <button
              type="button"
              className="journeyNavBtn"
              aria-disabled={atStart}
              onClick={() => select(selected - 1)}
            >
              <Icon name="chevronLeft" />
              Previous
            </button>
            <p className="journeyCount">
              Checkpoint {selected + 1} of {total}
            </p>
            <button
              type="button"
              className="journeyNavBtn"
              aria-disabled={atEnd}
              onClick={() => select(selected + 1)}
            >
              Next
              <Icon name="chevronRight" />
            </button>
          </div>

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
