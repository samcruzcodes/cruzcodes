import { useState } from "react";
import "./styles/retro.css";

import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import AboutPage from "./components/AboutPage.jsx";
import ProjectsPage from "./components/ProjectsPage.jsx";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="retro-bg">
      <Header page={page} setPage={setPage} />

      <main className={`wrapper ${page === "home" ? "wrapper--home" : ""}`}>
        {page === "home" && <Home />}
        {page === "about" && <AboutPage />}
        {page === "projects" && <ProjectsPage />}
      </main>
    </div>
  );
}