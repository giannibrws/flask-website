// Jigsaw puzzle game on the artwork page.
//
// Performance, so dragging stays smooth even with 36 pieces on slow machines:
// - every loose piece is its own small <canvas>, pre-rendered once (shadow baked in, no CSS
//   filters) and moved with translate3d() on its own compositor layer: no repaints at all;
// - a placed piece is painted onto one shared board canvas and its own layer is removed,
//   so the GPU has less to juggle the further you get.
import { gridFor, loaded, makeCut, piecePath, random, svgEl } from "./jigsaw.js";

const CONFETTI = ["#2348a0", "#d6432b", "#e9b23c", "#4d7a3c", "#e7a59a", "#f2e8d5"];
const SNAP = 0.28;    // snap when within this fraction of a piece
const KNOB = 0.3;     // room around a piece for its knobs (they stick out ~0.26)
const SHADOW = 14;    // extra room (board units) for the baked-in drop shadow

const $ = (id) => document.getElementById(id);
const fmt = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const store = {
  get(key) { try { return Number(localStorage.getItem(key)) || null; } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, String(value)); } catch { /* private mode */ } },
};

class Piece {
  constructor({ r, c, d, path, canvas, homeX, homeY }) {
    Object.assign(this, { r, c, d, path, canvas, homeX, homeY });
    this.x = homeX;
    this.y = homeY;
    this.placed = false;
  }

  /** Is this client point on the piece itself (not on a transparent corner)? */
  hit(clientX, clientY) {
    const box = this.canvas.getBoundingClientRect();
    const px = ((clientX - box.left) / box.width) * this.canvas.width;
    const py = ((clientY - box.top) / box.height) * this.canvas.height;
    // the canvas keeps its drawing transform, so this tests against the piece outline
    return this.canvas.getContext("2d").isPointInPath(this.path, px, py);
  }
}

class JigsawPuzzle {
  pieceCount = 9;
  pieces = [];
  #timer = 0;
  #drag = null;
  #frame = 0;
  #pending = null;
  #zTop = 1;
  #startToken = 0;

  constructor() {
    this.viewer = $("viewer");
    this.stage = $("stage");
    this.img = $("painting");
    this.root = $("puzzle");
    this.area = this.root.querySelector(".puzzle__area");
    this.board = this.root.querySelector(".puzzle__board");
    this.placedCanvas = this.root.querySelector(".puzzle__placed");
    this.layer = this.root.querySelector(".puzzle__layer");
    this.status = $("puzzle-status");
    this.peekBtn = $("puzzle-peek");
    this.solvedBox = $("solved");
    this.slug = location.pathname.split("/").pop();

    this.#bindUi();
    this.#bindDrag();
    new ResizeObserver(() => this.#layout()).observe(this.area);

    loaded(this.img)
      .then(() => this.viewer.hasAttribute("data-autoplay") && this.start())
      .catch(() => { $("puzzle-start").hidden = true; });
  }

  get running() { return !this.root.hidden; }
  get elapsed() { return this.startedAt ? (this.endedAt || Date.now()) - this.startedAt : 0; }

  // ------------------------------------------------------------------ lifecycle
  async start() {
    if (!this.img.naturalWidth) return;
    const token = ++this.#startToken;
    document.dispatchEvent(new CustomEvent("puzzle:start"));

    this.viewer.classList.add("is-puzzle");
    this.root.hidden = false;
    this.root.classList.remove("is-done", "is-flying");
    this.solvedBox.hidden = true;
    $("view-tools").hidden = true;
    $("puzzle-tools").hidden = false;
    this.#setPeek(false);
    clearInterval(this.#timer);

    this.#build();
    this.#updateStatus();

    // show the intact painting for a beat, then break it apart
    await new Promise((resolve) => setTimeout(resolve, 450));
    if (token !== this.#startToken) return; // restarted or exited meanwhile
    this.#scatter(this.pieces.toSorted(() => Math.random() - 0.5));
    this.startedAt = Date.now();
    this.endedAt = 0;
    this.#timer = setInterval(() => this.#updateStatus(), 1000);
  }

  exit() {
    this.#startToken++;
    clearInterval(this.#timer);
    this.pieces = [];
    this.layer.replaceChildren();
    this.board.replaceChildren();
    this.placedCtx?.clearRect(0, 0, this.AW, this.AH);
    this.root.hidden = true;
    this.solvedBox.hidden = true;
    this.viewer.classList.remove("is-puzzle");
    $("puzzle-tools").hidden = true;
    $("view-tools").hidden = false;
    this.stage.focus({ preventScroll: true });
  }

  // ------------------------------------------------------------------ building
  #build() {
    const { naturalWidth: W0, naturalHeight: H0 } = this.img;
    const k = 1000 / Math.max(W0, H0); // the board is 1000 units on its long side
    const W = W0 * k;
    const H = H0 * k;
    const [cols, rows] = gridFor(this.pieceCount, W / H);
    const pw = W / cols;
    const ph = H / rows;

    // room around the board for loose pieces, stretched to the shape of the stage:
    // wide screens get space left and right, phones get it above and below
    const m0 = Math.max(pw, ph) * 1.1;
    let AW = W + m0 * 2;
    let AH = H + m0 * 2;
    const stageAspect = this.root.clientWidth / Math.max(1, this.root.clientHeight);
    if (AW / AH < stageAspect) AW = AH * stageAspect; else AH = AW / stageAspect;

    Object.assign(this, { W, H, pw, ph, AW, AH, mx: (AW - W) / 2, my: (AH - H) / 2, pad: Math.min(pw, ph) * KNOB + SHADOW });
    Object.assign(this, { placed: 0, moves: 0, helped: false, startedAt: 0, endedAt: 0 });
    this.area.style.setProperty("--ar", String(AW / AH));
    this.scale = this.area.clientWidth / AW || 1;

    const cut = makeCut(cols, rows);
    const src = this.img;

    // the board: a dashed bed, a ghost copy for peeking, and faint cut lines
    this.board.setAttribute("viewBox", `0 0 ${AW} ${AH}`);
    this.board.replaceChildren();
    const g = svgEl("g", { transform: `translate(${this.mx} ${this.my})` }, this.board);
    svgEl("rect", { x: -10, y: -10, width: W + 20, height: H + 20, class: "puzzle__bed" }, g);
    svgEl("image", { href: src.currentSrc || src.src, width: W, height: H, class: "puzzle__ghost", preserveAspectRatio: "none" }, g);
    const guides = svgEl("g", { class: "puzzle__guides" }, g);

    // pieces: draw each one once into its own canvas
    // (showing a canvas never needs CORS, and isPointInPath works on any canvas)
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const res = Math.min(src.naturalWidth / W, this.scale * dpr * 1.25); // canvas px per board unit
    const lineWidth = Math.max(1.2, 1.6 / this.scale);
    const frag = document.createDocumentFragment();
    this.pieces = [];
    this.lineWidth = lineWidth;

    // one shared canvas that placed pieces are painted onto
    const boardRes = Math.min(src.naturalWidth / W, this.scale * dpr);
    this.placedCanvas.width = Math.ceil(AW * boardRes);
    this.placedCanvas.height = Math.ceil(AH * boardRes);
    this.placedCtx = this.placedCanvas.getContext("2d");
    this.placedCtx.setTransform(boardRes, 0, 0, boardRes, 0, 0);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const d = piecePath(cut, r, c, pw, ph);
        svgEl("path", { d, transform: `translate(${c * pw} ${r * ph})` }, guides);

        const canvas = document.createElement("canvas");
        canvas.className = "piece";
        canvas.dataset.i = String(this.pieces.length);
        canvas.width = Math.ceil((pw + this.pad * 2) * res);
        canvas.height = Math.ceil((ph + this.pad * 2) * res);
        const ctx = canvas.getContext("2d");
        ctx.setTransform(res, 0, 0, res, this.pad * res, this.pad * res);
        const path = new Path2D(d);
        // drop shadow, baked in (shadow sizes are in canvas pixels, not transformed)
        ctx.save();
        Object.assign(ctx, { shadowColor: "rgba(0, 0, 0, .5)", shadowBlur: 7 * res, shadowOffsetY: 5 * res, fillStyle: "#000" });
        ctx.fill(path);
        ctx.restore();
        // the painting, cut to shape (covers the black fill)
        ctx.save();
        ctx.clip(path);
        ctx.drawImage(src, -c * pw, -r * ph, W, H);
        ctx.restore();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "rgba(20, 16, 12, .6)";
        ctx.stroke(path);

        this.pieces.push(new Piece({ r, c, d, path, canvas, homeX: this.mx + c * pw, homeY: this.my + r * ph }));
        frag.append(canvas);
      }
    }
    this.layer.replaceChildren(frag);
    this.#layout();
  }

  /** Size and place every canvas for the current on-screen scale. */
  #layout() {
    if (!this.pieces.length) return;
    this.scale = this.area.clientWidth / this.AW;
    const width = `${(this.pw + this.pad * 2) * this.scale}px`;
    const height = `${(this.ph + this.pad * 2) * this.scale}px`;
    for (const p of this.pieces) {
      Object.assign(p.canvas.style, { width, height });
      this.#move(p, p.x, p.y);
    }
  }

  #move(p, x, y) {
    p.x = x;
    p.y = y;
    const s = this.scale;
    p.canvas.style.transform = `translate3d(${((x - this.pad) * s).toFixed(1)}px, ${((y - this.pad) * s).toFixed(1)}px, 0)`;
  }

  /** A spot for a loose piece: anywhere in the area, but preferably off the board. */
  #spot() {
    let x, y;
    for (let tries = 0; tries < 30; tries++) {
      x = random(this.pad, this.AW - this.pw - this.pad);
      y = random(this.pad, this.AH - this.ph - this.pad);
      const onBoard = x > this.mx - this.pw * 0.6 && x < this.mx + this.W - this.pw * 0.4 &&
                      y > this.my - this.ph * 0.6 && y < this.my + this.H - this.ph * 0.4;
      if (!onBoard) break;
    }
    return [x, y];
  }

  #scatter(list) {
    this.root.classList.add("is-flying");
    list.forEach((p, i) => {
      p.canvas.style.transitionDelay = `${i * 16}ms`;
      this.#move(p, ...this.#spot());
    });
    clearTimeout(this.flyTimer);
    this.flyTimer = setTimeout(() => {
      this.root.classList.remove("is-flying");
      for (const p of list) p.canvas.style.transitionDelay = "";
    }, 800 + list.length * 16);
  }

  // ------------------------------------------------------------------ playing
  /** Lock a piece in place; once it has landed, paint it onto the board and drop its layer. */
  #place(p, settleMs = 160) {
    p.placed = true;
    p.canvas.classList.add("is-placed");
    p.canvas.style.zIndex = 0; // placed pieces sit underneath loose ones
    this.#move(p, p.homeX, p.homeY);
    this.placed++;
    setTimeout(() => this.#bake(p), settleMs);
  }

  #bake(p) {
    if (!this.pieces.includes(p) || !p.canvas.isConnected) return; // puzzle restarted meanwhile
    const ctx = this.placedCtx;
    const path = new Path2D(p.d);
    ctx.save();
    ctx.translate(p.homeX, p.homeY);
    ctx.save();
    ctx.clip(path);
    ctx.drawImage(this.img, -p.c * this.pw, -p.r * this.ph, this.W, this.H);
    ctx.restore();
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = "rgba(20, 16, 12, .2)";
    ctx.stroke(path);
    ctx.restore();
    p.canvas.remove();
  }

  #finish() {
    this.endedAt = Date.now();
    clearInterval(this.#timer);
    this.#updateStatus();

    const key = `museo-picasso-best:${this.slug}:${this.pieceCount}`;
    const time = this.elapsed;
    const best = store.get(key);
    let note = "";
    if (!this.helped) {
      if (!best || time < best) store.set(key, time);
      if (best && time < best) note = " New personal best!";
      else if (best) note = ` Your best: ${fmt(best)}.`;
    }

    this.root.classList.add("is-done");
    this.#confetti();
    setTimeout(() => {
      $("solved-stats").textContent = this.helped
        ? "Solved with a little help. Try it again without the Solve button!"
        : `${this.pieces.length} pieces in ${fmt(time)} with ${this.moves} moves.${note}`;
      this.solvedBox.hidden = false;
      $("solved-again").focus({ preventScroll: true });
    }, 1100);
  }

  #solveAll() {
    const loose = this.pieces.filter((p) => !p.placed);
    if (!loose.length) return;
    this.helped = true;
    this.root.classList.add("is-flying");
    loose.forEach((p, i) => {
      p.canvas.style.transitionDelay = `${i * 22}ms`;
      this.#place(p, 800 + i * 22);
    });
    setTimeout(() => {
      this.root.classList.remove("is-flying");
      this.#finish();
    }, 650 + loose.length * 22);
  }

  #setPeek(on) {
    this.peekBtn.setAttribute("aria-pressed", String(on));
    this.root.classList.toggle("is-peeking", on);
  }

  #updateStatus() {
    this.status.textContent =
      `${this.placed} / ${this.pieces.length} pieces · ${fmt(this.elapsed)} · ` +
      `${this.moves} ${this.moves === 1 ? "move" : "moves"}`;
  }

  #confetti() {
    const bits = Array.from({ length: 70 }, (_, i) => {
      const bit = document.createElement("span");
      bit.className = "confetti";
      bit.style.cssText =
        `left:${random(5, 95)}%;background:${CONFETTI[i % CONFETTI.length]};` +
        `animation-delay:${random(0, 0.5)}s;animation-duration:${random(1.4, 2.4)}s;` +
        `--spin:${random(-720, 720)}deg;--drift:${random(-80, 80)}px`;
      return bit;
    });
    this.stage.append(...bits);
    setTimeout(() => bits.forEach((b) => b.remove()), 3200);
  }

  // ------------------------------------------------------------------ input
  #bindDrag() {
    this.layer.addEventListener("pointerdown", (e) => {
      if (this.root.classList.contains("is-flying")) return;
      // the topmost loose piece whose actual shape is under the pointer
      const zOf = (p) => Number(p.canvas.style.zIndex) || 0;
      const piece = this.pieces
        .filter((p) => !p.placed)
        .sort((a, b) => zOf(b) - zOf(a))
        .find((p) => p.hit(e.clientX, e.clientY));
      if (!piece) return;

      e.preventDefault();
      const box = this.area.getBoundingClientRect();
      this.#drag = {
        id: e.pointerId, piece, box,
        dx: (e.clientX - box.left) / this.scale - piece.x,
        dy: (e.clientY - box.top) / this.scale - piece.y,
      };
      piece.canvas.style.zIndex = ++this.#zTop;
      piece.canvas.classList.add("is-dragging");
      this.layer.setPointerCapture(e.pointerId);
    });

    this.layer.addEventListener("pointermove", (e) => {
      if (e.pointerId !== this.#drag?.id) return;
      this.#pending = e;
      this.#frame ||= requestAnimationFrame(() => this.#applyMove()); // one update per frame
    });

    const drop = (e) => {
      if (e.pointerId !== this.#drag?.id) return;
      if (this.#pending) { cancelAnimationFrame(this.#frame); this.#applyMove(); }
      const { piece } = this.#drag;
      this.#drag = null;
      piece.canvas.classList.remove("is-dragging");
      this.moves++;

      const snap = Math.min(this.pw, this.ph) * SNAP;
      if (Math.abs(piece.x - piece.homeX) < snap && Math.abs(piece.y - piece.homeY) < snap) {
        piece.canvas.classList.add("is-snapping");
        this.#place(piece);
        setTimeout(() => piece.canvas.classList.remove("is-snapping"), 250);
        if (this.placed === this.pieces.length) this.#finish();
      }
      this.#updateStatus();
    };
    this.layer.addEventListener("pointerup", drop);
    this.layer.addEventListener("pointercancel", drop);
  }

  #applyMove() {
    this.#frame = 0;
    const e = this.#pending;
    const drag = this.#drag;
    this.#pending = null;
    if (!e || !drag) return;
    const { piece, box } = drag;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    this.#move(piece,
      clamp((e.clientX - box.left) / this.scale - drag.dx, -this.pad, this.AW - this.pw + this.pad),
      clamp((e.clientY - box.top) / this.scale - drag.dy, -this.pad, this.AH - this.ph + this.pad));
  }

  #bindUi() {
    $("puzzle-start").addEventListener("click", () => this.start());
    $("puzzle-exit").addEventListener("click", () => this.exit());
    $("puzzle-shuffle").addEventListener("click", () => this.#scatter(this.pieces.filter((p) => !p.placed)));
    $("puzzle-solve").addEventListener("click", () => this.#solveAll());
    this.peekBtn.addEventListener("click", () => this.#setPeek(this.peekBtn.getAttribute("aria-pressed") !== "true"));
    $("solved-again").addEventListener("click", () => this.start());
    $("solved-close").addEventListener("click", () => this.exit());

    const levels = document.querySelectorAll("[data-pieces]");
    for (const btn of levels) {
      btn.addEventListener("click", () => {
        this.pieceCount = Number(btn.dataset.pieces);
        for (const other of levels) other.setAttribute("aria-checked", String(other === btn));
        this.start();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!this.running && e.key.toLowerCase() === "p") { e.preventDefault(); this.start(); }
      else if (this.running && e.key === "Escape") { e.preventDefault(); this.exit(); }
    });
  }
}

if ($("puzzle")) new JigsawPuzzle();
