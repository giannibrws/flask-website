// Jigsaw geometry, shared by the home teaser and the puzzle game.

/** @typedef {{cols: number, rows: number, h: number[][], v: number[][]}} Cut */

/**
 * SVG path commands for one edge from p0 to p1 (the initial M is not included).
 * sign: 0 = flat border, +1 = knob sticking out, -1 = hole.
 */
export function edgePath([x0, y0], [x1, y1], sign, size) {
  if (!sign) return ` L${x1.toFixed(2)} ${y1.toFixed(2)}`;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const [nx, ny] = [uy, -ux]; // outward normal for a clockwise outline
  const P = (u, v) =>
    `${(x0 + ux * u * len + nx * v * size * sign).toFixed(2)} ${(y0 + uy * u * len + ny * v * size * sign).toFixed(2)}`;
  return ` L${P(0.36, 0)}` +
    ` C${P(0.42, 0.03)} ${P(0.3, 0.25)} ${P(0.5, 0.26)}` +
    ` C${P(0.7, 0.25)} ${P(0.58, 0.03)} ${P(0.64, 0)}` +
    ` L${P(1, 0)}`;
}

/** A random cut: for every inner edge, which way its knob points. */
export function makeCut(cols, rows) {
  const coin = () => (Math.random() < 0.5 ? 1 : -1);
  const grid = () => Array.from({ length: rows }, () => Array.from({ length: cols }, coin));
  return { cols, rows, h: grid(), v: grid() };
}

/** Outline of piece (r, c) in its own coordinates, (0,0)–(pw,ph); knobs stick out ~0.26 × the short side. */
export function piecePath(cut, r, c, pw, ph) {
  const size = Math.min(pw, ph);
  const top = r === 0 ? 0 : -cut.h[r - 1][c];
  const bottom = r === cut.rows - 1 ? 0 : cut.h[r][c];
  const left = c === 0 ? 0 : -cut.v[r][c - 1];
  const right = c === cut.cols - 1 ? 0 : cut.v[r][c];
  return "M0 0" +
    edgePath([0, 0], [pw, 0], top, size) +
    edgePath([pw, 0], [pw, ph], right, size) +
    edgePath([pw, ph], [0, ph], bottom, size) +
    edgePath([0, ph], [0, 0], left, size) + " Z";
}

/** Columns and rows for roughly `pieces` pieces on an image with this aspect ratio. */
export function gridFor(pieces, aspect) {
  const cols = Math.max(2, Math.round(Math.sqrt(pieces * aspect)));
  const rows = Math.max(2, Math.round(pieces / cols));
  return [cols, rows];
}

/** Resolves once the <img> has loaded; rejects if it fails. */
export function loaded(img) {
  if (img.complete) {
    return img.naturalWidth ? Promise.resolve(img) : Promise.reject(new Error("image failed"));
  }
  return new Promise((resolve, reject) => {
    img.addEventListener("load", () => resolve(img), { once: true });
    img.addEventListener("error", () => reject(new Error("image failed")), { once: true });
  });
}

/** Tiny helper to build SVG nodes. */
export function svgEl(name, attrs = {}, parent = null) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  parent?.append(node);
  return node;
}

export const random = (a, b) => a + Math.random() * (b - a);
