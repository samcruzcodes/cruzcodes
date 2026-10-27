import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Which slides (1-based) are fully on screen right now: [first, last].
function visibleRange(track) {
  const left = track.scrollLeft - 1;
  const right = track.scrollLeft + track.clientWidth + 1;
  const visible = [...track.children]
    .map((el, i) => (el.offsetLeft >= left && el.offsetLeft + el.offsetWidth <= right ? i + 1 : 0))
    .filter(Boolean);
  return visible.length ? [visible[0], visible[visible.length - 1]] : [1, 1];
}

// My scroll-snap carousel, based on the W3C APG carousel pattern (no autoplay!).
// Only the track scrolls. Previous/Next jump a whole page, and when the track
// has focus, arrow keys move one slide (Home/End jump to the ends).
export default function Carousel({
  id,
  title,
  titleClassName = "",
  description,
  itemName,
  items,
  itemKey,
  renderItem,
  className = "",
}) {
  const trackRef = useRef(null);
  const shouldAnnounce = useRef(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [status, setStatus] = useState("");
  const total = items.length;

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let settleTimer;

    // Only announce the new spot after a button/key move, once scrolling stops.
    const onScroll = () => {
      updateEdges();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        if (!shouldAnnounce.current) return;
        shouldAnnounce.current = false;
        const [first, last] = visibleRange(track);
        setStatus(`Showing ${itemName} ${first} to ${last} of ${total}`);
      }, 150);
    };

    const resizeObserver = new ResizeObserver(updateEdges);
    resizeObserver.observe(track);
    track.addEventListener("scroll", onScroll, { passive: true });
    updateEdges();

    return () => {
      clearTimeout(settleTimer);
      resizeObserver.disconnect();
      track.removeEventListener("scroll", onScroll);
    };
  }, [updateEdges, itemName, total]);

  const scrollToLeft = (left) => {
    shouldAnnounce.current = true;
    trackRef.current.scrollTo({ left, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  // Move by one slide, or by a whole page (however many slides fit).
  const move = (direction, byPage) => {
    const track = trackRef.current;
    const [a, b] = track.children;
    const step = b ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
    const count = byPage ? Math.max(1, Math.floor(track.clientWidth / step)) : 1;
    scrollToLeft(track.scrollLeft + direction * count * step);
  };

  const onKeyDown = (e) => {
    const track = trackRef.current;
    const actions = {
      ArrowLeft: () => move(-1, false),
      ArrowRight: () => move(1, false),
      Home: () => scrollToLeft(0),
      End: () => scrollToLeft(track.scrollWidth),
    };
    if (!actions[e.key]) return;
    e.preventDefault();
    actions[e.key]();
  };

  return (
    <section
      className={`carousel ${className}`}
      aria-roledescription="carousel"
      aria-labelledby={`${id}-title`}
    >
      <div className="carouselHead">
        <h2 id={`${id}-title`} className={`retro-title ${titleClassName}`}>
          {title}
        </h2>

        <div className="carouselControls">
          <button
            type="button"
            className="iconBtn"
            aria-label={`Previous ${itemName}`}
            aria-controls={`${id}-track`}
            aria-disabled={atStart}
            onClick={() => !atStart && move(-1, true)}
          >
            <Icon name="chevronLeft" />
          </button>
          <button
            type="button"
            className="iconBtn"
            aria-label={`Next ${itemName}`}
            aria-controls={`${id}-track`}
            aria-disabled={atEnd}
            onClick={() => !atEnd && move(1, true)}
          >
            <Icon name="chevronRight" />
          </button>
        </div>
      </div>

      {description && <p className="carouselDesc">{description}</p>}

      <div
        id={`${id}-track`}
        ref={trackRef}
        className="carouselTrack"
        role="group"
        aria-label={`${title} slides`}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {items.map((item, i) => (
          <div
            key={itemKey(item)}
            className="carouselSlide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}`}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>

      <p className="visuallyHidden" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
