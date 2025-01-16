import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen((open) => !open);
  };

  const menuItems = [
    { name: "ABOUT", href: "#about" },
    { name: "PROJECTS", href: "#projects" },
    { name: "PRINTING", href: "#printing" },
  ];

  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <a href="#top">
            <img
              className="rat"
              src="assets/avatar no background.png"
              alt="Logo"
            />
          </a>
        </div>

        <ul className="links">
          {menuItems.map((item) => (
            <li key={item.name}>
              <a className="link" href={item.href}>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
        <a class="action_btn"
        href="mailto:sam@cruzcodes.com?subject=Hello, Samantha!&body=I hope this note finds you well. You had such a compelling portfolio, I just *had* to click on it!">CONTACT
        ME!</a>
      </nav>
      <div className="toggle_btn">
        <div className="logo">
          <a href="#top">
            <img
              className="rat"
              src="assets/avatar no background.png"
              alt="Logo"
            />
          </a>
        </div>
        <i
          className={`fa-solid ${isOpen ? "fa-xmark" : "fa-bars"}`}
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls="dropdownMenu"
          role="button"
          tabIndex="0"
          onKeyPress={(e) => {
            if (e.key === 'Enter') toggleMenu();
          }}
        ></i>
      </div>
      <nav className={`dropdown_menu ${isOpen ? "is-open" : ""}`} id="dropdownMenu">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <a className="link" href={item.href}>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
        <a
          className="action_btn"
          href="mailto:sam@cruzcodes.com?subject=Hello, Samantha!&body=I hope this note finds you well. You had such a compelling portfolio, I just *had* to click on it!"
        >
          CONTACT ME!
        </a>
      </nav>
    </header>
  );
}
