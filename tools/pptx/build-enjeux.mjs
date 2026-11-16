/**
 * Second deck — "Les 5 grands enjeux RH de 2023" as an animated concept map
 * (content from the Bleexo webinar). Native PowerPoint shapes only; every
 * map element keeps the same name across slides so Morph zooms from the
 * full map into each branch and back. Animation plan → export/enjeux-anims.json,
 * applied by finalize-native.ps1:
 *
 *   node tools/pptx/build-enjeux.mjs
 *   powershell -ExecutionPolicy Bypass -File tools/pptx/finalize-native.ps1 -Base enjeux-base.pptx -Plan enjeux-anims.json -Output Enjeux-RH-2023-carte-conceptuelle.pptx
 */
import fs from 'node:fs';
import path from 'node:path';
import pptxgen from 'pptxgenjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'export');
const icon = (n) => path.join(OUT, 'native', `${n}.png`);
const LOGO = path.join(ROOT, 'public', 'logo-est-sale.png');
const LOGO_RATIO = 967 / 460;
const inch = (v) => v / 144;
const ptOf = (v, min = 12) => Math.max(min, Math.round(v) / 2);
const WHITE = 'FFFFFF';
const MIST = 'C9D6F2';
const MUTE = '93A3C7';
const HEAD = '+mj-lt';

const PRESENTERS = ['Aya Yakoubi', 'Hassna Elhaddajy'];
const SCHOOL = 'École Supérieure de Technologie de Salé';

/* ------------------------------------------------------------------ */
/*  Content (from the webinar)                                         */
/* ------------------------------------------------------------------ */

const ENJEUX = [
  {
    short: 'Recruter',
    title: 'Recruter de nouveaux talents',
    color: '4F8CFF', orb: 'blue',
    stat: { value: '46 %', text: 'des responsables RH veulent attirer de nouveaux talents en 2023' },
    leaves: [
      { t: 'Marque employeur', d: '69 % des candidats rejettent une entreprise à l’image médiocre : la soigner en interne et en externe.' },
      { t: 'Vivier interne d’abord', d: 'Promotion interne, reconversion, nouvelles missions avant de recruter à l’extérieur.' },
      { t: 'Processus simple et créatif', d: 'Plus court, plus dynamique : entretiens collectifs, ludiques ou à distance.' },
      { t: 'Offres attractives', d: 'Partir de ce que cherchent vraiment les candidats en 2023.' },
    ],
  },
  {
    short: 'Engager & fidéliser',
    title: 'Engager puis fidéliser les talents',
    color: 'A98BFF', orb: 'violet',
    stat: { value: '+82 %', text: 'de rétention grâce à un bon onboarding (chiffre cité dans le webinar)' },
    leaves: [
      { t: 'Pré-boarding & onboarding', d: 'Soigner la période entre l’embauche et le 1er jour, puis l’intégration.' },
      { t: 'Vision & valeurs partagées', d: 'Diffuser la culture en continu : les valeurs doivent être vécues par tous.' },
      { t: 'Sentiment d’appartenance', d: 'Faire partie d’un groupe, pas seulement réaliser une mission.' },
      { t: 'Feedback', d: 'Rapports d’étonnement, 360° de fin de période d’essai, enquêtes ciblées.' },
      { t: 'Ambassadeurs', d: 'Comprendre les leviers d’engagement grâce à un baromètre régulier.' },
    ],
  },
  {
    short: 'QVCT & climat social',
    title: 'Qualité de vie et climat social',
    color: '3FE0C5', orb: 'teal',
    stat: { value: '35 %', text: 'des salariés ont déclaré un burn-out en 2022 (selon le webinar)' },
    leaves: [
      { t: 'Prévenir l’épuisement', d: 'Un management plus attentif et un suivi adapté dans un contexte incertain.' },
      { t: 'Baromètre social anonyme', d: 'Mesurer régulièrement engagement, irritants et sujets prioritaires.' },
      { t: 'Sondages ciblés', d: 'Questionner une équipe précise sur un problème précis.' },
      { t: 'Communiquer', d: 'Avant l’enquête (pourquoi), pendant (impliquer), après (résultats).' },
    ],
  },
  {
    short: 'Nouveaux modes de travail',
    title: 'Pérenniser les nouveaux modes de travail',
    color: 'FFB86B', orb: 'amber',
    stat: { value: '2 jours', text: 'de télétravail par semaine en moyenne en 2022 (selon le webinar)' },
    leaves: [
      { t: 'Travail hybride durable', d: 'Stabiliser le télétravail et l’intégrer à l’organisation.' },
      { t: 'Espaces d’interaction', d: 'Passer d’espaces axés sur les tâches à des espaces axés sur les échanges.' },
      { t: 'Collaborateurs au centre', d: 'Les questionner : place, moyens, reconnaissance, réunions, lien humain.' },
      { t: 'Accompagner les managers', d: 'Du management de proximité au management à distance.' },
    ],
  },
  {
    short: 'Processus RH modernes',
    title: 'Moderniser les processus RH',
    color: '45E0FF', orb: 'cyan',
    stat: { value: '69 %', text: 'des RH passent la moitié de leur temps sur l’administratif (selon le webinar)' },
    leaves: [
      { t: 'Le paradoxe', d: '71 % ont choisi le métier pour sa dimension humaine.' },
      { t: 'Définir le besoin', d: 'Quelles tâches prennent du temps ? Que peut-on automatiser ?' },
      { t: 'S’équiper', d: 'SIRH, logiciel de paie, baromètre social simples et efficaces.' },
      { t: 'Gagner du temps', d: 'Moins d’administratif, plus de stratégie et d’humain.' },
    ],
  },
];

const CANDIDATES = [
  { t: 'Équilibre vie pro / perso', d: 'Flexibilité des horaires, télétravail.', c: '4F8CFF' },
  { t: 'Rémunération', d: 'Fixe, variable, intéressement, avantages.', c: 'FFB86B' },
  { t: 'Sens au travail', d: 'Engagements de l’entreprise, critères ESG.', c: '3FE0C5' },
  { t: 'Évolution de carrière', d: 'Développer ses compétences, carrière personnalisée.', c: 'A98BFF' },
  { t: 'Autonomie', d: 'Plus de responsabilités, missions choisies.', c: '45E0FF' },
];

const CRISES = ['Crise sanitaire', 'Nouvelles organisations', 'Guerre des talents', 'Grande démission', 'Crise énergétique', 'Inflation'];

/* ------------------------------------------------------------------ */
/*  Engine (same conventions as build-native.mjs)                       */
/* ------------------------------------------------------------------ */

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'Les 5 grands enjeux RH de 2023 — carte conceptuelle';
pres.author = PRESENTERS.join(' & ');
pres.company = SCHOOL;
pres.theme = { headFontFace: 'Segoe UI Semibold', bodyFontFace: 'Segoe UI' };
pres.defineSlideMaster({ title: 'Map', background: { path: icon('background') }, objects: [] });

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
  if (o.at === undefined) cursor += o.gap ?? 0.1;
  anims.push({ slide: slideNo, shape: name, kind: 'enter', effect, dir: o.dir, dur: o.dur ?? 0.6, at: o.at ?? cursor });
}
function ambient(name, effect, o = {}) {
  anims.push({ slide: slideNo, shape: name, kind: 'ambient', effect, dur: o.dur ?? 2, by: o.by, path: o.path, delay: o.delay ?? 0, reverse: o.reverse ?? false });
}
function text(slide, value, o) {
  const name = uniq(o.name ?? `t${used.size}`);
  slide.addText(value, {
    x: inch(o.x), y: inch(o.y), w: inch(o.w), h: inch(o.h), fontSize: ptOf(o.size, o.min ?? 12), color: o.color ?? WHITE,
    bold: o.bold ?? false, italic: o.italic ?? false, fontFace: o.head ? HEAD : undefined, align: o.align ?? 'left',
    valign: o.valign ?? 'top', margin: 0, isTextBox: true, objectName: name, charSpacing: o.charSpacing, lineSpacingMultiple: 1.05, fit: 'none',
  });
  if (o.anim !== false) enter(name, o.anim ?? 'fade', { dir: o.dir, dur: o.dur ?? 0.5, gap: o.gap ?? 0.08, at: o.at });
  return name;
}
function img(slide, file, cx, cy, w, h, name, o = {}) {
  const n = uniq(name);
  slide.addImage({ path: file.includes(path.sep) ? file : icon(file), x: inch(cx - w / 2), y: inch(cy - h / 2), w: inch(w), h: inch(h), objectName: n, altText: o.alt ?? '', transparency: o.transparency });
  if (o.anim) enter(n, o.anim, { dur: o.dur, gap: o.gap, at: o.at, dir: o.dir });
  return n;
}
function shape(slide, type, x, y, w, h, name, o = {}) {
  const n = uniq(name);
  slide.addShape(type, {
    x: inch(x), y: inch(y), w: inch(w), h: inch(h), objectName: n,
    fill: o.fill ? { color: o.fill, transparency: o.fillT ?? 0 } : { type: 'none' },
    line: o.line ? { color: o.line, width: o.lineW ?? 1.5, transparency: o.lineT ?? 0, dashType: o.dash } : { type: 'none' },
    rectRadius: o.radius,
  });
  if (o.anim) enter(n, o.anim, { dir: o.dir, dur: o.dur, gap: o.gap, at: o.at });
  return n;
}
function line(slide, x1, y1, x2, y2, name, o = {}) {
  const n = uniq(name);
  slide.addShape(pres.shapes.LINE, {
    x: inch(Math.min(x1, x2)), y: inch(Math.min(y1, y2)), w: inch(Math.max(1, Math.abs(x2 - x1))), h: inch(Math.max(1, Math.abs(y2 - y1))),
    flipH: x2 < x1, flipV: y2 < y1, objectName: n, line: { color: o.color ?? '8AA4E0', width: o.width ?? 1.5, transparency: o.t ?? 30, dashType: o.dash },
  });
  if (o.anim !== false) enter(n, o.anim ?? 'wipe', { dir: o.dir ?? (x2 >= x1 ? 'left' : 'right'), dur: o.dur ?? 0.5, gap: o.gap ?? 0.03, at: o.at });
  return n;
}
/** A small light that travels along a line, forever (energy flowing through the map). */
function flow(slide, x1, y1, x2, y2, name, o = {}) {
  const n = img(slide, o.orb ?? 'orb-white', x1, y1, o.size ?? 40, o.size ?? 40, name, { anim: 'fade', at: o.at ?? 1.6 });
  ambient(n, 'path', { dur: o.dur ?? 1.8, delay: o.delay ?? 0, path: `M 0 0 L ${((x2 - x1) / 1920).toFixed(4)} ${((y2 - y1) / 1080).toFixed(4)} E` });
}
function logo(slide, x, y, h) {
  const n = uniq('!!logo');
  slide.addImage({ path: LOGO, x: inch(x), y: inch(y), w: inch(h * LOGO_RATIO), h: inch(h), objectName: n, altText: SCHOOL });
  enter(n, 'fade', { dur: 0.8 });
}
function addSlide(section, notes) {
  if (section) pres.addSection({ title: section.title });
  const slide = pres.addSlide({ masterName: 'Map', sectionTitle: section?.title ?? currentSection });
  if (section) currentSection = section.title;
  slide.addNotes(notes);
  slideNo++;
  cursor = 0;
  used.clear();
  return slide;
}
let currentSection = '';
const ell = (cx, cy, rx, ry, deg) => [cx + Math.cos((deg * Math.PI) / 180) * rx, cy + Math.sin((deg * Math.PI) / 180) * ry];
const ANGLES = [-90, -18, 54, 126, 198];

/* ------------------------------------------------------------------ */
/*  Concept-map pieces                                                 */
/* ------------------------------------------------------------------ */

/** Central idea of the map. */
function centre(slide, cx, cy, size, o = {}) {
  const g = img(slide, 'orb-violet', cx, cy, size * 2.4, size * 2.4, '!!c-glow', { transparency: 30, anim: 'fade', at: 0.1 });
  ambient(g, 'pulse', { dur: 3, by: 110, reverse: true });
  const c = img(slide, 'core', cx, cy, size, size, '!!c-core', { anim: 'fadedZoom', at: 0.15, dur: 1 });
  ambient(c, 'pulse', { dur: 1.8, by: 106, reverse: true });
  const ring = shape(slide, pres.shapes.OVAL, cx - size * 0.72, cy - size * 0.72, size * 1.44, size * 1.44, '!!c-ring', { line: 'B6A8FF', lineW: 1.5, dash: 'sysDot', anim: 'expand', at: 0.4 });
  ambient(ring, 'spin', { dur: 20, by: 360 });
  if (o.label)
    text(slide, o.label, { x: cx - 200, y: cy - (o.labelSize ?? 34) * 0.7, w: 400, h: (o.labelSize ?? 34) * 1.4 * (o.lines ?? 1), size: o.labelSize ?? 34, bold: true, head: true, align: 'center', valign: 'middle', name: '!!c-label', anim: 'zoom', at: 0.6 });
}

/** One branch node of the map (the same names everywhere, so Morph moves it). */
function node(slide, k, cx, cy, size, o = {}) {
  const e = ENJEUX[k];
  const g = img(slide, `orb-${e.orb}`, cx, cy, size * 2, size * 2, `!!b${k}-glow`, { transparency: o.dim ? 70 : 25, anim: 'fade', at: o.at ?? 0.5 + k * 0.15 });
  if (!o.dim) ambient(g, 'pulse', { dur: 2.2, by: 112, reverse: true, delay: k * 0.3 });
  shape(slide, pres.shapes.OVAL, cx - size / 2, cy - size / 2, size, size, `!!b${k}-node`, { fill: e.color, fillT: o.dim ? 70 : 15, line: 'FFFFFF', lineT: 40, lineW: 1.5, anim: 'zoom', at: (o.at ?? 0.5 + k * 0.15) + 0.05, dur: 0.5 });
  if (size >= 60)
    text(slide, String(k + 1), { x: cx - size / 2, y: cy - size * 0.32, w: size, h: size * 0.64, size: size * 0.42, bold: true, head: true, align: 'center', valign: 'middle', name: `!!b${k}-num`, anim: false });
  if (o.label)
    text(slide, o.label, { x: cx - (o.labelW ?? 280) / 2, y: cy + size / 2 + 12, w: o.labelW ?? 280, h: o.labelH ?? 80, size: o.labelSize ?? 28, bold: true, head: true, color: o.labelColor ?? WHITE, align: 'center', name: `!!b${k}-label`, anim: 'fly', dir: 'bottom', at: (o.at ?? 0.5 + k * 0.15) + 0.2 });
}

function title(slide, value, kicker, o = {}) {
  if (kicker) text(slide, kicker.toUpperCase(), { x: 120, y: 70, w: 1200, h: 36, size: 24, color: o.kickerColor ?? MIST, charSpacing: 4, name: '!!kicker', anim: 'fly', dir: 'left' });
  text(slide, value, { x: 120, y: 108, w: o.w ?? 1300, h: 90, size: o.size ?? 60, bold: false, head: true, name: '!!title', anim: 'ascend', dur: 0.7 });
}

function counter(slide, n, total) {
  text(slide, `${String(n).padStart(2, '0')} / ${total}`, { x: 1700, y: 1000, w: 180, h: 40, size: 24, color: MUTE, align: 'right', name: '!!counter', anim: false });
}

/** Map overview: centre + 5 labelled branches (lines drawn first, so they stay behind). */
function fullMap(slide, o = {}) {
  const leaves = Boolean(o.leaves);
  const [cx, cy, rx, ry] = leaves ? [960, 590, 470, 270] : [960, 580, 600, 300];
  const pos = ENJEUX.map((_, k) => ell(cx, cy, rx, ry, ANGLES[k]));
  const coreR = (leaves ? 180 : 210) * 0.72; // lines start at the dotted ring, not on the label
  ENJEUX.forEach((e, k) => {
    const [x, y] = pos[k];
    const rad = (ANGLES[k] * Math.PI) / 180;
    const [sx, sy] = [cx + Math.cos(rad) * coreR, cy + Math.sin(rad) * coreR];
    line(slide, sx, sy, x, y, `!!l${k}`, { color: e.color, width: 2.5, t: 20, at: 0.9 + k * 0.15 });
    flow(slide, sx, sy, x, y, `!!f${k}`, { orb: `orb-${e.orb}`, delay: k * 0.35, at: 2.4 });
  });
  centre(slide, cx, cy, leaves ? 180 : 210, { label: 'Enjeux RH\n2023', labelSize: leaves ? 30 : 34, lines: 2 });
  ENJEUX.forEach((e, k) => {
    const [x, y] = pos[k];
    if (!leaves) {
      node(slide, k, x, y, 130, { label: e.short, at: 1.1 + k * 0.15 });
      return;
    }
    // Synthesis: label placed toward the centre, two key ideas fanned outward
    node(slide, k, x, y, 110, { at: 1.1 + k * 0.15 });
    const rad = (ANGLES[k] * Math.PI) / 180;
    const [ux, uy] = [Math.cos(rad), Math.sin(rad)];
    const lx = x - ux * 175;
    const ly = y - uy * 125;
    shape(slide, pres.shapes.ROUNDED_RECTANGLE, lx - 135, ly - 28, 270, 56, `!!b${k}-label-bg`, { fill: '0B1124', fillT: 10, line: e.color, lineW: 1, lineT: 50, radius: 0.2, anim: 'zoom', at: 1.28 + k * 0.15 });
    text(slide, e.short, { x: lx - 130, y: ly - 26, w: 260, h: 52, size: 24, bold: true, head: true, color: e.color, align: 'center', valign: 'middle', name: `!!b${k}-label`, anim: 'zoom', at: 1.3 + k * 0.15 });
    e.leaves.slice(0, 2).forEach((lf, j) => {
      const a = ANGLES[k] + (j === 0 ? -34 : 34);
      const [px, py] = ell(x, y, 260, 150, a);
      line(slide, x, y, px, py, `!!lf${k}-${j}l`, { color: e.color, width: 1, t: 45, at: 2 + k * 0.2 + j * 0.08 });
      shape(slide, pres.shapes.ROUNDED_RECTANGLE, px - 120, py - 26, 240, 52, `!!lf${k}-${j}`, { fill: '141C3A', fillT: 10, line: e.color, lineW: 1, radius: 0.18, anim: 'zoom', at: 2.05 + k * 0.2 + j * 0.08, dur: 0.35 });
      text(slide, lf.t, { x: px - 112, y: py - 22, w: 224, h: 44, size: 21, align: 'center', valign: 'middle', name: `!!lf${k}-${j}t`, anim: false });
    });
  });
}

/** Zoom into one branch: big node on the left, leaves as cards on the right. */
function focus(slide, k, leaves, o = {}) {
  const e = ENJEUX[k];
  // breadcrumb: the centre of the map shrinks to the top-right corner
  centre(slide, 1810, 110, 90, {});
  text(slide, 'Enjeux RH 2023', { x: 1560, y: 92, w: 190, h: 36, size: 22, color: MUTE, align: 'right', name: '!!crumb', anim: false });
  line(slide, 1765, 110, 400, 560, '!!crumb-line', { color: e.color, width: 1, t: 75, dash: 'dash', at: 0.4, anim: 'fade' });
  // the other branches become a small strip at the bottom left (still on the map)
  ENJEUX.forEach((_, j) => {
    if (j === k) return;
    node(slide, j, 140 + j * 70, 1010, 44, { dim: true, at: 0.3 });
  });
  node(slide, k, 400, 560, 270, { label: e.short, labelSize: 34, labelW: 440, labelColor: e.color, at: 0.2 });
  if (o.stat) {
    const v = text(slide, e.stat.value, { x: 140, y: 770, w: 520, h: 100, size: 96, bold: true, head: true, color: e.color, align: 'center', name: '!!stat', anim: 'zoom', at: 0.9, dur: 0.6 });
    ambient(v, 'pulse', { dur: 1.6, by: 106, reverse: true, delay: 1.6 });
    text(slide, e.stat.text, { x: 140, y: 872, w: 520, h: 80, size: 24, color: MIST, align: 'center', name: '!!stat-t', at: 1.1 });
  }
  const n = leaves.length;
  const gap = n > 4 ? 142 : 172;
  const top = 560 - ((n - 1) * gap) / 2;
  leaves.forEach((lf, i) => {
    const y = top + i * gap;
    const color = lf.c ?? e.color;
    line(slide, 535, 560, 800, y, `!!k-l${i}`, { color, width: 2, t: 35, at: 0.8 + i * 0.18 });
    flow(slide, 535, 560, 800, y, `!!k-f${i}`, { orb: 'orb-white', size: 30, dur: 1.4, delay: i * 0.25, at: 2 });
    shape(slide, pres.shapes.ROUNDED_RECTANGLE, 800, y - (gap - 22) / 2, 1020, gap - 22, `!!k-card${i}`, { fill: '141C3A', fillT: 15, line: color, lineW: 1.25, lineT: 30, radius: 0.12, anim: 'fly', dir: 'right', at: 0.9 + i * 0.18, dur: 0.6 });
    const dot = shape(slide, pres.shapes.OVAL, 828, y - 15, 30, 30, `!!k-dot${i}`, { fill: color, anim: 'zoom', at: 1.2 + i * 0.18, dur: 0.3 });
    ambient(dot, 'pulse', { dur: 1.2, by: 125, reverse: true, delay: i * 0.2 });
    text(slide, lf.t, { x: 880, y: y - (gap - 22) / 2 + 14, w: 920, h: 44, size: 32, bold: true, head: true, color: WHITE, name: `!!k-t${i}`, anim: false });
    text(slide, lf.d, { x: 880, y: y - (gap - 22) / 2 + 56, w: 920, h: gap - 80, size: 25, color: MIST, min: 13, name: `!!k-d${i}`, anim: false });
  });
}

/* ------------------------------------------------------------------ */
/*  Slides                                                             */
/* ------------------------------------------------------------------ */

const TOTAL = 12;
const N = (...lines) => lines.join('\n');

// 1 — Title: the core and five orbiting branches
{
  const slide = addSlide({ title: '01. Ouverture' }, N(
    'INTRODUIRE : laisser la carte apparaître, puis présenter le sujet.',
    'À DIRE : Bonjour, nous sommes Aya Yakoubi et Hassna Elhaddajy. Nous présentons les 5 grands enjeux RH de 2023, sous forme de carte conceptuelle, à partir du webinar de Bleexo présenté par Marianne Rodriguez.',
    'TRANSITION : « Avant les enjeux, regardons le contexte de 2023. »',
  ));
  const [cx, cy] = [1380, 520];
  centre(slide, cx, cy, 240, {});
  const orbit = shape(slide, pres.shapes.OVAL, cx - 330, cy - 330, 660, 660, '!!o-orbit', { line: '7B8CFF', lineW: 1.25, lineT: 40, anim: 'expand', at: 0.6 });
  ambient(orbit, 'spin', { dur: 30, by: 360 });
  ENJEUX.forEach((e, k) => {
    const [x, y] = ell(cx, cy, 330, 330, ANGLES[k]);
    node(slide, k, x, y, 96, { at: 0.9 + k * 0.15 });
    line(slide, cx, cy, x, y, `!!l${k}`, { color: e.color, width: 1.5, t: 45, at: 1.0 + k * 0.15 });
  });
  text(slide, 'CARTE CONCEPTUELLE', { x: 120, y: 250, w: 800, h: 40, size: 26, color: 'B6A8FF', charSpacing: 8, name: '!!kicker', anim: 'fly', dir: 'left', at: 0.3 });
  text(slide, 'Les 5 grands enjeux RH de 2023', { x: 120, y: 300, w: 820, h: 300, size: 96, head: true, name: '!!title', anim: 'ascend', at: 0.5, dur: 0.9 });
  text(slide, 'D’après le webinar « Les 5 grands enjeux RH de 2023 » (Bleexo)', { x: 120, y: 620, w: 820, h: 50, size: 28, color: MIST, name: '!!sub', at: 1.4 });
  text(slide, 'PRÉSENTÉ PAR', { x: 120, y: 760, w: 400, h: 34, size: 22, color: MUTE, charSpacing: 6, name: '!!by', at: 1.7 });
  text(slide, PRESENTERS.join('   /   '), { x: 120, y: 798, w: 800, h: 60, size: 40, head: true, name: '!!names', anim: 'fly', dir: 'left', at: 1.8 });
  logo(slide, 120, 890, 100);
}

// 2 — Context: an anxiety-inducing year
{
  const slide = addSlide({ title: '02. Contexte' }, N(
    'INTRODUIRE : 2022 a déjà été une année de défis.',
    'À DIRE : crise sanitaire, nouvelles organisations du travail, guerre des talents, « grande démission », puis crise énergétique et inflation. Le contexte est anxiogène pour tous.',
    'D’un côté, les équipes ont besoin d’écoute et de soutien ; de l’autre, les entreprises doivent optimiser leurs budgets sans sacrifier la productivité.',
    'TRANSITION : « C’est dans ce contexte que cinq grands enjeux RH apparaissent. »',
  ));
  title(slide, 'Un contexte anxiogène', '2023 — le point de départ');
  const [cx, cy] = [1380, 590];
  centre(slide, cx, cy, 170, { label: '2023', labelSize: 40 });
  CRISES.forEach((c, i) => {
    const a = -90 + i * 60;
    const [x, y] = ell(cx, cy, 380, 300, a);
    line(slide, x, y, cx, cy, `!!cr-l${i}`, { color: 'FF7A6B', width: 1.5, t: 40, at: 0.8 + i * 0.12 });
    const b = img(slide, 'orb-coral', x, y, 170, 170, `!!cr-g${i}`, { anim: 'zoom', at: 0.7 + i * 0.12, transparency: 20 });
    ambient(b, 'path', { dur: 2 + (i % 3) * 0.5, path: 'M 0 0 L 0 -0.012 E', reverse: true, delay: i * 0.2 });
    text(slide, c, { x: x - 120, y: y - 24, w: 240, h: 48, size: 26, bold: true, align: 'center', valign: 'middle', name: `!!cr-t${i}`, at: 0.85 + i * 0.12 });
  });
  [['Les équipes', 'ont besoin d’écoute et de soutien.', '45E0FF'], ['Les entreprises', 'doivent optimiser leurs budgets sans sacrifier la productivité.', 'FFB86B']].forEach(([h, d, c], i) => {
    const y = 330 + i * 240;
    shape(slide, pres.shapes.ROUNDED_RECTANGLE, 120, y, 640, 190, `!!ctx-${i}`, { fill: '141C3A', fillT: 15, line: c, lineT: 30, radius: 0.12, anim: 'fly', dir: 'left', at: 1.8 + i * 0.3 });
    text(slide, h, { x: 156, y: y + 28, w: 580, h: 50, size: 36, bold: true, head: true, color: c, name: `!!ctx-${i}h`, anim: false });
    text(slide, d, { x: 156, y: y + 84, w: 580, h: 90, size: 28, color: MIST, name: `!!ctx-${i}d`, anim: false });
  });
  counter(slide, 2, TOTAL);
}

// 3 — The map appears
{
  const slide = addSlide({ title: '03. La carte' }, N(
    'INTRODUIRE : voici notre carte conceptuelle : une idée centrale et cinq branches.',
    'À DIRE : les cinq enjeux sont 1) recruter, 2) engager et fidéliser, 3) la QVCT et le climat social, 4) pérenniser les nouveaux modes de travail, 5) moderniser les processus RH.',
    'Les liens montrent qu’ils sont connectés : un bon climat social aide à fidéliser, une bonne marque employeur aide à recruter…',
    'TRANSITION : « Zoomons sur la première branche : le recrutement. »',
  ));
  fullMap(slide);
  text(slide, 'CARTE CONCEPTUELLE', { x: 120, y: 70, w: 900, h: 36, size: 24, color: 'B6A8FF', charSpacing: 4, name: '!!kicker', anim: 'fly', dir: 'left' });
  counter(slide, 3, TOTAL);
}

// 4–9 — Zoom on each branch
const FOCUS = [
  { k: 0, leaves: ENJEUX[0].leaves, stat: true, notes: N(
    'INTRODUIRE : premier enjeu, attirer de nouveaux talents dans un contexte de « guerre des talents ».',
    'À DIRE : selon le webinar, 46 % des responsables RH en font une priorité, et 69 % des candidats rejettent une entreprise dont l’image est jugée médiocre.',
    'Les leviers : la marque employeur, le vivier interne (promotion, reconversion), un processus simple et créatif, des offres attractives.',
    'EXEMPLE : des entreprises organisent des entretiens collectifs ou sous forme de jeu.',
    'TRANSITION : « Mais que cherchent vraiment les candidats ? »') },
  { k: 0, leaves: CANDIDATES, stat: false, sub: 'Ce que cherchent les candidats en 2023', notes: N(
    'INTRODUIRE : pour rendre les offres attractives, il faut partir des attentes des candidats.',
    'À DIRE : l’équilibre vie pro/perso (flexibilité, télétravail), la rémunération (fixe, variable, avantages), le sens (critères ESG), l’évolution de carrière, l’autonomie et les responsabilités.',
    'TRANSITION : « Recruter est difficile, mais retenir l’est tout autant. »') },
  { k: 1, leaves: ENJEUX[1].leaves, stat: true, notes: N(
    'INTRODUIRE : deuxième enjeu, engager dès l’arrivée puis fidéliser.',
    'À DIRE : le pré-boarding (entre l’embauche et le premier jour) et l’onboarding sont décisifs ; le webinar cite +82 % de rétention avec un bon onboarding.',
    'Partager vision et valeurs, construire le sentiment d’appartenance, recueillir le feedback (rapport d’étonnement, 360° en fin de période d’essai).',
    'Fidéliser, c’est faire des collaborateurs des ambassadeurs, en comprenant leurs leviers d’engagement.',
    'TRANSITION : « L’engagement dépend beaucoup du bien-être au travail. »') },
  { k: 2, leaves: ENJEUX[2].leaves, stat: true, notes: N(
    'INTRODUIRE : troisième enjeu, la qualité de vie et des conditions de travail (QVCT) et le climat social.',
    'À DIRE : le webinar cite 35 % de salariés ayant déclaré un burn-out en 2022, alors qu’un salarié heureux est plus productif.',
    'Outils : baromètre social anonyme, sondages ciblés, management attentif ; et surtout communiquer avant, pendant et après.',
    'TRANSITION : « Depuis le confinement, nos façons de travailler ont aussi changé. »') },
  { k: 3, leaves: ENJEUX[3].leaves, stat: true, notes: N(
    'INTRODUIRE : quatrième enjeu, rendre durables les nouveaux modes de travail.',
    'À DIRE : le télétravail atteint en moyenne deux jours par semaine en 2022 selon le webinar : le travail hybride s’installe.',
    'Il faut des espaces axés sur les interactions, mettre les collaborateurs au centre et accompagner les managers qui passent au management à distance.',
    'TRANSITION : « Pour tout cela, les RH ont besoin de temps… et d’outils. »') },
  { k: 4, leaves: ENJEUX[4].leaves, stat: true, notes: N(
    'INTRODUIRE : cinquième enjeu, moderniser les processus RH.',
    'À DIRE : selon le webinar, 69 % des RH passent la moitié de leur temps sur l’administratif, alors que 71 % ont choisi ce métier pour l’humain.',
    'Définir son besoin (quelles tâches automatiser ?), s’équiper (SIRH, logiciel de paie, baromètre social) pour gagner du temps et de l’argent.',
    'TRANSITION : « Revenons maintenant à la carte complète. »') },
];
FOCUS.forEach((f, i) => {
  const e = ENJEUX[f.k];
  const slide = addSlide(i === 0 || f.k !== FOCUS[i - 1].k ? { title: `${String(4 + i).padStart(2, '0')}. ${e.short}` } : null, f.notes);
  title(slide, f.sub ?? e.title, `Enjeu ${f.k + 1} / 5`, { kickerColor: e.color, w: 1400, size: 56 });
  focus(slide, f.k, f.leaves, { stat: f.stat });
  counter(slide, 4 + i, TOTAL);
});

// 10 — The complete map
{
  const slide = addSlide({ title: '10. Synthèse' }, N(
    'INTRODUIRE : la carte complète, avec les idées clés de chaque branche.',
    'À DIRE : refaire le tour rapidement — recruter, engager et fidéliser, QVCT, nouveaux modes de travail, processus RH — en montrant les liens entre les branches.',
    'TRANSITION : « Que retenir ? »',
  ));
  fullMap(slide, { leaves: true });
  text(slide, 'LA CARTE COMPLÈTE', { x: 120, y: 70, w: 900, h: 36, size: 24, color: 'B6A8FF', charSpacing: 4, name: '!!kicker', anim: 'fly', dir: 'left' });
  counter(slide, 10, TOTAL);
}

// 11 — Conclusion
{
  const slide = addSlide({ title: '11. Conclusion' }, N(
    'INTRODUIRE : ces enjeux sont surtout des défis à relever AVEC les collaborateurs.',
    'À DIRE : le feedback de chacun permet de trouver des solutions collectives, de responsabiliser et d’impliquer les équipes dans la réussite de l’entreprise.',
    'Pour aller plus loin (question du public pendant le webinar) : la diversité, l’équité et l’inclusion.',
    'TRANSITION : « Merci pour votre attention. »',
  ));
  title(slide, 'Des défis à relever avec les collaborateurs', 'Conclusion', { size: 60 });
  const steps = [['Feedback', 'la voix de chacun', '45E0FF'], ['Solutions collectives', 'construites ensemble', 'A98BFF'], ['Équipes impliquées', 'et responsabilisées', '3FE0C5']];
  steps.forEach(([h, d, c], i) => {
    const x = 220 + i * 560;
    const g = img(slide, `orb-${['cyan', 'violet', 'teal'][i]}`, x + 120, 520, 360, 360, `!!cc-g${i}`, { anim: 'zoom', at: 0.4 + i * 0.4, transparency: 25 });
    ambient(g, 'pulse', { dur: 1.6, by: 110, reverse: true, delay: i * 0.4 });
    shape(slide, pres.shapes.OVAL, x, 400, 240, 240, `!!cc-c${i}`, { fill: c, fillT: 20, line: 'FFFFFF', lineT: 40, anim: 'zoom', at: 0.45 + i * 0.4 });
    text(slide, String(i + 1), { x, y: 470, w: 240, h: 100, size: 90, bold: true, head: true, align: 'center', valign: 'middle', name: `!!cc-n${i}`, anim: false });
    text(slide, h, { x: x - 80, y: 670, w: 400, h: 50, size: 34, bold: true, head: true, color: c, align: 'center', name: `!!cc-h${i}`, at: 0.6 + i * 0.4 });
    text(slide, d, { x: x - 80, y: 722, w: 400, h: 44, size: 26, color: MIST, align: 'center', name: `!!cc-d${i}`, at: 0.7 + i * 0.4 });
    if (i < 2) {
      const a = shape(slide, pres.shapes.RIGHT_ARROW, x + 300, 495, 200, 50, `!!cc-a${i}`, { fill: 'FFFFFF', fillT: 70, anim: 'wipe', dir: 'left', at: 0.8 + i * 0.4 });
      ambient(a, 'path', { dur: 0.9, path: 'M 0 0 L 0.008 0 E', reverse: true });
    }
  });
  shape(slide, pres.shapes.ROUNDED_RECTANGLE, 420, 850, 1080, 100, '!!cc-more', { fill: '141C3A', fillT: 15, line: 'FFB86B', lineT: 30, radius: 0.15, anim: 'fly', dir: 'bottom', at: 2 });
  text(slide, 'Pour aller plus loin : diversité, équité et inclusion', { x: 440, y: 875, w: 1040, h: 50, size: 32, color: 'FFD2A1', align: 'center', name: '!!cc-more-t', anim: false });
  counter(slide, 11, TOTAL);
}

// 12 — Thanks & questions
{
  const slide = addSlide({ title: '12. Questions' }, N(
    'INTRODUIRE : remercier et ouvrir les échanges.',
    'Pistes : quel enjeu est le plus urgent au Maroc ? Comment mesurer l’engagement ? Ces méthodes s’appliquent-elles aux associations et aux bénévoles (oui, selon le webinar : l’engagement ne dépend pas que de la rémunération) ?',
  ));
  centre(slide, 960, 420, 220, {});
  ENJEUX.forEach((e, k) => {
    const [x, y] = ell(960, 420, 300, 300, ANGLES[k]);
    node(slide, k, x, y, 70, { at: 0.6 + k * 0.1 });
  });
  const orbit = shape(slide, pres.shapes.OVAL, 960 - 300, 420 - 300, 600, 600, '!!o-orbit', { line: '7B8CFF', lineW: 1.25, lineT: 40, dash: 'sysDot', anim: 'expand', at: 0.4 });
  ambient(orbit, 'spin', { dur: 24, by: -360 });
  text(slide, 'Merci pour votre attention', { x: 160, y: 770, w: 1600, h: 100, size: 80, head: true, color: 'C7D4FF', align: 'center', name: '!!title', anim: 'zoom', at: 1.2 });
  text(slide, `Questions & échanges · ${PRESENTERS.join(' & ')} · ${SCHOOL}`, { x: 160, y: 890, w: 1600, h: 50, size: 28, color: MIST, align: 'center', name: '!!sub', at: 1.6 });
}

const deckPath = path.join(OUT, 'enjeux-base.pptx');
await pres.writeFile({ fileName: deckPath });
fs.writeFileSync(path.join(OUT, 'enjeux-anims.json'), JSON.stringify(anims, null, 1));
console.log(`enjeux deck: ${deckPath} (${slideNo} slides, ${anims.length} animations planned)`);
