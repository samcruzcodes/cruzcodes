import "@testing-library/jest-dom";
import { StrictMode } from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { journey } from "../../data";
import StoryJourney from "./StoryJourney";
import { loadArchery } from "./adventure/loadArchery";
import { loadSketch } from "./loadSketch";

// jsdom has no canvas, so both p5 loaders are replaced with fakes.
jest.mock("./loadSketch");
jest.mock("./adventure/loadArchery");

let controller;
let mount;
let game;

beforeEach(() => {
  controller = {
    setSelected: jest.fn(),
    setLayout: jest.fn(),
    setVisible: jest.fn(),
    setDriving: jest.fn(),
    setInput: jest.fn(),
    goToSelected: jest.fn(),
    destroy: jest.fn(),
  };
  mount = jest.fn(() => controller);
  loadSketch.mockResolvedValue({ P5: function P5() {}, mountJourneySketch: mount });
  game = {
    startAim: jest.fn(),
    aimPull: jest.fn(),
    release: jest.fn(),
    cancelAim: jest.fn(),
    setKeys: jest.fn(),
    keyDraw: jest.fn(),
    replay: jest.fn(),
    resize: jest.fn(),
    destroy: jest.fn(),
  };
  loadArchery.mockResolvedValue({ P5: function P5() {}, mountArcherySketch: jest.fn(() => game) });
  document.documentElement.style.overflow = "";
  document.body.style.paddingRight = "";
});

// jsdom has no real modal <dialog>. This stand-in behaves like a browser's where it matters here:
// showModal() opens it, and close() closes it and fires the `close` event *later* (a queued task).
const realShowModal = HTMLDialogElement.prototype.showModal;
const realClose = HTMLDialogElement.prototype.close;
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.open) return;
    this.removeAttribute("open");
    setTimeout(() => this.dispatchEvent(new Event("close")), 0);
  };
});
afterAll(() => {
  HTMLDialogElement.prototype.showModal = realShowModal;
  HTMLDialogElement.prototype.close = realClose;
});

const NAME = "My Story: Road Trip";
const exploreLink = () => screen.getByRole("button", { name: "Explore the Road Trip" });
const dialog = () => screen.getByRole("dialog", { name: NAME });
const road = () => within(dialog());
const checkpoint = (n) => road().getByRole("button", { name: new RegExp(`^Checkpoint ${n}:`) });
const current = () => road().getByRole("button", { current: "step" });
const exitButton = () => road().getByRole("button", { name: /exit/i });
const driveButton = () => road().getByRole("button", { name: "Drive Yourself" });
const stopButton = () => road().getByRole("button", { name: "Stop Driving" });
const area = () => road().getByRole("group", { name: "Road trip driving area" });
const panel = () => road().getByRole("region", { name: "Current milestone" });
const status = () => road().getByRole("status");
const lastInput = () => controller.setInput.mock.calls[controller.setInput.mock.calls.length - 1][0];
const NONE = { up: false, down: false, left: false, right: false };

async function openRoad() {
  fireEvent.click(exploreLink());
  await screen.findByRole("dialog", { name: NAME });
  await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
}

// The Escape key reaches a modal <dialog> as its `cancel` event.
const pressEscape = () => fireEvent(dialog(), new Event("cancel", { cancelable: true }));
const reach = (index) => act(() => mount.mock.calls[mount.mock.calls.length - 1][2].onReach(index));

describe("opening it", () => {
  test("Explore the Road Trip opens a modal dialog and focuses its title; nothing loads before that", async () => {
    render(<StoryJourney />);
    expect(loadSketch).not.toHaveBeenCalled();
    exploreLink().focus();
    await openRoad();
    expect(dialog()).toHaveAttribute("open");
    expect(road().getByRole("heading", { level: 2, name: NAME })).toHaveFocus();
  });

  test("it is a real dialog full of real buttons and links (no clickable divs)", async () => {
    render(<StoryJourney />);
    await openRoad();
    expect(dialog().tagName).toBe("DIALOG");
    expect(document.querySelectorAll('[role="button"]')).toHaveLength(0);
    expect(dialog().querySelectorAll("div[onclick]")).toHaveLength(0);
    dialog()
      .querySelectorAll("button")
      .forEach((button) => expect(button).toHaveAttribute("type", "button"));
    road()
      .getAllByRole("link")
      .forEach((a) => expect(a).toHaveAttribute("href"));
  });

  test("locks the page's scroll while open and gives it back after", async () => {
    render(<StoryJourney />);
    await openRoad();
    expect(document.documentElement.style.overflow).toBe("hidden");
    fireEvent.click(exitButton());
    expect(document.documentElement.style.overflow).toBe("");
  });

  test("opening and closing a lot never leaves a dialog or a map behind", async () => {
    render(<StoryJourney />);
    for (let i = 0; i < 4; i++) {
      fireEvent.click(exploreLink());
      await screen.findByRole("dialog", { name: NAME });
      await waitFor(() => expect(mount).toHaveBeenCalledTimes(i + 1));
      expect(screen.getAllByRole("dialog")).toHaveLength(1);
      fireEvent.click(exitButton());
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }
    expect(controller.destroy).toHaveBeenCalledTimes(4);
    expect(document.querySelector("canvas")).toBeNull();
  });

  test("the archery game's Road Trip button closes the game first, then opens this (one dialog at a time)", async () => {
    render(<StoryJourney />);
    fireEvent.click(screen.getByRole("button", { name: /^play/i }));
    const game = await screen.findByRole("dialog", { name: "My Story: Archery Adventure" });
    fireEvent.click(within(game).getByRole("button", { name: "Road Trip" }));
    expect(screen.queryByRole("dialog", { name: "My Story: Archery Adventure" })).not.toBeInTheDocument();
    await screen.findByRole("dialog", { name: NAME });
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });
});

describe("opening it in development (React StrictMode runs effects twice)", () => {
  // Regression: the first run's close() fires its `close` event after the dialog was reopened, and
  // that used to shut the road trip the moment it opened (only in `npm start`, never in a build).
  const strict = (ui) => render(<StrictMode>{ui}</StrictMode>);

  test("Explore the Road Trip opens the dialog and it stays open", async () => {
    strict(<StoryJourney />);
    await openRoad();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50)); // let any queued `close` event land
    });
    expect(dialog()).toHaveAttribute("open");
    expect(road().getByRole("heading", { level: 2, name: NAME })).toBeInTheDocument();
    expect(mount).toHaveBeenCalled();
  });

  test("the archery game's Road Trip button opens it and it stays open too", async () => {
    strict(<StoryJourney />);
    fireEvent.click(screen.getByRole("button", { name: /^play/i }));
    const game = await screen.findByRole("dialog", { name: "My Story: Archery Adventure" });
    fireEvent.click(within(game).getByRole("button", { name: "Road Trip" }));
    await screen.findByRole("dialog", { name: NAME });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(dialog()).toHaveAttribute("open");
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  test("Exit still closes it", async () => {
    strict(<StoryJourney />);
    await openRoad();
    fireEvent.click(exitButton());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("closing it", () => {
  test("Exit closes it, returns to the start screen and puts focus back where it was opened from", async () => {
    render(<StoryJourney />);
    exploreLink().focus();
    await openRoad();
    fireEvent.click(exitButton());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^play/i })).toBeInTheDocument();
    expect(exploreLink()).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(/Road trip closed/);
  });

  test("Escape (the dialog's cancel) closes it when you're not driving, and the map is cleaned up", async () => {
    render(<StoryJourney />);
    await openRoad();
    const notCancelled = pressEscape();
    expect(notCancelled).toBe(false); // handled by us, not by the browser
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(controller.destroy).toHaveBeenCalledTimes(1);
  });

  test("closing keeps the selected stop, and reopening shows it", async () => {
    render(<StoryJourney />);
    await openRoad();
    fireEvent.click(checkpoint(4));
    fireEvent.click(exitButton());
    fireEvent.click(exploreLink());
    await screen.findByRole("dialog", { name: NAME });
    expect(current()).toBe(checkpoint(4));
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(2));
    expect(mount.mock.calls[1][2].selected).toBe(3);
  });

  test("Read My Story is right there, and shows everything", async () => {
    render(<StoryJourney />);
    await openRoad();
    fireEvent.click(road().getByRole("button", { name: "Read My Story" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(journey.length);
  });

  test("if the browser closes the dialog itself, the page follows", async () => {
    render(<StoryJourney />);
    await openRoad();
    act(() => dialog().close()); // what the browser does; the `close` event follows a moment later
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("the milestone panel", () => {
  test("shows the chapter number, title, stage, image, text and project links of the selected stop", async () => {
    render(<StoryJourney />);
    await openRoad();
    fireEvent.click(checkpoint(2));
    const item = journey[1];
    const p = within(panel());
    expect(p.getByText("Now exploring")).toBeInTheDocument();
    expect(p.getByText(/Chapter 2 of 6/, { selector: ".storyCardStage" })).toBeInTheDocument();
    if (item.stage) expect(panel().querySelector(".storyCardStage")).toHaveTextContent(item.stage);
    expect(p.getByRole("heading", { level: 3 })).toHaveTextContent(item.title);
    expect(panel().querySelector(".storyCardText").textContent.length).toBeGreaterThan(20);
    if (item.image) expect(p.getByRole("img")).toHaveAttribute("alt", item.image.alt);
    expect(within(p.getByRole("list", { name: "Related projects" })).getAllByRole("link")).toHaveLength(item.links.length);
    expect(document.querySelector(".roadNowNum")).toHaveTextContent("2");
  });

  test("it updates the moment a stop is chosen (not when the car arrives), by click, Previous and Next", async () => {
    render(<StoryJourney />);
    await openRoad();
    fireEvent.click(checkpoint(5));
    expect(within(panel()).getByRole("heading", { level: 3 })).toHaveTextContent(journey[4].title);
    expect(controller.setSelected).toHaveBeenLastCalledWith(4);
    fireEvent.click(road().getByRole("button", { name: /^previous$/i }));
    expect(within(panel()).getByRole("heading", { level: 3 })).toHaveTextContent(journey[3].title);
    fireEvent.click(road().getByRole("button", { name: /^next$/i }));
    fireEvent.click(road().getByRole("button", { name: /^next$/i }));
    expect(within(panel()).getByRole("heading", { level: 3 })).toHaveTextContent(journey[5].title);
    expect(current()).toBe(checkpoint(6));
  });

  test("progress is shown in words and boxes, and never goes down", async () => {
    render(<StoryJourney />);
    await openRoad();
    expect(panel()).toHaveTextContent("Chapter 1 of 6 · Visited 1 of 6");
    fireEvent.click(checkpoint(4));
    expect(panel()).toHaveTextContent("Chapter 4 of 6 · Visited 4 of 6");
    fireEvent.click(checkpoint(2));
    expect(panel()).toHaveTextContent("Chapter 2 of 6 · Visited 4 of 6");
    expect(document.querySelectorAll(".roadPip.is-visited")).toHaveLength(4);
    expect(document.querySelectorAll(".roadPip.is-here")).toHaveLength(1);
  });

  test("the choice is announced once per change, inside the dialog (the page behind is inert)", async () => {
    render(<StoryJourney />);
    await openRoad();
    fireEvent.click(checkpoint(3));
    expect(status()).toHaveTextContent(`Chapter 3 of 6: ${journey[2].title}.`);
    fireEvent.click(checkpoint(3)); // same stop again: nothing new to say
    expect(status()).toHaveTextContent(`Chapter 3 of 6: ${journey[2].title}.`);
    // the page's own live region is untouched while the dialog is open
    expect(screen.getAllByRole("status")).toHaveLength(2);
  });

  test("nothing is locked: any stop, any order, including the last one first", async () => {
    render(<StoryJourney />);
    await openRoad();
    for (const n of [6, 3, 1, 5, 2, 4]) {
      fireEvent.click(checkpoint(n));
      expect(within(panel()).getByRole("heading", { level: 3 })).toHaveTextContent(journey[n - 1].title);
      expect(panel().querySelector(".storyCard--locked")).toBeNull();
    }
  });

  test("rapid switching always settles on the last choice with a single card", async () => {
    render(<StoryJourney />);
    await openRoad();
    [4, 1, 6, 2, 5, 3, 6, 1].forEach((n) => fireEvent.click(checkpoint(n)));
    expect(current()).toBe(checkpoint(1));
    expect(within(panel()).getAllByRole("heading", { level: 3 })).toHaveLength(1);
    expect(controller.setSelected).toHaveBeenLastCalledWith(0);
    expect(mount).toHaveBeenCalledTimes(1);
  });

  test("on a narrow screen the chapter can be opened and closed with a real button", async () => {
    render(<StoryJourney />);
    await openRoad();
    const toggle = road().getByRole("button", { name: "Open chapter" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "road-story-body");
    expect(panel()).toHaveAttribute("data-open", "false");
    fireEvent.click(toggle);
    expect(road().getByRole("button", { name: "Hide chapter" })).toHaveAttribute("aria-expanded", "true");
    expect(panel()).toHaveAttribute("data-open", "true");
  });

  test("the hint invites you to choose a stop or drive", async () => {
    render(<StoryJourney />);
    await openRoad();
    expect(road().getByText("Choose a stop or drive the road to explore my story.")).toBeInTheDocument();
  });

  test("clicking the stop you're already on sends the car back to it, without changing the story", async () => {
    render(<StoryJourney />);
    await openRoad();
    fireEvent.click(checkpoint(1));
    expect(controller.goToSelected).toHaveBeenCalledTimes(1);
    expect(controller.setSelected).not.toHaveBeenCalled();
  });
});

describe("Drive Yourself", () => {
  const keyListeners = (spy) => spy.mock.calls.filter(([type]) => /^key/.test(type)).length;
  let addSpy;
  let removeSpy;
  beforeEach(() => {
    addSpy = jest.spyOn(window, "addEventListener");
    removeSpy = jest.spyOn(window, "removeEventListener");
  });
  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  const turnOn = async () => {
    render(<StoryJourney />);
    await openRoad();
    fireEvent.click(driveButton());
  };

  test("is off at first: the road isn't a tab stop and ignores the keyboard", async () => {
    render(<StoryJourney />);
    await openRoad();
    expect(road().queryByRole("group", { name: "Road trip driving area" })).not.toBeInTheDocument();
    expect(document.querySelector(".journeyStage")).not.toHaveAttribute("tabindex");
    expect(controller.setDriving).toHaveBeenLastCalledWith(false);
    expect(fireEvent.keyDown(document.body, { code: "KeyW" })).toBe(true);
    expect(controller.setInput).not.toHaveBeenCalledWith(expect.objectContaining({ up: true }));
  });

  test("turning it on makes the road the focused driving area, says so, and tells the sketch", async () => {
    await turnOn();
    expect(area()).toHaveAttribute("tabindex", "0");
    expect(area()).toHaveFocus();
    expect(controller.setDriving).toHaveBeenLastCalledWith(true);
    expect(stopButton()).toBeInTheDocument();
    expect(road().getByText("KEYBOARD READY")).toBeInTheDocument();
    expect(status()).toHaveTextContent(/Driving on/);
    // its description says what the keys are
    expect(area()).toHaveAccessibleDescription(/W or Up Arrow to go.*Escape stops driving/);
  });

  test("W/Up forward, S/Down reverse, A/Left and D/Right steer; keys combine and release one at a time", async () => {
    await turnOn();
    fireEvent.keyDown(area(), { code: "KeyW" });
    expect(lastInput()).toMatchObject({ up: true, down: false });
    fireEvent.keyDown(area(), { code: "ArrowRight" });
    expect(lastInput()).toMatchObject({ up: true, right: true });
    fireEvent.keyDown(area(), { code: "KeyA" });
    expect(lastInput()).toMatchObject({ up: true, left: true, right: true });
    fireEvent.keyUp(area(), { code: "KeyW" });
    expect(lastInput()).toMatchObject({ up: false, left: true, right: true });
    fireEvent.keyDown(area(), { code: "ArrowDown" });
    expect(lastInput()).toMatchObject({ down: true });
    ["ArrowRight", "KeyA", "ArrowDown"].forEach((code) => fireEvent.keyUp(area(), { code }));
    expect(lastInput()).toEqual(NONE);
    fireEvent.keyDown(area(), { code: "ArrowUp" });
    fireEvent.keyDown(area(), { code: "KeyS" });
    fireEvent.keyDown(area(), { code: "ArrowLeft" });
    fireEvent.keyDown(area(), { code: "KeyD" });
    expect(lastInput()).toEqual({ up: true, down: true, left: true, right: true });
  });

  test("key repeat does nothing new", async () => {
    await turnOn();
    fireEvent.keyDown(area(), { code: "KeyW" });
    const calls = controller.setInput.mock.calls.length;
    fireEvent.keyDown(area(), { code: "KeyW", repeat: true });
    expect(controller.setInput.mock.calls.length).toBe(calls);
  });

  test("only the focused road takes the keys; Tab, Space, shortcuts and everything else stay the browser's", async () => {
    await turnOn();
    // keys anywhere else do nothing
    expect(fireEvent.keyDown(document.body, { code: "KeyW" })).toBe(true);
    expect(fireEvent.keyDown(checkpoint(2), { code: "KeyD" })).toBe(true);
    expect(controller.setInput).not.toHaveBeenCalledWith(expect.objectContaining({ up: true }));
    expect(controller.setInput).not.toHaveBeenCalledWith(expect.objectContaining({ right: true }));
    // on the road, only the driving keys are taken
    expect(fireEvent.keyDown(area(), { code: "ArrowDown" })).toBe(false); // steers instead of scrolling
    expect(fireEvent.keyDown(area(), { code: "Tab" })).toBe(true);
    expect(fireEvent.keyDown(area(), { code: "Tab", shiftKey: true })).toBe(true);
    expect(fireEvent.keyDown(area(), { code: "Space", key: " " })).toBe(true);
    expect(fireEvent.keyDown(area(), { code: "ArrowLeft", altKey: true })).toBe(true); // browser Back
    expect(fireEvent.keyDown(area(), { code: "KeyA", metaKey: true })).toBe(true); // select all
  });

  test("when the road loses focus, every held key is let go and KEYBOARD READY goes away", async () => {
    await turnOn();
    fireEvent.keyDown(area(), { code: "KeyW" });
    fireEvent.keyDown(area(), { code: "KeyD" });
    expect(road().getByText("KEYBOARD READY")).toBeInTheDocument();
    act(() => checkpoint(2).focus());
    expect(lastInput()).toEqual(NONE);
    expect(road().queryByText("KEYBOARD READY")).not.toBeInTheDocument();
    // the keys no longer do anything until the road is focused again...
    fireEvent.keyDown(checkpoint(2), { code: "KeyW" });
    expect(lastInput()).toEqual(NONE);
    // ...and the Focus Driving Area button puts it back
    fireEvent.click(road().getByRole("button", { name: "Focus Driving Area" }));
    expect(area()).toHaveFocus();
    expect(road().getByText("KEYBOARD READY")).toBeInTheDocument();
  });

  test("the overlay adds no global key listeners of its own", async () => {
    await turnOn();
    fireEvent.keyDown(area(), { code: "KeyW" });
    expect(keyListeners(addSpy)).toBe(0);
    fireEvent.click(exitButton());
    expect(keyListeners(removeSpy)).toBe(0);
  });

  test("Escape stops driving first (and keeps the road trip open); a second Escape closes it", async () => {
    await turnOn();
    expect(pressEscape()).toBe(false);
    expect(dialog()).toBeInTheDocument();
    expect(driveButton()).toBeInTheDocument();
    expect(controller.setDriving).toHaveBeenLastCalledWith(false);
    expect(lastInput()).toEqual(NONE);
    expect(status()).toHaveTextContent(/Driving stopped/);
    expect(driveButton()).toHaveFocus();
    pressEscape();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("Stop Driving is a real button: it stops, lets go of the keys and returns focus to Drive Yourself", async () => {
    await turnOn();
    fireEvent.keyDown(area(), { code: "KeyW" });
    fireEvent.click(stopButton());
    expect(controller.setDriving).toHaveBeenLastCalledWith(false);
    expect(lastInput()).toEqual(NONE);
    expect(road().queryByRole("group", { name: "Road trip driving area" })).not.toBeInTheDocument();
    expect(driveButton()).toHaveFocus();
  });

  test("Previous, Next and the stops keep working while driving", async () => {
    await turnOn();
    fireEvent.click(checkpoint(5));
    expect(current()).toBe(checkpoint(5));
    fireEvent.click(road().getByRole("button", { name: /^previous$/i }));
    expect(current()).toBe(checkpoint(4));
    expect(stopButton()).toBeInTheDocument();
  });

  test("touch buttons hold and release directions, combine with keys, and are released when driving ends", async () => {
    await turnOn();
    const pad = document.querySelector(".driveTouch");
    expect(pad).toHaveAttribute("aria-hidden", "true");
    const gas = road().getByRole("button", { name: "Go forward", hidden: true });
    const right = road().getByRole("button", { name: "Steer right", hidden: true });
    fireEvent.pointerDown(gas);
    fireEvent.pointerDown(right);
    expect(lastInput()).toMatchObject({ up: true, right: true });
    fireEvent.pointerUp(gas);
    expect(lastInput()).toMatchObject({ up: false, right: true });
    fireEvent.keyDown(area(), { code: "KeyA" });
    expect(lastInput()).toMatchObject({ left: true, right: true });
    fireEvent.click(stopButton());
    expect(lastInput()).toEqual(NONE);
    expect(document.querySelector(".driveTouch")).toBeNull();
  });

  test("closing while driving cleans everything up", async () => {
    await turnOn();
    fireEvent.keyDown(area(), { code: "KeyW" });
    fireEvent.click(exitButton());
    expect(controller.destroy).toHaveBeenCalledTimes(1);
    expect(keyListeners(removeSpy)).toBe(keyListeners(addSpy));
  });
});

describe("discovering a milestone by driving", () => {
  test("reaching a stop shows MILESTONE REACHED, updates the panel, marks it visited and announces it once", async () => {
    render(<StoryJourney />);
    await openRoad();
    fireEvent.click(driveButton());
    reach(2);
    expect(current()).toBe(checkpoint(3));
    expect(within(panel()).getByRole("heading", { level: 3 })).toHaveTextContent(journey[2].title);
    expect(document.querySelector(".roadBanner")).toHaveTextContent("Milestone reached!");
    expect(document.querySelector(".roadBanner")).toHaveTextContent(journey[2].title);
    expect(checkpoint(1)).toHaveTextContent("already visited");
    expect(checkpoint(2)).toHaveTextContent("already visited");
    expect(status()).toHaveTextContent(`Milestone reached! Chapter 3 of 6: ${journey[2].title}.`);
    // the banner is decoration; the words are in the live region
    expect(document.querySelector(".roadBanner")).toHaveAttribute("aria-hidden", "true");
  });

  test("the banner goes away by itself, and the driving carries on", async () => {
    jest.useFakeTimers();
    try {
      render(<StoryJourney />);
      fireEvent.click(exploreLink());
      await act(async () => {
        await Promise.resolve();
      });
      await screen.findByRole("dialog", { name: NAME });
      await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
      fireEvent.click(driveButton());
      reach(1);
      expect(document.querySelector(".roadBanner")).not.toBeNull();
      act(() => jest.advanceTimersByTime(3000));
      expect(document.querySelector(".roadBanner")).toBeNull();
      expect(stopButton()).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  test("driving past stops in order, or jumping around, never repeats or skips the update", async () => {
    render(<StoryJourney />);
    await openRoad();
    fireEvent.click(driveButton());
    [1, 2, 1, 5, 4].forEach((i) => reach(i));
    expect(current()).toBe(checkpoint(5));
    expect(within(panel()).getAllByRole("heading", { level: 3 })).toHaveLength(1);
    reach(3); // already on it: nothing happens twice
    const text = status().textContent;
    const banner = document.querySelector(".roadBanner");
    reach(3);
    expect(status().textContent).toBe(text);
    expect(document.querySelector(".roadBanner")).toBe(banner); // not shown again
  });

  test("it never touches the archery game's unlocked chapters", async () => {
    render(<StoryJourney />);
    await openRoad();
    fireEvent.click(driveButton());
    [1, 2, 3, 4, 5].forEach((i) => reach(i));
    fireEvent.click(exitButton());
    fireEvent.click(screen.getByRole("button", { name: /^play/i }));
    const archery = await screen.findByRole("dialog", { name: "My Story: Archery Adventure" });
    expect(within(archery).getAllByRole("button", { name: /locked$/ })).toHaveLength(6);
  });
});

describe("if the map can't load", () => {
  test("the stops are plain buttons, there's no driving, and the story still follows the choice", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    loadSketch.mockRejectedValue(new Error("offline"));
    render(<StoryJourney />);
    fireEvent.click(exploreLink());
    await screen.findByRole("dialog", { name: NAME });
    await waitFor(() => expect(document.querySelector(".journeyStepper")).not.toBeNull());
    expect(road().queryByRole("button", { name: /drive yourself/i })).not.toBeInTheDocument();
    fireEvent.click(checkpoint(4));
    expect(within(panel()).getByRole("heading", { level: 3 })).toHaveTextContent(journey[3].title);
    expect(current()).toBe(checkpoint(4));
    warn.mockRestore();
  });
});
