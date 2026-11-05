import { useEffect, useRef } from "react";

// The lifecycle shared by the full-screen overlays (the archery game and the road trip), so it only
// lives in one place. Attach `dialogRef` to a native <dialog> and `titleRef` to its heading (with
// tabIndex={-1}). On mount it:
//   * opens the dialog as a modal (the browser then keeps focus inside it and makes the page behind it
//     inert), and locks the page behind it from scrolling,
//   * puts focus on the heading,
// and when the overlay goes away it gives everything back, including sending focus to whatever had it
// when the overlay opened (the button that opened it).
// Each overlay still decides what Esc does: it handles the dialog's `cancel` event itself.
//
// React StrictMode (development only) runs this effect as open -> close -> open on mount. The browser
// delivers a dialog's `close` event a moment *after* close() is called, so by then the dialog is open
// again. Any `onClose` handler on one of these dialogs must therefore check `dialog.open` before treating
// the event as "the visitor closed it" (RoadTripOverlay does; its StrictMode tests guard this). Production
// builds don't double-run effects, which is why the bug it once caused only showed up in `npm start`.
export default function useModalDialog() {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    const html = document.documentElement;
    const body = document.body;
    const before = { overflow: html.style.overflow, padding: body.style.paddingRight };
    const scrollbar = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    titleRef.current?.focus({ preventScroll: true });

    return () => {
      html.style.overflow = before.overflow;
      body.style.paddingRight = before.padding;
      if (typeof dialog.close === "function" && dialog.open) dialog.close();
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, []);

  return { dialogRef, titleRef };
}
