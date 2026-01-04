import { useState } from "react";

export default function Header({ page, setPage }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "HOME", key: "home" },
    { name: "ABOUT", key: "about" },
    { name: "PROJECTS", key: "projects" },
  ];

  const go = (key) => {
    setPage(key);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="siteHeader">
      {/* ===== MAIN NAVBAR ===== */}
      <nav className="navbar">
        <div className="logo">
          <button
            className="logoBtn"
            onClick={() => go("home")}
            aria-label="Home"
          >
            <img
              className="rat"
              src="assets/avatar no background.png"
              alt="Logo"
            />
          </button>
        </div>

        <ul
          className="links"
          style={{ listStyle: "none", margin: 0, padding: 0 }}
        >
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                className={`navLink retro-title ${
                  page === item.key ? "active" : ""
                }`}
                onClick={() => go(item.key)}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>

        <a
          className="action_btn retro-title"
          href="mailto:sam@cruzcodes.com?subject=Hello, Sam!&body=I saw your portfolio and wanted to reach out."
        >
          CONTACT ME!
        </a>
      </nav>

      {/* ===== MOBILE HEADER ===== */}
      <div className="toggle_btn">
        <div className="logo">
          <button
            className="logoBtn"
            onClick={() => go("home")}
            aria-label="Home"
          >
            <img
              className="rat"
              src="assets/avatar no background.png"
              alt="Logo"
            />
          </button>
        </div>

        <button
          className="menuIcon"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="dropdownMenu"
        >
          <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-bars"}`} />
        </button>
      </div>

      {/* ===== DROPDOWN MENU ===== */}
      <nav className={`dropdown_menu ${isOpen ? "is-open" : ""}`} id="dropdownMenu">
  <ul className="dropdown_list">
    {menuItems.map((item) => (
      <li key={item.key}>
        <button
          className={`navLink retro-title ${page === item.key ? "active" : ""}`}
          onClick={() => go(item.key)}
        >
          {item.name}
        </button>
      </li>
    ))}

    <li>
      <a
        className="action_btn retro-title"
        href="mailto:sam@cruzcodes.com?subject=Hello, Sam!&body=I saw your portfolio and wanted to reach out."
        onClick={() => setIsOpen(false)}   // closes menu on tap
      >
        CONTACT ME!
      </a>
    </li>
  </ul>
</nav>


    </header>
  );
}