import React, { useRef, useState } from 'react';

const About = () => {
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const blogPosts = [
    {
      title: "2020: My Introduction to 3D Printing",
      imgSrc: "../assets/shelf.jpg",
      description:
        "During quarantine, I discovered the world of 3D printing after stumbling upon a 3D-printed boat online. By July, I had built my Ender 3 Pro printer and began creating models, learning CAD software and troubleshooting hardware issues. This sparked my passion for problem-solving and iterative design.",
      link: "https://www.3dbenchy.com",
      linkText: "3D Benchy",
    },
    {
      title: "2021-2023: Developing Turtleburg",
      imgSrc: "../assets/turtleburg.jpg",
      description:
        "For a school project, I set out to create a game from scratch. Over 500 hours of coding and graphic design later, I developed Turtleburg, an edutainment RPG addressing the water crisis. This taught me game mechanics, programming fundamentals, and perseverance.",
    },
    {
      title: "Summer 2023: Exploring Web Development with KWK",
      imgSrc: "../assets/kwk.png",
      description:
        "Kode With Klossy introduced me to HTML, CSS, and JavaScript. I developed EdVisor, a web app helping students manage educational goals. This experience expanded my technical skill set and sparked my interest in user-centered design.",
      link: "http://edvisor.cruzcodes.com",
      linkText: "EdVisor",
    },
    {
      title: "Summer 2023: Game Development with GWC SIP",
      imgSrc: "../assets/cheezy.jpg",
      description:
        "Through Girls Who Code SIP, I explored game development using p5.js and JavaScript. My project, Cheezy Conundrum, challenged me to design engaging gameplay and polish visuals, deepening my understanding of programming logic and creative design.",
      link: "https://cruzcodes.itch.io/cheezy-conundrum",
      linkText: "Cheezy Conundrum",
    },
    {
      title: "Fall 2024: Full-Stack Development at Cornell",
      imgSrc: "../assets/games.png",
      description:
        "In Cornell’s INFO 1998, I developed and published a full-stack web application at games.cruzcodes.com using the FERN stack (Firebase, Express, React, Node.js). This gave me hands-on experience in backend development, API integration, and deploying applications.",
      link: "http://games.cruzcodes.com",
      linkText: "games.cruzcodes.com",
    },
    {
      title: "Fall 2024: Pledging Alpha Phi Omega",
      imgSrc: "../assets/rush.png",
      description:
        "In Fall 2024, I pledged Alpha Phi Omega, a service fraternity that values leadership, friendship, and service. This experience connected me to like-minded peers and strengthened my organizational skills.",
    },
    // {
    //   title: "Spring 2025: Becoming Webmaster for Alpha Phi Omega",
    //   imgSrc: "../assets/webmaster.jpg",
    //   description:
    //     "As Webmaster for Alpha Phi Omega, I manage the fraternity’s online presence, including maintaining and updating the website. This role further develops my web development skills and leadership within the organization.",
    // },
    {
      title: "Spring 2025: Teaching CS with Varsity Tutors",
      imgSrc: "../assets/tutor.png",
      description:
        "I became a Varsity Tutors tutor specializing in computer science. Teaching others has honed my communication skills and reinforced my technical knowledge, particularly in programming fundamentals and web development.",
    },
  ];
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="about-container">
      <div 
        ref={carouselRef}
        className="about_slider_area"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        <div className="slider-track">
          {blogPosts.map((post, index) => (
            <div className="box-area" key={index}>
              <div className="single-blog wow fadeInUp">
                <div className="single_blog">
                  <a href="#">
                    <h3 className="post-title">{post.title}</h3>
                  </a>
                  <div className="post-img">
                    <img src={post.imgSrc} alt={post.title} />
                  </div>
                  <p className="blog-text">
                    {post.description}{" "}
                    {post.link && (
                      <a href={post.link} target="_blank" rel="noopener noreferrer">
                        {post.linkText}
                      </a>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
  .about-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .about_slider_area {
    overflow-x: auto;
    cursor: grab;
    position: relative;
    padding: 1rem 0;
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
  }

  .about_slider_area::-webkit-scrollbar {
    height: 0.5vh;
  }

  .about_slider_area::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .about_slider_area::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  .slider-track {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: calc(45% - 0.5rem);
    gap: 1.7rem;
    padding: 0 1rem;
  }

  /* Media queries to adjust the gap based on screen width */
  @media (max-width: 1200px) {
    .slider-track {
      gap: 4rem; 
    }
  }

  @media (max-width: 992px) {
    .slider-track {
      gap: 9rem; 
    }
  }

  @media (max-width: 768px) {
    .slider-track {
      gap: 8rem; 
    }
  }

  @media (max-width: 576px) {
    .slider-track {
      gap: 11rem; 
    }

    .about-container{
    padding:0;
    }
  }
`}</style>

    </div>
  );
};

export default About;