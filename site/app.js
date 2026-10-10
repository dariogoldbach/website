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

  // ---------- Pagina-sjablonen ----------
  var TEMPLATES = {
    bio: function (p) {
      return top("Bio", p) +
        '<div class="mid"><div class="portrait">Hier komt<br>je foto</div>' +
        '<h1 class="xl">' + esc(p.title).replace(" ", "<br>") + "</h1>" +
        '<p class="roles">' + esc(p.roles) + "</p></div>" +
        '<div class="end"><p class="txt ph">' + esc(p.text) + "</p></div>";
    },
    platform: function (p) {
      return top(p.label, p) +
        '<div class="mid"><p class="situatie-mark">' + esc(p.title).replace(" ", "<br>") + "</p>" +
        '<p class="txt ph">' + esc(p.text) + "</p></div>" +
        '<div class="end"><div class="row">' + link(p.link) + "</div></div>";
    },
    podcast: function (p) {
      var bars = "";
      for (var i = 0; i < 14; i++) bars += "<i></i>";
      return top("Podcast", p) +
        '<div class="mid"><div class="pod-cover"><span>Podcast</span><b>' + esc(p.title) + "</b><span>Dario Goldbach</span></div>" +
        '<div class="eq" aria-hidden="true">' + bars + "</div>" +
        '<p class="txt ph">' + esc(p.text) + "</p></div>" +
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
        '<h2 class="lg">' + esc(p.title) + "</h2>" +
        (p.text ? '<p class="txt">' + esc(p.text) + "</p>" : "") +
        '<p class="small' + (p.images ? "" : " ph") + '">' + esc(p.meta) + " · sleep het boek om het te draaien</p></div>" +
        '<div class="end"><div class="row">' + link(p.link) + "</div></div>";
    },
    contact: function (p) {
      return top("Contact", p) +
        '<div class="mid"><p class="mail-big">Mail<br><em>me.</em></p><p class="txt">' + esc(p.text) + "</p></div>" +
        '<div class="end"><a class="btn" href="mailto:' + esc(p.email) + '">Stuur een mail</a>' +
        '<div class="row" style="align-items:center"><span class="addr ph">' + esc(p.email) + "</span>" +
        '<button class="btn ghost" type="button" data-copy="' + esc(p.email) + '" style="min-height:2.4rem;padding:.4em 1em">Kopieer</button></div></div>';
    },
    snake: function () {
      return '<div class="top"><span class="label">Pauze</span><span class="score" data-score>score 0</span></div>' +
        '<div class="snake-wrap"><canvas></canvas><div class="snake-over">' +
        '<p class="snake-title">SNAKE</p><p class="small" data-msg>Veeg of gebruik de pijltjes om te sturen.</p>' +
        '<button class="btn" type="button" data-play>Speel</button></div></div>' +
        '<p class="small" data-best>Je record: 0</p>';
    },
  };

  // ---------- Interactieve onderdelen per pagina ----------
  var MOUNT = {
    boek: function (card) { return book(card.querySelector(".book3d")); },
    snake: function (card) { return snake(card); },
  };

  function book(el) {
    var ry = 28, rx = 8, vy = 0, dragging = false, lx = 0, ly = 0, idle = 0, raf;
    function down(e) {
      e.stopPropagation(); dragging = true; vy = 0; lx = e.clientX; ly = e.clientY;
      el.classList.add("dragging");
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    }
    function move(e) {
      if (!dragging) return;
      e.stopPropagation();
      var dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
      ry += dx * 0.6; rx = Math.max(-35, Math.min(35, rx - dy * 0.35)); vy = dx * 0.6; idle = 0;
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
        ry += vy; vy *= 0.94; if (Math.abs(vy) < 0.02) vy = 0; idle++;
        if (!still && idle > 120) ry += 0.18;
        if (idle > 60) rx += (8 - rx) * 0.03;
      }
      el.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      raf = requestAnimationFrame(tick);
    })();
    return function () { cancelAnimationFrame(raf); };
  }

  function snake(card) {
    var canvas = card.querySelector("canvas"), ctx = canvas.getContext("2d");
    var over = card.querySelector(".snake-over"), msg = card.querySelector("[data-msg]");
    var scoreEl = card.querySelector("[data-score]"), bestEl = card.querySelector("[data-best]");
    var COLS = 16, rows, cell, body, dir, nextDir, food, score, timer = null;
    var best = 0;
    try { best = +localStorage.getItem("dg-snake-best") || 0; } catch (e) {}
    bestEl.textContent = "Je record: " + best;
    var fg = "#7cff6b", accent = "#ffd23f";

    function size() {
      var r = canvas.getBoundingClientRect();
      if (!r.width) return;
      cell = Math.floor(r.width / COLS);
      rows = Math.max(10, Math.floor(r.height / cell));
      canvas.width = COLS * cell; canvas.height = rows * cell;
      draw();
    }
    function place() {
      do { food = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * rows)]; }
      while (body && body.some(function (b) { return b[0] === food[0] && b[1] === food[1]; }));
    }
    function reset() {
      var y = Math.floor(rows / 2);
      body = [[5, y], [4, y], [3, y]]; dir = nextDir = [1, 0]; score = 0; place();
      scoreEl.textContent = "score 0";
    }
    function draw() {
      if (!cell) return;
      ctx.fillStyle = "#0b0b0b"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (!body) return;
      ctx.fillStyle = accent; ctx.fillRect(food[0] * cell + 2, food[1] * cell + 2, cell - 4, cell - 4);
      ctx.fillStyle = fg;
      body.forEach(function (b, i) { ctx.globalAlpha = i ? 0.85 : 1; ctx.fillRect(b[0] * cell + 1, b[1] * cell + 1, cell - 2, cell - 2); });
      ctx.globalAlpha = 1;
    }
    function step() {
      dir = nextDir;
      var h = [body[0][0] + dir[0], body[0][1] + dir[1]];
      var hit = h[0] < 0 || h[1] < 0 || h[0] >= COLS || h[1] >= rows ||
        body.some(function (b) { return b[0] === h[0] && b[1] === h[1]; });
      if (hit) return end();
      body.unshift(h);
      if (h[0] === food[0] && h[1] === food[1]) { score++; scoreEl.textContent = "score " + score; place(); }
      else body.pop();
      draw();
    }
    function start() {
      size(); reset(); draw(); over.hidden = true; state.locked = steer; hideHint();
      clearInterval(timer); timer = setInterval(step, 115);
    }
    function end() {
      clearInterval(timer); timer = null; state.locked = null;
      if (score > best) { best = score; try { localStorage.setItem("dg-snake-best", best); } catch (e) {} }
      bestEl.textContent = "Je record: " + best;
      msg.textContent = "Game over. Score " + score + ". Veeg verder of speel nog een keer.";
      card.querySelector("[data-play]").textContent = "Nog een keer";
      over.hidden = false;
    }
    function steer(d) {
      var v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[d];
      if (v && (v[0] !== -dir[0] || v[1] !== -dir[1])) nextDir = v;
    }
    card.querySelector("[data-play]").addEventListener("click", start);
    requestAnimationFrame(size);
    return function () { clearInterval(timer); if (state.locked === steer) state.locked = null; };
  }

  // ---------- Kaarten maken en wisselen ----------
  var state = { current: null, busy: false, locked: null, seen: {}, bag: [] };

  function make(page) {
    var el = document.createElement("section");
    el.className = "card";
    el.setAttribute("aria-label", page.title || page.id);
    el.style.setProperty("--bg", page.bg); el.style.setProperty("--fg", page.fg);
    el.style.setProperty("--accent", page.accent || page.fg);
    if (page.cover) { el.style.setProperty("--cover", page.cover); el.style.setProperty("--cover-ink", page.coverInk); }
    el.innerHTML = TEMPLATES[page.type](page);
    var cleanup = MOUNT[page.type] ? MOUNT[page.type](el) : null;
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
    if (e.target.closest("a, button, .book3d")) return;
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), axis: null, next: null, id: e.pointerId };
    try { frame.setPointerCapture(e.pointerId); } catch (err) {}
  });
  frame.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (state.locked) {
      // Tijdens snake stuurt een veeg de slang, meteen al tijdens het vegen.
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
    (window.matchMedia("(hover: hover) and (pointer: fine)").matches ? "Gebruik de pijltjes of scroll" : "Veeg alle kanten op");
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
