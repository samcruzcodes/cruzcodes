# CruzCodes.com

Welcome to my portfolio website! I'm Sam Cruz, a software engineer and aspiring product manager studying Information Science and Cognitive Science at Cornell. This is where I show off my projects, games, and 3D prints.

## About the Website

CruzCodes.com is a front-end portfolio built with **React** (Create React App). It has:

- **Home**: my name and an illustrated portrait whose eye follows your cursor 👀
- **About**: a quick intro, my "My Story" carousel, and a 3D printing gallery (click any photo to see it big)
- **Projects**: a skills carousel plus all my projects, filterable by Game, Web, and Mobile

## Running It Locally

```bash
npm install
npm start        # dev server at http://localhost:3000
npm run build    # production build in build/
npm run deploy   # builds and publishes build/ to the gh-pages branch
```

## Adding a Project

Everything lives in `src/data.js`, so a new project is just a new object in `projects`:

```js
{
  title: "My Project",
  tag: "Web",                 // one of projectTags: "Game" | "Web" | "Mobile"
  role: "Software Engineer",  // optional
  ongoing: true,              // optional: stuff I'm still working on sorts first
  date: "2026-09-01",         // sort key (start date if ongoing, end date if not)
  dateLabel: "Sep 2026 – Present",
  description: "One or two sentences.",
  image: { src: "assets/projects/my-project.webp", width: 853, height: 480, alt: "What the image shows, concisely" },
  stack: ["React", "TypeScript"],
  viewLink: "https://…",      // leave "" to hide the button
  githubLink: "",
}
```

## Image Rules I Follow

- Full-size originals go in `design/source-images/`. That folder never gets bundled into the site (only `public/` and `src/` do), and builds don't touch it.
- Resize first: about 2x the biggest size it shows up at. Project cards fit within 960×480, and gallery thumbnails are 320px wide.
- WebP for screenshots and photos. The link-preview image (`public/assets/og-image.jpg`, 1200×630) stays a JPG.
- File names are lowercase with hyphens and no spaces, like `my-project.webp`.
- Every image gets `width`, `height`, and real `alt` text (`alt=""` if it's just decoration).

## Credits

- **DGA Studios art:** The Veil Sur key art is by our DGA Studios *The Veil Sur* team, and the Duke vs. The Gang key art is by the DGA Studios *Duke vs. The Gang* team.
- **CourseLynx:** the collage is made from CourseLynx App Store screenshots (courselynx.com).
- **Lerly Liz Studios:** the screenshot shows a painting © Lerly Liz Studios.
- **Team projects:** the PPAC, Alaska Children's Trust, and Ithaca Community Recovery images come from my Hack4Impact Cornell team projects. Photos and logos in them belong to those organizations.
- **Skill icons:** [Devicon](https://devicon.dev) (MIT). I recolored the Unity icon, and the React Native icon is Devicon's React logo inside a phone outline.
- **UI icons:** [Font Awesome Free](https://fontawesome.com) SVGs (CC BY 4.0), inlined in `src/components/Icon.jsx`.
- **Fonts:** [VT323](https://fonts.google.com/specimen/VT323) and [Space Mono](https://fonts.google.com/specimen/Space+Mono) from Google Fonts (SIL Open Font License).
- Every outside image also has a `Source:` comment right next to it in the code.

## Technologies Used

- **React**: The core framework used to build this website.
- **CSS/HTML**: For styling and layout.
- **JavaScript**: For interactivity and dynamic content.
