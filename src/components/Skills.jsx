import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import python from "./skills/python.png";
import react from "./skills/react.png";
import godot from "./skills/godot.png";
import bootstrap from "./skills/bootstrap.png";
import css from "./skills/css3.png";
import html from "./skills/html5.png";
import javascript from "./skills/javascript.png";
import typescript from "./skills/typescript.png";
import docker from "./skills/docker.png";
import git from "./skills/git.png";
import unity from "./skills/unity.png";
import firebase from "./skills/firebase.png";

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 10 },
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 7 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 4 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 3 },
};

const skills = [
  { src: python, name: "Python" },
  { src: react, name: "React" },
  { src: godot, name: "Godot" },
  { src: bootstrap, name: "Bootstrap" },
  { src: css, name: "CSS" },
  { src: html, name: "HTML" },
  { src: javascript, name: "JavaScript" },
  { src: typescript, name: "TypeScript" },
  { src: docker, name: "Docker" },
  { src: git, name: "Git" },
  { src: unity, name: "Unity" },
  { src: firebase, name: "Firebase" },
];

export default function Skills() {
  return (
    <div className="skillsBlock" role="region" aria-label="Technical skills">
      <h2 className="retro-title" style={{ fontSize: 44, marginBottom: 6 }}>
        Skills
      </h2>
      <p style={{ opacity: 0.9, marginBottom: 10, margin: 0 }}>
        Tools I use to build web projects + games.
      </p>

      <Carousel
        responsive={responsive}
        arrows={false}
        infinite
        autoPlay
        autoPlaySpeed={1250}
        itemClass="skillItemSpacing"
        draggable
        swipeable
        aria-label="Skills carousel"
      >
        {skills.map((s) => (
          <div key={s.name} className="skillItem">
            <div className="skillIconFrame">
              <img src={s.src} alt={`${s.name} logo`} loading="lazy" />
            </div>
            <div className="skillLabel">{s.name}</div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}