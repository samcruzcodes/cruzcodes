import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import python from './skills/python.png';
import react from './skills/react.png';
import godot from './skills/godot.png';
import bootstrap from './skills/bootstrap.png';
import css from './skills/css3.png';
import html from './skills/html5.png';
import javascript from './skills/javascript.png';
import typescript from './skills/typescript.png';
import docker from './skills/docker.png';
import git from './skills/git.png';
import unity from './skills/unity.png';
import firebase from './skills/firebase.png';

export const Skills = () => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 10,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 7,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 4,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 3,
    },
  };

  const skills = [
    { src: python, name: 'Python' },
    { src: react, name: 'React' },
    { src: godot, name: 'Godot' },
    { src: bootstrap, name: 'Bootstrap' },
    { src: css, name: 'CSS' },
    { src: html, name: 'HTML' },
    { src: javascript, name: 'JavaScript' },
    { src: typescript, name: 'TypeScript' },
    { src: docker, name: 'Docker' },
    { src: git, name: 'Git' },
    { src: unity, name: 'Unity' },
    { src: firebase, name: 'Firebase' },
  ];

  return (
    <section>
      <style>
        {`
          .carousel-item-spacing {
            padding: 0 5px; /* Adjust gap between items */
          }

          .skill-item {
            text-align: center;
          }

          .skill-item img {
            width: 80px;
            height: 80px;
            object-fit: contain;
            margin-bottom: 5px;
          }

          .skill-item p {
            font-size: 14px;
            margin: 0;
          }

          section {
            padding: 20px;
            text-align: center;
          }

          h2 {
            font-size: 24px;
            margin-bottom: 10px;
          }

          p {
            font-size: 16px;
            margin-bottom: 20px;
          }
        `}
      </style>
      <h2>Skills</h2>
      <p>
        I love to make things both for the general web and for edutainment purposes.
        Here are the tools I use:
      </p>
      <Carousel
        responsive={responsive}
        arrows={false}
        itemClass="carousel-item-spacing"
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={1250}
      >
        {skills.map((skill, index) => (
          <div key={index} className="skill-item">
            <img src={skill.src} alt={skill.name} />
            <p>{skill.name}</p>
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default Skills;
