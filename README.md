# dariogoldbach.nl

De website van Dario Goldbach. Je swipet alle kanten op, zoals op TikTok, en elke veeg toont een willekeurige pagina die je nog niet hebt gezien. Op de desktop staat de site in een 9:16-kader met pijltjes ernaast.

- `site/` is de website zoals die online komt. Er is geen bouwstap.
- `site/pages.js` bevat alle pagina's en teksten. Een nieuwe pagina is een nieuw blok in die lijst.
- `site/app.js` regelt het vegen, de 3D-boeken en het springspel. `site/app.css` is de vormgeving.
- `python3 build_preview.py` maakt `preview/dario-goldbach.html`, de hele site in één bestand om als voorbeeld te delen.
- Netlify publiceert de map `site/` (zie `netlify.toml`).
