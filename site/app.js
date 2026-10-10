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
        '<div class="mid pod-mid">' + (p.image
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
      return '<div class="top"><span class="label">Pauze</span><span class="score" data-score>score 0</span></div>' +
        '<div class="snake-wrap run-wrap"><canvas></canvas><div class="snake-over">' +
        '<p class="small" data-msg>' +
        (fine ? "Spatie of pijltje omhoog om te springen, omlaag om te bukken." : "Tik of veeg omhoog om te springen, veeg omlaag om te bukken.") +
        '</p><button class="icon-btn" type="button" data-play aria-label="Speel">' + ICONS.playc + '</button></div></div>' +
        '<p class="small" data-best>Je record: 0</p>';
    },
  };

  // ---------- Interactieve onderdelen per pagina ----------
  var MOUNT = {
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
      start();
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
      return function () { frame.removeEventListener("click", tap); v.pause(); v.removeAttribute("src"); v.load(); };
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
  // Pixelplaatjes: elke letter is een kleur, een punt is doorzichtig.
  // Alles in tinten van rood, van bijna zwart tot bijna wit.
  var RED = ["#2b0306", "#5c0a10", "#8f1018", "#c4161f", "#e8202a", "#ff5a52", "#ff8f86", "#ffc2bb", "#ffe6e2"];
  var PAL = {
    H: RED[0], h: RED[1], S: RED[7], s: RED[6], G: RED[0], L: RED[5], M: RED[3],
    T: RED[2], P: RED[1], K: RED[0], W: RED[8],
    p: RED[6], v: RED[3], e: RED[5], r: RED[4], l: RED[7], w: RED[8], Y: RED[4], y: RED[6], g: RED[7],
    B: RED[2], k: RED[0], q: RED[1], R: RED[4], o: RED[8], m: RED[6], n: RED[1],
    d: RED[1], a: RED[6], b: RED[4], i: RED[7]
  };
  var HEAD = [
    "..H.HHh.HH.H.H..", ".HHHhHHHHhHHHHH.", "HHhHHHhHHHHhHHHH", ".HHHHhHHHHHHHhHH", "HHhHHHHHhHHhHHH.",
    "HHHHSSSSSSSSHHHH", "HHHSGGGSSGGGSHHH", ".HHSGLGGGGLGSHH.", "..HSGGGSSGGGSH..", "...SSSSssSSSS...",
    "...SSSMMMMSSS...", "....SSSSSSSS...."
  ];
  // Alles onder het hoofd is 14 breed; met een punt links en rechts wordt het 16.
  function pad(rows) { return rows.map(function (r) { return "." + r + "."; }); }
  var BODY = pad([".....SSSS.....", "...TTTTTTTT...", "..TTTTTTTTTT..", ".STTTTTTTTTTS.", ".STTTTTTTTTTS.",
    "...TTTTTTTT...", "...PPPPPPPP..."]);
  var SPR = {
    run1: HEAD.concat(BODY, pad(["...PPP..PPP...", "...PPP...PPP..", "..KWKK...KWKK."])),
    run2: HEAD.concat(BODY, pad(["....PPPPPP....", "....PPP.PPP...", "...KWKK.KWKK.."])),
    jump: HEAD.concat(BODY, pad(["..PPP....PPP..", ".KWKK....KWKK.", ".............."])),
    duck: HEAD.concat(pad(["TTTTTTTTTTTTTT", "KWKKPPPPPPKWKK"])),
    boeken: [".pppppppp.", ".pwwwwwwp.", ".pppppppp.", "rrrrrrrrrr", "rwwwwwwwwr", "rrrrrrrrrr",
      "lllllllll.", "lwwwwwwwl.", "lllllllll."],
    wijnglas: ["e.....e", "e.....e", "evvvvve", "evvvvve", ".evvve.", "..eee..", "...e...", "...e...", "...e...",
      "...e...", ".eeeee."],
    fles: [".kk.", ".BB.", ".BB.", ".BB.", "BBBB", "BBBB", "BwwB", "BwwB", "BBBB", "BBBB", "BBBB"],
    microfoon: [".mmm.", "mnmnm", "mmnmm", ".mmm.", "..k..", "..k..", "..k..", "..k..", "..k..", "..k..",
      "..k..", ".kkk.", "kkkkk"],
    plaat: ["...kkkk...", ".kkkkkkkk.", ".kqkkkkqk.", "kkkRRRRkkk", "kqkRooRkqk", "kqkRooRkqk", "kkkRRRRkkk",
      ".kqkkkkqk.", ".kkkkkkkk.", "...kkkk..."],
    draaitafel: [".kkkkkkkk...a...", "ddddddddddddaddd", "daaaaaaaaaaaaaad", "dabababaaaaababd",
      "daaaaaaaaaaaaaad", "dddddddddddddddd"],
    speaker: ["kkkkkkkkkk", "kqqqqqqqqk", "kqqaaaaqqk", "kqaqqqqaqk", "kqaqbbqaqk", "kqaqqqqaqk", "kqqaaaaqqk",
      "kqqqqqqqqk", "kqqqaaqqqk", "kqqaqqaqqk", "kqqaqqaqqk", "kqqqaaqqqk", "kqqqqqqqqk", "kkkkkkkkkk"],
    discobal: ["....k....", "....k....", "..rrirr..", ".riririr.", "ririririr", "iriririri", "ririririr", ".riririr.", "..rrirr.."],
    discobal2: ["....k....", "....k....", "..iirii..", ".iririri.", "iriririri", "ririririr", "iriririri", ".iririri.", "..iirii.."],
    vuur: ["...b....", "..bb..b.", "..bbb.bb", ".bbybbbb", ".byyybb.", "bbyyyybb", "byywyyyb", "byywwyyb", ".bywwyb.",
      "kkkkkkkk", "kqqqqqqk"],
    vuur2: ["....b...", ".b..bb..", "bb.bbb..", "bbbbybb.", ".bbyyyb.", "bbyyyybb", "byyyywyb", "byywwyyb", ".bywwyb.",
      "kkkkkkkk", "kqqqqqqk"]
  };
  var NAMES = { boeken: "een stapel boeken", wijnglas: "een glas wijn", fles: "een fles wijn", microfoon: "een microfoon",
    plaat: "een plaat", draaitafel: "een draaitafel", vliegplaat: "een rondvliegende plaat",
    speaker: "een speaker", discobal: "een discobal", vuur: "een vuurfontein", stuiterplaat: "een stuiterende plaat" };
  function sprite(rows) {
    var c = document.createElement("canvas"), x = c.getContext("2d");
    c.width = rows[0].length; c.height = rows.length;
    rows.forEach(function (row, y) {
      for (var i = 0; i < row.length; i++) if (row[i] !== ".") { x.fillStyle = PAL[row[i]]; x.fillRect(i, y, 1, 1); }
    });
    return c;
  }
  var IMG = null;

  function runner(card) {
    if (!IMG) { IMG = {}; Object.keys(SPR).forEach(function (k) { IMG[k] = sprite(SPR[k]); }); }
    var wrap = card.querySelector(".run-wrap"), canvas = card.querySelector("canvas"), ctx = canvas.getContext("2d");
    var over = card.querySelector(".snake-over"), msg = card.querySelector("[data-msg]");
    var scoreEl = card.querySelector("[data-score]"), bestEl = card.querySelector("[data-best]");
    var VW = 100, VH = 200, k = 1, ground = 150;
    var me, obs, speed, dist, score, nextGap, raf = null, last = 0, t = 0, duckUntil = 0, playing = false;
    var best = 0;
    try { best = +localStorage.getItem("dg-run-best") || 0; } catch (e) {}
    bestEl.textContent = "Je record: " + best;

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
    function jump() { if (playing && onGround() && performance.now() > duckUntil) me.vy = -158; }
    function duck() { if (!playing) return; duckUntil = performance.now() + 520; if (!onGround()) me.vy = Math.max(me.vy, 260); }
    function spawn() {
      var kinds = ["boeken", "wijnglas", "fles", "microfoon", "plaat", "draaitafel", "speaker", "vuur"];
      var kind = kinds[Math.floor(Math.random() * kinds.length)], r0 = Math.random();
      // Hoe verder je komt, hoe gekker het wordt: discoballen om onderdoor te duiken, stuiterende en vliegende platen.
      if (score > 60 && r0 < 0.18) kind = "discobal";
      else if (score > 120 && r0 < 0.32) kind = "stuiterplaat";
      else if (score > 150 && r0 < 0.42) kind = "vliegplaat";
      var img = IMG[kind === "vliegplaat" || kind === "stuiterplaat" ? "plaat" : kind];
      var y = kind === "vliegplaat" ? ground - 25 : kind === "discobal" ? ground - 24 : ground - img.height;
      obs.push({ kind: kind, img: img, x: VW + 4, y: y, base: y, ph: Math.random() * 6 });
      // Soms twee kleine dingen vlak achter elkaar.
      if (score > 100 && Math.random() < 0.2 && (kind === "wijnglas" || kind === "fles" || kind === "microfoon")) {
        var k2 = Math.random() < 0.5 ? "wijnglas" : "fles", img2 = IMG[k2];
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
      return { x: 18 + 3, y: top + 2, w: img.width - 6, h: img.height - 3, img: d ? "duck" : null };
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
      raf = requestAnimationFrame(step);
    }
    function draw() {
      if (!canvas.width) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = PAL.o; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(k, 0, 0, k, 0, 0); ctx.imageSmoothingEnabled = false;
      // Grond met steentjes die meeschuiven.
      ctx.fillStyle = RED[1]; ctx.fillRect(0, ground, VW, 1);
      var off = (dist || 0) % 40;
      ctx.fillStyle = RED[6];
      for (var x = -off; x < VW; x += 40) { ctx.fillRect(x + 6, ground + 4, 3, 1); ctx.fillRect(x + 25, ground + 8, 2, 1); ctx.fillRect(x + 34, ground + 5, 1, 1); }
      // Muzieknootjes als wolken.
      ctx.fillStyle = RED[7];
      for (var n = 0; n < 2; n++) {
        var nx = ((n * 55 + 30) - (dist || 0) * 0.25) % (VW + 30); if (nx < -10) nx += VW + 30;
        var ny = ground - 60 - n * 16;
        ctx.fillRect(nx, ny + 6, 3, 2); ctx.fillRect(nx + 2, ny, 1, 7); ctx.fillRect(nx + 3, ny, 3, 1); ctx.fillRect(nx + 5, ny, 1, 3);
      }
      (obs || []).forEach(function (o) { ctx.drawImage(o.img, Math.round(o.x), Math.round(o.y)); });
      if (!me) me = { y: 0, vy: 0 };
      var img;
      if (performance.now() < duckUntil && onGround()) img = IMG.duck;
      else if (!onGround()) img = IMG.jump;
      else img = playing && Math.floor((dist || 0) / 7) % 2 ? IMG.run2 : IMG.run1;
      ctx.drawImage(img, 18, Math.round(ground + me.y - img.height));
    }
    function key(e) {
      if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); if (playing) jump(); else start(); }
    }
    function start() {
      size(); reset(); over.hidden = true; playing = true; state.locked = control; hideHint();
      last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(step);
    }
    function end(o) {
      playing = false; cancelAnimationFrame(raf); raf = null; state.locked = null; draw();
      if (score > best) { best = score; try { localStorage.setItem("dg-run-best", best); } catch (e) {} }
      bestEl.textContent = "Je record: " + best;
      msg.textContent = "Au! Gestruikeld over " + NAMES[o.kind] + ". Score " + score + ". Nog een keer? Of veeg verder.";
      var pb = card.querySelector("[data-play]");
      pb.setAttribute("aria-label", "New game"); pb.innerHTML = ICONS.replay;
      over.hidden = false;
    }
    function control(d) { if (d === "up") jump(); else if (d === "down") duck(); }
    // Tikken = springen. Vegen gaat via state.locked (omhoog springt, omlaag bukt).
    var tap = null;
    wrap.addEventListener("pointerdown", function (e) { if (playing) tap = { x: e.clientX, y: e.clientY }; });
    wrap.addEventListener("pointerup", function (e) {
      if (tap && Math.abs(e.clientX - tap.x) < 14 && Math.abs(e.clientY - tap.y) < 14) jump();
      tap = null;
    });
    document.addEventListener("keydown", key);
    card.querySelector("[data-play]").addEventListener("click", start);
    requestAnimationFrame(size);
    return function () {
      playing = false; cancelAnimationFrame(raf); document.removeEventListener("keydown", key);
      if (state.locked === control) state.locked = null;
    };
  }

  // ---------- Kaarten maken en wisselen ----------
  var state = { current: null, busy: false, locked: null, seen: {}, bag: [] };

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
  function pick() {
    var cur = state.current && state.current.page.id;
    if (!state.bag.length) {
      state.bag = PAGES.filter(function (p) { return p.id !== cur; });
      for (var i = state.bag.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)), t = state.bag[i]; state.bag[i] = state.bag[j]; state.bag[j] = t;
      }
    }
    return state.bag.pop();
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
    setTimeout(function () { drop(old); next.el.classList.remove("moving"); state.busy = false; }, still ? 30 : 360);
  }

  // ---------- Invoer: vegen, scrollwiel, toetsen, knoppen ----------
  var drag = null;
  frame.addEventListener("pointerdown", function (e) {
    if (state.busy || e.button > 0) return;
    if (e.target.closest("a, button, .book3d, .sheet")) return;
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), axis: null, next: null, id: e.pointerId };
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
    if (!d.axis) return;
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
    if (!k) return;
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

  // Alle afbeeldingen alvast op de achtergrond laden en uitpakken, zodat elke pagina meteen klaarstaat bij het vegen.
  var preloaded = [];
  function preload() {
    var urls = {};
    PAGES.forEach(function (p) {
      [p.image, p.poster, p.avatar].forEach(function (u) { if (u) urls[u] = 1; });
      if (p.images) ["front", "spine", "back"].forEach(function (k) { if (p.images[k]) urls[p.images[k]] = 1; });
    });
    // Boeken eerst, die zijn het grootst en worden in 3D getekend.
    Object.keys(urls).sort(function (a, b) { return (/front|spine|back/.test(b) ? 1 : 0) - (/front|spine|back/.test(a) ? 1 : 0); })
      .forEach(function (u) {
        var im = new Image(); im.decoding = "async"; im.src = u; preloaded.push(im);
        if (im.decode) im.decode().catch(function () {});
      });
  }
  if (document.readyState === "complete") setTimeout(preload, 50);
  else window.addEventListener("load", function () { setTimeout(preload, 50); });
  frame.appendChild(hint);
})();
