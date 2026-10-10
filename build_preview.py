"""Maakt preview/dario-goldbach.html: de hele site in één bestand, om te delen als voorbeeld."""
import pathlib, re

ROOT = pathlib.Path(__file__).parent
site = ROOT / "site"
html = (site / "index.html").read_text()
fonts = "\n".join(re.findall(r'<link rel="(?:preconnect|stylesheet)" href="https://fonts[^>]*>', html))
body = html.split("<!--app-->")[1].split("<!--/app-->")[0]
out = ROOT / "preview" / "dario-goldbach.html"
import base64
def inline_media(text):
    # Video's: in het previewbestand een kleinere versie uit preview/, zodat het bestand niet te groot wordt.
    def rep(m):
        small = out.parent / (pathlib.Path(m.group(0)).stem + "-preview.mp4")
        data = (small if small.exists() else site / m.group(0)).read_bytes()
        return "data:video/mp4;base64," + base64.b64encode(data).decode()
    return re.sub(r"media/[\w.-]+\.mp4", rep, text)
def inline_images(text):
    # Afbeeldingen uit site/img/ meebakken, zodat het losse previewbestand ze ook toont.
    return re.sub(r"img/[\w.-]+\.(?:jpg|png)", lambda m: "data:image/" + ("png" if m.group(0).endswith("png") else "jpeg") +
                  ";base64," + base64.b64encode((site / m.group(0)).read_bytes()).decode(), text)
out.parent.mkdir(exist_ok=True)
out.write_text(
    "<title>Dario Goldbach</title>\n" + fonts +
    "\n<style>" + (site / "app.css").read_text() + "</style>\n" + body +
    "\n<script>" + inline_images(inline_media((site / "pages.js").read_text())) + "</script>\n<script>" + (site / "app.js").read_text() + "</script>\n"
)
print(out)
