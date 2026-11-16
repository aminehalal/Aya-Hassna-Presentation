/**
 * PowerPoint export — step 1/2: builds the deck with pptxgenjs.
 *
 * One PowerPoint slide per step of the web presentation (39 slides), with
 * native, editable French text laid out like the 1920×1080 web stage, the
 * speaker notes, sections, and a manifest telling step 2 (finalize.ps1)
 * which recorded 3D clip goes behind each slide and which transition to use.
 *
 * Content is read directly from src/content (Node strips the TypeScript types).
 *
 *   node tools/pptx/build-deck.mjs
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
const ASSETS = path.join(OUT, 'assets');
const SKILL_THEME = process.env.PPTX_APPLY_THEME; // optional path to apply_theme.js
fs.mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------------ */
/*  Design system (same tokens as the website)                         */
/* ------------------------------------------------------------------ */

const THEME = {
  name: 'EST Salé — Changement, innovation, apprentissage',
  headFontFace: 'Segoe UI Semibold',
  bodyFontFace: 'Segoe UI',
  colors: {
    dk1: '03050B',
    lt1: 'FFFFFF',
    dk2: '0B1124',
    lt2: 'C9D6F2',
    accent1: '4F8CFF',
    accent2: '45E0FF',
    accent3: 'A98BFF',
    accent4: 'FFB86B',
    accent5: '3FE0C5',
    accent6: 'FF7A6B',
    hlink: '45E0FF',
    folHlink: 'A98BFF',
  },
};
const WHITE = 'FFFFFF';
const MIST = 'C9D6F2';
const MUTE = '93A3C7';
const DIM = '5E6B8C';
const HEAD = '+mj-lt';

// Web stage (1920×1080 px) → wide slide (13.333×7.5 in): 144 px per inch, 1 px = 0.5 pt
const inch = (v) => v / 144;
const ptOf = (v, min = 12) => Math.max(min, Math.round(v) / 2);
const hex = (c) => c.replace('#', '').toUpperCase();

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = presentationInfo.title;
pres.subject = `${presentationInfo.module} — ${presentationInfo.institution}`;
pres.author = presentationInfo.presenters.join(' & ');
pres.company = presentationInfo.institution;
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

pres.defineSlideMaster({
  title: 'Scène 3D',
  background: { color: THEME.colors.dk1 },
  objects: [],
});

const manifest = [];
const LOGO = path.join(ROOT, 'public', 'logo-est-sale.png');
const LOGO_RATIO = 967 / 460;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Text box positioned in web-stage pixels. `size` is the web font size in px. */
function text(slide, value, o) {
  slide.addText(value, {
    x: inch(o.x),
    y: inch(o.y),
    w: inch(o.w),
    h: inch(o.h),
    fontSize: ptOf(o.size, o.min ?? 12),
    color: o.color ?? WHITE,
    bold: o.bold ?? false,
    italic: o.italic ?? false,
    fontFace: o.head ? HEAD : undefined,
    align: o.align ?? 'left',
    valign: o.valign ?? 'top',
    margin: 0,
    isTextBox: true,
    objectName: o.name,
    charSpacing: o.charSpacing,
    lineSpacingMultiple: o.lineSpacing ?? 1.05,
    paraSpaceAfter: o.paraAfter,
    fit: 'none',
    strike: o.strike ? 'sngStrike' : undefined,
  });
}

function kicker(slide, value, accent, o = {}) {
  text(slide, value.toUpperCase(), {
    x: o.x ?? 120,
    y: o.y ?? 92,
    w: o.w ?? 1300,
    h: 40,
    size: 24,
    color: MIST,
    charSpacing: 4,
    align: o.align,
    name: '!!kicker',
  });
}

function label(slide, value, accent, x, y, w = 900, name = 'label') {
  text(slide, value.toUpperCase(), { x, y, w, h: 40, size: 24, bold: true, color: accent, charSpacing: 3, name });
}

function title(slide, value, o) {
  text(slide, value, { head: true, lineSpacing: 0.98, name: '!!title', ...o });
}

function panel(slide, x, y, w, h, name) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: inch(x),
    y: inch(y),
    w: inch(w),
    h: inch(h),
    rectRadius: 0.18,
    fill: { color: '162042', transparency: 35 },
    line: { color: 'A0BEFF', transparency: 80, width: 0.75 },
    objectName: name,
  });
}

function pill(slide, value, x, y, w, accent, name) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: inch(x),
    y: inch(y),
    w: inch(w),
    h: inch(64),
    rectRadius: 0.22,
    fill: { color: 'FFFFFF', transparency: 92 },
    line: { color: 'FFFFFF', transparency: 80, width: 0.75 },
    objectName: `${name}-bg`,
  });
  text(slide, value, { x: x + 24, y: y + 14, w: w - 48, h: 40, size: 26, align: 'center', name, color: WHITE });
}

/** Numbered item: index, bold label, text (web IndexedItem). */
function item(slide, n, o) {
  const accent = o.color ?? o.accent;
  const emph = o.active;
  const labelColor = o.dimmed ? MUTE : WHITE;
  const textColor = o.dimmed ? DIM : MIST;
  text(slide, String(n + 1).padStart(2, '0'), { x: o.x, y: o.y + 6, w: 60, h: 40, size: 26, color: emph ? accent : MUTE, name: `${o.name}-n` });
  text(slide, o.label, { x: o.x + 76, y: o.y, w: o.w - 76, h: o.lh ?? 52, size: o.size ?? 33, bold: true, color: emph ? accent : labelColor, head: true, name: `${o.name}-l` });
  if (o.text)
    text(slide, o.text, { x: o.x + 76, y: o.y + (o.lh ?? 52), w: o.w - 76, h: o.th ?? 80, size: o.tsize ?? 28, color: textColor, min: 14, name: `${o.name}-t` });
}

function counter(slide, index) {
  text(slide, `${String(index + 1).padStart(2, '0')} / ${slides.length}`, {
    x: 1700,
    y: 1000,
    w: 180,
    h: 40,
    size: 24,
    color: MUTE,
    align: 'right',
    name: '!!counter',
  });
}

function scrim(slide, kind) {
  slide.addImage({ path: path.join(ASSETS, `scrim-${kind}.png`), x: 0, y: 0, w: 13.333, h: 7.5, objectName: 'Dégradé de lisibilité', altText: 'Dégradé décoratif' });
}

function logo(slide, x, y, h, name = '!!logo') {
  slide.addImage({ path: LOGO, x: inch(x), y: inch(y), w: inch(h * LOGO_RATIO), h: inch(h), objectName: name, altText: presentationInfo.institution });
}

function notesFor(meta, step) {
  const n = speakerNotes[meta.id];
  const lines = [];
  if (meta.steps > 1) lines.push(`ÉTAPE ${step + 1}/${meta.steps} — ${n.cues?.[step] ?? ''}`, '');
  lines.push(`INTRODUIRE : ${n.intro}`, '', 'À DIRE :', ...n.say.map((s) => `• ${s}`), '', `EXEMPLE : ${n.example}`, '', `TRANSITION : « ${n.transition} »`);
  return lines.join('\n');
}

/** Creates the PowerPoint slide for web slide `index`, step `step`. */
function stepSlide(index, step, scrimKind) {
  const meta = slides[index];
  if (step === 0) pres.addSection({ title: `${String(index + 1).padStart(2, '0')}. ${meta.title}` });
  const slide = pres.addSlide({ masterName: 'Scène 3D', sectionTitle: `${String(index + 1).padStart(2, '0')}. ${meta.title}` });
  if (scrimKind) scrim(slide, scrimKind);
  slide.addNotes(notesFor(meta, step));
  manifest.push({
    slide: manifest.length + 1,
    clip: `slide-${String(index + 1).padStart(2, '0')}-step-${step + 1}.mp4`,
    transition: step === 0 ? 'fade' : 'morph',
  });
  return { slide, accent: hex(meta.accent), meta };
}

/* ------------------------------------------------------------------ */
/*  01 — Ouverture                                                     */
/* ------------------------------------------------------------------ */
{
  const { slide } = stepSlide(0, 0, null);
  logo(slide, (1920 - 170 * LOGO_RATIO) / 2, 60, 170);
  text(slide, presentationInfo.module.toUpperCase(), { x: 360, y: 830, w: 1200, h: 44, size: 28, color: MIST, align: 'center', charSpacing: 5, name: 'module' });
  text(slide, `Filière ${presentationInfo.field} · ${presentationInfo.academicYear}`, { x: 360, y: 910, w: 1200, h: 40, size: 26, color: MUTE, align: 'center', name: 'meta' });
}
{
  const { slide, accent } = stepSlide(0, 1, 'left');
  logo(slide, 120, 64, 118);
  text(slide, presentationInfo.module.toUpperCase(), { x: 120 + 118 * LOGO_RATIO + 50, y: 106, w: 900, h: 40, size: 24, color: MIST, charSpacing: 3, name: 'module' });
  title(slide, "Le changement, l'innovation et l'apprentissage", { x: 120, y: 245, w: 1020, h: 350, size: 92 });
  text(slide, 'dans les organisations', { x: 120, y: 618, w: 1000, h: 80, size: 54, color: accent, head: true, name: 'sub' });
  text(slide, presentationInfo.subtitle, { x: 120, y: 718, w: 860, h: 100, size: 31, color: MIST, name: 'lead' });
  text(slide, 'PRÉSENTÉ PAR', { x: 120, y: 862, w: 400, h: 34, size: 22, color: MUTE, charSpacing: 6, name: 'by' });
  text(slide, presentationInfo.presenters.join('   /   '), { x: 120, y: 900, w: 760, h: 60, size: 40, head: true, name: 'names' });
  text(slide, [`Filière ${presentationInfo.field}`, presentationInfo.academicYear].join('\n'), { x: 900, y: 890, w: 560, h: 80, size: 24, color: MUTE, name: 'meta' });
}

/* ------------------------------------------------------------------ */
/*  02 — Question introductive                                         */
/* ------------------------------------------------------------------ */
for (let step = 0; step < 2; step++) {
  const { slide, accent } = stepSlide(1, step, 'question');
  kicker(slide, '02 — Question introductive', accent, { x: 160, w: 1600, align: 'center' });
  title(slide, questionContent.question, { x: 180, y: 145, w: 1560, h: 170, size: 64, align: 'center' });
  if (step >= 1) {
    text(slide, questionContent.hypothesisLead, { x: 260, y: 352, w: 1400, h: 44, size: 29, color: MIST, align: 'center', name: 'hyp-lead' });
    text(slide, questionContent.hypothesis.join('   ·   '), { x: 260, y: 405, w: 1400, h: 76, size: 52, color: accent, align: 'center', head: true, name: 'hyp' });
  }
  [
    { side: questionContent.rigid, cx: 438, color: MUTE },
    { side: questionContent.dynamic, cx: 1482, color: accent },
  ].forEach(({ side, cx, color }, i) => {
    text(slide, side.label, { x: cx - 330, y: 882, w: 660, h: 50, size: 36, bold: true, color, align: 'center', head: true, name: `!!world-${i}` });
    text(slide, side.text, { x: cx - 330, y: 934, w: 660, h: 70, size: 26, color: MIST, align: 'center', name: `!!world-${i}-t` });
  });
}

/* ------------------------------------------------------------------ */
/*  03 — Le changement organisationnel                                 */
/* ------------------------------------------------------------------ */
for (let step = 0; step < 3; step++) {
  const { slide, accent } = stepSlide(2, step, 'left');
  const c = changeContent;
  kicker(slide, slides[2].kicker, accent);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 190, size: 86 });
  if (step === 0) {
    label(slide, c.definition.label, accent, 120, 380);
    text(slide, c.definition.text, { x: 120, y: 430, w: 900, h: 210, size: 35, min: 16 });
    text(slide, c.definition.sociology, { x: 120, y: 670, w: 880, h: 130, size: 29, italic: true, color: MIST, min: 14 });
  } else if (step === 1) {
    label(slide, c.factors.label, accent, 120, 380, 1000);
    [c.factors.external, c.factors.internal].forEach((g, k) => {
      const x = 120 + k * 470;
      text(slide, g.label, { x, y: 440, w: 440, h: 50, size: 34, bold: true, head: true, name: `fac-${k}` });
      slide.addText(
        g.items.map((t, i) => ({ text: t, options: { bullet: { code: '25CF' }, breakLine: i < g.items.length - 1 } })),
        { x: inch(x), y: inch(505), w: inch(440), h: inch(260), fontSize: 14, color: MIST, margin: 0, isTextBox: true, paraSpaceAfter: 8, valign: 'top', objectName: `fac-${k}-l` },
      );
    });
  } else {
    label(slide, c.planned.label, accent, 120, 380);
    c.planned.items.forEach((it, k) => {
      text(slide, it.label, { x: 120, y: 432 + k * 140, w: 900, h: 50, size: 34, bold: true, head: true, name: `pl-${k}` });
      text(slide, it.text, { x: 120, y: 482 + k * 140, w: 900, h: 80, size: 28, color: MIST, min: 14, name: `pl-${k}-t` });
    });
    text(slide, c.planned.lewinLabel.toUpperCase(), { x: 120, y: 728, w: 900, h: 36, size: 24, color: MUTE, charSpacing: 3, name: 'lewin-l' });
    c.planned.lewin.forEach((phase, k) => {
      pill(slide, phase, 120 + k * 300, 778, 250, accent, `lewin-${k}`);
      if (k > 0) text(slide, '→', { x: 120 + k * 300 - 44, y: 788, w: 40, h: 44, size: 30, color: accent, align: 'center', name: `lewin-a${k}` });
    });
  }
  counter(slide, 2);
}

/* ------------------------------------------------------------------ */
/*  04 — Formes et niveaux                                             */
/* ------------------------------------------------------------------ */
for (let step = 0; step < 5; step++) {
  const { slide, accent } = stepSlide(3, step, 'left');
  const c = changeTypesContent;
  kicker(slide, slides[3].kicker, accent);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 170, size: 76 });
  if (step < 3) {
    label(slide, c.levelsLabel, accent, 120, 370);
    c.levels.forEach((lv, i) => {
      if (step < i) return;
      item(slide, i, { x: 120, y: 430 + i * 165, w: 880, label: lv.label, text: lv.text, size: 40, tsize: 29, lh: 58, accent, active: step === i, dimmed: step !== i, name: `lv-${i}` });
    });
  } else {
    label(slide, c.natureLabel, accent, 120, 370);
    c.nature.forEach((nt, i) => {
      if (step < 3 + i) return;
      item(slide, i, {
        x: 120, y: 430 + i * 200, w: 880, label: nt.label, text: nt.text, size: 40, tsize: 29, lh: 58, th: 110,
        accent: i === 1 ? 'FFB86B' : accent, active: step === 3 + i, dimmed: step !== 3 + i, name: `nt-${i}`,
      });
    });
  }
  counter(slide, 3);
}

/* ------------------------------------------------------------------ */
/*  05 — Résistance                                                    */
/* ------------------------------------------------------------------ */
const COLUMN_X = [420, 690, 960, 1230, 1500];
for (let step = 0; step < 2; step++) {
  const { slide, accent } = stepSlide(4, step, 'top');
  const c = resistanceContent;
  kicker(slide, slides[4].kicker, accent);
  title(slide, c.title, { x: 120, y: 145, w: 1500, h: 110, size: 84 });
  if (step === 0) {
    text(slide, c.lead, { x: 120, y: 275, w: 1400, h: 100, size: 32, min: 16, name: 'lead' });
    text(slide, `— ${c.leadSource}`, { x: 120, y: 375, w: 800, h: 36, size: 24, color: MUTE, name: 'src' });
  } else {
    text(slide, c.leversLabel.toUpperCase(), { x: 120, y: 300, w: 300, h: 40, size: 24, bold: true, color: accent, charSpacing: 3, name: 'lev-l' });
    c.levers.forEach((lv, k) => {
      text(slide, lv.label, { x: 420 + k * 420, y: 285, w: 400, h: 56, size: 38, bold: true, color: '9FF0FF', head: true, name: `lev-${k}` });
      text(slide, lv.text, { x: 420 + k * 420, y: 342, w: 400, h: 40, size: 27, color: MIST, min: 14, name: `lev-${k}-t` });
    });
  }
  c.causes.forEach((cause, i) => {
    const x = COLUMN_X[i] - 129;
    text(slide, cause.label, { x, y: 515, w: 258, h: 76, size: 29, bold: true, align: 'center', head: true, color: step >= 1 ? MUTE : WHITE, strike: step >= 1, name: `!!cause-${i}` });
    text(slide, cause.text, { x, y: 595, w: 258, h: 70, size: 24, align: 'center', color: step >= 1 ? DIM : MIST, name: `!!cause-${i}-t` });
  });
  counter(slide, 4);
}

/* ------------------------------------------------------------------ */
/*  06 — L'innovation                                                  */
/* ------------------------------------------------------------------ */
for (let step = 0; step < 3; step++) {
  const { slide, accent } = stepSlide(5, step, 'left');
  const c = innovationContent;
  kicker(slide, slides[5].kicker, accent);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 190, size: 86 });
  if (step === 0) {
    label(slide, c.definition.label, accent, 120, 380);
    text(slide, c.definition.text, { x: 120, y: 430, w: 900, h: 230, size: 36, min: 16 });
    text(slide, c.definition.source, { x: 120, y: 690, w: 900, h: 40, size: 25, color: MUTE });
  } else if (step === 1) {
    label(slide, c.creativity.label, accent, 120, 380);
    c.creativity.items.forEach((it, k) => {
      const x = 120 + k * 470;
      panel(slide, x, 440, 410, 220, `cr-${k}-bg`);
      text(slide, it.label, { x: x + 28, y: 466, w: 360, h: 56, size: 38, bold: true, head: true, color: k === 1 ? accent : WHITE, name: `cr-${k}` });
      text(slide, it.text, { x: x + 28, y: 528, w: 360, h: 120, size: 27, color: MIST, min: 14, name: `cr-${k}-t` });
    });
    text(slide, '→', { x: 538, y: 520, w: 50, h: 60, size: 44, color: accent, align: 'center', name: 'cr-arrow' });
    text(slide, c.creativity.note, { x: 120, y: 700, w: 900, h: 100, size: 28, italic: true, color: MIST, min: 14 });
  } else {
    label(slide, c.types.label, accent, 120, 380);
    c.types.items.forEach((it, i) => {
      const x = 120 + (i % 2) * 460;
      const y = 440 + Math.floor(i / 2) * 200;
      text(slide, `${String(i + 1).padStart(2, '0')}  ${it.label}`, { x, y, w: 430, h: 52, size: 36, bold: true, head: true, name: `ty-${i}` });
      text(slide, it.text, { x, y: y + 56, w: 420, h: 120, size: 26, color: MIST, min: 14, name: `ty-${i}-t` });
    });
  }
  counter(slide, 5);
}

/* ------------------------------------------------------------------ */
/*  07 — L'innovation en action                                        */
/* ------------------------------------------------------------------ */
const PLATFORM_COLORS = ['45E0FF', '8F7BFF', '4F8CFF', 'FFB86B', '3FE0C5'];
for (let step = 0; step < 2; step++) {
  const { slide, accent } = stepSlide(6, step, 'left');
  const c = innovationOrgsContent;
  kicker(slide, slides[6].kicker, accent);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 170, size: 68 });
  if (step === 0) {
    c.benefits.forEach((b, i) =>
      item(slide, i, { x: 120, y: 350 + i * 118, w: 880, label: b.label, text: b.text, size: 33, tsize: 27, lh: 48, th: 50, accent: PLATFORM_COLORS[i], color: PLATFORM_COLORS[i], active: true, name: `be-${i}` }),
    );
  } else {
    label(slide, c.examplesLabel, accent, 120, 350);
    c.examples.forEach((ex, i) => {
      text(slide, ex.label, { x: 120, y: 405 + i * 130, w: 760, h: 50, size: 34, bold: true, head: true, name: `ex-${i}` });
      text(slide, ex.text, { x: 120, y: 455 + i * 130, w: 760, h: 70, size: 27, color: MIST, min: 14, name: `ex-${i}-t` });
    });
    panel(slide, 120, 810, 800, 150, 'rogers-bg');
    text(slide, c.rogers, { x: 156, y: 830, w: 740, h: 80, size: 29, min: 14, name: 'rogers' });
    text(slide, `— ${c.rogersSource}`, { x: 156, y: 912, w: 600, h: 36, size: 24, color: MUTE, name: 'rogers-s' });
  }
  counter(slide, 6);
}

/* ------------------------------------------------------------------ */
/*  08 — L'apprentissage organisationnel                               */
/* ------------------------------------------------------------------ */
for (let step = 0; step < 5; step++) {
  const { slide, accent } = stepSlide(7, step, 'left');
  const c = learningContent;
  kicker(slide, slides[7].kicker, accent);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 180, size: 80 });
  if (step < 3) {
    label(slide, c.levelsLabel, accent, 120, 370);
    c.levels.forEach((lv, i) => {
      if (step < i) return;
      item(slide, i, { x: 120, y: 430 + i * 170, w: 880, label: lv.label, text: lv.text, size: 40, tsize: 29, lh: 58, th: 100, accent, active: step === i, dimmed: step !== i, name: `lv-${i}` });
    });
  } else if (step === 3) {
    label(slide, c.mechanismsLabel, accent, 120, 370);
    c.mechanisms.forEach((m, i) =>
      item(slide, i, { x: 120, y: 430 + i * 160, w: 880, label: m.label, text: m.text, size: 40, tsize: 29, lh: 58, accent, active: true, name: `me-${i}` }),
    );
  } else {
    label(slide, c.loopsLabel, accent, 120, 370);
    const LOOP = ['7FF7FF', 'FFB86B'];
    c.loops.forEach((lp, i) => {
      const y = 440 + i * 200;
      const d = i === 0 ? 56 : 92;
      slide.addShape(pres.shapes.OVAL, {
        x: inch(120 + (96 - d) / 2), y: inch(y + (96 - d) / 2), w: inch(d), h: inch(d),
        fill: { type: 'none' }, line: { color: LOOP[i], width: 2.5 }, objectName: `loop-${i}-c`,
      });
      if (i === 1)
        slide.addShape(pres.shapes.OVAL, { x: inch(146), y: inch(y + 26), w: inch(44), h: inch(44), fill: { type: 'none' }, line: { color: LOOP[0], width: 1.5, transparency: 40 }, objectName: 'loop-1-c2' });
      text(slide, lp.label, { x: 250, y: y + 4, w: 760, h: 56, size: 40, bold: true, head: true, color: LOOP[i], name: `loop-${i}` });
      text(slide, lp.text, { x: 250, y: y + 62, w: 760, h: 90, size: 29, color: MIST, min: 14, name: `loop-${i}-t` });
    });
  }
  counter(slide, 7);
}

/* ------------------------------------------------------------------ */
/*  09 — L'organisation apprenante                                     */
/* ------------------------------------------------------------------ */
const DISCIPLINE_COLORS = ['4F8CFF', 'A98BFF', 'FFB86B', '3FE0C5', 'E8FBFF'];
for (let step = 0; step < 3; step++) {
  const { slide, accent } = stepSlide(8, step, 'left');
  const c = learningOrgContent;
  kicker(slide, slides[8].kicker, accent);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 180, size: 80 });
  if (step === 0) {
    panel(slide, 120, 360, 880, 250, 'def-bg');
    text(slide, c.definition, { x: 160, y: 390, w: 810, h: 150, size: 34, min: 16, name: 'def' });
    text(slide, `— ${c.definitionSource}`, { x: 160, y: 548, w: 810, h: 40, size: 24, color: MUTE, name: 'def-s' });
    const widths = [300, 300, 250, 190, 230];
    let x = 120;
    let y = 660;
    c.traits.forEach((t, i) => {
      if (x + widths[i] > 1010) {
        x = 120;
        y += 84;
      }
      pill(slide, t, x, y, widths[i], accent, `trait-${i}`);
      x += widths[i] + 18;
    });
  } else {
    label(slide, c.disciplinesLabel, accent, 120, 360);
    c.disciplines.forEach((d, i) =>
      item(slide, i, {
        x: 120, y: 415 + i * 98, w: 880, label: d.label, text: d.text, size: 32, tsize: 26, lh: 46, th: 44,
        accent: DISCIPLINE_COLORS[i], color: DISCIPLINE_COLORS[i], active: step === 1 || i === 4, dimmed: step >= 2 && i !== 4, name: `di-${i}`,
      }),
    );
    if (step >= 2) text(slide, c.systemsNote, { x: 120, y: 905, w: 760, h: 80, size: 27, italic: true, color: MIST, min: 14, name: 'sys' });
  }
  counter(slide, 8);
}

/* ------------------------------------------------------------------ */
/*  10 — Le lien entre les trois concepts                              */
/* ------------------------------------------------------------------ */
const CYCLE_COLORS = ['4F8CFF', 'A98BFF', '3FE0C5', '9FD8FF'];
for (let step = 0; step < 5; step++) {
  const { slide, accent } = stepSlide(9, step, 'left');
  const c = relationshipContent;
  kicker(slide, slides[9].kicker, accent);
  title(slide, c.title, { x: 120, y: 145, w: 880, h: 170, size: 74 });
  c.cycle.forEach((it, i) => {
    if (step < i) return;
    const y = 345 + i * 128;
    const on = step === i || step === 4;
    if (i > 0) text(slide, '↓', { x: 120, y: y - 34, w: 40, h: 34, size: 30, color: CYCLE_COLORS[i], name: `cy-${i}-a` });
    text(slide, it.label.toUpperCase(), { x: 120, y, w: 880, h: 50, size: 36, bold: true, head: true, color: on ? CYCLE_COLORS[i] : MUTE, name: `cy-${i}` });
    text(slide, it.text, { x: 120, y: y + 48, w: 880, h: 44, size: 27, color: on ? MIST : DIM, min: 14, name: `cy-${i}-t` });
  });
  if (step >= 4) {
    panel(slide, 120, 870, 880, 120, 'syn-bg');
    text(slide, c.synthesis, { x: 156, y: 890, w: 820, h: 84, size: 28, min: 14, name: 'syn' });
  }
  counter(slide, 9);
}

/* ------------------------------------------------------------------ */
/*  11 — Contexte marocain                                             */
/* ------------------------------------------------------------------ */
for (let step = 0; step < 2; step++) {
  const { slide, accent } = stepSlide(10, step, 'left');
  const c = moroccoContent;
  kicker(slide, slides[10].kicker, accent);
  title(slide, c.title, { x: 120, y: 145, w: 920, h: 190, size: 84 });
  const rows = step === 0 ? c.examples : c.challenges;
  label(slide, step === 0 ? c.examplesLabel : c.challengesLabel, step === 0 ? '9FF0FF' : accent, 120, 370);
  rows.forEach((r, i) => {
    const y = 425 + i * 92;
    text(slide, r.label, { x: 120, y, w: 300, h: 80, size: 29, bold: true, head: true, color: step === 0 ? WHITE : 'FFD2A1', name: `row-${i}` });
    text(slide, r.text, { x: 440, y, w: 600, h: 80, size: 26, color: MIST, min: 14, name: `row-${i}-t` });
  });
  if (step === 1) text(slide, c.takeaway, { x: 120, y: 900, w: 940, h: 80, size: 28, bold: true, min: 14, name: 'take' });
  counter(slide, 10);
}

/* ------------------------------------------------------------------ */
/*  12 — Conclusion                                                    */
/* ------------------------------------------------------------------ */
{
  const { slide, accent } = stepSlide(11, 0, 'left');
  const c = conclusionContent;
  kicker(slide, slides[11].kicker, accent);
  title(slide, c.title, { x: 120, y: 145, w: 900, h: 260, size: 72, color: '9FB6FF' });
  const COLORS = ['4F8CFF', 'A98BFF', '3FE0C5'];
  c.summary.forEach((s, i) => {
    slide.addShape(pres.shapes.OVAL, { x: inch(120), y: inch(495 + i * 110), w: inch(18), h: inch(18), fill: { color: COLORS[i] }, line: { type: 'none' }, objectName: `sum-${i}-dot` });
    slide.addText(
      [
        { text: s.label, options: { bold: true, fontSize: 20, color: WHITE, fontFace: HEAD } },
        { text: `  — ${s.text}`, options: { fontSize: 15.5, color: MIST } },
      ],
      { x: inch(160), y: inch(472 + i * 110), w: inch(880), h: inch(64), margin: 0, valign: 'middle', isTextBox: true, objectName: `sum-${i}` },
    );
  });
  counter(slide, 11);
}
{
  const { slide, accent } = stepSlide(11, 1, 'bottom');
  text(slide, 'QUESTION FINALE', { x: 160, y: 768, w: 1600, h: 40, size: 24, color: MUTE, align: 'center', charSpacing: 6, name: 'qf' });
  title(slide, conclusionContent.finalQuestion, { x: 180, y: 815, w: 1560, h: 160, size: 58, align: 'center' });
  void accent;
  counter(slide, 11);
}
{
  const { slide } = stepSlide(11, 2, 'bottom');
  title(slide, conclusionContent.thanks, { x: 160, y: 770, w: 1600, h: 130, size: 100, align: 'center', color: 'C7D4FF' });
  text(slide, presentationInfo.presenters.join('  ·  '), { x: 160, y: 915, w: 1600, h: 50, size: 32, color: MIST, align: 'center', name: 'names' });
  counter(slide, 11);
}

/* ------------------------------------------------------------------ */
/*  13 — Bibliographie                                                 */
/* ------------------------------------------------------------------ */
{
  const { slide, accent } = stepSlide(12, 0, 'center');
  kicker(slide, 'Références', accent);
  title(slide, 'Bibliographie', { x: 120, y: 145, w: 1200, h: 110, size: 80 });
  bibliography.forEach((ref, i) => {
    const x = 120 + (i % 2) * 860;
    const y = 300 + Math.floor(i / 2) * 140;
    slide.addText(
      [
        { text: `${ref.authors} `, options: { bold: true, color: WHITE } },
        { text: `(${ref.year}). `, options: { color: accent } },
        { text: `${ref.title}. `, options: { italic: true, color: WHITE, breakLine: true } },
        { text: ref.details, options: { color: MUTE } },
      ],
      { x: inch(x), y: inch(y), w: inch(800), h: inch(126), fontSize: 13, margin: 0, valign: 'top', isTextBox: true, objectName: `ref-${i}`, lineSpacingMultiple: 1.05 },
    );
  });
  counter(slide, 12);
}

/* ------------------------------------------------------------------ */
/*  14 — Questions & échanges                                          */
/* ------------------------------------------------------------------ */
{
  const { slide, accent } = stepSlide(13, 0, 'radial');
  text(slide, 'ÉCHANGES', { x: 360, y: 205, w: 1200, h: 40, size: 24, color: MIST, align: 'center', charSpacing: 10 });
  title(slide, questionsContent.title, { x: 160, y: 255, w: 1600, h: 140, size: 108, align: 'center', color: 'B8C7FF' });
  text(slide, questionsContent.lead, { x: 360, y: 410, w: 1200, h: 50, size: 32, color: MIST, align: 'center' });
  text(slide, questionsContent.creditsLabel.toUpperCase(), { x: 360, y: 520, w: 1200, h: 36, size: 22, color: MUTE, align: 'center', charSpacing: 6 });
  text(slide, presentationInfo.presenters.join('   /   '), { x: 360, y: 562, w: 1200, h: 64, size: 44, align: 'center', head: true });
  text(slide, `${presentationInfo.module} · Filière ${presentationInfo.field}\n${presentationInfo.academicYear}`, { x: 360, y: 640, w: 1200, h: 80, size: 24, color: MUTE, align: 'center' });
  logo(slide, (1920 - 130 * LOGO_RATIO) / 2, 745, 130);
  void accent;
  counter(slide, 13);
}

/* ------------------------------------------------------------------ */

const deckPath = path.join(OUT, 'base.pptx');
await pres.writeFile({ fileName: deckPath });
if (SKILL_THEME) {
  const require = createRequire(import.meta.url);
  const { applyTheme } = require(SKILL_THEME);
  await applyTheme(deckPath, THEME);
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`base deck: ${deckPath} (${manifest.length} slides)`);
