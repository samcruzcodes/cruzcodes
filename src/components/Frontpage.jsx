import React, { useState, useEffect } from "react";

const Frontpage = () => {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");
  const [delta, setDelta] = useState(200);
  const [index, setIndex] = useState(1);
  const toRotate = ["Web Developer", "Game Developer", "EdTech Enthusiast" ];
  const period = 2000;

  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => {
      clearInterval(ticker);
    };
  }, [text]);

  const tick = () => {
    let i = loopNum % toRotate.length;
    let fullText = toRotate[i];
    let updatedText = isDeleting
      ? fullText.substring(0, text.length - 1)
      : fullText.substring(0, text.length + 1);
  
    setText(updatedText);
  
    if (isDeleting) {
      setDelta(100);
    }
  
    if (!isDeleting && updatedText === fullText) {
      // Start deleting after a pause
      setIsDeleting(true);
      setDelta(period);
    } else if (isDeleting && updatedText === fullText.substring(0, 1)) {
      // Instead of deleting everything, stop after the first character
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setDelta(200);
    }
  };
  

  return (
    <section className="frontpage">
      <div className="start">
        <h4 className="hi">Hey Friend!</h4>
        <h1 className="name"> I'm <span className="highlighted-name">Sam Cruz</span></h1>
        <h2>
          <span
            className="txt-rotate"
            dataPeriod="1000"
            data-rotate='[ "Web Developer", "Game Developer", "EdTech Enthusiast" ]'
          >
            <span className="wrap">{text}</span>
          </span>
        </h2>
      </div>
      <div className="sam">
        <a
          href="https://www.linkedin.com/in/samanthajcruz/"
          target="_blank"
          rel="noreferrer"
        >
          <i className="fa-brands fa-linkedin" id="mob1"></i>
        </a>
        <img className="me" src="assets/me.jpg" alt="Sam" />
        <a
          href="https://github.com/samcruzcodes"
          target="_blank"
          rel="noreferrer"
        >
          <i className="fa-brands fa-square-github" id="mob2"></i>
        </a>
        <div className="medias">
          <a
            href="https://www.linkedin.com/in/samanthajcruz/"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-linkedin"></i>
          </a>
          <a
            href="https://github.com/samcruzcodes"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-square-github"></i>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Frontpage;
