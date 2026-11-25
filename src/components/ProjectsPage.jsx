import { useEffect, useState } from "react";
import Skills from "./Skills";
import ExternalLink from "./ExternalLink";
import Icon from "./Icon";
import ImagePlaceholder from "./ImagePlaceholder";
import Lightbox from "./Lightbox";
import MediaGallery from "./MediaGallery";
import { findProjectById, projectId, projects, projectTags } from "../data";

// The order is hand-picked in data.js (`section` + `rank`), not by date. Filters keep it.
const inSection = (section) =>
  projects.filter((p) => p.section === section).sort((a, b) => a.rank - b.rank);
const selectedProjects = inSection("selected");
const moreProjects = inSection("more");

const FILTERS = ["All", ...projectTags];

// A project shows under its main `tag` and under any `alsoTags` (see data.js).
const matchesFilter = (p, filter) =>
  filter === "All" || p.tag === filter || Boolean(p.alsoTags?.includes(filter));

// Shown under "Selected Projects" when a filter is on.
const SUBTITLES = {
  Game: "Edutainment + game dev builds.",
  Web: "Full-stack + product builds.",
  Mobile: "Apps built for the phone in your pocket.",
  AI: "Projects with an AI angle.",
};

function Stack({ items }) {
  if (!items?.length) return null;

  return (
    <ul className="projectStack" aria-label="Tech stack">
      {items.map((t) => (
        <li key={t} className="projectChip">
          {t}
        </li>
      ))}
    </ul>
  );
}

// `compact` is the smaller card used in "More Projects".
function ProjectCard({ project, flipped, compact }) {
  const {
    title,
    role,
    description,
    image,
    imagePlaceholder,
    gallery,
    status,
    media,
    devlogLink,
    dateLabel,
    stack,
    viewLink,
    viewLabel,
    githubLink,
  } = project;
  const hasLinks = Boolean(viewLink) || Boolean(githubLink);
  const [imageFailed, setImageFailed] = useState(false);
  // Which screenshot is open in the big viewer (index into `gallery`), or null.
  const [enlarged, setEnlarged] = useState(null);

  return (
    <article
      id={projectId(title)}
      className={`projectCard panel ${flipped ? "projectCard--flipped" : ""} ${
        compact ? "projectCard--compact" : ""
      } ${media ? "projectCard--showcase" : ""}`}
    >
      <div className="projectMedia">
        {media ? (
          <MediaGallery items={media} title={title} />
        ) : image && !imageFailed ? (
          <img
            className="projectImg"
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : imagePlaceholder ? (
          // Fallback for a project with no screenshot yet (see data.js).
          <ImagePlaceholder description={imagePlaceholder} height="100%" />
        ) : (
          <div className="projectImg projectImg--fallback" aria-hidden="true">
            <span className="retro-title">{title}</span>
          </div>
        )}
      </div>

      <div className="projectBody">
        <header className="projectHeader">
          <h3 className="retro-title projectTitle" tabIndex={-1}>
            {title}
          </h3>
          {dateLabel && <p className="projectDate">{dateLabel}</p>}
        </header>

        {role && <p className="projectRole">{role}</p>}

        <p className="projectDesc">{description}</p>

        <Stack items={stack} />

        <footer className="projectActions">
          {viewLink && (
            <ExternalLink
              className={`projectBtn ${viewLabel ? "projectBtn--primary" : ""}`}
              href={viewLink}
            >
              {viewLabel || "View"}
              <span className="visuallyHidden"> {title}</span>
            </ExternalLink>
          )}
          {githubLink && (
            <ExternalLink className="projectBtn" href={githubLink}>
              GitHub<span className="visuallyHidden"> repository for {title}</span>
            </ExternalLink>
          )}
          {devlogLink && (
            <ExternalLink className="projectTextLink" href={devlogLink}>
              Read Devlog<span className="visuallyHidden"> for {title}</span>
            </ExternalLink>
          )}
          {!hasLinks && status && <span className="projectStatus">{status}</span>}
          {!hasLinks && !status && <span className="projectNoLink">No public link</span>}
        </footer>
      </div>

      {gallery?.length > 0 && (
        <>
          {/* Every screenshot is a button that opens it big. The alt says what clicking does,
              and the big view has the full description. */}
          <ul className="projectGallery" aria-label={`${title} screenshots`}>
            {gallery.map((photo, i) => (
              <li key={photo.src}>
                <button type="button" className="projectShot" onClick={() => setEnlarged(i)}>
                  <img
                    src={photo.src}
                    width={photo.width}
                    height={photo.height}
                    alt={`View larger: ${photo.label}`}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              </li>
            ))}
          </ul>
          <Lightbox
            photos={gallery}
            index={enlarged}
            onChange={setEnlarged}
            onClose={() => setEnlarged(null)}
          />
        </>
      )}
    </article>
  );
}

// `targetId` (from a Featured tile on Home, or a #project-… link) is a card to jump to.
export default function ProjectsPage({ targetId = null }) {
  const [filter, setFilter] = useState("All");
  const target = findProjectById(targetId);
  // Stays as you left it when you change filters; the section hides itself if nothing matches.
  // Starts open if the project I'm jumping to lives inside it.
  const [moreOpen, setMoreOpen] = useState(target?.section === "more");

  // Filter starts on "All" every time this page opens, so the target card is always on the page.
  useEffect(() => {
    const card = target && document.getElementById(projectId(target.title));
    if (!card) return;
    // "instant" so it doesn't glide past everything (and it's fine for reduced motion).
    // The card's scroll-margin-top keeps it clear of the sticky header.
    card.scrollIntoView({ block: "start", behavior: "instant" });
    card.querySelector("h3")?.focus({ preventScroll: true });
  }, [target]);

  const visible = selectedProjects.filter((p) => matchesFilter(p, filter));
  const visibleMore = moreProjects.filter((p) => matchesFilter(p, filter));

  return (
    <section className="page panel panel-bevel projectsPage" aria-labelledby="projects-title">
      <div className="projectsTop">
        <div className="projectsTitleBlock">
          <h1 id="projects-title" className="retro-title projectsTitle" tabIndex={-1}>
            Projects
          </h1>
          <p className="projectsHint">Web, mobile, games, and AI — mostly for learning and community.</p>
        </div>

        <div className="projectTabs" role="group" aria-label="Filter projects">
          {FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              className={`projectTab ${filter === t ? "projectTab--active" : ""}`}
              onClick={() => setFilter(t)}
              aria-pressed={filter === t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="panel portalFrame">
        <Skills />
      </div>

      <section className="projectSection" aria-labelledby="project-list-title">
        <div className="projectSectionHead">
          <h2 id="project-list-title" className="retro-title projectSectionTitle">
            Selected Projects
          </h2>
          {SUBTITLES[filter] && <p className="projectSectionSub">{SUBTITLES[filter]}</p>}
        </div>

        <div className="projectList">
          {visible.map((p, i) => (
            <ProjectCard key={p.title} project={p} flipped={i % 2 === 1} />
          ))}
        </div>
      </section>

      {visibleMore.length > 0 && (
        <section className="projectSection" aria-labelledby="more-projects-title">
          <h2 id="more-projects-title" className="retro-title projectSectionTitle">
            <button
              type="button"
              className="moreToggle"
              aria-expanded={moreOpen}
              aria-controls="more-projects-list"
              onClick={() => setMoreOpen((open) => !open)}
            >
              <span className="moreLabel">More Projects</span>{" "}
              <span className="moreMeta">
                <span className="moreCount">({visibleMore.length})</span>
                <Icon name="chevronRight" className="moreChevron" />
              </span>
            </button>
          </h2>

          {/* `hidden` takes the cards out of the tab order and the screen-reader tree. */}
          <div id="more-projects-list" hidden={!moreOpen}>
            <div className="projectList projectList--compact">
              {visibleMore.map((p) => (
                <ProjectCard key={p.title} project={p} flipped={false} compact />
              ))}
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
