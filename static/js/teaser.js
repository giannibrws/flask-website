// Home page: a painting with a few jigsaw pieces lifted out.
import { gridFor, loaded, makeCut, piecePath, svgEl } from "./jigsaw.js";

async function teaser(holder) {
  const img = holder.querySelector("img");
  try {
    await loaded(img);
  } catch {
    return; // no image, no teaser
  }

  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const [cols, rows] = gridFor(16, W / H);
  const pw = W / cols;
  const ph = H / rows;
  const cut = makeCut(cols, rows);
  const src = img.currentSrc || img.src;

  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "teaser", "aria-hidden": "true" });
  const lines = svgEl("g", { class: "teaser__lines" }, svg);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      svgEl("path", { d: piecePath(cut, r, c, pw, ph), transform: `translate(${c * pw} ${r * ph})` }, lines);
    }
  }

  // three pieces, spread out so the holes never touch
  const lifted = [[1, cols - 2], [rows - 1, 0], [rows - 2, cols - 1]];
  lifted.forEach(([r, c], i) => {
    const d = piecePath(cut, r, c, pw, ph);
    const at = `translate(${c * pw} ${r * ph})`;
    svgEl("path", { d, transform: at, class: "teaser__hole" }, svg);

    const piece = svgEl("g", { class: `teaser__piece teaser__piece--${i}` }, svg);
    const inner = svgEl("g", { transform: at }, piece);
    const clip = svgEl("clipPath", { id: `teaser-clip-${i}` }, inner);
    svgEl("path", { d }, clip);
    svgEl("image", {
      href: src, x: -c * pw, y: -r * ph, width: W, height: H,
      "clip-path": `url(#teaser-clip-${i})`, preserveAspectRatio: "none",
    }, inner);
    svgEl("path", { d, class: "teaser__edge" }, inner);
  });

  holder.append(svg);
  holder.classList.add("is-ready");
}

document.querySelectorAll("[data-teaser]").forEach(teaser);
