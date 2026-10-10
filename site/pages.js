/*
  Alle pagina's van de site. Een nieuwe pagina toevoegen = een nieuw blok in deze lijst.
  "placeholder: true" zet het label "voorbeeldtekst" op de pagina tot de echte tekst erin staat.
  Soorten (type): bio, platform, podcast, boek, contact, snake.
*/
window.PAGES = [
  {
    id: "bio", type: "bio", placeholder: true,
    bg: "#111111", fg: "#f5f1e8", accent: "#ff5a36",
    title: "Dario Goldbach",
    roles: "Schrijver · columnist · organisator",
    text: "Hier komt een korte bio van twee of drie zinnen. Wie je bent, waar je over schrijft en waar mensen je van kennen.",
  },
  {
    id: "de-situatie", type: "platform", placeholder: true,
    bg: "#f5f1e8", fg: "#111111", accent: "#2a4bff",
    label: "Literair platform",
    title: "De Situatie",
    text: "Een paar zinnen over De Situatie: wat het is, wie er schrijven en wat je er kunt lezen.",
    link: { text: "Naar De Situatie", href: "" },
  },
  {
    id: "vier-weekenden", type: "podcast", placeholder: true,
    bg: "#2a4bff", fg: "#ffffff", accent: "#ffd23f",
    title: "Vier Weekenden",
    text: "Waar gaat de podcast over? Eén of twee zinnen die mensen nieuwsgierig maken.",
    links: [{ text: "Spotify", href: "" }, { text: "Apple Podcasts", href: "" }],
  },
  {
    id: "dario-in-oekraine", type: "podcast", placeholder: true,
    bg: "#ffd23f", fg: "#0b1d4a", accent: "#2a5bd7",
    title: "Dario in Oekraïne",
    text: "Waar gaat de podcast over? Eén of twee zinnen die mensen nieuwsgierig maken.",
    links: [{ text: "Spotify", href: "" }, { text: "Apple Podcasts", href: "" }],
  },
  {
    id: "de-man-die-alles-had", type: "boek", placeholder: true,
    bg: "#0e3b2e", fg: "#f3efe2", cover: "#c9452b", coverInk: "#f3efe2",
    title: "De Man die Alles Had",
    meta: "Roman · uitgeverij · jaar",
    back: "Hier komt de flaptekst: waar het boek over gaat, en een quote uit een recensie.",
    link: { text: "Bestel het boek", href: "" },
  },
  {
    id: "goldband-net-echt", type: "boek",
    bg: "#fde6ef", fg: "#111111", cover: "#fde6ef", coverInk: "#111111",
    title: "Goldband: Net Echt",
    images: { front: "img/goldband-front.jpg", spine: "img/goldband-spine.jpg", back: "img/goldband-back.jpg", ratio: 1.591, depth: 0.156 },
    text: "Een verhaal tussen feit en fictie, over vriendschap en een droom die werkelijkheid werd. Dichterbij had niemand kunnen komen.",
    meta: "Nijgh & Van Ditmar",
    back: "Hier komt de flaptekst: waar het boek over gaat, en een quote uit een recensie.",
    link: { text: "Bestel het boek", href: "" },
  },
  {
    id: "contact", type: "contact", placeholder: true,
    bg: "#f5f1e8", fg: "#111111", accent: "#ff5a36",
    text: "Voor opdrachten, optredens, interviews, of gewoon een reactie.",
    email: "hallo@dariogoldbach.nl",
  },
  {
    id: "snake", type: "snake",
    bg: "#0b0b0b", fg: "#7cff6b", accent: "#ffd23f",
  },
];
