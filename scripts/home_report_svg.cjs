/**
 * home_report_svg.cjs
 *
 * Dependency-free SVG primitives for the H.O.M.E. system module report diagrams.
 * Emits a string so the same source renders to SVG (review) and PNG (Word).
 * Auto-layout helpers (rowOf / colOf / gridOf) are preferred over hand-set
 * coordinates so boxes cannot silently overlap.
 */

const PALETTE = {
  navy: '#0F2942',
  blue: '#1E3A8A',
  blueSoft: '#EAF0FA',
  teal: '#0D9488',
  tealSoft: '#E4F5F3',
  amber: '#B45309',
  amberSoft: '#FDF3E3',
  rose: '#9F1239',
  roseSoft: '#FDECEF',
  green: '#15803D',
  greenSoft: '#E9F6EC',
  slate: '#475569',
  slateSoft: '#F1F5F9',
  line: '#C7D2DE',
  text: '#1F2937',
  muted: '#5B6B7C',
  white: '#FFFFFF',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Average character width in px for a given font size (Segoe UI / sans-serif). */
const approxWidth = (str, size) => String(str).length * size * 0.52;

/** Greedy word wrap to a target pixel width. */
function wrapText(text, maxWidth, size) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (approxWidth(candidate, size) <= maxWidth || !current) current = candidate;
    else { lines.push(current); current = w; }
  }
  if (current) lines.push(current);
  return lines;
}

class Svg {
  constructor(width, height, background = PALETTE.white) {
    this.w = width;
    this.h = height;
    this.defs = [];
    this.body = [];
    if (background) this.rect(0, 0, width, height, { fill: background, radius: 0 });
  }

  marker() {
    if (this.defs.some((d) => d.includes('id="arrow"'))) return;
    const mk = (id, color) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/></marker>`;
    this.defs.push(mk('arrow', PALETTE.slate), mk('arrowTeal', PALETTE.teal), mk('arrowNavy', PALETTE.navy));
  }

  rect(x, y, w, h, o = {}) {
    const r = o.radius === undefined ? 8 : o.radius;
    const stroke = o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.strokeWidth || 1}"` : '';
    const dash = o.dash ? ' stroke-dasharray="5 4"' : '';
    this.body.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${o.fill || 'none'}"${stroke}${dash}/>`);
    return this;
  }

  line(x1, y1, x2, y2, o = {}) {
    const dash = o.dash ? ' stroke-dasharray="6 4"' : '';
    this.body.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke || PALETTE.line}" stroke-width="${o.width || 1.5}"${dash}/>`);
    return this;
  }

  arrow(x1, y1, x2, y2, o = {}) {
    this.marker();
    const stroke = o.stroke || PALETTE.slate;
    const id = stroke === PALETTE.teal ? 'arrowTeal' : stroke === PALETTE.navy ? 'arrowNavy' : 'arrow';
    const dash = o.dash ? ' stroke-dasharray="6 4"' : '';
    this.body.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${o.width || 2}"${dash} marker-end="url(#${id})"/>`);
    return this;
  }

  path(d, o = {}) {
    this.marker();
    const stroke = o.stroke || PALETTE.slate;
    const id = stroke === PALETTE.teal ? 'arrowTeal' : stroke === PALETTE.navy ? 'arrowNavy' : 'arrow';
    const end = o.arrow === false ? '' : ` marker-end="url(#${id})"`;
    const dash = o.dash ? ' stroke-dasharray="6 4"' : '';
    this.body.push(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${o.width || 2}"${dash}${end}/>`);
    return this;
  }

  circle(cx, cy, r, o = {}) {
    const stroke = o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.strokeWidth || 1}"` : '';
    this.body.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.fill || 'none'}"${stroke}/>`);
    return this;
  }

  text(x, y, str, o = {}) {
    const size = o.size || 13;
    const family = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
    const ls = o.letterSpacing ? ` letter-spacing="${o.letterSpacing}"` : '';
    this.body.push(`<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${o.weight || 400}" fill="${o.color || PALETTE.text}" text-anchor="${o.anchor || 'start'}"${ls}>${esc(str)}</text>`);
    return this;
  }

  /** Multi-line paragraph. Returns the y after the last line. */
  para(x, y, str, o = {}) {
    const size = o.size || 12.5;
    const lineH = o.lineHeight || size * 1.42;
    wrapText(str, o.maxWidth || 220, size).forEach((ln, i) => this.text(x, y + i * lineH, ln, { ...o, size }));
    return y + wrapText(str, o.maxWidth || 220, size).length * lineH;
  }


  /** Panel with a navy title strip. Returns the inner content box. */
  panel(x, y, w, h, title, o = {}) {
    this.rect(x, y, w, h, { fill: o.fill || PALETTE.slateSoft, stroke: o.stroke || PALETTE.line, radius: 10 });
    if (title) {
      const barH = o.barHeight || 26;
      this.rect(x, y, w, barH, { fill: o.barFill || PALETTE.navy, radius: 10 });
      this.rect(x, y + barH - 9, w, 9, { fill: o.barFill || PALETTE.navy, radius: 0 });
      this.text(x + w / 2, y + barH - 8, title, { size: o.titleSize || 12.5, weight: 600, color: PALETTE.white, anchor: 'middle' });
      const pad = o.pad === undefined ? 10 : o.pad;
      return { x: x + pad, y: y + barH + pad, w: w - pad * 2, h: h - barH - pad * 2 };
    }
    const pad = o.pad === undefined ? 10 : o.pad;
    return { x: x + pad, y: y + pad, w: w - pad * 2, h: h - pad * 2 };
  }

  /** Node box: title, optional wrapped subtitle, status dot and corner badge. */
  node(x, y, w, h, title, o = {}) {
    this.rect(x, y, w, h, { fill: o.fill || PALETTE.white, stroke: o.stroke || PALETTE.line, radius: 8, strokeWidth: o.strokeWidth || 1.2 });
    if (o.accent) this.rect(x, y, 4, h, { fill: o.accent, radius: 2 });
    const padX = (o.accent ? 13 : 10);
    const ty = o.subtitle || o.center === false ? y + 18 : y + h / 2 + 4;
    this.text(x + padX, ty, title, { size: o.size || 12.5, weight: o.weight || 600, color: o.color || PALETTE.navy, anchor: o.anchor || 'start' });
    if (o.subtitle) {
      this.para(x + padX, ty + 14, o.subtitle, {
        size: o.subSize || 10.5, color: o.subColor || PALETTE.muted, maxWidth: w - padX * 2, lineHeight: (o.subSize || 10.5) * 1.34,
      });
    }
    if (o.dot) this.circle(x + w - 11, y + 11, 4, { fill: o.dot });
    if (o.badge) {
      const bw = Math.max(36, approxWidth(o.badge, 8.5) + 12);
      this.rect(x + w - bw - 7, y + h - 19, bw, 14, { fill: o.badgeFill || PALETTE.tealSoft, stroke: o.badgeStroke || PALETTE.teal, radius: 7, strokeWidth: 0.8 });
      this.text(x + w - bw / 2 - 7, y + h - 9, o.badge, { size: 8.5, weight: 700, color: o.badgeStroke || PALETTE.teal, anchor: 'middle' });
    }
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, right: x + w, bottom: y + h };
  }

  bandLabel(x, y, w, h, label, o = {}) {
    this.rect(x, y, w, h, { fill: o.fill || PALETTE.blueSoft, stroke: o.stroke || PALETTE.line, radius: 8 });
    this.text(x + w / 2, y + h / 2 + 4, label, { size: o.size || 10.5, weight: 700, color: o.color || PALETTE.blue, anchor: 'middle', letterSpacing: 0.3 });
  }

  legend(x, y, items, o = {}) {
    let cx = x;
    for (const it of items) {
      if (it.swatch === 'box') this.rect(cx, y - 1, 11, 11, { fill: it.color, stroke: it.stroke || it.color, radius: 3, strokeWidth: 0.8 });
      else this.circle(cx + 5, y + 4, 5, { fill: it.color });
      this.text(cx + 17, y + 8, it.label, { size: o.size || 10.5, color: o.color || PALETTE.muted });
      cx += 17 + approxWidth(it.label, o.size || 10.5) + (o.gap || 16);
    }
    return cx;
  }

  title(x, y, text, sub) {
    this.text(x, y, text, { size: 19, weight: 700, color: PALETTE.navy });
    this.line(x, y + 9, x + 132, y + 9, { stroke: PALETTE.teal, width: 3 });
    if (sub) { this.text(x, y + 27, sub, { size: 11.5, color: PALETTE.muted }); return y + 46; }
    return y + 28;
  }

  footnote(x, y, text) {
    this.text(x, y, text, { size: 9.5, color: PALETTE.muted });
    return this;
  }

  /** Evenly distribute n boxes across a width. */
  static rowOf(x, y, w, n, gap) {
    const bw = (w - gap * (n - 1)) / n;
    return Array.from({ length: n }, (_, i) => ({ x: x + i * (bw + gap), y, w: bw, h: 0 }));
  }

  /** Evenly distribute n boxes down a height. */
  static colOf(x, y, h, n, gap) {
    const bh = (h - gap * (n - 1)) / n;
    return Array.from({ length: n }, (_, i) => ({ x, y: y + i * (bh + gap), w: 0, h: bh }));
  }

  /** Row-major grid of cells. */
  static gridOf(x, y, w, h, cols, rows, gapX, gapY) {
    const cw = (w - gapX * (cols - 1)) / cols;
    const ch = (h - gapY * (rows - 1)) / rows;
    const cells = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) cells.push({ x: x + c * (cw + gapX), y: y + r * (ch + gapY), w: cw, h: ch, row: r, col: c });
    }
    return cells;
  }

  toString() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}">` +
      (this.defs.length ? `<defs>${this.defs.join('')}</defs>` : '') + this.body.join('') + '</svg>';
  }
}

module.exports = { Svg, PALETTE, esc, wrapText, approxWidth };

