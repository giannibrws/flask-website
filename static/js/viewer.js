// Painting viewer: zoom, pan, loupe, fullscreen and keyboard tour navigation.
const MIN = 1;
const MAX = 6;
const LOUPE_ZOOM = 3;
const $ = (id) => document.getElementById(id);

class PaintingViewer {
  scale = 1;
  x = 0;
  y = 0;
  loupeOn = false;
  #drag = null;

  constructor() {
    this.viewer = $("viewer");
    this.stage = $("stage");
    this.frame = $("frame");
    this.img = $("painting");
    this.loupe = $("loupe");
    this.loupeBtn = $("loupe-toggle");
    this.level = $("zoom-level");

    this.#watchImage();
    this.#bind();
    this.render();
  }

  /** While a jigsaw puzzle is running, the viewer stays out of the way. */
  get puzzling() { return this.viewer.classList.contains("is-puzzle"); }

  render(animate = false) {
    // keep the painting from being dragged fully out of view
    const { offsetWidth: w, offsetHeight: h } = this.frame;
    const maxX = this.scale === 1 ? 0 : (w * (this.scale - 1)) / 2 + w * 0.25;
    const maxY = this.scale === 1 ? 0 : (h * (this.scale - 1)) / 2 + h * 0.25;
    this.x = Math.max(-maxX, Math.min(maxX, this.x));
    this.y = Math.max(-maxY, Math.min(maxY, this.y));

    this.frame.style.transition = animate ? "transform .25s cubic-bezier(.2,.7,.2,1)" : "none";
    this.frame.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    this.level.textContent = `${Math.round(this.scale * 100)}%`;
    this.stage.classList.toggle("is-zoomed", this.scale > 1);
  }

  /** Zoom toward a client point, or the centre of the stage. */
  zoomTo(next, { clientX, clientY, animate = false } = {}) {
    next = Math.max(MIN, Math.min(MAX, next));
    const box = this.stage.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const px = (clientX ?? cx) - cx;
    const py = (clientY ?? cy) - cy;
    const ratio = next / this.scale;
    this.x = px - (px - this.x) * ratio;
    this.y = py - (py - this.y) * ratio;
    this.scale = next;
    this.render(animate);
  }

  zoomBy(factor) { this.zoomTo(this.scale * factor, { animate: true }); }

  reset(animate = true) {
    Object.assign(this, { scale: 1, x: 0, y: 0 });
    this.render(animate);
  }

  setLoupe(on) {
    this.loupeOn = on;
    this.loupeBtn.setAttribute("aria-pressed", String(on));
    this.stage.classList.toggle("has-loupe", on);
    if (on) this.loupe.style.backgroundImage = `url("${this.img.currentSrc}")`;
    else this.loupe.classList.remove("is-visible");
  }

  #moveLoupe(e) {
    const r = this.img.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    this.loupe.classList.toggle("is-visible", inside);
    if (!inside) return;
    const s = this.stage.getBoundingClientRect();
    const size = this.loupe.offsetWidth;
    Object.assign(this.loupe.style, {
      left: `${e.clientX - s.left - size / 2}px`,
      top: `${e.clientY - s.top - size / 2}px`,
      backgroundSize: `${r.width * LOUPE_ZOOM}px ${r.height * LOUPE_ZOOM}px`,
      backgroundPosition:
        `${-(e.clientX - r.left) * LOUPE_ZOOM + size / 2}px ${-(e.clientY - r.top) * LOUPE_ZOOM + size / 2}px`,
    });
  }

  toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else this.viewer.requestFullscreen?.().catch(() => {});
  }

  #watchImage() {
    const missing = () => {
      this.img.hidden = true;
      this.frame.querySelector(".viewer__missing").hidden = false;
      this.frame.classList.add("is-missing");
    };
    const ok = () => this.frame.classList.add("is-loaded");
    if (this.img.complete) (this.img.naturalWidth ? ok : missing)();
    this.img.addEventListener("load", ok);
    this.img.addEventListener("error", missing);
  }

  #bind() {
    const { stage } = this;

    stage.addEventListener("wheel", (e) => {
      if (this.puzzling) return;
      e.preventDefault();
      this.zoomTo(this.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e);
    }, { passive: false });

    stage.addEventListener("dblclick", (e) => {
      if (this.puzzling) return;
      if (this.scale > 1.05) this.reset();
      else this.zoomTo(2.5, { clientX: e.clientX, clientY: e.clientY, animate: true });
    });

    // drag to pan (mouse, pen and touch)
    stage.addEventListener("pointerdown", (e) => {
      if (this.puzzling || this.loupeOn || this.scale === 1) return;
      this.#drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: this.x, oy: this.y };
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("is-dragging");
    });
    stage.addEventListener("pointermove", (e) => {
      const drag = this.#drag;
      if (drag?.id === e.pointerId) {
        this.x = drag.ox + (e.clientX - drag.sx);
        this.y = drag.oy + (e.clientY - drag.sy);
        this.render();
      }
      if (this.loupeOn) this.#moveLoupe(e);
    });
    const endDrag = () => { this.#drag = null; stage.classList.remove("is-dragging"); };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("pointerleave", () => this.loupe.classList.remove("is-visible"));

    for (const btn of document.querySelectorAll("[data-zoom]")) {
      btn.addEventListener("click", () => this.zoomBy(btn.dataset.zoom === "1" ? 1.4 : 1 / 1.4));
    }
    $("reset").addEventListener("click", () => this.reset());
    this.loupeBtn.addEventListener("click", () => this.setLoupe(!this.loupeOn));
    $("fullscreen").addEventListener("click", () => this.toggleFullscreen());
    document.addEventListener("fullscreenchange", () => setTimeout(() => this.render(), 50));

    // puzzle.js asks for a clean view before it takes over the stage
    document.addEventListener("puzzle:start", () => {
      this.setLoupe(false);
      this.reset(false);
    });

    const keys = {
      ArrowLeft: () => $("prev")?.click(),
      ArrowRight: () => $("next")?.click(),
      "+": () => this.zoomBy(1.4),
      "=": () => this.zoomBy(1.4),
      "-": () => this.zoomBy(1 / 1.4),
      _: () => this.zoomBy(1 / 1.4),
      0: () => this.reset(),
      l: () => this.setLoupe(!this.loupeOn),
      f: () => this.toggleFullscreen(),
    };
    document.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea") || e.metaKey || e.ctrlKey || e.altKey || this.puzzling) return;
      const action = keys[e.key] ?? keys[e.key.toLowerCase()];
      if (!action) return;
      e.preventDefault();
      action();
    });
  }
}

if ($("stage")) new PaintingViewer();
