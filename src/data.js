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
    ". I've also taught game dev at Girls Who Code, TA'd Cornell's intro CS course, and taught English in Tokyo. I'm always up for collaborating at the intersection of EdTech, games, and product, so let's connect!",
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

// My Story (the road trip on the About page) is the `journey` array further down, after `projects`.

// These become the filter tabs on the Projects page (in this order).
// A project has one main `tag`, and can show up under more tabs with `alsoTags` (e.g. ["AI"]).
export const projectTags = ["Game", "Web", "Mobile", "AI"];

// How the Projects page is ordered (on purpose: recruiter-focused, not by date):
//   section: "selected" -> the main "Selected Projects" list, or "more" -> the "More Projects" list
//   rank:    1, 2, 3... the order inside its section (filters keep this order)
//   featured: 1, 2, 3 (optional) -> the three Featured tiles on Home, in that order
// `date` and `ongoing` are no longer used for sorting; they're just notes about when I worked on it.
// `dateLabel` is what shows on the card.
// `image` width/height = the file's real pixel size (keeps the page from jumping while it loads).
// `gallery` = extra screenshots under the card (same shape as printGallery photos; they open in
// the big viewer). `imagePlaceholder: "what it will show"` is the fallback when there's no image
// yet: add a TODO with the exact filename and a row in IMAGE_REQUESTS.md.
// `legacyIds` = old card ids (from before a rename) that should still open the right card.
// `status` shows a small note (like "Coming Soon") where the buttons would be.

// Stable id for a project's card (also its link target): "Veil Sur" -> "project-veil-sur".
export const projectId = (title) =>
  "project-" +
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Finds a project from a card id like "project-veil-sur" (or one of its old `legacyIds`).
export const findProjectById = (id) =>
  projects.find((p) => projectId(p.title) === id || p.legacyIds?.includes(id));

export const projects = [
  {
    title: "Veil Sur",
    section: "selected",
    rank: 2,
    featured: 2,
    legacyIds: ["project-the-veil-sur"],
    tag: "Game",
    role: "Project Lead",
    ongoing: true,
    date: "2026-08-01",
    dateLabel: "Aug 2026 – Present",
    description:
      "I lead a 24-person Cornell team at DGA Studios building a Unity stealth-investigation game where players use photography to solve puzzles. I own the roadmap and run weekly sprints across art, programming, design, and audio.",
    image: {
      // Source: key art by our DGA Studios Veil Sur team (credited in the README).
      src: "assets/projects/the-veil-sur.webp",
      width: 865,
      height: 480,
      alt: "Veil Sur key art: a camera-headed character beside shadowy creatures, under the game's logo",
    },
    stack: ["Unity", "C#", "GitHub", "Milanote"],
    viewLink: "",
    githubLink: "https://github.com/cornelldga/Veil-Sur", // checked Nov 2026: public repo
    // Screenshots from the game (originals are in design/source-images/). thumb = gallery tile,
    // large = the big viewer.
    gallery: [
      {
        src: "assets/projects/veilsur-in-game1.webp",
        width: 640,
        height: 358,
        label: "Veil Sur: HQ reception",
        alt: "Veil Sur in-game reception room with an eye-logo desk and a dialogue box from HQ saying you're in the reception of OYO HQ",
        large: { src: "assets/projects/veilsur-in-game1-large.webp", width: 1480, height: 828 },
      },
      {
        src: "assets/projects/veilsur-in-game2.webp",
        width: 640,
        height: 361,
        label: "Veil Sur: document mode",
        alt: "Veil Sur in document mode: a camera-viewfinder overlay with the prompt “Open your notebook again.” and a white document panel noting “TODO: Government inspector on 04/04”",
        large: { src: "assets/projects/veilsur-in-game2-large.webp", width: 1374, height: 776 },
      },
      {
        src: "assets/projects/veilsur-in-game3.webp",
        width: 640,
        height: 351,
        label: "Veil Sur: photo-linking puzzle",
        alt: "Veil Sur puzzle screen with the questions “What day is it today?” and “What is the elevator code?” linked to empty photo slots",
        large: { src: "assets/projects/veilsur-in-game3-large.webp", width: 1600, height: 879 },
      },
    ],
  },
  {
    title: "Budget.io Watchdog",
    section: "selected",
    rank: 3,
    featured: 3,
    tag: "Web",
    alsoTags: ["AI"],
    role: "Solo Project",
    ongoing: true,
    date: "2026-10-01",
    dateLabel: "Oct 2026 – Present",
    description:
      "Built a real-time fraud detection system with Java, Spring Boot, Kafka, and PostgreSQL, using six detection rules. Tested reliability through Kubernetes recovery, scaling, and rolling updates, with zero lost transactions across 1,503 events.",
    image: {
      // Source: screenshot of my Budget.io Watchdog dashboard (original: design/source-images/watchdog-latency.png).
      src: "assets/projects/watchdog.webp",
      width: 795,
      height: 480,
      alt: "Budget.io Watchdog dashboard showing 14,868 transactions processed, 733 alerts raised, 56.3 per second throughput, and 7.9 ms median latency (p99 20 ms), above a table of precision and recall for each fraud rule",
    },
    stack: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Docker", "Kubernetes", "React"],
    viewLink: "",
    githubLink: "https://github.com/samcruzcodes/budget-io-watchdog",
  },
  {
    title: "CourseLynx",
    section: "selected",
    rank: 1,
    featured: 1,
    tag: "Mobile",
    role: "Mobile Engineer Intern → Engineer",
    ongoing: true,
    date: "2026-06-01",
    dateLabel: "Jun 2026 – Present",
    description:
      "Mobile engineer on a React Native chat app used by 40K+ students across 18 schools. Built student organizations, redesigned course search so cross-listed courses resolve to one chat, and led the messaging and profile overhauls.",
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
    section: "selected",
    rank: 8,
    tag: "Web",
    role: "Freelance Web Developer",
    date: "2026-07-01",
    dateLabel: "Jul 2026",
    description:
      "In one month, I built the website for Lerly Liz Studios, an artist's custom pet portrait shop, plus an admin portal so the owner can update the site herself without touching code.",
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
    section: "selected",
    rank: 4,
    tag: "Web",
    alsoTags: ["AI"],
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
    section: "selected",
    rank: 5,
    tag: "Game",
    date: "2026-05-01",
    dateLabel: "Sep 2025 – May 2026",
    description:
      "A free-to-play Wild West bullet hell made with DGA Studios at Cornell, with eccentric bosses and drink-based combat. I built a cutscene system that adapts to player state, plus modular dialogue, combat, and state management.",
    image: {
      // Source: key art by the DGA Studios Duke vs. The Gang team (credited in the README).
      src: "assets/projects/duke-vs-the-gang.webp",
      width: 605,
      height: 480,
      alt: "Duke vs. The Gang key art: the Wild West cast in a comic-style brawl",
    },
    // In-game screenshots (originals are in design/source-images/). Same setup as Veil Sur's.
    gallery: [
      {
        src: "assets/projects/duke-ingame-1.webp",
        width: 640,
        height: 358,
        label: "Duke vs. The Gang: Julius boss fight",
        alt: "Duke vs. The Gang boss fight against Julius, Manic Miner: a cowboy dodges red-circled dynamite on mine-cart tracks as an explosion goes off",
        large: { src: "assets/projects/duke-ingame-1-large.webp", width: 1600, height: 895 },
      },
      {
        src: "assets/projects/duke-ingame-2.webp",
        width: 640,
        height: 360,
        label: "Duke vs. The Gang: dialogue with Ash",
        alt: "Duke vs. The Gang dialogue scene: Ash, a red-haired character in a leafy hat, says “Duke, right? I know I'm in no position to ask for anything, but please. Granny's all I have.”",
        large: { src: "assets/projects/duke-ingame-2-large.webp", width: 1600, height: 899 },
      },
      {
        src: "assets/projects/duke-ingame-3.webp",
        width: 640,
        height: 359,
        label: "Duke vs. The Gang: Mirage & Ace boss fight",
        alt: "Duke vs. The Gang boss fight against Mirage & Ace, Dynamic Duo: a cowboy stands near a man in sunglasses on a theater stage with red curtains while knives with bows fly across the floor",
        large: { src: "assets/projects/duke-ingame-3-large.webp", width: 1600, height: 896 },
      },
    ],
    stack: ["Unity", "C#", "Trello"],
    viewLink: "https://store.steampowered.com/app/4662580/Duke_vs_The_Gang/",
    githubLink: "",
  },
  {
    title: "Cure Academy",
    section: "more",
    rank: 1,
    tag: "Web",
    role: "Freelance Web Developer",
    date: "2026-05-01",
    dateLabel: "May 2026",
    description:
      "Built the full-stack website for Cure Academy, a nonprofit empowering the next generation of cancer scientists and physicians through education, research, and mentorship.",
    image: {
      src: "assets/projects/cure-academy.webp",
      width: 660,
      height: 345,
      alt: "Cure Academy homepage headline: “Empowering the next generation of cancer scientists and physicians”",
    },
    viewLink: "https://cureacademy.github.io",
    githubLink: "https://github.com/cureacademy/CureAcademy.github.io/",
  },
  {
    title: "Cornell Med in Black Website",
    section: "selected",
    rank: 10,
    tag: "Web",
    role: "Freelance Web Developer",
    date: "2026-09-01",
    dateLabel: "Sep 2026 – Nov 2026",
    description: "An accessible, W3C-valid multi-page site for Cornell's Med in Black student org.",
    image: {
      // Source: screenshot of medinblackcornell.github.io; photos © Med in Black at Cornell.
      src: "assets/projects/medinblack.webp",
      width: 832,
      height: 480,
      alt: "Cornell Med in Black homepage: the headline “To Be Young, Gifted and Black” beside three group photos of members on an ice rink",
    },
    stack: ["HTML", "CSS"],
    viewLink: "https://medinblackcornell.github.io/index.html",
    githubLink: "https://github.com/medinblackcornell/medinblackcornell.github.io",
  },
  {
    title: "H4I — Alaska Children's Trust",
    section: "selected",
    rank: 7,
    tag: "Mobile",
    date: "2025-12-01",
    dateLabel: "Sep–Dec 2025",
    description:
      "Built an interactive dashboard for a mobile app that transforms ACT's online safety education materials into engaging, accessible resources.",
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
    section: "selected",
    rank: 6,
    tag: "Web",
    alsoTags: ["AI"],
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
    section: "selected",
    rank: 9,
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
    section: "more",
    rank: 6,
    tag: "Web",
    date: "2025-02-01",
    dateLabel: "2025",
    description:
      "Built the official Circle K International website at Cornell, improving online presence and engagement for student volunteers.",
    image: {
      // Source: screenshot of circlekatcornell.org; group photo © Circle K at Cornell.
      src: "assets/projects/circle-k.webp",
      width: 630,
      height: 342,
      alt: "Circle K at Cornell homepage with a member group photo and the motto “Service. Leadership. Fellowship.”",
    },
    stack: ["React", "Bootstrap", "Fly.io"],
    viewLink: "https://circlekatcornell.org",
    githubLink: "",
  },
  {
    title: "Budget Planner",
    section: "more",
    rank: 3,
    tag: "Web",
    date: "2024-06-01",
    dateLabel: "2024",
    description:
      "Developed an AI-powered budgeting app that gives real-time insights and personalized recommendations.",
    image: {
      src: "assets/projects/budget-planner.webp",
      width: 640,
      height: 344,
      alt: "Budget Planner with monthly income and expense inputs beside budget-tracking progress bars",
    },
    stack: ["JavaScript", "Node.js", "React", "Bootstrap", "Fly.io", "Docker"],
    viewLink: "https://budget.cruzcodes.com",
    githubLink: "https://github.com/samcruzcodes/budget.io",
  },
  {
    title: "APO Gamma Website",
    section: "more",
    rank: 7,
    tag: "Web",
    date: "2024-04-01",
    dateLabel: "2024",
    description:
      "Created the official Alpha Phi Omega Gamma Chapter website at Cornell to streamline member engagement and online presence.",
    image: {
      // Source: screenshot of apogamma.org; campus photo from the APO Gamma site.
      src: "assets/projects/apo-gamma.webp",
      width: 630,
      height: 342,
      alt: "Alpha Phi Omega Gamma Chapter homepage over an aerial photo of Cornell's campus",
    },
    stack: ["React", "Bootstrap", "Fly.io"],
    viewLink: "https://www.apogamma.org",
    githubLink: "https://github.com/apogamma/apogamma",
  },
  {
    title: "Sandcastle Tycoon",
    section: "more",
    rank: 4,
    tag: "Game",
    date: "2024-02-01",
    dateLabel: "Feb 2024",
    description:
      "A learn-then-play experience: an educational website on shoreline erosion paired with a game where players put that knowledge to work through interactive sandcastle mechanics.",
    image: {
      src: "assets/projects/sandy-shores.webp",
      width: 630,
      height: 343,
      alt: "Sandcastle Tycoon title screen: a beach between palm trees with Play and How to Play buttons",
    },
    stack: ["JavaScript", "p5.js", "Aseprite", "repl.it"],
    viewLink: "https://sandyshorescm.github.io/",
    githubLink: "https://github.com/SandyShoresCM/sandyshores",
  },
  {
    title: "Cheezy Conundrum",
    section: "more",
    rank: 5,
    tag: "Game",
    date: "2023-08-01",
    dateLabel: "Summer 2023",
    description:
      "Help Timmy and Tommy chase cheese and dodge traps in this single-player puzzle game — control two rats with one keyboard to lead them to freedom!",
    image: {
      src: "assets/projects/cheezy-conundrum.webp",
      width: 610,
      height: 343,
      alt: "Cheezy Conundrum title screen: a white rat peeking out of a trash can below the game's logo",
    },
    stack: ["JavaScript", "p5.js", "Aseprite", "repl.it"],
    viewLink: "https://cruzcodes.itch.io/cheezy-conundrum",
    githubLink: "https://github.com/samcruzcodes/Cheezy-Conundrum",
  },
  {
    title: "Turtleburg",
    section: "more",
    rank: 2,
    tag: "Game",
    date: "2021-02-01",
    dateLabel: "Oct 2022 – Feb 2023",
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

// My Story on the About page: the checkpoints on the "Play My Story" road AND the cards in
// "Read My Story" (JourneyMap + StoryCard both read this one array, oldest -> newest).
//   id:      stable key
//   title:   shown on the card and next to the checkpoint on the map
//   stage:   (optional) only when every sentence in the card fits that date range
//   text:    a string, or strings + { text, href } links (RichText.jsx)
//   image:   (optional) same shape as other images; or `imagePlaceholder: "what it will show"`
//            (needs a TODO with the exact filename + a row in IMAGE_REQUESTS.md)
//   links:   (optional) related projects. Pulled from `projects` so the URLs stay verified.
// Everything below comes from my old story cards, `about.intro`, and `projects`.
const projectLink = (title, kind, label) => {
  const project = projects.find((p) => p.title === title);
  return { label, href: kind === "live" ? project.viewLink : project.githubLink };
};

export const journey = [
  {
    id: "where-it-started",
    title: "Where It Started",
    stage: "2020",
    // TODO(content): this card is still just the 3D printing line. Add a sentence or two in my own
    // words about what I was making / playing before 2020 (see the questions in the Phase 4.1 notes).
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
    id: "learning-through-games",
    title: "Learning Through Games",
    stage: "2021–2024",
    text: [
      "A 25-hour school project turned into Turtleburg, my first educational game: an RPG about the global water crisis. I've loved creating interactive experiences that make complex ideas feel approachable and fun ever since. In Summer 2023, Kode With Klossy introduced me to web dev and design (I built my first site, EdVisor), and ",
      // GWC took down the old SIP page, so this points to their programs page.
      { text: "Girls Who Code's Summer Immersion Program", href: "https://girlswhocode.com/programs" },
      " helped me level up my game dev skills with Cheezy Conundrum, built in p5.js. Sandcastle Tycoon followed in early 2024: a shoreline-erosion website paired with a game.",
    ],
    image: {
      src: "assets/story/turtleburg.webp",
      width: 640,
      height: 360,
      alt: "Turtleburg's pixel-art title screen with a Clean Plumbing van",
    },
    links: [
      projectLink("Turtleburg", "github", "Turtleburg on GitHub"),
      projectLink("Cheezy Conundrum", "live", "Play Cheezy Conundrum"),
      projectLink("Sandcastle Tycoon", "live", "Play Sandcastle Tycoon"),
    ],
  },
  {
    id: "sharing-what-i-know",
    title: "Sharing What I Know",
    // TODO(content): the teaching jobs below have no dates yet, so they can't be put in order.
    text: "Tutoring CS in Spring 2025 sharpened my fundamentals and taught me how to explain tricky concepts clearly. I've also taught game dev at Girls Who Code, TA'd Cornell's intro CS course, and taught English in Tokyo.",
    image: {
      // Source: screenshot of my Varsity Tutors profile (varsitytutors.com).
      src: "assets/story/tutoring.webp",
      width: 640,
      height: 456,
      alt: "My Varsity Tutors profile card listing JavaScript and AP Computer Science Principles",
    },
  },
  {
    id: "finding-my-direction",
    title: "Finding My Direction",
    text: "At Cornell I'm studying Information Science and Cognitive Science, with a minor in Game Design. Outside class, I pledged Alpha Phi Omega in Fall 2024, which pushed me to grow as a leader and give back through service, and Latinas Promoviendo Comunidad / Lambda Pi Chi Sorority, Inc. in Fall 2025, where I found my community at Cornell.",
    image: {
      // Source: Lambda Pi Chi chapter photo.
      src: "assets/story/lambda-pi-chi.webp",
      width: 640,
      height: 468,
      alt: "Four smiling members of the Fall 2025 line in matching Lambda Pi Chi shirts, holding batons and “Welcome Hermana!” signs in front of the chapter's red banner",
    },
  },
  {
    id: "building-beyond-the-classroom",
    title: "Building Beyond the Classroom",
    stage: "2025 – Present",
    text: "Through Hack4Impact, I built team projects like the Ithaca Community Recovery platform, which supports about 30,000 people a year. At CourseLynx, a student chat app used by 40K+ students, I joined as a mobile engineer intern and now work as an engineer, building student organizations and redesigning course search. On my own, I built Budget.io Watchdog, a real-time fraud detection system on Kafka and Spring Boot that I tested through Kubernetes recovery, scaling, and rolling updates.",
    image: {
      // Source: CourseLynx App Store screenshots (courselynx.com), stitched into one collage.
      src: "assets/projects/courselynx.webp",
      width: 794,
      height: 480,
      alt: "Three CourseLynx app screens: .edu sign-up, a list of class group chats, and course search",
    },
    links: [
      projectLink("CourseLynx", "live", "Visit CourseLynx"),
      projectLink("Budget.io Watchdog", "github", "Watchdog on GitHub"),
      projectLink("H4I — Ithaca Community Recovery", "live", "Ithaca Community Recovery"),
    ],
  },
  {
    id: "creating-whats-next",
    title: "Creating What's Next",
    stage: "Aug 2026 – Present",
    text: "I lead a 24-person team at DGA Studios building Veil Sur, a photography-driven stealth-horror game. I own the roadmap and run weekly sprints across art, programming, design, and audio. Before that, I built the cutscene system, dialogue, and combat for Duke vs. The Gang, another DGA Studios game. I'm a software engineer and aspiring product manager, always up for collaborating at the intersection of EdTech, games, and product.",
    image: {
      // Source: key art by our DGA Studios Veil Sur team (credited in the README).
      src: "assets/projects/the-veil-sur.webp",
      width: 865,
      height: 480,
      alt: "Veil Sur key art: a camera-headed character beside shadowy creatures, under the game's logo",
    },
    links: [
      projectLink("Veil Sur", "github", "Veil Sur on GitHub"),
      projectLink("Duke vs. The Gang", "live", "Duke vs. The Gang on Steam"),
    ],
  },
];

// Sorted by what I use the most right now.
// Source: Devicon icons (MIT, https://devicon.dev). I recolored Unity so it shows up on
// the dark background, and React Native is Devicon's React atom inside a phone outline.
// Java + Kafka use my own generic </> icon (code.svg) until I add their Devicon logos.
export const skills = [
  { name: "TypeScript", icon: "typescript" },
  { name: "React", icon: "react" },
  { name: "Unity", icon: "unity" },
  { name: "C#", icon: "csharp" },
  { name: "React Native", icon: "react-native" },
  { name: "MongoDB", icon: "mongodb" },
  { name: "Firebase", icon: "firebase" },
  { name: "Docker", icon: "docker" },
  { name: "Java", icon: "code" },
  { name: "Kafka", icon: "code" },
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
  // The whole shelf, shown big on top. srcSet lets phones download the 640px version
  // (the original 2400px file is in design/source-images/).
  hero: {
    src: "gallery/shelf-display-1280.webp",
    srcSet:
      "gallery/shelf-display-640.webp 640w, gallery/shelf-display-1280.webp 1280w, gallery/shelf-display-2000.webp 2000w",
    sizes: "(min-width: 1100px) 1018px, calc(100vw - 4.5rem)",
    width: 1280,
    height: 546,
    label: "Shelf Display",
    alt: "Wall shelf lined with dozens of colorful 3D prints",
    large: { src: "gallery/shelf-display-2000.webp", width: 2000, height: 853 },
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
