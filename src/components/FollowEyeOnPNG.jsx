import { useEffect, useRef } from "react";

export default function FollowEyeOnPNG({
  src = "assets/sam-face.png",
  alt = "Sam",
  width = 300,

  eyeCenterPct = { x: 0.46, y: 0.315 },
  eyeEllipseRadiusPct = { rx: 0.05, ry: 0.012 },
  pupilSizePct = { w: 0.05, h: 0.04 },

  smoothingMs = 60,
}) {
  const wrapRef = useRef(null);
  const pupilRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pupil = pupilRef.current;
    if (!wrap || !pupil) return;

    const clampToEllipse = (dx, dy, rx, ry) => {
      // Safety: if ellipse is disabled, don't move
      if (rx <= 0 || ry <= 0) return { dx: 0, dy: 0 };

      const v = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);

      // If already inside ellipse, keep it
      if (v <= 1) return { dx, dy };

      // Otherwise scale down to ellipse boundary
      const s = 1 / Math.sqrt(v);
      return { dx: dx * s, dy: dy * s };
    };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();

      const centerX = r.width * eyeCenterPct.x;
      const centerY = r.height * eyeCenterPct.y;

      const rx = r.width * eyeEllipseRadiusPct.rx;
      const ry = r.height * eyeEllipseRadiusPct.ry;

      // ✅ Freeze mode: no movement at all
      if (rx <= 0 || ry <= 0) {
        pupil.style.transform = `translate(0px, 0px)`;
        return;
      }

      // Cursor relative to wrapper
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;

      const dx = mx - centerX;
      const dy = my - centerY;

      const clamped = clampToEllipse(dx, dy, rx, ry);
      pupil.style.transform = `translate(${clamped.dx}px, ${clamped.dy}px)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [eyeCenterPct, eyeEllipseRadiusPct]);

  return (
    <div
      ref={wrapRef}
      style={{
        width,
        position: "relative",
        display: "inline-block",
        userSelect: "none",
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{ width: "100%", height: "auto", display: "block" }}
      />

      <div
        ref={pupilRef}
        style={{
          position: "absolute",
          left: `${eyeCenterPct.x * 100}%`,
          top: `${eyeCenterPct.y * 100}%`,

          width: `${pupilSizePct.w * 100}%`,
          height: `${pupilSizePct.h * 100}%`,
          marginLeft: `-${(pupilSizePct.w * 100) / 2}%`,
          marginTop: `-${(pupilSizePct.h * 100) / 2}%`,

          borderRadius: "999px",
          background: "rgba(0,0,0,0.85)",
          boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15)",

          pointerEvents: "none",
          transform: "translate(0px, 0px)",
          transition: `transform ${smoothingMs}ms linear`,
        }}
      />
    </div>
  );
}