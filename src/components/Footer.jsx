import { contact } from "../data";
import ExternalLink from "./ExternalLink";
import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="siteFooter">
      {/* Icons are just decoration here; the link text already says where it goes. */}
      <ul className="footerLinks" aria-label="Contact">
        <li>
          <a className="footerLink" href={contact.mailto}>
            <Icon name="envelope" />
            {contact.email}
          </a>
        </li>
        <li>
          <ExternalLink className="footerLink" href={contact.linkedin}>
            <Icon name="linkedin" />
            LinkedIn
          </ExternalLink>
        </li>
        <li>
          <ExternalLink className="footerLink" href={contact.github}>
            <Icon name="github" />
            GitHub
          </ExternalLink>
        </li>
      </ul>
      {/* Space Mono's © looks tiny and floaty, so it gets a system font (see .copyMark). */}
      <p className="footerNote">
        <span className="copyMark">&copy;</span> {new Date().getFullYear()} Samantha Cruz
      </p>
    </footer>
  );
}
