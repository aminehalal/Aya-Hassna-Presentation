/**
 * Native PowerPoint version — step 1/2: builds the deck with pptxgenjs.
 *
 * No video: every scene is drawn with native PowerPoint shapes and icons
 * (people, light-bulbs, orbs, org chart, tree, cycle, zellige stars…).
 * One slide per step of the web presentation; every visual element has a
 * stable name ("!!…") so that PowerPoint's Morph transition physically moves
 * it from one step to the next (the org chart walking into a team circle,
 * bulbs flying together into one big bulb…). The animation plan (entrances,
 * pulses, rotations, motion paths) is written to export/native-anims.json and
 * applied by PowerPoint itself in step 2 (finalize-native.ps1).
 *
 *   node tools/pptx/build-native.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import pptxgen from 'pptxgenjs';
import {
  changeContent,
  changeTypesContent,
  conclusionContent,
  innovationContent,
  innovationOrgsContent,
  learningContent,
  learningOrgContent,
  moroccoContent,
  presentationInfo,
  questionContent,
  questionsContent,
  relationshipContent,
  resistanceContent,
  slides,
} from '../../src/content/presentation.ts';
import { speakerNotes } from '../../src/content/speakerNotes.ts';
import { bibliography } from '../../src/content/bibliography.ts';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'export');
const ICONS = path.join(OUT, 'native');
const SKILL_THEME = process.env.PPTX_APPLY_THEME;

const THEME = {
  name: 'EST Salé — Changement, innovation, apprentissage',
  headFontFace: 'Segoe UI Semibold',
  bodyFontFace: 'Segoe UI',
  colors: {
    dk1: '03050B', lt1: 'FFFFFF', dk2: '0B1124', lt2: 'C9D6F2',
    accent1: '4F8CFF', accent2: '45E0FF', accent3: 'A98BFF', accent4: 'FFB86B', accent5: '3FE0C5', accent6: 'FF7A6B',
    hlink: '45E0FF', folHlink: 'A98BFF',
  },
};
const WHITE = 'FFFFFF';
const MIST = 'C9D6F2';
const MUTE = '93A3C7';
const DIM = '5E6B8C';
const HEAD = '+mj-lt';
const C = { blue: '4F8CFF', violet: 'A98BFF', cyan: '45E0FF', amber: 'FFB86B', teal: '3FE0C5', coral: 'FF7A6B', grey: '8794B4', white: 'E8F0FF' };

const inch = (v) => v / 144; // web stage px → inches (1920 px = 13.333 in)
const ptOf = (v, min = 12) => Math.max(min, Math.round(v) / 2);
const hex = (c) => c.replace('#', '').toUpperCase();
const icon = (name) => path.join(ICONS, `${name}.png`);
/** PowerPoint only accepts rotations in [0, 360). */
const deg = (r) => (r === undefined ? undefined : ((r % 360) + 360) % 360);
const LOGO = path.join(ROOT, 'public', 'logo-est-sale.png');
const LOGO_RATIO = 967 / 460;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = presentationInfo.title;
pres.subject = `${presentationInfo.module} — ${presentationInfo.institution}`;
pres.author = presentationInfo.presenters.join(' & ');
pres.company = presentationInfo.institution;
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.defineSlideMaster({ title: 'Scene', background: { path: icon('background') }, objects: [] });

/* ------------------------------------------------------------------ */
/*  Animation plan                                                     */
/* ------------------------------------------------------------------ */

const anims = [];
let slideNo = 0;
let cursor = 0;
const usedNames = new Set();

function uniqueName(name) {
  if (!usedNames.has(name)) {
    usedNames.add(name);
    return name;
  }
  let k = 2;
  while (usedNames.has(`${name}~${k}`)) k++;
  usedNames.add(`${name}~${k}`);
  return `${name}~${k}`;
}

/** Entrance (only played if the shape is new on this slide — otherwise Morph moves it). */
function enter(name, effect = 'fade', o = {}) {
  if (o.at === undefined) cursor += o.gap ?? 0.1;
  anims.push({ slide: slideNo, shape: name, kind: 'enter', effect, dir: o.dir, dur: o.dur ?? 0.6, at: o.at ?? cursor });
}
/** Looping emphasis / motion that lives for the whole slide. */
function ambient(name, effect, o = {}) {
  anims.push({ slide: slideNo, shape: name, kind: 'ambient', effect, dur: o.dur ?? 2, by: o.by, path: o.path, delay: o.delay ?? 0, reverse: o.reverse ?? false });
}

/* ------------------------------------------------------------------ */
/*  Drawing helpers (coordinates in web-stage pixels, 1920×1080)       */
/* ------------------------------------------------------------------ */

function text(slide, value, o) {
  const name = uniqueName(o.name ?? `t-${slideNo}-${usedNames.size}`);
  slide.addText(value, {
    x: inch(o.x), y: inch(o.y), w: inch(o.w), h: inch(o.h),
    fontSize: ptOf(o.size, o.min ?? 12), color: o.color ?? WHITE, bold: o.bold ?? false, italic: o.italic ?? false,
    fontFace: o.head ? HEAD : undefined, align: o.align ?? 'left', valign: o.valign ?? 'top', margin: 0, isTextBox: true,
    objectName: name, charSpacing: o.charSpacing, lineSpacingMultiple: o.lineSpacing ?? 1.05, fit: 'none',
    strike: o.strike ? 'sngStrike' : undefined,
  });
  if (o.anim !== false) enter(name, o.anim ?? 'fade', { dir: o.dir, dur: o.dur ?? 0.5, gap: o.gap ?? 0.08, at: o.at });
  return name;
}

function img(slide, file, cx, cy, w, h, name, o = {}) {
  const n = uniqueName(name);
  slide.addImage({
    path: icon(file), x: inch(cx - w / 2), y: inch(cy - h / 2), w: inch(w), h: inch(h),
    objectName: n, altText: o.alt ?? '', transparency: o.transparency, rotate: deg(o.rotate),
  });
  if (o.anim !== false && o.anim !== undefined) enter(n, o.anim, { dir: o.dir, dur: o.dur, gap: o.gap, at: o.at });
  return n;
}

/** A person icon, feet at (cx, footY), height h. */
function person(slide, color, cx, footY, h, name, o = {}) {
  const w = (h * 120) / 170;
  return img(slide, `person-${color}`, cx, footY - h / 2, w, h, name, { alt: 'Personne', anim: o.anim ?? 'zoom', gap: o.gap ?? 0.04, dur: o.dur ?? 0.45, ...o });
}

function shape(slide, type, x, y, w, h, name, o = {}) {
  const n = uniqueName(name);
  slide.addShape(type, {
    x: inch(x), y: inch(y), w: inch(w), h: inch(h), objectName: n, rotate: deg(o.rotate),
    fill: o.fill ? { color: o.fill, transparency: o.fillT ?? 0 } : { type: 'none' },
    line: o.line ? { color: o.line, width: o.lineW ?? 1.5, transparency: o.lineT ?? 0, dashType: o.dash } : { type: 'none' },
    rectRadius: o.radius, angleRange: o.angles, flipH: o.flipH, flipV: o.flipV,
  });
  if (o.anim) enter(n, o.anim, { dir: o.dir, dur: o.dur, gap: o.gap, at: o.at });
  return n;
}

/** Straight line from (x1,y1) to (x2,y2). */
function line(slide, x1, y1, x2, y2, name, o = {}) {
  const n = uniqueName(name);
  slide.addShape(pres.shapes.LINE, {
    x: inch(Math.min(x1, x2)), y: inch(Math.min(y1, y2)), w: inch(Math.max(1, Math.abs(x2 - x1))), h: inch(Math.max(1, Math.abs(y2 - y1))),
    flipH: x2 < x1, flipV: y2 < y1, objectName: n,
    line: { color: o.color ?? '8AA4E0', width: o.width ?? 1.25, transparency: o.t ?? 30, dashType: o.dash, endArrowType: o.arrow },
  });
  if (o.anim !== false) enter(n, o.anim ?? 'fade', { dir: o.dir, dur: o.dur ?? 0.4, gap: o.gap ?? 0.02, at: o.at });
  return n;
}

/** Clockwise circular motion path starting at the top of a circle of radius r (px). */
function circlePath(r) {
  const x = r / 1920;
  const y = r / 1080;
  const k = 0.5523;
  const f = (v) => v.toFixed(4);
  return [
    'M 0 0',
    `C ${f(k * x)} 0 ${f(x)} ${f(y - k * y)} ${f(x)} ${f(y)}`,
    `C ${f(x)} ${f(y + k * y)} ${f(k * x)} ${f(2 * y)} 0 ${f(2 * y)}`,
    `C ${f(-k * x)} ${f(2 * y)} ${f(-x)} ${f(y + k * y)} ${f(-x)} ${f(y)}`,
    `C ${f(-x)} ${f(y - k * y)} ${f(-k * x)} 0 0 0`,
    'E',
  ].join(' ');
}

const ellipsePoint = (cx, cy, rx, ry, a) => [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];

function kicker(slide, value, o = {}) {
  text(slide, value.toUpperCase(), { x: o.x ?? 120, y: o.y ?? 92, w: o.w ?? 1300, h: 40, size: 24, color: MIST, charSpacing: 4, align: o.align, name: '!!kicker' });
}
function label(slide, value, accent, x, y, w = 900, name = 'label') {
  text(slide, value.toUpperCase(), { x, y, w, h: 40, size: 24, bold: true, color: accent, charSpacing: 3, name: `!!${name}` });
}
function title(slide, value, o) {
  text(slide, value, { head: true, lineSpacing: 0.98, name: '!!title', anim: 'ascend', dur: 0.7, ...o });
}
function panel(slide, x, y, w, h, name) {
  shape(slide, pres.shapes.ROUNDED_RECTANGLE, x, y, w, h, `!!${name}`, { fill: '162042', fillT: 30, line: 'A0BEFF', lineT: 75, lineW: 0.75, radius: 0.18, anim: 'fade' });
}
function pill(slide, value, x, y, w, name) {
  shape(slide, pres.shapes.ROUNDED_RECTANGLE, x, y, w, 64, `!!${name}-bg`, { fill: 'FFFFFF', fillT: 92, line: 'FFFFFF', lineT: 80, lineW: 0.75, radius: 0.22, anim: 'zoom', dur: 0.4 });
  text(slide, value, { x: x + 20, y: y + 14, w: w - 40, h: 40, size: 26, align: 'center', name: `!!${name}`, anim: false });
}
function item(slide, n, o) {
  const accent = o.color ?? o.accent;
  const emph = o.active;
  text(slide, String(n + 1).padStart(2, '0'), { x: o.x, y: o.y + 6, w: 60, h: 40, size: 26, color: emph ? accent : MUTE, name: `!!${o.name}-n` });
  text(slide, o.label, { x: o.x + 76, y: o.y, w: o.w - 76, h: o.lh ?? 52, size: o.size ?? 33, bold: true, head: true, color: emph ? accent : o.dimmed ? MUTE : WHITE, name: `!!${o.name}-l`, anim: 'fly', dir: 'left' });
  if (o.text)
    text(slide, o.text, { x: o.x + 76, y: o.y + (o.lh ?? 52), w: o.w - 76, h: o.th ?? 80, size: o.tsize ?? 28, color: o.dimmed ? DIM : MIST, min: 14, name: `!!${o.name}-t` });
}
function counter(slide, index) {
  text(slide, `${String(index + 1).padStart(2, '0')} / ${slides.length}`, { x: 1700, y: 1000, w: 180, h: 40, size: 24, color: MUTE, align: 'right', name: '!!counter', anim: false });
}
function logo(slide, x, y, h, name = '!!logo') {
  const n = uniqueName(name);
  slide.addImage({ path: LOGO, x: inch(x), y: inch(y), w: inch(h * LOGO_RATIO), h: inch(h), objectName: n, altText: presentationInfo.institution });
  enter(n, 'fade', { dur: 0.8 });
}
/** Big soft colour glow behind the scene's visual (crossfades between scenes). */
function aura(slide, color, cx = 1460, cy = 540, size = 1000) {
  img(slide, `orb-${color}`, cx, cy, size, size, '!!aura', { transparency: 35, alt: '' });
  ambient('!!aura', 'pulse', { dur: 4, by: 108, reverse: true });
}

function notesFor(meta, step) {
  const n = speakerNotes[meta.id];
  const lines = [];
  if (meta.steps > 1) lines.push(`ÉTAPE ${step + 1}/${meta.steps} — ${n.cues?.[step] ?? ''}`, '');
  lines.push(`INTRODUIRE : ${n.intro}`, '', 'À DIRE :', ...n.say.map((s) => `• ${s}`), '', `EXEMPLE : ${n.example}`, '', `TRANSITION : « ${n.transition} »`);
  return lines.join('\n');
}

// Debug aid: ONLY_SECTIONS=3,6 builds only those scenes (others go to a throwaway deck)
const ONLY = process.env.ONLY_SECTIONS ? process.env.ONLY_SECTIONS.split(',').map(Number) : null;
const scratch = new pptxgen();

function stepSlide(index, step) {
  const meta = slides[index];
  const section = `${String(index + 1).padStart(2, '0')}. ${meta.title}`;
  if (ONLY && !ONLY.includes(index + 1)) {
    slideNo++;
    cursor = 0;
    usedNames.clear();
    return { slide: scratch.addSlide(), accent: hex(meta.accent) };
  }
  if (step === 0) pres.addSection({ title: section });
  const slide = pres.addSlide({ masterName: 'Scene', sectionTitle: section });
  slide.addNotes(notesFor(meta, step));
  slideNo++;
  cursor = 0;
  usedNames.clear();
  return { slide, accent: hex(meta.accent) };
}

/* ------------------------------------------------------------------ */
/*  Reusable scene pieces                                              */
/* ------------------------------------------------------------------ */

/** Recursive 2D knowledge tree; returns branches by depth and the leaf tips. */
function treeGeometry(baseX, baseY, trunk, depthMax = 5) {
  const branches = [];
  const tips = [];
  const grow = (x, y, angle, len, depth) => {
    const x2 = x + Math.cos(angle) * len;
    const y2 = y - Math.sin(angle) * len;
    branches.push({ x1: x, y1: y, x2, y2, depth });
    if (depth === depthMax) {
      tips.push([x2, y2]);
      return;
    }
    const spread = depth === 0 ? [0.45, 0, -0.45] : [0.32, -0.32];
    spread.forEach((s) => grow(x2, y2, angle + s, len * (depth === 0 ? 0.78 : 0.74), depth + 1));
  };
  grow(baseX, baseY, Math.PI / 2, trunk, 0);
  return { branches, tips };
}

function drawTree(slide, prefix, baseX, baseY, trunk, maxDepth, o = {}) {
  const { branches, tips } = treeGeometry(baseX, baseY, trunk, 5);
  branches
    .filter((b) => b.depth <= maxDepth)
    .forEach((b, i) => {
      line(slide, b.x1, b.y1, b.x2, b.y2, `!!${prefix}-b${i}`, {
        color: o.color ?? '3FE0C5', width: Math.max(1.25, 7 - b.depth * 1.3) * (o.scale ?? 1), t: 0,
        anim: 'wipe', dir: 'bottom', dur: 0.35, gap: b.depth === 0 ? 0.1 : 0.015,
      });
    });
  return tips;
}

/* ================================================================== */
/*  01 — Ouverture: the core and its members                           */
/* ================================================================== */
const PEOPLE_COLORS = ['blue', 'violet', 'cyan', 'amber', 'teal', 'blue', 'violet'];
for (let step = 0; step < 2; step++) {
  const { slide, accent } = stepSlide(0, step);
  void accent;
  const cx = step === 0 ? 960 : 1460;
  const cy = step === 0 ? 470 : 480;
  aura(slide, 'violet', cx, cy, step === 0 ? 900 : 1000);
  shape(slide, pres.shapes.OVAL, cx - 380, cy + 190, 760, 170, '!!i-floor', { line: '7FB4FF', lineT: 55, lineW: 1.25, anim: 'expand', dur: 0.8 });
  shape(slide, pres.shapes.OCTAGON, cx - 215, cy - 215, 430, 430, '!!i-pavilion', { line: '8FC8FF', lineT: 45, lineW: 1.25, anim: 'fade', dur: 1 });
  ambient('!!i-pavilion', 'spin', { dur: 40, by: 360 });
  shape(slide, pres.shapes.STAR_8_POINT, cx - 120, cy - 300, 240, 240, '!!i-khatam', { line: '8FC8FF', lineT: 55, lineW: 1, anim: 'fade' });
  ambient('!!i-khatam', 'spin', { dur: 60, by: -360 });
  img(slide, 'core', cx, cy, 340, 340, '!!i-core', { anim: 'fadedZoom', dur: 1.4, alt: 'Noyau de l’organisation' });
  ambient('!!i-core', 'pulse', { dur: 2.4, by: 106, reverse: true });

  if (step === 0) {
    logo(slide, (1920 - 170 * LOGO_RATIO) / 2, 60, 170);
    text(slide, presentationInfo.module.toUpperCase(), { x: 360, y: 860, w: 1200, h: 44, size: 28, color: MIST, align: 'center', charSpacing: 5, name: '!!module' });
    text(slide, `Filière ${presentationInfo.field} · ${presentationInfo.academicYear}`, { x: 360, y: 930, w: 1200, h: 40, size: 26, color: MUTE, align: 'center', name: '!!meta' });
  } else {
    // The members of the organisation appear around the core, linked to it
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + Math.PI / 2;
      const [px, py] = ellipsePoint(cx, cy + 275, 380, 85, a);
      line(slide, px, py - 40, cx, cy, `!!i-link${i}`, { color: '9FE3FF', t: 70, width: 1, at: 1.6 + i * 0.03 });
      person(slide, PEOPLE_COLORS[i % PEOPLE_COLORS.length], px, py + 18, 64 + (Math.sin(a) + 1) * 14, `!!i-p${i}`, { at: 0.8 + i * 0.05 });
    }
    logo(slide, 120, 64, 118);
    text(slide, presentationInfo.module.toUpperCase(), { x: 120 + 118 * LOGO_RATIO + 50, y: 106, w: 900, h: 40, size: 24, color: MIST, charSpacing: 3, name: '!!module' });
    title(slide, "Le changement, l'innovation et l'apprentissage", { x: 120, y: 245, w: 1020, h: 350, size: 92 });
    text(slide, 'dans les organisations', { x: 120, y: 618, w: 1000, h: 80, size: 54, color: '8FA2FF', head: true, name: '!!sub' });
    text(slide, presentationInfo.subtitle, { x: 120, y: 718, w: 860, h: 100, size: 31, color: MIST, name: '!!lead' });
    text(slide, 'PRÉSENTÉ PAR', { x: 120, y: 862, w: 400, h: 34, size: 22, color: MUTE, charSpacing: 6, name: '!!by' });
    text(slide, presentationInfo.presenters.join('   /   '), { x: 120, y: 900, w: 760, h: 60, size: 40, head: true, name: '!!names', anim: 'fly', dir: 'left' });
    text(slide, `Filière ${presentationInfo.field}\n${presentationInfo.academicYear}`, { x: 900, y: 890, w: 560, h: 80, size: 24, color: MUTE, name: '!!meta' });
  }
}

/* ================================================================== */
/*  02 — Deux organisations                                            */
/* ================================================================== */
const TEAM = ['cyan', 'violet', 'amber'];
for (let step = 0; step < 2; step++) {
  const { slide, accent } = stepSlide(1, step);
  aura(slide, 'blue', 1480, 700, 760);
  // Frozen organisation: identical grey people in a strict grid, inside a box
  shape(slide, pres.shapes.RECTANGLE, 205, 560, 470, 270, '!!q-cage', { line: '7B8DB8', lineT: 55, lineW: 1, anim: 'fade' });
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 6; c++)
      person(slide, 'grey', 262 + c * 72, 640 + r * 56, 64, `!!q-l${r}-${c}`, { at: 0.3 + (r * 6 + c) * 0.02, anim: 'fade' });
  // Divide
  line(slide, 960, 520, 960, 860, '!!q-divide', { color: '7AA2FF', t: 40, width: 1, anim: 'wipe', dir: 'top' });
  // Evolving organisation: three teams, people linked, always moving
  const centres = step === 0 ? [[1330, 690], [1600, 690], [1465, 790]] : [[1310, 660], [1620, 660], [1465, 800]];
  for (let t = 0; t < 3; t++) {
    const [tx, ty] = centres[t];
    const pts = [];
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const [px, py] = ellipsePoint(tx, ty, 92, 34, a);
      pts.push([px, py]);
    }
    pts.forEach(([px, py], k) => {
      const [qx, qy] = pts[(k + 1) % 6];
      line(slide, px, py - 28, qx, qy - 28, `!!q-t${t}l${k}`, { color: '5FE1FF', t: step ? 30 : 55, width: 1, at: 1.2 + t * 0.1 });
    });
    pts.forEach(([px, py], k) => {
      const n = person(slide, TEAM[t], px, py, 66, `!!q-t${t}p${k}`, { at: 0.5 + (t * 6 + k) * 0.03 });
      ambient(n, 'path', { dur: 1.6 + ((t + k) % 3) * 0.3, path: 'M 0 0 L 0 -0.012 E', reverse: true, delay: ((t * 6 + k) % 5) * 0.15 });
    });
  }
  kicker(slide, '02 — Question introductive', { x: 160, w: 1600, align: 'center' });
  title(slide, questionContent.question, { x: 180, y: 145, w: 1560, h: 170, size: 64, align: 'center' });
  if (step >= 1) {
    text(slide, questionContent.hypothesisLead, { x: 260, y: 352, w: 1400, h: 44, size: 29, color: MIST, align: 'center', name: '!!hyp-lead' });
    text(slide, questionContent.hypothesis.join('   ·   '), { x: 260, y: 405, w: 1400, h: 76, size: 52, color: accent, align: 'center', head: true, name: '!!hyp', anim: 'zoom', dur: 0.6 });
  }
  [
    { side: questionContent.rigid, cx: 438, color: MUTE },
    { side: questionContent.dynamic, cx: 1482, color: accent },
  ].forEach(({ side, cx, color }, i) => {
    text(slide, side.label, { x: cx - 330, y: 882, w: 660, h: 50, size: 36, bold: true, color, align: 'center', head: true, name: `!!world-${i}` });
    text(slide, side.text, { x: cx - 330, y: 934, w: 660, h: 70, size: 26, color: MIST, align: 'center', name: `!!world-${i}-t` });
  });
}

/* ================================================================== */
/*  03 — Du schéma hiérarchique à l'équipe                             */
/* ================================================================== */
const ORG = (() => {
  const nodes = [{ x: 1480, y: 330, level: 0, parent: -1 }];
  const l1 = [1200, 1385, 1575, 1760];
  l1.forEach((x) => nodes.push({ x, y: 520, level: 1, parent: 0 }));
  l1.forEach((x, p) => [-58, 0, 58].forEach((dx) => nodes.push({ x: x + dx, y: 720, level: 2, parent: p + 1 })));
  // Team circle positions (same people, no top or bottom)
  nodes.forEach((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2 + 0.2;
    [n.tx, n.ty] = ellipsePoint(1480, 700, 330, 120, a);
  });
  return nodes;
})();
const LEVEL_COLOR = ['amber', 'violet', 'cyan'];
for (let step = 0; step < 3; step++) {
  const { slide, accent } = stepSlide(2, step);
  aura(slide, 'blue', 1480, 560, 900);
  const team = step === 2;
  if (team) {
    shape(slide, pres.shapes.OVAL, 1480 - 360, 700 - 135, 720, 270, '!!c-floor', { line: '45E0FF', lineT: 45, lineW: 1.25, anim: 'expand', dur: 0.8, at: 1.0 });
    // Colleague links around the circle and across it
    ORG.forEach((n, i) => {
      const m = ORG[(i + 1) % ORG.length];
      const o = ORG[(i + 5) % ORG.length];
      line(slide, n.tx, n.ty - 30, m.tx, m.ty - 30, `!!c-ring${i}`, { color: '45E0FF', t: 35, at: 1.4 + i * 0.02 });
      if (i % 2 === 0) line(slide, n.tx, n.ty - 30, o.tx, o.ty - 30, `!!c-cross${i}`, { color: '45E0FF', t: 65, at: 1.6 + i * 0.02 });
    });
  } else {
    ORG.forEach((n, i) => {
      if (n.parent >= 0) {
        const p = ORG[n.parent];
        line(slide, p.x, p.y + 42, n.x, n.y - 42, `!!c-edge${i}`, { color: '8AA4E0', t: 25, at: 0.6 + n.level * 0.35 + i * 0.01, anim: 'wipe', dir: 'top' });
      }
      shape(slide, pres.shapes.ROUNDED_RECTANGLE, n.x - 34, n.y - 42, 68, 84, `!!c-card${i}`, {
        fill: '1D2A55', line: '4F8CFF', lineT: 30, lineW: 1, radius: 0.08, anim: 'zoom', dur: 0.4, at: 0.3 + n.level * 0.35 + i * 0.02,
      });
    });
  }
  ORG.forEach((n, i) => {
    const color = team ? LEVEL_COLOR[n.level] : 'grey';
    const h = team ? 78 : 58;
    const name = person(slide, color, team ? n.tx : n.x, team ? n.ty : n.y + 30, h, `!!c-p${i}`, { at: 0.4 + n.level * 0.35 + i * 0.02 });
    if (step === 1 && n.level < 2) ambient(name, 'teeter', { dur: 0.5 });
  });
  if (step === 1) {
    // External forces pressing on the hierarchy
    [[1100, 300, 0], [1100, 760, 0], [1860, 300, 180], [1860, 760, 180], [1480, 170, 90], [1480, 950, 270]].forEach(([x, y, rot], k) => {
      const n = shape(slide, pres.shapes.RIGHT_ARROW, x - 50, y - 22, 100, 44, `!!c-force${k}`, { fill: 'FFB86B', fillT: 25, rotate: rot, anim: 'fly', dir: ['left', 'left', 'right', 'right', 'top', 'bottom'][k], at: 0.3 + k * 0.1 });
      ambient(n, 'pulse', { dur: 0.8, by: 112, reverse: true, delay: k * 0.1 });
    });
  }
  const c = changeContent;
  kicker(slide, slides[2].kicker);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 190, size: 86 });
  if (step === 0) {
    label(slide, c.definition.label, accent, 120, 380);
    text(slide, c.definition.text, { x: 120, y: 430, w: 900, h: 210, size: 35, min: 16, name: '!!def' });
    text(slide, c.definition.sociology, { x: 120, y: 670, w: 880, h: 130, size: 29, italic: true, color: MIST, min: 14, name: '!!soc' });
  } else if (step === 1) {
    label(slide, c.factors.label, accent, 120, 380, 1000);
    [c.factors.external, c.factors.internal].forEach((g, k) => {
      const x = 120 + k * 470;
      text(slide, g.label, { x, y: 440, w: 440, h: 50, size: 34, bold: true, head: true, name: `!!fac-${k}` });
      g.items.forEach((t, i) => text(slide, `•  ${t}`, { x, y: 505 + i * 58, w: 440, h: 50, size: 28, color: MIST, min: 14, name: `!!fac-${k}-${i}`, anim: 'fly', dir: 'left' }));
    });
  } else {
    label(slide, c.planned.label, accent, 120, 380);
    c.planned.items.forEach((it, k) => {
      text(slide, it.label, { x: 120, y: 432 + k * 140, w: 900, h: 50, size: 34, bold: true, head: true, name: `!!pl-${k}` });
      text(slide, it.text, { x: 120, y: 482 + k * 140, w: 900, h: 80, size: 28, color: MIST, min: 14, name: `!!pl-${k}-t` });
    });
    text(slide, c.planned.lewinLabel.toUpperCase(), { x: 120, y: 728, w: 900, h: 36, size: 24, color: MUTE, charSpacing: 3, name: '!!lewin-l' });
    c.planned.lewin.forEach((phase, k) => {
      pill(slide, phase, 120 + k * 300, 778, 250, `lewin-${k}`);
      if (k > 0) text(slide, '→', { x: 120 + k * 300 - 44, y: 788, w: 40, h: 44, size: 30, color: accent, align: 'center', name: `!!lewin-a${k}` });
    });
  }
  counter(slide, 2);
}

/* ================================================================== */
/*  04 — Les strates: one person, a team, the organisation             */
/* ================================================================== */
const LAYERS = [
  { y: 340, rx: 95, ry: 24, count: 1, color: 'cyan', ph: 92 },
  { y: 560, rx: 210, ry: 52, count: 7, color: 'blue', ph: 66 },
  { y: 800, rx: 330, ry: 84, count: 16, color: 'violet', ph: 52 },
];
for (let step = 0; step < 5; step++) {
  const { slide, accent } = stepSlide(3, step);
  aura(slide, step === 4 ? 'amber' : 'blue', 1480, 580, 900);
  const transform = step === 4;
  LAYERS.forEach((L, li) => {
    if (step < li) return;
    const y = transform ? [300, 560, 840][li] : L.y;
    const rot = transform ? [-9, 7, -5][li] : step === 3 ? [3, -3, 2][li] : 0;
    const lineColor = transform ? C.amber : C[L.color];
    shape(slide, pres.shapes.OVAL, 1480 - L.rx, y - L.ry, L.rx * 2, L.ry * 2, `!!s-layer${li}`, { fill: lineColor, fillT: 85, line: lineColor, lineT: 20, lineW: 1.5, rotate: rot, anim: 'expand', dur: 0.6, at: 0.2 });
    for (let k = 0; k < L.count; k++) {
      let px = 1480;
      let py = y;
      if (L.count > 1) {
        const ring = li === 2 && k >= 8 ? 1 : 0;
        const nInRing = li === 2 ? 8 : L.count;
        const kk = ring ? k - 8 : k;
        const scale = ring ? 0.82 : li === 2 ? 0.45 : 0.62;
        [px, py] = ellipsePoint(1480, y, L.rx * scale, L.ry * scale, (kk / nInRing) * Math.PI * 2 + ring * 0.4);
      }
      person(slide, transform ? 'amber' : L.color, px, py + 6, L.ph, `!!s-p${li}-${k}`, { at: 0.5 + k * 0.03 });
    }
  });
  if (step >= 2) {
    // Vertical links: the individual inside the team, the team inside the organisation
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      const [gx, gy] = ellipsePoint(1480, transform ? 560 : 560, 210 * 0.62, 52 * 0.62, a);
      line(slide, 1480, (transform ? 300 : 340) + 6, gx, gy - 20, `!!s-up${k}`, { color: transform ? C.amber : '9FC2FF', t: 60, at: 1.2 + k * 0.03 });
    }
  }
  if (step === 3) {
    // Incremental rhythm: small regular steps
    for (let k = 0; k < 5; k++) shape(slide, pres.shapes.RECTANGLE, 1180 + k * 70, 990 - k * 18, 60, 18 + k * 18, `!!s-stair${k}`, { fill: '4F8CFF', fillT: 40, anim: 'wipe', dir: 'bottom', at: 0.6 + k * 0.25, dur: 0.3 });
  }
  if (transform) {
    const n = shape(slide, pres.shapes.OVAL, 1480 - 420, 580 - 300, 840, 600, '!!s-wave', { line: 'FFB86B', lineT: 40, lineW: 2, anim: 'expand', dur: 1 });
    ambient(n, 'pulse', { dur: 1.4, by: 112, reverse: true });
  }
  const c = changeTypesContent;
  kicker(slide, slides[3].kicker);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 170, size: 76 });
  if (step < 3) {
    label(slide, c.levelsLabel, accent, 120, 370);
    c.levels.forEach((lv, i) => {
      if (step < i) return;
      item(slide, i, { x: 120, y: 430 + i * 165, w: 880, label: lv.label, text: lv.text, size: 40, tsize: 29, lh: 58, accent, active: step === i, dimmed: step !== i, name: `lv-${i}` });
    });
  } else {
    label(slide, c.natureLabel, accent, 120, 370, 900, 'label2');
    c.nature.forEach((nt, i) => {
      if (step < 3 + i) return;
      item(slide, i, { x: 120, y: 430 + i * 200, w: 880, label: nt.label, text: nt.text, size: 40, tsize: 29, lh: 58, th: 110, accent: i === 1 ? C.amber : accent, active: step === 3 + i, dimmed: step !== 3 + i, name: `nt-${i}` });
    });
  }
  counter(slide, 3);
}

/* ================================================================== */
/*  05 — Le flux et les barrières                                      */
/* ================================================================== */
const COLUMN_X = [420, 690, 960, 1230, 1500];
for (let step = 0; step < 2; step++) {
  const { slide, accent } = stepSlide(4, step);
  aura(slide, 'coral', 960, 860, 1100);
  const open = step === 1;
  // Barriers: two halves that slide apart when the levers act
  COLUMN_X.forEach((x, i) => {
    const h = open ? 30 : 115; // doors retract toward the top and the bottom
    shape(slide, pres.shapes.RECTANGLE, x - 16, 700, 32, h, `!!r-top${i}`, { fill: 'FF7A6B', fillT: open ? 55 : 15, line: 'FFB0A0', lineT: 40, lineW: 1, anim: 'wipe', dir: 'bottom', at: 0.3 + i * 0.12 });
    shape(slide, pres.shapes.RECTANGLE, x - 16, 930 - h, 32, h, `!!r-bot${i}`, { fill: 'FF7A6B', fillT: open ? 55 : 15, line: 'FFB0A0', lineT: 40, lineW: 1, anim: 'wipe', dir: 'top', at: 0.3 + i * 0.12 });
  });
  // The flow of transformation: blocked and piling up / passing through
  for (let k = 0; k < 28; k++) {
    const row = k % 4;
    const col = Math.floor(k / 4);
    const x = open ? 160 + k * 60 : 210 + col * 26 + (row % 2) * 10;
    const y = open ? 815 + Math.sin(k * 1.7) * 60 : 755 + row * 40;
    const n = img(slide, k % 3 === 0 ? 'orb-amber' : 'orb-cyan', x, y, 56, 56, `!!r-dot${k}`, { anim: 'zoom', at: 0.2 + k * 0.02, dur: 0.3 });
    if (open) ambient(n, 'path', { dur: 2.2, path: 'M 0 0 L 0.14 0 E', delay: (k % 7) * 0.25 });
    else ambient(n, 'path', { dur: 0.35 + (k % 3) * 0.1, path: 'M 0 0 L 0.006 0 E', reverse: true });
  }
  const c = resistanceContent;
  kicker(slide, slides[4].kicker);
  title(slide, c.title, { x: 120, y: 145, w: 1500, h: 110, size: 84 });
  if (step === 0) {
    text(slide, c.lead, { x: 120, y: 275, w: 1400, h: 100, size: 32, min: 16, name: '!!lead' });
    text(slide, `— ${c.leadSource}`, { x: 120, y: 375, w: 800, h: 36, size: 24, color: MUTE, name: '!!src' });
  } else {
    text(slide, c.leversLabel.toUpperCase(), { x: 120, y: 300, w: 300, h: 40, size: 24, bold: true, color: accent, charSpacing: 3, name: '!!lev-l' });
    c.levers.forEach((lv, k) => {
      text(slide, lv.label, { x: 420 + k * 420, y: 285, w: 400, h: 56, size: 38, bold: true, color: '9FF0FF', head: true, name: `!!lev-${k}`, anim: 'zoom' });
      text(slide, lv.text, { x: 420 + k * 420, y: 342, w: 400, h: 40, size: 27, color: MIST, min: 14, name: `!!lev-${k}-t` });
    });
  }
  c.causes.forEach((cause, i) => {
    const x = COLUMN_X[i] - 129;
    text(slide, cause.label, { x, y: 515, w: 258, h: 76, size: 29, bold: true, align: 'center', head: true, color: open ? MUTE : WHITE, strike: open, name: `!!cause-${i}` });
    text(slide, cause.text, { x, y: 595, w: 258, h: 70, size: 24, align: 'center', color: open ? DIM : MIST, name: `!!cause-${i}-t` });
  });
  counter(slide, 4);
}

/* ================================================================== */
/*  06 — Des idées (ampoules) à l'innovation (une grande ampoule)      */
/* ================================================================== */
const BULBS = (() => {
  let seed = 61;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const outline = [];
  const cx = 1480;
  const cy = 470;
  const R = 230;
  for (let i = 0; i < 26; i++) {
    const a = (-58 + (i / 25) * 296) * (Math.PI / 180);
    outline.push([cx + Math.cos(a) * R, cy - Math.sin(a) * R]);
  }
  outline.push([cx - 110, 700], [cx + 110, 700], [cx - 90, 750], [cx + 90, 750], [cx - 70, 795], [cx + 70, 795], [cx, 830]);
  outline.push([cx - 50, 520], [cx - 25, 455], [cx, 500], [cx + 25, 455], [cx + 50, 520]); // filament
  return outline.map(([tx, ty]) => ({ tx, ty, sx: 1130 + rand() * 700, sy: 300 + rand() * 600, color: ['cyan', 'violet', 'blue', 'amber', 'coral'][Math.floor(rand() * 5)] }));
})();
for (let step = 0; step < 3; step++) {
  const { slide, accent } = stepSlide(5, step);
  aura(slide, step === 2 ? 'amber' : 'violet', 1480, 540, 950);
  const formed = step === 2;
  if (formed) {
    const g = img(slide, 'orb-amber', 1480, 470, 760, 760, '!!n-glow', { anim: 'fadedZoom', dur: 1.2, at: 1.4, transparency: 20 });
    ambient(g, 'pulse', { dur: 1.6, by: 108, reverse: true, delay: 2.4 });
  }
  if (step >= 1) {
    // Ideas that meet start to connect
    BULBS.forEach((b, i) => {
      const nb = BULBS[(i + 1) % BULBS.length];
      if (formed ? i < BULBS.length - 1 && i !== 25 && i !== 32 : i % 2 === 0) {
        const [x1, y1, x2, y2] = formed ? [b.tx, b.ty, nb.tx, nb.ty] : [b.sx, b.sy, BULBS[(i + 7) % BULBS.length].sx, BULBS[(i + 7) % BULBS.length].sy];
        line(slide, x1, y1, x2, y2, `!!n-l${i}`, { color: formed ? 'FFD27A' : '9F8BFF', t: formed ? 30 : 55, at: formed ? 1.0 + i * 0.02 : 0.2 + i * 0.03 });
      }
    });
  }
  BULBS.forEach((b, i) => {
    const file = formed ? 'bulb-lit' : step === 1 ? `bulb-${b.color}` : i % 3 === 0 ? `bulb-${b.color}` : 'bulb-off';
    const n = img(slide, file, formed ? b.tx : b.sx, formed ? b.ty : b.sy, formed ? 34 : 44, formed ? 48 : 62, `!!n-b${i}`, { anim: 'zoom', at: 0.2 + i * 0.025, dur: 0.35, alt: 'Idée' });
    if (!formed) ambient(n, 'path', { dur: 2 + (i % 4) * 0.4, path: `M 0 0 L ${((i % 5) - 2) * 0.004} -0.01 E`, reverse: true, delay: (i % 6) * 0.2 });
  });
  const c = innovationContent;
  kicker(slide, slides[5].kicker);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 190, size: 86 });
  if (step === 0) {
    label(slide, c.definition.label, accent, 120, 380);
    text(slide, c.definition.text, { x: 120, y: 430, w: 900, h: 230, size: 36, min: 16, name: '!!def' });
    text(slide, c.definition.source, { x: 120, y: 690, w: 900, h: 40, size: 25, color: MUTE, name: '!!src' });
  } else if (step === 1) {
    label(slide, c.creativity.label, accent, 120, 380);
    c.creativity.items.forEach((it, k) => {
      const x = 120 + k * 470;
      panel(slide, x, 440, 410, 220, `cr-${k}-bg`);
      text(slide, it.label, { x: x + 28, y: 466, w: 360, h: 56, size: 38, bold: true, head: true, color: k === 1 ? accent : WHITE, name: `!!cr-${k}` });
      text(slide, it.text, { x: x + 28, y: 528, w: 360, h: 120, size: 27, color: MIST, min: 14, name: `!!cr-${k}-t` });
    });
    text(slide, '→', { x: 538, y: 520, w: 50, h: 60, size: 44, color: accent, align: 'center', name: '!!cr-arrow', anim: 'fly', dir: 'left' });
    text(slide, c.creativity.note, { x: 120, y: 700, w: 900, h: 100, size: 28, italic: true, color: MIST, min: 14, name: '!!note' });
  } else {
    label(slide, c.types.label, accent, 120, 380);
    c.types.items.forEach((it, i) => {
      const x = 120 + (i % 2) * 460;
      const y = 440 + Math.floor(i / 2) * 200;
      text(slide, `${String(i + 1).padStart(2, '0')}  ${it.label}`, { x, y, w: 430, h: 52, size: 36, bold: true, head: true, name: `!!ty-${i}`, anim: 'zoom' });
      text(slide, it.text, { x, y: y + 56, w: 420, h: 120, size: 26, color: MIST, min: 14, name: `!!ty-${i}-t` });
    });
  }
  counter(slide, 5);
}

/* ================================================================== */
/*  07 — L'organisation-système                                        */
/* ================================================================== */
const PLATFORM = ['45E0FF', '8F7BFF', '4F8CFF', 'FFB86B', '3FE0C5'];
for (let step = 0; step < 2; step++) {
  const { slide, accent } = stepSlide(6, step);
  aura(slide, 'violet', 1480, 600, 950);
  const hub = [1480, 600];
  if (step === 1) {
    // Diffusion of innovation: waves spreading outward (Rogers)
    [0, 1, 2].forEach((k) => {
      const r = 180 + k * 120;
      const n = shape(slide, pres.shapes.OVAL, hub[0] - r * 1.3, hub[1] - r * 0.55, r * 2.6, r * 1.1, `!!o-wave${k}`, { line: '9FE9FF', lineT: 40 + k * 15, lineW: 1.25, anim: 'expand', dur: 0.8, at: 0.3 + k * 0.25 });
      ambient(n, 'pulse', { dur: 1.6, by: 108, reverse: true, delay: k * 0.4 });
    });
  }
  const spots = PLATFORM.map((_, i) => ellipsePoint(hub[0], hub[1] + 40, 340, 170, (i / 5) * Math.PI * 2 - Math.PI / 2 + Math.PI / 5));
  spots.forEach(([x, y], i) => line(slide, hub[0], hub[1] - 40, x, y - 10, `!!o-spoke${i}`, { color: 'B6A8FF', t: 35, width: 1.5, at: 1.0 + i * 0.05 }));
  spots.forEach(([x, y], i) => {
    const [nx, ny] = spots[(i + 1) % 5];
    line(slide, x, y, nx, ny, `!!o-ring${i}`, { color: '6F7FD8', t: 50, width: 1, dash: 'dash', at: 1.3 + i * 0.05 });
  });
  shape(slide, pres.shapes.ROUNDED_RECTANGLE, hub[0] - 42, hub[1] - 170, 84, 200, '!!o-tower', { fill: '3B2FBF', fillT: 10, line: 'B6A8FF', lineW: 1.25, radius: 0.12, anim: 'wipe', dir: 'bottom', at: 0.2, dur: 0.7 });
  const top = img(slide, 'orb-violet', hub[0], hub[1] - 180, 220, 220, '!!o-light', { anim: 'zoom', at: 0.8 });
  ambient(top, 'pulse', { dur: 1.2, by: 115, reverse: true });
  spots.forEach(([x, y], i) => {
    shape(slide, pres.shapes.HEXAGON, x - 80, y - 40, 160, 80, `!!o-hex${i}`, { fill: PLATFORM[i], fillT: 55, line: PLATFORM[i], lineW: 1.5, anim: 'zoom', at: 0.5 + i * 0.12 });
    [-34, 0, 34].forEach((dx, b) =>
      shape(slide, pres.shapes.RECTANGLE, x + dx - 10, y - 30 - (b === 1 ? 46 : 28), 20, b === 1 ? 46 : 28, `!!o-bld${i}-${b}`, { fill: 'E6ECFF', fillT: 25, anim: 'wipe', dir: 'bottom', at: 0.8 + i * 0.12 + b * 0.05, dur: 0.3 }),
    );
    // Energy pulse travelling along the spoke, from the core to the platform
    const pulse = img(slide, 'orb-white', hub[0], hub[1] - 40, 60, 60, `!!o-pulse${i}`, { anim: 'fade', at: 1.5 });
    const dx = (x - hub[0]) / 1920;
    const dy = (y - 10 - (hub[1] - 40)) / 1080;
    ambient(pulse, 'path', { dur: 1.6, path: `M 0 0 L ${dx.toFixed(4)} ${dy.toFixed(4)} E`, delay: i * 0.3 });
  });
  const c = innovationOrgsContent;
  kicker(slide, slides[6].kicker);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 170, size: 68 });
  if (step === 0) {
    c.benefits.forEach((b, i) =>
      item(slide, i, { x: 120, y: 350 + i * 118, w: 880, label: b.label, text: b.text, size: 33, tsize: 27, lh: 48, th: 50, accent: PLATFORM[i], color: PLATFORM[i], active: true, name: `be-${i}` }),
    );
  } else {
    label(slide, c.examplesLabel, accent, 120, 350);
    c.examples.forEach((ex, i) => {
      text(slide, ex.label, { x: 120, y: 405 + i * 130, w: 760, h: 50, size: 34, bold: true, head: true, name: `!!ex-${i}` });
      text(slide, ex.text, { x: 120, y: 455 + i * 130, w: 760, h: 70, size: 27, color: MIST, min: 14, name: `!!ex-${i}-t` });
    });
    panel(slide, 120, 810, 800, 150, 'rogers-bg');
    text(slide, c.rogers, { x: 156, y: 830, w: 740, h: 80, size: 29, min: 14, name: '!!rogers' });
    text(slide, `— ${c.rogersSource}`, { x: 156, y: 912, w: 600, h: 36, size: 24, color: MUTE, name: '!!rogers-s' });
  }
  counter(slide, 6);
}

/* ================================================================== */
/*  08 — L'arbre du savoir                                             */
/* ================================================================== */
const TREE_BASE = [1480, 980];
for (let step = 0; step < 5; step++) {
  const { slide, accent } = stepSlide(7, step);
  aura(slide, 'teal', 1480, 560, 950);
  [0, 1, 2].forEach((k) =>
    shape(slide, pres.shapes.OVAL, TREE_BASE[0] - (140 + k * 110), TREE_BASE[1] - (18 + k * 12), (140 + k * 110) * 2, (18 + k * 12) * 2, `!!g-ground${k}`, { line: '3FE0C5', lineT: 60 + k * 10, lineW: 1, anim: 'expand', at: 0.1 + k * 0.1 }),
  );
  const depth = step === 0 ? 1 : step === 1 ? 3 : 5;
  const tips = drawTree(slide, 'g', TREE_BASE[0], TREE_BASE[1], 210, depth);
  if (step >= 2) {
    // Connected canopy: knowledge shared across the organisation
    tips.forEach(([x, y], i) => {
      const [nx, ny] = tips[(i + 1) % tips.length];
      if (i % 2 === 0) line(slide, x, y, nx, ny, `!!g-link${i}`, { color: '57F0D4', t: 55, width: 1, at: 1.6 + i * 0.01 });
    });
    tips.forEach(([x, y], i) => {
      const n = img(slide, 'orb-teal', x, y, 46, 46, `!!g-leaf${i}`, { anim: 'zoom', at: 1.2 + i * 0.015, dur: 0.3 });
      if (i % 3 === 0) ambient(n, 'pulse', { dur: 1.4, by: 125, reverse: true, delay: (i % 5) * 0.2 });
    });
  }
  if (step === 0) {
    // Seeds: small particles rising toward the base
    for (let k = 0; k < 10; k++) {
      const n = img(slide, 'orb-cyan', TREE_BASE[0] - 260 + k * 52, TREE_BASE[1] - 20, 30, 30, `!!g-seed${k}`, { anim: 'zoom', at: 0.2 + k * 0.05 });
      ambient(n, 'path', { dur: 2.2, path: `M 0 0 L ${((TREE_BASE[0] - (TREE_BASE[0] - 260 + k * 52)) / 1920).toFixed(4)} -0.04 E`, delay: k * 0.2 });
    }
  }
  if (step >= 3) {
    // Knowledge flowing up through the trunk
    for (let k = 0; k < 6; k++) {
      const n = img(slide, 'orb-white', TREE_BASE[0], TREE_BASE[1] - 10, 34, 34, `!!g-flow${k}`, { anim: 'fade', at: 0.4 });
      ambient(n, 'path', { dur: 1.8, path: `M 0 0 L ${(((k % 3) - 1) * 0.04).toFixed(3)} -0.36 E`, delay: k * 0.3 });
    }
  }
  if (step === 4) {
    const a = shape(slide, pres.shapes.OVAL, TREE_BASE[0] - 150, 640, 300, 70, '!!g-loop1', { line: '7FF7FF', lineW: 2, anim: 'expand', at: 0.3 });
    const b = shape(slide, pres.shapes.OVAL, TREE_BASE[0] - 320, 420, 640, 150, '!!g-loop2', { line: 'FFB86B', lineW: 2.25, anim: 'expand', at: 0.7 });
    ambient(a, 'pulse', { dur: 0.9, by: 106, reverse: true });
    ambient(b, 'pulse', { dur: 1.6, by: 104, reverse: true });
  }
  const c = learningContent;
  kicker(slide, slides[7].kicker);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 180, size: 80 });
  if (step < 3) {
    label(slide, c.levelsLabel, accent, 120, 370);
    c.levels.forEach((lv, i) => {
      if (step < i) return;
      item(slide, i, { x: 120, y: 430 + i * 170, w: 880, label: lv.label, text: lv.text, size: 40, tsize: 29, lh: 58, th: 100, accent, active: step === i, dimmed: step !== i, name: `lv-${i}` });
    });
  } else if (step === 3) {
    label(slide, c.mechanismsLabel, accent, 120, 370, 900, 'label2');
    c.mechanisms.forEach((m, i) => item(slide, i, { x: 120, y: 430 + i * 160, w: 880, label: m.label, text: m.text, size: 40, tsize: 29, lh: 58, accent, active: true, name: `me-${i}` }));
  } else {
    label(slide, c.loopsLabel, accent, 120, 370, 900, 'label3');
    const LOOP = ['7FF7FF', 'FFB86B'];
    c.loops.forEach((lp, i) => {
      const y = 440 + i * 200;
      const d = i === 0 ? 56 : 92;
      shape(slide, pres.shapes.OVAL, 120 + (96 - d) / 2, y + (96 - d) / 2, d, d, `!!loop-${i}-c`, { line: LOOP[i], lineW: 2.5, anim: 'zoom' });
      text(slide, lp.label, { x: 250, y: y + 4, w: 760, h: 56, size: 40, bold: true, head: true, color: LOOP[i], name: `!!loop-${i}` });
      text(slide, lp.text, { x: 250, y: y + 62, w: 760, h: 90, size: 29, color: MIST, min: 14, name: `!!loop-${i}-t` });
    });
  }
  counter(slide, 7);
}

/* ================================================================== */
/*  09 — Les cinq disciplines                                          */
/* ================================================================== */
const DISC = ['blue', 'violet', 'amber', 'teal'];
const DISC_POS = [[1300, 400], [1660, 400], [1300, 640], [1660, 640]];
for (let step = 0; step < 3; step++) {
  const { slide, accent } = stepSlide(8, step);
  aura(slide, 'cyan', 1480, 560, 950);
  const centre = [1480, 520];
  const people = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + Math.PI / 2;
    people.push(ellipsePoint(1480, 880, 380, 70, a));
  }
  people.forEach(([x, y], i) => {
    const [nx, ny] = people[(i + 1) % people.length];
    line(slide, x, y - 34, nx, ny - 34, `!!d-team${i}`, { color: '4A8DFF', t: 45, at: 1.0 + i * 0.02 });
  });
  if (step >= 2) {
    DISC_POS.forEach(([x, y], i) => line(slide, centre[0], centre[1], x, y, `!!d-beam${i}`, { color: 'BFF3FF', t: 20, width: 2, at: 0.3 + i * 0.1, anim: 'wipe', dir: 'left' }));
    [[0, 1], [1, 3], [3, 2], [2, 0]].forEach(([a, b], k) => line(slide, ...DISC_POS[a], ...DISC_POS[b], `!!d-edge${k}`, { color: 'BFF3FF', t: 50, at: 0.8 + k * 0.1 }));
    people.forEach(([x, y], i) => {
      if (i % 2 === 0) line(slide, x, y - 50, centre[0], centre[1] + 60, `!!d-rise${i}`, { color: '9FF0FF', t: 70, width: 1, at: 1.2 + i * 0.02 });
    });
  }
  people.forEach(([x, y], i) => person(slide, ['blue', 'violet', 'amber', 'teal'][i % 4], x, y + 10, 64, `!!d-p${i}`, { at: 0.4 + i * 0.03 }));
  const lit = step >= 1;
  DISC_POS.forEach(([x, y], i) => {
    const size = lit ? 120 : 70;
    const n = img(slide, `sphere-${DISC[i]}`, x, y, size, size, `!!d-orb${i}`, { anim: 'zoom', at: 0.5 + i * 0.1, transparency: lit ? 0 : 55 });
    if (lit) ambient(n, 'pulse', { dur: 1.8, by: 108, reverse: true, delay: i * 0.3 });
  });
  shape(slide, pres.shapes.OCTAGON, centre[0] - 95, centre[1] - 95, 190, 190, '!!d-frame', { line: '9FF0FF', lineT: step >= 2 ? 0 : 50, lineW: 1.5, anim: 'fade' });
  ambient('!!d-frame', 'spin', { dur: 14, by: 360 });
  const cs = step >= 2 ? 170 : 110;
  const core = img(slide, 'sphere-cyan', centre[0], centre[1], cs, cs, '!!d-core', { anim: 'zoom', at: 0.3, transparency: step >= 2 ? 0 : 40 });
  if (step >= 2) ambient(core, 'pulse', { dur: 1.2, by: 110, reverse: true });

  const c = learningOrgContent;
  kicker(slide, slides[8].kicker);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 180, size: 80 });
  if (step === 0) {
    panel(slide, 120, 360, 880, 250, 'def-bg');
    text(slide, c.definition, { x: 160, y: 390, w: 810, h: 150, size: 34, min: 16, name: '!!def' });
    text(slide, `— ${c.definitionSource}`, { x: 160, y: 548, w: 810, h: 40, size: 24, color: MUTE, name: '!!def-s' });
    const widths = [300, 300, 250, 190, 230];
    let x = 120;
    let y = 660;
    c.traits.forEach((t, i) => {
      if (x + widths[i] > 1010) {
        x = 120;
        y += 84;
      }
      pill(slide, t, x, y, widths[i], `trait-${i}`);
      x += widths[i] + 18;
    });
  } else {
    const COLORS = ['4F8CFF', 'A98BFF', 'FFB86B', '3FE0C5', 'E8FBFF'];
    label(slide, c.disciplinesLabel, accent, 120, 360);
    c.disciplines.forEach((d, i) =>
      item(slide, i, { x: 120, y: 415 + i * 98, w: 880, label: d.label, text: d.text, size: 32, tsize: 26, lh: 46, th: 44, accent: COLORS[i], color: COLORS[i], active: step === 1 || i === 4, dimmed: step >= 2 && i !== 4, name: `di-${i}` }),
    );
    if (step >= 2) text(slide, c.systemsNote, { x: 120, y: 905, w: 760, h: 80, size: 27, italic: true, color: MIST, min: 14, name: '!!sys' });
  }
  counter(slide, 8);
}

/* ================================================================== */
/*  10 — Le cycle (puis la spirale)                                    */
/* ================================================================== */
const CYC = { cx: 1460, cy: 560, r: 250 };
const NODE = {
  change: [CYC.cx, CYC.cy - CYC.r],
  innovation: [CYC.cx + CYC.r * 0.87, CYC.cy + CYC.r * 0.5],
  learning: [CYC.cx - CYC.r * 0.87, CYC.cy + CYC.r * 0.5],
};
for (let step = 0; step < 5; step++) {
  const { slide, accent } = stepSlide(9, step);
  aura(slide, 'blue', CYC.cx, CYC.cy, 1000);
  const spiral = step === 4;
  if (spiral) {
    // The cycle opens into an ascending spiral of growing radius
    [1.25, 1.5, 1.75].forEach((k, i) => {
      const r = CYC.r * k;
      const n = shape(slide, pres.shapes.ARC, CYC.cx - r, CYC.cy - r - i * 40, r * 2, r * 2, `!!y-sp${i}`, { line: ['4F8CFF', 'A98BFF', '3FE0C5'][i], lineW: 2, lineT: 25 + i * 15, angles: [200, 160], anim: 'wheel', at: 0.3 + i * 0.4, dur: 1 });
      ambient(n, 'spin', { dur: 24 + i * 8, by: i % 2 ? -360 : 360 });
    });
  }
  // Arcs between the three concepts (clockwise), drawn one per step
  const ARCS = [
    { from: 285, to: 15, color: '7FA8FF', at: 1 },
    { from: 45, to: 135, color: 'B9A0FF', at: 2 },
    { from: 165, to: 255, color: '5FF0D4', at: 3 },
  ];
  ARCS.forEach((a, i) => {
    if (step < a.at) return;
    shape(slide, pres.shapes.ARC, CYC.cx - CYC.r, CYC.cy - CYC.r, CYC.r * 2, CYC.r * 2, `!!y-arc${i}`, { line: a.color, lineW: 3, angles: [a.from, a.to], anim: 'wheel', dur: 1, at: 0.3 });
    if (step >= 3) {
      // Energy travelling around the whole cycle
      const p = img(slide, 'orb-white', CYC.cx, CYC.cy - CYC.r, 44, 44, `!!y-pulse${i}`, { anim: 'fade', at: 1.2 });
      ambient(p, 'path', { dur: 6, delay: i * 2, path: circlePath(CYC.r) });
    }
  });
  const ch = img(slide, 'gyroscope', NODE.change[0], NODE.change[1], 170, 170, '!!y-change', { anim: 'zoom', at: 0.2 });
  ambient(ch, 'spin', { dur: 8, by: 360 });
  const inn = img(slide, 'bulb-lit', NODE.innovation[0], NODE.innovation[1], 120, 170, '!!y-innov', { anim: 'zoom', at: 0.35 });
  ambient(inn, 'pulse', { dur: 1.4, by: 108, reverse: true });
  img(slide, 'orb-teal', NODE.learning[0], NODE.learning[1] - 20, 200, 200, '!!y-learn-glow', { anim: 'fade', at: 0.5 });
  drawTree(slide, 'y-tree', NODE.learning[0], NODE.learning[1] + 70, 60, 4, { scale: 0.45 });

  const c = relationshipContent;
  const CYCLE_COLORS = ['4F8CFF', 'A98BFF', '3FE0C5', '9FD8FF'];
  kicker(slide, slides[9].kicker);
  title(slide, c.title, { x: 120, y: 145, w: 880, h: 170, size: 74 });
  c.cycle.forEach((it, i) => {
    if (step < i) return;
    const y = 345 + i * 128;
    const on = step === i || step === 4;
    if (i > 0) text(slide, '↓', { x: 120, y: y - 34, w: 40, h: 34, size: 30, color: CYCLE_COLORS[i], name: `!!cy-${i}-a` });
    text(slide, it.label.toUpperCase(), { x: 120, y, w: 880, h: 50, size: 36, bold: true, head: true, color: on ? CYCLE_COLORS[i] : MUTE, name: `!!cy-${i}`, anim: 'fly', dir: 'left' });
    text(slide, it.text, { x: 120, y: y + 48, w: 880, h: 44, size: 27, color: on ? MIST : DIM, min: 14, name: `!!cy-${i}-t` });
  });
  if (spiral) {
    panel(slide, 120, 870, 880, 120, 'syn-bg');
    text(slide, c.synthesis, { x: 156, y: 890, w: 820, h: 84, size: 28, min: 14, name: '!!syn' });
  }
  counter(slide, 9);
}

/* ================================================================== */
/*  11 — Zellige numérique                                             */
/* ================================================================== */
const TRAD = ['D9A441', 'C8643B', '2F8F6F', '3D5FB0'];
for (let step = 0; step < 2; step++) {
  const { slide, accent } = stepSlide(10, step);
  aura(slide, 'amber', 1500, 760, 900);
  // A lattice of 8-point stars (khatam), digitised from right to left
  const cols = 8;
  const rows = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 1100 + c * 106 + (r % 2) * 53;
      const y = 520 + r * 100;
      if (x > 1870) continue;
      const progress = step === 0 ? 0.45 : 0.85;
      const digital = c / (cols - 1) > 1 - progress;
      const friction = step === 1 && Math.abs(c / (cols - 1) - (1 - progress)) < 0.15;
      const color = friction ? 'FF9A52' : digital ? '45E0FF' : TRAD[(r * 3 + c) % 4];
      const n = shape(slide, pres.shapes.STAR_8_POINT, x - 44, y - 44, 88, 88, `!!z-s${r}-${c}`, { line: color, lineW: friction ? 2.25 : 1.5, lineT: digital ? 0 : 35, fill: color, fillT: digital ? 85 : 92, anim: 'zoom', dur: 0.3, at: 0.2 + (r * cols + c) * 0.015 });
      if (friction) ambient(n, 'pulse', { dur: 0.6, by: 112, reverse: true, delay: (r % 3) * 0.15 });
      if (digital && (r + c) % 4 === 0) {
        const d = img(slide, 'orb-cyan', x, y, 40, 40, `!!z-d${r}-${c}`, { anim: 'fade', at: 1.2 });
        ambient(d, 'path', { dur: 1.4, path: 'M 0 0 L 0.055 0 E', delay: ((r + c) % 5) * 0.2 });
      }
    }
  }
  const star = shape(slide, pres.shapes.STAR_8_POINT, 1500 - 150, 230 - 150, 300, 300, '!!z-khatam', { fill: '1B3A7A', fillT: 45, line: step === 0 ? 'FFCF7A' : '45E0FF', lineW: 2.5, anim: 'fadedZoom', at: 0.1, dur: 1 });
  ambient(star, 'spin', { dur: 30, by: 360 });
  const glow = img(slide, step === 0 ? 'orb-amber' : 'orb-cyan', 1500, 230, 420, 420, '!!z-glow', { anim: 'fade', at: 0.3, transparency: 30 });
  ambient(glow, 'pulse', { dur: 2, by: 108, reverse: true });

  const c = moroccoContent;
  kicker(slide, slides[10].kicker);
  title(slide, c.title, { x: 120, y: 145, w: 920, h: 190, size: 84 });
  const rows2 = step === 0 ? c.examples : c.challenges;
  label(slide, step === 0 ? c.examplesLabel : c.challengesLabel, step === 0 ? '9FF0FF' : accent, 120, 370);
  rows2.forEach((rw, i) => {
    const y = 425 + i * 92;
    text(slide, rw.label, { x: 120, y, w: 300, h: 80, size: 29, bold: true, head: true, color: step === 0 ? WHITE : 'FFD2A1', name: `!!row-${i}`, anim: 'fly', dir: 'left' });
    text(slide, rw.text, { x: 440, y, w: 560, h: 80, size: 26, color: MIST, min: 14, name: `!!row-${i}-t` });
  });
  if (step === 1) text(slide, c.takeaway, { x: 120, y: 900, w: 860, h: 80, size: 28, bold: true, min: 14, name: '!!take', anim: 'zoom' });
  counter(slide, 10);
}

/* ================================================================== */
/*  12 — L'harmonie                                                    */
/* ================================================================== */
const TIERS = [
  { rx: 150, ry: 46, n: 6, dy: 40 },
  { rx: 250, ry: 76, n: 10, dy: 20 },
  { rx: 350, ry: 106, n: 14, dy: 0 },
];
const CONCEPT = ['blue', 'violet', 'teal'];
for (let step = 0; step < 3; step++) {
  const { slide, accent } = stepSlide(11, step);
  const [cx, cy] = step === 0 ? [1480, 600] : [960, 400];
  const s = step === 0 ? 1 : 0.85;
  aura(slide, 'violet', cx, cy, 1000 * s);
  const harmony = step === 2;
  TIERS.forEach((T, ti) => {
    const ty = cy + 110 * s - T.dy * s * (harmony ? 0 : 1);
    shape(slide, pres.shapes.OVAL, cx - T.rx * s, ty - T.ry * s, T.rx * 2 * s, T.ry * 2 * s, `!!h-tier${ti}`, { line: C[CONCEPT[ti]], lineT: harmony ? 0 : 40, lineW: 1.5, anim: 'expand', at: 0.2 + ti * 0.2 });
    for (let k = 0; k < T.n; k++) {
      if (ti === 0 && k % 2 === 0) continue; // seats for the three symbols
      const [px, py] = ellipsePoint(cx, ty, T.rx * s, T.ry * s, (k / T.n) * Math.PI * 2 + ti * 0.2);
      if (harmony && k % 2 === 0) line(slide, px, py - 30 * s, cx, cy, `!!h-spoke${ti}-${k}`, { color: 'BCD2FF', t: 70, width: 1, at: 1.0 + (ti * 14 + k) * 0.01 });
      person(slide, CONCEPT[(k + ti) % 3], px, py + 8 * s, (44 + ti * 4) * s, `!!h-p${ti}-${k}`, { at: 0.5 + ti * 0.2 + k * 0.02 });
    }
  });
  // The three symbols of the talk on the inner tier
  const inner = TIERS[0];
  const seat = (k) => ellipsePoint(cx, cy + 110 * s - inner.dy * s * (harmony ? 0 : 1), inner.rx * s, inner.ry * s, (k / inner.n) * Math.PI * 2);
  const [gx, gy] = seat(0);
  const g = img(slide, 'gyroscope', gx, gy - 40 * s, 90 * s, 90 * s, '!!h-gyro', { anim: 'zoom', at: 1.0 });
  ambient(g, 'spin', { dur: 6, by: 360 });
  const [bx, by] = seat(2);
  img(slide, 'bulb-lit', bx, by - 40 * s, 52 * s, 74 * s, '!!h-bulb', { anim: 'zoom', at: 1.1 });
  const [tx, ty2] = seat(4);
  drawTree(slide, 'h-tree', tx, ty2 + 4 * s, 26 * s, 3, { scale: 0.35 });
  const core = img(slide, 'core', cx, cy, 200 * s, 200 * s, '!!h-core', { anim: 'fadedZoom', at: 0.1, dur: 1 });
  ambient(core, 'pulse', { dur: 2.2, by: 106, reverse: true });

  const c = conclusionContent;
  if (step === 0) {
    kicker(slide, slides[11].kicker);
    title(slide, c.title, { x: 120, y: 145, w: 900, h: 260, size: 72, color: '9FB6FF' });
    const COLORS = ['4F8CFF', 'A98BFF', '3FE0C5'];
    c.summary.forEach((sm, i) => {
      shape(slide, pres.shapes.OVAL, 120, 495 + i * 110, 18, 18, `!!sum-${i}-dot`, { fill: COLORS[i], anim: 'zoom', at: 1.0 + i * 0.25 });
      text(slide, `${sm.label}  — ${sm.text}`, { x: 160, y: 478 + i * 110, w: 880, h: 64, size: 32, color: WHITE, name: `!!sum-${i}`, anim: 'fly', dir: 'left', at: 1.05 + i * 0.25 });
    });
  } else if (step === 1) {
    text(slide, 'QUESTION FINALE', { x: 160, y: 768, w: 1600, h: 40, size: 24, color: MUTE, align: 'center', charSpacing: 6, name: '!!qf' });
    title(slide, c.finalQuestion, { x: 180, y: 815, w: 1560, h: 160, size: 58, align: 'center' });
  } else {
    title(slide, c.thanks, { x: 160, y: 770, w: 1600, h: 130, size: 100, align: 'center', color: 'C7D4FF', anim: 'zoom' });
    text(slide, presentationInfo.presenters.join('  ·  '), { x: 160, y: 915, w: 1600, h: 50, size: 32, color: MIST, align: 'center', name: '!!names' });
  }
  counter(slide, 11);
}

/* ================================================================== */
/*  13 — Bibliographie                                                 */
/* ================================================================== */
{
  const { slide, accent } = stepSlide(12, 0);
  const g = img(slide, 'orb-blue', 1700, 900, 700, 700, '!!aura', { transparency: 60, anim: 'fade' });
  ambient(g, 'pulse', { dur: 4, by: 108, reverse: true });
  kicker(slide, 'Références');
  title(slide, 'Bibliographie', { x: 120, y: 145, w: 1200, h: 110, size: 80 });
  bibliography.forEach((ref, i) => {
    const x = 120 + (i % 2) * 860;
    const y = 300 + Math.floor(i / 2) * 140;
    const n = uniqueName(`!!ref-${i}`);
    slide.addText(
      [
        { text: `${ref.authors} `, options: { bold: true, color: WHITE } },
        { text: `(${ref.year}). `, options: { color: accent } },
        { text: `${ref.title}. `, options: { italic: true, color: WHITE, breakLine: true } },
        { text: ref.details, options: { color: MUTE } },
      ],
      { x: inch(x), y: inch(y), w: inch(800), h: inch(126), fontSize: 13, margin: 0, valign: 'top', isTextBox: true, objectName: n, lineSpacingMultiple: 1.05 },
    );
    enter(n, 'fade', { gap: 0.08 });
  });
  counter(slide, 12);
}

/* ================================================================== */
/*  14 — Questions & échanges                                          */
/* ================================================================== */
{
  const { slide } = stepSlide(13, 0);
  aura(slide, 'violet', 960, 540, 1000);
  const r1 = shape(slide, pres.shapes.OVAL, 960 - 420, 540 - 420, 840, 840, '!!qa-ring1', { line: '7B8CFF', lineW: 3, dash: 'sysDot', anim: 'expand', dur: 1 });
  const r2 = shape(slide, pres.shapes.OVAL, 960 - 395, 540 - 395, 790, 790, '!!qa-ring2', { line: '45E0FF', lineW: 2.25, dash: 'sysDot', anim: 'expand', dur: 1, at: 0.2 });
  ambient(r1, 'spin', { dur: 50, by: 360 });
  ambient(r2, 'spin', { dur: 40, by: -360 });
  text(slide, 'ÉCHANGES', { x: 360, y: 205, w: 1200, h: 40, size: 24, color: MIST, align: 'center', charSpacing: 10, name: '!!qa-k' });
  title(slide, questionsContent.title, { x: 160, y: 255, w: 1600, h: 140, size: 108, align: 'center', color: 'B8C7FF', anim: 'zoom' });
  text(slide, questionsContent.lead, { x: 360, y: 410, w: 1200, h: 50, size: 32, color: MIST, align: 'center', name: '!!qa-lead' });
  text(slide, questionsContent.creditsLabel.toUpperCase(), { x: 560, y: 520, w: 800, h: 36, size: 22, color: MUTE, align: 'center', charSpacing: 2, name: '!!qa-cl' });
  text(slide, presentationInfo.presenters.join('   /   '), { x: 360, y: 562, w: 1200, h: 64, size: 44, align: 'center', head: true, name: '!!qa-names' });
  text(slide, `${presentationInfo.module} · Filière ${presentationInfo.field}\n${presentationInfo.academicYear}`, { x: 360, y: 640, w: 1200, h: 80, size: 24, color: MUTE, align: 'center', name: '!!qa-meta' });
  logo(slide, (1920 - 130 * LOGO_RATIO) / 2, 745, 130, '!!qa-logo');
  counter(slide, 13);
}

/* ------------------------------------------------------------------ */

const deckPath = path.join(OUT, process.env.DECK_NAME ?? 'native-base.pptx');
await pres.writeFile({ fileName: deckPath });
if (SKILL_THEME) {
  const require = createRequire(import.meta.url);
  const { applyTheme } = require(SKILL_THEME);
  await applyTheme(deckPath, THEME);
}
fs.writeFileSync(path.join(OUT, 'native-anims.json'), JSON.stringify(anims, null, 1));
console.log(`native deck: ${deckPath} (${slideNo} slides, ${anims.length} animations planned)`);
