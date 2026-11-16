export type SlideId =
  | 'intro'
  | 'question'
  | 'change'
  | 'change-types'
  | 'resistance'
  | 'innovation'
  | 'innovation-orgs'
  | 'learning'
  | 'learning-org'
  | 'relationship'
  | 'morocco'
  | 'conclusion'
  | 'bibliography'
  | 'questions';

export type Vec3 = [number, number, number];

export interface CameraPose {
  position: Vec3;
  target: Vec3;
}

export interface SlideMeta {
  id: SlideId;
  /** Section label, e.g. "03 — Le changement organisationnel" */
  kicker: string;
  /** Short title (overview, presenter view, progress tooltip) */
  title: string;
  /** One line describing the scene in the overview */
  overview: string;
  /** Accent colour driving UI highlights and ambient particles */
  accent: string;
  /** Number of progressive reveals inside the slide (>= 1) */
  steps: number;
  /** Optional per-step camera choreography (index = step, clamped) */
  camera?: CameraPose[];
}

export interface LabeledText {
  label: string;
  text: string;
}

export interface SpeakerNote {
  /** Key ideas to say, in order */
  say: string[];
  /** How to open the slide */
  intro: string;
  /** A concrete example to give orally */
  example: string;
  /** Bridge sentence towards the next slide */
  transition: string;
  /** Optional per-step cues (what each reveal shows) */
  cues?: string[];
}
