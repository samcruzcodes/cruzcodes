import React, { useMemo, useState } from "react";
import Skills from "./Skills";
import { gameProjects, webProjects } from "../data";

const toTime = (d) => (d ? Date.parse(String(d).replace(/\./g, "")) || 0 : 0);
const byNewest = (a, b) => toTime(b.date) - toTime(a.date);

function Stack({ items }) {
  if (!items?.length) return null;

  return (
    <div className="projectStack" aria-label="Tech stack">
      {items.map((t) => (
        <span key={t} className="projectChip">
          {t}
        </span>
      ))}
    </div>
  );
}

function LinkBtn({ href, children }) {
  if (!href) return null;

  return (
    <a className="projectBtn" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function ProjectCard({ project, flipped }) {
  const { title, description, imageUrl, dateLabel, stack, viewLink, githubLink } = project;
  const hasLinks = Boolean(viewLink) || Boolean(githubLink);

  return (
    <article className={`projectCard panel ${flipped ? "projectCard--flipped" : ""}`}>
      <div className="projectMedia" aria-hidden={!imageUrl}>
        {imageUrl ? (
          <img
            className="projectImg"
            src={imageUrl}
            alt={`Screenshot of ${title}`}
            loading="lazy"
          />
        ) : (
          <div className="projectImg projectImg--fallback" />
        )}
      </div>

      <div className="projectBody">
        <header className="projectHeader">
          <h3 className="retro-title projectTitle">{title}</h3>
          {dateLabel && <div className="projectDate">{dateLabel}</div>}
        </header>

        <p className="projectDesc">{description}</p>

        <Stack items={stack} />

        <footer className="projectActions">
          <LinkBtn href={viewLink}>View</LinkBtn>
          <LinkBtn href={githubLink}>GitHub</LinkBtn>
          {!hasLinks && <span className="projectNoLink">No public link</span>}
        </footer>
      </div>
    </article>
  );
}

function ProjectSection({ title, subtitle, projects }) {
  if (!projects?.length) return null;

  return (
    <div className="projectSection">
      <div className="projectSectionHead">
        <h2 className="retro-title projectSectionTitle">{title}</h2>
        {subtitle && <div className="projectSectionSub">{subtitle}</div>}
      </div>

      <div className="projectList">
        {projects.map((p, i) => (
          <ProjectCard key={`${p.title}-${p.date ?? i}`} project={p} flipped={i % 2 === 1} />
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");

  const sortedGameProjects = useMemo(
    () => [...gameProjects].sort(byNewest),
    []
  );

  const sortedWebProjects = useMemo(
    () => [...webProjects].sort(byNewest),
    []
  );

  const allProjects = useMemo(() => {
    const taggedGames = sortedGameProjects.map((p) => ({ ...p, kind: "Game" }));
    const taggedWeb = sortedWebProjects.map((p) => ({ ...p, kind: "Web" }));
    return [...taggedGames, ...taggedWeb].sort(byNewest);
  }, [sortedGameProjects, sortedWebProjects]);

  const visible = useMemo(() => {
    if (filter === "All") return allProjects;
    return allProjects.filter((p) => p.kind === filter);
  }, [allProjects, filter]);

  const sectionTitle =
    filter === "All" ? "All Projects" : filter === "Game" ? "Game Projects" : "Web Projects";

  const sectionSubtitle =
    filter === "All"
      ? "Everything, sorted newest → oldest."
      : filter === "Game"
      ? "Edutainment + game dev builds."
      : "Full-stack + product builds.";

  return (
    <section className="panel panel-bevel projectsPage" style={{ padding: 18 }}>
      <div className="projectsTop">
        <div className="projectsTitleBlock">
          <h1 className="retro-title projectsTitle">Projects</h1>
          <div className="projectsHint">A mix of web + games — creative developer at my core.</div>
        </div>

        <div className="projectTabs" role="tablist" aria-label="Project filters">
          {["All", "Game", "Web"].map((t) => (
            <button
              key={t}
              type="button"
              className={`projectTab ${filter === t ? "projectTab--active" : ""}`}
              onClick={() => setFilter(t)}
              role="tab"
              aria-selected={filter === t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="panel portalFrame">
        <Skills />
      </div>

      <ProjectSection title={sectionTitle} subtitle={sectionSubtitle} projects={visible} />
    </section>
  );
}