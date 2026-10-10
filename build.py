"""Bouwt de statische site (losse pagina's) en een preview in één bestand."""
import pathlib, re

ROOT = pathlib.Path(__file__).parent
SITE = ROOT / "site"
PREVIEW = ROOT / "preview" / "dario-goldbach.html"
PREVIEW.parent.mkdir(exist_ok=True)

PAGES = [
    ("home", "index.html", "Home"),
    ("over-mij", "over-mij.html", "Over mij"),
    ("columns", "columns.html", "Columns"),
    ("schrijfwerk", "schrijfwerk.html", "Schrijfwerk"),
    ("evenementen", "evenementen.html", "Evenementen"),
    ("contact", "contact.html", "Contact"),
]
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700'
         '&family=IBM+Plex+Mono:wght@400;500&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&display=swap">')

PH = '<span class="ph-note">voorbeeldtekst</span>'

COLUMNS = [
    ("12", "okt 2026", "De stad die nooit stil is", "Over buren, bouwlawaai en waarom ik de stilte van een bibliotheek ben gaan missen.", "Naam krant", "780 woorden"),
    ("28", "sep 2026", "Wie organiseert de organisator?", "Een avond plannen voor tweehonderd mensen en dan zelf de sleutel vergeten.", "Op deze site", "640 woorden"),
    ("14", "sep 2026", "Lezen op het perron", "Waarom de vertraagde trein de beste leesclub van Nederland is.", "Naam tijdschrift", "710 woorden"),
    ("31", "aug 2026", "Een pleidooi voor de lange zin", "Korte zinnen zijn duidelijk. Lange zinnen zijn eerlijker over hoe we denken.", "Naam krant", "820 woorden"),
]
EVENTS = [
    ("24", "okt 2026", "Leesavond: verhalen uit de buurt", "Locatie, Amsterdam", "Gastheer en organisator", "Gratis, aanmelden verplicht"),
    ("07", "nov 2026", "Columnistencafé #12", "Boekhandel, Den Haag", "Spreker", "€ 7,50"),
    ("29", "nov 2026", "Schrijfworkshop: de column in 600 woorden", "Bibliotheek, Utrecht", "Docent", "€ 25, max. 16 deelnemers"),
]
# titel, soort, jaar, uitgever, omslagkleur, tekstkleur
BOOKS = [
    ("Titel van je boek", "Roman", "2024", "Uitgeverij Voorbeeld", "#1f5f4a", "#f4dd3d"),
    ("Verzamelde columns", "Columns", "2022", "Uitgeverij Voorbeeld", "#f4dd3d", "#18201c"),
    ("Een essay of bundel", "Essays", "2019", "Uitgeverij Voorbeeld", "#b8442c", "#f7f8f6"),
]


def book3d(b, small=False):
    title, kind, year, publisher, bg, ink = b
    cls = "stage small" if small else "stage"
    return f"""<div class="{cls}" style="--cover:{bg};--cover-ink:{ink}">
  <div class="book3d" tabindex="0" role="img" aria-label="{title}, als 3D-boek. Sleep of gebruik de pijltjestoetsen om te draaien.">
    <div class="f front"><span class="t">{title}</span><span class="tag">omslag volgt</span><span class="a">Dario Goldbach</span></div>
    <div class="f back"><p>Hier komt de flaptekst van het boek: waar het over gaat, en een quote uit een recensie.</p><span class="a">{publisher} · {year}</span></div>
    <div class="f spine"><span>{title}</span><span>D. Goldbach</span></div>
    <div class="f pages"></div><div class="f top"></div><div class="f bottom"></div>
  </div>
  <p class="hint meta">Sleep om te draaien</p>
</div>"""


def body(page, href):
    if page == "home":
        cols = "".join(col_item(c) for c in COLUMNS[:3])
        evs = "".join(event_item(e) for e in EVENTS[:2])
        return f"""
<section class="hero">
  <div>
    <p class="eyebrow">Schrijver · columnist · organisator</p>
    <h1><span class="ph">Ik schrijf over de stad, de mensen erin en</span> <span class="mark">alles wat ze samenbrengt</span>.</h1>
    <p class="lead ph">Korte introductie van twee of drie zinnen: wie je bent, waar je over schrijft en waar mensen je van kennen. Deze tekst vervangen we door jouw eigen woorden.</p>
  </div>
  <div class="portrait" role="img" aria-label="Plek voor een portretfoto"><div><b>DG</b>Hier komt je portretfoto</div></div>
</section>

<section class="roles" aria-label="Wat ik doe">
  <div class="role"><h2>Schrijver</h2><p class="ph">Boeken, essays en verhalen. Eén zin over je werk.</p><a href="{href('schrijfwerk')}">Naar schrijfwerk</a></div>
  <div class="role"><h2>Columnist</h2><p class="ph">Waar je columns verschijnen en hoe vaak.</p><a href="{href('columns')}">Lees de columns</a></div>
  <div class="role"><h2>Organisator</h2><p class="ph">Welke avonden, festivals of bijeenkomsten je organiseert.</p><a href="{href('evenementen')}">Bekijk de agenda</a></div>
</section>

<section class="feature">
  {book3d(BOOKS[0])}
  <div class="stack">
    <p class="eyebrow">Nieuw boek</p>
    <h2 class="ph">{BOOKS[0][0]}</h2>
    <p class="ph">Twee zinnen over het boek. Wat gebeurt er, en waarom moet je het lezen?</p>
    <span class="meta">{BOOKS[0][1]} · {BOOKS[0][2]} · {BOOKS[0][3]}</span>
    <a href="{href('schrijfwerk')}">Alle boeken</a>
  </div>
</section>

<section>
  <div class="section-head"><h2>Laatste columns</h2><a href="{href('columns')}">Alle columns</a></div>
  <ul class="list">{cols}</ul>
</section>

<section>
  <div class="section-head"><h2>Binnenkort</h2><a href="{href('evenementen')}">Volledige agenda</a></div>
  <ul class="list">{evs}</ul>
</section>"""

    if page == "over-mij":
        return f"""
<section class="stack">
  <p class="eyebrow">Over mij</p>
  <h1>Dario Goldbach</h1>
</section>
<section class="two-col">
  <div class="stack-lg">
    <div class="portrait" role="img" aria-label="Plek voor een portretfoto"><div><b>DG</b>Hier komt je portretfoto</div></div>
    <ul class="facts">
      <li><span class="eyebrow">Woont in</span><span class="ph">Woonplaats</span></li>
      <li><span class="eyebrow">Schrijft voor</span><span class="ph">Kranten, tijdschriften, sites</span></li>
      <li><span class="eyebrow">Organiseert</span><span class="ph">Naam van je avond of festival</span></li>
      <li><span class="eyebrow">Fotograaf portret</span><span class="ph">Naam fotograaf</span></li>
    </ul>
  </div>
  <div class="stack narrow">
    {PH}
    <p class="lead ph">Hier komt je bio. Begin met wat je doet en waarom, in een toon die past bij hoe je schrijft.</p>
    <p class="ph">Een tweede alinea over je achtergrond: waar je vandaan komt, hoe je bij het schrijven terechtkwam, en wat je eerste publicaties waren.</p>
    <p class="ph">Een derde alinea over je werk als organisator: welke avonden je maakt, met wie, en wat je daarmee wilt bereiken.</p>
    <p class="ph">Eventueel een korte alinea voor pers en programmeurs, met de bio in de derde persoon die ze direct kunnen overnemen.</p>
  </div>
</section>"""

    if page == "columns":
        cols = "".join(col_item(c) for c in COLUMNS)
        return f"""
<section class="stack">
  <p class="eyebrow">Columns</p>
  <h1>Columns</h1>
  <p class="lead ph">Eén zin over waar en hoe vaak je columns verschijnen, bijvoorbeeld: elke week in de zaterdagkrant.</p>
  {PH}
</section>
<section><ul class="list">{cols}</ul></section>"""

    if page == "schrijfwerk":
        bks = "".join(book_item(b) for b in BOOKS[1:])
        return f"""
<section class="stack">
  <p class="eyebrow">Schrijfwerk</p>
  <h1>Boeken en ander schrijfwerk</h1>
  <p class="lead ph">Een korte inleiding op je boeken, essays en andere publicaties.</p>
  {PH}
</section>
<section class="feature">
  {book3d(BOOKS[0])}
  <div class="stack">
    <p class="eyebrow">Meest recent</p>
    <h2 class="ph">{BOOKS[0][0]}</h2>
    <p class="ph">Een langere beschrijving van je nieuwste boek, met een fragment of een quote uit een recensie.</p>
    <span class="meta">{BOOKS[0][1]} · {BOOKS[0][2]} · {BOOKS[0][3]}</span>
  </div>
</section>
<section>
  <div class="section-head"><h2>Eerder verschenen</h2></div>
  <div class="books">{bks}</div>
</section>
<section class="stack narrow">
  <h2>Ook verschenen in</h2>
  <p class="ph">Een lijst van bladen, bundels en sites waar je werk is verschenen, met links waar die er zijn.</p>
</section>"""

    if page == "evenementen":
        evs = "".join(event_item(e) for e in EVENTS)
        return f"""
<section class="stack">
  <p class="eyebrow">Evenementen</p>
  <h1>Agenda</h1>
  <p class="lead ph">Avonden die je organiseert, optredens als spreker en workshops die je geeft.</p>
  {PH}
</section>
<section><ul class="list">{evs}</ul></section>
<section class="stack narrow">
  <h2>Mij boeken</h2>
  <p>Wil je mij uitnodigen als spreker, dagvoorzitter of organisator? <a href="{href('contact')}">Neem contact op</a>.</p>
</section>"""

    if page == "contact":
        return f"""
<section class="stack">
  <p class="eyebrow">Contact</p>
  <h1>Contact</h1>
  <p class="lead">Voor opdrachten, lezingen, interviews of een reactie op een column.</p>
</section>
<section class="two-col">
  <ul class="facts">
    <li><span class="eyebrow">E-mail</span><span class="ph">naam@dariogoldbach.nl</span></li>
    <li><span class="eyebrow">Boekingen</span><span class="ph">Naam agent of bureau</span></li>
    <li><span class="eyebrow">Sociale media</span><span class="ph">Instagram · LinkedIn · Bluesky</span></li>
  </ul>
  <form class="form" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
    <input type="hidden" name="form-name" value="contact">
    <p hidden><label>Niet invullen: <input name="bot-field"></label></p>
    <div class="field"><label for="naam">Naam</label><input id="naam" name="naam" autocomplete="name" required></div>
    <div class="field"><label for="email">E-mailadres</label><input id="email" name="email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="onderwerp">Onderwerp</label>
      <select id="onderwerp" name="onderwerp"><option>Schrijfopdracht</option><option>Lezing of optreden</option><option>Interview of pers</option><option>Reactie op een column</option><option>Iets anders</option></select></div>
    <div class="field"><label for="bericht">Bericht</label><textarea id="bericht" name="bericht" required></textarea></div>
    <button class="btn" type="submit">Verstuur bericht</button>
    <p class="form-msg" id="form-msg" role="status"></p>
  </form>
</section>"""


def col_item(c):
    d, m, title, teaser, where, words = c
    return f"""
<li><span class="meta">{d} {m}</span><div class="body"><h3 class="ph">{title}</h3><p class="ph">{teaser}</p><span class="meta">{where} · {words}</span></div></li>"""


def event_item(e):
    d, m, title, place, role, price = e
    return f"""
<li><div class="event-date"><span class="d">{d}</span><span class="m">{m}</span></div><div class="body"><h3 class="ph">{title}</h3><p>{place}</p><span class="meta">{role} · {price}</span></div></li>"""


def book_item(b):
    title, kind, year, publisher = b[:4]
    return f"""
<article class="book">{book3d(b, small=True)}
<h3 class="ph">{title}</h3><span class="meta">{kind} · {year} · {publisher}</span></article>"""


def chrome(current, href, inner):
    nav = "".join(
        f'<li><a href="{href(k)}"{" aria-current=\"page\"" if k == current else ""} data-nav="{k}">{label}</a></li>'
        for k, _, label in PAGES)
    return f"""<header class="site-head"><div class="wrap">
  <a class="wordmark" href="{href('home')}">Dario Goldbach</a>
  <nav aria-label="Hoofdmenu"><ul class="nav">{nav}</ul></nav>
</div></header>
<main class="wrap">{inner}
</main>
<footer class="site-foot"><div class="wrap">
  <span class="meta">© 2026 Dario Goldbach</span>
  <span class="meta">dariogoldbach.nl</span>
</div></footer>"""


# Losse pagina's voor de echte site
files = {k: f for k, f, _ in PAGES}
site_href = lambda k: files[k]
for key, fname, label in PAGES:
    title = "Dario Goldbach" if key == "home" else f"{label} · Dario Goldbach"
    html = f"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="Dario Goldbach, schrijver, columnist en organisator.">
{FONTS}
<link rel="stylesheet" href="style.css">
</head>
<body>
{chrome(key, site_href, body(key, site_href))}
<script src="script.js"></script>
</body>
</html>
"""
    (SITE / fname).write_text(html)

# Preview in één bestand: elke pagina als sectie, wisselen via #anker
prev_href = lambda k: f"#{k}"
css = (SITE / "style.css").read_text()
js = (SITE / "script.js").read_text()
sections = "".join(
    f'<div class="page" data-page="{k}"{"" if k == "home" else " hidden"}>{chrome(k, prev_href, body(k, prev_href))}</div>'
    for k, _, _ in PAGES)
preview = f"""<title>Dario Goldbach</title>
{FONTS}
<style>{css}</style>
<div class="preview-banner">Eerste ontwerp. Gele vlakken zijn voorbeeldtekst die we vervangen door jouw eigen teksten.</div>
{sections}
<script>{js}</script>
<script>
(function () {{
  var keys = {[k for k, _, _ in PAGES]};
  function show() {{
    var k = (location.hash || "#home").slice(1);
    if (keys.indexOf(k) < 0) k = "home";
    document.querySelectorAll(".page").forEach(function (p) {{ p.hidden = p.dataset.page !== k; }});
    window.scrollTo(0, 0);
  }}
  window.addEventListener("hashchange", show);
  show();
  document.querySelectorAll("form").forEach(function (f) {{
    f.addEventListener("submit", function (e) {{
      e.preventDefault();
      var m = f.querySelector(".form-msg");
      if (m) m.textContent = "Dit is een preview: berichten worden pas verzonden als de site online staat.";
    }});
  }});
}})();
</script>
"""
PREVIEW.write_text(preview)
print("ok")
