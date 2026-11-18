// Atelier: build your own cubist Mediterranean landscape out of SVG parts.
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var INK = "#1c1916";
  var COLORS = ["#f2e8d5", "#d6432b", "#e9b23c", "#2348a0", "#2f86c4", "#4d7a3c", "#e7a59a", "#ffffff", "#1c1916"];
  var STORE_KEY = "museo-picasso-atelier-v1";

  // ---------------------------------------------------------------- parts
  // Each part draws itself around (0,0) in roughly a 200x200 box, using `c` as its main colour.
  var S = 'stroke="' + INK + '" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
  var PARTS = {
    huis: {
      name: "Huis", color: "#f2e8d5",
      draw: function (c) {
        return '<g ' + S + '>' +
          '<path d="M-80 100 V-20 L0 -60 L80 -20 V100Z" fill="' + c + '"/>' +
          '<path d="M-95 -15 L0 -95 L95 -15Z" fill="#d6432b"/>' +
          '<rect x="-55" y="5" width="32" height="44" fill="#4d7a3c"/>' +
          '<rect x="23" y="5" width="32" height="44" fill="#4d7a3c"/>' +
          '<path d="M-20 100 V70 Q0 45 20 70 V100Z" fill="#2348a0"/></g>';
      }
    },
    toren: {
      name: "Toren", color: "#e9b23c",
      draw: function (c) {
        return '<g ' + S + '>' +
          '<path d="M-45 110 V-60 H45 V110Z" fill="' + c + '"/>' +
          '<path d="M-58 -58 L0 -120 L58 -58Z" fill="#d6432b"/>' +
          '<rect x="-24" y="-35" width="48" height="36" fill="#f2e8d5"/>' +
          '<path d="M-24 -35 L24 1 M24 -35 L-24 1" stroke-width="3"/>' +
          '<rect x="-15" y="30" width="30" height="45" fill="#2f86c4"/></g>';
      }
    },
    boog: {
      name: "Boog", color: "#f2e8d5",
      draw: function (c) {
        return '<g ' + S + '>' +
          '<path d="M-95 90 V-50 L85 -75 L100 -40 V90Z" fill="' + c + '"/>' +
          '<path d="M-45 90 V20 Q0 -40 45 20 V90Z" fill="' + INK + '"/>' +
          '<path d="M-80 -35 H-40 V-5 H-80Z" fill="#d6432b"/>' +
          '<path d="M45 -45 H80 V-10 H45Z" fill="#4d7a3c"/></g>';
      }
    },
    palm: {
      name: "Palm", color: "#4d7a3c",
      draw: function (c) {
        return '<g fill="none" ' + S + '>' +
          '<path d="M0 120 Q-15 20 15 -60" stroke-width="16"/>' +
          '<path d="M15 -60 Q70 -110 95 -50 M15 -60 Q-20 -125 -85 -95 M15 -60 Q90 -35 75 25 M15 -60 Q-55 -55 -80 5 M15 -60 Q35 -130 85 -125" stroke="' + c + '" stroke-width="15"/>' +
          '</g>';
      }
    },
    cipres: {
      name: "Cipres", color: "#4d7a3c",
      draw: function (c) {
        return '<g ' + S + '>' +
          '<path d="M0 -120 Q45 -10 30 100 H-30 Q-45 -10 0 -120Z" fill="' + c + '"/>' +
          '<path d="M0 -90 L0 95 M0 -40 L18 -60 M0 10 L-20 -10 M0 50 L22 30" fill="none" stroke-width="4"/>' +
          '<rect x="-8" y="100" width="16" height="22" fill="#8a5a3a"/></g>';
      }
    },
    boot: {
      name: "Zeilboot", color: "#f2e8d5",
      draw: function (c) {
        return '<g ' + S + '>' +
          '<path d="M-95 60 H95 L70 95 H-70Z" fill="#d6432b"/>' +
          '<path d="M-5 -110 V55 H-85Z" fill="' + c + '"/>' +
          '<path d="M5 -85 V55 H75Z" fill="#e7a59a"/>' +
          '<path d="M-5 -110 L0 -125 L18 -118" fill="none" stroke-width="4"/></g>';
      }
    },
    zon: {
      name: "Zon", color: "#e9b23c",
      draw: function (c) {
        var rays = "";
        for (var i = 0; i < 8; i++) {
          var a = (i * Math.PI) / 4;
          var x1 = Math.cos(a - 0.18) * 72, y1 = Math.sin(a - 0.18) * 72;
          var x2 = Math.cos(a) * 112, y2 = Math.sin(a) * 112;
          var x3 = Math.cos(a + 0.18) * 72, y3 = Math.sin(a + 0.18) * 72;
          rays += "M" + x1.toFixed(1) + " " + y1.toFixed(1) + " L" + x2.toFixed(1) + " " + y2.toFixed(1) + " L" + x3.toFixed(1) + " " + y3.toFixed(1) + "Z ";
        }
        return '<g ' + S + '><path d="' + rays + '" fill="' + c + '"/>' +
          '<circle r="68" fill="' + c + '"/><path d="M-68 0 A68 68 0 0 1 68 0Z" fill="#d6432b" opacity=".35" stroke="none"/></g>';
      }
    },
    zee: {
      name: "Zee", color: "#2348a0",
      draw: function (c) {
        return '<g ' + S + '>' +
          '<path d="M-200 -30 L200 -50 V50 L-200 60Z" fill="' + c + '"/>' +
          '<path d="M-170 0 Q-150 -18 -130 0 M-60 -8 Q-40 -26 -20 -8 M50 -14 Q70 -32 90 -14 M120 22 Q140 4 160 22 M-110 34 Q-90 16 -70 34" fill="none" stroke="#f2e8d5" stroke-width="5"/></g>';
      }
    },
    trap: {
      name: "Trap", color: "#e7a59a",
      draw: function (c) {
        return '<g ' + S + '>' +
          '<path d="M-100 90 V60 H-50 V20 H0 V-20 H50 V-60 H100 V90Z" fill="' + c + '"/>' +
          '<path d="M-100 60 H-50 M-50 20 H0 M0 -20 H50 M50 -60 H100" stroke="#f2e8d5" stroke-width="5" fill="none"/></g>';
      }
    },
    bloemen: {
      name: "Bloemenveld", color: "#e9b23c",
      draw: function (c) {
        var dots = "";
        var pts = [[-60, 50], [-20, 30], [20, 55], [60, 40], [-30, 70], [35, 75], [0, 10], [-75, 75], [80, 70]];
        pts.forEach(function (p, i) {
          dots += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i % 2 ? 7 : 9) + '" fill="' + (i % 3 ? "#d6432b" : "#ffffff") + '" stroke="' + INK + '" stroke-width="3"/>';
        });
        return '<g ' + S + '><path d="M-110 90 L0 -40 L110 90Z" fill="' + c + '"/></g>' + dots;
      }
    },
    pot: {
      name: "Plantenpot", color: "#d6432b",
      draw: function (c) {
        return '<g ' + S + '>' +
          '<path d="M-20 -10 Q-70 -80 -40 -120 M0 -10 Q0 -90 20 -125 M15 -10 Q70 -70 60 -110" stroke="#4d7a3c" stroke-width="13" fill="none"/>' +
          '<path d="M-55 -10 H55 L40 100 H-40Z" fill="' + c + '"/>' +
          '<path d="M-48 30 H48" fill="none" stroke-width="4"/></g>';
      }
    },
    wolk: {
      name: "Wolk", color: "#ffffff",
      draw: function (c) {
        return '<g ' + S + '><path d="M-110 30 L-80 -20 L-30 -10 L0 -50 L50 -30 L70 -5 L115 0 L95 35Z" fill="' + c + '"/></g>';
      }
    },
    scherf: {
      name: "Scherf", color: "#2f86c4",
      draw: function (c) {
        return '<g ' + S + '><path d="M-90 80 L-20 -100 L100 30Z" fill="' + c + '"/>' +
          '<path d="M-20 -100 L5 40" fill="none" stroke-width="4"/></g>';
      }
    },
    oog: {
      name: "Oog", color: "#f2e8d5",
      draw: function (c) {
        return '<g ' + S + '><path d="M-100 0 Q0 -80 100 0 Q0 80 -100 0Z" fill="' + c + '"/>' +
          '<circle r="32" fill="#2348a0"/><circle r="13" fill="' + INK + '"/>' +
          '<circle cx="-9" cy="-10" r="5" fill="#ffffff" stroke="none"/></g>';
      }
    }
  };

  var BACKDROPS = {
    middag: { name: "Middag", draw: function () {
      return '<rect width="800" height="800" fill="#2f86c4"/>' +
        '<path d="M0 0 H800 V300 L520 340 L0 280Z" fill="#5fa8db"/>' +
        '<path d="M0 330 L800 310 V440 L0 460Z" fill="#2348a0"/>' +
        '<path d="M0 460 L800 440 V800 H0Z" fill="#f2e8d5"/>' +
        '<path d="M0 330 L800 310 M0 460 L800 440" stroke="' + INK + '" stroke-width="6"/>';
    } },
    avond: { name: "Avond", draw: function () {
      return '<rect width="800" height="800" fill="#e7a59a"/>' +
        '<path d="M0 0 H800 V180 L0 240Z" fill="#d6432b"/>' +
        '<path d="M0 340 L800 320 V450 L0 470Z" fill="#2348a0"/>' +
        '<path d="M0 470 L800 450 V800 H0Z" fill="#e9b23c"/>' +
        '<path d="M0 340 L800 320 M0 470 L800 450" stroke="' + INK + '" stroke-width="6"/>';
    } },
    nacht: { name: "Nacht", draw: function () {
      var stars = "";
      [[90, 80], [240, 140], [380, 60], [520, 170], [690, 90], [150, 230], [610, 250]].forEach(function (p) {
        stars += '<path d="M' + p[0] + ' ' + (p[1] - 12) + ' L' + (p[0] + 4) + ' ' + (p[1] - 3) + ' L' + (p[0] + 12) + ' ' + p[1] + ' L' + (p[0] + 4) + ' ' + (p[1] + 3) + ' L' + p[0] + ' ' + (p[1] + 12) + ' L' + (p[0] - 4) + ' ' + (p[1] + 3) + ' L' + (p[0] - 12) + ' ' + p[1] + ' L' + (p[0] - 4) + ' ' + (p[1] - 3) + 'Z" fill="#e9b23c"/>';
      });
      return '<rect width="800" height="800" fill="#16213d"/>' + stars +
        '<path d="M0 340 L800 320 V450 L0 470Z" fill="#2348a0"/>' +
        '<path d="M0 470 L800 450 V800 H0Z" fill="#3a3a52"/>' +
        '<path d="M0 340 L800 320 M0 470 L800 450" stroke="#0b0f1d" stroke-width="6"/>';
    } },
    doek: { name: "Leeg doek", draw: function () {
      return '<rect width="800" height="800" fill="#f2e8d5"/>';
    } }
  };

  // ---------------------------------------------------------------- state
  var state = { backdrop: "middag", items: [] };
  var selectedId = null;
  var history = [];
  var nextId = 1;

  var svg = document.getElementById("canvas");
  var partsEl = document.getElementById("parts");
  var backdropsEl = document.getElementById("backdrops");
  var tools = document.getElementById("selection-tools");
  var selName = document.getElementById("selection-name");

  function snapshot() {
    history.push(JSON.stringify(state));
    if (history.length > 60) history.shift();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.items)) return false;
      state.backdrop = BACKDROPS[data.backdrop] ? data.backdrop : "middag";
      state.items = data.items.filter(function (it) { return PARTS[it.type]; });
      nextId = state.items.reduce(function (m, it) { return Math.max(m, it.id); }, 0) + 1;
      return true;
    } catch (e) { return false; }
  }

  function find(id) {
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return state.items[i];
    return null;
  }

  function transformOf(it) {
    return "translate(" + it.x.toFixed(1) + " " + it.y.toFixed(1) + ") rotate(" + it.r.toFixed(1) + ") scale(" +
      (it.s * (it.flip ? -1 : 1)).toFixed(3) + " " + it.s.toFixed(3) + ")";
  }

  // ---------------------------------------------------------------- render
  function render() {
    var html = '<g class="bg">' + BACKDROPS[state.backdrop].draw() + "</g>";
    state.items.forEach(function (it) {
      html += '<g class="piece' + (it.id === selectedId ? " is-selected" : "") + '" data-id="' + it.id +
        '" transform="' + transformOf(it) + '">' + PARTS[it.type].draw(it.color) + "</g>";
    });
    svg.innerHTML = html;

    var sel = selectedId && find(selectedId);
    if (sel) {
      // dashed box around the selected piece
      var g = svg.querySelector('[data-id="' + sel.id + '"]');
      var b = g.getBBox();
      var box = document.createElementNS(NS, "rect");
      var pad = 14;
      box.setAttribute("x", b.x - pad); box.setAttribute("y", b.y - pad);
      box.setAttribute("width", b.width + pad * 2); box.setAttribute("height", b.height + pad * 2);
      box.setAttribute("class", "selection-box");
      box.setAttribute("vector-effect", "non-scaling-stroke");
      g.appendChild(box);
    }
    tools.setAttribute("aria-disabled", sel ? "false" : "true");
    selName.textContent = sel ? PARTS[sel.type].name : "Klik een onderdeel op het doek aan";
    document.querySelectorAll("#backdrops button").forEach(function (b) {
      b.setAttribute("aria-checked", String(b.dataset.backdrop === state.backdrop));
    });
    save();
  }

  // ---------------------------------------------------------------- actions
  function add(type, opts) {
    var it = Object.assign({
      id: nextId++, type: type, x: 400 + (Math.random() * 160 - 80), y: 450 + (Math.random() * 120 - 60),
      s: 0.9, r: 0, flip: false, color: PARTS[type].color
    }, opts || {});
    state.items.push(it);
    return it;
  }

  function act(name) {
    var it = selectedId && find(selectedId);
    if (!it) return;
    snapshot();
    var idx = state.items.indexOf(it);
    switch (name) {
      case "bigger": it.s = Math.min(3, it.s * 1.15); break;
      case "smaller": it.s = Math.max(0.2, it.s / 1.15); break;
      case "rotl": it.r -= 15; break;
      case "rotr": it.r += 15; break;
      case "flip": it.flip = !it.flip; break;
      case "color":
        var ci = COLORS.indexOf(it.color);
        it.color = COLORS[(ci + 1) % COLORS.length];
        break;
      case "front": state.items.splice(idx, 1); state.items.push(it); break;
      case "back": state.items.splice(idx, 1); state.items.unshift(it); break;
      case "dupe":
        var copy = Object.assign({}, it, { id: nextId++, x: it.x + 30, y: it.y + 30 });
        state.items.push(copy); selectedId = copy.id; break;
      case "delete": state.items.splice(idx, 1); selectedId = null; break;
    }
    render();
  }

  function undo() {
    if (!history.length) return;
    var prev = JSON.parse(history.pop());
    state.backdrop = prev.backdrop; state.items = prev.items;
    if (selectedId && !find(selectedId)) selectedId = null;
    render();
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  // a random but always pleasant composition: sky things up, buildings on the shore, plants in front
  function surprise() {
    snapshot();
    state.items = []; selectedId = null;
    state.backdrop = pick(["middag", "middag", "avond", "nacht"]);
    add(state.backdrop === "nacht" ? "oog" : "zon", { x: rnd(520, 700), y: rnd(90, 170), s: rnd(0.6, 0.85), color: state.backdrop === "nacht" ? "#f2e8d5" : "#e9b23c" });
    add("wolk", { x: rnd(80, 300), y: rnd(80, 160), s: rnd(0.6, 0.9) });
    add("boot", { x: rnd(480, 680), y: rnd(300, 330), s: rnd(0.55, 0.75) });
    var x = rnd(60, 110);
    while (x < 720) {
      var type = pick(["huis", "huis", "toren", "boog"]);
      add(type, { x: x, y: rnd(470, 540), s: rnd(0.8, 1.15), color: pick(["#f2e8d5", "#f2e8d5", "#e9b23c", "#ffffff", "#e7a59a"]), r: rnd(-4, 4) });
      x += rnd(120, 190);
    }
    add(pick(["palm", "cipres"]), { x: rnd(600, 740), y: rnd(470, 520), s: rnd(1.2, 1.6) });
    add("trap", { x: rnd(300, 500), y: rnd(660, 700), s: rnd(0.7, 1) });
    add("bloemen", { x: rnd(90, 220), y: rnd(690, 730), s: rnd(0.9, 1.3) });
    add("bloemen", { x: rnd(560, 720), y: rnd(700, 740), s: rnd(0.8, 1.1), color: "#4d7a3c" });
    add("pot", { x: rnd(40, 90), y: rnd(640, 700), s: rnd(0.7, 0.9) });
    add("scherf", { x: rnd(250, 550), y: rnd(740, 780), s: rnd(0.6, 0.9), r: rnd(-30, 30), color: pick(COLORS.slice(1, 6)) });
    render();
  }

  function shake() {
    if (!state.items.length) return;
    snapshot();
    state.items.forEach(function (it) {
      it.r += rnd(-9, 9);
      it.x += rnd(-12, 12);
      it.y += rnd(-12, 12);
    });
    render();
  }

  function clearCanvas() {
    if (!state.items.length) return;
    snapshot();
    state.items = []; selectedId = null;
    render();
  }

  function download() {
    var prevSel = selectedId;
    selectedId = null; render();
    var xml = new XMLSerializer().serializeToString(svg)
      .replace("<svg", '<svg xmlns="' + NS + '" width="1600" height="1600"');
    selectedId = prevSel; render();

    var img = new Image();
    var url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
    img.onload = function () {
      var c = document.createElement("canvas");
      c.width = 1600; c.height = 1600;
      c.getContext("2d").drawImage(img, 0, 0, 1600, 1600);
      URL.revokeObjectURL(url);
      c.toBlob(function (blob) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mijn-picasso.png";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      }, "image/png");
    };
    img.src = url;
  }

  // ---------------------------------------------------------------- UI: drawer
  Object.keys(PARTS).forEach(function (key) {
    var p = PARTS[key];
    var b = document.createElement("button");
    b.type = "button";
    b.className = "part";
    b.title = p.name + " toevoegen";
    b.innerHTML = '<svg viewBox="-130 -130 260 260" aria-hidden="true">' + p.draw(p.color) + "</svg><span>" + p.name + "</span>";
    b.addEventListener("click", function () {
      snapshot();
      selectedId = add(key).id;
      render();
    });
    partsEl.appendChild(b);
  });

  Object.keys(BACKDROPS).forEach(function (key) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "radio");
    b.dataset.backdrop = key;
    b.innerHTML = '<svg viewBox="0 0 800 800" aria-hidden="true">' + BACKDROPS[key].draw() + "</svg><span>" + BACKDROPS[key].name + "</span>";
    b.addEventListener("click", function () {
      if (state.backdrop === key) return;
      snapshot(); state.backdrop = key; render();
    });
    backdropsEl.appendChild(b);
  });

  tools.querySelectorAll("[data-act]").forEach(function (b) {
    b.addEventListener("click", function () { act(b.dataset.act); });
  });
  document.getElementById("surprise").addEventListener("click", surprise);
  document.getElementById("shake").addEventListener("click", shake);
  document.getElementById("undo").addEventListener("click", undo);
  document.getElementById("clear").addEventListener("click", clearCanvas);
  document.getElementById("download").addEventListener("click", download);

  // ---------------------------------------------------------------- UI: dragging on the canvas
  function toSvg(e) {
    var pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  var drag = null;
  svg.addEventListener("pointerdown", function (e) {
    var g = e.target.closest(".piece");
    if (!g) { if (selectedId) { selectedId = null; render(); } return; }
    var it = find(Number(g.dataset.id));
    if (!it) return;
    e.preventDefault();
    snapshot();
    selectedId = it.id;
    var p = toSvg(e);
    drag = { id: e.pointerId, it: it, dx: p.x - it.x, dy: p.y - it.y, moved: false };
    svg.setPointerCapture(e.pointerId);
    render();
    svg.focus({ preventScroll: true });
  });
  svg.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var p = toSvg(e);
    drag.it.x = Math.max(-50, Math.min(850, p.x - drag.dx));
    drag.it.y = Math.max(-50, Math.min(850, p.y - drag.dy));
    drag.moved = true;
    var g = svg.querySelector('[data-id="' + drag.it.id + '"]');
    if (g) g.setAttribute("transform", transformOf(drag.it));
  });
  function endDrag() {
    if (!drag) return;
    if (!drag.moved) history.pop(); // a plain click is not an undo step
    drag = null;
    render();
  }
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);

  // ---------------------------------------------------------------- keyboard
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea")) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var it = selectedId && find(selectedId);
    if (!it) return;
    var step = e.shiftKey ? 30 : 8;
    var map = { "+": "bigger", "=": "bigger", "-": "smaller", "_": "smaller", "[": "rotl", "]": "rotr",
                m: "flip", M: "flip", c: "color", C: "color", d: "dupe", D: "dupe", Delete: "delete", Backspace: "delete" };
    if (map[e.key]) { e.preventDefault(); act(map[e.key]); return; }
    var moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      snapshot();
      it.x += moves[e.key][0]; it.y += moves[e.key][1];
      render();
    }
    if (e.key === "Escape") { selectedId = null; render(); }
  });

  // ---------------------------------------------------------------- start
  if (!load() || !state.items.length) {
    surprise();
    history = [];
  } else {
    render();
  }
})();
