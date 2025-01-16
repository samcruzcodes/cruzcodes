import React from "react";

const ProjectCard = ({ title, description, imageUrl, githubLink, viewLink, isFlipped = false }) => {
  return (
    <div className={isFlipped ? "proje" : "proje"} id={isFlipped ? "flipped" : ""}>
      {!isFlipped ? (
        <>
          <img id="project" src={imageUrl} alt={title} />
          <div className="textt">
            <p>{title} - {description}</p>
            <div className="btn-container">
              {viewLink && (
                <div className="btn1">
                  <a href={viewLink} target="_blank" rel="noreferrer">
                    &nbsp;&nbsp;View&nbsp;
                  </a>
                </div>
              )}
              {githubLink && (
                <div className="btn1">
                  <a href={githubLink} target="_blank" rel="noreferrer">
                    &nbsp;GitHub&nbsp;
                  </a>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="textt">
            <p>{title} - {description}</p>
            <div className="btn-container">
              {viewLink && (
                <div className="btn1">
                  <a href={viewLink} target="_blank" rel="noreferrer">
                    &nbsp;&nbsp;View&nbsp;
                  </a>
                </div>
              )}
              {githubLink && (
                <div className="btn1">
                  <a href={githubLink} target="_blank" rel="noreferrer">
                    &nbsp;GitHub&nbsp;
                  </a>
                </div>
              )}
            </div>
          </div>
          <img id="project" src={imageUrl} alt={title} />
        </>
      )}
    </div>
  );
};

export default ProjectCard;