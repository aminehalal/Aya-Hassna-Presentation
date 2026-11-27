/**
 * Third deck — "Upskilling & Reskilling" (French), creative template style:
 * warm cream background, organic lilac/peach blobs that flow from slide to
 * slide (Morph), doodles (dot grid, sparkles, squiggle), flat illustrations
 * from unDraw (free licence, undraw.co) recoloured to the palette, and
 * editorial titles mixing a heavy sans (Segoe UI Black) with a serif italic
 * accent (Georgia). Violet = upskilling, orange = reskilling.
 *
 *   npm run pptx:skills
 *   (= python tools/pptx/make_skills_assets.py && node tools/pptx/build-skills.mjs
 *      && finalize-native.ps1 -Base skills-base.pptx -Plan skills-anims.json -Output Upskilling-Reskilling-CLAIR.pptx)
 */
import fs from 'node:fs';
import path from 'node:path';
import pptxgen from 'pptxgenjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'export');
const A = (f) => path.join(OUT, 'skills', f);
const LOGO = path.join(ROOT, 'public', 'logo-est-sale.png');
const LOGO_RATIO = 967 / 460;

const C = {
  ink: '2B2A4A', body: '5B5A72', mute: '9A98B0',
  violet: '6C63FF', violetD: '4B44CC', lilac: 'EEEBFF', lilac2: 'DCD8FF',
  orange: 'FF8A5B', orangeD: 'E5683A', peach: 'FFEDE4',
  white: 'FFFFFF', cream: 'FBF8F4',
};
const BLACK = 'Segoe UI Black';
const SEMI = 'Segoe UI Semibold';
const BODY = 'Segoe UI';
const SERIF = 'Georgia';
const ICON = 'Segoe MDL2 Assets';
const ic = (hex) => String.fromCodePoint(parseInt(hex, 16));
const PRESENTERS = ['Aya Yakoubi', 'Hassna Elhaddajy'];
const SCHOOL = 'École Supérieure de Technologie de Salé';
const TOTAL = 18;

const inch = (v) => v / 144;
const pt = (v) => Math.round(v) / 2;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'Upskilling & Reskilling — développer les compétences';
pres.author = PRESENTERS.join(' & ');
pres.company = SCHOOL;
pres.theme = { headFontFace: BLACK, bodyFontFace: BODY };
pres.defineSlideMaster({ title: 'Skills', background: { color: C.cream }, objects: [] });
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
/** value: string, or runs [{text, options}] ; o.font / o.italic / o.color … */
function text(slide, value, o) {
  const name = uniq(o.name ?? `t${used.size}`);
  slide.addText(value, {
    x: inch(o.x), y: inch(o.y), w: inch(o.w), h: inch(o.h), fontSize: pt(o.size), color: o.color ?? C.ink,
    bold: o.bold ?? false, italic: o.italic ?? false, fontFace: o.font ?? BODY, align: o.align ?? 'left', valign: o.valign ?? 'top',
    margin: 0, isTextBox: true, objectName: name, charSpacing: o.charSpacing, lineSpacingMultiple: o.ls ?? 1.05, fit: 'none',
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
    rectRadius: o.radius, rotate: o.rotate, angleRange: o.angleRange, arcThicknessRatio: o.arc,
    shadow: o.shadow ? { type: 'outer', color: '3B3480', opacity: 0.1, blur: 22, offset: 6, angle: 90 } : undefined,
  });
  if (o.anim) enter(n, o.anim, { dir: o.dir, dur: o.dur, at: o.at });
  return n;
}
function line(slide, x1, y1, x2, y2, name, o = {}) {
  const n = uniq(name);
  slide.addShape(S.LINE, {
    x: inch(Math.min(x1, x2)), y: inch(Math.min(y1, y2)), w: inch(Math.max(1, Math.abs(x2 - x1))), h: inch(Math.max(1, Math.abs(y2 - y1))),
    flipH: x2 < x1, flipV: y2 < y1, objectName: n, line: { color: o.color ?? C.violet, width: o.width ?? 2, transparency: o.t ?? 0, dashType: o.dash },
  });
  if (o.anim !== false) enter(n, o.anim ?? 'wipe', { dir: o.dir ?? (x2 >= x1 ? 'left' : 'right'), dur: o.dur ?? 0.5, at: o.at });
  return n;
}
function img(slide, file, x, y, w, h, name, o = {}) {
  const n = uniq(name);
  slide.addImage({ path: file, x: inch(x), y: inch(y), w: inch(w), h: inch(h), objectName: n, altText: o.alt ?? '' });
  if (o.anim) enter(n, o.anim, { dur: o.dur, at: o.at, dir: o.dir });
  return n;
}
const RATIO = {};
/** unDraw illustration by width (height from its viewBox), floating gently. */
function art(slide, file, x, y, w, name, o = {}) {
  if (!RATIO[file]) {
    const vb = fs.readFileSync(A(file), 'utf8').match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    RATIO[file] = vb[3] / vb[2];
  }
  const h = w * RATIO[file];
  void name;
  const n = img(slide, A(file), x, y, w, h, `!!art-${file.replace(/(-orange|-white)?\.svg$/, '')}`, { anim: o.anim ?? 'fly', dir: o.dir ?? 'bottom', at: o.at ?? 0.6, dur: o.dur ?? 0.9, alt: o.alt ?? 'Illustration' });
  if (o.float !== false) ambient(n, 'path', { dur: 3, delay: (o.at ?? 0.6) + 1, path: 'M 0 0 L 0 -0.008 E', reverse: true, smooth: true });
  return h;
}
function person(slide, color, cx, bottom, h, name, o = {}) {
  const w = (h * 120) / 170;
  return img(slide, A(`person-${color}.png`), cx - w / 2, bottom - h * 0.9, w, h, name, { alt: 'Salarié', ...o });
}
const pathOf = (pts) => `M 0 0 ${pts.slice(1).map(([x, y]) => `L ${((x - pts[0][0]) / 1920).toFixed(4)} ${((y - pts[0][1]) / 1080).toFixed(4)}`).join(' ')} E`;
function addSlide(section, notes) {
  pres.addSection({ title: section });
  const slide = pres.addSlide({ masterName: 'Skills', sectionTitle: section });
  slide.addNotes(notes);
  slideNo++;
  cursor = 0;
  used.clear();
  return slide;
}
const N = (...l) => l.join('\n');

/**
 * Background decoration: two organic blobs + dot grid + two sparkles + a
 * squiggle. Same names on every slide, so Morph makes them drift and morph.
 */
function deco(slide, d) {
  const b1 = img(slide, A('blob-lilac.png'), ...d.a, '!!blobA', { anim: 'zoom', at: 0, dur: 1 });
  ambient(b1, 'pulse', { dur: 5, by: 103, reverse: true, smooth: true });
  const b2 = img(slide, A('blob-peach.png'), ...d.b, '!!blobB', { anim: 'zoom', at: 0.1, dur: 1 });
  ambient(b2, 'pulse', { dur: 6, by: 104, reverse: true, delay: 0.5, smooth: true });
  img(slide, A('dots.png'), d.dots[0], d.dots[1], 238, 170, '!!dots', { anim: 'fade', at: 0.3 });
  d.sparks.forEach(([x, y, s], i) => {
    const sp = img(slide, A(i ? 'spark-violet.png' : 'spark-orange.png'), x, y, s, s, `!!spark${i}`, { anim: 'zoom', at: 0.8 + i * 0.2 });
    ambient(sp, 'spin', { dur: 9 + i * 3, by: i ? -360 : 360 });
  });
  if (d.squig) img(slide, A('squiggle.png'), d.squig[0], d.squig[1], 260, 60, '!!squig', { anim: 'wipe', dir: 'left', at: 0.5, dur: 0.8 });
}
/** Pill kicker + editorial title: heavy sans with a serif-italic accent. */
function header(slide, kicker, parts, accent = C.violet) {
  const w = kicker.length * 18 + 70;
  shape(slide, S.ROUNDED_RECTANGLE, 120, 86, w, 48, '!!pill', { line: accent, lineW: 2, radius: 0.5, anim: 'zoom', at: 0.1, dur: 0.4 });
  text(slide, kicker, { x: 120, y: 86, w, h: 48, size: 22, font: SEMI, color: accent, align: 'center', valign: 'middle', charSpacing: 3, name: '!!pill-t', anim: 'zoom', at: 0.1, dur: 0.4 });
  const runs = parts.map((p, i) => ({ text: p, options: i % 2 ? { fontFace: SERIF, italic: true, color: accent } : { fontFace: BLACK, color: C.ink } }));
  text(slide, runs, { x: 120, y: 150, w: 1680, h: 100, size: 66, name: '!!title', anim: 'ascend', at: 0.25, dur: 0.7 });
}
/**
 * The "hero": ONE rounded shape named !!hero on every slide. Morph stretches,
 * recolours and moves it from role to role (names bar → stat card → VS circle →
 * full-screen chapter → sticker → …), which gives the deck its continuity.
 */
function hero(slide, x, y, w, h, r, fill, o = {}) {
  const n = uniq('!!hero');
  slide.addShape(S.ROUNDED_RECTANGLE, {
    x: inch(x), y: inch(y), w: inch(w), h: inch(h), objectName: n, fill: { color: fill },
    line: o.line ? { color: o.line, width: o.lineW ?? 4 } : { type: 'none' }, rectRadius: inch(Math.max(r, 0.5)),
    shadow: o.shadow === false ? undefined : { type: 'outer', color: '3B3480', opacity: 0.12, blur: 22, offset: 6, angle: 90 },
  });
  enter(n, o.anim ?? 'zoom', { at: o.at, dur: o.dur ?? 0.6, dir: o.dir });
  return n;
}
/** Full-screen chapter slide: the hero fills the screen, big number + title + white illustration. */
function chapter(section, notes, o) {
  const slide = addSlide(section, notes);
  hero(slide, 0, 0, 1920, 1080, 0, o.color, { shadow: false, anim: 'fade' });
  deco(slide, o.deco);
  text(slide, o.num, { x: 110, y: 170, w: 600, h: 300, size: 320, font: SERIF, italic: true, color: o.numColor, name: '!!ch-num', anim: 'zoom', at: 0.4, dur: 0.7 });
  text(slide, o.title, { x: 120, y: 480, w: 1100, h: 200, size: o.size ?? 150, font: BLACK, color: C.white, name: o.titleName, anim: 'ascend', at: 0.6, dur: 0.8 });
  text(slide, o.sub, { x: 130, y: 690, w: 1000, h: 80, size: 56, font: SERIF, italic: true, color: C.white, name: o.subName, at: 1.0 });
  art(slide, o.art, o.ax, o.ay, o.aw, '!!ch-art', { at: 0.9, anim: 'fly', dir: 'right' });
}
function footer(slide) {
  const n = slideNo;
  text(slide, 'Upskilling & Reskilling  ·  EST Salé', { x: 120, y: 1010, w: 700, h: 30, size: 20, color: C.mute, name: '!!foot', anim: false });
  text(slide, String(n).padStart(2, '0'), { x: 1680, y: 996, w: 120, h: 50, size: 34, font: BLACK, color: C.violet, align: 'right', name: '!!page', anim: false });
}
/** White rounded card with an icon disc, a title and a description. */
function card(slide, x, y, w, h, name, o) {
  const a = { anim: o.anim ?? 'zoom', dir: o.dir, at: o.at, dur: o.dur ?? 0.5 };
  shape(slide, S.ROUNDED_RECTANGLE, x, y, w, h, name, { fill: o.fill ?? C.white, radius: 0.12, shadow: true, ...a });
  let tx = x + 32;
  if (o.icon) {
    shape(slide, S.OVAL, x + 28, y + 28, 64, 64, `${name}-ic`, { fill: o.iconBg ?? C.lilac, ...a });
    text(slide, ic(o.icon), { x: x + 28, y: y + 28, w: 64, h: 64, size: 30, font: ICON, color: o.accent ?? C.violet, align: 'center', valign: 'middle', name: `${name}-ig`, ...a });
    tx = x + 112;
  }
  text(slide, o.t, { x: tx, y: y + 30, w: x + w - tx - 24, h: 44, size: o.tSize ?? 30, font: SEMI, color: o.tColor ?? C.ink, name: `${name}-t`, ...a });
  if (o.d) text(slide, o.d, { x: tx, y: y + 30 + (o.tSize ?? 30) * 1.5, w: x + w - tx - 24, h: h - 90, size: o.dSize ?? 22, color: o.dColor ?? C.body, name: `${name}-d`, ...a });
}

/* ------------------------------------------------------------------ */
/*  Slides                                                             */
/* ------------------------------------------------------------------ */

// 0 — Intro: everything centred; the next click morphs it into the title layout
{
  const slide = addSlide('00. Intro', N(
    'INTRODUIRE : laisser l’écran d’accueil s’afficher pendant que le public s’installe.',
    'CLIC : le titre, la pastille et les noms glissent (Morph) vers la page de titre.',
  ));
  deco(slide, { a: [510, 90, 900, 900], b: [1460, 690, 320, 320], dots: [260, 160], sparks: [[420, 230, 70], [1470, 280, 46]], squig: [1480, 160] });
  shape(slide, S.ROUNDED_RECTANGLE, 760, 250, 400, 54, '!!pill', { line: C.violet, lineW: 2, radius: 0.5, anim: 'zoom', at: 0.4, dur: 0.4 });
  text(slide, 'RESSOURCES HUMAINES', { x: 760, y: 250, w: 400, h: 54, size: 23, font: SEMI, color: C.violet, align: 'center', valign: 'middle', charSpacing: 3, name: '!!pill-t', anim: 'zoom', at: 0.4, dur: 0.4 });
  text(slide, [
    { text: 'Upskilling', options: { fontFace: BLACK, color: C.ink, breakLine: true } },
    { text: '& Reskilling', options: { fontFace: SERIF, italic: true, color: C.orange } },
  ], { x: 260, y: 330, w: 1400, h: 330, size: 150, ls: 0.92, align: 'center', name: '!!title', anim: 'ascend', at: 0.6, dur: 0.9 });
  hero(slide, 630, 720, 660, 76, 38, C.violet, { at: 1.3 });
  text(slide, `${PRESENTERS[0]}   ·   ${PRESENTERS[1]}`, { x: 630, y: 720, w: 660, h: 76, size: 32, font: SEMI, color: C.white, align: 'center', valign: 'middle', name: '!!names', anim: 'zoom', at: 1.3, dur: 0.6 });
  const lg = uniq('!!logo');
  slide.addImage({ path: LOGO, x: inch(960 - 45 * LOGO_RATIO), y: inch(860), w: inch(90 * LOGO_RATIO), h: inch(90), objectName: lg, altText: SCHOOL });
  enter(lg, 'fade', { at: 1.6, dur: 0.8 });
}

// 1 — Title
{
  const slide = addSlide('01. Ouverture', N(
    'INTRODUIRE : laisser la page se composer (formes, illustration, titre).',
    'À DIRE : Bonjour, nous sommes Aya Yakoubi et Hassna Elhaddajy. Aujourd’hui, nous présentons l’upskilling et le reskilling : deux façons de développer les compétences des salariés pour accompagner le changement dans l’organisation.',
    'L’illustration (un chemin de livres) résume le sujet : apprendre, c’est avancer marche après marche.',
    'TRANSITION : « Pourquoi en parle-t-on autant aujourd’hui ? »',
  ));
  deco(slide, { a: [960, 110, 900, 900], b: [1530, 640, 380, 380], dots: [1630, 120], sparks: [[1000, 150, 70], [1770, 600, 46]], squig: [120, 140] });
  art(slide, 'road-to-knowledge.svg', 1010, 420, 820, '!!art', { at: 0.7 });
  shape(slide, S.ROUNDED_RECTANGLE, 120, 262, 400, 54, '!!pill', { line: C.violet, lineW: 2, radius: 0.5, anim: 'zoom', at: 0.3, dur: 0.4 });
  text(slide, 'RESSOURCES HUMAINES', { x: 120, y: 262, w: 400, h: 54, size: 23, font: SEMI, color: C.violet, align: 'center', valign: 'middle', charSpacing: 3, name: '!!pill-t', anim: 'zoom', at: 0.3, dur: 0.4 });
  text(slide, [
    { text: 'Upskilling', options: { fontFace: BLACK, color: C.ink, breakLine: true } },
    { text: '& Reskilling', options: { fontFace: SERIF, italic: true, color: C.orange } },
  ], { x: 120, y: 330, w: 900, h: 330, size: 150, ls: 0.92, name: '!!title', anim: 'ascend', at: 0.5, dur: 0.9 });
  text(slide, 'Développer les compétences pour réussir le changement', { x: 120, y: 680, w: 840, h: 50, size: 32, color: C.body, name: '!!sub', at: 1.2 });
  hero(slide, 120, 770, 660, 76, 38, C.violet, { anim: 'fly', dir: 'left', at: 1.5 });
  text(slide, `${PRESENTERS[0]}   ·   ${PRESENTERS[1]}`, { x: 120, y: 770, w: 660, h: 76, size: 32, font: SEMI, color: C.white, align: 'center', valign: 'middle', name: '!!names', anim: 'fly', dir: 'left', at: 1.5, dur: 0.6 });
  const lg = uniq('!!logo');
  slide.addImage({ path: LOGO, x: inch(120), y: inch(890), w: inch(90 * LOGO_RATIO), h: inch(90), objectName: lg, altText: SCHOOL });
  enter(lg, 'fade', { at: 1.8, dur: 0.8 });
}

// Spotlight — the key figure, huge; the next click shrinks it into the context slide
{
  const slide = addSlide('02. Le chiffre clé', N(
    'INTRODUIRE : commencer par un chiffre choc.',
    'À DIRE : selon le Forum économique mondial (Future of Jobs 2023), 44 % des compétences des salariés vont être bouleversées d’ici 2027. Presque une compétence sur deux !',
    'CLIC : le chiffre rétrécit (Morph) et laisse apparaître les causes.',
  ));
  deco(slide, { a: [-120, 520, 620, 620], b: [1560, 60, 360, 360], dots: [1600, 820], sparks: [[300, 300, 64], [1700, 560, 44]], squig: [1500, 960] });
  header(slide, 'LE CONTEXTE', ['Pourquoi ', 'maintenant', ' ?']);
  hero(slide, 310, 290, 1300, 640, 60, C.violet, { at: 0.4 });
  text(slide, '44 %', { x: 310, y: 330, w: 1300, h: 300, size: 300, font: BLACK, color: C.white, align: 'center', name: '!!stat', anim: 'zoom', at: 0.7, dur: 0.8 });
  text(slide, 'des compétences des salariés vont être bouleversées d’ici 2027', { x: 340, y: 660, w: 1240, h: 100, size: 36, color: C.white, align: 'center', name: '!!stat-t', at: 1.2 });
  text(slide, 'WEF, Future of Jobs 2023', { x: 410, y: 770, w: 1100, h: 40, size: 26, color: C.lilac2, italic: true, font: SERIF, align: 'center', name: '!!stat-s', at: 1.3 });
  shape(slide, S.ROUNDED_RECTANGLE, 510, 850, 900, 24, '!!bar-track', { fill: C.white, fillT: 70, radius: 0.5, anim: 'fade', at: 1.2 });
  shape(slide, S.ROUNDED_RECTANGLE, 510, 850, 900 * 0.44, 24, '!!bar', { fill: C.orange, radius: 0.5, anim: 'wipe', dir: 'left', at: 1.4, dur: 1.4 });
  footer(slide);
}

// 2 — Context
{
  const slide = addSlide('02. Contexte', N(
    'INTRODUIRE : le monde du travail change plus vite que jamais.',
    'À DIRE : l’intelligence artificielle, l’automatisation, la transition numérique et écologique transforment les métiers. Certains disparaissent, d’autres apparaissent, et presque tous évoluent. En même temps, les entreprises manquent de talents qualifiés.',
    'Chiffre : selon le Forum économique mondial (Future of Jobs 2023), 44 % des compétences des salariés vont être bouleversées d’ici 2027.',
    'TRANSITION : « Deux réponses existent : l’upskilling et le reskilling. »',
  ));
  deco(slide, { a: [40, 380, 720, 720], b: [1580, 40, 320, 320], dots: [1540, 300], sparks: [[640, 330, 56], [1820, 420, 40]], squig: [1300, 215] });
  header(slide, 'LE CONTEXTE', ['Pourquoi ', 'maintenant', ' ?']);
  art(slide, 'robotics.svg', 110, 470, 600, '!!art', { at: 0.5 });
  const DRIVERS = [['E99A', 'Intelligence artificielle'], ['E713', 'Automatisation'], ['E770', 'Transition numérique'], ['E909', 'Transition écologique'], ['E8FA', 'Pénurie de talents'], ['E82F', 'Nouveaux métiers']];
  DRIVERS.forEach(([icn, t], i) => {
    const x = 790 + (i % 2) * 520;
    const y = 300 + Math.floor(i / 2) * 116;
    card(slide, x, y, 490, 96, `!!chip${i}`, { icon: icn, t, tSize: 27, at: 0.7 + i * 0.12, accent: i % 2 ? C.orange : C.violet, iconBg: i % 2 ? C.peach : C.lilac });
  });
  hero(slide, 790, 670, 1010, 250, 30, C.violet, { anim: 'fly', dir: 'bottom', at: 1.6 });
  text(slide, '44 %', { x: 830, y: 700, w: 330, h: 150, size: 128, font: BLACK, color: C.white, name: '!!stat', anim: 'zoom', at: 2.0 });
  text(slide, 'des compétences des salariés vont être bouleversées d’ici 2027', { x: 1170, y: 712, w: 600, h: 90, size: 28, color: C.white, name: '!!stat-t', at: 2.1 });
  text(slide, 'WEF, Future of Jobs 2023', { x: 1170, y: 806, w: 600, h: 30, size: 20, color: C.lilac2, italic: true, font: SERIF, name: '!!stat-s', at: 2.2 });
  shape(slide, S.ROUNDED_RECTANGLE, 1170, 856, 590, 18, '!!bar-track', { fill: C.white, fillT: 70, radius: 0.5, anim: 'fade', at: 2.1 });
  shape(slide, S.ROUNDED_RECTANGLE, 1170, 856, 590 * 0.44, 18, '!!bar', { fill: C.orange, radius: 0.5, anim: 'wipe', dir: 'left', at: 2.3, dur: 1.3 });
  footer(slide);
}

// 3 — Definitions
{
  const slide = addSlide('03. Définitions', N(
    'INTRODUIRE : deux notions proches mais différentes.',
    'À DIRE : l’upskilling, c’est « monter en compétences » : on reste dans son métier, mais on devient plus expert. Exemple : un comptable qui apprend Power BI.',
    'Le reskilling, c’est « se reconvertir » : on change de métier, souvent parce que l’ancien est menacé. Exemple : un caissier qui devient conseiller client digital.',
    'TRANSITION : « Commençons par l’upskilling. »',
  ));
  deco(slide, { a: [1650, -120, 380, 380], b: [-120, 820, 360, 360], dots: [1560, 120], sparks: [[1840, 300, 44], [80, 300, 40]], squig: [1300, 200] });
  header(slide, 'DÉFINITIONS', ['Upskilling ', 'ou', ' reskilling ?'], C.orange);
  const COLS = [
    { x: 120, bg: C.lilac, color: C.violet, head: 'Upskilling', sub: 'Monter en compétences', file: 'level-up.svg', aw: 300, ax: 560, ay: 520, dir: 'left', rows: [['Objectif', 'Se perfectionner dans son métier'], ['Poste', 'Le même, qui évolue'], ['Durée', 'Formations courtes et continues'], ['Exemple', 'Comptable → Power BI']] },
    { x: 1000, bg: C.peach, color: C.orangeD, head: 'Reskilling', sub: 'Se reconvertir', file: 'career-growth-orange.svg', aw: 220, ax: 1540, ay: 470, dir: 'right', rows: [['Objectif', 'Apprendre un nouveau métier'], ['Poste', 'Un nouveau poste'], ['Durée', 'Parcours plus long'], ['Exemple', 'Caissier → conseiller digital']] },
  ];
  COLS.forEach((c, i) => {
    const at = 0.4 + i * 0.4;
    shape(slide, S.ROUNDED_RECTANGLE, c.x, 290, 800, 690, `!!panel${i}`, { fill: c.bg, radius: 0.08, anim: 'fly', dir: c.dir, at, dur: 0.7 });
    text(slide, c.head, { x: c.x + 50, y: 320, w: 700, h: 80, size: 72, font: BLACK, color: c.color, name: `!!def-h${i}`, anim: 'fly', dir: c.dir, at: at + 0.15, dur: 0.6 });
    text(slide, c.sub, { x: c.x + 50, y: 404, w: 700, h: 50, size: 36, font: SERIF, italic: true, color: C.ink, name: `!!def-s${i}`, anim: 'fly', dir: c.dir, at: at + 0.15, dur: 0.6 });
    art(slide, c.file, c.ax, c.ay, c.aw, `!!def-art${i}`, { at: at + 0.6 });
    c.rows.forEach(([lab, val], j) => {
      const y = 500 + j * 115;
      const rAt = at + 0.6 + j * 0.15;
      text(slide, lab.toUpperCase(), { x: c.x + 50, y, w: 420, h: 30, size: 20, font: SEMI, color: c.color, charSpacing: 3, name: `!!def-l${i}-${j}`, at: rAt });
      text(slide, val, { x: c.x + 50, y: y + 32, w: 420, h: 76, size: 28, font: SEMI, name: `!!def-v${i}-${j}`, anim: 'fly', dir: 'bottom', at: rAt, dur: 0.5 });
    });
  });
  const vs = hero(slide, 900, 575, 120, 120, 60, C.orange, { line: C.white, lineW: 5, at: 1.6 });
  text(slide, 'VS', { x: 900, y: 575, w: 120, h: 120, size: 42, font: BLACK, color: C.white, align: 'center', valign: 'middle', name: '!!vs-t', anim: 'zoom', at: 1.6, dur: 0.6 });
  ambient(vs, 'pulse', { dur: 1.4, by: 108, reverse: true, delay: 2.2 });
  footer(slide);
}

// Chapter 1 — the VS circle grows into a full violet screen
chapter('Chapitre 1 · Upskilling', N(
  'TRANSITION VISUELLE : le cercle « VS » s’agrandit et remplit l’écran : on entre dans le premier chapitre.',
  'À DIRE : « Premier chapitre : l’upskilling, monter en compétences. »',
), { color: C.violet, num: '01', numColor: C.lilac2, title: 'Upskilling', titleName: '!!def-h0', sub: 'Monter en compétences', subName: '!!def-s0',
  art: 'level-up-white.svg', ax: 1240, ay: 230, aw: 560,
  deco: { a: [1180, 60, 760, 760], b: [-160, 760, 420, 420], dots: [1620, 860], sparks: [[1120, 160, 70], [1820, 760, 46]], squig: [130, 840] } });

// 4 — Upskilling
{
  const slide = addSlide('04. Upskilling', N(
    'INTRODUIRE : première notion, l’upskilling : on monte les marches de son propre métier.',
    'À DIRE : 1) définition : renforcer et actualiser ses compétences ; 2) le métier reste le même mais il évolue (outils, méthodes, normes) ; 3) exemples : un comptable qui apprend Power BI, un commercial qui maîtrise le CRM et l’IA ; 4) objectif : rester performant et employable.',
    'Chiffre : 44 % des compétences vont être bouleversées d’ici 2027 (WEF 2023).',
    'TRANSITION : « Mais parfois, monter les marches ne suffit plus : il faut changer de voie. »',
  ));
  deco(slide, { a: [40, 360, 760, 760], b: [1600, 60, 300, 300], dots: [1620, 380], sparks: [[700, 330, 60], [1830, 900, 40]], squig: [140, 300] });
  header(slide, 'UPSKILLING', ['Gravir les ', 'marches', ' de son métier']);
  art(slide, 'stepping-up.svg', 130, 500, 600, '!!art', { at: 0.5 });
  const sticker = hero(slide, 470, 300, 220, 220, 110, C.orange, { line: C.white, lineW: 5, at: 1.8 });
  text(slide, '44 %', { x: 470, y: 340, w: 220, h: 80, size: 70, font: BLACK, color: C.white, align: 'center', name: '!!sticker-v', anim: 'zoom', at: 1.8, dur: 0.6 });
  text(slide, 'des compétences bouleversées d’ici 2027', { x: 495, y: 420, w: 170, h: 70, size: 17, color: C.white, align: 'center', name: '!!sticker-t', anim: 'zoom', at: 1.8, dur: 0.6 });
  ambient(sticker, 'teeter', { dur: 1, delay: 2.6 });
  const STEPS = [
    ['Définition', 'Renforcer et actualiser ses compétences.'],
    ['Même métier', 'Le poste évolue : outils, méthodes, normes.'],
    ['Exemples', 'Comptable → Power BI ; commercial → CRM et IA.'],
    ['Objectif', 'Rester performant et employable.'],
  ];
  STEPS.forEach(([t, d], i) => {
    const x = 820 + i * 110;
    const y = 840 - i * 165;
    const at = 0.8 + i * 0.25;
    shape(slide, S.ROUNDED_RECTANGLE, x, y, 600, 140, `!!st${i}`, { fill: C.white, radius: 0.18, shadow: true, anim: 'fly', dir: 'bottom', at, dur: 0.55 });
    shape(slide, S.OVAL, x + 26, y + 30, 80, 80, `!!st${i}-c`, { fill: i === 3 ? C.violetD : C.violet, anim: 'zoom', at: at + 0.15, dur: 0.4 });
    text(slide, String(i + 1), { x: x + 26, y: y + 30, w: 80, h: 80, size: 40, font: BLACK, color: C.white, align: 'center', valign: 'middle', name: `!!st${i}-n`, anim: 'zoom', at: at + 0.15, dur: 0.4 });
    text(slide, t, { x: x + 130, y: y + 22, w: 450, h: 44, size: 30, font: SEMI, name: `!!st${i}-t`, anim: 'fly', dir: 'bottom', at, dur: 0.55 });
    text(slide, d, { x: x + 130, y: y + 68, w: 450, h: 60, size: 22, color: C.body, name: `!!st${i}-d`, anim: 'fly', dir: 'bottom', at, dur: 0.55 });
  });
  const arrow = text(slide, ic('E74A'), { x: 1580, y: 250, w: 120, h: 120, size: 90, font: ICON, color: C.violet, align: 'center', name: '!!arrow', anim: 'fly', dir: 'bottom', at: 2.0 });
  ambient(arrow, 'path', { dur: 1.2, path: 'M 0 0 L 0 -0.012 E', reverse: true, delay: 2.6, smooth: true });
  footer(slide);
}

// Chapter 2 — the sticker grows into a full orange screen
chapter('Chapitre 2 · Reskilling', N(
  'TRANSITION VISUELLE : la pastille orange remplit l’écran : deuxième chapitre.',
  'À DIRE : « Deuxième chapitre : le reskilling, se reconvertir vers un nouveau métier. »',
), { color: C.orange, num: '02', numColor: C.peach, title: 'Reskilling', titleName: '!!def-h1', sub: 'Se reconvertir', subName: '!!def-s1',
  art: 'career-growth-white.svg', ax: 1420, ay: 150, aw: 400,
  deco: { a: [1240, 120, 700, 760], b: [-120, -120, 420, 420], dots: [120, 860], sparks: [[1220, 180, 70], [1820, 900, 46]], squig: [1500, 960] } });

// 5 — Reskilling
{
  const slide = addSlide('05. Reskilling', N(
    'INTRODUIRE : deuxième notion, le reskilling : on change de voie pour un nouveau métier.',
    'À DIRE : on part d’un métier menacé (automatisation, suppression de poste…) et on arrive à un nouveau métier en trois étapes : diagnostic, formation, accompagnement. L’illustration du miroir montre la nouvelle version de soi-même.',
    'Chiffre : 6 salariés sur 10 auront besoin d’une formation d’ici 2027 (WEF 2023). Exemple : un caissier qui devient conseiller client digital. Objectif : garder les talents au lieu de licencier puis recruter.',
    'TRANSITION : « Comment les RH organisent-elles tout cela ? »',
  ));
  deco(slide, { a: [-160, 760, 420, 420], b: [1360, 180, 560, 600], dots: [120, 600], sparks: [[1340, 210, 54], [1820, 860, 40]], squig: [1580, 150] });
  header(slide, 'RESKILLING', ['Changer de ', 'voie', ' sans quitter l’entreprise'], C.orange);
  art(slide, 'career-growth-orange.svg', 1490, 240, 300, '!!art', { at: 0.5 });
  const FLOW = ['Métier actuel', 'Diagnostic', 'Formation', 'Accompagnement', 'Nouveau métier'];
  FLOW.forEach((t, i) => {
    const x = 120 + i * 255;
    const at = 0.7 + i * 0.25;
    const first = i === 0;
    const last = i === FLOW.length - 1;
    if (last) hero(slide, x, 300, 215, 80, 40, C.orange, { at, dur: 0.45 });
    else shape(slide, S.ROUNDED_RECTANGLE, x, 300, 215, 80, `!!flow${i}`, { fill: first ? C.white : C.peach, line: first ? C.mute : undefined, lineW: 2, radius: 0.5, anim: 'zoom', at, dur: 0.45 });
    text(slide, t, { x, y: 300, w: 215, h: 80, size: 23, font: SEMI, color: last ? C.white : first ? C.body : C.orangeD, align: 'center', valign: 'middle', name: `!!flow${i}-t`, anim: 'zoom', at, dur: 0.45 });
    if (i < FLOW.length - 1) text(slide, ic('E72A'), { x: x + 215, y: 315, w: 40, h: 50, size: 26, font: ICON, color: C.orange, align: 'center', valign: 'middle', name: `!!flow${i}-a`, anim: 'wipe', dir: 'left', at: at + 0.2, dur: 0.3 });
  });
  const walker = person(slide, 'orange', 227, 300, 80, '!!walker', { anim: 'fade', at: 2.0 });
  ambient(walker, 'path', { dur: 3.6, delay: 2.4, path: pathOf([[227, 300], [1247, 300]]), repeat: 1, smooth: true });
  text(slide, '6 / 10', { x: 120, y: 440, w: 330, h: 140, size: 120, font: BLACK, color: C.orange, name: '!!stat', anim: 'zoom', at: 2.4 });
  for (let i = 0; i < 10; i++) person(slide, i < 6 ? 'orange' : 'grey', 500 + i * 72, 580, 112, `!!pic${i}`, { anim: 'zoom', at: 2.5 + i * 0.07, dur: 0.35 });
  text(slide, 'salariés auront besoin d’une formation d’ici 2027', { x: 1240, y: 470, w: 240, h: 90, size: 22, name: '!!stat-t', at: 2.8 });
  text(slide, 'WEF, Future of Jobs 2023', { x: 1240, y: 560, w: 240, h: 30, size: 18, font: SERIF, italic: true, color: C.mute, name: '!!stat-s', at: 2.9 });
  const CARDS = [['E946', 'Définition', 'Acquérir de nouvelles compétences pour un autre métier.'], ['E9CE', 'Quand ?', 'Métier automatisé, poste supprimé, nouveaux besoins.'], ['E8D4', 'Exemple', 'Caissier → conseiller client digital.'], ['E902', 'Objectif', 'Garder les talents en interne.']];
  CARDS.forEach(([icn, t, d], i) => card(slide, 120 + i * 345, 660, 325, 300, `!!re-c${i}`, { icon: icn, t, d, tSize: 28, dSize: 22, accent: C.orangeD, iconBg: C.peach, anim: 'fly', dir: 'bottom', at: 3.0 + i * 0.15 }));
  footer(slide);
}

// Chapter 3 — the last pill of the reskilling path becomes a full screen
chapter('Chapitre 3 · Passer à l’action', N(
  'TRANSITION VISUELLE : la pastille « Nouveau métier » remplit l’écran : troisième chapitre.',
  'À DIRE : « Troisième chapitre : comment l’entreprise organise tout cela, concrètement. »',
), { color: C.violetD, num: '03', numColor: '8F87FF', title: 'Passer à l’action', titleName: '!!ch-title', size: 112, sub: 'Démarche, outils, bénéfices', subName: '!!ch-sub',
  art: 'completed-steps.svg', ax: 1300, ay: 340, aw: 540,
  deco: { a: [1100, 160, 820, 760], b: [-140, 780, 400, 400], dots: [1620, 120], sparks: [[1100, 220, 70], [1840, 880, 46]], squig: [130, 860] } });

// 6 — HR process
{
  const slide = addSlide('06. Démarche RH', N(
    'INTRODUIRE : comment les RH mettent en place l’upskilling et le reskilling, en cinq étapes.',
    'À DIRE : 1) cartographier les compétences actuelles ; 2) anticiper les besoins futurs (GPEC / GEPP) ; 3) mesurer l’écart, le « skills gap » ; 4) construire les parcours, upskilling ou reskilling selon chacun ; 5) évaluer et suivre les progrès.',
    'Chiffre : 39 % des compétences clés vont changer d’ici 2030 (WEF, Future of Jobs 2025) : il faut anticiper.',
    'TRANSITION : « Concrètement, comment forme-t-on ? »',
  ));
  deco(slide, { a: [1300, 560, 640, 560], b: [-140, -140, 420, 420], dots: [1600, 110], sparks: [[1220, 640, 50], [1840, 380, 40]], squig: [1000, 200] });
  header(slide, 'LA DÉMARCHE RH', ['Un ', 'chemin', ' en 5 étapes']);
  art(slide, 'completed-steps.svg', 1330, 650, 480, '!!art', { at: 2.6 });
  const X = [210, 510, 810, 1110, 1410];
  const Y = [430, 560, 430, 560, 430];
  const STEPS = [
    ['E8F1', 'Cartographier', 'Les compétences d’aujourd’hui'],
    ['E81C', 'Anticiper', 'Les besoins de demain (GPEC)'],
    ['E9D9', 'Mesurer l’écart', 'Le « skills gap »'],
    ['E7BE', 'Construire', 'Upskilling ou reskilling'],
    ['E73E', 'Évaluer', 'Suivre et valoriser'],
  ];
  for (let i = 0; i < 4; i++) line(slide, X[i], Y[i], X[i + 1], Y[i + 1], `!!path${i}`, { color: C.violet, width: 3, dash: 'dash', t: 30, at: 0.7 + i * 0.35, dur: 0.4 });
  STEPS.forEach(([icn, t, d], i) => {
    const at = 0.6 + i * 0.35;
    const fill = ['A9A3FF', '8F87FF', C.violet, '5A52E6', C.violetD][i];
    shape(slide, S.OVAL, X[i] - 62, Y[i] - 62, 124, 124, `!!ms${i}`, { fill, line: C.white, lineW: 6, shadow: true, anim: 'zoom', at, dur: 0.5 });
    text(slide, ic(icn), { x: X[i] - 62, y: Y[i] - 62, w: 124, h: 124, size: 46, font: ICON, color: C.white, align: 'center', valign: 'middle', name: `!!ms${i}-i`, anim: 'zoom', at, dur: 0.5 });
    shape(slide, S.OVAL, X[i] + 30, Y[i] - 72, 44, 44, `!!ms${i}-b`, { fill: C.orange, line: C.white, lineW: 3, anim: 'zoom', at: at + 0.2, dur: 0.3 });
    text(slide, String(i + 1), { x: X[i] + 30, y: Y[i] - 72, w: 44, h: 44, size: 22, font: BLACK, color: C.white, align: 'center', valign: 'middle', name: `!!ms${i}-n`, anim: 'zoom', at: at + 0.2, dur: 0.3 });
    text(slide, t, { x: X[i] - 150, y: Y[i] + 80, w: 300, h: 44, size: 29, font: SEMI, align: 'center', name: `!!ms${i}-t`, anim: 'fly', dir: 'bottom', at: at + 0.15 });
    text(slide, d, { x: X[i] - 150, y: Y[i] + 124, w: 300, h: 60, size: 21, color: C.body, align: 'center', name: `!!ms${i}-d`, anim: 'fly', dir: 'bottom', at: at + 0.2 });
  });
  hero(slide, 120, 800, 1080, 160, 32, C.lilac, { shadow: false, anim: 'fly', dir: 'left', at: 2.4 });
  text(slide, '39 %', { x: 160, y: 812, w: 300, h: 130, size: 110, font: BLACK, color: C.violet, name: '!!stat', anim: 'fly', dir: 'left', at: 2.4, dur: 0.6 });
  text(slide, 'des compétences clés vont changer d’ici 2030 : il faut anticiper.', { x: 480, y: 830, w: 690, h: 80, size: 27, font: SEMI, name: '!!stat-t', anim: 'fly', dir: 'left', at: 2.4, dur: 0.6 });
  text(slide, 'WEF, Future of Jobs 2025', { x: 480, y: 912, w: 690, h: 30, size: 19, font: SERIF, italic: true, color: C.mute, name: '!!stat-s', anim: 'fly', dir: 'left', at: 2.4, dur: 0.6 });
  footer(slide);
}

// 7 — Formats & tools (bento grid)
{
  const slide = addSlide('07. Formats & outils', N(
    'INTRODUIRE : il existe plusieurs façons d’apprendre ; on les combine.',
    'À DIRE : le digital learning (e-learning, MOOC, micro-learning) ; l’apprentissage en situation (tutorat, mentorat, mobilité interne) ; le blended learning (présentiel + distanciel) ; les certifications. Au Maroc, la formation continue peut être financée par les Contrats Spéciaux de Formation (CSF).',
    'Exemple célèbre : Amazon a investi 700 millions de dollars pour former 100 000 salariés (programme Upskilling 2025).',
    'TRANSITION : « Qu’est-ce que cela apporte, et quelles sont les difficultés ? »',
  ));
  deco(slide, { a: [20, 330, 760, 700], b: [1640, -80, 340, 340], dots: [120, 300], sparks: [[680, 300, 56], [1840, 480, 38]], squig: [1300, 200] });
  header(slide, 'FORMATS & OUTILS', ['Des façons ', 'variées', ' d’apprendre'], C.orange);
  art(slide, 'online-learning.svg', 100, 470, 620, '!!art', { at: 0.5 });
  card(slide, 790, 290, 495, 200, '!!fm0', { icon: 'E770', t: 'Digital learning', d: 'E-learning, MOOC, micro-learning', at: 0.7 });
  card(slide, 1305, 290, 495, 200, '!!fm1', { icon: 'E902', t: 'En situation', d: 'Tutorat, mentorat, mobilité interne', at: 0.85, accent: C.orangeD, iconBg: C.peach });
  card(slide, 790, 510, 330, 200, '!!fm2', { icon: 'E81E', t: 'Blended', d: 'Présentiel + distanciel', at: 1.0, accent: C.orangeD, iconBg: C.peach, tSize: 28, dSize: 20 });
  card(slide, 1140, 510, 320, 200, '!!fm3', { icon: 'E7BE', t: 'Certifications', d: 'Diplômes, badges', at: 1.15, tSize: 26, dSize: 20 });
  card(slide, 1480, 510, 320, 200, '!!fm4', { icon: 'E707', t: 'Au Maroc', d: 'Formation financée par les CSF', at: 1.3, accent: C.orangeD, iconBg: C.peach, tSize: 28, dSize: 20 });
  hero(slide, 790, 730, 1010, 230, 28, C.orange, { anim: 'fly', dir: 'bottom', at: 1.7 });
  text(slide, '700 M$', { x: 830, y: 770, w: 440, h: 130, size: 100, font: BLACK, color: C.white, name: '!!stat', anim: 'zoom', at: 2.1 });
  text(slide, 'investis par Amazon pour former 100 000 salariés aux métiers de demain', { x: 1260, y: 772, w: 510, h: 110, size: 27, color: C.white, name: '!!stat-t', at: 2.2 });
  text(slide, 'Programme « Upskilling 2025 »', { x: 1260, y: 890, w: 510, h: 30, size: 20, font: SERIF, italic: true, color: C.peach, name: '!!stat-s', at: 2.3 });
  footer(slide);
}

// Spotlight — the 94 % gauge, huge; the next click shrinks it between the cards
{
  const slide = addSlide('11. Le chiffre clé', N(
    'INTRODUIRE : un chiffre qui montre l’intérêt pour l’entreprise.',
    'À DIRE : selon LinkedIn (2019), 94 % des salariés resteraient plus longtemps dans une entreprise qui investit dans leur formation. Former, c’est aussi fidéliser.',
    'CLIC : la jauge rétrécit (Morph) et les bénéfices et défis apparaissent autour.',
  ));
  deco(slide, { a: [560, 200, 800, 800], b: [-140, 760, 400, 400], dots: [1600, 110], sparks: [[560, 300, 60], [1420, 820, 44]], squig: [140, 300] });
  header(slide, 'BÉNÉFICES & DÉFIS', ['Gagnant-gagnant… ', 'à certaines conditions']);
  hero(slide, 610, 290, 700, 700, 350, C.lilac, { shadow: false, at: 0.4 });
  shape(slide, S.BLOCK_ARC, 650, 330, 620, 620, '!!g-track', { fill: C.white, angleRange: [0, 359.9], arc: 0.3, anim: 'fade', at: 0.5 });
  shape(slide, S.BLOCK_ARC, 650, 330, 620, 620, '!!gauge', { fill: C.violet, angleRange: [270, 248.4], arc: 0.3, anim: 'wheel', at: 0.7, dur: 1.8 });
  text(slide, '94 %', { x: 650, y: 540, w: 620, h: 200, size: 170, font: BLACK, color: C.violet, align: 'center', valign: 'middle', name: '!!stat', anim: 'zoom', at: 0.9, dur: 0.7 });
  shape(slide, S.RECTANGLE, 1380, 520, 8, 150, '!!cap-bar', { fill: C.violet, anim: 'fade', at: 1.6 });
  text(slide, 'des salariés resteraient plus longtemps dans une entreprise qui investit dans leur formation', { x: 1410, y: 516, w: 420, h: 160, size: 28, font: SEMI, name: '!!stat-t', at: 1.6 });
  text(slide, 'LinkedIn, Workplace Learning Report 2019', { x: 1410, y: 690, w: 420, h: 60, size: 20, font: SERIF, italic: true, color: C.mute, name: '!!stat-s', at: 1.7 });
  footer(slide);
}

// 8 — Benefits & challenges
{
  const slide = addSlide('08. Bénéfices & défis', N(
    'INTRODUIRE : l’upskilling et le reskilling sont gagnant-gagnant… à certaines conditions.',
    'À DIRE : pour le salarié, plus d’employabilité, de motivation et d’évolution ; pour l’entreprise, des compétences disponibles, des talents fidélisés et moins de recrutements coûteux.',
    'Défis : le temps et le budget, et la résistance au changement (peur de l’échec), d’où le rôle clé des managers.',
    'Chiffre : selon LinkedIn (2019), 94 % des salariés resteraient plus longtemps dans une entreprise qui investit dans leur formation.',
    'TRANSITION : « Récapitulons tout le parcours. »',
  ));
  deco(slide, { a: [700, 240, 520, 520], b: [1620, 760, 360, 360], dots: [1600, 110], sparks: [[700, 280, 50], [1180, 720, 40]], squig: [140, 900] });
  header(slide, 'BÉNÉFICES & DÉFIS', ['Gagnant-gagnant… ', 'à certaines conditions']);
  card(slide, 120, 300, 540, 190, '!!bn0', { icon: 'E8FA', t: 'Pour le salarié', d: 'Employabilité, motivation, évolution.', at: 0.6, anim: 'fly', dir: 'left' });
  card(slide, 120, 510, 540, 190, '!!bn1', { icon: 'E821', t: 'Pour l’entreprise', d: 'Compétences disponibles, fidélisation.', at: 0.8, anim: 'fly', dir: 'left' });
  card(slide, 1260, 300, 540, 190, '!!df0', { icon: 'E916', t: 'Temps et budget', d: 'Former demande un vrai investissement.', at: 0.9, anim: 'fly', dir: 'right', accent: C.orangeD, iconBg: C.peach });
  card(slide, 1260, 510, 540, 190, '!!df1', { icon: 'E7BA', t: 'Résistance', d: 'Peur de l’échec : impliquer les managers.', at: 1.1, anim: 'fly', dir: 'right', accent: C.orangeD, iconBg: C.peach });
  hero(slide, 740, 270, 440, 440, 220, C.lilac, { shadow: false, at: 1.2 });
  shape(slide, S.BLOCK_ARC, 760, 290, 400, 400, '!!g-track', { fill: C.white, angleRange: [0, 359.9], arc: 0.3, anim: 'fade', at: 1.3 });
  shape(slide, S.BLOCK_ARC, 760, 290, 400, 400, '!!gauge', { fill: C.violet, angleRange: [270, 248.4], arc: 0.3, anim: 'wheel', at: 1.5, dur: 1.6 });
  text(slide, '94 %', { x: 760, y: 430, w: 400, h: 120, size: 96, font: BLACK, color: C.violet, align: 'center', valign: 'middle', name: '!!stat', anim: 'zoom', at: 1.6 });
  shape(slide, S.RECTANGLE, 120, 745, 8, 120, '!!cap-bar', { fill: C.violet, anim: 'fade', at: 2.4 });
  text(slide, 'des salariés resteraient plus longtemps dans une entreprise qui investit dans leur formation', { x: 150, y: 742, w: 500, h: 100, size: 23, font: SEMI, name: '!!stat-t', at: 2.4 });
  text(slide, 'LinkedIn, Workplace Learning Report 2019', { x: 150, y: 846, w: 500, h: 30, size: 18, font: SERIF, italic: true, color: C.mute, name: '!!stat-s', at: 2.5 });
  art(slide, 'team-goals.svg', 700, 720, 520, '!!art', { at: 2.0 });
  footer(slide);
}

// 9 — Synthesis: the journey
{
  const slide = addSlide('09. Synthèse', N(
    'INTRODUIRE : voici le parcours complet, de l’anticipation à la fidélisation.',
    'À DIRE : on anticipe les compétences de demain, on diagnostique les écarts, on forme (upskilling pour monter en compétences, reskilling pour changer de métier), on accompagne avec les managers et les tuteurs, puis on fidélise.',
    'TRANSITION : « Que faut-il retenir ? »',
  ));
  deco(slide, { a: [1260, 560, 680, 520], b: [-100, 160, 360, 360], dots: [1620, 120], sparks: [[1220, 620, 50], [80, 900, 40]], squig: [1100, 200] });
  header(slide, 'SYNTHÈSE', ['Le ', 'parcours', ' complet'], C.orange);
  art(slide, 'upgrade.svg', 1300, 700, 500, '!!art', { at: 3.2 });
  const P = [[220, 760], [520, 640], [820, 560], [1120, 480], [1420, 400]];
  const STOPS = [
    ['E82F', 'Anticiper', 'Les compétences de demain'],
    ['E9D9', 'Diagnostiquer', 'Cartographie, skills gap'],
    ['E7BE', 'Former', null],
    ['E902', 'Accompagner', 'Managers et tuteurs'],
    ['EB51', 'Fidéliser', 'Évaluer, valoriser, garder'],
  ];
  for (let i = 0; i < 4; i++) line(slide, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], `!!jp${i}`, { color: C.orange, width: 3, dash: 'dash', at: 0.6 + i * 0.3, dur: 0.35 });
  STOPS.forEach(([icn, t, d], i) => {
    const [x, y] = P[i];
    const at = 0.5 + i * 0.3;
    const fill = i < 2 ? C.violet : i === 2 ? C.ink : C.orange;
    if (i === 2) hero(slide, x - 56, y - 56, 112, 112, 56, fill, { line: C.white, lineW: 6, at, dur: 0.45 });
    else shape(slide, S.OVAL, x - 56, y - 56, 112, 112, `!!stop${i}`, { fill, line: C.white, lineW: 6, shadow: true, anim: 'zoom', at, dur: 0.45 });
    text(slide, ic(icn), { x: x - 56, y: y - 56, w: 112, h: 112, size: 42, font: ICON, color: C.white, align: 'center', valign: 'middle', name: `!!stop${i}-i`, anim: 'zoom', at, dur: 0.45 });
    text(slide, t, { x: x - 150, y: y + 70, w: 300, h: 44, size: 29, font: SEMI, align: 'center', name: `!!stop${i}-t`, anim: 'fly', dir: 'bottom', at: at + 0.15 });
    if (d) text(slide, d, { x: x - 150, y: y + 114, w: 300, h: 40, size: 21, color: C.body, align: 'center', name: `!!stop${i}-d`, anim: 'fly', dir: 'bottom', at: at + 0.2 });
  });
  shape(slide, S.ROUNDED_RECTANGLE, 660, 676, 150, 48, '!!tag-up', { fill: C.violet, radius: 0.5, anim: 'zoom', at: 1.4 });
  text(slide, 'Upskilling', { x: 660, y: 676, w: 150, h: 48, size: 21, font: SEMI, color: C.white, align: 'center', valign: 'middle', name: '!!tag-up-t', anim: 'zoom', at: 1.4 });
  shape(slide, S.ROUNDED_RECTANGLE, 830, 676, 150, 48, '!!tag-re', { fill: C.orange, radius: 0.5, anim: 'zoom', at: 1.5 });
  text(slide, 'Reskilling', { x: 830, y: 676, w: 150, h: 48, size: 21, font: SEMI, color: C.white, align: 'center', valign: 'middle', name: '!!tag-re-t', anim: 'zoom', at: 1.5 });
  const walker = person(slide, 'violet', 220, 700, 80, '!!walker', { anim: 'fade', at: 2.0 });
  ambient(walker, 'path', { dur: 4.5, delay: 2.4, path: pathOf(P.map(([x, y]) => [x, y - 60])), repeat: 1, smooth: true });
  text(slide, [{ text: '« Un salarié qui apprend en continu fait ', options: {} }, { text: 'grandir', options: { color: C.orange } }, { text: ' toute l’organisation. »', options: {} }], { x: 120, y: 280, w: 980, h: 110, size: 36, font: SERIF, italic: true, color: C.ink, name: '!!quote', at: 2.2 });
  footer(slide);
}

// 10 — Conclusion
{
  const slide = addSlide('10. Conclusion', N(
    'INTRODUIRE : l’upskilling et le reskilling ne sont pas de simples formations, ce sont une stratégie RH.',
    'À DIRE : anticiper les compétences de demain, former les salariés, et ainsi fidéliser des talents qui évoluent avec l’entreprise. C’est le lien direct avec notre cours : le changement et l’apprentissage dans les organisations.',
    'TRANSITION : « Merci pour votre attention. »',
  ));
  deco(slide, { a: [1280, 200, 640, 700], b: [-140, 760, 380, 380], dots: [1220, 120], sparks: [[1300, 260, 56], [1820, 860, 40]], squig: [1000, 985] });
  header(slide, 'CONCLUSION', ['Apprendre en ', 'continu', ' : une stratégie RH']);
  art(slide, 'certification.svg', 1420, 290, 360, '!!art', { at: 0.5 });
  const P = [['Anticiper', 'les compétences de demain'], ['Former', 'par l’upskilling et le reskilling'], ['Fidéliser', 'des talents qui évoluent avec l’entreprise']];
  P.forEach(([t, d], i) => {
    const y = 300 + i * 165;
    const at = 0.6 + i * 0.3;
    text(slide, `0${i + 1}`, { x: 120, y, w: 150, h: 130, size: 110, font: SERIF, italic: true, color: i === 1 ? C.violet : C.orange, name: `!!cc-n${i}`, anim: 'zoom', at });
    text(slide, t, { x: 290, y: y + 10, w: 900, h: 64, size: 56, font: BLACK, name: `!!cc-t${i}`, anim: 'fly', dir: 'left', at: at + 0.1 });
    text(slide, d, { x: 290, y: y + 78, w: 900, h: 44, size: 28, color: C.body, name: `!!cc-d${i}`, anim: 'fly', dir: 'left', at: at + 0.15 });
  });
  hero(slide, 120, 820, 1160, 130, 36, C.violet, { anim: 'fly', dir: 'bottom', at: 1.8 });
  text(slide, '« La compétence est le capital le plus durable de l’entreprise. »', { x: 160, y: 820, w: 1080, h: 130, size: 36, font: SERIF, italic: true, color: C.white, align: 'center', valign: 'middle', name: '!!take-t', anim: 'fly', dir: 'bottom', at: 1.8, dur: 0.6 });
  footer(slide);
}

// References — the hero becomes the panel that holds the sources
{
  const slide = addSlide('17. Références', N(
    'INTRODUIRE : les sources des chiffres et des contenus présentés.',
    'À DIRE : nos chiffres viennent de rapports reconnus : le Forum économique mondial (Future of Jobs 2023 et 2025), LinkedIn (Workplace Learning Report 2019) et l’annonce d’Amazon (Upskilling 2025). Pour le Maroc, le dispositif des Contrats Spéciaux de Formation. Les illustrations viennent de unDraw, une banque d’illustrations libres.',
    'TRANSITION : « Merci pour votre attention. »',
  ));
  deco(slide, { a: [1300, 300, 620, 680], b: [1640, -100, 340, 340], dots: [1560, 120], sparks: [[1320, 330, 54], [1840, 900, 40]], squig: [1000, 985] });
  header(slide, 'SOURCES', ['Nos ', 'références']);
  hero(slide, 100, 280, 1180, 700, 40, C.lilac, { shadow: false, at: 0.3 });
  art(slide, 'continuous-learning.svg', 1360, 420, 440, '!!art', { at: 0.6 });
  const REFS = [
    [['World Economic Forum (2023). ', 'The Future of Jobs Report 2023', '. Genève : WEF.'], '44 % des compétences bouleversées ; 6 salariés sur 10 à former d’ici 2027.'],
    [['World Economic Forum (2025). ', 'The Future of Jobs Report 2025', '. Genève : WEF.'], '39 % des compétences clés vont changer d’ici 2030.'],
    [['LinkedIn Learning (2019). ', '2019 Workplace Learning Report', '. LinkedIn.'], '94 % des salariés resteraient plus longtemps dans une entreprise qui investit dans leur développement.'],
    [['Amazon (2019). ', 'Upskilling 2025', ', communiqué du 11 juillet 2019.'], '700 millions de dollars pour former 100 000 salariés.'],
    [['Royaume du Maroc. ', 'Contrats Spéciaux de Formation (CSF)', '.'], 'Dispositif de financement de la formation continue en entreprise.'],
    [['Illustrations : unDraw (undraw.co). ', 'Licence libre', ', K. Limpitsouni.'], 'Illustrations recolorées pour cette présentation.'],
  ];
  REFS.forEach(([[a, b, c], d], i) => {
    const y = 306 + i * 110;
    const at = 0.6 + i * 0.18;
    text(slide, `0${i + 1}`, { x: 140, y: y - 4, w: 90, h: 60, size: 46, font: SERIF, italic: true, color: i % 2 ? C.orange : C.violet, name: `!!ref${i}-n`, anim: 'zoom', at, dur: 0.4 });
    text(slide, [{ text: a, options: { fontFace: SEMI } }, { text: b, options: { fontFace: SERIF, italic: true } }, { text: c, options: {} }], { x: 240, y, w: 1010, h: 40, size: 25, color: C.ink, name: `!!ref${i}-t`, anim: 'fly', dir: 'left', at, dur: 0.5 });
    text(slide, d, { x: 240, y: y + 40, w: 1010, h: 34, size: 20, color: C.body, name: `!!ref${i}-d`, anim: 'fly', dir: 'left', at: at + 0.05, dur: 0.5 });
  });
  footer(slide);
}

// 11 — Thanks
{
  const slide = addSlide('11. Questions', N(
    'INTRODUIRE : remercier et ouvrir les échanges.',
    'Pistes : quelle différence entre formation classique et upskilling ? Qui doit payer la formation, le salarié ou l’entreprise ? Quels métiers sont les plus concernés au Maroc ? L’IA va-t-elle remplacer ou transformer les métiers ?',
  ));
  deco(slide, { a: [940, 140, 940, 860], b: [-120, -120, 420, 420], dots: [1650, 120], sparks: [[960, 220, 70], [1800, 840, 46]], squig: [120, 980] });
  art(slide, 'hr-presentation.svg', 1010, 340, 780, '!!art', { at: 0.6 });
  text(slide, [{ text: 'Merci', options: { fontFace: BLACK, color: C.ink } }, { text: ' !', options: { fontFace: BLACK, color: C.orange } }], { x: 120, y: 240, w: 860, h: 200, size: 200, name: '!!title', anim: 'ascend', at: 0.4, dur: 0.8 });
  text(slide, 'pour votre attention', { x: 130, y: 450, w: 860, h: 90, size: 72, font: SERIF, italic: true, color: C.violet, name: '!!sub', at: 0.9 });
  hero(slide, 130, 590, 440, 70, 35, C.orange, { at: 1.2 });
  text(slide, 'Questions & échanges', { x: 130, y: 590, w: 440, h: 70, size: 30, font: SEMI, color: C.white, align: 'center', valign: 'middle', name: '!!q', anim: 'zoom', at: 1.2, dur: 0.5 });
  text(slide, `${PRESENTERS[0]}   ·   ${PRESENTERS[1]}`, { x: 130, y: 710, w: 860, h: 50, size: 34, font: SEMI, name: '!!names', anim: 'fly', dir: 'left', at: 1.4 });
  text(slide, SCHOOL, { x: 130, y: 764, w: 860, h: 40, size: 24, color: C.body, name: '!!school', at: 1.5 });
  const lg = uniq('!!logo');
  slide.addImage({ path: LOGO, x: inch(130), y: inch(850), w: inch(90 * LOGO_RATIO), h: inch(90), objectName: lg, altText: SCHOOL });
  enter(lg, 'fade', { at: 1.6, dur: 0.8 });
}

const deckPath = path.join(OUT, process.env.DECK_NAME ?? 'skills-base.pptx');
await pres.writeFile({ fileName: deckPath });
fs.writeFileSync(path.join(OUT, 'skills-anims.json'), JSON.stringify(anims, null, 1));
console.log(`skills deck: ${deckPath} (${slideNo} slides, ${anims.length} animations planned)`);
