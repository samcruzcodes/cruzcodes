import ExternalLink from "../ExternalLink";
import ImagePlaceholder from "../ImagePlaceholder";
import RichText from "../RichText";

// One checkpoint's story. The same card is used for the selected stop in "Play My Story" and for
// every stop in "Read My Story", so both modes show exactly the same content.
export default function StoryCard({ item, index, total, variant, current = false }) {
  const headingId = `story-${item.id}-title`;

  return (
    <article
      className={`storyCard storyCard--${variant}${current ? " storyCard--current" : ""}`}
      aria-labelledby={headingId}
    >
      {(item.image || item.imagePlaceholder) && (
        <div className="storyCardMedia">
          {item.image ? (
            <img
              src={item.image.src}
              width={item.image.width}
              height={item.image.height}
              alt={item.image.alt}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <ImagePlaceholder description={item.imagePlaceholder} aspectRatio="3 / 2" />
          )}
        </div>
      )}

      <div className="storyCardBody">
        <p className="storyCardStage">
          Checkpoint {index + 1} of {total}
          {item.stage && <span className="storyCardDate"> · {item.stage}</span>}
        </p>
        <h3 id={headingId} className="retro-title storyCardTitle">
          {item.title}
        </h3>
        <p className="storyCardText">
          <RichText parts={item.text} />
        </p>

        {item.links?.length > 0 && (
          <ul className="storyCardLinks" aria-label="Related projects">
            {item.links.map((link) => (
              <li key={link.href}>
                <ExternalLink className="inlineLink" href={link.href}>
                  {link.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
