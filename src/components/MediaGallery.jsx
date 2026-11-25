import { useState } from "react";
import VideoPreview from "./VideoPreview";

// A card's media (see `media` in data.js): one big item at a time and a row of small thumbnail
// buttons to switch. Nothing advances on its own. The thumbnails are tiny WebPs; the big picture
// of the other items only loads when you pick them, and a video only loads when you press Play.

export default function MediaGallery({ items, title, onImageError }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(false); // so the screen-reader note stays quiet until you use it
  const item = items[index];
  const video = item.video || (item.link && { href: item.link.href, label: item.link.label });

  return (
    <>
      <div className="mediaStage">
        {/* The key resets the player, so switching items stops a playing video. */}
        <VideoPreview
          key={item.image.src}
          video={video}
          image={item.image}
          title={title}
          itemLabel={item.label}
          onImageError={onImageError}
        />
      </div>

      <ul className="mediaThumbs" aria-label={`${title} media`}>
        {items.map((m, i) => (
          <li key={m.image.src}>
            <button
              type="button"
              className={`mediaThumb ${m.video || m.link ? "mediaThumb--video" : ""}`}
              aria-pressed={i === index}
              title={m.label}
              onClick={() => {
                setIndex(i);
                setPicked(true);
              }}
            >
              <img src={m.thumb} width={160} height={90} alt="" loading="lazy" decoding="async" />
              <span className="visuallyHidden">{m.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="visuallyHidden" role="status">
        {picked ? `Showing ${item.label}, item ${index + 1} of ${items.length}` : ""}
      </p>
    </>
  );
}
