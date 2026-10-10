/*
  Alle pagina's van de site. Een nieuwe pagina toevoegen = een nieuw blok in deze lijst.
  "placeholder: true" zet het label "voorbeeldtekst" op de pagina tot de echte tekst erin staat.
  Soorten (type): bio, platform, podcast, boek, contact, snake.
*/
window.PAGES = [
  {
    id: "bio", type: "bio",
    bg: "#111111", fg: "#f5f1e8", accent: "#ff5a36",
    title: "Dario Goldbach",
    roles: "Schrijver · columnist · organisator",
    image: "img/dario.jpg",
    credit: "Foto: Jelle Stokhof",
    text: "Dario Goldbach is schrijver. Tijdens de pandemie publiceerde hij in samenwerking met het Haagse cultuurbordeel PIP de novelle Vier Weekenden. Als mede-initiator van literair platform De Situatie stond hij op Writers Unlimited en Crossing Border. Maandelijks gaat hij viraal met zijn column over het nachtleven bij The Beat op 3FM. De Man die Alles Had (2023) was zijn literaire romandebuut.",
  },
  {
    id: "de-situatie", type: "platform",
    bg: "#deff94", fg: "#4a4128", accent: "#ffaae9",
    label: "Literair platform",
    title: "De Situatie",
    tag: "(wij zoeken schrijftalent)",
    text: "De Situatie is het literaire platform van PIP Den Haag. Een hedendaagse vertaling van de wereld om ons heen én een springplank voor een nieuwe generatie schrijvers. Van poëzie tot proza, van woeste manifesten tot boze appjes aan je ex.",
    link: { text: "Naar De Situatie", href: "https://de-situatie.nl/" },
  },
  {
    id: "vier-weekenden", type: "podcast",
    bg: "#ffffff", fg: "#111111", accent: "#ff1a0d",
    title: "Vier Weekenden",
    image: "img/vier-weekenden.jpg",
    links: [{ text: "Spotify", href: "" }, { text: "Apple Podcasts", href: "" }],
  },
  {
    id: "dario-in-oekraine", type: "podcast",
    bg: "#ffd23f", fg: "#0b1d4a", accent: "#2a5bd7",
    title: "Dario in Oekraïne",
    text: "Het begint met een DM op Instagram. Twee weken later rijdt Dario mee in een konvooi van Protect Ukraine, met hulpgoederen voor Oekraïense legereenheden. Een persoonlijke en soms ongemakkelijke podcast in vijf delen over angst, idealisme en morele keuzes.",
    links: [{ text: "Spotify", href: "" }, { text: "Apple Podcasts", href: "" }],
  },
  {
    id: "de-man-die-alles-had", type: "boek",
    bg: "#e8202a", fg: "#ffffff", cover: "#ffffff", coverInk: "#111111",
    title: "De Man die Alles Had",
    images: { front: "img/de-man-front.jpg", spine: "img/de-man-spine.jpg", back: "img/de-man-back.jpg", ratio: 1.536, depth: 0.139 },
    text: "Wat is alles? En hoe kom je eraan? De Man die Alles Had werkt bij techgigant Odium. Zijn onuitvoerbare idee wordt het paradepaardje van het bedrijf, en zijn leven een megalomane leugen. Een wereldreis langs de excessen van het kapitalisme.",
    quote: { text: "Iedereen heeft het ineens over Dario.", by: "Ilja Leonard Pfeijffer" },
    meta: "Roman · De Arbeiderspers · 2023",
    link: { text: "Meer over het boek", href: "https://demandiealleshad.nl/" },
  },
  {
    id: "goldband-net-echt", type: "boek",
    bg: "#fde6ef", fg: "#111111", cover: "#fde6ef", coverInk: "#111111",
    title: "Goldband: Net Echt",
    images: { front: "img/goldband-front.jpg", spine: "img/goldband-spine.jpg", back: "img/goldband-back.jpg", ratio: 1.591, depth: 0.156 },
    text: "Een doorbraak als die van popsensatie Goldband komt zelden voor. Dat zo’n avontuur van binnenuit wordt opgeschreven is nog zeldzamer.",
    quote: { text: "Dit is niet hoe ik het mij herinner.", by: "Boaz Kok, Goldband" },
    meta: "Nijgh & Van Ditmar · paperback · 288 pagina’s · € 22,50",
    link: { text: "Bestel het boek", href: "" },
  },
  {
    id: "contact", type: "contact",
    bg: "#f5f1e8", fg: "#111111", accent: "#ff5a36",
    text: "Voor opdrachten, optredens, interviews, of gewoon een reactie.",
    email: "contact@studiodario.nl",
  },
  {
    id: "snake", type: "snake",
    bg: "#0b0b0b", fg: "#7cff6b", accent: "#ffd23f",
  },
];
