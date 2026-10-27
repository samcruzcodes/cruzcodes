import { useEffect, useRef } from "react";
import Icon from "./Icon";

// Click a gallery photo to see it big! Built on the native <dialog>, so it keeps
// focus inside, closes on Esc, and sends focus back to the photo you clicked.
// Arrow keys (or the buttons) flip through the photos and loop around.
export default function Lightbox({ photos, index, onChange, onClose }) {
  const dialogRef = useRef(null);
  const isOpen = index !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const close = () => dialogRef.current.close();
  const step = (direction) => onChange((index + direction + photos.length) % photos.length);

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  };

  const photo = isOpen ? photos[index] : null;

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-labelledby="lightbox-title"
      onClose={onClose}
      onKeyDown={onKeyDown}
      // Clicking the dark backdrop counts as clicking the <dialog>, so that closes it.
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      {photo && (
        <>
          <div className="lightboxTop">
            <h2 id="lightbox-title" className="retro-title lightboxTitle">
              {photo.label}
            </h2>
            <button
              type="button"
              className="iconBtn"
              aria-label="Close enlarged photo"
              onClick={close}
            >
              <Icon name="xmark" />
            </button>
          </div>

          <img
            className="lightboxImg"
            src={photo.large.src}
            width={photo.large.width}
            height={photo.large.height}
            alt={photo.alt}
          />

          <div className="lightboxBar">
            <button
              type="button"
              className="iconBtn"
              aria-label="Previous photo"
              onClick={() => step(-1)}
            >
              <Icon name="chevronLeft" />
            </button>
            <p className="lightboxCount" aria-hidden="true">
              {index + 1} / {photos.length}
            </p>
            <button type="button" className="iconBtn" aria-label="Next photo" onClick={() => step(1)}>
              <Icon name="chevronRight" />
            </button>
          </div>

          <p className="visuallyHidden" aria-live="polite">
            {photo.label}, photo {index + 1} of {photos.length}
          </p>
        </>
      )}
    </dialog>
  );
}
