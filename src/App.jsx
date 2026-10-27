import { useEffect, useRef, useState } from "react";
import "./styles/retro.css";

import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import AboutPage from "./components/AboutPage.jsx";
import ProjectsPage from "./components/ProjectsPage.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const [page, setPage] = useState("home");
  const mainRef = useRef(null);
  const isFirstRender = useRef(true);

  // When you switch pages, jump focus to the new heading so keyboard and
  // screen-reader users land on the new content (but not on first load).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.querySelector("h1")?.focus({ preventScroll: true });
  }, [page]);

  return (
    <div className="retro-bg">
      <Header page={page} setPage={setPage} />

      <main ref={mainRef} className={`wrapper ${page === "home" ? "wrapper--home" : ""}`}>
        {page === "home" && <Home />}
        {page === "about" && <AboutPage />}
        {page === "projects" && <ProjectsPage />}
      </main>

      <Footer />
    </div>
  );
}
