/**
 * Fourth deck — "La gestion des carrières" (French), design "plan de métro des
 * carrières": every chapter is a subway line (green, pink, yellow, blue) with
 * its own badge; a train runs along a 4-colour line at the bottom (Morph =
 * live progress); the agenda comes back between chapters and Morph zooms the
 * next tile into a full-screen chapter; the ladder of the traditional career
 * morphs into a climbing wall; Super's stations travel into Schein's circle.
 * unDraw illustrations (free licence, undraw.co) recoloured per line.
 *
 *   npm run pptx:careers
 *   (= python tools/pptx/make_careers_assets.py && node tools/pptx/build-careers.mjs
 *      && finalize-native.ps1 -Base careers-base.pptx -Plan careers-anims.json -Output Gestion-des-carrieres.pptx -Morph 3955)
 */
import fs from 'node:fs';
import path from 'node:path';
import pptxgen from 'pptxgenjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'export');
const A = (f) => path.join(OUT, 'careers', f);
const LOGO = path.join(ROOT, 'public', 'logo-est-sale.png');
const LOGO_RATIO = 967 / 460;

const C = { ink: '1D1B3A', body: '55536E', mute: '9A98AE', cream: 'F6F4EF', white: 'FFFFFF', paper: 'ECE9E1' };
/** The four subway lines = the four chapters. */
const L = [
  { c: '17A673', t: 'DCF3E8', d: '0E7A53', art: 'green', on: C.white },
  { c: 'E9407A', t: 'FCE1EA', d: 'B8285C', art: 'pink', on: C.white },
  { c: 'F2AE00', t: 'FFF0C2', d: '9A6A00', art: 'yellow', on: C.ink },
  { c: '2F6BFF', t: 'E1E9FF', d: '1F4FCC', art: 'blue', on: C.white },
];
const GEN = { c: C.ink, t: C.paper, d: 'E9407A', art: 'pink', on: C.white }; // general slides
const lineOf = (k) => (k < 0 ? GEN : L[k]);

const HEAD = 'Bahnschrift SemiBold';
const LIGHT = 'Bahnschrift Light';
const SEMI = 'Segoe UI Semibold';
const BODY = 'Segoe UI';
const SERIF = 'Georgia';
const ICON = 'Segoe MDL2 Assets';
const ic = (hex) => String.fromCodePoint(parseInt(hex, 16));
const PRESENTERS = ['Aya Yakoubi', 'Hassna Elhaddajy'];
const SCHOOL = 'École Supérieure de Technologie de Salé';
const TOTAL = 27;

const inch = (v) => v / 144;
const pt = (v) => Math.round(v) / 2;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'La gestion des carrières';
pres.author = PRESENTERS.join(' & ');
pres.company = SCHOOL;
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };
pres.defineSlideMaster({ title: 'Metro', background: { color: C.cream }, objects: [] });
const S = pres.shapes;

/* ------------------------------------------------------------------ */
/*  Engine                                                             */
/* ------------------------------------------------------------------ */
const anims = [];
let slideNo = 0;
let cursor = 0;
const used = new Set();
const uniq = (n) => {
  if (!used.has(n)) return used.add(n), n;
  let k = 2;
  while (used.has(`${n}~${k}`)) k++;
  return used.add(`${n}~${k}`), `${n}~${k}`;
};
function enter(name, effect = 'fade', o = {}) {
  if (o.at === undefined) cursor += 0.1;
  anims.push({ slide: slideNo, shape: name, kind: 'enter', effect, dir: o.dir, dur: o.dur ?? 0.6, at: o.at ?? cursor });
}
function ambient(name, effect, o = {}) {
  anims.push({ slide: slideNo, shape: name, kind: 'ambient', effect, dur: o.dur ?? 2, by: o.by, path: o.path, delay: o.delay ?? 0, reverse: o.reverse ?? false, repeat: o.repeat, smooth: o.smooth });
}
function text(slide, value, o) {
  const name = uniq(o.name ?? `t${used.size}`);
  slide.addText(value, {
    x: inch(o.x), y: inch(o.y), w: inch(o.w), h: inch(o.h), fontSize: pt(o.size), color: o.color ?? C.ink,
    bold: o.bold ?? false, italic: o.italic ?? false, fontFace: o.font ?? BODY, align: o.align ?? 'left', valign: o.valign ?? 'top',
    margin: 0, isTextBox: true, objectName: name, charSpacing: o.charSpacing, lineSpacingMultiple: o.ls ?? 1.05, fit: 'none', rotate: o.rotate,
  });
  if (o.anim !== false) enter(name, o.anim ?? 'fade', { dir: o.dir, dur: o.dur ?? 0.5, at: o.at });
  return name;
}
function shape(slide, type, x, y, w, h, name, o = {}) {
  const n = uniq(name);
  slide.addShape(type, {
    x: inch(x), y: inch(y), w: inch(w), h: inch(h), objectName: n,
    fill: o.fill ? { color: o.fill, transparency: o.fillT ?? 0 } : { type: 'none' },
    line: o.line ? { color: o.line, width: o.lineW ?? 1.5, transparency: o.lineT ?? 0, dashType: o.dash } : { type: 'none' },
    rectRadius: o.r !== undefined ? inch(Math.max(o.r, 0.5)) : undefined, rotate: o.rotate,
    shadow: o.shadow ? { type: 'outer', color: '1D1B3A', opacity: 0.1, blur: 22, offset: 6, angle: 90 } : undefined,
  });
  if (o.anim) enter(n, o.anim, { dir: o.dir, dur: o.dur, at: o.at });
  return n;
}
function line(slide, x1, y1, x2, y2, name, o = {}) {
  const n = uniq(name);
  slide.addShape(S.LINE, {
    x: inch(Math.min(x1, x2)), y: inch(Math.min(y1, y2)), w: inch(Math.max(1, Math.abs(x2 - x1))), h: inch(Math.max(1, Math.abs(y2 - y1))),
    flipH: x2 < x1, flipV: y2 < y1, objectName: n, line: { color: o.color ?? C.ink, width: o.width ?? 3, transparency: o.t ?? 0, dashType: o.dash },
  });
  if (o.anim !== false) enter(n, o.anim ?? 'wipe', { dir: o.dir ?? (Math.abs(y2 - y1) > Math.abs(x2 - x1) ? (y2 > y1 ? 'top' : 'bottom') : x2 >= x1 ? 'left' : 'right'), dur: o.dur ?? 0.5, at: o.at });
  return n;
}
function img(slide, file, x, y, w, h, name, o = {}) {
  const n = uniq(name);
  slide.addImage({ path: file, x: inch(x), y: inch(y), w: inch(w), h: inch(h), objectName: n, altText: o.alt ?? '' });
  if (o.anim) enter(n, o.anim, { dur: o.dur, at: o.at, dir: o.dir });
  return n;
}
const RATIO = {};
/** unDraw illustration (base name + line colour), floating gently; named after its file so it morphs only into itself. */
function art(slide, base, color, x, y, w, o = {}) {
  const file = `${base}-${color}.svg`;
  if (!RATIO[file]) {
    const vb = fs.readFileSync(A(file), 'utf8').match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    RATIO[file] = vb[3] / vb[2];
  }
  const h = w * RATIO[file];
  const n = img(slide, A(file), x, y, w, h, `!!art-${base}`, { anim: o.anim ?? 'fly', dir: o.dir ?? 'bottom', at: o.at ?? 0.6, dur: o.dur ?? 0.9, alt: 'Illustration' });
  ambient(n, 'path', { dur: 3, delay: (o.at ?? 0.6) + 1, path: 'M 0 0 L 0 -0.008 E', reverse: true, smooth: true });
  return h;
}
function person(slide, color, cx, bottom, h, name, o = {}) {
  const w = (h * 120) / 170;
  return img(slide, A(`person-${color}.png`), cx - w / 2, bottom - h * 0.9, w, h, name, { alt: 'Salarié', ...o });
}
const pathOf = (pts) => `M 0 0 ${pts.slice(1).map(([x, y]) => `L ${((x - pts[0][0]) / 1920).toFixed(4)} ${((y - pts[0][1]) / 1080).toFixed(4)}`).join(' ')} E`;
function addSlide(section, notes) {
  pres.addSection({ title: section });
  const slide = pres.addSlide({ masterName: 'Metro', sectionTitle: section });
  slide.addNotes(notes);
  slideNo++;
  cursor = 0;
  used.clear();
  return slide;
}
const N = (...l) => l.join('\n');

/** The hero: one rounded shape that changes role from slide to slide (Morph). */
function hero(slide, x, y, w, h, r, fill, o = {}) {
  const n = uniq('!!hero');
  slide.addShape(S.ROUNDED_RECTANGLE, {
    x: inch(x), y: inch(y), w: inch(w), h: inch(h), objectName: n, fill: { color: fill },
    line: o.line ? { color: o.line, width: o.lineW ?? 4 } : { type: 'none' }, rectRadius: inch(Math.max(r, 0.5)),
    shadow: o.shadow === false ? undefined : { type: 'outer', color: '1D1B3A', opacity: 0.12, blur: 22, offset: 6, angle: 90 },
  });
  enter(n, o.anim ?? 'zoom', { at: o.at, dur: o.dur ?? 0.6, dir: o.dir });
  return n;
}
/** Background geometry that drifts between slides: an outline ring, a soft disc and a dot grid. */
function deco(slide, d) {
  const ring = shape(slide, S.OVAL, d.ring[0], d.ring[1], d.ring[2], d.ring[2], '!!geoA', { line: d.ring[3], lineW: 3, lineT: 40, anim: 'zoom', at: 0, dur: 0.9 });
  ambient(ring, 'spin', { dur: 40, by: 360 });
  const disc = shape(slide, S.OVAL, d.disc[0], d.disc[1], d.disc[2], d.disc[2], '!!geoB', { fill: d.disc[3], fillT: d.disc[4] ?? 0, anim: 'zoom', at: 0.1, dur: 0.9 });
  ambient(disc, 'pulse', { dur: 5, by: 104, reverse: true, smooth: true });
  img(slide, A('dots.png'), d.dots[0], d.dots[1], 238, 170, '!!dots', { anim: 'fade', at: 0.3 });
}
/** Subway badge + kicker + title (main in Bahnschrift SemiBold, accent in Bahnschrift Light). */
function header(slide, k, kicker, [main, accent], o = {}) {
  const ln = lineOf(k);
  shape(slide, S.ROUNDED_RECTANGLE, 120, 84, 54, 54, '!!badge', { fill: ln.c, r: 12, anim: 'zoom', at: 0.1, dur: 0.4 });
  text(slide, k < 0 ? 'RH' : String(k + 1), { x: 120, y: 84, w: 54, h: 54, size: k < 0 ? 22 : 32, font: HEAD, color: ln.on, align: 'center', valign: 'middle', name: '!!badge-t', anim: 'zoom', at: 0.1, dur: 0.4 });
  text(slide, kicker, { x: 192, y: 84, w: 1300, h: 54, size: 22, font: SEMI, color: C.ink, charSpacing: 4, valign: 'middle', name: '!!kicker', anim: 'fly', dir: 'left', at: 0.15, dur: 0.5 });
  text(slide, [{ text: main, options: { fontFace: HEAD, color: C.ink } }, { text: accent, options: { fontFace: LIGHT, color: ln.d } }], { x: 120, y: 152, w: 1700, h: 100, size: o.size ?? 68, name: '!!title', anim: 'ascend', at: 0.25, dur: 0.7 });
}
/** Live progress: a 4-colour subway line, chapter stops, and a train that moves on every slide. */
function metro(slide) {
  const [x0, w, y] = [120, 1500, 1030];
  L.forEach((ln, k) => shape(slide, S.ROUNDED_RECTANGLE, x0 + k * (w / 4), y - 5, w / 4, 10, `!!seg${k}`, { fill: ln.c, r: 5, anim: 'wipe', dir: 'left', at: 0.2 + k * 0.1, dur: 0.4 }));
  for (let k = 0; k <= 4; k++) shape(slide, S.OVAL, x0 + k * (w / 4) - 12, y - 12, 24, 24, `!!stop${k}`, { fill: C.white, line: C.ink, lineW: 3, anim: 'zoom', at: 0.4 + k * 0.05, dur: 0.3 });
  const tx = x0 + (w * (slideNo - 1)) / (TOTAL - 1);
  shape(slide, S.OVAL, tx - 18, y - 18, 36, 36, '!!train', { fill: C.ink, line: C.white, lineW: 4, shadow: true, anim: 'zoom', at: 0.6, dur: 0.4 });
  text(slide, String(slideNo).padStart(2, '0'), { x: 1660, y: 1006, w: 140, h: 48, size: 32, font: HEAD, color: C.ink, align: 'right', name: '!!page', anim: false });
}
/** White card with an icon disc, a title and a description. */
function card(slide, x, y, w, h, name, o) {
  const a = { anim: o.anim ?? 'zoom', dir: o.dir, at: o.at, dur: o.dur ?? 0.5 };
  shape(slide, S.ROUNDED_RECTANGLE, x, y, w, h, name, { fill: o.fill ?? C.white, r: 24, shadow: o.shadow ?? true, ...a });
  let tx = x + 32;
  if (o.icon) {
    shape(slide, S.OVAL, x + 28, y + 28, 68, 68, `${name}-ic`, { fill: o.iconBg ?? C.paper, ...a });
    text(slide, ic(o.icon), { x: x + 28, y: y + 28, w: 68, h: 68, size: 30, font: ICON, color: o.accent ?? C.ink, align: 'center', valign: 'middle', name: `${name}-ig`, ...a });
    tx = x + 116;
  }
  text(slide, o.t, { x: tx, y: y + 32, w: x + w - tx - 24, h: 44, size: o.tSize ?? 30, font: HEAD, color: o.tColor ?? C.ink, name: `${name}-t`, ...a });
  if (o.d) text(slide, o.d, { x: tx, y: y + 32 + (o.tSize ?? 30) * 1.5, w: x + w - tx - 24, h: h - 90, size: o.dSize ?? 22, color: C.body, name: `${name}-d`, ...a });
}
/** A big figure on a huge hero card (next click: Morph shrinks it). */
function spotlight(slide, k, value, caption, source, ratio) {
  const ln = lineOf(k);
  hero(slide, 310, 290, 1300, 640, 60, ln.c, { at: 0.4 });
  text(slide, value, { x: 310, y: 320, w: 1300, h: 300, size: 300, font: HEAD, color: ln.on, align: 'center', name: '!!stat', anim: 'zoom', at: 0.7, dur: 0.8 });
  text(slide, caption, { x: 360, y: 650, w: 1200, h: 100, size: 34, color: ln.on, align: 'center', name: '!!stat-t', at: 1.2 });
  text(slide, source, { x: 360, y: 760, w: 1200, h: 40, size: 24, font: SERIF, italic: true, color: ln.t, align: 'center', name: '!!stat-s', at: 1.3 });
  shape(slide, S.ROUNDED_RECTANGLE, 510, 840, 900, 24, '!!bar-track', { fill: C.white, fillT: 65, r: 12, anim: 'fade', at: 1.2 });
  shape(slide, S.ROUNDED_RECTANGLE, 510, 840, 900 * ratio, 24, '!!bar', { fill: C.ink, r: 12, anim: 'wipe', dir: 'left', at: 1.4, dur: 1.4 });
}

/* ------------------------------------------------------------------ */
/*  Agenda + chapters (Morph zoom: a tile becomes the chapter screen)   */
/* ------------------------------------------------------------------ */
const CH = [
  ['Comprendre', 'la carrière', 'Définitions, modèles, mobilités', 'road-sign'],
  ['Les modèles', 'théoriques', 'Super et Schein', 'personal-goals'],
  ['Les outils', 'RH', 'Processus, outils, acteurs', 'progress-tracking'],
  ['Défis &', 'perspectives', 'Aujourd’hui et demain', 'career-development'],
];
function agenda(next) {
  const slide = addSlide(`Sommaire · ${next + 1}`, N(
    next === 0 ? 'INTRODUIRE : voici notre itinéraire en quatre lignes, comme un plan de métro.' : 'RETOUR AU SOMMAIRE : on valide la station précédente et on prend la ligne suivante.',
    `À DIRE : « ${next === 0 ? 'Nous allons parcourir quatre lignes : comprendre la carrière, les modèles théoriques, les outils RH, puis les défis.' : `Prochaine ligne : ${CH[next][0]} ${CH[next][1]}.`} »`,
    'CLIC : la tuile s’agrandit (Morph) et devient l’écran du chapitre.',
  ));
  deco(slide, { ring: [1580, -160, 420, L[next].c], disc: [-120, 860, 300, L[next].t], dots: [1560, 120] });
  header(slide, -1, 'SOMMAIRE', ['Notre ', 'itinéraire']);
  CH.forEach(([a, b, sub], k) => {
    const x = 120 + k * 430;
    const ln = L[k];
    const done = k < next;
    const at = 0.4 + k * 0.15;
    shape(slide, S.ROUNDED_RECTANGLE, x, 290, 390, 600, `!!tile${k}`, { fill: ln.c, fillT: done ? 45 : 0, r: 36, shadow: k === next, anim: 'zoom', at, dur: 0.5 });
    text(slide, `0${k + 1}`, { x: x + 34, y: 310, w: 330, h: 170, size: 150, font: LIGHT, color: ln.on, name: `!!tile${k}-n`, anim: 'zoom', at, dur: 0.5 });
    text(slide, [{ text: a, options: { breakLine: true } }, { text: b, options: {} }], { x: x + 34, y: 510, w: 330, h: 130, size: 46, font: HEAD, color: ln.on, ls: 0.95, name: `!!tile${k}-t`, anim: 'zoom', at, dur: 0.5 });
    text(slide, sub, { x: x + 34, y: 660, w: 330, h: 80, size: 24, color: ln.on, name: `!!tile${k}-s`, anim: 'zoom', at, dur: 0.5 });
    text(slide, `LIGNE ${k + 1}  →`, { x: x + 34, y: 820, w: 330, h: 40, size: 22, font: SEMI, color: ln.on, charSpacing: 3, name: `!!tile${k}-l`, anim: 'zoom', at, dur: 0.5 });
    if (done) {
      shape(slide, S.OVAL, x + 300, 316, 62, 62, `!!tile${k}-ok`, { fill: C.white, anim: 'zoom', at: at + 0.3, dur: 0.3 });
      text(slide, ic('E73E'), { x: x + 300, y: 316, w: 62, h: 62, size: 28, font: ICON, color: ln.d, align: 'center', valign: 'middle', name: `!!tile${k}-okg`, anim: 'zoom', at: at + 0.3, dur: 0.3 });
    }
  });
  const hx = 120 + next * 430;
  const here = text(slide, [{ text: ic('E7B7'), options: { fontFace: ICON } }, { text: '  Prochaine station', options: {} }], { x: hx, y: 916, w: 390, h: 44, size: 24, font: SEMI, color: L[next].d, align: 'center', name: '!!here', anim: 'fly', dir: 'top', at: 1.2 });
  ambient(here, 'path', { dur: 0.9, path: 'M 0 0 L 0 -0.008 E', reverse: true, delay: 1.8, smooth: true });
  metro(slide);
}
function chapter(k, notes) {
  const [a, b, sub, base] = CH[k];
  const ln = L[k];
  const slide = addSlide(`Ligne ${k + 1} · ${a} ${b}`, notes);
  shape(slide, S.ROUNDED_RECTANGLE, 0, 0, 1920, 1080, `!!tile${k}`, { fill: ln.c, r: 0, anim: 'fade', at: 0 });
  shape(slide, S.OVAL, -220, 780, 520, 520, '!!geoB', { fill: C.white, fillT: 85, anim: 'zoom', at: 0.2 });
  shape(slide, S.OVAL, 1440, -300, 700, 700, '!!geoA', { line: C.white, lineW: 3, lineT: 50, anim: 'zoom', at: 0.2 });
  shape(slide, S.ROUNDED_RECTANGLE, 120, 110, 64, 64, '!!badge', { fill: C.white, r: 14, anim: 'zoom', at: 0.3, dur: 0.4 });
  text(slide, String(k + 1), { x: 120, y: 110, w: 64, h: 64, size: 36, font: HEAD, color: ln.d, align: 'center', valign: 'middle', name: '!!badge-t', anim: 'zoom', at: 0.3, dur: 0.4 });
  text(slide, `LIGNE ${k + 1}`, { x: 204, y: 110, w: 600, h: 64, size: 26, font: SEMI, color: ln.on, charSpacing: 6, valign: 'middle', name: '!!kicker', anim: 'fly', dir: 'left', at: 0.3 });
  text(slide, `0${k + 1}`, { x: 110, y: 190, w: 700, h: 300, size: 300, font: LIGHT, color: ln.t, name: `!!tile${k}-n`, anim: 'zoom', at: 0.4, dur: 0.7 });
  text(slide, [{ text: a, options: { breakLine: true } }, { text: b, options: {} }], { x: 120, y: 500, w: 1100, h: 300, size: 130, font: HEAD, color: ln.on, ls: 0.92, name: `!!tile${k}-t`, anim: 'ascend', at: 0.6, dur: 0.8 });
  text(slide, sub, { x: 130, y: 820, w: 1000, h: 70, size: 44, font: SERIF, italic: true, color: ln.on, name: `!!tile${k}-s`, at: 1.0 });
  art(slide, base, k === 2 ? 'white' : 'white', 1180, 260, 620, { at: 0.9, anim: 'fly', dir: 'right' });
}

/* ------------------------------------------------------------------ */
/*  Slides                                                             */
/* ------------------------------------------------------------------ */

/** The career subway map (4 lines with 45° bends) drawn at (ox, oy) with scale sc. */
const MAP = [
  [[0, 6], [3, 6], [5, 4], [10, 4]],
  [[2, 0], [2, 3], [5, 6], [9, 6]],
  [[0, 2], [6, 2], [8, 4], [8, 8]],
  [[4, 9], [4, 7], [7, 4], [7, 1]],
];
function subwayMap(slide, ox, oy, sc, o = {}) {
  MAP.forEach((pts, k) => {
    for (let j = 0; j < pts.length - 1; j++) {
      const [x1, y1] = pts[j];
      const [x2, y2] = pts[j + 1];
      line(slide, ox + x1 * sc, oy + y1 * sc, ox + x2 * sc, oy + y2 * sc, `!!map${k}-${j}`, { color: L[k].c, width: o.width ?? 12, t: o.t ?? 0, at: (o.at ?? 0.5) + k * 0.25 + j * 0.12, dur: 0.35 });
    }
  });
  MAP.forEach((pts, k) => pts.forEach(([x, y], j) => {
    const s = (o.station ?? 30);
    shape(slide, S.OVAL, ox + x * sc - s / 2, oy + y * sc - s / 2, s, s, `!!mst${k}-${j}`, { fill: C.white, line: C.ink, lineW: 4, lineT: o.t ?? 0, fillT: o.t ?? 0, anim: 'zoom', at: (o.at ?? 0.5) + 1.1 + k * 0.1 + j * 0.05, dur: 0.3 });
  }));
}

// 1 — Intro (everything centred; next click → title layout)
{
  const slide = addSlide('00. Intro', N(
    'INTRODUIRE : écran d’accueil pendant que le public s’installe : un plan de métro, car une carrière est un itinéraire.',
    'CLIC : le titre et le plan glissent (Morph) vers la page de titre.',
  ));
  subwayMap(slide, 480, 90, 96, { t: 78, width: 16, station: 36, at: 0.2 });
  shape(slide, S.ROUNDED_RECTANGLE, 700, 250, 54, 54, '!!badge', { fill: C.ink, r: 12, anim: 'zoom', at: 0.4, dur: 0.4 });
  text(slide, 'RH', { x: 700, y: 250, w: 54, h: 54, size: 22, font: HEAD, color: C.white, align: 'center', valign: 'middle', name: '!!badge-t', anim: 'zoom', at: 0.4, dur: 0.4 });
  text(slide, 'RESSOURCES HUMAINES', { x: 772, y: 250, w: 560, h: 54, size: 22, font: SEMI, color: C.ink, charSpacing: 4, valign: 'middle', name: '!!kicker', anim: 'fade', at: 0.4 });
  text(slide, [{ text: 'La gestion', options: { fontFace: HEAD, color: C.ink, breakLine: true } }, { text: 'des carrières', options: { fontFace: LIGHT, color: L[1].d } }], { x: 260, y: 330, w: 1400, h: 330, size: 150, ls: 0.92, align: 'center', name: '!!title', anim: 'ascend', at: 0.8, dur: 0.9 });
  hero(slide, 630, 720, 660, 76, 38, C.ink, { at: 1.4 });
  text(slide, `${PRESENTERS[0]}   ·   ${PRESENTERS[1]}`, { x: 630, y: 720, w: 660, h: 76, size: 32, font: SEMI, color: C.white, align: 'center', valign: 'middle', name: '!!names', anim: 'zoom', at: 1.4, dur: 0.6 });
  const lg = uniq('!!logo');
  slide.addImage({ path: LOGO, x: inch(960 - 45 * LOGO_RATIO), y: inch(860), w: inch(90 * LOGO_RATIO), h: inch(90), objectName: lg, altText: SCHOOL });
  enter(lg, 'fade', { at: 1.7, dur: 0.8 });
}

// 2 — Title
{
  const slide = addSlide('01. Titre', N(
    'À DIRE : Bonjour, nous sommes Aya Yakoubi et Hassna Elhaddajy. Notre sujet : la gestion des carrières, c’est-à-dire la façon dont l’entreprise et le salarié organisent ensemble l’évolution professionnelle.',
    'IMAGE : le plan de métro. Une carrière n’est plus une ligne droite : c’est un réseau de lignes, de correspondances et de stations.',
    'TRANSITION : « Pourquoi est-ce un sujet si important aujourd’hui ? »',
  ));
  subwayMap(slide, 1060, 200, 74, { t: 0, width: 14, station: 30, at: 0.4 });
  shape(slide, S.ROUNDED_RECTANGLE, 120, 250, 54, 54, '!!badge', { fill: C.ink, r: 12, anim: 'zoom', at: 0.3, dur: 0.4 });
  text(slide, 'RH', { x: 120, y: 250, w: 54, h: 54, size: 22, font: HEAD, color: C.white, align: 'center', valign: 'middle', name: '!!badge-t', anim: 'zoom', at: 0.3, dur: 0.4 });
  text(slide, 'RESSOURCES HUMAINES', { x: 192, y: 250, w: 600, h: 54, size: 22, font: SEMI, color: C.ink, charSpacing: 4, valign: 'middle', name: '!!kicker', anim: 'fade', at: 0.3 });
  text(slide, [{ text: 'La gestion', options: { fontFace: HEAD, color: C.ink, breakLine: true } }, { text: 'des carrières', options: { fontFace: LIGHT, color: L[1].d } }], { x: 120, y: 320, w: 940, h: 330, size: 140, ls: 0.92, name: '!!title', anim: 'ascend', at: 0.5, dur: 0.9 });
  text(slide, 'Accompagner les parcours professionnels, de l’embauche à la fin de carrière', { x: 120, y: 660, w: 860, h: 90, size: 30, color: C.body, name: '!!sub', at: 1.2 });
  hero(slide, 120, 780, 660, 76, 38, C.ink, { anim: 'fly', dir: 'left', at: 1.4 });
  text(slide, `${PRESENTERS[0]}   ·   ${PRESENTERS[1]}`, { x: 120, y: 780, w: 660, h: 76, size: 32, font: SEMI, color: C.white, align: 'center', valign: 'middle', name: '!!names', anim: 'fly', dir: 'left', at: 1.4, dur: 0.6 });
  const lg = uniq('!!logo');
  slide.addImage({ path: LOGO, x: inch(120), y: inch(890), w: inch(90 * LOGO_RATIO), h: inch(90), objectName: lg, altText: SCHOOL });
  enter(lg, 'fade', { at: 1.7, dur: 0.8 });
}

// 3 — Spotlight 63 %
{
  const slide = addSlide('02. Pourquoi en parler ?', N(
    'INTRODUIRE : commencer par un chiffre choc.',
    'À DIRE : selon le Pew Research Center (mars 2022), 63 % des Américains qui ont quitté leur emploi en 2021 citent le manque de perspectives d’évolution parmi les raisons de leur départ. Sans évolution, les talents partent.',
    'CLIC : le chiffre rétrécit (Morph) et laisse place aux enjeux.',
  ));
  deco(slide, { ring: [-200, 520, 520, L[1].c], disc: [1600, 60, 300, L[1].t], dots: [1600, 820] });
  header(slide, -1, 'POURQUOI EN PARLER ?', ['Évoluer… ', 'ou partir ?']);
  spotlight(slide, 1, '63 %', 'des Américains ayant quitté leur emploi en 2021 citent le manque de perspectives d’évolution', 'Pew Research Center, mars 2022', 0.63);
  metro(slide);
}

// 4 — Stakes
{
  const slide = addSlide('03. Les enjeux', N(
    'INTRODUIRE : la gestion des carrières est gagnant-gagnant.',
    'À DIRE : pour l’entreprise, elle permet d’anticiper les besoins en compétences (GPEC, aujourd’hui GEPP), de fidéliser, de préparer la relève et de développer la mobilité interne. Pour le salarié, elle permet d’évoluer, de rester employable, de donner du sens à son parcours et de concilier projet professionnel et vie personnelle.',
    'TRANSITION : « Voici notre itinéraire. »',
  ));
  deco(slide, { ring: [1500, 640, 520, L[3].c], disc: [-140, -140, 360, L[0].t], dots: [1600, 120] });
  header(slide, -1, 'LES ENJEUX', ['Un enjeu ', 'gagnant-gagnant']);
  const sticker = hero(slide, 1580, 50, 210, 210, 105, L[1].c, { line: C.white, lineW: 5, at: 0.5 });
  text(slide, '63 %', { x: 1580, y: 92, w: 210, h: 80, size: 66, font: HEAD, color: C.white, align: 'center', name: '!!stat', anim: 'zoom', at: 0.5 });
  text(slide, 'partent faute d’évolution', { x: 1600, y: 170, w: 170, h: 60, size: 17, color: C.white, align: 'center', name: '!!stat-t', anim: 'zoom', at: 0.5 });
  ambient(sticker, 'teeter', { dur: 1, delay: 1.5 });
  const COLS = [
    { x: 120, k: 0, icon: 'E821', t: 'Pour l’entreprise', items: ['Anticiper les besoins en compétences (GPEC / GEPP)', 'Fidéliser et motiver les talents', 'Préparer la relève des postes clés', 'Développer la mobilité interne'] },
    { x: 980, k: 3, icon: 'E77B', t: 'Pour le salarié', items: ['Évoluer et être reconnu', 'Développer son employabilité', 'Donner du sens à son parcours', 'Concilier projet pro et vie perso'] },
  ];
  COLS.forEach((c, i) => {
    const ln = L[c.k];
    const at = 0.6 + i * 0.4;
    shape(slide, S.ROUNDED_RECTANGLE, c.x, 300, 820, 650, `!!col${i}`, { fill: ln.t, r: 40, anim: 'fly', dir: i ? 'right' : 'left', at, dur: 0.7 });
    shape(slide, S.OVAL, c.x + 40, 336, 84, 84, `!!col${i}-ic`, { fill: ln.c, anim: 'zoom', at: at + 0.3, dur: 0.4 });
    text(slide, ic(c.icon), { x: c.x + 40, y: 336, w: 84, h: 84, size: 36, font: ICON, color: C.white, align: 'center', valign: 'middle', name: `!!col${i}-ig`, anim: 'zoom', at: at + 0.3, dur: 0.4 });
    text(slide, c.t, { x: c.x + 146, y: 346, w: 640, h: 64, size: 44, font: HEAD, color: ln.d, valign: 'middle', name: `!!col${i}-t`, anim: 'fly', dir: i ? 'right' : 'left', at: at + 0.3 });
    c.items.forEach((it, j) => {
      const y = 470 + j * 116;
      const iat = at + 0.6 + j * 0.15;
      shape(slide, S.OVAL, c.x + 48, y + 6, 44, 44, `!!col${i}-d${j}`, { fill: C.white, line: ln.c, lineW: 6, anim: 'zoom', at: iat, dur: 0.3 });
      text(slide, it, { x: c.x + 120, y, w: 660, h: 90, size: 28, font: SEMI, name: `!!col${i}-i${j}`, anim: 'fly', dir: 'bottom', at: iat, dur: 0.45 });
    });
  });
  metro(slide);
}

// 5 — Agenda → 6 — Chapter 1
agenda(0);
chapter(0, N(
  'TRANSITION VISUELLE : la tuile verte s’agrandit et remplit l’écran : ligne 1.',
  'À DIRE : « Première ligne : comprendre ce qu’est une carrière et comment elle a changé. »',
));

// 7 — Definitions
{
  const slide = addSlide('04. Définitions', N(
    'INTRODUIRE : définir la gestion des carrières.',
    'À DIRE : c’est l’ensemble des politiques et pratiques RH qui organisent et accompagnent l’évolution professionnelle des salariés, en conciliant les besoins de l’organisation et les aspirations des individus.',
    'On distingue (E. C. Hughes, 1937) la carrière objective, ce qui se voit (postes, statuts, salaires, promotions), et la carrière subjective, ce qui se vit (sens, satisfaction, réussite ressentie). L’illustration du miroir le montre bien.',
    'TRANSITION : « Longtemps, la carrière ressemblait à une échelle. »',
  ));
  deco(slide, { ring: [1560, -180, 460, L[0].c], disc: [-160, 820, 340, L[0].t], dots: [1200, 880] });
  header(slide, 0, 'COMPRENDRE LA CARRIÈRE', ['Qu’est-ce que la ', 'gestion des carrières ?']);
  hero(slide, 120, 290, 1100, 300, 36, L[0].t, { shadow: false, at: 0.4 });
  text(slide, '« Ensemble des politiques et pratiques RH qui organisent et accompagnent l’évolution professionnelle des salariés, en conciliant les besoins de l’organisation et les aspirations des individus. »', { x: 170, y: 310, w: 1000, h: 260, size: 34, font: SERIF, italic: true, valign: 'middle', name: '!!def', at: 0.7 });
  card(slide, 120, 630, 530, 300, '!!obj', { icon: 'E9F9', accent: L[0].d, iconBg: L[0].t, t: 'Carrière objective', d: 'Ce qui se voit : postes, statuts, salaires, promotions.', at: 1.3 });
  card(slide, 690, 630, 530, 300, '!!subj', { icon: 'EB51', accent: L[1].d, iconBg: L[1].t, t: 'Carrière subjective', d: 'Ce qui se vit : sens, satisfaction, réussite ressentie.', at: 1.5 });
  art(slide, 'career-growth', 'green', 1330, 270, 410, { at: 0.9 });
  metro(slide);
}

/** Left column "subway list": a vertical line with 4 stations and their texts (same names on ladder & wall slides). */
function stationList(slide, ln, items, at0) {
  shape(slide, S.ROUNDED_RECTANGLE, 152, 330, 10, 380, '!!vline', { fill: ln.c, r: 5, anim: 'wipe', dir: 'top', at: at0, dur: 0.8 });
  items.forEach(([t, d], i) => {
    const y = 312 + i * 126;
    const at = at0 + 0.2 + i * 0.2;
    shape(slide, S.OVAL, 136, y, 42, 42, `!!row${i}-s`, { fill: C.white, line: ln.c, lineW: 7, anim: 'zoom', at, dur: 0.3 });
    text(slide, t, { x: 210, y: y - 6, w: 900, h: 44, size: 32, font: HEAD, name: `!!row${i}-t`, anim: 'fly', dir: 'left', at, dur: 0.45 });
    text(slide, d, { x: 210, y: y + 40, w: 900, h: 60, size: 23, color: C.body, name: `!!row${i}-d`, anim: 'fly', dir: 'left', at: at + 0.05, dur: 0.45 });
  });
}
const RUNGS = 7;

// 8 — The ladder (traditional career)
{
  const slide = addSlide('05. L’échelle', N(
    'INTRODUIRE : le modèle traditionnel de la carrière : une échelle.',
    'À DIRE : la carrière est linéaire et ascendante, souvent dans une seule organisation ; la promotion récompense l’ancienneté et la loyauté ; en échange, le salarié obtient la sécurité de l’emploi.',
    'EXEMPLE MAROC : dans la fonction publique, la carrière progresse par avancement d’échelon et de grade (statut général de la fonction publique, dahir de 1958).',
    'CLIC : l’échelle se transforme (Morph) en mur d’escalade.',
  ));
  deco(slide, { ring: [1580, 620, 440, L[0].c], disc: [-160, -160, 380, L[0].t], dots: [1000, 120] });
  header(slide, 0, 'MODÈLES DE CARRIÈRE', ['L’échelle : ', 'la carrière traditionnelle']);
  stationList(slide, L[0], [
    ['Linéaire et ascendante', 'On monte marche après marche, poste après poste.'],
    ['Dans une même organisation', 'Souvent une seule entreprise pour toute la vie.'],
    ['Ancienneté et hiérarchie', 'La promotion récompense l’expérience et la loyauté.'],
    ['Sécurité de l’emploi', 'La stabilité en échange de la fidélité.'],
  ], 0.5);
  hero(slide, 120, 810, 1000, 150, 30, L[0].t, { shadow: false, at: 1.6 });
  text(slide, ic('E7B7'), { x: 150, y: 846, w: 80, h: 80, size: 40, font: ICON, color: L[0].d, align: 'center', valign: 'middle', name: '!!note-i', anim: 'zoom', at: 1.7 });
  text(slide, [{ text: 'Au Maroc : ', options: { fontFace: HEAD, color: L[0].d } }, { text: 'dans la fonction publique, on progresse par avancement d’échelon et de grade (statut général de 1958).', options: {} }], { x: 250, y: 830, w: 840, h: 110, size: 25, valign: 'middle', name: '!!note', at: 1.8 });
  shape(slide, S.ROUNDED_RECTANGLE, 1350, 240, 24, 760, '!!rail0', { fill: C.ink, r: 12, anim: 'wipe', dir: 'bottom', at: 0.5, dur: 0.6 });
  shape(slide, S.ROUNDED_RECTANGLE, 1626, 240, 24, 760, '!!rail1', { fill: C.ink, r: 12, anim: 'wipe', dir: 'bottom', at: 0.6, dur: 0.6 });
  for (let i = 0; i < RUNGS; i++) shape(slide, S.ROUNDED_RECTANGLE, 1350, 900 - i * 100, 300, 22, `!!rung${i}`, { fill: L[0].c, r: 11, anim: 'wipe', dir: 'left', at: 0.8 + i * 0.1, dur: 0.3 });
  const p = person(slide, 'ink', 1500, 900, 120, '!!climber', { anim: 'fade', at: 1.6 });
  ambient(p, 'path', { dur: 3.2, delay: 2.0, path: pathOf([[1500, 900], [1500, 400]]), repeat: 1, smooth: true });
  metro(slide);
}

// 9 — The climbing wall (boundaryless / protean career)
{
  const slide = addSlide('06. Le mur d’escalade', N(
    'INTRODUIRE : aujourd’hui, la carrière ressemble plutôt à un mur d’escalade : on choisit ses prises.',
    'À DIRE : la carrière « sans frontières » (Arthur et Rousseau, 1996) traverse les entreprises, les métiers et les pays. La carrière « protéenne » (Hall, 1976) est pilotée par le salarié selon ses valeurs. On bouge dans tous les sens : mouvements latéraux, pauses, reconversions. La sécurité vient des compétences : c’est l’employabilité.',
    'TRANSITION : « Concrètement, quelles mobilités existent ? »',
  ));
  deco(slide, { ring: [1560, -200, 460, L[1].c], disc: [-140, 800, 340, L[0].t], dots: [1000, 120] });
  header(slide, 0, 'MODÈLES DE CARRIÈRE', ['Le mur d’escalade : ', 'la carrière nomade']);
  stationList(slide, L[1], [
    ['Carrière sans frontières', 'Entre entreprises, métiers et pays (Arthur & Rousseau, 1996).'],
    ['Carrière protéenne', 'Le salarié la pilote selon ses valeurs (Hall, 1976).'],
    ['Dans tous les sens', 'Mouvements latéraux, pauses, reconversions.'],
    ['Employabilité', 'La sécurité vient des compétences, pas du poste.'],
  ], 0.5);
  hero(slide, 120, 810, 1000, 150, 30, L[1].t, { shadow: false, at: 1.6 });
  text(slide, ic('E82F'), { x: 150, y: 846, w: 80, h: 80, size: 40, font: ICON, color: L[1].d, align: 'center', valign: 'middle', name: '!!note-i', anim: 'zoom', at: 1.7 });
  text(slide, '« On ne grimpe plus une échelle : on choisit ses prises sur un mur. »', { x: 250, y: 830, w: 840, h: 110, size: 30, font: SERIF, italic: true, valign: 'middle', name: '!!note', at: 1.8 });
  shape(slide, S.ROUNDED_RECTANGLE, 1240, 240, 600, 760, '!!rail0', { fill: C.paper, r: 40, anim: 'fade', at: 0.4 });
  shape(slide, S.ROUNDED_RECTANGLE, 1220, 990, 640, 14, '!!rail1', { fill: C.ink, r: 7, anim: 'fade', at: 0.4 });
  const HOLDS = [[1320, 860, 92, L[2].c, 20], [1500, 790, 72, L[1].c, -15], [1690, 850, 84, L[3].c, 35], [1380, 620, 104, L[0].c, 10], [1590, 560, 78, L[2].c, -25], [1720, 400, 92, L[1].c, 15], [1430, 360, 82, L[3].c, -10]];
  HOLDS.forEach(([x, y, s, fill, rot], i) => shape(slide, S.ROUNDED_RECTANGLE, x - s / 2, y - s * 0.4, s, s * 0.8, `!!rung${i}`, { fill, r: s * 0.4, rotate: (rot + 360) % 360, anim: 'zoom', at: 0.6 + i * 0.08 }));
  const p = person(slide, 'pink', 1330, 860, 120, '!!climber', { anim: 'fade', at: 1.4 });
  ambient(p, 'path', { dur: 3.6, delay: 2.0, path: pathOf([[1330, 860], [1390, 640], [1590, 580], [1720, 420]]), repeat: 1, smooth: true });
  metro(slide);
}

// 10 — Mobilities
{
  const slide = addSlide('07. Les mobilités', N(
    'INTRODUIRE : la carrière avance par des mobilités.',
    'À DIRE : la mobilité verticale, c’est la promotion ; la mobilité horizontale, c’est changer de fonction au même niveau ; la mobilité géographique, c’est changer de site, de ville ou de pays ; enfin, la mobilité peut être interne (dans l’entreprise) ou externe (vers une autre entreprise).',
    'TRANSITION : « Retour au plan pour prendre la ligne 2. »',
  ));
  deco(slide, { ring: [1580, 640, 440, L[3].c], disc: [-160, -160, 380, L[2].t], dots: [1600, 120] });
  header(slide, 0, 'COMPRENDRE LA CARRIÈRE', ['Les ', 'mobilités professionnelles']);
  const MOB = [
    ['E74A', 'Verticale', 'Promotion : monter d’un niveau hiérarchique.', 0],
    ['E72A', 'Horizontale', 'Changer de fonction au même niveau.', 1],
    ['E7B7', 'Géographique', 'Changer de site, de ville ou de pays.', 2],
    ['E8AB', 'Interne / externe', 'Évoluer dans l’entreprise… ou en dehors.', 3],
  ];
  MOB.forEach(([icn, t, d, k], i) => {
    const x = 120 + (i % 2) * 545;
    const y = 290 + Math.floor(i / 2) * 340;
    const ln = L[k];
    const at = 0.5 + i * 0.2;
    shape(slide, S.ROUNDED_RECTANGLE, x, y, 515, 310, `!!mob${i}`, { fill: C.white, r: 30, shadow: true, anim: 'zoom', at, dur: 0.5 });
    shape(slide, S.OVAL, x + 36, y + 36, 110, 110, `!!mob${i}-c`, { fill: ln.c, anim: 'zoom', at: at + 0.15, dur: 0.4 });
    const g = text(slide, ic(icn), { x: x + 36, y: y + 36, w: 110, h: 110, size: 52, font: ICON, color: ln.on, align: 'center', valign: 'middle', name: `!!mob${i}-g`, anim: 'zoom', at: at + 0.15, dur: 0.4 });
    ambient(g, 'path', { dur: 1.2, path: i === 0 ? 'M 0 0 L 0 -0.01 E' : i === 1 ? 'M 0 0 L 0.008 0 E' : 'M 0 0 L 0 -0.006 E', reverse: true, delay: 2.4 + i * 0.2, smooth: true });
    text(slide, t, { x: x + 36, y: y + 170, w: 450, h: 50, size: 38, font: HEAD, color: ln.d, name: `!!mob${i}-t`, anim: 'zoom', at, dur: 0.5 });
    text(slide, d, { x: x + 36, y: y + 224, w: 450, h: 70, size: 23, color: C.body, name: `!!mob${i}-d`, anim: 'zoom', at, dur: 0.5 });
  });
  art(slide, 'choice', 'green', 1250, 330, 540, { at: 1.2 });
  metro(slide);
}

// 11 — Agenda → 12 — Chapter 2
agenda(1);
chapter(1, N(
  'TRANSITION VISUELLE : la tuile rose remplit l’écran : ligne 2.',
  'À DIRE : « Deuxième ligne : deux modèles théoriques classiques, ceux de Donald Super et d’Edgar Schein. »',
));

// 13 — Super's life stages
const SUPER_P = [[220, 690], [560, 560], [900, 470], [1240, 520], [1580, 650]];
{
  const slide = addSlide('08. Les stades de Super', N(
    'INTRODUIRE : Donald Super (1957) voit la carrière comme une suite de cinq stades de vie.',
    'À DIRE : la croissance (0–14 ans) : découvrir ses goûts ; l’exploration (15–24 ans) : essayer et choisir une voie ; l’établissement (25–44 ans) : s’insérer et progresser ; le maintien (45–64 ans) : consolider et transmettre ; le désengagement (65 ans et plus) : préparer la retraite.',
    'Pour les RH : chaque stade appelle un accompagnement différent (intégration, formation, mobilité, transmission, fin de carrière).',
    'CLIC : les stations se déplacent (Morph) vers le cercle des ancres de Schein.',
  ));
  deco(slide, { ring: [1600, -220, 460, L[1].c], disc: [-160, 820, 320, L[1].t], dots: [1560, 840] });
  header(slide, 1, 'LES MODÈLES THÉORIQUES', ['Les 5 stades ', 'de la carrière']);
  text(slide, 'Donald Super, 1957', { x: 120, y: 252, w: 800, h: 40, size: 26, font: SERIF, italic: true, color: L[1].d, name: '!!author', at: 0.5 });
  const STAGES = [['Croissance', '0 – 14 ans', 'Découvrir ses goûts et ses capacités'], ['Exploration', '15 – 24 ans', 'Essayer, choisir une voie'], ['Établissement', '25 – 44 ans', 'S’insérer et progresser'], ['Maintien', '45 – 64 ans', 'Consolider et transmettre'], ['Désengagement', '65 ans et +', 'Préparer la retraite']];
  for (let i = 0; i < 4; i++) line(slide, SUPER_P[i][0], SUPER_P[i][1], SUPER_P[i + 1][0], SUPER_P[i + 1][1], `!!sl${i}`, { color: L[1].c, width: 12, at: 0.6 + i * 0.35, dur: 0.4 });
  STAGES.forEach(([t, age, d], i) => {
    const [x, y] = SUPER_P[i];
    const at = 0.5 + i * 0.35;
    shape(slide, S.OVAL, x - 40, y - 40, 80, 80, `!!stn${i}`, { fill: C.white, line: L[1].c, lineW: 10, shadow: true, anim: 'zoom', at, dur: 0.4 });
    text(slide, String(i + 1), { x: x - 40, y: y - 40, w: 80, h: 80, size: 32, font: HEAD, color: L[1].d, align: 'center', valign: 'middle', name: `!!stn${i}-n`, anim: 'zoom', at, dur: 0.4 });
    text(slide, t, { x: x - 165, y: y + 56, w: 330, h: 44, size: 32, font: HEAD, align: 'center', name: `!!stg${i}-t`, anim: 'fly', dir: 'bottom', at: at + 0.15 });
    text(slide, age, { x: x - 165, y: y + 100, w: 330, h: 36, size: 26, font: LIGHT, color: L[1].d, align: 'center', name: `!!stg${i}-a`, anim: 'fly', dir: 'bottom', at: at + 0.2 });
    text(slide, d, { x: x - 165, y: y + 140, w: 330, h: 70, size: 21, color: C.body, align: 'center', name: `!!stg${i}-d`, anim: 'fly', dir: 'bottom', at: at + 0.25 });
  });
  const p = person(slide, 'pink', SUPER_P[0][0], SUPER_P[0][1] - 42, 90, '!!walker', { anim: 'fade', at: 2.4 });
  ambient(p, 'path', { dur: 4.5, delay: 2.8, path: pathOf(SUPER_P.map(([x, y]) => [x, y - 42])), repeat: 1, smooth: true });
  metro(slide);
}

// 14 — Schein's career anchors
{
  const slide = addSlide('09. Les ancres de Schein', N(
    'INTRODUIRE : Edgar Schein (1978, complété en 1990) : chacun a une « ancre de carrière », ce à quoi il ne renoncerait jamais.',
    'À DIRE : les huit ancres sont la compétence technique, le management, l’autonomie, la sécurité et la stabilité, la créativité entrepreneuriale, le service d’une cause, le défi et le style de vie.',
    'Pour les RH : connaître l’ancre d’un salarié aide à proposer la bonne évolution (un expert technique ne veut pas forcément devenir manager !).',
    'TRANSITION : « Retour au plan pour la ligne 3 : les outils RH. »',
  ));
  deco(slide, { ring: [-220, -220, 520, L[1].c], disc: [1620, 760, 340, L[1].t], dots: [1560, 120] });
  header(slide, 1, 'LES MODÈLES THÉORIQUES', ['Les 8 ancres ', 'de carrière']);
  text(slide, 'Edgar Schein, 1978 – 1990', { x: 120, y: 252, w: 800, h: 40, size: 26, font: SERIF, italic: true, color: L[1].d, name: '!!author', at: 0.5 });
  const [cx, cy, R] = [960, 645, 240];
  shape(slide, S.OVAL, cx - R, cy - R, 2 * R, 2 * R, '!!ring', { line: L[1].c, lineW: 12, anim: 'zoom', at: 0.4, dur: 0.7 });
  text(slide, '« Ce à quoi je ne renoncerais jamais dans ma carrière »', { x: cx - 190, y: cy - 100, w: 380, h: 200, size: 30, font: SERIF, italic: true, align: 'center', valign: 'middle', name: '!!center', at: 1.0 });
  const ANCHORS = ['Compétence technique', 'Management', 'Autonomie', 'Sécurité et stabilité', 'Créativité entrepreneuriale', 'Service d’une cause', 'Défi', 'Style de vie'];
  ANCHORS.forEach((t, i) => {
    const a = ((-90 + i * 45) * Math.PI) / 180;
    const [x, y] = [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
    const at = 0.6 + i * 0.15;
    shape(slide, S.OVAL, x - 40, y - 40, 80, 80, `!!stn${i}`, { fill: C.white, line: L[1].c, lineW: 10, shadow: true, anim: 'zoom', at, dur: 0.4 });
    text(slide, String(i + 1), { x: x - 40, y: y - 40, w: 80, h: 80, size: 32, font: HEAD, color: L[1].d, align: 'center', valign: 'middle', name: `!!stn${i}-n`, anim: 'zoom', at, dur: 0.4 });
    const c = Math.cos(a);
    const [lx, ly] = [cx + c * (R + 70), cy + Math.sin(a) * (R + 70)];
    const box = Math.abs(c) < 0.3
      ? { x: lx - 220, y: ly < cy ? ly - 70 : ly - 10, w: 440, align: 'center' }
      : c > 0 ? { x: lx - 10, y: ly - 24, w: 470, align: 'left' } : { x: lx - 460, y: ly - 24, w: 470, align: 'right' };
    text(slide, t, { ...box, h: 50, size: 30, font: HEAD, name: `!!anc${i}`, anim: 'fade', at: at + 0.1 });
  });
  metro(slide);
}

// 15 — Agenda → 16 — Chapter 3
agenda(2);
chapter(2, N(
  'TRANSITION VISUELLE : la tuile jaune remplit l’écran : ligne 3.',
  'À DIRE : « Troisième ligne : comment l’entreprise gère concrètement les carrières : processus, outils et acteurs. »',
));

// 17 — Process
{
  const slide = addSlide('10. Le processus', N(
    'INTRODUIRE : la gestion des carrières suit un processus en six stations.',
    'À DIRE : 1) analyser les besoins (GPEC / GEPP) ; 2) évaluer la performance et le potentiel ; 3) repérer les talents et constituer des viviers ; 4) construire les plans de développement individuels ; 5) organiser les mobilités et promotions ; 6) suivre et ajuster grâce aux entretiens réguliers.',
    'TRANSITION : « Pour chaque station, les RH ont des outils. »',
  ));
  deco(slide, { ring: [-200, 640, 480, L[2].c], disc: [1620, -120, 360, L[2].t], dots: [1600, 820] });
  header(slide, 2, 'LES OUTILS RH', ['Le processus en ', '6 stations']);
  const X = [210, 520, 830, 1140, 1450, 1730];
  const Y = 560;
  shape(slide, S.ROUNDED_RECTANGLE, X[0], Y - 6, X[5] - X[0], 12, '!!pline', { fill: L[2].c, r: 6, anim: 'wipe', dir: 'left', at: 0.5, dur: 1.6 });
  const train = shape(slide, S.ROUNDED_RECTANGLE, X[0] - 34, Y - 20, 68, 40, '!!ptrain', { fill: C.ink, line: C.white, lineW: 3, r: 20, anim: 'zoom', at: 2.2 });
  ambient(train, 'path', { dur: 4.5, delay: 2.6, path: pathOf([[X[0], Y], [X[5], Y]]), repeat: 1, smooth: true });
  const STEPS = [['E9D2', 'Analyser les besoins', 'GPEC / GEPP : quels métiers demain ?'], ['EC4A', 'Évaluer', 'Performance et potentiel'], ['E734', 'Repérer les talents', 'Viviers et hauts potentiels'], ['E81E', 'Construire les plans', 'Développement individuel'], ['E8AB', 'Organiser les mobilités', 'Promotions, mutations, passerelles'], ['E81C', 'Suivre et ajuster', 'Entretiens réguliers']];
  STEPS.forEach(([icn, t, d], i) => {
    const x = X[i];
    const at = 0.6 + i * 0.25;
    shape(slide, S.OVAL, x - 56, Y - 56, 112, 112, `!!ps${i}`, { fill: C.white, line: L[2].c, lineW: 10, shadow: true, anim: 'zoom', at, dur: 0.4 });
    text(slide, ic(icn), { x: x - 56, y: Y - 56, w: 112, h: 112, size: 42, font: ICON, color: C.ink, align: 'center', valign: 'middle', name: `!!ps${i}-i`, anim: 'zoom', at, dur: 0.4 });
    const up = i % 2 === 0;
    const ty = up ? Y - 200 : Y + 76;
    text(slide, `${i + 1}. ${t}`, { x: x - 150, y: ty, w: 300, h: 80, size: 28, font: HEAD, align: 'center', valign: up ? 'bottom' : 'top', name: `!!ps${i}-t`, anim: 'fly', dir: up ? 'top' : 'bottom', at: at + 0.1 });
    text(slide, d, { x: x - 150, y: up ? ty + 82 : ty + 42, w: 300, h: 50, size: 21, color: C.body, align: 'center', name: `!!ps${i}-d`, anim: 'fly', dir: up ? 'top' : 'bottom', at: at + 0.15 });
  });
  hero(slide, 120, 800, 1160, 150, 30, L[2].t, { shadow: false, at: 2.0 });
  text(slide, '« Un processus continu : la carrière se revoit à chaque entretien. »', { x: 160, y: 800, w: 1080, h: 150, size: 32, font: SERIF, italic: true, align: 'center', valign: 'middle', name: '!!note', at: 2.1 });
  art(slide, 'completed-steps', 'yellow', 1390, 790, 400, { at: 2.4 });
  metro(slide);
}

// 18 — Toolbox
{
  const slide = addSlide('11. La boîte à outils', N(
    'INTRODUIRE : les principaux outils de la gestion des carrières.',
    'À DIRE : l’entretien professionnel (faire le point sur le parcours et les projets) ; le bilan de compétences (analyser ses compétences, aptitudes et motivations) ; le référentiel des emplois et compétences (décrire les métiers et les passerelles entre eux) ; la people review (revue collective des talents par les managers) ; les plans de succession (préparer la relève des postes clés) ; le mentorat et le coaching (accompagner et transmettre).',
    'TRANSITION : « Un outil très utilisé en people review : la matrice 9-box. »',
  ));
  deco(slide, { ring: [1600, 680, 420, L[2].c], disc: [-150, -150, 360, L[2].t], dots: [120, 300] });
  header(slide, 2, 'LES OUTILS RH', ['La boîte ', 'à outils']);
  art(slide, 'interview', 'yellow', 100, 400, 640, { at: 0.5 });
  const TOOLS = [['E8F2', 'Entretien professionnel', 'Parcours et projets d’évolution'], ['E9F9', 'Bilan de compétences', 'Compétences, aptitudes, motivations'], ['E8F1', 'Référentiel métiers', 'Métiers et passerelles'], ['E716', 'People review', 'Revue collective des talents'], ['E8CB', 'Plans de succession', 'Préparer la relève'], ['E902', 'Mentorat & coaching', 'Accompagner et transmettre']];
  TOOLS.forEach(([icn, t, d], i) => card(slide, 790 + (i % 2) * 515, 290 + Math.floor(i / 2) * 225, 495, 205, `!!tool${i}`, { icon: icn, t, d, accent: L[2].d, iconBg: L[2].t, at: 0.7 + i * 0.15, tSize: 28 }));
  metro(slide);
}

// 19 — 9-box
{
  const slide = addSlide('12. La matrice 9-box', N(
    'INTRODUIRE : la matrice 9-box croise deux axes : la performance actuelle et le potentiel d’évolution.',
    'À DIRE : en haut à droite, les talents clés (forte performance, fort potentiel) ; en bas à gauche, les situations à risque. Chaque case appelle une action : promotion, formation, accompagnement, mobilité…',
    'ATTENTION : c’est une photo à un moment donné, pas une étiquette définitive.',
    'TRANSITION : « Mais qui pilote la carrière ? »',
  ));
  deco(slide, { ring: [-220, 700, 440, L[2].c], disc: [1640, -140, 340, L[2].t], dots: [1600, 860] });
  header(slide, 2, 'LES OUTILS RH', ['La matrice ', '9-box']);
  const NAMES = [['À risque', 'Contributeur', 'Expert'], ['À accompagner', 'Pilier', 'Performant confirmé'], ['Diamant brut', 'Talent émergent', 'Talent clé']];
  const FILLS = ['FFF8E1', 'FFF0C2', 'FFE08A', 'FFCF4D'];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const x = 430 + c * 310;
      const y = 300 + (2 - r) * 190;
      const at = 0.5 + (r + c) * 0.15;
      if (r === 2 && c === 2) {
        hero(slide, x, y, 300, 180, 24, L[2].c, { at: at + 0.3 });
        const st = text(slide, ic('E734'), { x: x + 236, y: y + 14, w: 50, h: 50, size: 30, font: ICON, color: C.ink, align: 'center', name: '!!g-star', anim: 'zoom', at: at + 0.5 });
        ambient(st, 'spin', { dur: 6, by: 360, delay: at + 1 });
      } else shape(slide, S.ROUNDED_RECTANGLE, x, y, 300, 180, `!!g${r}${c}`, { fill: FILLS[r + c], r: 24, anim: 'zoom', at, dur: 0.4 });
      text(slide, NAMES[r][c], { x: x + 16, y, w: 268, h: 180, size: 27, font: HEAD, align: 'center', valign: 'middle', name: `!!g${r}${c}-t`, anim: 'zoom', at: r === 2 && c === 2 ? at + 0.3 : at, dur: 0.4 });
    }
  }
  line(slide, 430, 896, 1340, 896, '!!ax-x', { color: C.ink, width: 3, at: 0.4 });
  text(slide, 'PERFORMANCE  →', { x: 430, y: 910, w: 910, h: 36, size: 22, font: SEMI, align: 'center', charSpacing: 3, name: '!!ax-xt', at: 0.5 });
  line(slide, 404, 870, 404, 300, '!!ax-y', { color: C.ink, width: 3, at: 0.4 });
  text(slide, 'POTENTIEL', { x: 196, y: 567, w: 340, h: 36, size: 22, font: SEMI, align: 'center', charSpacing: 3, rotate: 270, name: '!!ax-yt', at: 0.5 });
  card(slide, 1390, 300, 410, 570, '!!pr', { t: 'People review', tSize: 34, at: 1.6, anim: 'fly', dir: 'right', d: '• Croise la performance actuelle et le potentiel d’évolution.\n\n• Aide à repérer les talents et à bâtir les plans de développement.\n\n• À manier avec prudence : une photo, pas une étiquette.', dSize: 23 });
  metro(slide);
}

// 20 — Actors
{
  const slide = addSlide('13. Les acteurs', N(
    'INTRODUIRE : la carrière est pilotée par quatre acteurs.',
    'À DIRE : le salarié est le premier acteur de sa carrière : il construit son projet et se forme. Le manager évalue, conseille et repère les potentiels au quotidien. Les RH fournissent les outils, organisent les mobilités et veillent à l’équité. La direction fixe la stratégie et les besoins futurs en compétences.',
    'TRANSITION : « Retour au plan pour la dernière ligne : les défis. »',
  ));
  deco(slide, { ring: [1600, -200, 440, L[2].c], disc: [-150, 820, 320, L[3].t], dots: [120, 860] });
  header(slide, 2, 'LES OUTILS RH', ['Qui pilote ', 'la carrière ?']);
  L.forEach((ln, k) => line(slide, 315 + k * 430 - (k ? 430 : 195), 420, 315 + k * 430, 420, `!!al${k}`, { color: ln.c, width: 12, at: 0.4 + k * 0.25, dur: 0.35 }));
  const ACT = [['E77B', 'Le salarié', 'Premier acteur : il construit son projet et se forme.'], ['E716', 'Le manager', 'Évalue, conseille et repère les potentiels.'], ['E821', 'Les RH', 'Outils, mobilités, équité entre tous.'], ['E8AD', 'La direction', 'Stratégie et besoins futurs en compétences.']];
  ACT.forEach(([icn, t, d], k) => {
    const x = 120 + k * 430;
    const ln = L[k];
    const at = 0.6 + k * 0.25;
    shape(slide, S.OVAL, x + 135, 360, 120, 120, `!!act${k}-c`, { fill: ln.c, line: C.white, lineW: 6, shadow: true, anim: 'zoom', at, dur: 0.4 });
    text(slide, ic(icn), { x: x + 135, y: 360, w: 120, h: 120, size: 50, font: ICON, color: ln.on, align: 'center', valign: 'middle', name: `!!act${k}-g`, anim: 'zoom', at, dur: 0.4 });
    shape(slide, S.ROUNDED_RECTANGLE, x, 520, 390, 380, `!!act${k}`, { fill: C.white, r: 30, shadow: true, anim: 'fly', dir: 'bottom', at: at + 0.1, dur: 0.5 });
    text(slide, t, { x: x + 30, y: 560, w: 330, h: 56, size: 40, font: HEAD, color: ln.d, align: 'center', name: `!!act${k}-t`, anim: 'fly', dir: 'bottom', at: at + 0.1, dur: 0.5 });
    text(slide, d, { x: x + 30, y: 640, w: 330, h: 200, size: 25, color: C.body, align: 'center', name: `!!act${k}-d`, anim: 'fly', dir: 'bottom', at: at + 0.1, dur: 0.5 });
  });
  metro(slide);
}

// 21 — Agenda → 22 — Chapter 4
agenda(3);
chapter(3, N(
  'TRANSITION VISUELLE : la tuile bleue remplit l’écran : ligne 4, la dernière.',
  'À DIRE : « Dernière ligne : les défis et les perspectives de la gestion des carrières. »',
));

// 23 — Spotlight 94 %
{
  const slide = addSlide('14. Le chiffre clé', N(
    'INTRODUIRE : un chiffre qui montre l’intérêt pour l’entreprise.',
    'À DIRE : selon LinkedIn (Workplace Learning Report 2018), 94 % des salariés resteraient plus longtemps dans une entreprise qui investit dans le développement de leur carrière.',
    'CLIC : le chiffre rétrécit (Morph) et laisse place aux défis.',
  ));
  deco(slide, { ring: [-200, 560, 520, L[3].c], disc: [1600, 60, 300, L[3].t], dots: [1600, 820] });
  header(slide, 3, 'DÉFIS & PERSPECTIVES', ['Investir dans les carrières, ', 'ça fidélise']);
  spotlight(slide, 3, '94 %', 'des salariés resteraient plus longtemps dans une entreprise qui investit dans le développement de leur carrière', 'LinkedIn, Workplace Learning Report 2018', 0.94);
  metro(slide);
}

// 24 — Challenges
{
  const slide = addSlide('15. Les défis', N(
    'INTRODUIRE : cinq défis pour la gestion des carrières aujourd’hui.',
    'À DIRE : le plafonnement de carrière (les organisations sont plus plates, il y a moins de postes pour monter) ; les fins de carrière (valoriser les seniors, organiser la transmission) ; les nouvelles générations (quête de sens, de flexibilité, d’évolution rapide) ; l’égalité des chances (femmes, diversité, « plafond de verre ») ; les carrières hybrides (télétravail, reconversions, parcours non linéaires).',
    'TRANSITION : « Que retenir ? »',
  ));
  deco(slide, { ring: [1640, 700, 400, L[3].c], disc: [-160, -160, 360, L[3].t], dots: [120, 300] });
  header(slide, 3, 'DÉFIS & PERSPECTIVES', ['Les défis ', 'd’aujourd’hui']);
  const sticker = hero(slide, 1590, 50, 210, 210, 105, L[3].c, { line: C.white, lineW: 5, at: 0.4 });
  text(slide, '94 %', { x: 1590, y: 92, w: 210, h: 80, size: 66, font: HEAD, color: C.white, align: 'center', name: '!!stat', anim: 'zoom', at: 0.4 });
  text(slide, 'restent si on les fait évoluer', { x: 1610, y: 170, w: 170, h: 60, size: 17, color: C.white, align: 'center', name: '!!stat-t', anim: 'zoom', at: 0.4 });
  ambient(sticker, 'teeter', { dur: 1, delay: 1.4 });
  art(slide, 'decide', 'blue', 100, 420, 640, { at: 0.5 });
  const DEF = [['E8C9', 'Plafonnement de carrière', 'Organisations plus plates : moins de postes pour monter.'], ['E81C', 'Fins de carrière', 'Valoriser les seniors et organiser la transmission.'], ['E8E1', 'Nouvelles générations', 'Quête de sens, de flexibilité et d’évolution rapide.'], ['E716', 'Égalité des chances', 'Femmes, diversité : briser le « plafond de verre ».'], ['E770', 'Carrières hybrides', 'Télétravail, reconversions, parcours non linéaires.']];
  DEF.forEach(([icn, t, d], i) => card(slide, 790, 290 + i * 138, 760, 124, `!!def${i}`, { icon: icn, t, d, accent: L[i % 4].d, iconBg: L[i % 4].t, tSize: 27, dSize: 21, at: 0.7 + i * 0.15, anim: 'fly', dir: 'right' }));
  metro(slide);
}

// 25 — Conclusion
{
  const slide = addSlide('16. Conclusion', N(
    'INTRODUIRE : une carrière se co-construit.',
    'À DIRE : le salarié pilote son projet ; l’entreprise l’accompagne avec des outils, des mobilités et de l’équité ; ensemble, ils construisent des parcours qui servent les deux. La carrière n’est plus une échelle : c’est un itinéraire, avec ses lignes, ses correspondances et ses stations.',
    'TRANSITION : « Voici nos sources. »',
  ));
  deco(slide, { ring: [1580, -200, 460, L[3].c], disc: [-160, 820, 340, L[0].t], dots: [1200, 120] });
  header(slide, 3, 'CONCLUSION', ['Une carrière, ça se ', 'co-construit']);
  art(slide, 'by-the-road', 'blue', 1290, 330, 520, { at: 0.5 });
  const P = [['Le salarié pilote', 'son projet, ses choix, sa formation'], ['L’entreprise accompagne', 'outils, mobilités, équité'], ['Ensemble, on avance', 'des parcours qui servent les deux']];
  P.forEach(([t, d], i) => {
    const y = 300 + i * 160;
    const at = 0.6 + i * 0.3;
    text(slide, `0${i + 1}`, { x: 120, y: y - 10, w: 160, h: 130, size: 110, font: LIGHT, color: L[i].d, name: `!!cc-n${i}`, anim: 'zoom', at });
    text(slide, t, { x: 300, y: y + 4, w: 900, h: 64, size: 52, font: HEAD, name: `!!cc-t${i}`, anim: 'fly', dir: 'left', at: at + 0.1 });
    text(slide, d, { x: 300, y: y + 72, w: 900, h: 44, size: 28, color: C.body, name: `!!cc-d${i}`, anim: 'fly', dir: 'left', at: at + 0.15 });
  });
  hero(slide, 120, 820, 1160, 140, 36, C.ink, { anim: 'fly', dir: 'bottom', at: 1.8 });
  text(slide, '« La carrière n’est plus une échelle : c’est un itinéraire. »', { x: 160, y: 820, w: 1080, h: 140, size: 36, font: SERIF, italic: true, color: C.white, align: 'center', valign: 'middle', name: '!!quote', anim: 'fly', dir: 'bottom', at: 1.8, dur: 0.6 });
  metro(slide);
}

// 26 — References
{
  const slide = addSlide('17. Références', N(
    'INTRODUIRE : nos sources.',
    'À DIRE : les modèles théoriques viennent des travaux classiques de Hughes, Super, Hall, Schein, Arthur et Rousseau ; les chiffres viennent du Pew Research Center (2022) et de LinkedIn (2018) ; l’exemple marocain du statut général de la fonction publique de 1958. Les illustrations viennent de unDraw, une banque d’illustrations libres.',
    'TRANSITION : « Merci pour votre attention. »',
  ));
  deco(slide, { ring: [1600, 680, 420, L[1].c], disc: [1640, -120, 320, L[2].t], dots: [1560, 120] });
  header(slide, -1, 'SOURCES', ['Nos ', 'références']);
  hero(slide, 100, 280, 1210, 700, 40, C.paper, { shadow: false, at: 0.3 });
  art(slide, 'hiring', 'pink', 1380, 400, 420, { at: 0.6 });
  const REFS = [
    ['Hughes, E. C. (1937). ', '« Institutional Office and the Person »', '. American Journal of Sociology, 43(3), 404-413.'],
    ['Super, D. E. (1957). ', 'The Psychology of Careers', '. New York : Harper & Row.'],
    ['Hall, D. T. (1976). ', 'Careers in Organizations', '. Pacific Palisades : Goodyear.'],
    ['Schein, E. H. (1978). ', 'Career Dynamics', '. Reading (MA) : Addison-Wesley.'],
    ['Arthur, M. B. & Rousseau, D. M. (1996). ', 'The Boundaryless Career', '. New York : Oxford University Press.'],
    ['Parker, K. & Horowitz, J. M. (2022). ', 'Majority of workers who quit a job in 2021 cite low pay, no opportunities for advancement…', ' Pew Research Center.'],
    ['LinkedIn Learning (2018). ', '2018 Workplace Learning Report', '. LinkedIn.'],
    ['Royaume du Maroc. ', 'Dahir n° 1-58-008 du 24 février 1958', ' portant statut général de la fonction publique.'],
    ['Illustrations : unDraw (undraw.co). ', 'Licence libre', ', recolorées pour cette présentation.'],
  ];
  REFS.forEach(([a, b, c], i) => {
    const y = 300 + i * 74;
    const at = 0.5 + i * 0.12;
    text(slide, `0${i + 1}`, { x: 130, y: y - 6, w: 80, h: 50, size: 38, font: LIGHT, color: L[i % 4].d, name: `!!ref${i}-n`, anim: 'zoom', at, dur: 0.4 });
    text(slide, [{ text: a, options: { fontFace: SEMI } }, { text: b, options: { fontFace: SERIF, italic: true } }, { text: c, options: {} }], { x: 220, y, w: 1060, h: 70, size: 21, color: C.ink, name: `!!ref${i}`, anim: 'fly', dir: 'left', at, dur: 0.45 });
  });
  metro(slide);
}

// 27 — Thanks
{
  const slide = addSlide('18. Merci', N(
    'INTRODUIRE : remercier et ouvrir les échanges.',
    'Pistes : vaut-il mieux une carrière « échelle » ou « mur d’escalade » ? Le salarié doit-il être seul responsable de sa carrière ? Comment gérer les carrières dans une petite entreprise marocaine ? Comment éviter le plafond de verre ?',
  ));
  subwayMap(slide, 1100, 280, 64, { t: 70, width: 12, station: 26, at: 0.2 });
  art(slide, 'hr-presentation', 'blue', 1000, 360, 800, { at: 0.6 });
  text(slide, [{ text: 'Merci', options: { fontFace: HEAD, color: C.ink } }, { text: ' !', options: { fontFace: HEAD, color: L[1].c } }], { x: 120, y: 230, w: 860, h: 210, size: 210, name: '!!title', anim: 'ascend', at: 0.4, dur: 0.8 });
  text(slide, 'pour votre attention', { x: 130, y: 450, w: 860, h: 90, size: 72, font: LIGHT, color: L[3].d, name: '!!sub', at: 0.9 });
  hero(slide, 130, 590, 440, 70, 35, L[1].c, { at: 1.2 });
  text(slide, 'Questions & échanges', { x: 130, y: 590, w: 440, h: 70, size: 30, font: SEMI, color: C.white, align: 'center', valign: 'middle', name: '!!q', anim: 'zoom', at: 1.2, dur: 0.5 });
  text(slide, `${PRESENTERS[0]}   ·   ${PRESENTERS[1]}`, { x: 130, y: 710, w: 860, h: 50, size: 34, font: SEMI, name: '!!names', anim: 'fly', dir: 'left', at: 1.4 });
  text(slide, SCHOOL, { x: 130, y: 764, w: 860, h: 40, size: 24, color: C.body, name: '!!school', at: 1.5 });
  const lg = uniq('!!logo');
  slide.addImage({ path: LOGO, x: inch(130), y: inch(850), w: inch(90 * LOGO_RATIO), h: inch(90), objectName: lg, altText: SCHOOL });
  enter(lg, 'fade', { at: 1.6, dur: 0.8 });
}

const deckPath = path.join(OUT, process.env.DECK_NAME ?? 'careers-base.pptx');
await pres.writeFile({ fileName: deckPath });
fs.writeFileSync(path.join(OUT, 'careers-anims.json'), JSON.stringify(anims, null, 1));
console.log(`careers deck: ${deckPath} (${slideNo} slides, ${anims.length} animations planned)`);
