import Header from "./components/Header.jsx";
import Frontpage from "./components/Frontpage.jsx";
import About from "./components/About.jsx";
import Skills from "./components/Skills.jsx";
import ProjectsSection from "./components/ProjectsSection";

function App() {
  const gameProjects = [
    {
      title: "Turtleburg",
      description: "Built using Godot Engine, GDScript, Python, and Aseprite.",
      imageUrl: "assets/tbGame.png",
      githubLink: "https://github.com/samcruzcodes/Turtleburg",
      viewLink: "",
    },
    {
      title: "Cheezy Conundrum",
      description: "Built using JavaScript, p5.js, Aseprite, and repl.it.",
      imageUrl: "assets/cheezy.jpg",
      githubLink: "https://github.com/samcruzcodes/Cheezy-Conundrum",
      viewLink: "https://cheezyconundrum.github.io/",
    },
    {
      title: "Sandcastle Tycoon",
      description: "Built using p5.js and repl.it.",
      imageUrl: "assets/tycoon.PNG",
      githubLink:
        "https://github.com/SandyShoresCM/sandyshorescm.github.io/blob/main/script.js",
      viewLink: "https://sandyshorescm.github.io/learn.html",
    },
  ];

  const webProjects = [
    {
      title: "cruzcodesgames",
      description: "Full stack developed using TypeScript, Firebase, Express, React, Node.",
      imageUrl: "assets/games.png",
      githubLink: "https://github.com/samcruzcodes/cruzcodesgames",
      viewLink: "https://games.cruzcodes.com",
    },
    {
      title: "Budget Planner",
      description: "Full stack using TypeScript, Express, React, Bootstrap, Fly, and Docker.",
      imageUrl: "assets/budget.png",
      githubLink: "https://github.com/samcruzcodes/budget.io",
      viewLink: "https://budget.cruzcodes.com",
    },
    {
      title: "Edvisor",
      description: "Built using HTML, CSS, and JavaScript.",
      imageUrl: "assets/webEd.png",
      githubLink: "https://github.com/samcruzcodes/Edvisor",
      viewLink: "http://edvisor.cruzcodes.com",
    },
    {
      title: "Sandy Shores",
      description: "Built using HTML, CSS, and JavaScript.",
      imageUrl: "assets/sandy.PNG",
      githubLink: "https://github.com/SandyShoresCM/sandyshorescm.github.io",
      viewLink: "https://sandyshorescm.github.io",
    },
  ];

  return (
    <div>
      <Header />
      <div className="wrapper">
        <Frontpage />

        <section id="about">
          <h1>About Me</h1>
          <p style={{ textAlign: "center" }}>
            Scroll through to learn a bit about me and my journey with
            technology, both failures and successes, over the years!
          </p>
          <About />
        </section>

        <Skills />

        <section id="apps">
          <ProjectsSection category="Web Projects" projects={webProjects} />
          <ProjectsSection category="Game Projects" projects={gameProjects} />
        </section>

        <section id="printing">
          <h1>3D Printing Gallery</h1>
          <img
            src="gallery/Shelf.jpg"
            alt="Shelf Display"
            className="printImg"
          />
          <div className="printing">
            <img
              src="gallery/darth vader.jpg"
              alt="Darth vader"
              className="pImg"
            />
            <img
              src="gallery/dog portrait.jpg"
              alt="Dog portrait"
              className="pImg"
            />
            <img src="gallery/banana.JPG" alt="Banana" className="pImg" />
            <img
              src="gallery/gfs shelf.jpg"
              alt="Miscelenous Shelf"
              className="pImg"
            />
            <img
              src="gallery/dragon ball.jpg"
              alt="Dragon ball"
              className="pImg"
            />
            <img
              src="gallery/kuchi kopi.jpg"
              alt="Kuchi Kopi"
              className="pImg"
            />

            <img
              src="gallery/autumn dragon.jpg"
              alt="Autumn Dragon"
              className="pImg"
            />
            <img
              src="gallery/hollow dragon.jpg"
              alt="Hollow Dragon"
              className="pImg"
            />
            <img
              src="gallery/imperial dragon.jpg"
              alt="Imperial Dragon"
              className="pImg"
            />
            <img
              src="gallery/family portrait.jpg"
              alt="Family portrait"
              className="pImg"
            />
            <img
              src="gallery/dinos flexy.jpg"
              alt="Flexible dragons"
              className="pImg"
            />
            <img
              src="gallery/among us.jpg"
              alt="Among us Display"
              className="pImg"
            />

            <img
              src="gallery/evil minion.jpg"
              alt="Evil minion"
              className="pImg"
            />
            <img
              src="gallery/crystal dragon.jpg"
              alt="Crystal dragon"
              className="pImg"
            />
            <img
              src="gallery/minion.jpg"
              alt="Bob the minion"
              className="pImg"
            />
            <img
              src="gallery/frenchy face.jpg"
              alt="Frenchy face"
              className="pImg"
            />
            <img
              src="gallery/coco lithopane.JPG"
              alt="Coco lithopane"
              className="pImg"
            />
            <img
              src="gallery/frenchy buddha.JPG"
              alt="Frenchy buddha"
              className="pImg"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
