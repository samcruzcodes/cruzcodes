import { useEffect, useId, useRef, useState } from "react";
import ExternalLink from "./ExternalLink";
import Icon from "./Icon";

// The big picture of one media item on a project card (MediaGallery.jsx picks which item). It's always
// a still image first:
//   - `video.sources`: a Play button over the image. Nothing downloads until it's pressed; then the clip
//     plays once (no loop) with the browser's own controls (pause, scrub, full screen), and a Close button
//     puts the still image back. Escape closes it too.
//   - `video.href`: for footage that can't be embedded. The same-looking overlay is a link out.
//   - no `video`: just the image.
// Nothing here plays on load, scroll, hover, or focus, so reduced-motion needs no special case.
// The frame is 16:9 the whole time, so the page doesn't jump.

export default function VideoPreview({ video, image, title, itemLabel, onImageError }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);
  const playRef = useRef(null);
  const wasPlaying = useRef(false);
  const descId = useId();

  // Keyboard users land on the video (so Space pauses it), then back on Play when they close it.
  useEffect(() => {
    if (playing) {
      wasPlaying.current = true;
      videoRef.current?.focus();
    } else if (wasPlaying.current) {
      wasPlaying.current = false;
      playRef.current?.focus();
    }
  }, [playing]);

  return (
    <figure
      className="projectVideo"
      onKeyDown={(e) => {
        if (playing && e.key === "Escape") setPlaying(false);
      }}
    >
      {playing ? (
        <>
          <video
            ref={videoRef}
            className="projectImg projectImg--video"
            width={image.width}
            height={image.height}
            poster={image.src}
            aria-label={`${title} ${itemLabel}`}
            aria-describedby={descId}
            controls
            autoPlay
            playsInline
            preload="auto"
            disablePictureInPicture
          >
            {video.sources.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </video>
          <button type="button" className="projectVideoClose" onClick={() => setPlaying(false)}>
            <Icon name="xmark" />
            <span className="visuallyHidden">Close {itemLabel.toLowerCase()} of {title}</span>
          </button>
        </>
      ) : (
        <>
          <img
            className="projectImg"
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            onError={onImageError}
          />
          {video?.sources && (
            <button
              type="button"
              ref={playRef}
              className="projectVideoPlay"
              onClick={() => setPlaying(true)}
            >
              <Icon name="play" />
              {video.label}
              <span className="visuallyHidden">
                {" "}
                of {title} ({video.length}, no sound)
              </span>
            </button>
          )}
          {video?.href && (
            <ExternalLink className="projectVideoPlay" href={video.href}>
              <Icon name="play" />
              {video.label}
            </ExternalLink>
          )}
        </>
      )}
      {video?.description && (
        <figcaption id={descId} className="visuallyHidden">
          {video.description}
        </figcaption>
      )}
    </figure>
  );
}
