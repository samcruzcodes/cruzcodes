import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { clamp, pad2, scrollToElement } from "../../../utils";
import Icon from "../../Icon";
import StoryCard from "../StoryCard";
import useModalDialog from "../useModalDialog";
import { ROUNDS, roundOf } from "./archeryPhysics";
import { loadArchery } from "./loadArchery";

// "Angle 36° · Power 0%". It has its own state, so the aim updates the game sends many times a
// second re-render just this line, not the whole overlay (story card, chapter list and all).
const AimReadout = forwardRef(function AimReadout(_props, ref) {
  const [aim, setAim] = useState({ angle: 0.62, power: 0 });
  useImperativeHandle(ref, () => ({ update: setAim }), []);
  return (
    <p className="adventureReadout" aria-hidden="true">
      Angle {Math.round((aim.angle * 180) / Math.PI)}° · Power {Math.round(aim.power * 100)}%
    </p>
  );
});

// How long the "CHAPTER UNLOCKED!" banner stays up.
const BANNER_MS = 2400;

// The full-screen archery game. Each of the six targets unlocks one chapter of the story: until
// you hit a target, its chapter is a locked "???" (its title, picture, text and links are not on
// the page at all). Hit it and the real story card appears.
//
// What stays open no matter what: "Read My Story" (the whole story, one click away) and the road
// trip. Only this game hides chapters; nothing about the story needs the game.
//
// Which chapters are unlocked (and the shot count) live in StoryJourney, not here, so they survive
// closing and reopening the game, and nothing else on the page can change them.
//
// It's a native <dialog>, so the browser keeps keyboard focus inside it, makes the page behind
// it inert, and closes it on Esc. It fills the window without asking for browser fullscreen.
//
// Keyboard play: the range is an ordinary focusable region (Tab can reach it, or the "Play with
// Keyboard" button moves focus there). Only while it has focus do the arrow keys aim and Space /
// Enter draw and shoot; Tab and Shift+Tab are never touched, so there's no keyboard trap, and no
// key listener exists anywhere except on the range itself.
export default function AdventureOverlay({
  items,
  selected,
  unlocked,
  shots,
  onSelect,
  onUnlock,
  onShots,
  onRestart,
  onClose,
  onRead,
  onRoadTrip,
}) {
  const { dialogRef, titleRef } = useModalDialog(); // opens it as a modal, locks scrolling, restores focus
  const stageRef = useRef(null);
  const hostRef = useRef(null);
  const controllerRef = useRef(null);
  const pointerRef = useRef(null);
  const storyRef = useRef(null);
  const restartRef = useRef(null);
  const keepRef = useRef(null);
  const pointerFocus = useRef(false); // the range got focus from a mouse/touch press, not the keyboard
  const bannerTimer = useRef(null);

  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [round, setRound] = useState(1);
  const [viewed, setViewed] = useState(selected); // the chapter shown in the side panel
  const [fresh, setFresh] = useState(null); // the chapter that was just unlocked (for the banner)
  const [recent, setRecent] = useState(null); // the latest unlock, kept for the "read it" button on small screens
  const readoutRef = useRef(null);
  const [status, setStatus] = useState("");
  const [confirming, setConfirming] = useState(false); // "restart and lock everything again?"
  const [keyboardReady, setKeyboardReady] = useState(false); // the range has keyboard focus
  const [helpOpen, setHelpOpen] = useState(false);

  const total = items.length;
  const complete = unlocked.size >= total;

  // A synchronous record of what's unlocked, so two hits in the same instant can't unlock (or
  // announce) the same chapter twice.
  const unlockedRef = useRef(unlocked);
  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);

  // What the game just told us: update the page, and say it in words for screen readers.
  const handleEvent = (event) => {
    switch (event.type) {
      case "shot":
        onShots(event.shots);
        break;
      case "hit": {
        const chapter = event.checkpoint;
        if (unlockedRef.current.has(chapter)) break; // already unlocked: nothing new to reveal
        unlockedRef.current = new Set(unlockedRef.current).add(chapter);
        onUnlock(chapter);
        onSelect(chapter);
        setViewed(chapter);
        setFresh(chapter);
        setRecent(chapter);
        clearTimeout(bannerTimer.current);
        bannerTimer.current = setTimeout(() => setFresh(null), BANNER_MS);
        setStatus(
          `${event.bullseye ? "Bullseye! " : ""}Chapter unlocked: chapter ${chapter + 1} of ${total}, ${items[chapter].title}. Shot ${event.shots}.`
        );
        break;
      }
      case "miss":
        setStatus(`Miss. Shot ${event.shots}.`);
        break;
      case "round":
        setRound(event.round);
        if (event.round > 1) setStatus(`Round ${event.round} of ${ROUNDS}: two new targets.`);
        break;
      case "complete":
        setStatus(`All chapters unlocked! You've discovered my story, in ${event.shots} shots.`);
        break;
      case "replay":
        clearTimeout(bannerTimer.current);
        setFresh(null);
        setRecent(null);
        setRound(1);
        setStatus("Game restarted. All chapters are locked again. Round 1 of 3.");
        break;
      case "aim":
        readoutRef.current?.update({ angle: event.angle, power: event.power });
        break;
      default:
    }
  };
  const latest = useRef({ handleEvent, onClose, unlocked, shots });
  latest.current = { handleEvent, onClose, unlocked, shots };

  useEffect(() => () => clearTimeout(bannerTimer.current), []);

  // Load p5 + the sketch, start the game (picking up where the visitor left off), keep it sized
  // to its stage, and clean up on the way out.
  useEffect(() => {
    let cancelled = false;
    let controller = null;
    let observer = null;
    const stage = stageRef.current;
    const size = () => {
      const box = stage.getBoundingClientRect();
      return { width: box.width || 800, height: box.height || 480 };
    };

    (async () => {
      try {
        const { P5, mountArcherySketch } = await loadArchery();
        if (cancelled) return;
        controller = mountArcherySketch(P5, hostRef.current, {
          ...size(),
          // The chapters you've unlocked are the targets you've already hit (same numbering).
          hits: [...latest.current.unlocked],
          shots: latest.current.shots,
          onEvent: (event) => latest.current.handleEvent(event),
        });
        controllerRef.current = controller;
        setReady(true);
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => {
            const { width, height } = size();
            controller.resize(width, height);
          });
          observer.observe(stage);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("The archery game couldn't start; the story is still available.", error);
          setFailed(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      controller?.destroy();
      controllerRef.current = null;
    };
  }, []);

  // ---- Pointer: press, pull back, release (mouse, pen and touch all work the same way).
  const onPointerDown = (event) => {
    const controller = controllerRef.current;
    if (!controller || (event.pointerType === "mouse" && event.button !== 0)) return;
    pointerFocus.current = true; // focus is about to land here from the press, which isn't "keyboard ready"
    setKeyboardReady(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const width = event.currentTarget.getBoundingClientRect().width;
    pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, maxPull: clamp(width * 0.22, 90, 170) };
    controller.startAim();
  };

  const onPointerMove = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    controllerRef.current?.aimPull(event.clientX - pointer.x, event.clientY - pointer.y, pointer.maxPull);
  };

  const endPointer = (event, shoot) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    pointerRef.current = null;
    if (shoot) controllerRef.current?.release();
    else controllerRef.current?.cancelAim();
  };

  // ---- Keyboard (only while the range itself has focus): up/down aim, hold Space or Enter to draw,
  // release to shoot. Tab / Shift+Tab are never handled here, so they move focus as usual.
  const held = useRef({ up: false, down: false });
  const drawKeys = useRef(new Set()); // which of Space / Enter are currently held

  const releaseKeys = () => {
    held.current = { up: false, down: false };
    drawKeys.current.clear();
  };

  const onKeyDown = (event) => {
    const controller = controllerRef.current;
    if (!controller || event.ctrlKey || event.metaKey || event.altKey) return;
    if (["ArrowUp", "ArrowDown", "KeyW", "KeyS", "Space", "Enter"].includes(event.code)) setKeyboardReady(true);
    if (event.code === "ArrowUp" || event.code === "KeyW") held.current.up = true;
    else if (event.code === "ArrowDown" || event.code === "KeyS") held.current.down = true;
    else if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault(); // (so Space doesn't scroll and Enter doesn't click anything)
      if (event.repeat) return; // holding a key down sends repeats: they're not new presses
      if (drawKeys.current.size === 0) controller.keyDraw(true);
      drawKeys.current.add(event.code);
      return;
    } else return;
    event.preventDefault(); // so the arrow keys aim instead of scrolling
    controller.setKeys(held.current);
  };

  const onKeyUp = (event) => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (event.code === "ArrowUp" || event.code === "KeyW") held.current.up = false;
    else if (event.code === "ArrowDown" || event.code === "KeyS") held.current.down = false;
    else if (event.code === "Space" || event.code === "Enter") {
      // Only a key we saw go down counts (an Enter that "pressed" a button before focus moved here doesn't).
      if (!drawKeys.current.delete(event.code)) return;
      if (drawKeys.current.size === 0) controller.keyDraw(false); // the last key is up: shoot, once
      return;
    } else return;
    controller.setKeys(held.current);
  };

  // Focus left the range (Tab, a click elsewhere, the window lost focus): let go of everything, and
  // put the bow down without shooting.
  const onFocus = () => {
    if (!pointerFocus.current) setKeyboardReady(true);
  };

  const onBlur = () => {
    releaseKeys();
    controllerRef.current?.setKeys(held.current);
    controllerRef.current?.cancelAim();
    pointerFocus.current = false;
    setKeyboardReady(false);
  };

  // "Play with Keyboard": move focus to the range, so the keys work right away.
  const focusRange = () => {
    pointerFocus.current = false;
    stageRef.current?.focus();
    setKeyboardReady(true);
  };

  // ---- The chapter list: unlocked chapters open; locked ones just say they're locked.
  const pickChapter = (i) => {
    setViewed(i);
    if (unlocked.has(i)) {
      onSelect(i);
    } else {
      setStatus(`Chapter ${i + 1} is locked. Hit target ${i + 1} to unlock it.`);
    }
  };

  // ---- Starting over locks everything again, so say so, and ask first if there's progress to lose.
  const restart = () => {
    setConfirming(false);
    controllerRef.current?.replay();
    onRestart();
  };

  const askRestart = () => {
    if (unlocked.size === 0 || complete) restart();
    else setConfirming(true);
  };

  const wasConfirming = useRef(false);
  useEffect(() => {
    // Keep focus with the user as the confirmation appears and goes away.
    if (confirming) keepRef.current?.focus();
    else if (wasConfirming.current) restartRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  // On a narrow screen the story card is below the game; this takes you to it.
  const showStory = () => {
    scrollToElement(storyRef.current);
  };

  const viewedUnlocked = unlocked.has(viewed);
  // A locked chapter's target may not be out yet: its round hasn't started.
  const targetNotOut = roundOf(viewed) + 1 > round;

  return (
    <dialog
      ref={dialogRef}
      className="adventure"
      aria-labelledby="adventure-title"
      // Esc: close it ourselves (so the page goes back exactly as it was).
      onCancel={(event) => {
        event.preventDefault();
        latest.current.onClose();
      }}
    >
      <div className="adventureShell">
        <header className="adventureBar">
          <h2 id="adventure-title" ref={titleRef} tabIndex={-1} className="retro-title adventureTitle">
            My Story: Archery Adventure
          </h2>
          <div className="adventureBarBtns">
            <button type="button" className="adventureBtn" onClick={onRead}>
              Read My Story
            </button>
            {onRoadTrip && (
              <button type="button" className="adventureBtn" onClick={onRoadTrip}>
                Road Trip
              </button>
            )}
            <button type="button" className="adventureBtn adventureBtn--exit" onClick={onClose}>
              <Icon name="xmark" />
              Exit
            </button>
          </div>
        </header>

        <div className="adventureBody">
          <section className="adventureGame" aria-label="Archery range">
            {/* What to do (always visible, kept short) and how it's going. */}
            <div className="adventureTop">
              <p className="adventureGoal">
                <strong>Hit the targets. Unlock my story.</strong>
                <span>Each target reveals a new chapter.</span>
              </p>
              <p className="adventureHud">
                Round {Math.min(round, ROUNDS)} of {ROUNDS} · Chapters unlocked {unlocked.size} of {total} · Shots {shots}
              </p>
            </div>

            {recent !== null && unlocked.has(recent) && (
              <button type="button" className="adventureJump" onClick={showStory}>
                Chapter unlocked! Read “{items[recent].title}” ↓
              </button>
            )}

            {complete && (
              <p className="adventureDone">
                <strong>All chapters unlocked!</strong> You&apos;ve discovered my story. Every chapter stays open: pick any to
                read it again, or play again (that locks them again).
              </p>
            )}

            <div className="adventureStageWrap">
              {/* Decorative: the unlock is also announced in words (the status message below). */}
              {fresh !== null && (
                <div className="adventureBanner" aria-hidden="true" key={`${fresh}-${unlocked.size}`}>
                  <strong>Chapter unlocked!</strong>
                  <span>
                    Chapter {pad2(fresh + 1)} — {items[fresh].title}
                  </span>
                </div>
              )}

              {failed ? (
                <div className="adventureStage adventureStage--failed">
                  <p>
                    The game couldn&apos;t load. The chapters stay locked here, but the whole story is open: choose Read My
                    Story.
                  </p>
                </div>
              ) : (
                <div
                  ref={stageRef}
                  className={`adventureStage${ready ? " is-ready" : ""}${keyboardReady ? " is-active" : ""}`}
                  tabIndex={0}
                  role="group"
                  aria-label="Archery range"
                  aria-describedby="adventure-kbd-hint"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={(event) => endPointer(event, true)}
                  onPointerCancel={(event) => endPointer(event, false)}
                  onLostPointerCapture={(event) => endPointer(event, false)}
                  onFocus={onFocus}
                  onKeyDown={onKeyDown}
                  onKeyUp={onKeyUp}
                  onBlur={onBlur}
                >
                  {/* Decorative: the game's story is in the chapter list, card and messages. */}
                  <div ref={hostRef} className="adventureCanvas" aria-hidden="true" />
                </div>
              )}

              {/* On the range, so showing it never moves anything. (Screen readers get the range's description.) */}
              {keyboardReady && !failed && (
                <p className="adventureKbdReady" aria-hidden="true">
                  <span className="adventureHintLabel">KEYBOARD READY</span> — ↑↓ Aim · Hold Space to draw · Release to shoot
                  <span className="adventureHintMore"> · Tab or Shift+Tab to leave</span>
                </p>
              )}
            </div>

            {/* Controls: short hints on top; angle, power and the buttons together underneath. */}
            <div className="adventureDock">
              <div className="adventureHints">
                <p className="adventureHint">
                  <span className="adventureHintLabel">Mouse / Touch</span> Pull back and release to shoot
                </p>
                {!failed && (
                  <p className="adventureHint" id="adventure-kbd-hint">
                    <span className="adventureHintLabel">Keyboard</span> <span aria-hidden="true">↑↓</span>
                    <span className="visuallyHidden">Up and down arrows</span> Aim · Hold{" "}
                    <span className="adventureNoBreak">Space / Enter</span> · Release to shoot
                  </p>
                )}
              </div>

              <div className="adventureDockRow">
                <div className="adventureReadoutBlock">
                  <AimReadout ref={readoutRef} />
                  {unlocked.size > 0 && !confirming && (
                    <p className="adventureResetNote">Restarting locks every chapter again.</p>
                  )}
                </div>

                <div className="adventureDockBtns">
                  {!failed && (
                    <button type="button" className="adventureBtn" onClick={focusRange}>
                      Play with Keyboard
                    </button>
                  )}
                  <button
                    type="button"
                    className="adventureBtn"
                    aria-expanded={helpOpen}
                    aria-controls="adventure-howto"
                    onClick={() => setHelpOpen((open) => !open)}
                  >
                    How to play
                  </button>
                  {!confirming && (
                    <button
                      type="button"
                      ref={restartRef}
                      className={`adventureBtn${complete ? " adventureBtn--primary" : ""}`}
                      onClick={askRestart}
                    >
                      {complete ? "Play again" : "Restart"}
                    </button>
                  )}
                </div>
              </div>

              {confirming && (
                <div className="adventureConfirm" role="group" aria-label="Restart the game?">
                  <p>Restarting locks every chapter again.</p>
                  <button type="button" ref={keepRef} className="adventureBtn adventureBtn--primary" onClick={() => setConfirming(false)}>
                    Keep playing
                  </button>
                  <button type="button" className="adventureBtn" onClick={restart}>
                    Yes, restart
                  </button>
                </div>
              )}
            </div>

            {helpOpen && (
              <div id="adventure-howto" className="adventureHowTo">
                <ul>
                  <li>Press anywhere on the range, pull back, and let go. A longer pull is a stronger shot.</li>
                  <li>Hit a target to unlock its chapter. There are two targets per round, and three rounds.</li>
                  <li>Keyboard: choose Play with Keyboard (or Tab to the range), then ↑↓ to aim, hold Space or Enter to draw, release to shoot.</li>
                  <li>Tab and Shift+Tab always move on as usual. Esc closes the game.</li>
                  <li>Not in the mood to play? Read My Story is always open.</li>
                </ul>
              </div>
            )}
          </section>

          <div ref={storyRef} className="adventureSide">
            <ol className="adventurePicks" aria-label="Chapters">
              {items.map((entry, i) => {
                const open = unlocked.has(i);
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className={`adventurePick${i === viewed ? " is-current" : ""}${open ? " is-open" : " is-locked"}${fresh === i ? " is-new" : ""}`}
                      aria-current={i === viewed ? "step" : undefined}
                      aria-disabled={open ? undefined : "true"}
                      onClick={() => pickChapter(i)}
                    >
                      <span className="adventurePickNum" aria-hidden="true">
                        {i + 1}
                      </span>
                      {open ? (
                        <>
                          <span className="visuallyHidden">Chapter {i + 1}: </span>
                          <span className="adventurePickTitle">{entry.title}</span>
                          <span className="visuallyHidden"> (unlocked)</span>
                        </>
                      ) : (
                        <>
                          <span className="visuallyHidden">Chapter {i + 1}: locked</span>
                          <span className="adventurePickTitle" aria-hidden="true">
                            <Icon name="lock" className="adventureLockIcon" /> ???
                          </span>
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>

            {viewedUnlocked ? (
              <StoryCard key={items[viewed].id} item={items[viewed]} index={viewed} total={total} variant="play" noun="Chapter" />
            ) : (
              <article className="storyCard storyCard--locked" aria-labelledby="locked-chapter-title">
                <div className="lockedCardIcon" aria-hidden="true">
                  <Icon name="lock" />
                </div>
                <div className="storyCardBody">
                  <p className="storyCardStage">
                    Chapter {viewed + 1} of {total}
                  </p>
                  <h3 id="locked-chapter-title" className="retro-title storyCardTitle storyCardTitle--locked">
                    Chapter {pad2(viewed + 1)} — ???
                  </h3>
                  <p className="storyCardText">Locked. Hit the target to discover this story.</p>
                  {targetNotOut && (
                    <p className="lockedHint">Clear the earlier targets first, then target {viewed + 1} comes out.</p>
                  )}
                </div>
              </article>
            )}
          </div>
        </div>

        <p className="visuallyHidden" role="status">
          {status}
        </p>
      </div>
    </dialog>
  );
}
