// Painting viewer: zoom, pan, loupe, fullscreen and keyboard tour navigation.
(function () {
  "use strict";

  var stage = document.getElementById("stage");
  var frame = document.getElementById("frame");
  var img = document.getElementById("painting");
  var loupe = document.getElementById("loupe");
  var loupeBtn = document.getElementById("loupe-toggle");
  var levelOut = document.getElementById("zoom-level");
  if (!stage || !frame || !img) return;

  var viewer = document.getElementById("viewer");
  var MIN = 1, MAX = 6, LOUPE_ZOOM = 3;

  // while a jigsaw puzzle is running, the viewer stays out of the way
  function puzzling() { return viewer.classList.contains("is-puzzle"); }
  var scale = 1, x = 0, y = 0;
  var loupeOn = false;

  function clampPan() {
    // keep the painting from being dragged fully out of view
    var maxX = (frame.offsetWidth * (scale - 1)) / 2 + frame.offsetWidth * 0.25;
    var maxY = (frame.offsetHeight * (scale - 1)) / 2 + frame.offsetHeight * 0.25;
    if (scale === 1) { maxX = 0; maxY = 0; }
    x = Math.max(-maxX, Math.min(maxX, x));
    y = Math.max(-maxY, Math.min(maxY, y));
  }

  function render(animate) {
    clampPan();
    frame.style.transition = animate ? "transform .25s cubic-bezier(.2,.7,.2,1)" : "none";
    frame.style.transform = "translate(" + x + "px," + y + "px) scale(" + scale + ")";
    levelOut.textContent = Math.round(scale * 100) + "%";
    stage.classList.toggle("is-zoomed", scale > 1);
  }

  // zoom toward a point (clientX/clientY), or the centre when omitted
  function zoomTo(next, cx, cy, animate) {
    next = Math.max(MIN, Math.min(MAX, next));
    var rect = stage.getBoundingClientRect();
    var px = (cx === undefined ? rect.left + rect.width / 2 : cx) - (rect.left + rect.width / 2);
    var py = (cy === undefined ? rect.top + rect.height / 2 : cy) - (rect.top + rect.height / 2);
    var ratio = next / scale;
    x = px - (px - x) * ratio;
    y = py - (py - y) * ratio;
    scale = next;
    render(animate);
  }

  function reset() { scale = 1; x = 0; y = 0; render(true); }

  // --- wheel & buttons
  stage.addEventListener("wheel", function (e) {
    if (puzzling()) return;
    e.preventDefault();
    zoomTo(scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY, false);
  }, { passive: false });

  document.querySelectorAll("[data-zoom]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      zoomTo(scale * (btn.dataset.zoom === "1" ? 1.4 : 1 / 1.4), undefined, undefined, true);
    });
  });
  document.getElementById("reset").addEventListener("click", reset);

  stage.addEventListener("dblclick", function (e) {
    if (puzzling()) return;
    if (scale > 1.05) reset(); else zoomTo(2.5, e.clientX, e.clientY, true);
  });

  // --- drag to pan (mouse, pen and touch)
  var drag = null;
  stage.addEventListener("pointerdown", function (e) {
    if (puzzling() || loupeOn || scale === 1) return;
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: x, oy: y };
    stage.setPointerCapture(e.pointerId);
    stage.classList.add("is-dragging");
  });
  stage.addEventListener("pointermove", function (e) {
    if (drag && e.pointerId === drag.id) {
      x = drag.ox + (e.clientX - drag.sx);
      y = drag.oy + (e.clientY - drag.sy);
      render(false);
    }
    if (loupeOn) moveLoupe(e);
  });
  function endDrag() { drag = null; stage.classList.remove("is-dragging"); }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  // --- loupe: a magnifying glass over the painting
  function moveLoupe(e) {
    var r = img.getBoundingClientRect();
    var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    loupe.classList.toggle("is-visible", inside);
    if (!inside) return;
    var s = stage.getBoundingClientRect();
    var size = loupe.offsetWidth;
    loupe.style.left = (e.clientX - s.left - size / 2) + "px";
    loupe.style.top = (e.clientY - s.top - size / 2) + "px";
    var bw = r.width * LOUPE_ZOOM, bh = r.height * LOUPE_ZOOM;
    loupe.style.backgroundSize = bw + "px " + bh + "px";
    loupe.style.backgroundPosition =
      (-(e.clientX - r.left) * LOUPE_ZOOM + size / 2) + "px " +
      (-(e.clientY - r.top) * LOUPE_ZOOM + size / 2) + "px";
  }
  function setLoupe(on) {
    loupeOn = on;
    loupeBtn.setAttribute("aria-pressed", String(on));
    stage.classList.toggle("has-loupe", on);
    if (on) loupe.style.backgroundImage = 'url("' + img.currentSrc + '")';
    else loupe.classList.remove("is-visible");
  }
  loupeBtn.addEventListener("click", function () { setLoupe(!loupeOn); });
  stage.addEventListener("pointerleave", function () { loupe.classList.remove("is-visible"); });

  // --- fullscreen
  var room = viewer;
  document.getElementById("fullscreen").addEventListener("click", toggleFullscreen);
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (room.requestFullscreen) room.requestFullscreen().catch(function () {});
  }
  document.addEventListener("fullscreenchange", function () { setTimeout(function () { render(false); }, 50); });

  // --- missing image (offline / blocked)
  function showMissing() {
    img.hidden = true;
    frame.querySelector(".viewer__missing").hidden = false;
    frame.classList.add("is-missing");
  }
  img.addEventListener("error", showMissing);
  if (img.complete && img.naturalWidth === 0) showMissing();
  img.addEventListener("load", function () { frame.classList.add("is-loaded"); });
  if (img.complete && img.naturalWidth > 0) frame.classList.add("is-loaded");

  // --- keyboard
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (puzzling()) return;
    var link;
    switch (e.key) {
      case "ArrowLeft": link = document.getElementById("prev"); break;
      case "ArrowRight": link = document.getElementById("next"); break;
      case "+": case "=": zoomTo(scale * 1.4, undefined, undefined, true); break;
      case "-": case "_": zoomTo(scale / 1.4, undefined, undefined, true); break;
      case "0": reset(); break;
      case "l": case "L": setLoupe(!loupeOn); break;
      case "f": case "F": toggleFullscreen(); break;
      default: return;
    }
    if (link) window.location.href = link.href;
    e.preventDefault();
  });

  // puzzle.js asks for a clean view before it takes over the stage
  document.addEventListener("puzzle:start", function () {
    setLoupe(false);
    scale = 1; x = 0; y = 0;
    render(false);
  });

  render(false);
})();
