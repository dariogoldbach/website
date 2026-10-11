/* Swipe alle kanten op: elke veeg toont een willekeurige pagina die je nog niet hebt gezien. */
(function () {
  "use strict";
  var PAGES = window.PAGES || [];
  // Knopstijl: "c" = halfvette schuine schreefletter met licht ronde hoeken (Dario koos C). "a" en "b" staan nog in app.css.
  if (!document.documentElement.dataset.knop) document.documentElement.dataset.knop = "1";
  var frame = document.getElementById("frame");
  var countEl = document.getElementById("count");
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Richting = waar de huidige kaart naartoe schuift. "up" = omhoog vegen, de nieuwe kaart komt van onder.
  var VEC = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  // Op de desktop werken de knoppen zoals het scherm: pijl omhoog = de kaart van boven halen.
  var BUTTON = { up: "down", down: "up", left: "right", right: "left" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  // Echte omslagen: voor, rug en achter als afbeelding, met de verhoudingen van het echte boek.
  function bookStyle(p) {
    var i = p.images;
    if (!i) return "";
    return ' style="--front:url(\'' + i.front + '\');--spine:url(\'' + i.spine + '\');--back:url(\'' + i.back +
      '\');--ratio:' + i.ratio + ";--depth:" + i.depth + '"';
  }
  function link(l, cls) {
    var href = l.href ? ' href="' + esc(l.href) + '" target="_blank" rel="noopener"' : ' href="#" data-later';
    return '<a class="btn ' + (cls || "") + '"' + href + ">" + esc(l.text) + "</a>";
  }
  // Ronde knop met alleen een logo.
  function iconLink(l) {
    var href = l.href ? ' href="' + esc(l.href) + '" target="_blank" rel="noopener"' : ' href="#" data-later';
    return '<a class="icon-btn"' + href + ' aria-label="' + esc(l.text) + '">' + ICONS[l.icon] + "</a>";
  }
  function top(label, p) {
    return '<div class="top"><span class="label">' + esc(label) + "</span>" +
      (p.placeholder ? '<span class="ph-tag">voorbeeldtekst</span>' : "") + "</div>";
  }

  var ICONS = {
    arrow: '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12h14"/><path d="M13 6.5 18.5 12 13 17.5"/></svg>',
    playc: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 5.5v13l10.5-6.5z"/></svg>',
    replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M18.6 3.2v4.2h-4.2"/></svg>',
    mail: '<svg class="mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><g class="fly"><path class="flap-open" d="M3 8 12 2.5 21 8"/><path class="heart" fill="currentColor" stroke="none" d="M12 11.6 8.9 8.6a1.9 1.9 0 0 1 3.1-2.4 1.9 1.9 0 0 1 3.1 2.4z"/><rect class="body" x="3" y="8" width="18" height="12" rx="1.5"/><path class="flap" d="M3 8 12 14.5 21 8"/></g></svg>',
    cart: '<svg class="cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><g class="lines"><path d="M1 9.5h3.5"/><path d="M0.5 13h4"/><path d="M2 16.5h3"/></g><g class="body" transform="rotate(-8 14 12)"><path d="M6 4h2.6l2.1 9.6a1.5 1.5 0 0 0 1.5 1.2h6.6a1.5 1.5 0 0 0 1.5-1.1L22 7.5H9.4"/><circle cx="12.6" cy="19.4" r="1.5" fill="currentColor"/><circle cx="19" cy="19.4" r="1.5" fill="currentColor"/></g></svg>',
    spotify: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    apple: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M7.8 15.4a6 6 0 1 1 8.4 0"/><path d="M5 18a9.6 9.6 0 1 1 14 0"/><circle cx="12" cy="10.6" r="2.4" fill="currentColor" stroke="none"/><path d="M10.7 14.6h2.6l-.6 6.4h-1.4z" fill="currentColor" stroke="none"/></svg>',
    muted: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.2l-1.4-1.3C5.4 15.2 2 12.1 2 8.3 2 5.2 4.4 2.8 7.5 2.8c1.7 0 3.4.8 4.5 2.1 1.1-1.3 2.8-2.1 4.5-2.1 3.1 0 5.5 2.4 5.5 5.5 0 3.8-3.4 6.9-8.6 11.6L12 21.2z"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 4.5v4C6.8 9.2 3.5 13.6 2.5 19.5c2.6-3.4 6-5 11-5v4.1L21.5 11.5l-8-7z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>'
  };

  // ---------- Pagina-sjablonen ----------
  var TEMPLATES = {
    bio: function (p) {
      // Alleen de naam groot; de bio schuift van onder het scherm in als je op de knop drukt.
      return '<img class="bio-bg" src="' + esc(p.image) + '" alt="Portret van Dario Goldbach">' +
        '<div class="mid"></div>' +
        '<div class="end"><h1 class="xl">' + esc(p.title).replace(" ", "<br>") + "</h1>" +
        '<div class="row"><button class="btn" type="button" data-sheet aria-expanded="false">Bio</button></div></div>' +
        '<div class="sheet" role="dialog" aria-label="Bio" aria-hidden="true">' +
        '<button class="sheet-close" type="button" data-sheet-close aria-label="Sluit de bio">×</button>' +
        '<p class="txt">' + esc(p.text) + "</p>" +
        (p.credit ? '<p class="small">' + esc(p.credit) + "</p>" : "") + "</div>";
    },
    platform: function (p) {
      return top(p.label, p) +
        '<div class="mid"><p class="situatie-mark" aria-label="' + esc(p.title) + '"><span class="sit-de">De</span>' +
        '<span class="sit-word">Situatie</span></p>' +
        (p.tag ? '<p class="sit-tag"><span>' + esc(p.tag) + "</span></p>" : "") +
        '<p class="txt' + (p.placeholder ? " ph" : "") + '">' + esc(p.text) + "</p>" +
        '<div class="icons sit-icons">' + iconLink(p.link) + "</div></div>";
    },
    podcast: function (p) {
      var bars = "";
      for (var i = 0; i < 14; i++) bars += "<i></i>";
      return top("Podcast", p) +
        '<div class="mid pod-mid">' + (p.covers
          // Een rij covers (één per aflevering) waar je zijwaarts doorheen veegt; de volgende piept rechts in beeld.
          ? '<div class="pod-covers" aria-label="Covers van alle afleveringen">' + p.covers.map(function (c, i) {
              return '<img class="pod-img" src="' + esc(c) + '" alt="Cover van aflevering ' + (i + 1) + '" decoding="async">';
            }).join("") + "</div>"
          : p.image
          ? '<img class="pod-img" src="' + esc(p.image) + '" alt="Cover van de podcast ' + esc(p.title) + '">'
          : '<div class="pod-cover"><span>Podcast</span><b>' + esc(p.title) + "</b><span>Dario Goldbach</span></div>") +
        '<div class="eq" aria-hidden="true">' + bars + "</div>" +
        (p.showTitle ? '<h2 class="lg pod-title">' + esc(p.title) + "</h2>" : "") +
        (p.text ? '<p class="txt' + (p.placeholder ? " ph" : "") + '">' + esc(p.text) + "</p>" : "") +
        // Logoknoppen direct onder de tekst.
        (p.links[0] && p.links[0].icon
          ? '<div class="icons">' + p.links.map(iconLink).join("") + "</div></div>"
          : '</div><div class="end"><div class="row">' + p.links.map(function (l, i) { return link(l, i ? "ghost" : ""); }).join("") + "</div></div>");
    },
    boek: function (p) {
      return top("Boek", p) +
        '<div class="mid"><div class="book-stage"><div class="book3d' + (p.images ? " has-img" : "") + '" tabindex="0" role="img" aria-label="' + esc(p.title) +
        ', als 3D-boek. Sleep om te draaien."' + bookStyle(p) + ">" +
        '<div class="f front"><b>' + (p.cover_title || esc(p.title)) + "</b><span>Dario Goldbach</span></div>" +
        '<div class="f back"><p>' + esc(p.back) + "</p></div>" +
        '<div class="f spine"><span>' + esc(p.title) + "</span><span>Goldbach</span></div>" +
        '<div class="f pages"></div><div class="f top"></div><div class="f bottom"></div></div></div>' +
        '' + (p.text ? '<p class="txt">' + esc(p.text) + "</p>" : "") +
        // Alle quotes liggen op dezelfde plek op elkaar; er is er steeds één zichtbaar, zodat er niets verspringt.
        (p.quotes ? '<div class="quotes" data-quotes>' + p.quotes.map(function (q, i) {
          return '<p class="quote' + (i ? "" : " on") + '"' + (i ? ' aria-hidden="true"' : "") + ">‘" + esc(q.text) + "’ <span>" + esc(q.by) + "</span></p>";
        }).join("") + "</div>" : "") +
        // De knop staat direct onder de tekst, niet onderaan de pagina.
        (p.link.icon ? '<div class="icons">' + iconLink(p.link) + (p.listen && p.listen.icon ? iconLink(p.listen) : "") + "</div></div>" :
        '<div class="row">' + link(p.link) + (p.listen ? link(p.listen, "ghost") : "") + "</div></div>");
    },
    contact: function (p) {
      return '<div class="mid"><p class="mail-big">Contact</p><p class="txt">' + esc(p.text) + "</p>" +
        '<div class="icons"><a class="icon-btn" href="mailto:' + esc(p.email) + '" aria-label="Stuur een mail">' + ICONS.mail + "</a></div></div>";
    },
    social: function (p) {
      return '<div class="mid">' +
        '<div class="icons social-icons">' + p.links.map(iconLink).join("") + "</div></div>";
    },
    video: function (p) {
      // Schermvullend met een overlay zoals op TikTok: account, caption, like en delen.
      return '<video class="vid" src="' + esc(p.video) + '"' + (p.poster ? ' poster="' + esc(p.poster) + '"' : "") +
        ' loop playsinline preload="auto"></video>' +
        '<div class="vid-shade" aria-hidden="true"></div>' +
        '<div class="vid-play" aria-hidden="true">' + ICONS.play + "</div>" +
        '<div class="vid-side">' +
        (p.avatar ? '<a class="vid-avatar" href="' + esc(p.profile) + '" target="_blank" rel="noopener" aria-label="Naar @' + esc(p.account) + '"><img src="' + esc(p.avatar) + '" alt=""></a>' : "") +
        '<button class="vid-act" type="button" data-like aria-pressed="false" aria-label="Vind ik leuk">' + ICONS.heart + "<span>Like</span></button>" +
        '<button class="vid-act" type="button" data-share aria-label="Delen">' + ICONS.share + "<span>Deel</span></button>" +
        '<button class="vid-act" type="button" data-sound aria-pressed="true" aria-label="Geluid uit">' + ICONS.sound + "<span>Geluid</span></button>" +
        "</div>" +
        '<div class="vid-info"><a class="vid-account" href="' + esc(p.profile) + '" target="_blank" rel="noopener">@' + esc(p.account) + "</a>" +
        '<p class="vid-caption">' + esc(p.caption) + "</p></div>" +
        '<div class="vid-bar" aria-hidden="true"><i></i></div>';
    },
    game: function () {
      var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      return '<div class="top"><span class="label">Game</span></div>' +
        '<div class="snake-wrap run-wrap"><canvas></canvas><span class="score run-score" data-score>score 0</span><div class="snake-over">' +
        '<canvas class="logo" data-logo role="img" aria-label="Dario\'s Great Adventure"></canvas>' +
        '<div class="go" data-go hidden><canvas class="go-title" data-go-title role="img" aria-label="Game over"></canvas><canvas class="go-img" data-go-img></canvas><span class="go-name" data-go-name></span></div>' +
        '<p class="small" data-msg>' +
        (fine ? "Spatie of pijltje omhoog om te springen, omlaag om te bukken." : "Tik of veeg omhoog om te springen, veeg omlaag om te bukken.") +
        '</p><button class="icon-btn" type="button" data-play aria-label="Speel">' + ICONS.playc + "</button>" +
        '<form class="lb-form" data-lb-form hidden><input name="naam" maxlength="16" placeholder="Je naam" autocomplete="nickname" enterkeyhint="send" required>' +
        '<button type="submit">Zet op scorebord</button></form>' +
        '<div class="lb" data-lb hidden><p class="lb-title">Scorebord</p><ol data-lb-list></ol></div></div>' +
        '<button class="run-sound" type="button" data-music aria-pressed="true" aria-label="Muziek uit">' + ICONS.sound + "</button></div>" +
        '<p class="small" data-best>Je record: 0</p><p class="small run-credit">Muziek door Sjamsoedin</p>';
    },
  };

  // ---------- Interactieve onderdelen per pagina ----------
  var MOUNT = {
    // Covers carrousel: de middelste cover is groot, naar de randen toe worden ze kleiner.
    podcast: function (card) {
      var row = card.querySelector(".pod-covers");
      if (!row) return null;
      // Geen echte scroll: we schuiven de covers zelf met een transform. Dat schuiven en het
      // groter/kleiner worden gebeurt dan in hetzelfde beeldje, dus niets loopt achter of schokt.
      var imgs = row.querySelectorAll(".pod-img"), raf = null, pos = 0;
      function maxPos() { var l = imgs[imgs.length - 1]; return Math.max(0, centerOf(l)); }
      function fit() {
        raf = null;
        var mid = pos + row.clientWidth / 2;
        imgs.forEach(function (im) {
          var w = im.offsetWidth, off = im.offsetLeft + w / 2 - mid, d = Math.min(1, Math.abs(off) / w), sc = 1 - 0.22 * d;
          im.style.transform = "translate3d(" + (-pos).toFixed(2) + "px,0,0) scale(" + sc.toFixed(4) + ")";
          im.style.zIndex = String(Math.round((1 - d) * 10));
        });
      }
      function soon() { if (!raf) raf = requestAnimationFrame(fit); }
      function set(x) { pos = Math.max(0, Math.min(maxPos(), x)); soon(); }
      var anim = null, idle = null;
      function centerOf(im) { return im.offsetLeft + im.offsetWidth / 2 - row.clientWidth / 2; }
      function glide(to) {
        cancelAnimationFrame(anim);
        var from = pos, t0 = performance.now(), dur = 480 + Math.min(260, Math.abs(to - from) * 0.6);
        (function tick(now) {
          var k = Math.min(1, Math.max(0, (now - t0) / dur)), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          pos = from + (to - from) * e;
          if (raf) { cancelAnimationFrame(raf); raf = null; }
          fit();
          anim = k < 1 ? requestAnimationFrame(tick) : null;
        })(t0);
      }
      row._pos = function () { return pos; };
      row._move = function (x, wheel) {
        set(x);
        // Trackpad of scrollwiel: na het scrollen netjes naar de dichtstbijzijnde cover.
        if (wheel) { clearTimeout(idle); idle = setTimeout(function () { row._index = -1; row._snap(0); }, 140); }
      };
      row._stop = function () { cancelAnimationFrame(anim); anim = null; clearTimeout(idle); };
      row._snap = function (v) {
        var at = pos - (v || 0) * 60, best = 0, bd = Infinity;
        imgs.forEach(function (im, i) { var d = Math.abs(centerOf(im) - at); if (d < bd) { bd = d; best = i; } });
        // Een snelle veeg, of een stukje slepen, gaat altijd minstens één cover verder.
        var cur = row._index || 0, moved = cur >= 0 ? pos - centerOf(imgs[cur]) : 0;
        if (cur >= 0 && best === cur && (Math.abs(v || 0) > 0.35 || Math.abs(moved) > imgs[0].offsetWidth * 0.15)) {
          var dir = Math.abs(v || 0) > 0.35 ? (v < 0 ? 1 : -1) : (moved > 0 ? 1 : -1);
          best = Math.max(0, Math.min(imgs.length - 1, cur + dir));
        }
        row._index = best;
        glide(Math.max(0, Math.min(maxPos(), centerOf(imgs[best]))));
      };
      function resize() { if (!anim) set(centerOf(imgs[Math.max(0, row._index || 0)])); }
      window.addEventListener("resize", resize);
      requestAnimationFrame(fit);
      return function () { window.removeEventListener("resize", resize); if (raf) cancelAnimationFrame(raf); row._stop(); };
    },
    boek: function (card, p) {
      var stop = book(card.querySelector(".book3d")), qs = card.querySelectorAll(".quote"), n = 0, timer;
      if (qs.length > 1) timer = setInterval(function () {
        qs[n].classList.remove("on"); qs[n].setAttribute("aria-hidden", "true");
        n = (n + 1) % qs.length;
        qs[n].classList.add("on"); qs[n].removeAttribute("aria-hidden");
      }, 4000);
      return function () { stop(); clearInterval(timer); };
    },
    game: function (card) { return runner(card); },
    video: function (card, p) {
      var v = card.querySelector("video"), b = card.querySelector("[data-sound]"), bar = card.querySelector(".vid-bar i");
      // Staat deze video al klaar (vooraf geladen), dan die gebruiken: dan begint hij meteen.
      var warm = VIDS[p.video];
      if (warm && !warm.parentNode.closest(".card")) { warm.className = "vid"; v.replaceWith(warm); v = warm; }
      var like = card.querySelector("[data-like]"), liked = false;
      try { liked = localStorage.getItem("dg-like-" + p.id) === "1"; } catch (e) {}
      function showLike() { like.classList.toggle("on", liked); like.setAttribute("aria-pressed", String(liked)); }
      showLike();
      function sound(on) {
        v.muted = !on; b.setAttribute("aria-pressed", String(on)); b.classList.toggle("off", !on);
        b.setAttribute("aria-label", on ? "Geluid uit" : "Geluid aan");
        b.querySelector("svg").outerHTML = on ? ICONS.sound : ICONS.muted;
      }
      // Meteen met geluid. Als de browser dat niet toestaat (nog niet op de site getikt), dan eerst zonder.
      function start() {
        if (still) return;
        sound(true);
        v.play().catch(function () { sound(false); v.play().catch(function () {}); });
      }
      // Tijdens het vegen speelt hij al (zonder geluid); als je loslaat gaat het geluid aan.
      if (!still) { sound(false); v.play().catch(function () {}); }
      card._activate = start;
      b.addEventListener("click", function () { sound(v.muted); if (!v.muted) v.play().catch(function () {}); });
      like.addEventListener("click", function () {
        liked = !liked; showLike();
        if (liked) { like.classList.remove("pop"); void like.offsetWidth; like.classList.add("pop"); }
        try { localStorage.setItem("dg-like-" + p.id, liked ? "1" : "0"); } catch (e) {}
      });
      card.querySelector("[data-share]").addEventListener("click", function () {
        var url = location.href.split("#")[0] + "#" + p.id;
        if (navigator.share) return navigator.share({ title: p.title, text: p.caption, url: url }).catch(function () {});
        var done = function () { toast("Link gekopieerd"); };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { toast(url); });
        else toast(url);
      });
      // Tik op de video: pauze en verder (en geluid aan als het nog uit stond).
      // (De klik komt binnen op het frame, omdat dat de aanwijzer vasthoudt tijdens het vegen.)
      function tap(e) {
        if (!state.current || state.current.el !== card) return;
        // De klik die na het loslaten van een veeg komt (met de muis) telt niet als tik.
        if (performance.now() - lastSwipe < 500) return;
        // Via composedPath, want de geluidsknop vervangt zijn icoon tijdens de klik en dan hangt e.target los.
        var path = e.composedPath ? e.composedPath() : [e.target];
        for (var i = 0; i < path.length; i++) if (path[i].matches && path[i].matches("button, a")) return;
        if (v.muted) { sound(true); return v.play().catch(function () {}); }
        if (v.paused) v.play().catch(function () {}); else v.pause();
      }
      frame.addEventListener("click", tap);
      v.addEventListener("play", function () { card.classList.remove("paused"); });
      v.addEventListener("pause", function () { card.classList.add("paused"); });
      v.addEventListener("timeupdate", function () { if (v.duration) bar.style.width = (v.currentTime / v.duration * 100) + "%"; });
      return function () {
        frame.removeEventListener("click", tap); v.pause();
        // Een vooraf geladen video gaat terug naar de wachtrij, zodat hij de volgende keer weer meteen begint.
        if (VIDS[p.video] === v) { v.muted = true; try { v.currentTime = 0; } catch (e) {} shelf.appendChild(v); }
        else { v.removeAttribute("src"); v.load(); }
      };
    },
    bio: function (card) {
      var sheet = card.querySelector(".sheet"), open = card.querySelector("[data-sheet]");
      var end = card.querySelector(".end"), name = card.querySelector(".end h1");
      // De naam glijdt mee omhoog en komt precies boven de tekst te staan; de foto wordt donkerder.
      function set(on) {
        sheet.classList.toggle("open", on); sheet.setAttribute("aria-hidden", String(!on));
        open.setAttribute("aria-expanded", String(on));
        card.classList.toggle("bio-open", on);
        var below = end.getBoundingClientRect().bottom - name.getBoundingClientRect().bottom;
        end.style.transform = on ? "translateY(" + -(sheet.offsetHeight - below) + "px)" : "";
      }
      open.addEventListener("click", function () { set(true); });
      card.querySelector("[data-sheet-close]").addEventListener("click", function () { set(false); });
      function outside(e) {
        if (sheet.classList.contains("open") && !e.target.closest(".sheet, [data-sheet]")) set(false);
      }
      frame.addEventListener("click", outside);
      return function () { frame.removeEventListener("click", outside); };
    },
  };

  function book(el) {
    var ry = 28, rx = 8, vy = 0, vx = 0, dragging = false, lx = 0, ly = 0, idle = 0, raf;
    function down(e) {
      e.stopPropagation(); dragging = true; vy = 0; vx = 0; lx = e.clientX; ly = e.clientY;
      el.classList.add("dragging");
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    }
    function move(e) {
      if (!dragging) return;
      e.stopPropagation();
      var dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
      ry += dx * 0.6; rx -= dy * 0.5; vy = dx * 0.6; vx = -dy * 0.5; idle = 0;
    }
    function up() { dragging = false; el.classList.remove("dragging"); }
    function key(e) {
      var s = { ArrowLeft: -5, ArrowRight: 5 }[e.key];
      if (s) { vy = s; idle = 0; e.preventDefault(); e.stopPropagation(); }
    }
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("keydown", key);
    (function tick() {
      if (!dragging) {
        // Helemaal doordraaien mag, alle kanten op; na een tijdje kantelt hij rustig terug.
        ry += vy; vy *= 0.94; if (Math.abs(vy) < 0.02) vy = 0;
        rx += vx; vx *= 0.94; if (Math.abs(vx) < 0.02) vx = 0; idle++;
        if (!still && idle > 120) ry += 0.18;
        if (idle > 60 && !vx) { rx = ((rx + 180) % 360 + 360) % 360 - 180; rx += (8 - rx) * 0.03; }
      }
      el.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      raf = requestAnimationFrame(tick);
    })();
    return function () { cancelAnimationFrame(raf); };
  }

  // ---------- Ren, Dario! Een springspel zoals het dino-spel van Chrome ----------
  // 16-bit plaatjes: elk plaatje wordt op dubbele resolutie getekend (R pixels per spel-eenheid),
  // met schaduw, glimlichtjes en een donkere rand eromheen.
  var R = 2, INK = "#1b1b1b", BG = "#f2eee3";
  var C = {
    hair: "#2a1a10", hair2: "#4a2e1a", hair3: "#74502f", skin: "#f0c39c", skin2: "#d49a74", skin3: "#fbdcc0",
    lens: "#bfe0f2", mouth: "#a8483c", shirt: "#1d1d1f", shirt2: "#38383c", pants: "#34344a", pants2: "#1c1c22",
    pants3: "#55557a", white: "#ffffff", grey1: "#e8e8e8", grey2: "#c9c9c9", grey3: "#a0a0a0", grey4: "#6e6e6e",
    grey5: "#4a4a4a", grey6: "#2e2e2e", black: "#121212", red: "#e8202a", red2: "#a8141c", wine: "#8e1b2c",
    wine2: "#5e0f1c", wine3: "#c23a4f", green: "#1f4d2a", green2: "#2f6b3a", green3: "#5c9a64", cream: "#f6eccf",
    gold: "#d9a43a", sky: "#7fb3dc", sky2: "#a9cdea", sky3: "#5d93c0", cloud: "#ffffff", cloud2: "#dbe8f3",
    fire: "#ff5a36", fire2: "#ff9a2e", fire3: "#ffd76a", fire4: "#fff6d0"
  };
  function art(w, h, draw, noLine) {
    var c = document.createElement("canvas"), x = c.getContext("2d");
    c.width = w + 2; c.height = h + 2; var ox = 1, oy = 1;
    var g = {
      r: function (a, b, ww, hh, col) { x.fillStyle = col; x.fillRect(a + ox, b + oy, ww, hh); },
      clear: function (a, b, ww, hh) { x.clearRect(a + 1, b + 1, ww, hh); },
      // Vlak met hoekpunten [[x, y], ...], voor de isometrische platenspeler.
      poly: function (pts, col) {
        x.fillStyle = col;
        for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) {
          var px = xx + 0.5, py = yy + 0.5, inside = false;
          for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            var a = pts[i], b = pts[j];
            if ((a[1] > py) !== (b[1] > py) && px < (b[0] - a[0]) * (py - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
          }
          if (inside) x.fillRect(xx + 1, yy + 1, 1, 1);
        }
      },
      p: function (a, b, col) { x.fillStyle = col; x.fillRect(a + ox, b + oy, 1, 1); },
      // Alles hierna een stukje verschoven tekenen (voor het voorovergebogen hoofd).
      at: function (dx, dy) { ox = 1 + dx; oy = 1 + dy; },
      // Dikke lijn, voor armen en benen.
      line: function (x0, y0, x1, y1, t, col) {
        x.fillStyle = col;
        var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
        for (var i = 0; i <= n; i++) x.fillRect(Math.round(x0 + (x1 - x0) * i / n) + ox, Math.round(y0 + (y1 - y0) * i / n) + oy, t, t);
      },
      // Rondje of ovaal zonder vervaging, pixel voor pixel.
      d: function (cx, cy, rx, col, ry, from) {
        ry = ry || rx; x.fillStyle = col;
        for (var yy = Math.max(Math.floor(cy - ry), from || -99); yy <= cy + ry; yy++) for (var xx = Math.floor(cx - rx); xx <= cx + rx; xx++) {
          var dx = (xx + 0.5 - cx) / rx, dy = (yy + 0.5 - cy) / ry;
          if (dx * dx + dy * dy <= 1) x.fillRect(xx + ox, yy + oy, 1, 1);
        }
      }
    };
    draw(g);
    if (!noLine) {
      // Donkere rand om alles wat niet doorzichtig is: het 16-bit randje.
      var im = x.getImageData(0, 0, c.width, c.height), s = im.data, o = new Uint8ClampedArray(s);
      for (var yy = 0; yy < c.height; yy++) for (var xx = 0; xx < c.width; xx++) {
        var i = (yy * c.width + xx) * 4;
        if (s[i + 3]) continue;
        var near = (xx > 0 && s[i - 1]) || (xx < c.width - 1 && s[i + 7]) ||
          (yy > 0 && s[i - c.width * 4 + 3]) || (yy < c.height - 1 && s[i + c.width * 4 + 3]);
        if (near) { o[i] = 27; o[i + 1] = 27; o[i + 2] = 27; o[i + 3] = 255; }
      }
      x.putImageData(new ImageData(o, c.width, c.height), 0, 0);
    }
    // width/height in spel-eenheden; de rand valt er net buiten.
    return { c: c, width: w / R, height: h / R };
  }

  // Dario: krullen, bril, zwart shirt.
  function dario(g, pose) {
    var duck = pose === "duck", top = duck ? 1 : 0;
    if (!duck) g.at(2, pose === "jump" ? 0 : 1);
    var curls = [[6, 6], [10, 4], [14, 3], [18, 3], [22, 4], [26, 6], [4, 10], [28, 10], [4, 14], [28, 14], [8, 6], [24, 6], [16, 5]];
    curls.forEach(function (q) { g.d(q[0], q[1] + top, 3.6, C.hair); });
    curls.forEach(function (q, i) { if (i % 2 === 0) g.d(q[0] - 1, q[1] - 1 + top, 1.6, C.hair2); });
    [[9, 3], [15, 2], [21, 3], [26, 5]].forEach(function (q) { g.p(q[0], q[1] + top, C.hair3); g.p(q[0] + 1, q[1] + top, C.hair3); });
    // Gezicht met schaduw rechts en onder.
    g.r(7, 10 + top, 18, 12, C.skin); g.r(8, 22 + top, 16, 1, C.skin); g.r(23, 11 + top, 2, 11, C.skin2);
    g.r(9, 22 + top, 14, 1, C.skin2); g.r(8, 11 + top, 2, 3, C.skin3);
    g.r(5, 14 + top, 2, 4, C.skin); g.r(25, 14 + top, 2, 4, C.skin2);
    // Pony.
    [[9, 9], [13, 8], [17, 9], [21, 8], [24, 10]].forEach(function (q) { g.d(q[0], q[1] + top, 2.4, C.hair); });
    // Bril.
    g.r(8, 13 + top, 7, 5, INK); g.r(17, 13 + top, 7, 5, INK); g.r(15, 14 + top, 2, 1, INK);
    g.r(9, 14 + top, 5, 3, C.lens); g.r(18, 14 + top, 5, 3, C.lens);
    g.p(9, 14 + top, C.white); g.p(18, 14 + top, C.white);
    g.r(11, 15 + top, 2, 2, C.black); g.r(20, 15 + top, 2, 2, C.black);
    g.r(16, 18 + top, 1, 2, C.skin2);
    g.r(13, 20 + top, 6, 1, C.mouth); g.p(12, 19 + top, C.mouth); g.p(19, 19 + top, C.mouth);
    if (duck) {
      g.r(2, 24, 28, 3, C.shirt); g.r(4, 24, 6, 1, C.shirt2);
      g.r(0, 26, 6, 2, C.black); g.r(26, 26, 6, 2, C.black); g.r(0, 27, 6, 1, C.white); g.r(26, 27, 6, 1, C.white);
      return;
    }
    g.at(0, 0);
    // Rennend lijf: iets voorover, armen en benen zwaaien.
    function shoe(x, y) { g.r(x, y, 7, 2, C.black); g.r(x + 1, y, 2, 1, C.grey5); g.r(x, y + 2, 7, 1, C.white); }
    function arm(x0, y0, x1, y1, x2, y2) {
      g.line(x0, y0, x1, y1, 4, C.shirt); g.line(x1, y1, x2, y2, 3, C.skin);
      g.r(x2, y2, 3, 3, C.skin); g.p(x2 + 2, y2 + 2, C.skin2);
    }
    function leg(x0, y0, x1, y1, x2, y2) {
      g.line(x0, y0, x1, y1, 5, C.pants); g.line(x1, y1, x2, y2, 4, C.pants); g.line(x1 + 1, y1, x2 + 1, y2, 1, C.pants3);
    }
    g.r(14, 23, 6, 2, C.skin2);
    if (pose === "run1") {
      arm(9, 25, 5, 29, 1, 27);
      leg(10, 32, 6, 37, 3, 40); shoe(0, 40);
      leg(17, 32, 22, 37, 24, 42); shoe(23, 44);
    } else if (pose === "run2") {
      arm(9, 25, 8, 30, 6, 32);
      leg(10, 32, 11, 37, 11, 42); shoe(9, 44);
      leg(17, 32, 23, 35, 21, 39); shoe(20, 40);
    } else {
      arm(9, 25, 5, 22, 3, 18);
      leg(10, 32, 6, 36, 8, 39); shoe(5, 40);
      leg(17, 32, 23, 35, 24, 37); shoe(22, 38);
    }
    g.r(9, 24, 15, 1, C.shirt); g.r(8, 25, 17, 7, C.shirt); g.r(10, 26, 2, 5, C.shirt2); g.r(13, 25, 8, 1, C.shirt2);
    g.r(8, 31, 17, 1, C.black); g.r(15, 31, 2, 1, C.grey3);
    g.r(9, 32, 15, 2, C.pants); g.r(10, 32, 3, 1, C.pants3);
    if (pose === "run1") arm(22, 25, 26, 27, 28, 22);
    else if (pose === "run2") arm(22, 25, 25, 29, 27, 31);
    else arm(22, 25, 26, 21, 28, 17);
  }

  var ART = {
    run1: function () { return art(34, 47, function (g) { dario(g, "run1"); }); },
    run2: function () { return art(34, 47, function (g) { dario(g, "run2"); }); },
    jump: function () { return art(34, 43, function (g) { dario(g, "jump"); }); },
    duck: function () { return art(32, 28, function (g) { dario(g, "duck"); }); },
    // Infinite Jest, rechtop: de blauwe wolkenkaft voor, de rug met de titel links en het papierblok bovenop.
    boeken: function () {
      return art(20, 29, function (g) {
        function cover(u, v) {
          var cl = Math.sin(u * 9 + v * 3) + Math.sin(v * 14 - u * 4) + Math.sin((u + v) * 7);
          if (v > 0.1 && v < 0.24 && u > 0.12 && u < 0.88) return (Math.floor(u * 22) % 3 && Math.floor(v * 40) % 4) ? C.white : C.sky;
          if (v > 0.84 && v < 0.9 && u > 0.2 && u < 0.8) return "#2f5a86";
          if (cl > 1.3) return C.cloud;
          if (cl > 1.0) return C.cloud2;
          return v < 0.4 ? C.sky2 : C.sky;
        }
        // Voorkant
        for (var y = 4; y < 29; y++) for (var x = 6; x < 20; x++) g.p(x, y, cover((x - 6 + 0.5) / 14, (y - 4 + 0.5) / 25));
        // Rug: schuin naar achteren, met de titel in witte streepjes van boven naar beneden.
        g.poly([[0, 1], [6, 4], [6, 29], [0, 26]], C.sky3);
        for (var yy = 6; yy < 22; yy++) if (yy % 3) g.p(3, yy, C.white);
        g.r(1, 23, 4, 1, "#2f5a86");
        // Bovenkant: het dikke papierblok.
        g.poly([[0, 1], [14, 1], [20, 4], [6, 4]], C.cream);
        g.line(3, 2, 15, 2, 1, "#ddd3b8"); g.line(5, 3, 17, 3, 1, "#ddd3b8");
      });
    },
    wijnglas: function () {
      return art(14, 22, function (g) {
        g.d(7, 5, 6.5, C.grey1, 7); g.d(7, 5, 5.5, "#fafafa", 6); g.clear(0, 0, 14, 2);
        g.d(7, 5, 5.5, C.wine, 6, 5); g.r(2, 5, 10, 1, C.wine3); g.r(3, 8, 1, 2, C.wine2); g.r(10, 7, 1, 3, C.wine2);
        g.r(2, 2, 1, 5, C.white);
        g.r(6, 12, 2, 7, C.grey2); g.p(6, 13, C.white);
        g.d(7, 20.5, 6, C.grey2, 1.5); g.r(3, 20, 4, 1, C.white);
      });
    },
    // Een flesje rood: donkergroen glas, crème etiket, rode capsule.
    fles: function () {
      return art(10, 24, function (g) {
        g.r(3, 0, 4, 4, C.red2); g.r(3, 0, 1, 4, C.red);
        g.r(3, 4, 4, 4, C.green); g.r(2, 8, 6, 2, C.green); g.r(1, 10, 8, 14, C.green);
        g.r(2, 10, 1, 13, C.green3); g.r(4, 4, 1, 5, C.green2); g.r(7, 11, 1, 12, "#143820");
        g.r(1, 14, 8, 6, C.cream); g.r(1, 19, 8, 1, C.gold); g.r(3, 15, 4, 2, C.wine); g.r(3, 18, 4, 1, C.grey3);
      });
    },
    // Een losse handmicrofoon, rechtop, met de kabel over de grond.
    microfoon: function () {
      return art(18, 26, function (g) {
        g.d(6, 5, 5, C.grey3); g.d(5.3, 4.3, 3.8, C.grey2);
        for (var yy = 1; yy < 10; yy += 2) for (var xx = 1; xx < 12; xx += 2) g.p(xx + ((yy >> 1) % 2), yy, C.grey4);
        g.p(3, 2, C.white); g.p(4, 2, C.white); g.p(2, 3, C.white);
        g.r(2, 9, 8, 2, C.grey2); g.r(2, 9, 8, 1, C.grey1);
        g.r(2, 11, 8, 4, C.black); g.r(3, 15, 6, 5, C.black); g.r(4, 20, 4, 3, C.black);
        g.r(3, 11, 1, 4, C.grey5); g.r(4, 15, 1, 5, C.grey5); g.r(8, 11, 1, 4, C.grey6);
        g.r(4, 23, 4, 2, C.grey3); g.r(4, 23, 1, 2, C.grey1);
        g.r(5, 25, 2, 1, C.black); g.r(7, 25, 6, 1, C.black); g.r(12, 24, 3, 1, C.black); g.r(15, 25, 3, 1, C.black);
      });
    },
    plaat: function () {
      return art(20, 20, function (g) {
        g.d(10, 10, 10, C.black); g.d(10, 10, 8.4, C.grey6); g.d(10, 10, 7.6, C.black);
        g.d(10, 10, 6, C.grey6); g.d(10, 10, 5.3, C.black);
        g.d(10, 10, 3.6, C.red); g.d(9.4, 9.4, 2.4, "#ff4b52"); g.d(10, 10, 0.9, BG);
        g.r(3, 5, 1, 2, C.grey3); g.r(4, 4, 1, 1, C.grey3); g.r(15, 14, 1, 2, C.grey4);
      });
    },
    // Isometrische platenspeler: kastje met bovenblad, plateau en toonarm.
    draaitafel: function () {
      return art(34, 21, function (g) {
        var A = [1, 9], B = [17, 1], Cc = [33, 9], D = [17, 17];
        g.poly([A, D, [17, 21], [1, 13]], C.grey5);
        g.poly([D, Cc, [33, 13], [17, 21]], C.grey6);
        g.poly([A, B, Cc, D], C.grey3);
        g.poly([[3, 9], B, [17, 2.5], [4, 9]], C.grey2);
        g.r(1, 9, 1, 4, C.grey4); g.r(17, 17, 1, 4, C.grey4);
        g.d(15, 9, 9.5, C.black, 4.8); g.d(15, 9, 7.5, C.grey6, 3.6); g.d(15, 9, 6.5, C.black, 3.1);
        g.d(15, 9, 3, C.red, 1.6); g.p(15, 9, C.grey1); g.r(10, 7, 3, 1, C.grey4);
        g.d(26, 7, 1.8, C.grey1, 1.2); g.r(25, 8, 1, 2, C.grey2); g.r(23, 10, 2, 1, C.grey1); g.r(21, 11, 2, 1, C.grey1); g.r(20, 11, 1, 2, C.black);
        g.r(27, 11, 2, 1, C.red); g.r(29, 10, 1, 1, C.fire3);
      });
    },
    // Funktion One Evo: donkerpaarse kast, grijze hoorns (klein voor hoog, groot met lens voor midden), basopening onder.
    speaker: function () {
      var P1 = "#2c2850", P2 = "#433d73", P3 = "#16142b", H1 = "#e4e4e4", H2 = "#c8c8c8", H3 = "#a9a9a9", H4 = "#8c8c8c";
      return art(24, 32, function (g) {
        g.r(0, 0, 24, 32, P1); g.r(0, 0, 24, 1, P2); g.r(0, 0, 1, 32, P2); g.r(23, 1, 1, 31, P3);
        g.poly([[5, 2], [19, 2], [22, 5], [22, 18], [2, 18], [2, 5]], H2);
        g.r(8, 3, 8, 5, H3); g.poly([[9, 4], [15, 4], [13, 7], [11, 7]], H4); g.p(12, 5, P3); g.r(8, 7, 8, 1, H1);
        g.r(3, 9, 18, 9, H3); g.poly([[4, 10], [20, 10], [17, 17], [7, 17]], H4);
        g.poly([[7, 13], [12, 11], [17, 13], [12, 14]], H1); g.poly([[7, 13], [17, 13], [12, 15]], H2);
        g.r(3, 17, 18, 1, H1); g.r(15, 16, 5, 1, H3);
        [[3, 3], [20, 3], [3, 16], [20, 16]].forEach(function (q) { g.p(q[0], q[1], H1); });
        g.r(2, 18, 20, 3, P1); g.p(3, 19, P2); g.p(20, 19, P2);
        g.r(2, 21, 20, 9, P3); g.r(2, 21, 20, 1, "#0d0c1a"); g.r(11, 22, 2, 8, P1); g.r(11, 22, 1, 8, P2);
        g.p(3, 28, P2); g.p(20, 28, P2); g.r(0, 30, 24, 2, P1); g.r(0, 31, 24, 1, P3);
      });
    },
    // Een USB-stick, rechtop, met een rood lampje.
    usb: function () {
      return art(10, 18, function (g) {
        g.r(2, 0, 6, 6, C.grey2); g.r(2, 0, 6, 1, C.grey1); g.r(3, 2, 1, 2, C.grey5); g.r(6, 2, 1, 2, C.grey5); g.r(7, 1, 1, 5, C.grey3);
        g.r(1, 6, 8, 12, C.black); g.r(1, 6, 8, 1, C.grey5); g.r(2, 7, 1, 10, C.grey6);
        g.r(3, 10, 4, 4, C.red); g.r(3, 10, 2, 1, "#ff6b6b"); g.p(7, 16, C.red);
      });
    },
    // Een zak Knauf Goldband: witte zak, blauw logo, lichtblauw vlak en de oranje band onderaan.
    stuc: function () {
      var W1 = "#ffffff", W2 = "#e3e8ec", B1 = "#1f5fae", B2 = "#bcd9ef", O1 = "#ee6a1f", O2 = "#c4500f";
      return art(22, 28, function (g) {
        g.poly([[1, 1], [21, 1], [22, 27], [0, 27]], W1);
        g.r(1, 0, 20, 2, W2); for (var xx = 1; xx < 21; xx += 2) g.p(xx, 0, "#c9d0d6");
        g.r(20, 2, 2, 25, W2); g.r(0, 2, 1, 25, W2);
        g.r(15, 2, 1, 2, INK); g.r(17, 2, 1, 2, INK); g.r(18, 2, 1, 2, INK); g.r(20, 2, 1, 2, INK);
        // KNAUF in blauwe pixelletters.
        var F = { K: ["X.X", "XX.", "X..", "XX.", "X.X"], N: ["X.X", "XXX", "XXX", "X.X", "X.X"], A: [".X.", "X.X", "XXX", "X.X", "X.X"],
          U: ["X.X", "X.X", "X.X", "X.X", "XXX"], Fa: ["XXX", "X..", "XX.", "X..", "X.."] };
        ["K", "N", "A", "U", "Fa"].forEach(function (L, i) {
          F[L].forEach(function (row, yy) { for (var k = 0; k < 3; k++) if (row[k] === "X") g.p(2 + i * 4 + k, 5 + yy, B1); });
        });
        g.r(2, 11, 18, 7, B2); g.r(6, 13, 6, 3, "#7fb3dc"); g.r(12, 12, 2, 2, C.skin); g.p(5, 12, B1); g.r(15, 12, 3, 1, B1); g.r(15, 14, 3, 1, B1);
        g.r(0, 19, 22, 8, O1); g.r(0, 19, 22, 1, "#ff8a3d"); g.r(0, 26, 22, 1, O2);
        [2, 3, 5, 6, 8, 10, 11, 13, 14, 16, 17, 19].forEach(function (x2) { g.r(x2, 21, 1, 2, W1); });
        g.r(14, 24, 5, 1, W1);
      });
    },
    // David Vunk: kale kop, zonnebril, rood bomberjack, zwart shirt, spijkerbroek, rode sneakers en een 808 onder de arm.
    vunk: function () {
      var J1 = "#c8202a", J2 = "#e8473a", J3 = "#8e141c", JE = "#f3b61f", D1 = "#3c5a8a", D2 = "#5a7cb0", D3 = "#2a3f63";
      return art(24, 38, function (g) {
        // Hoofd
        g.d(12, 6, 5.5, C.skin, 6); g.r(15, 3, 2, 8, C.skin2); g.r(9, 1, 3, 2, C.skin3);
        g.r(5, 6, 2, 3, C.skin); g.r(17, 6, 2, 3, C.skin2);
        g.r(6, 5, 12, 2, INK); g.r(7, 7, 4, 1, INK); g.r(13, 7, 4, 1, INK); g.p(8, 5, C.grey4); g.p(14, 5, C.grey4);
        g.r(10, 10, 4, 1, C.mouth); [8, 10, 13, 15].forEach(function (x2) { g.p(x2, 11, C.skin2); });
        g.r(10, 12, 4, 1, C.skin2);
        // Bomberjack met print, open over een zwart shirt
        g.r(5, 13, 14, 12, J1); g.r(3, 14, 3, 9, J1); g.r(18, 14, 3, 9, J1);
        [[6, 15], [8, 18], [6, 21], [16, 15], [17, 19], [15, 22], [4, 17], [19, 17], [4, 21], [20, 21]].forEach(function (q) { g.p(q[0], q[1], JE); g.p(q[0] + 1, q[1] + 1, C.white); });
        g.r(5, 13, 1, 12, J2); g.r(18, 13, 1, 12, J3);
        g.r(9, 13, 6, 12, C.shirt); g.r(9, 13, 6, 1, INK); g.r(10, 15, 4, 3, C.white); g.r(11, 16, 2, 1, C.shirt);
        g.r(5, 24, 14, 1, INK); g.r(3, 23, 3, 1, INK); g.r(18, 23, 3, 1, INK);
        g.r(19, 24, 2, 2, C.skin);
        // De 808 onder de arm
        g.r(0, 19, 12, 7, C.grey6); g.r(0, 19, 12, 1, C.grey4); g.r(1, 21, 10, 1, C.grey5);
        [1, 3, 5, 7, 9].forEach(function (x2, i) { g.p(x2, 20, i % 2 ? C.red : C.grey2); });
        for (var x3 = 1; x3 < 11; x3++) g.p(x3, 24, x3 < 4 ? C.red : x3 < 7 ? C.fire2 : x3 < 9 ? C.fire3 : C.white);
        g.r(1, 22, 3, 1, C.fire3);
        g.r(2, 26, 3, 1, C.skin);
        // Spijkerbroek en rode sneakers
        g.r(6, 25, 12, 3, D1); g.r(6, 28, 5, 7, D1); g.r(13, 28, 5, 7, D1); g.r(7, 26, 1, 9, D2); g.r(16, 28, 1, 7, D3);
        g.r(11, 28, 2, 2, D3);
        g.r(5, 35, 7, 2, C.red); g.r(13, 35, 7, 2, C.red); g.r(5, 37, 7, 1, C.white); g.r(13, 37, 7, 1, C.white); g.r(6, 35, 2, 1, "#ff6b6b"); g.r(14, 35, 2, 1, "#ff6b6b");
      });
    },
    // Een robijn: rode geslepen edelsteen met facetten en een glinstering.
    robijn: function () {
      var R1 = "#cc0f2e", R2 = "#f0344f", R3 = "#7f0a1f", R4 = "#ff8f9f";
      return art(20, 18, function (g) {
        g.poly([[5, 0], [15, 0], [20, 6], [0, 6]], R2);
        g.poly([[0, 6], [20, 6], [10, 18]], R1);
        g.poly([[5, 0], [8, 0], [6, 6], [2, 6]], R4); g.poly([[12, 0], [15, 0], [18, 6], [14, 6]], R1);
        g.poly([[8, 0], [12, 0], [14, 6], [6, 6]], R2);
        g.poly([[0, 6], [6, 6], [10, 18]], R2); g.poly([[14, 6], [20, 6], [10, 18]], R3);
        g.poly([[6, 6], [14, 6], [10, 18]], R1);
        g.r(0, 6, 20, 1, R3); g.r(6, 1, 2, 1, C.white); g.p(5, 2, C.white);
        g.p(16, 2, C.white); g.p(15, 3, R4); g.p(17, 3, R4); g.p(16, 4, R4);
      });
    },
    // Een steen: de rode baksteen van de Vier Weekenden-cover.
    steen: function () {
      var R1 = "#e8202a", R2 = "#ff5a4f", R3 = "#a8141c";
      return art(22, 12, function (g) {
        g.poly([[0, 4], [5, 0], [22, 0], [17, 4]], R2);
        g.r(0, 4, 17, 8, R1); g.poly([[17, 4], [22, 0], [22, 8], [17, 12]], R3);
        g.p(3, 6, R2); g.p(9, 8, R3); g.p(13, 6, R3); g.p(6, 10, R3); g.p(11, 2, "#ff8a80"); g.p(15, 1, R1);
      });
    },
    // Een abstract schilderij van een vrouw op een schildersezel.
    schilderij: function () {
      var W1 = "#a0703c", W2 = "#6e4a24", W3 = "#c99560";
      return art(24, 34, function (g) {
        // Ezel: twee poten voor, één achter, en een plankje waar het doek op staat.
        g.line(12, 0, 11, 33, 2, W2);
        g.line(9, 0, 2, 33, 2, W1); g.line(14, 0, 21, 33, 2, W1);
        g.r(10, 0, 4, 2, W3);
        // Het doek
        g.r(2, 3, 20, 20, "#fbf6ea");
        g.poly([[2, 3], [13, 3], [2, 17]], "#2f6fd6");
        g.poly([[22, 3], [22, 15], [12, 23], [22, 23]], "#f3b61f");
        g.d(13, 11, 6, "#ff8cc0", 7.5);
        g.poly([[13, 4], [19, 9], [13, 18]], "#f05a28");
        g.d(9, 9, 2.4, C.white); g.d(9.5, 9, 1, INK);
        g.d(16, 13, 1.6, C.white); g.p(16, 13, INK);
        g.line(5, 20, 12, 15, 1, INK); g.line(12, 15, 18, 21, 1, INK);
        g.r(11, 17, 3, 2, C.red);
        g.r(17, 5, 3, 3, "#1f4d2a"); g.d(5, 20, 1.6, C.red);
        // Lijstje en plankje
        g.r(2, 3, 20, 1, W2); g.r(2, 22, 20, 1, W2); g.r(2, 3, 1, 20, W2); g.r(21, 3, 1, 20, W2);
        g.r(0, 23, 24, 2, W1); g.r(0, 23, 24, 1, W3);
      });
    },
    discobal: function () { return ball(0); },
    discobal2: function () { return ball(1); },
    vuur: function () { return pyro(0); },
    vuur2: function () { return pyro(1); }
  };
  // Moving head: hangt aan een truss, de kop draait heen en weer en de lamp wisselt van kleur.
  function ball(f) {
    return art(22, 22, function (g) {
      g.r(0, 0, 22, 3, C.grey3); g.r(0, 0, 22, 1, C.grey1);
      for (var xx = 1; xx < 22; xx += 4) { g.p(xx, 1, C.grey5); g.p(xx + 1, 2, C.grey5); }
      g.r(7, 3, 8, 3, C.black); g.r(8, 3, 3, 1, C.grey5);
      g.r(3, 6, 16, 2, C.black); g.r(3, 8, 3, 7, C.black); g.r(16, 8, 3, 7, C.black); g.r(4, 6, 6, 1, C.grey5);
      var lx = f ? 1 : -1, lamp = f ? "#7ad8ff" : "#ff4fb3", glow = f ? "#d6f4ff" : "#ffd0ea";
      g.d(11 + lx, 15, 6, C.grey6, 5.5); g.d(11 + lx, 14.5, 5, C.grey5, 4.5);
      g.d(11 + lx * 2, 17, 3.6, C.black, 3.2); g.d(11 + lx * 2, 17.2, 2.6, lamp, 2.3); g.d(10.5 + lx * 2, 16.5, 1, glow);
      g.r(6 + lx, 11, 2, 1, C.grey3); g.r(5, 11, 1, 3, C.grey4); g.r(16, 11, 1, 3, C.grey4);
    });
  }
  // Pyrotechniek: een vuurstraal uit een zwart podiumkastje.
  function pyro(f) {
    return art(16, 24, function (g) {
      var s = f ? 1 : -1;
      g.d(8, 13, 7, C.fire, 8); g.d(8 + s, 5, 4, C.fire, 5); g.d(8 - s * 2, 2, 2, C.fire, 2.5);
      g.d(8, 14, 5, C.fire2, 6); g.d(8 + s, 8, 3, C.fire2, 4);
      g.d(8, 15, 3.4, C.fire3, 4.5); g.d(8, 17, 2, C.fire4, 3);
      g.p(3 - s, 6, C.fire3); g.p(13 + s, 9, C.fire3); g.p(2, 12 + f, C.fire2);
      g.r(1, 19, 14, 5, C.black); g.r(1, 19, 14, 1, C.grey5); g.r(3, 21, 3, 1, C.red); g.r(10, 21, 3, 1, C.grey4);
    });
  }
  var NAMES = { boeken: "Infinite Jest", wijnglas: "een glaasje rood", fles: "Châteauneuf-du-Pape", microfoon: "een microfoon",
    plaat: "vinyl", draaitafel: "een SL-1200", vliegplaat: "een rondvliegende plaat",
    speaker: "Funktion One", discobal: "een moving head", vuur: "pyrotechniek", stuiterplaat: "Vliegend Vinyl",
    usb: "een USB-stick", stuc: "Knauf Goldband", vunk: "David Vunk", robijn: "Kando Shimasu", steen: "Baksteen",
    schilderij: "kunst" };
  var IMG = null;

  // Titellogo in 16-bit letters: geel naar rood, donkere rand en een schaduw eronder.
  var FONT = {
    D: ["11110", "11011", "11011", "11011", "11011", "11011", "11110"],
    A: ["01110", "11011", "11011", "11111", "11011", "11011", "11011"],
    R: ["11110", "11011", "11011", "11110", "11011", "11011", "11011"],
    I: ["11", "11", "11", "11", "11", "11", "11"],
    O: ["01110", "11011", "11011", "11011", "11011", "11011", "01110"],
    "'": ["11", "11", "01", "00", "00", "00", "00"],
    S: ["01111", "11000", "11000", "01110", "00011", "00011", "11110"],
    G: ["01111", "11000", "11000", "11011", "11011", "11011", "01111"],
    E: ["11111", "11000", "11000", "11110", "11000", "11000", "11111"],
    T: ["111111", "001100", "001100", "001100", "001100", "001100", "001100"],
    V: ["11011", "11011", "11011", "11011", "11011", "01110", "00100"],
    N: ["110011", "111011", "111111", "110111", "110011", "110011", "110011"],
    M: ["110011", "111111", "111111", "110011", "110011", "110011", "110011"],
    U: ["11011", "11011", "11011", "11011", "11011", "11011", "01110"],
    " ": ["000", "000", "000", "000", "000", "000", "000"]
  };
  var LOGO_COLS = ["#fff6c2", "#ffe066", "#ffc93c", "#ff9f1c", "#ff6b1a", "#f2392b", "#c81d25"];
  function logo(lines) {
    function width(t, sc) { var w = 0; for (var i = 0; i < t.length; i++) w += (FONT[t[i]][0].length + 1) * sc; return w - sc; }
    var W = 0; lines.forEach(function (l) { W = Math.max(W, width(l[0], l[1])); });
    var pad = 4, gap = 6, H = pad * 2 + 2 - gap;
    lines.forEach(function (l) { H += 7 * l[1] + gap; });
    W += pad * 2;
    var c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d"), y = pad;
    lines.forEach(function (l) {
      var t = l[0], sc = l[1], cx = Math.round((W - width(t, sc)) / 2);
      for (var i = 0; i < t.length; i++) {
        var gl = FONT[t[i]];
        for (var r = 0; r < 7; r++) for (var q = 0; q < gl[r].length; q++) if (gl[r][q] === "1") {
          for (var sy = 0; sy < sc; sy++) {
            // Kleur per pixelrij: bovenaan licht, onderaan rood.
            x.fillStyle = LOGO_COLS[Math.min(6, Math.floor((r * sc + sy) * 7 / (7 * sc)))];
            x.fillRect(cx + q * sc, y + r * sc + sy, sc, 1);
          }
        }
        cx += (gl[0].length + 1) * sc;
      }
      y += 7 * sc + gap;
    });
    // Donkere rand rondom (ook schuin), daarna een schaduw twee pixels lager.
    var im = x.getImageData(0, 0, W, H), d = im.data, o = new Uint8ClampedArray(d);
    function on(a, b) { return a >= 0 && b >= 0 && a < W && b < H && d[(b * W + a) * 4 + 3]; }
    for (var yy = 0; yy < H; yy++) for (var xx = 0; xx < W; xx++) {
      var k = (yy * W + xx) * 4;
      if (d[k + 3]) continue;
      if (on(xx - 1, yy) || on(xx + 1, yy) || on(xx, yy - 1) || on(xx, yy + 1) || on(xx - 1, yy - 1) || on(xx + 1, yy - 1) || on(xx - 1, yy + 1) || on(xx + 1, yy + 1)) {
        o[k] = 27; o[k + 1] = 27; o[k + 2] = 27; o[k + 3] = 255;
      } else if (on(xx, yy - 2) || on(xx - 1, yy - 2) || on(xx - 1, yy - 3)) {
        o[k] = 110; o[k + 1] = 14; o[k + 2] = 20; o[k + 3] = 255;
      }
    }
    im.data.set(o); x.putImageData(im, 0, 0);
    return c;
  }

  function runner(card) {
    if (!IMG) { IMG = {}; Object.keys(ART).forEach(function (k) { IMG[k] = ART[k](); }); }
    var wrap = card.querySelector(".run-wrap"), canvas = card.querySelector("canvas"), ctx = canvas.getContext("2d");
    var over = card.querySelector(".snake-over"), msg = card.querySelector("[data-msg]");
    var scoreEl = card.querySelector("[data-score]"), bestEl = card.querySelector("[data-best]");
    var VW = 100, VH = 200, k = 1, ground = 150;
    var me, obs, speed, dist, score, nextGap, lastKind = null, duckTold = false, duckTip = 0, raf = null, last = 0, t = 0, duckUntil = 0, playing = false;
    var best = 0;
    try { best = +localStorage.getItem("dg-run-best") || 0; } catch (e) {}
    bestEl.textContent = "Je record: " + best;
    // Muziek: begint bij de eerste keer spelen (dan mag de browser geluid afspelen) en loopt door tot je wegveegt.
    var musicBtn = card.querySelector("[data-music]"), musicOn = true, song = null;
    try { musicOn = localStorage.getItem("dg-run-music") !== "uit"; } catch (e) {}
    function musicIcon() {
      musicBtn.setAttribute("aria-pressed", String(musicOn)); musicBtn.setAttribute("aria-label", musicOn ? "Muziek uit" : "Muziek aan");
      musicBtn.innerHTML = musicOn ? ICONS.sound : ICONS.muted;
    }
    function music(fromStart) {
      if (!musicOn) { if (song) song.pause(); return; }
      if (!song) { song = new Audio("audio/vier-weekenden-club.mp3"); song.loop = true; song.volume = 0.7; }
      if (fromStart) song.currentTime = 0;
      song.play().catch(function () {});
    }
    musicIcon();
    musicBtn.addEventListener("click", function () {
      musicOn = !musicOn; musicIcon();
      try { localStorage.setItem("dg-run-music", musicOn ? "aan" : "uit"); } catch (e) {}
      if (!musicOn) { if (song) song.pause(); } else if (playing) music();
    });
    // Doodgaan: een Pac-Man-achtig wegzakkend deuntje, met Web Audio gemaakt.
    var actx = null;
    function wakeAudio() {
      try { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); } catch (e) { actx = null; }
    }
    function deathSound() {
      if (!musicOn || !actx) return;
      try {
        var t0 = actx.currentTime + 0.05, out = actx.createGain();
        out.gain.value = 0.16; out.connect(actx.destination);
        function blip(at, f0, f1, dur) {
          var o = actx.createOscillator(), gn = actx.createGain();
          o.type = "square"; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + dur);
          gn.gain.setValueAtTime(1, at); gn.gain.setValueAtTime(0, at + dur);
          o.connect(gn); gn.connect(out); o.start(at); o.stop(at + dur + 0.02);
        }
        // Telkens een golfje omhoog en weer omlaag, steeds een beetje lager.
        for (var i = 0; i < 9; i++) {
          var hi = 1000 - i * 75, at = t0 + i * 0.13;
          blip(at, hi * 0.55, hi, 0.065); blip(at + 0.065, hi, hi * 0.5, 0.065);
        }
        var end = t0 + 9 * 0.13 + 0.08;
        blip(end, 220, 70, 0.11); blip(end + 0.16, 220, 70, 0.11);
      } catch (e) {}
    }

    function size() {
      var r = canvas.getBoundingClientRect();
      if (!r.width) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      k = canvas.width / VW; VH = canvas.height / k; ground = Math.round(VH * 0.68);
      draw();
    }
    function reset() {
      me = { y: 0, vy: 0 }; obs = []; speed = 60; dist = 0; score = 0; t = 0; nextGap = 90; duckUntil = 0;
      scoreEl.textContent = "score 0";
    }
    function onGround() { return me.y >= 0; }
    function jump() { if (playing && onGround() && performance.now() > duckUntil) me.vy = -178; }
    function duck() { if (!playing) return; duckUntil = performance.now() + 520; if (!onGround()) me.vy = Math.max(me.vy, 260); }
    function spawn() {
      var kinds = ["boeken", "wijnglas", "fles", "microfoon", "plaat", "draaitafel", "speaker", "vuur", "usb", "stuc", "vunk", "robijn", "steen", "schilderij"];
      // Nooit twee keer hetzelfde ding achter elkaar (alle platen tellen als hetzelfde).
      function look(k) { return k === "vliegplaat" || k === "stuiterplaat" ? "plaat" : k; }
      var kind, tries = 0;
      do {
        var r0 = Math.random();
        kind = kinds[Math.floor(Math.random() * kinds.length)];
        // Hoe verder je komt, hoe gekker het wordt: moving heads om onderdoor te duiken, stuiterende en vliegende platen.
        if (score > 60 && r0 < 0.18) kind = "discobal";
        else if (score > 120 && r0 < 0.32) kind = "stuiterplaat";
        else if (score > 150 && r0 < 0.42) kind = "vliegplaat";
      } while (look(kind) === lastKind && ++tries < 20);
      lastKind = look(kind);
      // De eerste keer dat er iets hangt of vliegt: even laten zien dat je kunt bukken.
      if (!duckTold && (kind === "discobal" || kind === "vliegplaat")) { duckTold = true; duckTip = t + 2.2; }
      var img = IMG[kind === "vliegplaat" || kind === "stuiterplaat" ? "plaat" : kind];
      var y = kind === "vliegplaat" ? ground - 25 : kind === "discobal" ? ground - 26 : ground - img.height;
      obs.push({ kind: kind, img: img, x: VW + 4, y: y, base: y, ph: Math.random() * 6 });
      // Soms twee kleine dingen vlak achter elkaar.
      if (score > 100 && Math.random() < 0.2 && (kind === "wijnglas" || kind === "fles" || kind === "microfoon")) {
        var k2 = kind === "wijnglas" ? "fles" : kind === "fles" ? "wijnglas" : Math.random() < 0.5 ? "wijnglas" : "fles", img2 = IMG[k2];
        lastKind = k2;
        obs.push({ kind: k2, img: img2, x: VW + 4 + img.width + 4, y: ground - img2.height, base: ground - img2.height, ph: 0 });
      }
      // Altijd genoeg ruimte om te landen en weer af te zetten.
      // Soms snel achter elkaar, soms een lange adempauze, zodat het ritme niet voorspelbaar wordt.
      var r = Math.random();
      nextGap = speed * 0.7 + 28 + (r < 0.35 ? Math.random() * speed * 0.25 : r < 0.8 ? speed * (0.4 + Math.random() * 0.9) : speed * (1.5 + Math.random() * 1.8));
    }
    function hitbox() {
      var d = performance.now() < duckUntil && onGround(), img = d ? IMG.duck : IMG.run1;
      var top = ground + me.y - img.height;
      return { x: 18 + 4, y: top + 3, w: img.width - 8, h: img.height - 4, img: d ? "duck" : null };
    }
    // Gaat er toch iets mis, dan stopt het spel netjes en kun je gewoon weer vegen.
    function safe(now) {
      try { step(now); } catch (err) {
        playing = false; cancelAnimationFrame(raf); raf = null; state.locked = null; over.hidden = false;
        if (window.console) console.error(err);
      }
    }
    function step(now) {
      var dt = Math.min(0.033, (now - last) / 1000 || 0); last = now; t += dt;
      speed = 60 + Math.min(70, t * 1.8);
      me.vy += 520 * dt; me.y = Math.min(0, me.y + me.vy * dt); if (me.y === 0) me.vy = 0;
      var dx = speed * dt; dist += dx;
      obs.forEach(function (o) {
        o.x -= dx * (o.kind === "vliegplaat" ? 1.15 : 1);
        if (o.kind === "stuiterplaat") o.y = o.base - Math.abs(Math.sin(t * 5 + o.ph)) * 16;
        if (o.kind === "discobal") o.img = Math.floor(t * 6) % 2 ? IMG.discobal2 : IMG.discobal;
        if (o.kind === "vuur") o.img = Math.floor(t * 8 + o.ph) % 2 ? IMG.vuur2 : IMG.vuur;
      });
      obs = obs.filter(function (o) { return o.x > -20; });
      var lastObs = obs[obs.length - 1];
      if (!lastObs || VW - lastObs.x > nextGap) spawn();
      score = Math.floor(dist / 6); scoreEl.textContent = "score " + score;
      var b = hitbox();
      for (var i = 0; i < obs.length; i++) {
        var o = obs[i];
        if (b.x < o.x + o.img.width - 1 && b.x + b.w > o.x + 1 && b.y < o.y + o.img.height - 1 && b.y + b.h > o.y + 1) return end(o);
      }
      draw();
      raf = requestAnimationFrame(safe);
    }
    // Plaatjes op halve eenheden neerzetten, met de rand van 1 pixel eromheen.
    function put(a, x, y) {
      x = Math.round(x * R) / R; y = Math.round(y * R) / R;
      ctx.drawImage(a.c, x - 1 / R, y - 1 / R, a.c.width / R, a.c.height / R);
    }
    function draw() {
      if (!canvas.width) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(k, 0, 0, k, 0, 0); ctx.imageSmoothingEnabled = false;
      // Festivalterrein in de verte: podium, tenten en lichtmasten, die langzaam meeschuiven.
      var far = ((dist || 0) * 0.15) % 140;
      for (var fx = -far; fx < VW; fx += 140) {
        ctx.fillStyle = "#e7e0cf";
        ctx.fillRect(fx + 8, ground - 30, 44, 30); ctx.fillRect(fx + 4, ground - 34, 52, 5);
        ctx.fillRect(fx + 70, ground - 12, 24, 12); ctx.fillRect(fx + 74, ground - 16, 16, 4); ctx.fillRect(fx + 79, ground - 19, 6, 3);
        ctx.fillRect(fx + 110, ground - 44, 2, 44); ctx.fillRect(fx + 106, ground - 46, 10, 3);
        ctx.fillStyle = "#ddd4bf";
        ctx.fillRect(fx + 14, ground - 26, 32, 14); ctx.fillRect(fx + 98, ground - 9, 30, 9); ctx.fillRect(fx + 102, ground - 12, 22, 3);
        ctx.fillStyle = "#f3c9b8";
        for (var lx = 0; lx < 5; lx++) ctx.fillRect(fx + 10 + lx * 10, ground - 33, 2, 2);
        ctx.fillRect(fx + 107, ground - 45, 2, 1); ctx.fillRect(fx + 113, ground - 45, 2, 1);
      }
      // Grond: een randje, een band met een ruitjespatroon en steentjes die meeschuiven.
      ctx.fillStyle = "#e3dbc7"; ctx.fillRect(0, ground, VW, VH - ground);
      var off = (dist || 0) % 40, tile = (dist || 0) % 4;
      ctx.fillStyle = "#d6ccb4";
      for (var tx = -tile; tx < VW; tx += 4) { ctx.fillRect(tx, ground + 1, 2, 1.5); ctx.fillRect(tx + 2, ground + 2.5, 2, 1.5); }
      ctx.fillStyle = "#1b1b1b"; ctx.fillRect(0, ground, VW, 1);
      ctx.fillStyle = "#b9ae95";
      for (var x = -off; x < VW; x += 40) { ctx.fillRect(x + 6, ground + 6, 3, 1); ctx.fillRect(x + 25, ground + 10, 2, 1); ctx.fillRect(x + 34, ground + 7, 1, 1); }
      // Muzieknootjes als wolken.
      ctx.fillStyle = "#c9c2b0";
      for (var n = 0; n < 2; n++) {
        var nx = ((n * 55 + 30) - (dist || 0) * 0.25) % (VW + 30); if (nx < -10) nx += VW + 30;
        var ny = ground - 60 - n * 16;
        ctx.fillRect(nx, ny + 6, 3, 2); ctx.fillRect(nx + 2, ny, 1, 7); ctx.fillRect(nx + 3, ny, 3, 1); ctx.fillRect(nx + 5, ny, 1, 3);
      }
      (obs || []).forEach(function (o) { put(o.img, o.x, o.y); });
      if (!me) me = { y: 0, vy: 0 };
      var img;
      if (performance.now() < duckUntil && onGround()) img = IMG.duck;
      else if (!onGround()) img = IMG.jump;
      else img = playing && Math.floor((dist || 0) / 7) % 2 ? IMG.run2 : IMG.run1;
      put(img, 18, ground + me.y - img.height);
      if (playing && t < duckTip) {
        var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        ctx.fillStyle = INK; ctx.font = "bold 5px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
        ctx.fillText(fine ? "↓ pijltje omlaag = bukken!" : "↓ veeg omlaag = bukken!", VW / 2, ground - 52);
      }
    }
    function key(e) {
      if (e.target && e.target.closest && e.target.closest("input, textarea")) return;
      if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); if (playing) jump(); else start(); }
    }
    function start() {
      size(); reset(); over.hidden = true; go.hidden = true; logoEl.hidden = true; form.hidden = true; playing = true; state.locked = control; hideHint(); wakeAudio(); music(true);
      last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(safe);
    }
    // Scorebord: haalt de top 10 op, en na een potje kun je je naam invullen.
    var lb = card.querySelector("[data-lb]"), lbList = card.querySelector("[data-lb-list]"), form = card.querySelector("[data-lb-form]");
    var input = form.querySelector("input"), top = null, mine = 0, sent = false;
    try { input.value = localStorage.getItem("dg-run-name") || ""; } catch (e) {}
    function showBoard(list, rank) {
      top = list; lbList.innerHTML = "";
      list.forEach(function (r, i) {
        var li = document.createElement("li"), n = document.createElement("span"), sc = document.createElement("b");
        n.textContent = r.name; sc.textContent = r.score;
        if (rank === i + 1) li.className = "me";
        li.appendChild(n); li.appendChild(sc); lbList.appendChild(li);
      });
      lb.hidden = !list.length;
    }
    function loadBoard() {
      if (!window.fetch || location.protocol === "file:") return;
      fetch("/api/scores").then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && d.top) showBoard(d.top); }).catch(function () {});
    }
    function fits(sc) { return top && sc > 0 && (top.length < 10 || sc > top[top.length - 1].score); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = input.value.trim();
      if (!name || sent) return;
      sent = true; form.querySelector("button").disabled = true;
      try { localStorage.setItem("dg-run-name", name); } catch (err) {}
      fetch("/api/scores", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name, score: mine, secs: lastSecs }) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          form.querySelector("button").disabled = false;
          if (d && d.top) {
            form.hidden = true; showBoard(d.top, d.rank);
            msg.textContent = d.rank && d.rank <= 10 ? "Je staat op plek " + d.rank + "! Nog een keer? Of veeg verder." : msg.textContent;
          } else { sent = false; msg.textContent = (d && d.error) || "Dat lukte niet, probeer het nog eens."; }
        })
        .catch(function () { sent = false; form.querySelector("button").disabled = false; msg.textContent = "Dat lukte niet, probeer het nog eens."; });
    });
    var lastSecs = 0;
    loadBoard();
    function end(o) {
      playing = false; cancelAnimationFrame(raf); raf = null; state.locked = null; draw();
      if (song) song.pause();
      deathSound();
      if (score > best) { best = score; try { localStorage.setItem("dg-run-best", best); } catch (e) {} }
      bestEl.textContent = "Je record: " + best;
      showCulprit(o);
      msg.textContent = "Score " + score + ". Nog een keer? Of veeg verder.";
      var pb = card.querySelector("[data-play]");
      pb.setAttribute("aria-label", "New game"); pb.innerHTML = ICONS.replay;
      mine = score; lastSecs = t; sent = false;
      form.hidden = !fits(score);
      if (!form.hidden) msg.textContent = "Score " + score + ".";
      over.hidden = false;
    }
    // Game over: groot in beeld waar je over struikelde, met de naam erbij.
    var logoEl = card.querySelector("[data-logo]"), lg = logo([["DARIO'S", 4], ["GREAT ADVENTURE", 2]]);
    logoEl.width = lg.width; logoEl.height = lg.height; logoEl.getContext("2d").drawImage(lg, 0, 0);
    logoEl.style.aspectRatio = lg.width + " / " + lg.height;
    var goT = card.querySelector("[data-go-title]"), gt = logo([["GAME OVER", 4]]);
    goT.width = gt.width; goT.height = gt.height; goT.getContext("2d").drawImage(gt, 0, 0);
    goT.style.aspectRatio = gt.width + " / " + gt.height;
    var go = card.querySelector("[data-go]"), goImg = card.querySelector("[data-go-img]"), goName = card.querySelector("[data-go-name]");
    function showCulprit(o) {
      var c = o.img.c;
      goImg.width = c.width; goImg.height = c.height;
      var gx = goImg.getContext("2d"); gx.imageSmoothingEnabled = false; gx.clearRect(0, 0, c.width, c.height); gx.drawImage(c, 0, 0);
      goImg.style.aspectRatio = c.width + " / " + c.height;
      var n = NAMES[o.kind] || "";
      goName.textContent = n.charAt(0).toUpperCase() + n.slice(1);
      go.hidden = false;
    }
    function control(d) { if (d === "up") jump(); else if (d === "down") duck(); }
    // Tikken = springen. Vegen gaat via state.locked (omhoog springt, omlaag bukt).
    var tap = null;
    wrap.addEventListener("pointerdown", function (e) { if (e.target.closest("[data-music]")) return; if (playing) tap = { x: e.clientX, y: e.clientY }; });
    wrap.addEventListener("pointerup", function (e) {
      if (tap && Math.abs(e.clientX - tap.x) < 14 && Math.abs(e.clientY - tap.y) < 14) jump();
      tap = null;
    });
    document.addEventListener("keydown", key);
    card.querySelector("[data-play]").addEventListener("click", start);
    requestAnimationFrame(size);
    return function () {
      playing = false; cancelAnimationFrame(raf); document.removeEventListener("keydown", key);
      if (song) { song.pause(); song = null; }
      if (actx) { try { actx.close(); } catch (e) {} actx = null; }
      if (state.locked === control) state.locked = null;
    };
  }

  // ---------- Kaarten maken en wisselen ----------
  var state = { current: null, busy: false, locked: null, seen: {}, bag: [] };
  // Vooraf geladen video's, buiten beeld geparkeerd.
  var VIDS = {}, shelf = document.createElement("div");
  shelf.setAttribute("aria-hidden", "true");
  shelf.style.cssText = "position:fixed;left:-10px;top:-10px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
  document.body.appendChild(shelf);

  function make(page) {
    var el = document.createElement("section");
    el.className = "card" + (page.type === "platform" ? "" : " centered");
    el.setAttribute("aria-label", page.title || page.id);
    el.style.setProperty("--bg", page.bg); el.style.setProperty("--fg", page.fg);
    el.style.setProperty("--accent", page.accent || page.fg);
    if (page.cover) { el.style.setProperty("--cover", page.cover); el.style.setProperty("--cover-ink", page.coverInk); }
    el.innerHTML = TEMPLATES[page.type](page);
    var cleanup = MOUNT[page.type] ? MOUNT[page.type](el, page) : null;
    return { page: page, el: el, cleanup: cleanup };
  }
  function drop(c) { if (c.cleanup) c.cleanup(); c.el.remove(); }

  // Trekzak: alle pagina's in willekeurige volgorde, zodat je ze allemaal ziet voordat er één terugkomt.
  function fill() {
    var cur = state.current && state.current.page.id;
    state.bag = PAGES.filter(function (p) { return p.id !== cur; });
    for (var i = state.bag.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = state.bag[i]; state.bag[i] = state.bag[j]; state.bag[j] = t;
    }
  }
  function pick() {
    if (!state.bag.length) fill();
    var p = state.bag.pop();
    setTimeout(warmUp, 400);
    return p;
  }

  // Video's die binnenkort langskomen alvast laden, zodat ze meteen beginnen.
  // Alleen de eerstvolgende twee pagina's uit de zak, en niet als de telefoon data wil sparen.
  function warmUp() {
    if (navigator.connection && navigator.connection.saveData) return;
    if (!state.bag.length) fill();
    state.bag.slice(-2).forEach(function (p) {
      if (p.type !== "video" || VIDS[p.video]) return;
      var v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", "");
      v.preload = "auto"; if (p.poster) v.poster = p.poster;
      v.src = p.video; shelf.appendChild(v); v.load();
      VIDS[p.video] = v;
    });
  }

  function setPos(el, x, y, animate) {
    el.classList.toggle("moving", !!animate);
    el.style.transform = "translate3d(" + x + "px," + y + "px,0)";
  }

  function show(c) {
    state.current = c;
    state.seen[c.page.id] = true;
    var n = Object.keys(state.seen).length;
    countEl.textContent = n + "/" + PAGES.length;
    countEl.title = n + " van de " + PAGES.length + " pagina's gezien";
    try { history.replaceState(null, "", "#" + c.page.id); } catch (e) {}
    tint(c.page.bg);
  }

  // Laat de balken van de browser (Safari, Chrome op de telefoon) meekleuren met de pagina.
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var mobile = window.matchMedia("(max-width: 700px), (max-aspect-ratio: 3/4) and (max-width: 900px)");
  if (mobile.addEventListener) mobile.addEventListener("change", function () { if (state.current) tint(state.current.page.bg); });
  function tint(bg) {
    if (!mobile.matches || !bg) bg = "";
    if (themeMeta) themeMeta.content = bg || "#fdeef3";
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
  }

  // Schuif naar een nieuwe pagina. offset = hoe ver de vinger de kaart al had meegenomen.
  function go(d, next, offset) {
    if (state.busy) return;
    state.busy = true;
    hideHint();
    var v = VEC[d], W = frame.clientWidth, H = frame.clientHeight;
    var old = state.current;
    if (!next) {
      next = make(pick());
      setPos(next.el, -v[0] * W, -v[1] * H, false);
      frame.appendChild(next.el);
      next.el.getBoundingClientRect();
    }
    setPos(old.el, v[0] * W, v[1] * H, true);
    setPos(next.el, 0, 0, true);
    show(next);
    if (next.el._activate) next.el._activate();
    setTimeout(function () { drop(old); next.el.classList.remove("moving"); state.busy = false; }, still ? 30 : 360);
  }

  // ---------- Invoer: vegen, scrollwiel, toetsen, knoppen ----------
  var drag = null, lastSwipe = 0;
  frame.addEventListener("pointerdown", function (e) {
    if (state.busy || e.button > 0) return;
    if (e.target.closest("a, button, input, form, .lb, .book3d, .sheet")) return;
    var row = e.target.closest(".pod-covers");
    if (row && row._stop) row._stop();
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), axis: null, next: null, id: e.pointerId,
      row: row, left: row && row._pos ? row._pos() : 0, lx: e.clientX, lt: performance.now(), v: 0 };
    try { frame.setPointerCapture(e.pointerId); } catch (err) {}
  });
  frame.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (state.locked) {
      // Tijdens het spel stuurt een veeg het spel, meteen al tijdens het vegen.
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 18) {
        state.locked(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down"));
        drag.x = e.clientX; drag.y = e.clientY;
      }
      return;
    }
    if (drag.row && drag.axis !== "y") {
      // Zijwaarts over de covers: de carrousel schuift mee, omhoog of omlaag blijft gewoon vegen.
      if (!drag.axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dx) > Math.abs(dy)) { drag.axis = "row"; drag.row._dragging = true; }
      }
      if (drag.axis === "row") {
        var now = performance.now(), ddt = Math.max(1, now - drag.lt);
        drag.v = 0.7 * drag.v + 0.3 * (e.clientX - drag.lx) / ddt; drag.lx = e.clientX; drag.lt = now;
        drag.row._move(drag.left - dx);
        return;
      }
    }
    if (!drag.axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      drag.next = make(pick());
      frame.appendChild(drag.next.el);
    }
    var W = frame.clientWidth, H = frame.clientHeight;
    if (drag.axis === "x") {
      setPos(state.current.el, dx, 0, false);
      setPos(drag.next.el, dx + (dx < 0 ? W : -W), 0, false);
    } else {
      setPos(state.current.el, 0, dy, false);
      setPos(drag.next.el, 0, dy + (dy < 0 ? H : -H), false);
    }
  });
  function release(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    var dx = e.clientX - d.x, dy = e.clientY - d.y, dt = Math.max(1, performance.now() - d.t);
    if (d.axis === "row") { d.row._dragging = false; d.row._snap(performance.now() - d.lt > 120 ? 0 : d.v); return; }
    if (!d.axis) return;
    lastSwipe = performance.now();
    var dist = d.axis === "x" ? dx : dy, size = d.axis === "x" ? frame.clientWidth : frame.clientHeight;
    var flick = Math.abs(dist) > size * 0.18 || (Math.abs(dist) > 30 && Math.abs(dist) / dt > 0.45);
    if (flick) {
      go(d.axis === "x" ? (dist < 0 ? "left" : "right") : (dist < 0 ? "up" : "down"), d.next);
    } else {
      // Terugveren; de alvast gekozen pagina gaat terug in de zak.
      state.busy = true;
      setPos(state.current.el, 0, 0, true);
      var W = frame.clientWidth, H = frame.clientHeight, sign = dist < 0 ? 1 : -1;
      setPos(d.next.el, d.axis === "x" ? sign * W : 0, d.axis === "y" ? sign * H : 0, true);
      state.bag.push(d.next.page);
      setTimeout(function () { drop(d.next); state.current.el.classList.remove("moving"); state.busy = false; }, 360);
    }
  }
  frame.addEventListener("pointerup", release);
  frame.addEventListener("pointercancel", release);

  var wheelAcc = 0, wheelAxis = null, wheelLock = 0;
  window.addEventListener("wheel", function (e) {
    e.preventDefault();
    // Zijwaarts scrollen boven de covers schuift de carrousel, niet de pagina.
    var row = e.target.closest && e.target.closest(".pod-covers");
    if (row && Math.abs(e.deltaX) > Math.abs(e.deltaY)) { if (row._move) { row._stop(); row._move(row._pos() + e.deltaX, true); } return; }
    var now = performance.now();
    if (now < wheelLock || state.busy || state.locked) return;
    var ax = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? "x" : "y";
    if (ax !== wheelAxis) { wheelAxis = ax; wheelAcc = 0; }
    wheelAcc += ax === "x" ? e.deltaX : e.deltaY;
    if (Math.abs(wheelAcc) > 45) {
      go(ax === "x" ? (wheelAcc > 0 ? "left" : "right") : (wheelAcc > 0 ? "up" : "down"));
      wheelAcc = 0; wheelLock = now + 750;
    }
  }, { passive: false });

  document.addEventListener("keydown", function (e) {
    var k = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }[e.key];
    if (!k || (e.target.closest && e.target.closest("input, textarea"))) return;
    e.preventDefault();
    if (state.locked) return state.locked(k);
    go(BUTTON[k]);
  });

  document.querySelectorAll(".dpad [data-dir]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (state.locked) return state.locked(b.dataset.dir);
      go(BUTTON[b.dataset.dir]);
    });
  });

  // Links die nog geen adres hebben, en de kopieerknop
  frame.addEventListener("click", function (e) {
    var later = e.target.closest("[data-later]");
    if (later) { e.preventDefault(); toast("Deze link volgt nog"); }
    var copy = e.target.closest("[data-copy]");
    if (copy) {
      var txt = copy.dataset.copy;
      var ok = function () { toast("Adres gekopieerd"); };
      try {
        navigator.clipboard.writeText(txt).then(ok, function () { selectAddr(copy); });
      } catch (err) { selectAddr(copy); }
    }
  });
  function selectAddr(btn) {
    var a = btn.parentNode.querySelector(".addr");
    var r = document.createRange(); r.selectNodeContents(a);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    toast("Adres geselecteerd, kopieer het zelf");
  }
  var toastTimer;
  function toast(t) {
    var el = frame.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; frame.appendChild(el); }
    el.textContent = t; clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.remove(); }, 1800);
  }

  // Uitleg die verdwijnt na de eerste veeg
  var hint = document.createElement("div");
  hint.className = "hint";
  hint.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2l4 4h-3v5h5V8l4 4-4 4v-3h-5v5h3l-4 4-4-4h3v-5H6v3l-4-4 4-4v3h5V6H8z"/></svg>' +
    (window.matchMedia("(hover: hover) and (pointer: fine)").matches ? "Gebruik de pijltjes of scroll" : "Doomscroll alle kanten op");
  function hideHint() { if (hint.parentNode) { hint.classList.add("gone"); setTimeout(function () { hint.remove(); }, 320); } }

  // Start: de pagina uit het adres (#contact), anders de bio
  var startId = (location.hash || "").slice(1);
  var first = PAGES.filter(function (p) { return p.id === startId; })[0] || PAGES[0];
  var c = make(first);
  setPos(c.el, 0, 0, false);
  frame.appendChild(c.el);
  show(c);
  if (c.el._activate) c.el._activate();

  // Alle afbeeldingen alvast op de achtergrond laden en uitpakken, zodat elke pagina meteen klaarstaat bij het vegen.
  var preloaded = [];
  function preload() {
    var urls = {};
    PAGES.forEach(function (p) {
      [p.image, p.poster, p.avatar].concat(p.covers || []).forEach(function (u) { if (u) urls[u] = 1; });
      if (p.images) ["front", "spine", "back"].forEach(function (k) { if (p.images[k]) urls[p.images[k]] = 1; });
    });
    // Boeken eerst, die zijn het grootst en worden in 3D getekend.
    Object.keys(urls).sort(function (a, b) { return (/front|spine|back/.test(b) ? 1 : 0) - (/front|spine|back/.test(a) ? 1 : 0); })
      .forEach(function (u) {
        var im = new Image(); im.decoding = "async"; im.src = u; preloaded.push(im);
        if (im.decode) im.decode().catch(function () {});
      });
  }
  // Meteen beginnen, niet wachten tot de video of de lettertypes binnen zijn.
  setTimeout(preload, 0);
  setTimeout(warmUp, 1500);
  frame.appendChild(hint);
})();
