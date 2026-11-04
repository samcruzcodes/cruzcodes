import { useState } from "react";
import Carousel from "./Carousel";
import ExternalLink from "./ExternalLink";
import Icon from "./Icon";
import Lightbox from "./Lightbox";
import RichText from "./RichText";
import { about, contact, printGallery, story } from "../data";

// The big shelf photo comes first (index 0), then the little photos; the big viewer
// (Lightbox) flips through all of them in this order.
const galleryPhotos = [printGallery.hero, ...printGallery.thumbs];
const { hero } = printGallery;

export default function AboutPage() {
  // Which photo is open in the big view (index into galleryPhotos), or null if none.
  const [enlarged, setEnlarged] = useState(null);

  return (
    <section className="page panel panel-bevel aboutPanel" aria-labelledby="about-title">
      <div className="aboutHero">
        <div className="aboutIntro">
          <h1 id="about-title" className="retro-title aboutHey" tabIndex={-1}>
            Hey, I&apos;m <span className="aboutName">Sam!</span>
          </h1>

          <p className="aboutLine">
            <RichText parts={about.intro} />
          </p>

          <ul className="aboutMini" aria-label="Organizations">
            {about.orgs.map((org) => (
              <li key={org.name}>
                <ExternalLink className="inlineLink" href={org.href}>
                  {org.name}
                </ExternalLink>
              </li>
            ))}
          </ul>

          {/* Icon-only links, so the hidden text says where each one goes. */}
          <ul className="aboutSocials" aria-label="Contact">
            <li>
              <a href={contact.mailto} className="aboutSocialLink">
                <Icon name="envelope" />
                <span className="visuallyHidden">Email Sam</span>
              </a>
            </li>
            <li>
              <ExternalLink href={contact.linkedin} className="aboutSocialLink">
                <Icon name="linkedin" />
                <span className="visuallyHidden">Sam&apos;s LinkedIn</span>
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href={contact.github} className="aboutSocialLink">
                <Icon name="github" />
                <span className="visuallyHidden">Sam&apos;s GitHub</span>
              </ExternalLink>
            </li>
          </ul>
        </div>

        <img
          className="aboutPhoto"
          src={about.photo.src}
          width={about.photo.width}
          height={about.photo.height}
          alt={about.photo.alt}
          fetchpriority="high"
        />
      </div>

      <Carousel
        id="story"
        title="My Story"
        titleClassName="aboutStoryTitle"
        itemName="story cards"
        className="carousel--story"
        items={story}
        itemKey={(item) => item.year + item.image.src}
        renderItem={(item) => (
          <article className="aboutCard">
            <h3 className="retro-title aboutCardTitle">{item.year}</h3>
            <div className="aboutCardImg">
              <img
                src={item.image.src}
                width={item.image.width}
                height={item.image.height}
                alt={item.image.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="aboutCardBody">
              <RichText parts={item.text} />
            </p>
          </article>
        )}
      />

      {/* 3D PRINTING GALLERY */}
      <section className="aboutGallery" aria-labelledby="gallery-title">
        <h2 id="gallery-title" className="retro-title aboutGalleryTitle">
          3D Printing Gallery
        </h2>

        {/* Every photo is a button that opens it big. The alt says what clicking does,
            and the big view has the full description. */}
        <div className="printFrame">
          <button type="button" className="printBtn printBtn--main" onClick={() => setEnlarged(0)}>
            {/* srcSet: phones get the small file, big screens the big one. */}
            <img
              src={hero.src}
              srcSet={hero.srcSet}
              sizes={hero.sizes}
              width={hero.width}
              height={hero.height}
              alt={`View larger: ${hero.label}`}
              loading="lazy"
              decoding="async"
            />
          </button>

          <ul className="printGrid" aria-label="More 3D prints">
            {printGallery.thumbs.map((p, i) => (
              <li key={p.src} className="printTile">
                <button type="button" className="printBtn" onClick={() => setEnlarged(i + 1)}>
                  <img
                    src={p.src}
                    width={p.width}
                    height={p.height}
                    alt={`View larger: ${p.label}`}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <Lightbox
          photos={galleryPhotos}
          index={enlarged}
          onChange={setEnlarged}
          onClose={() => setEnlarged(null)}
        />
      </section>
    </section>
  );
}
