import { useEffect, useRef } from "react";

// Keep these synced with .eyePupil's left/top in retro.css!
const EYE_CENTER_PCT = { x: 0.46, y: 0.315 };
const EYE_ELLIPSE_RADIUS_PCT = { rx: 0.05, ry: 0.012 };

export default function FollowEyeOnPNG() {
  const wrapRef = useRef(null);
  const pupilRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pupil = pupilRef.current;
    if (!wrap || !pupil) return;

    const clampToEllipse = (dx, dy, rx, ry) => {
      const v = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);

      // If already inside ellipse, keep it
      if (v <= 1) return { dx, dy };

      // Otherwise scale down to ellipse boundary
      const s = 1 / Math.sqrt(v);
      return { dx: dx * s, dy: dy * s };
    };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();

      const centerX = r.width * EYE_CENTER_PCT.x;
      const centerY = r.height * EYE_CENTER_PCT.y;

      const rx = r.width * EYE_ELLIPSE_RADIUS_PCT.rx;
      const ry = r.height * EYE_ELLIPSE_RADIUS_PCT.ry;

      // Cursor relative to wrapper
      const dx = e.clientX - r.left - centerX;
      const dy = e.clientY - r.top - centerY;

      const clamped = clampToEllipse(dx, dy, rx, ry);
      pupil.style.transform = `translate(${clamped.dx}px, ${clamped.dy}px)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <span ref={wrapRef} className="eyeWrap">
      {/* Decorative here: it's inside the h1, which already says my name. */}
      <img
        className="eyeFace"
        src="assets/sam-face.webp"
        width="600"
        height="794"
        alt=""
        draggable={false}
      />
      <span ref={pupilRef} className="eyePupil" />
    </span>
  );
}
