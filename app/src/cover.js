// Vice Cover Studio — the cover renderer.
// A cover is a multi-panel mosaic poster: each panel holds one photo with its
// own crop (zoom + pan), thin white gutters separate the panels, a warm sunset
// or neon grade washes over everything, and a bold condensed caption sits on
// top in gradient-filled capitals with a dark outline and a hard drop shadow.
// All drawing is plain Canvas 2D, no libraries, no network, no fonts to ship:
// the lettering uses the system condensed stack (Arial Narrow / Impact).

export const LAYOUTS = {
  hero: { label: '1 Hero', panels: 1 },
  split: { label: '2 Split', panels: 2 },
  strip: { label: '3 Strip', panels: 3 },
  grid: { label: '4 Grid', panels: 4 },
  mosaic: { label: '6 Mosaic', panels: 6 },
};

export const SIZES = {
  square: { label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  portrait: { label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  landscape: { label: 'Landscape 1920 x 1080', w: 1920, h: 1080 },
};

// Grade = [top tint, bottom tint, caption gradient start, caption gradient end].
// Kept as plain constants so the screenshot renderer can use the same values.
export const GRADES = {
  sunset: {
    label: 'Sunset',
    top: [255, 110, 60, 0.10], bottom: [214, 38, 120, 0.42],
    capA: '#fff3b0', capB: '#ff7a3d', glow: 'rgba(255, 90, 40, 0.55)',
  },
  neon: {
    label: 'Neon Nights',
    top: [80, 40, 220, 0.16], bottom: [255, 45, 150, 0.45],
    capA: '#c8f6ff', capB: '#ff4fd8', glow: 'rgba(150, 60, 255, 0.60)',
  },
  teal: {
    label: 'Vice Teal',
    top: [0, 190, 190, 0.12], bottom: [10, 90, 140, 0.45],
    capA: '#eafff6', capB: '#2ee6c8', glow: 'rgba(0, 180, 170, 0.55)',
  },
  noir: {
    label: 'Mono Noir',
    top: [20, 20, 30, 0.20], bottom: [0, 0, 0, 0.50],
    capA: '#ffffff', capB: '#c9c9c9', glow: 'rgba(0, 0, 0, 0.65)',
  },
};

export const GUTTER = 6; // white gutter between panels, in cover pixels at 1080 wide
export const CAPTION_FONT = '"Arial Narrow", Impact, "Helvetica Neue", sans-serif';

/** Panel rectangles for a layout, in cover pixels. Returns one rect per panel. */
export function layoutRects(layout, w, h) {
  const g = Math.max(3, Math.round(GUTTER * (w / 1080)));
  const inset = (x, y, pw, ph) => ({ x, y, w: pw, h: ph });
  switch (layout) {
    case 'split':
      return [inset(0, 0, (w - g) / 2, h), inset((w + g) / 2, 0, (w - g) / 2, h)];
    case 'strip':
      return [0, 1, 2].map((i) => inset(i * (w + g) / 3, 0, (w - 2 * g) / 3, h));
    case 'grid': {
      const cw = (w - g) / 2, ch = (h - g) / 2;
      return [inset(0, 0, cw, ch), inset(cw + g, 0, cw, ch),
        inset(0, ch + g, cw, ch), inset(cw + g, ch + g, cw, ch)];
    }
    case 'mosaic': {
      const topH = Math.round(h * 0.58), botH = h - topH - g;
      const cw = (w - g) / 2, bw = (w - 3 * g) / 4;
      return [inset(0, 0, cw, topH), inset(cw + g, 0, cw, topH),
        inset(0, topH + g, bw, botH), inset(bw + g, topH + g, bw, botH),
        inset(2 * (bw + g), topH + g, bw, botH), inset(3 * (bw + g), topH + g, bw, botH)];
    }
    case 'hero':
    default:
      return [inset(0, 0, w, h)];
  }
}

/** Cover-fit draw of one image into a rect, with zoom and pan offsets (-1..1). */
export function drawPanelImage(ctx, img, rect, zoom, panX, panY) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(rect.w / iw, rect.h / ih) * (zoom || 1);
  const dw = iw * scale, dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + (panX || 0) * rect.w * 0.25;
  const dy = rect.y + (rect.h - dh) / 2 + (panY || 0) * rect.h * 0.25;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function rgba(c) { return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]})`; }

/** The colour grade: a vertical tint wash plus a dark vignette at the edges. */
export function applyGrade(ctx, w, h, grade) {
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, rgba(grade.top));
  wash.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
  wash.addColorStop(1, rgba(grade.bottom));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

/** Bold condensed caption with gradient fill, dark outline and drop shadow. */
export function drawCaption(ctx, w, h, caption, sub, grade, sizeScale, position) {
  const text = (caption || '').trim().toUpperCase();
  if (!text) return;
  const base = Math.min(w, h) * 0.115 * (sizeScale || 1);
  let size = base;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const font = (s) => `900 ${s}px ${CAPTION_FONT}`;
  ctx.font = font(size);
  while (ctx.measureText(text).width > w * 0.92 && size > 14) {
    size -= 2;
    ctx.font = font(size);
  }
  const y = position === 'top' ? h * 0.16
    : position === 'middle' ? h * 0.52 : h - h * 0.055;
  const grad = ctx.createLinearGradient(0, y - size, 0, y + size * 0.12);
  grad.addColorStop(0, grade.capA);
  grad.addColorStop(1, grade.capB);
  ctx.save();
  ctx.shadowColor = grade.glow;
  ctx.shadowBlur = size * 0.22;
  ctx.shadowOffsetY = size * 0.06;
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.strokeStyle = 'rgba(20, 6, 24, 0.92)';
  ctx.strokeText(text, w / 2, y);
  ctx.fillStyle = grad;
  ctx.fillText(text, w / 2, y);
  ctx.restore();
  const subText = (sub || '').trim();
  if (subText) {
    const ss = Math.max(13, size * 0.26);
    ctx.font = `700 ${ss}px ${CAPTION_FONT}`;
    ctx.textAlign = 'center';
    // Below the caption at the top/middle, above it at the bottom so it
    // never runs off the edge of the cover.
    const sy = position === 'bottom' ? y - size * 1.15 : y + ss * 1.7;
    ctx.save();
    ctx.lineWidth = Math.max(2, ss * 0.18);
    ctx.strokeStyle = 'rgba(20, 6, 24, 0.9)';
    ctx.strokeText(subText.toUpperCase(), w / 2, sy);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(subText.toUpperCase(), w / 2, sy);
    ctx.restore();
  }
}

/**
 * Draws a whole cover. `state` is:
 * { panels: [{ img, zoom, panX, panY }], layout, grade, caption, sub,
 *   captionSize, captionPos } — panels beyond the layout's count are ignored,
 * missing panels render as a dark sunset placeholder with a "+" hint.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const rects = layoutRects(state.layout || 'hero', w, h);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  rects.forEach((rect, i) => {
    const panel = (state.panels || [])[i];
    if (panel && panel.img) {
      drawPanelImage(ctx, panel.img, rect, panel.zoom, panel.panX, panel.panY);
    } else {
      const ph = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      ph.addColorStop(0, '#3a1c4d');
      ph.addColorStop(1, '#c22a6e');
      ctx.fillStyle = ph;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `700 ${Math.max(16, rect.w * 0.09)}px ${CAPTION_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('+ ADD PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    }
  });
  applyGrade(ctx, w, h, grade);
  // Thin sun strip: a bright horizon line that ties the panels together.
  const stripY = h * 0.62;
  const strip = ctx.createLinearGradient(0, 0, w, 0);
  strip.addColorStop(0, 'rgba(255, 190, 90, 0)');
  strip.addColorStop(0.5, 'rgba(255, 210, 110, 0.85)');
  strip.addColorStop(1, 'rgba(255, 190, 90, 0)');
  ctx.fillStyle = strip;
  ctx.fillRect(0, stripY, w, Math.max(2, h * 0.004));
  drawCaption(ctx, w, h, state.caption, state.sub, grade,
    state.captionSize, state.captionPos);
}
