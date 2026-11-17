import { useEffect, useRef, useState } from "react";
import "./styles/retro.css";

import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import AboutPage from "./components/AboutPage.jsx";
import ProjectsPage from "./components/ProjectsPage.jsx";
import Footer from "./components/Footer.jsx";
import { findProjectById, projectId } from "./data";

// There's no router: `nav.page` picks the page, and `nav.target` (optional) is a project card
// on the Projects page to jump to. The URL hash is only read when the site first loads, so
// links like cruzcodes.com/#about or /#project-the-veil-sur open the right spot.
function navFromHash() {
  const hash = window.location.hash.slice(1);
  if (hash === "about" || hash === "projects") return { page: hash, target: null };
  // Also understands a card's old id (`legacyIds` in data.js), so older links keep working.
  const project = findProjectById(hash);
  if (project) return { page: "projects", target: projectId(project.title) };
  return { page: "home", target: null };
}

export default function App() {
  const [nav, setNav] = useState(navFromHash);
  const mainRef = useRef(null);
  const shownNav = useRef(nav); // the page we've already put focus on (the first one needs none)

  const navigate = (page, target = null) => {
    setNav({ page, target });
    // Jumping to a project card scrolls itself; everything else starts at the top.
    if (!target) window.scrollTo({ top: 0 });
  };

  // When you switch pages, jump focus to the new heading so keyboard and
  // screen-reader users land on the new content (but not on first load).
  // (Jumping to a project card focuses that card's title instead; see ProjectsPage.)
  // Comparing with the last page shown, instead of a "first render" flag, keeps this right in
  // development too, where React StrictMode runs every effect twice on load.
  useEffect(() => {
    if (shownNav.current === nav) return;
    shownNav.current = nav;
    if (nav.target) return;
    mainRef.current?.querySelector("h1")?.focus({ preventScroll: true });
  }, [nav]);

  // "Skip to main content": the first Tab stop on every page. Focus moves into <main> itself, so the
  // next Tab goes to the page's first link or button (the URL hash is left alone).
  const skipToMain = (event) => {
    event.preventDefault();
    mainRef.current?.focus();
  };

  return (
    <div className="retro-bg">
      <a className="skipLink" href="#main" onClick={skipToMain}>
        Skip to main content
      </a>

      <Header page={nav.page} setPage={(key) => navigate(key)} />

      <main id="main" ref={mainRef} tabIndex={-1} className={`wrapper ${nav.page === "home" ? "wrapper--home" : ""}`}>
        {nav.page === "home" && <Home onNavigate={navigate} />}
        {nav.page === "about" && <AboutPage />}
        {nav.page === "projects" && <ProjectsPage targetId={nav.target} />}
      </main>

      <Footer />
    </div>
  );
}
