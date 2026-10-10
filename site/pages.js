/*
  Alle pagina's van de site. Een nieuwe pagina toevoegen = een nieuw blok in deze lijst.
  "placeholder: true" zet het label "voorbeeldtekst" op de pagina tot de echte tekst erin staat.
  Soorten (type): bio, platform, podcast, boek, contact, social, video, game.
*/
window.PAGES = [
  {
    id: "bio", type: "bio",
    bg: "#111111", fg: "#f5f1e8", accent: "#ff5a36",
    title: "Dario Goldbach",
    image: "img/dario.jpg",
    credit: "Foto: Jelle Stokhof",
    text: "Dario Goldbach is schrijver. Misschien zag je hem op Lowlands, Wildeburg, Crossing Border of in je lokale club. Maandelijks gaat hij viraal met zijn columns voor FHM en The Beat op 3FM. Hij is mede-oprichter van literair platform De Situatie, schreef drie boeken en werkt momenteel aan de vierde.",
  },
  {
    id: "de-situatie", type: "platform",
    bg: "#deff94", fg: "#4a4128", accent: "#ffaae9",
    label: "Literair platform",
    title: "De Situatie",
    tag: "(wij zoeken schrijftalent)",
    text: "De Situatie is het literaire platform van PIP Den Haag. We organiseerden avonden met o.a. Connie Palmen & Sef, en zijn een springplank voor literair talent. Bij onze jaarlijkse Open Call verzamelen we alles: van poëzie tot proza, van woeste manifesten tot boze appjes aan je ex.",
    link: { text: "Naar De Situatie", icon: "arrow", href: "https://de-situatie.nl/" },
  },
  {
    id: "vier-weekenden", type: "podcast",
    bg: "#ffffff", fg: "#111111", accent: "#ff1a0d",
    title: "Vier Weekenden",
    covers: ["img/vier-weekenden-01.jpg", "img/vier-weekenden-02.jpg", "img/vier-weekenden-03.jpg", "img/vier-weekenden-04.jpg", "img/vier-weekenden-05.jpg", "img/vier-weekenden-06.jpg", "img/vier-weekenden-07.jpg", "img/vier-weekenden-08.jpg", "img/vier-weekenden-09.jpg", "img/vier-weekenden-10.jpg", "img/vier-weekenden-11.jpg", "img/vier-weekenden-12.jpg", "img/vier-weekenden-13.jpg", "img/vier-weekenden-14.jpg", "img/vier-weekenden-15.jpg"],
    text: "Het verhaal van een jonge twintiger die verward na een relatie met een psychopaat op zoek gaat naar de perfecte liefde en een uitweg. Een uitweg van zijn kutbaan, zijn uitzichtloze leven, zijn doelloze bestaan.",
    links: [
      { text: "Luister op Spotify", icon: "spotify", href: "https://open.spotify.com/episode/0zR4Ko0c84NDSKU3PSaGiI" },
      { text: "Luister op Apple Podcasts", icon: "apple", href: "https://podcasts.apple.com/nl/podcast/vier-weekenden-h1/id1673680848?i=1000602239982" },
    ],
  },
  {
    id: "dario-in-oekraine", type: "podcast",
    bg: "#ffd700", fg: "#0057b7", accent: "#0057b7",
    title: "Dario in Oekraïne",
    image: "img/dario-in-oekraine-afl2.jpg", showTitle: true,
    text: "Een DM op Instagram, en twee weken later rijdt Dario mee in een konvooi met hulpgoederen naar het front. Een podcast in vijf delen over angst, idealisme en morele keuzes.",
    links: [
      { text: "Luister op Spotify", icon: "spotify", href: "https://open.spotify.com/episode/4qeBgAVwyytXE0RwZSksH7" },
      { text: "Luister op Apple Podcasts", icon: "apple", href: "https://podcasts.apple.com/nl/podcast/dario-in-oekra%C3%AFne-aflevering-1/id1673680848?i=1000708951234" },
    ],
  },
  {
    id: "de-man-die-alles-had", type: "boek",
    bg: "#e8202a", fg: "#ffffff", cover: "#ffffff", coverInk: "#111111",
    title: "De Man die Alles Had",
    images: { front: "img/de-man-front.jpg", spine: "img/de-man-spine.jpg", back: "img/de-man-back.jpg", ratio: 1.536, depth: 0.155 },
    text: "Dario’s literaire debuut over een techgigant, een groeiende leugen en een onbereikbare liefde.",
    link: { text: "Bestel nu", icon: "cart", href: "https://libris.nl/singeluitgeverijen/a/dario-goldbach/de-man-die-alles-had/501538703#paperback-9789029546683" },
  },
  {
    id: "goldband-net-echt", type: "boek",
    bg: "#ffffff", fg: "#111111", cover: "#fde6ef", coverInk: "#111111",
    title: "Goldband: Net Echt",
    images: { front: "img/goldband-front.jpg", spine: "img/goldband-spine.jpg", back: "img/goldband-back.jpg", ratio: 1.591, depth: 0.156 },
    text: "Een doorbraak als die van popsensatie Goldband komt zelden voor. Dat zo’n avontuur van binnenuit wordt opgeschreven is nog zeldzamer.",
    // Deze quotes wisselen elkaar om de paar seconden af.
    quotes: [
      { text: "Dit is niet hoe ik het mij herinner.", by: "Boaz Kok, Goldband" },
      { text: "Ik ben bijna op de helft!", by: "Karel Gerlach, Goldband" },
      { text: "Geen woord van gelogen.", by: "Milo Driessen, Goldband" },
    ],
    link: { text: "Bestel nu", icon: "cart", href: "https://libris.nl/singeluitgeverijen/a/dario-goldbach/goldband/501657554#paperback-9789038815930" },
    listen: { text: "Luister het audioboek op Spotify", icon: "spotify", href: "https://open.spotify.com/show/2hzgSzA1pBO2rF0AHQau2m" },
  },
  {
    id: "volg-me", type: "social",
    bg: "#f5f1e8", fg: "#111111", accent: "#ff5a36",
    links: [
      { text: "Instagram", icon: "instagram", href: "https://www.instagram.com/dariogoldbach/" },
      { text: "TikTok", icon: "tiktok", href: "https://www.tiktok.com/@dariogoldbach" },
    ],
  },
  {
    id: "contact", type: "contact",
    bg: "#f5f1e8", fg: "#111111", accent: "#ff5a36",
    text: "Voor boekingen, kritiek of complimenten.",
    email: "contact@studiodario.nl",
  },
  {
    id: "voorlezen", type: "video",
    bg: "#000000", fg: "#ffffff",
    title: "Dario leest voor",
    video: "media/voorlezen.mp4", poster: "img/voorlezen-poster.jpg",
    account: "dariogoldbach", profile: "https://www.tiktok.com/@dariogoldbach", avatar: "img/avatar.jpg",
    caption: "‘Gezondheid is uit!’ voor FHM.",
  },
  {
    id: "spel", type: "game",
    bg: "#f2eee3", fg: "#1b1b1b", accent: "#ff5a36",
  },
];
