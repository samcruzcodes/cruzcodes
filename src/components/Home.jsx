import FollowEyeOnPNG from "./FollowEyeOnPNG";
import ImagePlaceholder from "./ImagePlaceholder";
import { isPlainClick } from "./navigation";
import { projectId, projects } from "../data";

// The Featured tiles: projects with a `featured` number in data.js, in that order.
const featured = projects.filter((p) => p.featured).sort((a, b) => a.featured - b.featured);

export default function Home({ onNavigate }) {
  // Real links (so they can open in a new tab or be copied), but a plain click switches pages
  // in place, like the nav does.
  const go = (page, target) => (e) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    onNavigate(page, target);
  };

  return (
    <>
      <section className="page panel panel-bevel homeOnly" aria-labelledby="home-title">
        {/* Just one h1! Flex order puts my face between the names on wide screens
            and under them on mid-size ones. */}
        <h1 id="home-title" className="nameRow retro-title" tabIndex={-1}>
          <span className="bigName nameFirst">Sam</span>{" "}
          <span className="bigName nameLast">Cruz</span>
          <span className="faceSlot">
            <FollowEyeOnPNG />
          </span>
        </h1>

        <p className="homeSub">
          Info + Cog Sci @ Cornell • creative software + game dev at my core
        </p>

        <div className="heroCtas">
          <a className="heroBtn heroBtn--primary" href="#projects" onClick={go("projects")}>
            View My Projects
          </a>
          <a className="heroBtn heroBtn--secondary" href="#about" onClick={go("about")}>
            Get to Know Me
          </a>
        </div>
      </section>

      <section className="page homeFeatured" aria-labelledby="featured-title">
        <h2 id="featured-title" className="retro-title featuredHeading">
          Featured
        </h2>

        <ul className="featuredGrid">
          {featured.map((p) => {
            const id = projectId(p.title);
            return (
              <li key={id}>
                <a className="featuredTile panel" href={`#${id}`} onClick={go("projects", id)}>
                  <div className="featuredMedia">
                    {p.image ? (
                      // Decorative: the title right below names the link.
                      <img
                        src={p.image.src}
                        width={p.image.width}
                        height={p.image.height}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      // Fallback if a featured project has no image yet (the text is hidden from
                      // screen readers since the title already names the link).
                      <div aria-hidden="true">
                        <ImagePlaceholder description={p.imagePlaceholder} height="100%" />
                      </div>
                    )}
                  </div>
                  <span className="featuredTitle retro-title">{p.title}</span>
                  <span className="featuredCta">
                    View project <span aria-hidden="true">→</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
