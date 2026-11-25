import { useId, useState } from "react";
import Icon from "./Icon";
import VideoPreview from "./VideoPreview";

// A card's media (see `media` in data.js): one big item at a time, with a heading, an "n of N" counter,
// previous/next arrows on the picture, a short caption (what it is: Preview, Trailer or Screenshot), and a
// row of small thumbnail buttons. Nothing advances on its own. The thumbnails are tiny WebPs; the big
// picture of the other items only loads when you pick them, and a video only loads when you press Play.
// (The heading is a labelled group, not an <h4>: on phones the picture sits above the card's <h3>.)

export default function MediaGallery({ items, title }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(false); // so the screen-reader note stays quiet until you use it
  const headingId = useId();
  const item = items[index];
  const video = item.video;
  const go = (i) => {
    setIndex((i + items.length) % items.length);
    setPicked(true);
  };
  const prev = items[(index - 1 + items.length) % items.length];
  const next = items[(index + 1) % items.length];

  return (
    <div role="group" aria-labelledby={headingId} className="mediaGallery">
      <div className="mediaHead">
        <p id={headingId} className="mediaHeading">
          Gameplay &amp; Trailer
        </p>
        <p className="mediaCount">
          {index + 1} of {items.length}
        </p>
      </div>

      <div className="mediaStage">
        {/* The key resets the player, so switching items stops a playing video. */}
        <VideoPreview
          key={item.image.src}
          video={video}
          image={item.image}
          title={title}
          itemLabel={item.label}
        />
        {/* The arrows hide while a video plays (CSS): switching items would stop it. Thumbnails still work. */}
        <button type="button" className="mediaArrow mediaArrow--prev" onClick={() => go(index - 1)}>
          <Icon name="chevronLeft" />
          <span className="visuallyHidden">Previous: {prev.label}</span>
        </button>
        <button type="button" className="mediaArrow mediaArrow--next" onClick={() => go(index + 1)}>
          <Icon name="chevronRight" />
          <span className="visuallyHidden">Next: {next.label}</span>
        </button>
      </div>

      <p className="mediaCaption">
        <span className="mediaKind">
          {item.kind}
          {item.time ? ` · ${item.time}` : ""}
        </span>{" "}
        {item.label}
      </p>

      <ul className="mediaThumbs" aria-label={`${title} media`}>
        {items.map((m, i) => (
          <li key={m.image.src}>
            <button
              type="button"
              className={`mediaThumb ${m.video ? "mediaThumb--video" : ""}`}
              aria-pressed={i === index}
              title={`${m.kind}: ${m.label}`}
              onClick={() => go(i)}
            >
              <img src={m.thumb} width={160} height={90} alt="" loading="lazy" decoding="async" />
              <span className="visuallyHidden">
                {m.kind}: {m.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="visuallyHidden" role="status">
        {picked ? `Showing ${item.kind}: ${item.label}, item ${index + 1} of ${items.length}` : ""}
      </p>
    </div>
  );
}
