import Carousel from "./Carousel";
import { skills } from "../data";

export default function Skills() {
  return (
    <Carousel
      id="skills"
      title="Skills"
      titleClassName="skillsTitle"
      description="Tools I use to build web projects + games."
      itemName="skills"
      className="carousel--skills"
      items={skills}
      itemKey={(s) => s.name}
      renderItem={(s) => (
        <div className="skillItem">
          <span className="skillIconFrame">
            {/* Decorative, since the label right below already names the skill.
                Source: Devicon (MIT, https://devicon.dev). */}
            <img src={`assets/skills/${s.icon}.svg`} alt="" width="64" height="64" />
          </span>
          <span className="skillLabel">{s.name}</span>
        </div>
      )}
    />
  );
}
