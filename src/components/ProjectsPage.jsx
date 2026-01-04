import { useMemo } from "react";
import Skills from "./Skills";

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
          <img className="projectImg" src={imageUrl} alt={`Screenshot of ${title}`} loading="lazy" />
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
  const gameProjects = useMemo(
    () =>
      [
        {
          title: "Duke vs. The Gang",
          description:
            "Currently in development — midwestern bullet hell game with DGA Studios at Cornell.",
          imageUrl: "assets/duke.png",
          date: "2025-08-01",
          dateLabel: "Aug 2025 – Present",
          stack: ["Unity", "C#", "Trello"],
          viewLink: "https://dgacornell.itch.io/duke-vs-the-gang",
          githubLink: "",
        },
        {
          title: "Cheezy Conundrum",
          description: "Help Timmy and Tommy chase cheese and dodge traps in this single-player puzzle game — control two rats with one keyboard to lead them to freedom!",
          imageUrl: "assets/cheezy.jpg",
          date: "2023-08-01",
          dateLabel: "Summer 2023",
          stack: ["JavaScript", "p5.js", "Aseprite", "repl.it"],
          viewLink: "https://cheezyconundrum.github.io/",
          githubLink: "https://github.com/samcruzcodes/Cheezy-Conundrum",
        },
        {
          title: "Turtleburg",
          description: "Educational RPG exploring the global water crisis through narrative-driven gameplay.",
          imageUrl: "assets/tbGame.png",
          date: "2021-02-01",
          dateLabel: "2021–2023",
          stack: ["Godot", "GDScript", "Python", "Aseprite"],
          viewLink: "",
          githubLink: "https://github.com/samcruzcodes/Turtleburg",
        },
      ].sort(byNewest),
    []
  );

  const webProjects = useMemo(
    () =>
      [
        {
          title: "H4I — Alaska Children's Trust",
          description:
            "Mobile app dashboard digitizing ACT's Safety Deck to improve accessibility and interactivity. Built modular components from Figma and shipped with an Agile team.",
          imageUrl: "assets/act.png",
          date: "2025-12-01",
          dateLabel: "Sep–Dec 2025",
          stack: ["React Native", "NativeWind", "Expo", "Figma"],
          viewLink: "",
          githubLink: "https://github.com/cornellh4i/act",
        },
        {
          title: "ThinkDraft AI",
          description:
            "B2C AI assistant serving ~3,000 students annually, featuring a 3-tier validation pipeline that reduced token usage by 40–60%.",
          imageUrl: "assets/thinkdraft.png",
          date: "2025-08-01",
          dateLabel: "Summer 2025",
          stack: ["React", "Tailwind", "Python", "OpenAI API", "Docker"],
          viewLink: "",
          githubLink: "",
        },
        {
          title: "H4I — Ithaca Community Recovery",
          description:
            "Shipped features for a platform serving ~30,000 users annually, including backend recurrence improvements and QA/debugging for handoff.",
          imageUrl: "assets/icr.png",
          date: "2025-05-01",
          dateLabel: "Jan–May 2025",
          stack: ["TypeScript", "Next.js", "MongoDB", "Prisma"],
          viewLink: "https://ithaca-recovery.vercel.app/",
          githubLink: "https://github.com/cornellh4i/ithaca-recovery",
        },
        {
          title: "Circle K Website",
          description: "Official website for Circle K International at Cornell University.",
          imageUrl: "assets/circlekwebsite.png",
          date: "2025-02-01",
          dateLabel: "2025",
          stack: ["React", "Bootstrap", "Fly.io"],
          viewLink: "https://circlekatcornell.org",
          githubLink: "",
        },
        {
          title: "Budget Planner",
          description: "AI-powered budgeting app with real-time data visualization and personalized financial recommendations.",
          imageUrl: "assets/budget.png",
          date: "2024-06-01",
          dateLabel: "2024",
          stack: ["TypeScript", "Express", "React", "Bootstrap", "Fly.io", "Docker"],
          viewLink: "https://budget.cruzcodes.com",
          githubLink: "https://github.com/samcruzcodes/budget.io",
        },
        {
          title: "APO Gamma Website",
          description: "Official website for Alpha Phi Omega Gamma Chapter at Cornell.",
          imageUrl: "assets/apowebsite.png",
          date: "2024-04-01",
          dateLabel: "2024",
          stack: ["React", "Bootstrap", "Fly.io"],
          viewLink: "https://www.apogamma.org",
          githubLink: "https://github.com/samcruzcodes/Edvisor",
        },
      ].sort(byNewest),
    []
  );

  return (
    <section className="panel panel-bevel projectsPage" style={{ padding: 18 }}>
      <div className="projectsTop">
        <div className="projectsTitleBlock">
          <h1 className="retro-title projectsTitle">Projects</h1>
          <div className="projectsHint">A mix of web + games — creative developer at my core.</div>
        </div>
      </div>

      <div className="panel portalFrame">
        <Skills />
      </div>

      <ProjectSection title="Game Projects" subtitle="Edutainment + game dev builds." projects={gameProjects} />
      <ProjectSection title="Web Projects" subtitle="Full-stack + product builds." projects={webProjects} />
    </section>
  );
}