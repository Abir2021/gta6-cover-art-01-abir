// Vice Cover Studio — wires the editor: uploads, layout/size/grade pickers,
// per-panel crop (click a panel to select it, drag to pan, zoom slider),
// caption editing, live preview and PNG export. ?shot= sets up a fixed
// scene for a screenshot instead (./shots.js).
import { drawCover, LAYOUTS, SIZES, GRADES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const captionInput = document.getElementById('caption');
const subInput = document.getElementById('subcaption');
const zoomInput = document.getElementById('zoom');
const sizeInput = document.getElementById('captionsize');
const panelLabel = document.getElementById('panellabel');

// Six panel slots; the layout decides how many are shown.
const panels = Array.from({ length: 6 }, () => ({ img: null, zoom: 1, panX: 0, panY: 0 }));
let selected = 0;
let layout = 'mosaic';
let sizeKey = 'landscape';
let grade = 'sunset';
let captionPos = 'bottom';
let dragging = false;
let dragX = 0;
let dragY = 0;

function state() {
  return {
    panels, layout, grade,
    caption: captionInput.value, sub: subInput.value,
    captionSize: Number(sizeInput.value), captionPos,
  };
}

function applySize() {
  const s = SIZES[sizeKey];
  canvas.width = s.w;
  canvas.height = s.h;
  canvas.dataset.size = `${s.w}x${s.h}`;
}

function redraw() {
  applySize();
  drawCover(canvas, state());
  const count = LAYOUTS[layout].panels;
  panelLabel.textContent = `Panel ${Math.min(selected + 1, count)} of ${count} — drag on the cover to pan, zoom below`;
  const p = panels[selected];
  zoomInput.value = String(p.zoom);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function setPanelPhoto(i, fileOrUrl) {
  const img = typeof fileOrUrl === 'string'
    ? await loadImage(fileOrUrl)
    : await loadImage(URL.createObjectURL(fileOrUrl));
  panels[i] = { img, zoom: 1, panX: 0, panY: 0 };
  selected = i;
  redraw();
}

function fillPickers() {
  const layoutBox = document.getElementById('layouts');
  Object.entries(LAYOUTS).forEach(([key, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (key === layout ? ' on' : '');
    b.textContent = def.label;
    b.addEventListener('click', () => {
      layout = key;
      layoutBox.querySelectorAll('.pick').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      selected = 0;
      redraw();
    });
    layoutBox.appendChild(b);
  });
  const sizeBox = document.getElementById('sizes');
  Object.entries(SIZES).forEach(([key, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (key === sizeKey ? ' on' : '');
    b.textContent = def.label;
    b.addEventListener('click', () => {
      sizeKey = key;
      sizeBox.querySelectorAll('.pick').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      redraw();
    });
    sizeBox.appendChild(b);
  });
  const gradeBox = document.getElementById('grades');
  Object.entries(GRADES).forEach(([key, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (key === grade ? ' on' : '');
    b.textContent = def.label;
    b.addEventListener('click', () => {
      grade = key;
      gradeBox.querySelectorAll('.pick').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      redraw();
    });
    gradeBox.appendChild(b);
  });
  const posBox = document.getElementById('positions');
  [['bottom', 'Bottom'], ['top', 'Top'], ['middle', 'Middle']].forEach(([key, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (key === captionPos ? ' on' : '');
    b.textContent = label;
    b.addEventListener('click', () => {
      captionPos = key;
      posBox.querySelectorAll('.pick').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      redraw();
    });
    posBox.appendChild(b);
  });
}

// Per-panel upload: one file input per visible panel slot, plus "one photo
// for all panels" which fills every panel with the same image.
const panelFiles = document.getElementById('panelfiles');
for (let i = 0; i < 6; i++) {
  const lab = document.createElement('label');
  lab.className = 'panelfile';
  lab.textContent = `Panel ${i + 1} photo `;
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  inp.addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (f) { await setPanelPhoto(i, f); status.textContent = `Panel ${i + 1} photo loaded.`; }
  });
  lab.appendChild(inp);
  panelFiles.appendChild(lab);
}

document.getElementById('photoall').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const img = await loadImage(URL.createObjectURL(f));
  panels.forEach((p, i) => { panels[i] = { img, zoom: 1, panX: 0, panY: 0 }; });
  redraw();
  status.textContent = 'One photo filled every panel — pick a panel to crop it differently.';
});

document.getElementById('sample').addEventListener('click', async () => {
  const img = await loadImage('samples/boulevard.jpg');
  const img2 = await loadImage('samples/pier.jpg');
  panels[0] = { img, zoom: 1.05, panX: 0, panY: 0 };
  panels[1] = { img: img2, zoom: 1.1, panX: 0, panY: 0 };
  panels[2] = { img, zoom: 1.4, panX: -0.2, panY: 0.1 };
  panels[3] = { img: img2, zoom: 1.3, panX: 0.2, panY: 0 };
  panels[4] = { img, zoom: 1.2, panX: 0, panY: -0.1 };
  panels[5] = { img: img2, zoom: 1.5, panX: 0, panY: 0.1 };
  redraw();
  status.textContent = 'Sample photos loaded — try a layout or grade, then export.';
});

captionInput.addEventListener('input', redraw);
subInput.addEventListener('input', redraw);
zoomInput.addEventListener('input', () => {
  panels[selected].zoom = Number(zoomInput.value);
  redraw();
});
sizeInput.addEventListener('input', redraw);
document.getElementById('resetpan').addEventListener('click', () => {
  panels[selected].panX = 0; panels[selected].panY = 0; panels[selected].zoom = 1;
  redraw();
});

// Click a panel to select it; drag on the canvas to pan the selected panel.
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width * canvas.width;
  const y = (e.clientY - r.top) / r.height * canvas.height;
  dragging = true; dragX = x; dragY = y;
  canvas.setPointerCapture(e.pointerId);
  // Selection by proportional guess: panels are laid out left-to-right,
  // top-to-bottom, so pick by grid position for the current layout.
  const count = LAYOUTS[layout].panels;
  let idx = 0;
  if (layout === 'split' || layout === 'strip') idx = Math.min(count - 1, Math.floor(x / canvas.width * count));
  else if (layout === 'grid') idx = (y > canvas.height / 2 ? 2 : 0) + (x > canvas.width / 2 ? 1 : 0);
  else if (layout === 'mosaic') {
    if (y < canvas.height * 0.58) idx = x > canvas.width / 2 ? 1 : 0;
    else idx = 2 + Math.min(3, Math.floor(x / canvas.width * 4));
  }
  selected = idx;
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width * canvas.width;
  const y = (e.clientY - r.top) / r.height * canvas.height;
  panels[selected].panX += (x - dragX) / canvas.width * 2;
  panels[selected].panY += (y - dragY) / canvas.height * 2;
  dragX = x; dragY = y;
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = false; });

document.getElementById('export').addEventListener('click', () => {
  const s = SIZES[sizeKey];
  canvas.toBlob((blob) => {
    if (!blob) { status.textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${s.w}x${s.h}.png`;
    a.click();
    status.textContent = `Saved vice-cover-${s.w}x${s.h}.png`;
  }, 'image/png');
});

fillPickers();
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), async (sample, text, sub, sample2) => {
    const img = await loadImage(sample);
    const img2 = sample2 ? await loadImage(sample2) : img;
    panels.forEach((p, i) => { panels[i] = { img: i % 2 ? img2 : img, zoom: 1.15, panX: 0, panY: 0 }; });
    captionInput.value = text;
    if (sub) subInput.value = sub;
    redraw();
  });
} else {
  redraw();
}
