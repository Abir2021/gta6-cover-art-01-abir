// Fixed scenes for screenshots: ?shot=editor shows the editor with a sample
// photo loaded; ?shot=cover shows the cover alone, full-bleed.
// Query params: photo (sample name), photo2 (second sample), caption, sub,
// layout, grade, size. window.__shotReady is set once painted.
export async function runShot(shot, query, load) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photo = query.get('photo') ?? 'pier';
  const photo2 = query.get('photo2') ?? 'boulevard';
  const caption = query.get('caption') ?? 'VICE CITY NIGHTS';
  const sub = query.get('sub') ?? 'Sunset City • 2026';
  const layout = query.get('layout');
  const grade = query.get('grade');
  const size = query.get('size');
  if (layout) {
    const btns = [...document.querySelectorAll('#layouts .pick')];
    const hit = btns.find((b) => b.textContent.toLowerCase().includes(layout.toLowerCase()));
    if (hit) hit.click();
  }
  if (grade) {
    const btns = [...document.querySelectorAll('#grades .pick')];
    const hit = btns.find((b) => b.textContent.toLowerCase().includes(grade.toLowerCase()));
    if (hit) hit.click();
  }
  if (size) {
    const btns = [...document.querySelectorAll('#sizes .pick')];
    const hit = btns.find((b) => b.textContent.toLowerCase().includes(size.toLowerCase()));
    if (hit) hit.click();
  }
  await load(`samples/${photo}.jpg`, caption, sub, `samples/${photo2}.jpg`);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
