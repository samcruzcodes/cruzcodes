import React from "react";
import ProjectCard from "./ProjectCard";
import "./projects.css";

const ProjectsSection = ({ category, projects }) => {
  return (
      <div className="center">
        <h1 style={{ marginBottom: "3rem", textAlign: "center", marginTop: "5rem" }}>
          <u>{category}</u>
        </h1>
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              imageUrl={project.imageUrl}
              githubLink={project.githubLink}
              viewLink={project.viewLink}
              isFlipped={index % 2 === 1}
            />
          ))}
      </div>
  );
};

export default ProjectsSection;
