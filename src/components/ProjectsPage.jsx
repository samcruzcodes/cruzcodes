import { useState } from "react";
import Skills from "./Skills";
import ExternalLink from "./ExternalLink";
import { projects, projectTags } from "../data";

// Ongoing stuff first, then newest → oldest (details above `projects` in data.js).
const toTime = (d) => Date.parse(d) || 0;
const sortedProjects = [...projects].sort(
  (a, b) => Number(Boolean(b.ongoing)) - Number(Boolean(a.ongoing)) || toTime(b.date) - toTime(a.date)
);

const FILTERS = ["All", ...projectTags];

const SUBTITLES = {
  All: "Everything, sorted newest → oldest.",
  Game: "Edutainment + game dev builds.",
  Web: "Full-stack + product builds.",
  Mobile: "Apps built for the phone in your pocket.",
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
  const { title, role, description, image, dateLabel, stack, viewLink, githubLink } = project;
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
          {!hasLinks && <span className="projectNoLink">No public link</span>}
        </footer>
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");

  const visible =
    filter === "All" ? sortedProjects : sortedProjects.filter((p) => p.tag === filter);

  return (
    <section className="page panel panel-bevel projectsPage" aria-labelledby="projects-title">
      <div className="projectsTop">
        <div className="projectsTitleBlock">
          <h1 id="projects-title" className="retro-title projectsTitle" tabIndex={-1}>
            Projects
          </h1>
          <p className="projectsHint">A mix of web + games — creative developer at my core.</p>
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
    </section>
  );
}
