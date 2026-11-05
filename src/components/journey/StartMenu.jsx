import { SCENE_H, SCENE_W, START_SCENE } from "./startScene";

// My Story's title screen: a PLAY / READ choice over a little pixel scene. PLAY opens the
// archery adventure; READ shows the whole story as cards. "Explore the Road Trip" is a quiet
// third way in, so the main choice stays PLAY or READ.
export default function StartMenu({ titleRef, onPlay, onRead, onRoadTrip, onWarm }) {
  return (
    <div className="startMenu">
      <div className="startMenuText">
        <h2 id="story-title" ref={titleRef} tabIndex={-1} className="retro-title startMenuTitle">
          My Story
        </h2>
        <p className="startMenuSub">Explore my journey: play through it, or read it start to finish.</p>

        <div className="startMenuBtns">
          <button type="button" className="startBtn startBtn--play" onClick={onPlay} onPointerEnter={onWarm} onFocus={onWarm}>
            <span className="startBtnLabel">Play</span>
            <span className="startBtnHint">archery adventure</span>
          </button>
          <button type="button" className="startBtn startBtn--read" onClick={onRead}>
            <span className="startBtnLabel">Read</span>
            <span className="startBtnHint">the whole story</span>
          </button>
        </div>

        <button type="button" className="startMenuLink" onClick={onRoadTrip} onPointerEnter={onWarm} onFocus={onWarm}>
          Explore the Road Trip
        </button>
      </div>

      {/* Decorative: the same archer, road and car as the games. */}
      <svg
        className="startMenuScene"
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        {START_SCENE.map((shape, i) =>
          shape.type === "path" ? (
            <path key={i} d={shape.d} fill={shape.fill} />
          ) : (
            <rect key={i} x={shape.x} y={shape.y} width={shape.w} height={shape.h} fill={shape.fill} className={shape.cls} />
          )
        )}
      </svg>
    </div>
  );
}
