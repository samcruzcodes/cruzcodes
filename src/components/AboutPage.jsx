import { useRef, useState } from "react";
import { aboutItems } from "../data";

export default function AboutPage() {
  const railRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const down = (pageX) => {
    if (!railRef.current) return;
    setDragging(true);
    setStartX(pageX - railRef.current.getBoundingClientRect().left);
    setScrollLeft(railRef.current.scrollLeft);
  };

  const move = (pageX) => {
    if (!dragging || !railRef.current) return;
    const x = pageX - railRef.current.getBoundingClientRect().left;
    const walk = (x - startX) * 1.55;
    railRef.current.scrollLeft = scrollLeft - walk;
  };

  const prints = [
    ["gallery/Shelf.jpg", "Shelf Display"],
    ["gallery/darth vader.jpg", "Darth Vader"],
    ["gallery/dog portrait.jpg", "Dog Portrait"],
    ["gallery/banana.JPG", "Banana"],
    ["gallery/gfs shelf.jpg", "Misc Shelf"],
    ["gallery/dragon ball.jpg", "Dragon Ball"],
    ["gallery/kuchi kopi.jpg", "Kuchi Kopi"],
    ["gallery/autumn dragon.jpg", "Autumn Dragon"],
    ["gallery/hollow dragon.jpg", "Hollow Dragon"],
    ["gallery/imperial dragon.jpg", "Imperial Dragon"],
    ["gallery/family portrait.jpg", "Family Portrait"],
    ["gallery/dinos flexy.jpg", "Flexible Dragons"],
    ["gallery/among us.jpg", "Among Us Display"],
    ["gallery/evil minion.jpg", "Evil Minion"],
    ["gallery/crystal dragon.jpg", "Crystal Dragon"],
    ["gallery/minion.jpg", "Bob the Minion"],
    ["gallery/frenchy face.jpg", "Frenchy Face"],
    ["gallery/coco lithopane.JPG", "Coco Lithopane"],
    ["gallery/frenchy buddha.JPG", "Frenchy Buddha"],
  ];

  return (
    <section className="panel panel-bevel aboutPanel">
      <div className="aboutHero">
        {/* LEFT */}
        <div className="aboutIntro">
          <div className="retro-title aboutHey">
            Hey, I&apos;m <span className="aboutName">Sam!</span>
          </div>

          <p className="aboutLine">
            I'm a sophomore at Cornell studying Computer Science with a minor in Game Design. I
            love building interactive tools that make learning feel intuitive and fun. I'm
            drawn to projects with clear goals, fast iteration, and a strong focus on the user.
            I'm happiest when I can blend creativity with technical problem-solving.
          </p>

          <p className="aboutMini">
            Latinas Promoviendo Comunidad / Lambda Pi Chi Sorority Inc.
            <br />
            Hack4Impact
            <br />
            DGA Studios
          </p>

          <div className="aboutSocials">
            <a
              href="https://www.linkedin.com/in/samanthajcruz/"
              target="_blank"
              rel="noreferrer"
              className="aboutSocialLink"
              aria-label="LinkedIn"
            >
              <i className="fa-brands fa-linkedin"></i>
            </a>
            <a
              href="https://github.com/samcruzcodes"
              target="_blank"
              rel="noreferrer"
              className="aboutSocialLink"
              aria-label="GitHub"
            >
              <i className="fa-brands fa-square-github"></i>
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="aboutStory">
          <div className="retro-title aboutStoryTitle">My Story</div>

          <div
            ref={railRef}
            className="aboutRail"
            onMouseDown={(e) => down(e.pageX)}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
            onMouseMove={(e) => {
              e.preventDefault();
              move(e.pageX);
            }}
            onTouchStart={(e) => down(e.touches[0].pageX)}
            onTouchEnd={() => setDragging(false)}
            onTouchMove={(e) => move(e.touches[0].pageX)}
          >
            <div className="aboutTrack">
              {aboutItems.map((item) => (
                <article key={item.title + item.imageSrc} className="aboutCard">
                  <div className="aboutCardTitle retro-title">{item.title}</div>

                  <div className="aboutCardImg">
                    <img src={item.imageSrc} alt={item.title} />
                  </div>

                  <p className="aboutCardBody">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3D PRINTING GALLERY */}
      <div className="aboutGallery">
        <div className="retro-title aboutGalleryTitle">3D Printing Gallery</div>

        <div className="printFrame">
          <div className="printMain">
            <img src="gallery/Shelf.jpg" alt="Shelf Display" />
          </div>

          <div className="printThumbRow" aria-label="More 3D prints">
            {prints
              .filter(([src]) => src !== "gallery/Shelf.jpg")
              .map(([src, label]) => (
                <div key={src} className="printThumb is-static" title={label}>
                  <img src={src} alt={label} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}