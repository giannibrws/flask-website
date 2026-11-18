// Jigsaw puzzles: turn a painting into real interlocking pieces.
// - On an artwork page: "Start puzzle" breaks the painting apart, you drag the pieces back.
// - On the home page: a decorative teaser with a few pieces lifted out.
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var CONFETTI = ["#2348a0", "#d6432b", "#e9b23c", "#4d7a3c", "#e7a59a", "#f2e8d5"];

  function el(name, attrs, parent) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  // ------------------------------------------------------------------ geometry
  // One edge from p0 to p1. sign: 0 = flat border, +1 = knob sticking out, -1 = hole.
  function edge(p0, p1, sign, size) {
    if (!sign) return " L" + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
    var dx = p1[0] - p0[0], dy = p1[1] - p0[1];
    var len = Math.sqrt(dx * dx + dy * dy);
    var ux = dx / len, uy = dy / len;
    var nx = uy, ny = -ux; // outward normal for a clockwise outline
    function P(u, v) {
      return (p0[0] + ux * u * len + nx * v * size * sign).toFixed(2) + " " +
             (p0[1] + uy * u * len + ny * v * size * sign).toFixed(2);
    }
    return " L" + P(0.36, 0) +
      " C" + P(0.42, 0.03) + " " + P(0.30, 0.25) + " " + P(0.50, 0.26) +
      " C" + P(0.70, 0.25) + " " + P(0.58, 0.03) + " " + P(0.64, 0) +
      " L" + P(1, 0);
  }

  // A random cut: which way every inner edge's knob points.
  function makeCut(cols, rows) {
    var h = [], v = [];
    for (var r = 0; r < rows; r++) {
      h.push([]); v.push([]);
      for (var c = 0; c < cols; c++) {
        h[r].push(Math.random() < 0.5 ? 1 : -1);
        v[r].push(Math.random() < 0.5 ? 1 : -1);
      }
    }
    return { cols: cols, rows: rows, h: h, v: v };
  }

  // Outline of piece (r, c) in its own coordinates (0,0)-(pw,ph).
  function piecePath(cut, r, c, pw, ph) {
    var size = Math.min(pw, ph);
    var top = r === 0 ? 0 : -cut.h[r - 1][c];
    var bottom = r === cut.rows - 1 ? 0 : cut.h[r][c];
    var left = c === 0 ? 0 : -cut.v[r][c - 1];
    var right = c === cut.cols - 1 ? 0 : cut.v[r][c];
    return "M0 0" +
      edge([0, 0], [pw, 0], top, size) +
      edge([pw, 0], [pw, ph], right, size) +
      edge([pw, ph], [0, ph], bottom, size) +
      edge([0, ph], [0, 0], left, size) + " Z";
  }

  function gridFor(pieces, aspect) {
    var cols = Math.max(2, Math.round(Math.sqrt(pieces * aspect)));
    var rows = Math.max(2, Math.round(pieces / cols));
    return [cols, rows];
  }

  function whenLoaded(img, ok, fail) {
    if (img.complete && img.naturalWidth > 0) return ok();
    if (img.complete && img.naturalWidth === 0) return fail && fail();
    img.addEventListener("load", ok, { once: true });
    if (fail) img.addEventListener("error", fail, { once: true });
  }

  // ------------------------------------------------------------------ home teaser
  function teaser(holder) {
    var img = holder.querySelector("img");
    whenLoaded(img, function () {
      var W = img.naturalWidth, H = img.naturalHeight;
      var grid = gridFor(16, W / H), cols = grid[0], rows = grid[1];
      var pw = W / cols, ph = H / rows;
      var cut = makeCut(cols, rows);
      var svg = el("svg", { viewBox: "0 0 " + W + " " + H, class: "teaser", "aria-hidden": "true" });
      var lines = el("g", { class: "teaser__lines" }, svg);
      // three pieces, spread out so the holes never touch
      var lifted = [[1, cols - 2], [rows - 1, 0], [rows - 2, cols - 1]];

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          el("path", { d: piecePath(cut, r, c, pw, ph), transform: "translate(" + c * pw + " " + r * ph + ")" }, lines);
        }
      }
      lifted.forEach(function (rc, i) {
        var r = rc[0], c = rc[1];
        var d = piecePath(cut, r, c, pw, ph);
        var at = "translate(" + c * pw + " " + r * ph + ")";
        el("path", { d: d, transform: at, class: "teaser__hole" }, svg);
        var g = el("g", { class: "teaser__piece teaser__piece--" + i }, svg);
        var inner = el("g", { transform: at }, g);
        var clip = el("clipPath", { id: "teaser-clip-" + i }, inner);
        el("path", { d: d }, clip);
        el("image", { href: img.currentSrc || img.src, x: -c * pw, y: -r * ph, width: W, height: H,
                      "clip-path": "url(#teaser-clip-" + i + ")", preserveAspectRatio: "none" }, inner);
        el("path", { d: d, class: "teaser__edge" }, inner);
      });
      holder.appendChild(svg);
      holder.classList.add("is-ready");
    });
  }
  document.querySelectorAll("[data-teaser]").forEach(teaser);

  // ------------------------------------------------------------------ the game
  var viewer = document.getElementById("viewer");
  var svg = document.getElementById("puzzle");
  if (!viewer || !svg) return;

  var stage = document.getElementById("stage");
  var img = document.getElementById("painting");
  var viewTools = document.getElementById("view-tools");
  var puzzleTools = document.getElementById("puzzle-tools");
  var statusOut = document.getElementById("puzzle-status");
  var peekBtn = document.getElementById("puzzle-peek");
  var solvedBox = document.getElementById("solved");
  var solvedStats = document.getElementById("solved-stats");
  var startBtn = document.getElementById("puzzle-start");
  var slug = location.pathname.split("/").pop();

  var game = null;
  var pieceCount = 9;
  var timer = null;

  function fmt(ms) {
    var s = Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }
  function elapsed() { return game && game.startedAt ? (game.endedAt || Date.now()) - game.startedAt : 0; }

  function updateStatus() {
    if (!game) return;
    statusOut.textContent = game.placed + " / " + game.pieces.length + " pieces · " + fmt(elapsed()) + " · " +
      game.moves + (game.moves === 1 ? " move" : " moves");
  }

  function setPos(p, x, y) {
    p.x = x; p.y = y;
    p.node.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
  }

  // pick a spot for a loose piece: around the board, never on its own slot
  function scatterSpot(p) {
    var g = game;
    for (var tries = 0; tries < 30; tries++) {
      // knobs stick out up to `pad`, so keep that much room from every edge
      var x = rnd(p.pad, g.AW - g.pw - p.pad);
      var y = rnd(p.pad, g.AH - g.ph - p.pad);
      var onBoard = x > g.mx - g.pw * 0.6 && x < g.mx + g.W - g.pw * 0.4 &&
                    y > g.my - g.ph * 0.6 && y < g.my + g.H - g.ph * 0.4;
      if (!onBoard || tries > 24) return [x, y];
    }
    return [x, y];
  }

  function build() {
    var W0 = img.naturalWidth, H0 = img.naturalHeight;
    var k = 1000 / Math.max(W0, H0);
    var W = W0 * k, H = H0 * k;
    var grid = gridFor(pieceCount, W / H), cols = grid[0], rows = grid[1];
    var pw = W / cols, ph = H / rows;
    // room around the board for loose pieces, stretched to the shape of the stage:
    // wide screens get space left and right, phones get it above and below
    var m0 = Math.max(pw, ph) * 1.1;
    var AW = W + m0 * 2, AH = H + m0 * 2;
    var stageAspect = stage.clientWidth / Math.max(1, stage.clientHeight);
    if (AW / AH < stageAspect) AW = AH * stageAspect; else AH = AW / stageAspect;
    var mx = (AW - W) / 2, my = (AH - H) / 2;
    var cut = makeCut(cols, rows);

    svg.innerHTML = "";
    svg.setAttribute("viewBox", "0 0 " + AW.toFixed(1) + " " + AH.toFixed(1));
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    var board = el("g", { class: "puzzle__board", transform: "translate(" + mx + " " + my + ")" }, svg);
    el("rect", { x: -10, y: -10, width: W + 20, height: H + 20, class: "puzzle__bed" }, board);
    el("image", { href: img.currentSrc || img.src, width: W, height: H, class: "puzzle__ghost", preserveAspectRatio: "none" }, board);
    var guides = el("g", { class: "puzzle__guides" }, board);
    var layer = el("g", { class: "puzzle__pieces" }, svg);

    var pieces = [];
    var defs = el("defs", {}, svg);
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var d = piecePath(cut, r, c, pw, ph);
        el("path", { d: d, transform: "translate(" + c * pw + " " + r * ph + ")" }, guides);
        var id = "pc-" + r + "-" + c;
        var clip = el("clipPath", { id: id }, defs);
        el("path", { d: d }, clip);
        var g = el("g", { class: "piece", "data-i": pieces.length }, layer);
        el("image", { href: img.currentSrc || img.src, x: -c * pw, y: -r * ph, width: W, height: H,
                      "clip-path": "url(#" + id + ")", preserveAspectRatio: "none" }, g);
        el("path", { d: d, class: "piece__edge" }, g);
        var p = { node: g, r: r, c: c, hx: mx + c * pw, hy: my + r * ph, x: 0, y: 0, pad: Math.min(pw, ph) * 0.26, placed: false };
        pieces.push(p);
      }
    }
    game = { W: W, H: H, pw: pw, ph: ph, mx: mx, my: my, AW: AW, AH: AH, pieces: pieces, layer: layer,
             placed: 0, moves: 0, startedAt: 0, endedAt: 0, helped: false };
    pieces.forEach(function (p) { setPos(p, p.hx, p.hy); });
  }

  function scatter(list, animate) {
    svg.classList.toggle("is-flying", !!animate);
    list.forEach(function (p, i) {
      p.node.style.transitionDelay = animate ? (i * 18) + "ms" : "0ms";
      var s = scatterSpot(p);
      setPos(p, s[0], s[1]);
    });
    if (animate) setTimeout(function () { svg.classList.remove("is-flying"); }, 900 + list.length * 18);
  }

  function start() {
    if (!img.naturalWidth) return;
    document.dispatchEvent(new CustomEvent("puzzle:start"));
    solvedBox.hidden = true;
    viewer.classList.add("is-puzzle");
    svg.removeAttribute("hidden"); // .hidden does not exist on SVG elements
    viewTools.hidden = true;
    puzzleTools.hidden = false;
    setPeek(false);
    build();
    updateStatus();
    // let the intact painting show for a beat, then break it apart
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        svg.classList.add("is-breaking");
        setTimeout(function () {
          svg.classList.remove("is-breaking");
          scatter(game.pieces.slice().sort(function () { return Math.random() - 0.5; }), true);
          game.startedAt = Date.now();
          clearInterval(timer);
          timer = setInterval(updateStatus, 1000);
        }, 450);
      });
    });
  }

  function exit() {
    clearInterval(timer);
    game = null;
    viewer.classList.remove("is-puzzle");
    svg.setAttribute("hidden", "");
    svg.innerHTML = "";
    solvedBox.hidden = true;
    puzzleTools.hidden = true;
    viewTools.hidden = false;
    stage.focus({ preventScroll: true });
  }

  function place(p, animate) {
    p.placed = true;
    p.node.classList.add("is-placed");
    if (animate) p.node.classList.add("is-snapping");
    setPos(p, p.hx, p.hy);
    game.layer.insertBefore(p.node, game.layer.firstChild); // placed pieces sit underneath loose ones
    game.placed++;
    if (animate) setTimeout(function () { p.node.classList.remove("is-snapping"); }, 350);
  }

  function setPeek(on) {
    peekBtn.setAttribute("aria-pressed", String(on));
    svg.classList.toggle("is-peeking", on);
  }

  function bestKey() { return "museo-picasso-best:" + slug + ":" + pieceCount; }

  function finish() {
    game.endedAt = Date.now();
    clearInterval(timer);
    updateStatus();
    var time = elapsed();
    var best = null, record = false;
    if (!game.helped) {
      try {
        best = Number(localStorage.getItem(bestKey())) || null;
        if (!best || time < best) {
          localStorage.setItem(bestKey(), String(time));
          record = !!best;
          best = record ? time : null; // first solve: nothing to compare with yet
        }
      } catch (e) { /* storage unavailable */ }
    }
    svg.classList.add("is-done");
    confetti();
    setTimeout(function () {
      solvedStats.textContent = game.helped
        ? "Solved with a little help. Try it again without the Solve button!"
        : game.pieces.length + " pieces in " + fmt(time) + " with " + game.moves + " moves." +
          (record ? " New personal best!" : best ? " Your best: " + fmt(best) + "." : "");
      solvedBox.hidden = false;
      document.getElementById("solved-again").focus({ preventScroll: true });
    }, 1100);
  }

  function confetti() {
    for (var i = 0; i < 70; i++) {
      var bit = document.createElement("span");
      bit.className = "confetti";
      bit.style.left = rnd(5, 95) + "%";
      bit.style.background = CONFETTI[i % CONFETTI.length];
      bit.style.animationDelay = rnd(0, 0.5) + "s";
      bit.style.animationDuration = rnd(1.4, 2.4) + "s";
      bit.style.setProperty("--spin", rnd(-720, 720) + "deg");
      bit.style.setProperty("--drift", rnd(-80, 80) + "px");
      stage.appendChild(bit);
      setTimeout(function (b) { b.remove(); }, 3200, bit);
    }
  }

  function solveAll() {
    if (!game) return;
    game.helped = true;
    svg.classList.add("is-flying");
    game.pieces.forEach(function (p, i) {
      if (p.placed) return;
      p.node.style.transitionDelay = (i * 25) + "ms";
      place(p, false);
    });
    setTimeout(function () { svg.classList.remove("is-flying"); finish(); }, 700 + game.pieces.length * 25);
  }

  // ---------------------------------------------------------------- dragging
  function toSvg(e) {
    var pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  var drag = null;
  svg.addEventListener("pointerdown", function (e) {
    var node = e.target.closest(".piece");
    if (!node || !game || svg.classList.contains("is-flying")) return;
    var p = game.pieces[Number(node.dataset.i)];
    if (!p || p.placed) return;
    e.preventDefault();
    var pt = toSvg(e);
    drag = { id: e.pointerId, p: p, dx: pt.x - p.x, dy: pt.y - p.y };
    game.layer.appendChild(node); // bring to front
    node.classList.add("is-dragging");
    svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var pt = toSvg(e), p = drag.p;
    var x = Math.max(-p.pad, Math.min(game.AW - game.pw + p.pad, pt.x - drag.dx));
    var y = Math.max(-p.pad, Math.min(game.AH - game.ph + p.pad, pt.y - drag.dy));
    setPos(p, x, y);
  });
  function drop(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var p = drag.p;
    p.node.classList.remove("is-dragging");
    drag = null;
    game.moves++;
    var snap = Math.min(game.pw, game.ph) * 0.28;
    if (Math.abs(p.x - p.hx) < snap && Math.abs(p.y - p.hy) < snap) {
      place(p, true);
      if (game.placed === game.pieces.length) finish();
    }
    updateStatus();
  }
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  // ---------------------------------------------------------------- buttons & keys
  startBtn.addEventListener("click", start);
  document.getElementById("puzzle-exit").addEventListener("click", exit);
  document.getElementById("puzzle-shuffle").addEventListener("click", function () {
    if (!game) return;
    scatter(game.pieces.filter(function (p) { return !p.placed; }), true);
  });
  document.getElementById("puzzle-solve").addEventListener("click", solveAll);
  peekBtn.addEventListener("click", function () { setPeek(peekBtn.getAttribute("aria-pressed") !== "true"); });
  document.querySelectorAll("[data-pieces]").forEach(function (b) {
    b.addEventListener("click", function () {
      pieceCount = Number(b.dataset.pieces);
      document.querySelectorAll("[data-pieces]").forEach(function (o) { o.setAttribute("aria-checked", String(o === b)); });
      start();
    });
  });
  document.getElementById("solved-again").addEventListener("click", start);
  document.getElementById("solved-close").addEventListener("click", exit);

  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (!game && (e.key === "p" || e.key === "P")) { e.preventDefault(); start(); }
    else if (game && e.key === "Escape") { e.preventDefault(); exit(); }
  });

  // the puzzle needs the image; if it can't load, hide the button
  whenLoaded(img, function () {
    if (viewer.hasAttribute("data-autoplay")) start();
  }, function () {
    startBtn.hidden = true;
  });
})();
