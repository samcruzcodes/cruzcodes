// A plain left-click on a link that the page handles itself (to switch pages in place, like a
// single-page app). Ctrl/Cmd/Shift/Alt/middle clicks are left alone so "open in a new tab" still works.
export const isPlainClick = (event) =>
  !(event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
