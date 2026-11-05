import { useState } from "react";
import Icon from "./Icon";
import { isPlainClick } from "./navigation";
import { contact } from "../data";

const menuItems = [
  { name: "HOME", key: "home" },
  { name: "ABOUT", key: "about" },
  { name: "PROJECTS", key: "projects" },
];

export default function Header({ page, setPage }) {
  const [isOpen, setIsOpen] = useState(false);

  // These go to other pages, so they're real links (they can open in a new tab or be copied);
  // a plain click switches pages in place instead of reloading.
  const go = (key) => (event) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    setPage(key);
    setIsOpen(false);
    window.scrollTo({ top: 0 });
  };

  const logo = (
    <a className="logoBtn" href="#home" onClick={go("home")}>
      {/* The rat is the only thing in this link, so its alt says where it takes you. */}
      <img className="rat" src="assets/avatar.webp" width="128" height="128" alt="Home" />
    </a>
  );

  const navButtons = menuItems.map((item) => (
    <li key={item.key}>
      <a
        className={`navLink retro-title ${page === item.key ? "active" : ""}`}
        href={`#${item.key}`}
        onClick={go(item.key)}
        aria-current={page === item.key ? "page" : undefined}
      >
        {item.name}
      </a>
    </li>
  ));

  return (
    <header className="siteHeader">
      {/* ===== MAIN NAVBAR ===== */}
      <nav className="navbar" aria-label="Main">
        <div className="logo">{logo}</div>

        <ul className="links">{navButtons}</ul>

        <a className="action_btn retro-title" href={contact.mailto}>
          CONTACT ME!
        </a>
      </nav>

      {/* ===== MOBILE HEADER ===== */}
      <div className="toggle_btn">
        <div className="logo">{logo}</div>

        <button
          type="button"
          className="menuIcon"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="dropdownMenu"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <Icon name={isOpen ? "xmark" : "bars"} />
        </button>
      </div>

      {/* ===== DROPDOWN MENU ===== */}
      <nav
        className={`dropdown_menu ${isOpen ? "is-open" : ""}`}
        id="dropdownMenu"
        aria-label="Mobile"
      >
        <ul className="dropdown_list">
          {navButtons}
          <li>
            <a
              className="action_btn retro-title"
              href={contact.mailto}
              onClick={() => setIsOpen(false)} // closes menu on tap
            >
              CONTACT ME!
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
