# CruzCodes.com

Welcome to my portfolio website! I'm Sam Cruz, a software engineer and aspiring product manager studying Information Science and Cognitive Science at Cornell. This is where I show off my projects, games, and 3D prints.

## About the Website

CruzCodes.com is a front-end portfolio built with **React** (Create React App). It has:

- **Home**: my name and an illustrated portrait whose eye follows your cursor 👀
- **About**: a quick intro, "My Story" (a p5.js road trip you can **Play**, or switch to **Read** for the plain list), and a 3D printing gallery (click any photo to see it big)
- **Projects**: a skills carousel, my "Selected Projects" in a hand-picked order, and a collapsible "More Projects" list, all filterable by Game, Web, Mobile, and AI

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
  tag: "Web",                 // one of projectTags: "Game" | "Web" | "Mobile" | "AI"
  alsoTags: ["AI"],           // optional: also show up under these filter tabs
  section: "selected",        // "selected" (main list) or "more" (the collapsible More Projects)
  rank: 11,                   // order inside its section (the order is hand-picked, not by date)
  featured: 3,                // optional: 1-3 puts it in the Featured tiles on Home
  legacyIds: ["project-old-name"], // optional: old card ids that should still open this card
  status: "Coming Soon",      // optional: small note shown when there are no buttons
  role: "Software Engineer",  // optional
  ongoing: true,              // optional: stuff I'm still working on sorts first
  date: "2026-09-01",         // just a note; the order comes from section + rank
  dateLabel: "Sep 2026 – Present",
  description: "One or two sentences.",
  image: { src: "assets/projects/my-project.webp", width: 853, height: 480, alt: "What the image shows, concisely" },
  gallery: [/* optional extra screenshots, same shape as printGallery photos in data.js */],
  // No screenshot yet? Use imagePlaceholder: "what it will show" instead of image, add a
  // TODO with the exact filename, and add a row to IMAGE_REQUESTS.md.
  stack: ["React", "TypeScript"],
  viewLink: "https://…",      // leave "" to hide the button
  githubLink: "",
}
```

## Image Rules I Follow

- Full-size originals go in `design/source-images/`. That folder never gets bundled into the site (only `public/` and `src/` do), and builds don't touch it.
- Resize first: about 2x the biggest size it shows up at. Project card pictures are 240px tall on screen (so 480px tall files), gallery thumbnails are 320px wide, in-card screenshots are 640px wide with a 1600px "-large" version for the big viewer, and the big shelf photo has 640 / 1280 / 2000px versions (`srcSet`) so phones get the small one.
- WebP for screenshots and photos. The link-preview image (`public/assets/og-image.jpg`, 1200×630) stays a JPG.
- File names are lowercase with hyphens and no spaces, like `my-project.webp`.
- Every image gets `width`, `height`, and real `alt` text (`alt=""` if it's just decoration).

## My Story (Play / Read)

- The story lives in one array, `journey` in `src/data.js`. **Play My Story** and **Read My Story** both render from it, so they never drift apart. Add or edit a checkpoint there (the map is built for six; see `journeyRoute.js` if the count changes).
- Code is in `src/components/journey/`. React owns the state (selected checkpoint, mode) and all the text, buttons, and links. The p5.js canvas (`journeySketch.js`) only draws the road and drives the car, and it's decorative (`aria-hidden`).
- p5.js is loaded on demand (`loadSketch.js`) once the map is near the screen, as its own download, so it never touches the other pages. The sketch is `noLoop()` except while the car is moving.
- If p5 can't load, Play shows plain checkpoint buttons and the same cards instead.

## Credits

- **DGA Studios art:** The Veil Sur key art and in-game screenshots are by our DGA Studios *Veil Sur* team, and the Duke vs. The Gang key art and in-game screenshots are by the DGA Studios *Duke vs. The Gang* team.
- **CourseLynx:** the collage is made from CourseLynx App Store screenshots (courselynx.com).
- **Lerly Liz Studios:** the screenshot shows a painting © Lerly Liz Studios.
- **Cornell Med in Black:** the screenshot is of medinblackcornell.github.io; the photos in it belong to Med in Black at Cornell.
- **Team projects:** the PPAC, Alaska Children's Trust, and Ithaca Community Recovery images come from my Hack4Impact Cornell team projects. Photos and logos in them belong to those organizations.
- **Skill icons:** [Devicon](https://devicon.dev) (MIT). I recolored the Unity icon, and the React Native icon is Devicon's React logo inside a phone outline.
- **UI icons:** [Font Awesome Free](https://fontawesome.com) SVGs (CC BY 4.0), inlined in `src/components/Icon.jsx`.
- **Fonts:** [VT323](https://fonts.google.com/specimen/VT323) and [Space Mono](https://fonts.google.com/specimen/Space+Mono) from Google Fonts (SIL Open Font License).
- Every outside image also has a `Source:` comment right next to it in the code.

## Technologies Used

- **React**: The core framework used to build this website.
- **p5.js**: Draws the "Play My Story" road trip (loaded only when needed).
- **CSS/HTML**: For styling and layout.
- **JavaScript**: For interactivity and dynamic content.
