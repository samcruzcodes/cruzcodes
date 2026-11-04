import Icon from "./Icon";

// Stand-in for an image I don't have yet. It holds the exact space the real image
// will take, so swapping it in later doesn't shift the layout.
//
//   <ImagePlaceholder description="Screenshot of the PPAC provider search page" />
//   <ImagePlaceholder description="..." aspectRatio="4 / 3" width="12rem" />
//   <ImagePlaceholder description="..." height="15rem" />   // fixed height, like .projectMedia
//
// - aspectRatio: CSS aspect-ratio (default "16 / 9"). Ignored if you pass a height.
//   Pass null to leave it to your own CSS (e.g. .projectGallery).
// - width / height: any CSS length. Width defaults to 100% of its container.
//
// Every use needs a TODO comment with the intended filename + a row in IMAGE_REQUESTS.md.
export default function ImagePlaceholder({
  description,
  aspectRatio = "16 / 9",
  width,
  height,
  className = "",
}) {
  const style = { width, height, aspectRatio: height ? undefined : aspectRatio };

  return (
    <div className={`imagePlaceholder ${className}`} style={style}>
      <div className="imagePlaceholderInner">
        <Icon name="image" className="imagePlaceholderIcon" />
        <p className="imagePlaceholderText">Image coming soon: {description}</p>
      </div>
    </div>
  );
}
