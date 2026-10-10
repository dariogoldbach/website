/* 3D-boeken: sleep met muis of vinger om te draaien, pijltjestoetsen werken ook. */
(function () {
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var books = [];

  document.querySelectorAll(".book3d").forEach(function (el, i) {
    var b = { el: el, ry: -28 + i * 9, rx: 8, vy: 0, dragging: false, lastX: 0, lastY: 0, idle: 0 };
    books.push(b);

    el.addEventListener("pointerdown", function (e) {
      b.dragging = true; b.vy = 0; b.lastX = e.clientX; b.lastY = e.clientY;
      el.classList.add("dragging");
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });
    el.addEventListener("pointermove", function (e) {
      if (!b.dragging) return;
      var dx = e.clientX - b.lastX, dy = e.clientY - b.lastY;
      b.lastX = e.clientX; b.lastY = e.clientY;
      b.ry += dx * 0.6;
      b.rx = Math.max(-35, Math.min(35, b.rx - dy * 0.35));
      b.vy = dx * 0.6;
      b.idle = 0;
    });
    function release() { b.dragging = false; el.classList.remove("dragging"); }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("lostpointercapture", release);
    el.addEventListener("keydown", function (e) {
      var step = { ArrowLeft: -20, ArrowRight: 20 }[e.key];
      if (step) { b.vy = step * 0.25; b.idle = 0; e.preventDefault(); }
    });
  });

  if (!books.length) return;

  function tick() {
    books.forEach(function (b) {
      if (!b.dragging) {
        b.ry += b.vy;
        b.vy *= 0.94;
        if (Math.abs(b.vy) < 0.02) b.vy = 0;
        b.idle++;
        // Na een paar seconden rust draait het boek langzaam vanzelf en zakt de kanteling terug.
        if (!still && b.idle > 180) b.ry += 0.12;
        if (b.idle > 60) b.rx += (8 - b.rx) * 0.03;
      }
      b.el.style.transform = "rotateX(" + b.rx.toFixed(2) + "deg) rotateY(" + b.ry.toFixed(2) + "deg)";
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
