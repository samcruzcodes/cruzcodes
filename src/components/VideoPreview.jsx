import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

// A short, muted, looping gameplay clip for a project card (see `video` in data.js).
//   - Nothing downloads until the card is near the screen, and it pauses when scrolled away.
//   - If the visitor prefers reduced motion, it stays a still image until they press Play.
//   - The Pause/Play button is always there (moving content that lasts over 5 seconds needs one, WCAG 2.2.2).
//   - The still image (`image`) shows first, and again if the clip can't load. The frame keeps its
//     16:9 shape the whole time, so the page doesn't jump.

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export default function VideoPreview({ video, image, title, onImageError }) {
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const [wantsPlay, setWantsPlay] = useState(() => !window.matchMedia(REDUCED_MOTION).matches);
  const [nearScreen, setNearScreen] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  // True once the clip has been shown, so a later Pause keeps it in place instead of swapping back.
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  // Follows the visitor turning reduced motion on while the page is open.
  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION);
    const onChange = (e) => e.matches && setWantsPlay(false);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // `nearScreen` (a bit early) starts loading; `onScreen` decides when it plays.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !("IntersectionObserver" in window)) return undefined;
    const early = new IntersectionObserver(([entry]) => entry.isIntersecting && setNearScreen(true), {
      rootMargin: "200px",
    });
    const visible = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    early.observe(frame);
    visible.observe(frame);
    return () => {
      early.disconnect();
      visible.disconnect();
    };
  }, []);

  useEffect(() => {
    if (wantsPlay && nearScreen) setStarted(true);
  }, [wantsPlay, nearScreen]);

  const showClip = started && !failed;
  const playing = showClip && wantsPlay && onScreen;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) el.play().catch(() => {}); // a blocked autoplay just leaves the still image
    else el.pause();
  }, [playing, showClip]);

  return (
    <div className="projectVideo" ref={frameRef}>
      {showClip ? (
        <video
          ref={videoRef}
          className="projectImg"
          width={video.width}
          height={video.height}
          poster={image.src}
          aria-label={image.alt}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
        >
          {/* A <video> doesn't report a failed <source>: the last one tells us nothing could play. */}
          {video.sources.map((s, i) => (
            <source
              key={s.src}
              src={s.src}
              type={s.type}
              onError={i === video.sources.length - 1 ? () => setFailed(true) : undefined}
            />
          ))}
        </video>
      ) : (
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
      )}

      <button type="button" className="projectVideoToggle" onClick={() => setWantsPlay((v) => !v)}>
        <Icon name={wantsPlay ? "pause" : "play"} />
        <span className="visuallyHidden">
          {wantsPlay ? "Pause" : "Play"} {title} gameplay preview
        </span>
      </button>
    </div>
  );
}
