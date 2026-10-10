/* Swipe alle kanten op: elke veeg toont een willekeurige pagina die je nog niet hebt gezien. */
(function () {
  "use strict";
  var PAGES = window.PAGES || [];
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
    return '<a class="btn ' + (cls || "") + '"' + href + ">" + esc(l.text) + " ↗</a>";
  }
  function top(label, p) {
    return '<div class="top"><span class="label">' + esc(label) + "</span>" +
      (p.placeholder ? '<span class="ph-tag">voorbeeldtekst</span>' : "") + "</div>";
  }

  var ICONS = {
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
        '<p class="txt' + (p.placeholder ? " ph" : "") + '">' + esc(p.text) + "</p></div>" +
        '<div class="end"><div class="row">' + link(p.link) + "</div></div>";
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
        (p.text ? '<p class="txt' + (p.placeholder ? " ph" : "") + '">' + esc(p.text) + "</p>" : "") + "</div>" +
        '<div class="end"><div class="row">' + p.links.map(function (l, i) { return link(l, i ? "ghost" : ""); }).join("") + "</div></div>";
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
        (p.quotes ? '<p class="quote" data-quotes aria-live="polite">‘' + esc(p.quotes[0].text) + "’ <span>" + esc(p.quotes[0].by) + "</span></p>" : "") +
        "</div>" +
        '<div class="end"><div class="row">' + link(p.link) + (p.listen ? link(p.listen, "ghost") : "") + "</div></div>";
    },
    contact: function (p) {
      return '<div class="mid"><p class="mail-big">Contact</p><p class="txt">' + esc(p.text) + "</p></div>" +
        '<div class="end"><a class="btn" href="mailto:' + esc(p.email) + '">Stuur een mail</a></div>';
    },
    social: function (p) {
      return '<div class="mid"><p class="mail-big">Stalk<br><em>me.</em></p>' +
        '<div class="icons">' + p.links.map(function (l) {
          return '<a class="icon-btn" href="' + esc(l.href) + '" target="_blank" rel="noopener" aria-label="' + esc(l.text) + '">' + ICONS[l.icon] + "</a>";
        }).join("") + "</div></div>";
    },
    game: function () {
      var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      return '<div class="top"><span class="label">Pauze</span><span class="score" data-score>score 0</span></div>' +
        '<div class="snake-wrap run-wrap"><canvas></canvas><div class="snake-over">' +
        '<p class="small" data-msg>' +
        (fine ? "Spatie of pijltje omhoog om te springen, omlaag om te bukken." : "Tik of veeg omhoog om te springen, veeg omlaag om te bukken.") +
        '</p><button class="btn" type="button" data-play>Speel</button></div></div>' +
        '<p class="small" data-best>Je record: 0</p>';
    },
  };

  // ---------- Interactieve onderdelen per pagina ----------
  var MOUNT = {
    boek: function (card, p) {
      var stop = book(card.querySelector(".book3d")), q = card.querySelector("[data-quotes]"), n = 0, timer;
      if (q && p.quotes.length > 1) timer = setInterval(function () {
        n = (n + 1) % p.quotes.length;
        q.classList.add("fade");
        setTimeout(function () {
          q.innerHTML = "‘" + esc(p.quotes[n].text) + "’ <span>" + esc(p.quotes[n].by) + "</span>";
          q.classList.remove("fade");
        }, 300);
      }, 4000);
      return function () { stop(); clearInterval(timer); };
    },
    game: function (card) { return runner(card); },
    bio: function (card) {
      var sheet = card.querySelector(".sheet"), open = card.querySelector("[data-sheet]");
      function set(on) {
        sheet.classList.toggle("open", on); sheet.setAttribute("aria-hidden", String(!on));
        open.setAttribute("aria-expanded", String(on));
      }
      open.addEventListener("click", function () { set(true); });
      card.querySelector("[data-sheet-close]").addEventListener("click", function () { set(false); });
      card.addEventListener("click", function (e) {
        if (sheet.classList.contains("open") && !e.target.closest(".sheet, [data-sheet]")) set(false);
      });
      return null;
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
  var PAL = {
    H: "#2a1a10", h: "#5b3a22", S: "#f0c39c", s: "#d49a74", G: "#111111", L: "#bfe0f2", M: "#a8483c",
    T: "#1b1b1b", P: "#2c2c35", K: "#111111", W: "#ffffff",
    p: "#f7a8c8", v: "#8e1b2c", e: "#8d989e", r: "#e8202a", l: "#c7f06a", w: "#fff8e8", Y: "#f3b61f", y: "#ffd76a", g: "#cfd8dc",
    B: "#2f6b3a", k: "#151515", q: "#3a3a3a", R: "#e8202a", o: "#f2eee3", m: "#a0a0a0", n: "#5a5a5a",
    d: "#2b2b2b", a: "#c9c9c9", b: "#ff5a36"
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
      "daaaaaaaaaaaaaad", "dddddddddddddddd"]
  };
  var NAMES = { boeken: "een stapel boeken", wijnglas: "een glas wijn", fles: "een fles wijn", microfoon: "een microfoon",
    plaat: "een plaat", draaitafel: "een draaitafel", vliegplaat: "een rondvliegende plaat" };
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
      var kinds = ["boeken", "wijnglas", "fles", "microfoon", "plaat", "draaitafel"];
      var kind = kinds[Math.floor(Math.random() * kinds.length)];
      if (score > 150 && Math.random() < 0.25) kind = "vliegplaat";
      var img = IMG[kind === "vliegplaat" ? "plaat" : kind];
      obs.push({ kind: kind, img: img, x: VW + 4, y: kind === "vliegplaat" ? ground - 25 : ground - img.height });
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
      obs.forEach(function (o) { o.x -= dx * (o.kind === "vliegplaat" ? 1.15 : 1); });
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
      ctx.fillStyle = "#1b1b1b"; ctx.fillRect(0, ground, VW, 1);
      var off = (dist || 0) % 40;
      ctx.fillStyle = "#8a8578";
      for (var x = -off; x < VW; x += 40) { ctx.fillRect(x + 6, ground + 4, 3, 1); ctx.fillRect(x + 25, ground + 8, 2, 1); ctx.fillRect(x + 34, ground + 5, 1, 1); }
      // Muzieknootjes als wolken.
      ctx.fillStyle = "#c9c2b0";
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
      msg.textContent = "Au! Gestruikeld over " + NAMES[o.kind] + ". Score " + score + ". Veeg verder of speel nog een keer.";
      card.querySelector("[data-play]").textContent = "Nog een keer";
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
  frame.appendChild(hint);
})();
