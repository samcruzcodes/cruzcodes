// Everything on my site lives here! New project? Add it to `projects` and drop
// the screenshot in public/assets/projects/ (image rules are in the README).
// Anything I didn't make myself gets a "Source:" note, and the DGA Studios art
// is credited in the README too.

export const contact = {
  email: "sjc365@cornell.edu",
  mailto:
    "mailto:sjc365@cornell.edu?subject=" +
    encodeURIComponent("Hello, Sam!") +
    "&body=" +
    encodeURIComponent("I saw your portfolio and wanted to reach out."),
  linkedin: "https://www.linkedin.com/in/samanthajcruz/",
  github: "https://github.com/samcruzcodes",
};

// Text can be a plain string or a mix of strings + { text, href } links (RichText.jsx handles it).
export const about = {
  intro: [
    "I'm Samantha Cruz, a software engineer and aspiring product manager at Cornell studying Information Science and Cognitive Science, with a minor in Game Design. Ever since my first educational game in high school, I've loved creating interactive experiences that make complex ideas feel approachable and fun. I've built across the stack, from ",
    { text: "a campus app used by 40K+ students", href: "https://courselynx.com" },
    " to ",
    { text: "AI tools for researchers", href: "https://gpt-abstract-assistant.vercel.app/" },
    ", and I lead ",
    { text: "a 24-person game team at DGA Studios", href: "https://github.com/cornelldga/Veil-Sur" },
    ". I'm always up for collaborating at the intersection of EdTech, games, and product, so let's connect!",
  ],
  orgs: [
    { name: "Latinas Promoviendo Comunidad / Lambda Pi Chi Sorority, Inc.", href: "https://www.lambdapichi.org" },
    { name: "Hack4Impact", href: "https://cornellh4i.org" },
    { name: "DGA Studios", href: "https://dga-official-website.vercel.app/index.html" },
  ],
  photo: {
    src: "assets/sam-headshot.webp",
    width: 672,
    height: 649,
    alt: "Samantha smiling in glasses and a black Lambda Pi Chi jacket, seated on stone steps",
  },
};

// My Story carousel on the About page, oldest → newest.
export const story = [
  {
    year: "2020",
    text: [
      "Quarantine got me hooked on 3D printing, and I've been collecting ",
      { text: "3D Benchies", href: "https://www.3dbenchy.com" },
      " ever since.",
    ],
    image: {
      src: "assets/story/3d-printing-shelf.webp",
      width: 640,
      height: 360,
      alt: "Wall shelf of colorful 3D prints, with an inset of my 3D printer mid-print",
    },
  },
  {
    year: "2021–2023",
    text: "A 25-hour school project turned into Turtleburg, my first educational game: an RPG about the global water crisis.",
    image: {
      src: "assets/story/turtleburg.webp",
      width: 640,
      height: 360,
      alt: "Turtleburg's pixel-art title screen with a Clean Plumbing van",
    },
  },
  {
    year: "Summer 2023",
    text: "Kode With Klossy introduced me to web dev and design, and I built my first site, EdVisor.",
    image: {
      src: "assets/story/edvisor.webp",
      width: 640,
      height: 358,
      alt: "EdVisor homepage art: a composition notebook labeled EdVisor beside a pencil and phone",
    },
  },
  {
    year: "Summer 2023",
    text: [
      "At ",
      // GWC took down the old SIP page, so this points to their programs page.
      { text: "Girls Who Code's Summer Immersion Program", href: "https://girlswhocode.com/programs" },
      ", I leveled up my game dev skills by building ",
      { text: "Cheezy Conundrum", href: "https://cruzcodes.itch.io/cheezy-conundrum" },
      " in p5.js.",
    ],
    image: {
      src: "assets/projects/cheezy-conundrum.webp",
      width: 853,
      height: 480,
      alt: "Cheezy Conundrum title screen: a white rat peeking out of a trash can",
    },
  },
  {
    year: "Fall 2024",
    text: "I pledged Alpha Phi Omega, which pushed me to grow as a leader and give back through service.",
    image: {
      // Source: Alpha Phi Omega Gamma Chapter rush flyer.
      src: "assets/story/apo-rush.webp",
      width: 640,
      height: 408,
      alt: "Alpha Phi Omega rush flyer with photos of members making Meals on Wheels placemats",
    },
  },
  {
    year: "Spring 2025",
    text: "Tutoring CS sharpened my fundamentals and taught me how to explain tricky concepts clearly.",
    image: {
      // Source: screenshot of my Varsity Tutors profile (varsitytutors.com).
      src: "assets/story/tutoring.webp",
      width: 640,
      height: 456,
      alt: "My Varsity Tutors profile card listing JavaScript and AP Computer Science Principles",
    },
  },
  {
    year: "Fall 2025",
    text: "I pledged Latinas Promoviendo Comunidad / Lambda Pi Chi Sorority, Inc., and found my community at Cornell.",
    image: {
      // Source: Lambda Pi Chi chapter photo.
      src: "assets/story/lambda-pi-chi.webp",
      width: 640,
      height: 468,
      alt: "Fall 2025 line in line shirts in front of the chapter banner",
    },
  },
];

// These become the filter tabs on the Projects page (in this order).
export const projectTags = ["Game", "Web", "Mobile"];

// How sorting works: anything I'm still working on (`ongoing: true`) goes first,
// newest start date first. Everything else is sorted by end date.
// So `date` = start date if ongoing, end date if not. `dateLabel` is what shows on the card.
// `image` width/height = the file's real pixel size (keeps the page from jumping while it loads).
export const projects = [
  {
    title: "The Veil Sur",
    tag: "Game",
    role: "Project Lead",
    ongoing: true,
    date: "2026-08-01",
    dateLabel: "Aug 2026 – Present",
    description:
      "Project Lead of a 24-person DGA Studios team building a photography-driven stealth-horror game. I own the roadmap and run weekly sprints across art, programming, design, and audio.",
    image: {
      // Source: key art by our DGA Studios Veil Sur team (credited in the README).
      src: "assets/projects/the-veil-sur.webp",
      width: 865,
      height: 480,
      alt: "The Veil Sur key art: a camera-headed character beside shadowy creatures, under the game's logo",
    },
    stack: ["Unity", "C#", "GitHub", "Milanote"],
    viewLink: "",
    githubLink: "https://github.com/cornelldga/Veil-Sur",
  },
  {
    title: "CourseLynx",
    tag: "Mobile",
    role: "Mobile Engineer",
    ongoing: true,
    date: "2026-06-01",
    dateLabel: "Jun 2026 – Present",
    description:
      "Mobile engineer on a student chat app used by 40K+ students across 18 schools. Built student organizations, redesigned course search with token aliasing so cross-listed courses resolve to one chat, and led messaging and profile overhauls.",
    image: {
      // Source: CourseLynx App Store screenshots (courselynx.com), stitched into one collage.
      src: "assets/projects/courselynx.webp",
      width: 794,
      height: 480,
      alt: "Three CourseLynx app screens: .edu sign-up, a list of class group chats, and course search",
    },
    stack: ["React Native", "Expo", "TypeScript", "Firebase"],
    viewLink: "https://courselynx.com",
    githubLink: "",
  },
  {
    title: "Lerly Liz Studios",
    tag: "Web",
    role: "Freelance Web Developer",
    date: "2026-07-01",
    dateLabel: "Jul 2026",
    description:
      "In one month, I built the full website for Lerly Liz Studios, an artist's shop for custom hand-painted acrylic pet portraits. It includes an admin portal so the owner can edit the site's content herself without touching code.",
    image: {
      // Source: screenshot of the site I built (lerlylizstudios.github.io); painting © Lerly Liz Studios.
      src: "assets/projects/lerly-liz-studios.webp",
      width: 843,
      height: 480,
      alt: "Lerly Liz Studios homepage: “Your pet, in bold color” beside a colorful acrylic dog portrait",
    },
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "GitHub Pages"],
    viewLink: "https://lerlylizstudios.github.io/",
    githubLink: "https://github.com/lerlylizstudios/lerlylizstudios.github.io",
  },
  {
    title: "H4I — PPAC Healthcare Platform",
    tag: "Web",
    date: "2026-05-01",
    dateLabel: "Jan–May 2026",
    description:
      "Built a full-stack healthcare platform for the Pelvic Pain Association of Cornell, featuring provider search, resource discovery, and an AI chatbot with retrieval-augmented generation.",
    image: {
      // Source: screenshot of the PPAC site our Hack4Impact Cornell team built; photo © PPAC.
      src: "assets/projects/ppac.webp",
      width: 788,
      height: 480,
      alt: "PPAC homepage with the headline “End the silence around chronic pelvic pain” and a group photo",
    },
    stack: ["React", "TypeScript", "Node.js", "MongoDB", "OpenAI API"],
    viewLink: "",
    githubLink: "https://github.com/cornellh4i/PPAC",
  },
  {
    title: "Duke vs. The Gang",
    tag: "Game",
    date: "2026-05-01",
    dateLabel: "Sep 2025 – May 2026",
    description:
      "A free-to-play Wild West bullet hell created with DGA Studios at Cornell. Fight eccentric bosses, experiment with drink-based combat, and defend your saloon from a growing bar empire.",
    image: {
      // Source: key art by the DGA Studios Duke vs. The Gang team (credited in the README).
      src: "assets/projects/duke-vs-the-gang.webp",
      width: 605,
      height: 480,
      alt: "Duke vs. The Gang key art: the Wild West cast in a comic-style brawl",
    },
    stack: ["Unity", "C#", "Trello"],
    viewLink: "https://store.steampowered.com/app/4662580/Duke_vs_The_Gang/",
    githubLink: "",
  },
  {
    title: "Cure Academy",
    tag: "Web",
    role: "Freelance Web Developer",
    date: "2026-05-01",
    dateLabel: "May 2026",
    description:
      "Built the full-stack website for Cure Academy, a nonprofit empowering the next generation of cancer scientists and physicians through education, research, and mentorship.",
    image: {
      src: "assets/projects/cure-academy.webp",
      width: 918,
      height: 480,
      alt: "Cure Academy homepage headline: “Empowering the next generation of cancer scientists and physicians”",
    },
    viewLink: "https://cureacademy.github.io",
    githubLink: "https://github.com/cureacademy/CureAcademy.github.io/",
  },
  {
    title: "H4I — Alaska Children's Trust",
    tag: "Mobile",
    date: "2025-12-01",
    dateLabel: "Sep–Dec 2025",
    description:
      "Helped transform ACT’s online safety decks into an engaging mobile app, making digital safety lessons easier and more fun for kids to use.",
    image: {
      // Source: Hack4Impact Cornell ACT project graphic; logos © Alaska Children's Trust and Hack4Impact.
      src: "assets/projects/act.webp",
      width: 776,
      height: 450,
      alt: "ACT Conversation Cards app on a phone beside the Alaska Children's Trust and Hack4Impact logos",
    },
    stack: ["React Native", "NativeWind", "Expo", "Figma"],
    viewLink: "https://play.google.com/store/apps/details?id=org.alaskachildrenstrust.act",
    githubLink: "https://github.com/cornellh4i/act",
  },
  {
    title: "ThinkDraft AI",
    tag: "Web",
    date: "2025-08-01",
    dateLabel: "Summer 2025",
    description:
      "Led the development of an AI sidekick helping ~3,000 research students a year turn raw research into polished abstracts, notecards, and poster-ready presentations.",
    image: {
      src: "assets/projects/thinkdraft.webp",
      width: 878,
      height: 480,
      alt: "ThinkDraft AI welcome screen with Create Abstract, Design Poster, and Generate Script buttons",
    },
    stack: ["React", "Tailwind", "Python", "OpenAI API", "Docker"],
    viewLink: "https://gpt-abstract-assistant.vercel.app/",
    githubLink: "",
  },
  {
    title: "H4I — Ithaca Community Recovery",
    tag: "Web",
    date: "2025-05-01",
    dateLabel: "Jan–May 2025",
    description:
      "Supported ~30,000 people each year by building ICR's platform with a 10-person team, including the event calendar design, Zoom integration, recurring-event scheduling in MongoDB, and admin tools for volunteers.",
    image: {
      // Source: screenshot of the ICR platform our Hack4Impact Cornell team built.
      src: "assets/projects/ithaca-community-recovery.webp",
      width: 711,
      height: 480,
      alt: "ICR scheduler showing a day calendar of color-coded meetings by room",
    },
    stack: ["TypeScript", "Next.js", "MongoDB", "Prisma"],
    viewLink: "https://ithaca-recovery.vercel.app/",
    githubLink: "https://github.com/cornellh4i/ithaca-recovery",
  },
  {
    title: "Circle K Website",
    tag: "Web",
    date: "2025-02-01",
    dateLabel: "2025",
    description:
      "Built the official Circle K International website at Cornell, improving online presence and engagement for student volunteers.",
    image: {
      // Source: screenshot of circlekatcornell.org; group photo © Circle K at Cornell.
      src: "assets/projects/circle-k.webp",
      width: 883,
      height: 480,
      alt: "Circle K at Cornell homepage with a member group photo and the motto “Service. Leadership. Fellowship.”",
    },
    stack: ["React", "Bootstrap", "Fly.io"],
    viewLink: "https://circlekatcornell.org",
    githubLink: "",
  },
  {
    title: "Budget Planner",
    tag: "Web",
    date: "2024-06-01",
    dateLabel: "2024",
    description:
      "Developed an AI-powered budgeting app providing real-time insights and personalized recommendations to simplify budgeting.",
    image: {
      src: "assets/projects/budget-planner.webp",
      width: 892,
      height: 480,
      alt: "Budget Planner with monthly income and expense inputs beside budget-tracking progress bars",
    },
    stack: ["TypeScript", "Express", "React", "Bootstrap", "Fly.io", "Docker"],
    viewLink: "https://budget.cruzcodes.com",
    githubLink: "https://github.com/samcruzcodes/budget.io",
  },
  {
    title: "APO Gamma Website",
    tag: "Web",
    date: "2024-04-01",
    dateLabel: "2024",
    description:
      "Created the official Alpha Phi Omega Gamma Chapter website at Cornell to streamline member engagement and online presence.",
    image: {
      // Source: screenshot of apogamma.org; campus photo from the APO Gamma site.
      src: "assets/projects/apo-gamma.webp",
      width: 884,
      height: 480,
      alt: "Alpha Phi Omega Gamma Chapter homepage over an aerial photo of Cornell's campus",
    },
    stack: ["React", "Bootstrap", "Fly.io"],
    viewLink: "https://www.apogamma.org",
    githubLink: "https://github.com/apogamma/apogamma",
  },
  {
    title: "Sandy Shores",
    tag: "Game",
    date: "2024-02-01",
    dateLabel: "Feb 2024",
    description:
      "A learn-then-play experience: an educational website on shoreline erosion paired with a game where players put that knowledge to work through interactive sandcastle mechanics.",
    image: {
      src: "assets/projects/sandy-shores.webp",
      width: 881,
      height: 480,
      alt: "Sandcastle Tycoon title screen: a beach between palm trees with Play and How to Play buttons",
    },
    stack: ["JavaScript", "p5.js", "Aseprite", "repl.it"],
    viewLink: "https://sandyshorescm.github.io/",
    githubLink: "https://github.com/SandyShoresCM/sandyshores",
  },
  {
    title: "Cheezy Conundrum",
    tag: "Game",
    date: "2023-08-01",
    dateLabel: "Summer 2023",
    description:
      "Help Timmy and Tommy chase cheese and dodge traps in this single-player puzzle game — control two rats with one keyboard to lead them to freedom!",
    image: {
      src: "assets/projects/cheezy-conundrum.webp",
      width: 853,
      height: 480,
      alt: "Cheezy Conundrum title screen: a white rat peeking out of a trash can below the game's logo",
    },
    stack: ["JavaScript", "p5.js", "Aseprite", "repl.it"],
    viewLink: "https://cruzcodes.itch.io/cheezy-conundrum",
    githubLink: "https://github.com/samcruzcodes/Cheezy-Conundrum",
  },
  {
    title: "Turtleburg",
    tag: "Game",
    date: "2021-02-01",
    dateLabel: "2021–2023",
    description:
      "Educational RPG exploring the global water crisis through narrative-driven gameplay, letting players learn by making meaningful choices.",
    image: {
      src: "assets/projects/turtleburg.webp",
      width: 646,
      height: 381,
      alt: "Turtleburg's pixel-art title screen: a character driving a Clean Plumbing van",
    },
    stack: ["Godot", "GDScript", "Python", "Aseprite"],
    viewLink: "",
    githubLink: "https://github.com/samcruzcodes/Turtleburg",
  },
];

// Sorted by what I use the most right now.
// Source: Devicon icons (MIT, https://devicon.dev). I recolored Unity so it shows up on
// the dark background, and React Native is Devicon's React atom inside a phone outline.
export const skills = [
  { name: "TypeScript", icon: "typescript" },
  { name: "React", icon: "react" },
  { name: "Unity", icon: "unity" },
  { name: "C#", icon: "csharp" },
  { name: "React Native", icon: "react-native" },
  { name: "MongoDB", icon: "mongodb" },
  { name: "Firebase", icon: "firebase" },
  { name: "Docker", icon: "docker" },
  { name: "Python", icon: "python" },
  { name: "Next.js", icon: "nextjs" },
  { name: "Figma", icon: "figma" },
  { name: "JavaScript", icon: "javascript" },
  { name: "Godot", icon: "godot" },
  { name: "FastAPI", icon: "fastapi" },
  { name: "SQL", icon: "sql" },
];

// Photos of my 3D prints! `large` is the bigger version that opens when you click
// a photo (about 2x the viewer size, and it only loads when someone opens it).
export const printGallery = {
  hero: {
    src: "gallery/shelf-display.webp",
    width: 2400,
    height: 1024,
    label: "Shelf Display",
    alt: "Wall shelf lined with dozens of colorful 3D prints",
    large: { src: "gallery/shelf-display.webp", width: 2400, height: 1024 },
  },
  thumbs: [
    {
      src: "gallery/darth-vader.webp",
      width: 320,
      height: 326,
      label: "Darth Vader",
      alt: "3D-printed Darth Vader bust",
      large: { src: "gallery/large/darth-vader.webp", width: 1378, height: 1403 },
    },
    {
      src: "gallery/dog-portrait.webp",
      width: 320,
      height: 330,
      label: "Dog Portrait",
      alt: "Lace-style 3D-printed portrait of a group of dogs",
      large: { src: "gallery/large/dog-portrait.webp", width: 1395, height: 1440 },
    },
    {
      src: "gallery/banana.webp",
      width: 320,
      height: 385,
      label: "Banana",
      alt: "3D-printed banana character figure",
      large: { src: "gallery/large/banana.webp", width: 1196, height: 1440 },
    },
    {
      src: "gallery/misc-shelf.webp",
      width: 320,
      height: 256,
      label: "Misc Shelf",
      alt: "Shelf of colorful 3D-printed flexible animals",
      large: { src: "gallery/large/misc-shelf.webp", width: 500, height: 400 },
    },
    {
      src: "gallery/dragon-ball.webp",
      width: 320,
      height: 346,
      label: "Dragon Ball",
      alt: "3D-printed Goku figure on a Dragon Ball base",
      large: { src: "gallery/large/dragon-ball.webp", width: 1280, height: 1382 },
    },
    {
      src: "gallery/kuchi-kopi.webp",
      width: 320,
      height: 373,
      label: "Kuchi Kopi",
      alt: "3D-printed Kuchi Kopi figure",
      large: { src: "gallery/large/kuchi-kopi.webp", width: 1235, height: 1440 },
    },
    {
      src: "gallery/autumn-dragon.webp",
      width: 320,
      height: 218,
      label: "Autumn Dragon",
      alt: "Large articulated 3D-printed dragon in green",
      large: { src: "gallery/large/autumn-dragon.webp", width: 2048, height: 1392 },
    },
    {
      src: "gallery/hollow-dragon.webp",
      width: 320,
      height: 166,
      label: "Hollow Dragon",
      alt: "Red articulated 3D-printed dragon with spread wings",
      large: { src: "gallery/large/hollow-dragon.webp", width: 1651, height: 859 },
    },
    {
      src: "gallery/imperial-dragon.webp",
      width: 320,
      height: 207,
      label: "Imperial Dragon",
      alt: "Yellow articulated 3D-printed imperial dragon",
      large: { src: "gallery/large/imperial-dragon.webp", width: 1511, height: 977 },
    },
    {
      src: "gallery/family-portrait.webp",
      width: 320,
      height: 190,
      label: "Family Portrait",
      alt: "3D-printed line-art family portrait spelling “Family”",
      large: { src: "gallery/large/family-portrait.webp", width: 1938, height: 1149 },
    },
    {
      src: "gallery/flexible-dinosaurs.webp",
      width: 320,
      height: 194,
      label: "Flexible Dinosaurs",
      alt: "Three flexible 3D-printed dinosaurs in gray, purple, and green",
      large: { src: "gallery/large/flexible-dinosaurs.webp", width: 2015, height: 1222 },
    },
    {
      src: "gallery/among-us.webp",
      width: 320,
      height: 209,
      label: "Among Us Display",
      alt: "Display of 3D-printed Among Us crewmates",
      large: { src: "gallery/large/among-us.webp", width: 1505, height: 985 },
    },
    {
      src: "gallery/evil-minion.webp",
      width: 320,
      height: 407,
      label: "Evil Minion",
      alt: "Purple 3D-printed Evil Minion",
      large: { src: "gallery/large/evil-minion.webp", width: 1131, height: 1440 },
    },
    {
      src: "gallery/crystal-dragon.webp",
      width: 320,
      height: 330,
      label: "Crystal Dragon",
      alt: "Yellow articulated 3D-printed crystal dragon held in a hand",
      large: { src: "gallery/large/crystal-dragon.webp", width: 1396, height: 1440 },
    },
    {
      src: "gallery/bob-the-minion.webp",
      width: 320,
      height: 427,
      label: "Bob the Minion",
      alt: "3D-printed Bob the Minion figure",
      large: { src: "gallery/large/bob-the-minion.webp", width: 1080, height: 1440 },
    },
    {
      src: "gallery/frenchy-face.webp",
      width: 320,
      height: 365,
      label: "Frenchy Face",
      alt: "Geometric 3D-printed French bulldog face wall art",
      large: { src: "gallery/large/frenchy-face.webp", width: 1264, height: 1440 },
    },
    {
      src: "gallery/coco-lithophane.webp",
      width: 320,
      height: 381,
      label: "Coco Lithophane",
      alt: "Backlit 3D-printed lithophane of a French bulldog",
      large: { src: "gallery/large/coco-lithophane.webp", width: 700, height: 833 },
    },
    {
      src: "gallery/frenchy-buddha.webp",
      width: 320,
      height: 360,
      label: "Frenchy Buddha",
      alt: "3D-printed French bulldog Buddha statue",
      large: { src: "gallery/large/frenchy-buddha.webp", width: 1281, height: 1440 },
    },
  ],
};
