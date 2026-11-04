import { useState } from "react";
import Skills from "./Skills";
import ExternalLink from "./ExternalLink";
import Icon from "./Icon";
import ImagePlaceholder from "./ImagePlaceholder";
import { projects, projectTags } from "../data";

// Ongoing stuff first, then newest → oldest (details above `projects` in data.js).
const toTime = (d) => Date.parse(d) || 0;
const sortedProjects = [...projects].sort(
  (a, b) => Number(Boolean(b.ongoing)) - Number(Boolean(a.ongoing)) || toTime(b.date) - toTime(a.date)
);

const FILTERS = ["All", ...projectTags];

// A project shows under its main `tag` and under any `alsoTags` (see data.js).
const matchesFilter = (p, filter) =>
  filter === "All" || p.tag === filter || Boolean(p.alsoTags?.includes(filter));

const SUBTITLES = {
  All: "Everything, sorted newest → oldest.",
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

function ProjectCard({ project, flipped }) {
  const {
    title,
    role,
    description,
    image,
    imagePlaceholder,
    galleryPlaceholders,
    status,
    dateLabel,
    stack,
    viewLink,
    githubLink,
  } = project;
  const hasLinks = Boolean(viewLink) || Boolean(githubLink);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className={`projectCard panel ${flipped ? "projectCard--flipped" : ""}`}>
      <div className="projectMedia">
        {image && !imageFailed ? (
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
          // The exact filename to add is in the TODO next to this project in data.js.
          <ImagePlaceholder description={imagePlaceholder} height="100%" />
        ) : (
          <div className="projectImg projectImg--fallback" aria-hidden="true">
            <span className="retro-title">{title}</span>
          </div>
        )}
      </div>

      <div className="projectBody">
        <header className="projectHeader">
          <h3 className="retro-title projectTitle">{title}</h3>
          {dateLabel && <p className="projectDate">{dateLabel}</p>}
        </header>

        {role && <p className="projectRole">{role}</p>}

        <p className="projectDesc">{description}</p>

        <Stack items={stack} />

        <footer className="projectActions">
          {viewLink && (
            <ExternalLink className="projectBtn" href={viewLink}>
              View<span className="visuallyHidden"> {title}</span>
            </ExternalLink>
          )}
          {githubLink && (
            <ExternalLink className="projectBtn" href={githubLink}>
              GitHub<span className="visuallyHidden"> repository for {title}</span>
            </ExternalLink>
          )}
          {!hasLinks && status && <span className="projectStatus">{status}</span>}
          {!hasLinks && !status && <span className="projectNoLink">No public link</span>}
        </footer>
      </div>

      {galleryPlaceholders?.length > 0 && (
        // Filenames for these are in the TODO next to this project in data.js.
        <ul className="projectGallery" aria-label={`${title} screenshots`}>
          {galleryPlaceholders.map((description) => (
            <li key={description}>
              <ImagePlaceholder description={description} aspectRatio={null} />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  // Stays as you left it when you change filters; the section hides itself if nothing matches.
  const [moreOpen, setMoreOpen] = useState(false);

  const visible = sortedProjects.filter((p) => !p.moreProjects && matchesFilter(p, filter));
  const visibleMore = sortedProjects.filter((p) => p.moreProjects && matchesFilter(p, filter));

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
            {filter === "All" ? "All Projects" : `${filter} Projects`}
          </h2>
          <p className="projectSectionSub">{SUBTITLES[filter]}</p>
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
              More Projects <span className="moreCount">({visibleMore.length})</span>
              <Icon name="chevronRight" className="moreChevron" />
            </button>
          </h2>

          {/* `hidden` takes the cards out of the tab order and the screen-reader tree. */}
          <div id="more-projects-list" hidden={!moreOpen}>
            <div className="projectList">
              {visibleMore.map((p, i) => (
                <ProjectCard key={p.title} project={p} flipped={(visible.length + i) % 2 === 1} />
              ))}
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
