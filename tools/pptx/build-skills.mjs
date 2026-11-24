/**
 * Third deck — "Upskilling & Reskilling" (French), light design of its own:
 * "le parcours des compétences". Upskilling = a staircase you climb (emerald),
 * reskilling = a bridge towards a new job (coral), the HR process = a rising
 * path with milestones, figures = progress bars / gauge / pictogram, and a
 * journey bar at the bottom that grows from slide to slide (Morph).
 *
 *   python tools/pptx/make_skills_assets.py
 *   node tools/pptx/build-skills.mjs
 *   powershell -ExecutionPolicy Bypass -File tools/pptx/finalize-native.ps1 -Base skills-base.pptx -Plan skills-anims.json -Output Upskilling-Reskilling-CLAIR.pptx
 *
 * Palette: navy (upskilling), gold (reskilling), slate + greys. Fonts: Segoe UI /
 * Segoe UI Semibold + Segoe MDL2 Assets icons, all shipped with Windows 10/11.
 */
import fs from 'node:fs';
import path from 'node:path';
import pptxgen from 'pptxgenjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'export');
const BG = path.join(OUT, 'skills', 'background.png');
const PEOPLE = path.join(OUT, 'skills');
const LOGO = path.join(ROOT, 'public', 'logo-est-sale.png');
const LOGO_RATIO = 967 / 460;

const C = {
  ink: '1B2A41', body: '4B5563', mute: '8B93A1',
  up: '1F4E8C', upL: 'EAF0F8', upD: '163A69',
  re: 'C2913A', reL: 'F8F1E4', reD: '9A7028',
  gold: 'C2913A', goldD: '9A7028', blue: '3D5A80', blueL: 'E7ECF2',
  track: 'E3E7ED', card: 'FFFFFF',
};
const STAIRS = ['C9D6E8', '9FB5D3', '6E8FBE', '3F6AA3', '1F4E8C'];
const HEAD = 'Segoe UI Semibold';
const BODY = 'Segoe UI';
const ICON = 'Segoe MDL2 Assets'; // Windows line icons (monochrome)
const PRESENTERS = ['Aya Yakoubi', 'Hassna Elhaddajy'];
const SCHOOL = 'École Supérieure de Technologie de Salé';
const TOTAL = 11;

const inch = (v) => v / 144;
const pt = (v) => Math.round(v) / 2;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'Upskilling & Reskilling — développer les compétences';
pres.author = PRESENTERS.join(' & ');
pres.company = SCHOOL;
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };
pres.defineSlideMaster({ title: 'Skills', background: { path: BG }, objects: [] });
const S = pres.shapes;

/* ------------------------------------------------------------------ */
/*  Engine: every object gets a stable "!!name" (Morph pairs them), and  */
/*  an animation plan entry applied later by finalize-native.ps1.        */
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
    bold: o.bold ?? false, fontFace: o.font ?? (o.head ? HEAD : BODY), align: o.align ?? 'left', valign: o.valign ?? 'top',
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
    rectRadius: o.radius, rotate: o.rotate, flipH: o.flipH, angleRange: o.angleRange, arcThicknessRatio: o.arc,
    shadow: o.shadow ? { type: 'outer', color: C.ink, opacity: 0.12, blur: 18, offset: 5, angle: 90 } : undefined,
  });
  if (o.anim) enter(n, o.anim, { dir: o.dir, dur: o.dur, at: o.at });
  return n;
}
function line(slide, x1, y1, x2, y2, name, o = {}) {
  const n = uniq(name);
  slide.addShape(S.LINE, {
    x: inch(Math.min(x1, x2)), y: inch(Math.min(y1, y2)), w: inch(Math.max(1, Math.abs(x2 - x1))), h: inch(Math.max(1, Math.abs(y2 - y1))),
    flipH: x2 < x1, flipV: y2 < y1, objectName: n, line: { color: o.color ?? C.mute, width: o.width ?? 1.5, transparency: o.t ?? 0, dashType: o.dash },
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
/** A person pictogram standing with its feet at (cx, bottom). */
function person(slide, color, cx, bottom, h, name, o = {}) {
  const w = (h * 120) / 170;
  return img(slide, path.join(PEOPLE, `person-${color}.png`), cx - w / 2, bottom - h * 0.9, w, h, name, { alt: 'Salarié', ...o });
}
/** Motion path through points (slide px), relative to the first one. */
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

/** Kicker + title (same names on every slide, so Morph slides them). */
function header(slide, kicker, value, color) {
  text(slide, kicker, { x: 120, y: 70, w: 1500, h: 36, size: 24, bold: true, color, charSpacing: 4, name: '!!kicker', anim: 'fly', dir: 'left', at: 0.1 });
  text(slide, value, { x: 120, y: 106, w: 1560, h: 90, size: 64, head: true, name: '!!title', anim: 'ascend', at: 0.25, dur: 0.7 });
}
/** Journey bar at the bottom: grows from one slide to the next. */
function progress(slide, n) {
  shape(slide, S.ROUNDED_RECTANGLE, 120, 1034, 1560, 8, '!!prog-track', { fill: C.track, radius: 0.5 });
  shape(slide, S.ROUNDED_RECTANGLE, 120, 1034, (1560 * n) / TOTAL, 8, '!!prog', { fill: C.up, radius: 0.5 });
  text(slide, `${String(n).padStart(2, '0')} / ${TOTAL}`, { x: 1700, y: 1018, w: 100, h: 40, size: 22, color: C.mute, align: 'right', name: '!!counter', anim: false });
}
/** White card with a coloured accent bar, a title and a description. */
function card(slide, x, y, w, h, name, o) {
  const a = { anim: o.anim ?? 'fly', dir: o.dir ?? 'bottom', at: o.at, dur: o.dur ?? 0.6 };
  shape(slide, S.ROUNDED_RECTANGLE, x, y, w, h, `${name}`, { fill: C.card, radius: 0.08, shadow: true, ...a });
  shape(slide, S.RECTANGLE, x, y + 18, 8, h - 36, `${name}-bar`, { fill: o.accent, ...a });
  text(slide, o.t, { x: x + 34, y: y + 22, w: w - 60, h: 46, size: o.tSize ?? 30, head: true, color: o.tColor ?? C.ink, name: `${name}-t`, ...a });
  text(slide, o.d, { x: x + 34, y: y + 22 + (o.tSize ?? 30) * 1.55, w: w - 60, h: h - 80, size: o.dSize ?? 23, color: C.body, name: `${name}-d`, ...a });
}
/** Staircase (one rectangle per step: "!!st0"…), returns the top y of each step. */
function stairs(slide, x0, bottom, stepW, heights, colors, o = {}) {
  return heights.map((h, i) => {
    shape(slide, S.RECTANGLE, x0 + i * stepW, bottom - h, stepW, h, `!!st${i}`, { fill: colors[i], anim: 'wipe', dir: 'bottom', at: (o.at ?? 0.5) + i * 0.12, dur: 0.5 });
    return bottom - h;
  });
}
/** Path of someone climbing the staircase: walk to the riser, step up, walk to the middle. */
function climbPoints(x0, stepW, tops) {
  const pts = [[x0 + stepW / 2, tops[0]]];
  for (let i = 1; i < tops.length; i++) {
    const edge = x0 + i * stepW;
    pts.push([edge - 34, tops[i - 1]], [edge + 34, tops[i]], [edge + stepW / 2, tops[i]]);
  }
  return pts;
}
function hexTile(slide, x, y, w, h, name, o) {
  const a = { anim: 'zoom', at: o.at, dur: 0.5 };
  shape(slide, S.HEXAGON, x, y, w, h, name, { fill: C.card, line: o.accent, lineW: 2.25, shadow: true, ...a });
  text(slide, o.emoji, { x, y: y + h * 0.12, w, h: h * 0.26, size: o.emojiSize ?? 60, font: ICON, color: o.accent, align: 'center', valign: 'middle', name: `${name}-e`, ...a });
  text(slide, o.t, { x: x + w * 0.14, y: y + h * 0.4, w: w * 0.72, h: h * 0.2, size: o.tSize ?? 25, head: true, color: o.tColor ?? C.ink, align: 'center', valign: 'middle', name: `${name}-t`, ...a });
  if (o.d) text(slide, o.d, { x: x + w * 0.17, y: y + h * 0.6, w: w * 0.66, h: h * 0.3, size: o.dSize ?? 18, color: C.body, align: 'center', name: `${name}-d`, ...a });
}

/* ------------------------------------------------------------------ */
/*  Slides                                                             */
/* ------------------------------------------------------------------ */

// 1 — Title: a staircase, skill badges, and someone who climbs it
{
  const slide = addSlide('01. Ouverture', N(
    'INTRODUIRE : laisser l’escalier se construire, le personnage monte les marches.',
    'À DIRE : Bonjour, nous sommes Aya Yakoubi et Hassna Elhaddajy. Aujourd’hui, nous présentons l’upskilling et le reskilling : deux façons de développer les compétences des salariés pour accompagner le changement dans l’organisation.',
    'L’image de l’escalier résume le sujet : apprendre, c’est monter marche après marche.',
    'TRANSITION : « Pourquoi en parle-t-on autant aujourd’hui ? »',
  ));
  text(slide, 'RESSOURCES HUMAINES', { x: 120, y: 230, w: 800, h: 40, size: 26, bold: true, color: C.up, charSpacing: 8, name: '!!kicker', anim: 'fly', dir: 'left', at: 0.2 });
  text(slide, [{ text: 'Upskilling', options: { color: C.up, breakLine: true } }, { text: '& Reskilling', options: { color: C.re } }], { x: 120, y: 280, w: 900, h: 320, size: 128, head: true, ls: 0.95, name: '!!title', anim: 'ascend', at: 0.4, dur: 0.9 });
  text(slide, 'Développer les compétences pour réussir le changement', { x: 120, y: 610, w: 840, h: 50, size: 32, color: C.body, name: '!!sub', at: 1.2 });
  text(slide, 'PRÉSENTÉ PAR', { x: 120, y: 740, w: 400, h: 34, size: 22, bold: true, color: C.mute, charSpacing: 6, name: '!!by', at: 1.5 });
  text(slide, PRESENTERS.join('   ·   '), { x: 120, y: 776, w: 860, h: 60, size: 42, head: true, name: '!!names', anim: 'fly', dir: 'left', at: 1.6 });
  const lg = uniq('!!logo');
  slide.addImage({ path: LOGO, x: inch(120), y: inch(880), w: inch(100 * LOGO_RATIO), h: inch(100), objectName: lg, altText: SCHOOL });
  enter(lg, 'fade', { at: 1.8, dur: 0.8 });

  const [x0, stepW, bottom] = [1040, 150, 930];
  const tops = stairs(slide, x0, bottom, stepW, [110, 200, 290, 380, 470], STAIRS, { at: 0.5 });
  ['E82F', 'E9D2', 'E902', 'E7BE', 'E734'].map((c) => String.fromCodePoint(parseInt(c, 16))).forEach((e, i) => {
    const bx = x0 + i * stepW + 30;
    const by = tops[i] - 260;
    const b = shape(slide, S.HEXAGON, bx, by, 90, 78, `!!badge${i}`, { fill: C.card, line: C.gold, lineW: 2.5, shadow: true, anim: 'zoom', at: 1.2 + i * 0.15, dur: 0.5 });
    text(slide, e, { x: bx, y: by + 10, w: 90, h: 58, size: 36, font: ICON, color: C.gold, align: 'center', valign: 'middle', name: `!!badge${i}-e`, anim: 'zoom', at: 1.2 + i * 0.15, dur: 0.5 });
    ambient(b, 'path', { dur: 1.6 + (i % 2) * 0.4, path: 'M 0 0 L 0 -0.008 E', reverse: true, delay: i * 0.2 });
    ambient(`!!badge${i}-e`, 'path', { dur: 1.6 + (i % 2) * 0.4, path: 'M 0 0 L 0 -0.008 E', reverse: true, delay: i * 0.2 });
  });
  const p = person(slide, 'navy', x0 + stepW / 2, tops[0], 130, '!!climber', { anim: 'fade', at: 1.1 });
  ambient(p, 'path', { dur: 4.2, delay: 2.2, path: pathOf(climbPoints(x0, stepW, tops)), repeat: 1, smooth: true });
  progress(slide, 1);
}

// 2 — Context: why skills must change now
{
  const slide = addSlide('02. Contexte', N(
    'INTRODUIRE : le monde du travail change plus vite que jamais.',
    'À DIRE : l’intelligence artificielle, l’automatisation, la transition numérique et écologique transforment les métiers. Certains disparaissent, d’autres apparaissent, et presque tous évoluent. En même temps, les entreprises manquent de talents qualifiés.',
    'Selon le Forum économique mondial (Future of Jobs 2023), 44 % des compétences des salariés vont être bouleversées d’ici 2027.',
    'TRANSITION : « Deux réponses existent : l’upskilling et le reskilling. Quelle est la différence ? »',
  ));
  header(slide, 'LE CONTEXTE', 'Pourquoi maintenant ?', C.re);
  [['\uE99A', 'Intelligence artificielle'], ['\uE713', 'Automatisation'], ['\uE770', 'Transition numérique'], ['\uE909', 'Transition écologique'], ['\uE8FA', 'Pénurie de talents'], ['\uE82F', 'Nouveaux métiers']].forEach(([e, t], i) => {
    const c = i % 3;
    const r = Math.floor(i / 3);
    hexTile(slide, 120 + c * 262, 250 + r * 236 + (c === 1 ? 118 : 0), 250, 216, `!!hx${i}`, { emoji: e, t, accent: i % 2 ? C.re : C.up, at: 0.5 + i * 0.12, tSize: 24 });
  });
  text(slide, '44 %', { x: 1000, y: 240, w: 290, h: 120, size: 112, head: true, color: C.up, name: '!!stat', anim: 'zoom', at: 1.3 });
  text(slide, 'des compétences des salariés vont être bouleversées d’ici 2027', { x: 1300, y: 256, w: 500, h: 80, size: 26, color: C.ink, name: '!!stat-t', at: 1.4 });
  text(slide, 'WEF, Future of Jobs 2023', { x: 1300, y: 340, w: 500, h: 30, size: 20, color: C.mute, name: '!!stat-s', at: 1.5 });
  shape(slide, S.ROUNDED_RECTANGLE, 1000, 392, 800, 22, '!!bar-track', { fill: C.track, radius: 0.5, anim: 'fade', at: 1.3 });
  shape(slide, S.ROUNDED_RECTANGLE, 1000, 392, 800 * 0.44, 22, '!!bar', { fill: C.up, radius: 0.5, anim: 'wipe', dir: 'left', at: 1.5, dur: 1.4 });
  card(slide, 1000, 470, 800, 190, '!!ctx0', { accent: C.up, t: 'Les salariés', d: 'doivent rester employables dans un métier qui change.', dir: 'right', at: 2.1 });
  card(slide, 1000, 690, 800, 190, '!!ctx1', { accent: C.re, t: 'Les entreprises', d: 'doivent trouver les compétences de demain sans tout recruter.', dir: 'right', at: 2.4 });
  progress(slide, 2);
}

// 3 — Definitions: climbing (up) vs changing path (re)
{
  const slide = addSlide('03. Définitions', N(
    'INTRODUIRE : deux notions proches mais différentes.',
    'À DIRE : l’upskilling, c’est « monter en compétences » : on reste dans son métier, mais on devient plus expert (l’escalier). Exemple : un comptable qui apprend Power BI.',
    'Le reskilling, c’est « se reconvertir » : on change de voie pour un nouveau métier (la flèche qui bifurque). Exemple : un caissier qui devient conseiller client digital.',
    'TRANSITION : « Commençons par l’upskilling. »',
  ));
  header(slide, 'DÉFINITIONS', 'Upskilling ou reskilling ?', C.blue);
  const COLS = [
    { x: 120, bg: C.upL, color: C.up, head: 'UPSKILLING', sub: 'Monter en compétences', dir: 'left', rows: [['Objectif', 'Se perfectionner dans son métier'], ['Poste', 'Le même, qui évolue'], ['Durée', 'Formations courtes et continues'], ['Exemple', 'Comptable → Power BI']] },
    { x: 1000, bg: C.reL, color: C.re, head: 'RESKILLING', sub: 'Se reconvertir', dir: 'right', rows: [['Objectif', 'Apprendre un nouveau métier'], ['Poste', 'Un nouveau poste'], ['Durée', 'Parcours plus long'], ['Exemple', 'Caissier → conseiller digital']] },
  ];
  COLS.forEach((c, i) => {
    const at = 0.5 + i * 0.4;
    shape(slide, S.ROUNDED_RECTANGLE, c.x, 230, 800, 770, `!!panel${i}`, { fill: c.bg, radius: 0.05, anim: 'fly', dir: c.dir, at, dur: 0.7 });
    if (i === 0) stairs(slide, 170, 362, 36, [24, 44, 64, 84, 104], STAIRS, { at: at + 0.3 });
    else shape(slide, S.BENT_ARROW, 1050, 262, 120, 100, '!!fork', { fill: C.re, anim: 'wipe', dir: 'bottom', at: at + 0.3 });
    text(slide, c.head, { x: c.x + 260, y: 258, w: 520, h: 64, size: 56, head: true, color: c.color, name: `!!def-h${i}`, anim: 'fly', dir: c.dir, at: at + 0.2, dur: 0.6 });
    text(slide, c.sub, { x: c.x + 260, y: 322, w: 520, h: 40, size: 28, color: C.body, name: `!!def-s${i}`, anim: 'fly', dir: c.dir, at: at + 0.2, dur: 0.6 });
    c.rows.forEach(([lab, val], j) => {
      const y = 430 + j * 136;
      const rAt = at + 0.7 + j * 0.15;
      line(slide, c.x + 50, y - 18, c.x + 750, y - 18, `!!def-sep${i}-${j}`, { color: c.color, width: 1, t: 60, at: rAt - 0.05 });
      text(slide, lab.toUpperCase(), { x: c.x + 50, y, w: 700, h: 32, size: 21, bold: true, color: c.color, charSpacing: 3, name: `!!def-l${i}-${j}`, at: rAt });
      text(slide, val, { x: c.x + 50, y: y + 36, w: 700, h: 52, size: 36, head: true, name: `!!def-v${i}-${j}`, anim: 'fly', dir: 'bottom', at: rAt, dur: 0.5 });
    });
  });
  const vs = shape(slide, S.OVAL, 900, 555, 120, 120, '!!vs', { fill: C.ink, line: 'FFFFFF', lineW: 3, anim: 'zoom', at: 1.6, dur: 0.6 });
  text(slide, 'VS', { x: 900, y: 585, w: 120, h: 60, size: 40, head: true, color: 'FFFFFF', align: 'center', valign: 'middle', name: '!!vs-t', anim: 'zoom', at: 1.6, dur: 0.6 });
  ambient(vs, 'pulse', { dur: 1.4, by: 108, reverse: true, delay: 2.2 });
  progress(slide, 3);
}

// 4 — Upskilling: climbing the steps of one's own job
{
  const slide = addSlide('04. Upskilling', N(
    'INTRODUIRE : première notion, l’upskilling : on monte les marches de son propre métier.',
    'À DIRE : chaque marche est une idée clé. Définition : renforcer et actualiser ses compétences. Le métier reste le même mais il évolue (outils, méthodes, normes). Exemples : un comptable qui apprend Power BI, un commercial qui maîtrise le CRM et l’IA. Objectif : rester performant et employable.',
    'Chiffre : 44 % des compétences vont être bouleversées d’ici 2027 (WEF 2023).',
    'TRANSITION : « Mais parfois, monter les marches ne suffit plus : il faut changer de voie. »',
  ));
  header(slide, 'UPSKILLING · MONTER EN COMPÉTENCES', 'Gravir les marches de son métier', C.up);
  const [x0, stepW, bottom] = [120, 330, 990];
  const LEAVES = [
    ['Définition', 'Renforcer et actualiser ses compétences.'],
    ['Même métier', 'Le poste évolue : outils, méthodes, normes.'],
    ['Exemples', 'Comptable → Power BI ; commercial → CRM et IA.'],
    ['Objectif', 'Rester performant et employable.'],
  ];
  const tops = stairs(slide, x0, bottom, stepW, [150, 270, 390, 510], STAIRS.slice(1), { at: 0.5 });
  LEAVES.forEach(([t, d], i) => {
    const x = x0 + i * stepW;
    text(slide, `${i + 1}. ${t}`, { x: x + 24, y: tops[i] + 18, w: stepW - 48, h: 40, size: 28, head: true, color: 'FFFFFF', name: `!!up-t${i}`, at: 0.9 + i * 0.2 });
    text(slide, d, { x: x + 24, y: tops[i] + 60, w: stepW - 48, h: 80, size: 21, color: 'FFFFFF', name: `!!up-d${i}`, at: 1.0 + i * 0.2 });
  });
  const p = person(slide, 'navy', x0 + stepW / 2, tops[0], 140, '!!climber', { anim: 'fade', at: 1.6 });
  ambient(p, 'path', { dur: 4.5, delay: 2.2, path: pathOf(climbPoints(x0, stepW, tops)), repeat: 1, smooth: true });
  // vertical gauge on the right
  text(slide, '44 %', { x: 1470, y: 220, w: 340, h: 110, size: 104, head: true, color: C.up, align: 'center', name: '!!stat', anim: 'zoom', at: 1.2 });
  text(slide, 'des compétences bouleversées d’ici 2027', { x: 1470, y: 332, w: 340, h: 80, size: 24, align: 'center', name: '!!stat-t', at: 1.3 });
  text(slide, 'WEF, Future of Jobs 2023', { x: 1470, y: 414, w: 340, h: 30, size: 19, color: C.mute, align: 'center', name: '!!stat-s', at: 1.4 });
  shape(slide, S.ROUNDED_RECTANGLE, 1610, 480, 60, 450, '!!vbar-track', { fill: C.track, radius: 0.5, anim: 'fade', at: 1.2 });
  shape(slide, S.ROUNDED_RECTANGLE, 1610, 930 - 450 * 0.44, 60, 450 * 0.44, '!!vbar', { fill: C.up, radius: 0.5, anim: 'wipe', dir: 'bottom', at: 1.5, dur: 1.4 });
  progress(slide, 4);
}

// 5 — Reskilling: a bridge towards a new job
{
  const slide = addSlide('05. Reskilling', N(
    'INTRODUIRE : deuxième notion, le reskilling : on traverse un pont vers un nouveau métier.',
    'À DIRE : on part d’un métier menacé (par l’automatisation, une suppression de poste…) et on arrive à un nouveau métier, en passant par trois étapes : diagnostic, formation, accompagnement.',
    'Chiffre : 6 salariés sur 10 auront besoin d’une formation d’ici 2027 (WEF 2023). Exemple : un caissier qui devient conseiller client digital. Objectif pour l’entreprise : garder les talents au lieu de licencier puis recruter.',
    'TRANSITION : « Comment les RH organisent-elles tout cela ? »',
  ));
  header(slide, 'RESKILLING · SE RECONVERTIR', 'Changer de voie sans quitter l’entreprise', C.re);
  const job = (x, name, label, t, d, accent, dir, at) => {
    shape(slide, S.ROUNDED_RECTANGLE, x, 300, 380, 230, name, { fill: C.card, line: accent, lineW: 2, radius: 0.1, shadow: true, anim: 'fly', dir, at });
    text(slide, label, { x: x + 30, y: 326, w: 320, h: 30, size: 20, bold: true, color: accent, charSpacing: 4, name: `${name}-l`, anim: 'fly', dir, at });
    text(slide, t, { x: x + 30, y: 362, w: 320, h: 50, size: 36, head: true, name: `${name}-t`, anim: 'fly', dir, at });
    text(slide, d, { x: x + 30, y: 420, w: 320, h: 90, size: 23, color: C.body, name: `${name}-d`, anim: 'fly', dir, at });
  };
  job(120, '!!job0', 'AUJOURD’HUI', 'Métier menacé', 'ex. caissier·ère, opérateur·rice', C.mute, 'left', 0.5);
  job(1420, '!!job1', 'DEMAIN', 'Nouveau métier', 'ex. conseiller·ère client digital', C.re, 'right', 0.7);
  const STONES = [[720, 460, 'Diagnostic', 'D2B072'], [960, 390, 'Formation', C.re], [1200, 460, 'Accompagnement', C.reD]];
  [[500, 400, 620, 450], [820, 440, 860, 400], [1060, 400, 1100, 440], [1300, 450, 1420, 400]].forEach(([a, b, c, d], i) => line(slide, a, b, c, d, `!!br-l${i}`, { color: C.re, width: 2.5, dash: 'dash', at: 1.0 + i * 0.3 }));
  STONES.forEach(([cx, cy, t, fill], i) => {
    shape(slide, S.HEXAGON, cx - 112, cy - 96, 224, 192, `!!stone${i}`, { fill, shadow: true, anim: 'zoom', at: 1.1 + i * 0.3, dur: 0.5 });
    text(slide, t, { x: cx - 108, y: cy - 22, w: 216, h: 44, size: 21, head: true, color: 'FFFFFF', align: 'center', valign: 'middle', name: `!!stone${i}-t`, anim: 'zoom', at: 1.1 + i * 0.3, dur: 0.5 });
  });
  const pts = [[310, 300], [720, 373], [960, 303], [1200, 373], [1610, 300]];
  const p = person(slide, 'gold', pts[0][0], pts[0][1], 105, '!!walker', { anim: 'fade', at: 1.9 });
  ambient(p, 'path', { dur: 4.2, delay: 2.3, path: pathOf(pts), repeat: 1, smooth: true });
  // 6 out of 10 pictogram
  text(slide, '6 / 10', { x: 300, y: 572, w: 330, h: 100, size: 92, head: true, color: C.re, align: 'right', name: '!!stat', anim: 'zoom', at: 2.0 });
  for (let i = 0; i < 10; i++) person(slide, i < 6 ? 'gold' : 'grey', 690 + i * 62, 668, 86, `!!pic${i}`, { anim: 'zoom', at: 2.1 + i * 0.07, dur: 0.35 });
  text(slide, 'salariés auront besoin d’une formation d’ici 2027', { x: 1310, y: 592, w: 500, h: 60, size: 23, name: '!!stat-t', at: 2.4 });
  text(slide, 'WEF, Future of Jobs 2023', { x: 1310, y: 654, w: 500, h: 30, size: 19, color: C.mute, name: '!!stat-s', at: 2.5 });
  [['Définition', 'Acquérir de nouvelles compétences pour un autre métier.'], ['Quand ?', 'Métier automatisé, poste supprimé, nouveaux besoins.'], ['Exemple', 'Caissier → conseiller client digital.'], ['Objectif', 'Garder les talents en interne.']].forEach(([t, d], i) => {
    card(slide, 120 + i * 427, 750, 400, 210, `!!re-c${i}`, { accent: C.re, t, d, at: 2.8 + i * 0.15, tSize: 30, dSize: 22 });
  });
  progress(slide, 5);
}

// 6 — The HR process: a rising path with 5 milestones
{
  const slide = addSlide('06. Démarche RH', N(
    'INTRODUIRE : comment les RH mettent en place l’upskilling et le reskilling : un chemin qui monte, en cinq étapes.',
    'À DIRE : 1) cartographier les compétences actuelles ; 2) anticiper les besoins futurs (GPEC / GEPP) ; 3) identifier les écarts, le « skills gap » ; 4) construire les parcours (upskilling ou reskilling selon chacun) ; 5) évaluer et suivre.',
    'Chiffre : 39 % des compétences clés vont changer d’ici 2030 (WEF, Future of Jobs 2025) : il faut anticiper.',
    'TRANSITION : « Concrètement, comment forme-t-on ? »',
  ));
  header(slide, 'LA DÉMARCHE RH', 'Un chemin en 5 étapes', C.blue);
  const X = [220, 580, 940, 1300, 1660];
  const Y = [770, 670, 570, 470, 370];
  const FILLS = ['9FB5D3', '6E8FBE', '3F6AA3', '1F4E8C', '163A69'];
  const STEPS = [
    ['Cartographier', 'Les compétences d’aujourd’hui'],
    ['Anticiper', 'Les besoins de demain (GPEC)'],
    ['Mesurer l’écart', 'Le « skills gap »'],
    ['Construire', 'Upskilling ou reskilling'],
    ['Évaluer', 'Suivre et valoriser les progrès'],
  ];
  for (let i = 0; i < 4; i++) line(slide, X[i], Y[i], X[i + 1], Y[i + 1], `!!path${i}`, { color: C.blue, width: 4, t: 30, at: 0.6 + i * 0.35, dur: 0.4 });
  STEPS.forEach(([t, d], i) => {
    const at = 0.5 + i * 0.35;
    const c = shape(slide, S.OVAL, X[i] - 60, Y[i] - 60, 120, 120, `!!ms${i}`, { fill: FILLS[i], line: 'FFFFFF', lineW: 4, shadow: true, anim: 'zoom', at, dur: 0.5 });
    text(slide, String(i + 1), { x: X[i] - 60, y: Y[i] - 36, w: 120, h: 72, size: 56, head: true, color: 'FFFFFF', align: 'center', valign: 'middle', name: `!!ms${i}-n`, anim: 'zoom', at, dur: 0.5 });
    text(slide, t, { x: X[i] - 170, y: Y[i] + 76, w: 340, h: 44, size: 30, head: true, align: 'center', name: `!!ms${i}-t`, anim: 'fly', dir: 'bottom', at: at + 0.15 });
    text(slide, d, { x: X[i] - 170, y: Y[i] + 120, w: 340, h: 70, size: 22, color: C.body, align: 'center', name: `!!ms${i}-d`, anim: 'fly', dir: 'bottom', at: at + 0.2 });
    if (i === 4) ambient(c, 'pulse', { dur: 1.3, by: 110, reverse: true, delay: 2.6 });
  });
  const flag = text(slide, '\uE7C1', { x: 1700, y: 236, w: 90, h: 90, size: 60, font: ICON, color: C.re, align: 'center', name: '!!flag', anim: 'zoom', at: 2.3 });
  ambient(flag, 'teeter', { dur: 1, delay: 2.8 });
  text(slide, '39 %', { x: 120, y: 236, w: 280, h: 120, size: 108, head: true, color: C.blue, name: '!!stat', anim: 'zoom', at: 2.0 });
  text(slide, 'des compétences clés vont changer d’ici 2030', { x: 410, y: 254, w: 560, h: 50, size: 26, name: '!!stat-t', at: 2.1 });
  text(slide, 'WEF, Future of Jobs 2025', { x: 410, y: 300, w: 560, h: 30, size: 19, color: C.mute, name: '!!stat-s', at: 2.2 });
  shape(slide, S.ROUNDED_RECTANGLE, 120, 376, 760, 18, '!!bar-track', { fill: C.track, radius: 0.5, anim: 'fade', at: 2.0 });
  shape(slide, S.ROUNDED_RECTANGLE, 120, 376, 760 * 0.39, 18, '!!bar', { fill: C.blue, radius: 0.5, anim: 'wipe', dir: 'left', at: 2.2, dur: 1.2 });
  progress(slide, 6);
}

// 7 — Formats & tools: a honeycomb of ways to learn
{
  const slide = addSlide('07. Formats & outils', N(
    'INTRODUIRE : il existe plusieurs façons d’apprendre ; on les combine.',
    'À DIRE : le digital learning (e-learning, MOOC, micro-learning) ; l’apprentissage en situation (tutorat, mentorat, projets, mobilité interne) ; le blended learning (présentiel + distanciel) ; les certifications. Au Maroc, la formation continue peut être financée par les Contrats Spéciaux de Formation (CSF).',
    'Exemple célèbre : Amazon a investi 700 millions de dollars pour former 100 000 salariés (programme Upskilling 2025).',
    'TRANSITION : « Qu’est-ce que cela apporte, et quelles sont les difficultés ? »',
  ));
  header(slide, 'FORMATS & OUTILS', 'Des façons variées d’apprendre', C.goldD);
  const TILES = [
    ['\uE770', 'Digital learning', 'E-learning, MOOC, micro-learning', C.up],
    ['\uE902', 'En situation', 'Tutorat, mentorat, mobilité interne', C.re],
    ['\uE81E', 'Blended learning', 'Présentiel + distanciel', C.gold],
    ['\uE7BE', 'Certifications', 'Diplômes, certificats, badges', C.blue],
    ['\uE707', 'Au Maroc', 'Formation continue financée par les CSF', C.up],
  ];
  TILES.forEach(([e, t, d, accent], i) => hexTile(slide, 120 + i * 340, i % 2 ? 420 : 236, 320, 290, `!!fm${i}`, { emoji: e, t, d, accent, at: 0.5 + i * 0.15, emojiSize: 58, tSize: 27, dSize: 19 }));
  shape(slide, S.ROUNDED_RECTANGLE, 360, 790, 1200, 180, '!!amz', { fill: C.card, radius: 0.12, shadow: true, anim: 'fly', dir: 'bottom', at: 1.7 });
  shape(slide, S.RECTANGLE, 360, 808, 8, 144, '!!amz-bar', { fill: C.gold, anim: 'fly', dir: 'bottom', at: 1.7 });
  text(slide, '700 M$', { x: 400, y: 812, w: 380, h: 120, size: 100, head: true, color: C.goldD, name: '!!stat', anim: 'fly', dir: 'bottom', at: 1.7, dur: 0.6 });
  text(slide, 'investis par Amazon pour former 100 000 salariés aux métiers de demain', { x: 800, y: 826, w: 730, h: 80, size: 27, name: '!!stat-t', anim: 'fly', dir: 'bottom', at: 1.7, dur: 0.6 });
  text(slide, 'Programme « Upskilling 2025 »', { x: 800, y: 912, w: 730, h: 30, size: 19, color: C.mute, name: '!!stat-s', anim: 'fly', dir: 'bottom', at: 1.7, dur: 0.6 });
  progress(slide, 7);
}

// 8 — Benefits & challenges, with a 94 % gauge
{
  const slide = addSlide('08. Bénéfices & défis', N(
    'INTRODUIRE : l’upskilling et le reskilling sont gagnant-gagnant… à certaines conditions.',
    'À DIRE : pour le salarié, plus d’employabilité, de motivation et d’évolution ; pour l’entreprise, des compétences disponibles, des talents fidélisés et moins de recrutements coûteux.',
    'Mais il y a des défis : le temps et le budget, et la résistance au changement (peur de l’échec), d’où le rôle clé des managers.',
    'Chiffre : selon LinkedIn (2019), 94 % des salariés resteraient plus longtemps dans une entreprise qui investit dans leur formation.',
    'TRANSITION : « Récapitulons tout le parcours. »',
  ));
  header(slide, 'BÉNÉFICES & DÉFIS', 'Gagnant-gagnant… à certaines conditions', C.up);
  text(slide, '✔  BÉNÉFICES', { x: 120, y: 240, w: 560, h: 40, size: 26, bold: true, color: C.up, charSpacing: 4, name: '!!col0', at: 0.5 });
  text(slide, '⚠  DÉFIS', { x: 1240, y: 240, w: 560, h: 40, size: 26, bold: true, color: C.re, charSpacing: 4, name: '!!col1', at: 0.7 });
  card(slide, 120, 300, 560, 210, '!!bn0', { accent: C.up, t: 'Pour le salarié', d: 'Employabilité, motivation, évolution de carrière.', dir: 'left', at: 0.6 });
  card(slide, 120, 540, 560, 210, '!!bn1', { accent: C.up, t: 'Pour l’entreprise', d: 'Compétences disponibles, fidélisation, moins de recrutements.', dir: 'left', at: 0.8 });
  card(slide, 1240, 300, 560, 210, '!!df0', { accent: C.re, t: 'Temps et budget', d: 'Former demande du temps et un vrai investissement.', dir: 'right', at: 0.9 });
  card(slide, 1240, 540, 560, 210, '!!df1', { accent: C.re, t: 'Résistance au changement', d: 'Peur de l’échec : accompagner et impliquer les managers.', dir: 'right', at: 1.1 });
  shape(slide, S.BLOCK_ARC, 760, 290, 400, 400, '!!g-track', { fill: C.track, angleRange: [0, 359.9], arc: 0.36, anim: 'fade', at: 1.3 });
  shape(slide, S.BLOCK_ARC, 760, 290, 400, 400, '!!gauge', { fill: C.up, angleRange: [270, 248.4], arc: 0.36, anim: 'wheel', at: 1.5, dur: 1.6 });
  text(slide, '94 %', { x: 760, y: 430, w: 400, h: 120, size: 100, head: true, color: C.up, align: 'center', valign: 'middle', name: '!!stat', anim: 'zoom', at: 1.6 });
  text(slide, 'des salariés resteraient plus longtemps dans une entreprise qui investit dans leur formation', { x: 720, y: 720, w: 480, h: 110, size: 23, align: 'center', name: '!!stat-t', at: 2.4 });
  text(slide, 'LinkedIn, Workplace Learning Report 2019', { x: 720, y: 836, w: 480, h: 30, size: 19, color: C.mute, align: 'center', name: '!!stat-s', at: 2.5 });
  progress(slide, 8);
}

// 9 — Synthesis: the complete journey
{
  const slide = addSlide('09. Synthèse', N(
    'INTRODUIRE : voici le parcours complet, de l’anticipation à la fidélisation.',
    'À DIRE : on anticipe les compétences de demain, on diagnostique les écarts, on forme (upskilling pour monter en compétences, reskilling pour changer de métier), on accompagne avec les managers et les tuteurs, puis on évalue et on fidélise.',
    'TRANSITION : « Que faut-il retenir ? »',
  ));
  header(slide, 'SYNTHÈSE', 'Le parcours complet des compétences', C.blue);
  const STEPS = [
    ['Anticiper', 'Les compétences de demain', '6E8FBE'],
    ['Diagnostiquer', 'Cartographie et skills gap', '3F6AA3'],
    ['Former', null, C.up],
    ['Accompagner', 'Managers et tuteurs', '163A69'],
    ['Fidéliser', 'Évaluer, valoriser, garder', C.re],
  ];
  STEPS.forEach(([t, d, fill], i) => {
    const x = 120 + i * 336;
    const at = 0.5 + i * 0.25;
    shape(slide, i === 0 ? S.PENTAGON : S.CHEVRON, x, 470, 360, 150, `!!chev${i}`, { fill, anim: 'wipe', dir: 'left', at, dur: 0.45 });
    text(slide, t, { x: x + 50, y: 520, w: 270, h: 50, size: 32, head: true, color: 'FFFFFF', align: 'center', valign: 'middle', name: `!!chev${i}-t`, anim: 'wipe', dir: 'left', at, dur: 0.45 });
    if (d) text(slide, d, { x: x + 30, y: 650, w: 300, h: 70, size: 23, color: C.body, align: 'center', name: `!!chev${i}-d`, anim: 'fly', dir: 'bottom', at: at + 0.15 });
  });
  shape(slide, S.ROUNDED_RECTANGLE, 795, 650, 170, 54, '!!tag-up', { fill: C.up, radius: 0.5, anim: 'zoom', at: 1.2 });
  text(slide, 'Upskilling', { x: 795, y: 650, w: 170, h: 54, size: 23, head: true, color: 'FFFFFF', align: 'center', valign: 'middle', name: '!!tag-up-t', anim: 'zoom', at: 1.2 });
  shape(slide, S.ROUNDED_RECTANGLE, 975, 650, 170, 54, '!!tag-re', { fill: C.re, radius: 0.5, anim: 'zoom', at: 1.3 });
  text(slide, 'Reskilling', { x: 975, y: 650, w: 170, h: 54, size: 23, head: true, color: 'FFFFFF', align: 'center', valign: 'middle', name: '!!tag-re-t', anim: 'zoom', at: 1.3 });
  const p = person(slide, 'navy', 200, 470, 120, '!!walker', { anim: 'fade', at: 1.8 });
  ambient(p, 'path', { dur: 5, delay: 2.1, path: pathOf([[200, 470], [1720, 470]]), repeat: 1, smooth: true });
  const trophy = text(slide, '\uE734', { x: 1690, y: 330, w: 100, h: 90, size: 60, font: ICON, color: C.re, align: 'center', name: '!!trophy', anim: 'zoom', at: 6.8 });
  ambient(trophy, 'pulse', { dur: 1.2, by: 115, reverse: true, delay: 7.2 });
  text(slide, 'Un salarié qui apprend en continu fait grandir toute l’organisation.', { x: 120, y: 820, w: 1680, h: 60, size: 34, head: true, color: C.ink, align: 'center', name: '!!quote', at: 2.0 });
  progress(slide, 9);
}

// 10 — Conclusion: three rising pillars
{
  const slide = addSlide('10. Conclusion', N(
    'INTRODUIRE : l’upskilling et le reskilling ne sont pas de simples formations, ce sont une stratégie RH.',
    'À DIRE : anticiper les compétences de demain, former les salariés, et ainsi fidéliser des talents qui évoluent avec l’entreprise. C’est le lien direct avec notre cours : le changement et l’apprentissage dans les organisations.',
    'TRANSITION : « Merci pour votre attention. »',
  ));
  header(slide, 'CONCLUSION', 'Apprendre en continu : une stratégie RH', C.up);
  const P = [['Anticiper', 'les compétences de demain', C.blue], ['Former', 'upskilling & reskilling', C.up], ['Fidéliser', 'des talents qui évoluent', C.re]];
  const H = [300, 400, 500];
  P.forEach(([t, d, fill], i) => {
    const x = 330 + i * 440;
    const top = 830 - H[i];
    const at = 0.5 + i * 0.35;
    shape(slide, S.RECTANGLE, x, top, 380, H[i], `!!st${i}`, { fill, anim: 'wipe', dir: 'bottom', at, dur: 0.6 });
    text(slide, String(i + 1), { x, y: top + 26, w: 380, h: 90, size: 84, head: true, color: 'FFFFFF', align: 'center', name: `!!pl${i}-n`, anim: 'zoom', at: at + 0.3 });
    text(slide, t, { x, y: top + 128, w: 380, h: 56, size: 44, head: true, color: 'FFFFFF', align: 'center', name: `!!pl${i}-t`, at: at + 0.35 });
    text(slide, d, { x: x + 20, y: top + 190, w: 340, h: 60, size: 25, color: 'FFFFFF', align: 'center', name: `!!pl${i}-d`, at: at + 0.4 });
  });
  const star = text(slide, '\uE734', { x: 1220, y: 216, w: 100, h: 100, size: 60, font: ICON, color: C.re, align: 'center', name: '!!star', anim: 'zoom', at: 1.8 });
  ambient(star, 'spin', { dur: 6, by: 360, delay: 2.3 });
  shape(slide, S.ROUNDED_RECTANGLE, 240, 870, 1440, 110, '!!take', { fill: C.card, radius: 0.15, shadow: true, anim: 'fly', dir: 'bottom', at: 2.0 });
  shape(slide, S.RECTANGLE, 240, 890, 8, 70, '!!take-bar', { fill: C.gold, anim: 'fly', dir: 'bottom', at: 2.0 });
  text(slide, 'À retenir : la compétence est le capital le plus durable de l’entreprise', { x: 280, y: 898, w: 1380, h: 56, size: 34, head: true, align: 'center', valign: 'middle', name: '!!take-t', anim: 'fly', dir: 'bottom', at: 2.0, dur: 0.6 });
  progress(slide, 10);
}

// 11 — Thanks: back to the staircase, the climber waves from the top
{
  const slide = addSlide('11. Questions', N(
    'INTRODUIRE : remercier et ouvrir les échanges.',
    'Pistes : quelle différence entre formation classique et upskilling ? Qui doit payer la formation, le salarié ou l’entreprise ? Quels métiers sont les plus concernés au Maroc ? L’IA va-t-elle remplacer ou transformer les métiers ?',
  ));
  text(slide, [{ text: 'Merci', options: { color: C.up, breakLine: true } }, { text: 'pour votre attention', options: { color: C.ink } }], { x: 120, y: 200, w: 980, h: 260, size: 84, head: true, ls: 0.95, name: '!!title', anim: 'ascend', at: 0.4, dur: 0.8 });
  text(slide, 'Questions & échanges', { x: 120, y: 470, w: 860, h: 60, size: 40, head: true, color: C.re, name: '!!sub', at: 1.0 });
  text(slide, PRESENTERS.join('   ·   '), { x: 120, y: 600, w: 860, h: 50, size: 34, head: true, name: '!!names', anim: 'fly', dir: 'left', at: 1.2 });
  text(slide, SCHOOL, { x: 120, y: 656, w: 860, h: 40, size: 24, color: C.body, name: '!!school', at: 1.3 });
  const lg = uniq('!!logo');
  slide.addImage({ path: LOGO, x: inch(120), y: inch(760), w: inch(100 * LOGO_RATIO), h: inch(100), objectName: lg, altText: SCHOOL });
  enter(lg, 'fade', { at: 1.4, dur: 0.8 });
  const [x0, stepW, bottom] = [1040, 150, 930];
  const tops = stairs(slide, x0, bottom, stepW, [110, 200, 290, 380, 470], STAIRS, { at: 0.4 });
  const p = person(slide, 'navy', x0 + 4.5 * stepW, tops[4], 130, '!!climber', { anim: 'zoom', at: 1.2 });
  ambient(p, 'teeter', { dur: 1.2, delay: 1.8 });
  progress(slide, 11);
}

const deckPath = path.join(OUT, process.env.DECK_NAME ?? 'skills-base.pptx');
await pres.writeFile({ fileName: deckPath });
fs.writeFileSync(path.join(OUT, 'skills-anims.json'), JSON.stringify(anims, null, 1));
console.log(`skills deck: ${deckPath} (${slideNo} slides, ${anims.length} animations planned)`);
