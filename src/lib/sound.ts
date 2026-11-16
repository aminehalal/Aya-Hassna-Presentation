/**
 * Procedural, animation-synchronised sound design (Web Audio API).
 * No audio files: everything is synthesised live, so it works offline.
 *
 *  transition() — follows the 3D "warp" between slides: an airy sweep that
 *                 rises for 0.45 s (scene rushing past the camera) and fades
 *                 over 0.9 s, then a warm chord blooms as the new scene
 *                 emerges from the fog. Each slide has its own chord, so the
 *                 whole talk forms one harmonic progression.
 *  morph()      — for 3D transformations inside a slide (hierarchy → network,
 *                 tree growing, spiral forming…): a pad that slowly opens for
 *                 exactly the duration of the animation, with soft notes on
 *                 its key moments (e.g. each barrier opening).
 *  reveal()     — a single soft mallet note for simple text reveals.
 *  tick()       — a discreet click for interface actions.
 *
 * Browsers only allow audio after a user gesture: the context is created on
 * the first key press / click (unlock()).
 */

const STORAGE_KEY = 'est-presentation-sound';
type Listener = (enabled: boolean) => void;

export interface SoundCue {
  /** Duration of the 3D animation, in seconds */
  duration: number;
  /** Key moments (seconds from the start) that get a note */
  hits?: number[];
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

/** One chord per slide (A minor colour: Am F C G Dm Em …), low register for pads. */
const PROGRESSION = [
  [45, 52, 57, 60], // Am
  [41, 48, 53, 57], // F
  [48, 55, 60, 64], // C
  [43, 50, 55, 59], // G
  [50, 57, 62, 65], // Dm
  [52, 59, 64, 67], // Em
];
const chordFor = (slide: number) => PROGRESSION[slide % PROGRESSION.length];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverb: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private listeners = new Set<Listener>();
  enabled: boolean;

  constructor() {
    this.enabled = typeof localStorage === 'undefined' || localStorage.getItem(STORAGE_KEY) !== 'off';
    if (typeof window !== 'undefined') {
      // Keeps the audience and presenter windows in agreement.
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) this.apply(e.newValue !== 'off');
      });
    }
  }

  /* ------------------------------------------------------------ setup */

  /** Must be called from a user gesture (keydown / pointerdown). */
  unlock() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      this.ctx = ctx;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -20;
      compressor.ratio.value = 3;
      this.master = ctx.createGain();
      this.master.gain.value = 0.7;
      this.master.connect(compressor).connect(ctx.destination);

      // A soft hall: gives every sound the depth of the 3D space
      const convolver = ctx.createConvolver();
      convolver.buffer = this.createImpulse(ctx, 2.6);
      this.reverb = ctx.createGain();
      this.reverb.gain.value = 0.32;
      this.reverb.connect(convolver).connect(this.master);

      this.noise = this.createNoise(ctx);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setEnabled(value: boolean) {
    this.apply(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off');
    } catch {
      /* private mode: the setting simply is not persisted */
    }
  }

  toggle() {
    this.setEnabled(!this.enabled);
    if (this.enabled) this.tick();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private apply(value: boolean) {
    this.enabled = value;
    this.listeners.forEach((l) => l(value));
  }

  private ready() {
    return this.enabled && this.ctx && this.master && this.ctx.state === 'running' ? this.ctx : null;
  }

  private createNoise(ctx: AudioContext) {
    const length = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.11;
    }
    return buffer;
  }

  private createImpulse(ctx: AudioContext, seconds: number) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.2);
    }
    return buffer;
  }

  /** Output bus for one voice: dry to the master, part to the hall. */
  private bus(ctx: AudioContext, wet = 1) {
    const out = ctx.createGain();
    out.connect(this.master!);
    const send = ctx.createGain();
    send.gain.value = wet;
    out.connect(send).connect(this.reverb!);
    return out;
  }

  /* ------------------------------------------------------------ voices */

  /** Warm pad: two slightly detuned saws per note through an opening low-pass filter. */
  private pad(ctx: AudioContext, t: number, notes: number[], o: { attack: number; hold: number; release: number; level: number; from: number; to: number }) {
    const out = this.bus(ctx, 1.2);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(o.from, t);
    filter.frequency.exponentialRampToValueAtTime(o.to, t + o.attack + o.hold);
    filter.frequency.exponentialRampToValueAtTime(Math.max(200, o.from), t + o.attack + o.hold + o.release);
    const amp = ctx.createGain();
    const end = t + o.attack + o.hold + o.release;
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(o.level, t + o.attack);
    amp.gain.setValueAtTime(o.level, t + o.attack + o.hold);
    amp.gain.exponentialRampToValueAtTime(0.0001, end);
    filter.connect(amp).connect(out);
    notes.forEach((n) => {
      [-7, 7].forEach((cents) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = midi(n);
        osc.detune.value = cents;
        const g = ctx.createGain();
        g.gain.value = 0.5 / notes.length;
        osc.connect(g).connect(filter);
        osc.start(t);
        osc.stop(end + 0.05);
      });
    });
  }

  /** Soft mallet note (glass marimba): triangle + quiet octave, short decay. */
  private pluck(ctx: AudioContext, t: number, note: number, level: number, decay = 1.1, pan = 0) {
    const out = this.bus(ctx, 0.9);
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.frequency.exponentialRampToValueAtTime(700, t + decay);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(level, t + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    filter.connect(amp).connect(panner).connect(out);
    [
      ['triangle', 1, 1],
      ['sine', 2, 0.25],
    ].forEach(([type, ratio, gain]) => {
      const osc = ctx.createOscillator();
      osc.type = type as OscillatorType;
      osc.frequency.value = midi(note) * (ratio as number);
      const g = ctx.createGain();
      g.gain.value = gain as number;
      osc.connect(g).connect(filter);
      osc.start(t);
      osc.stop(t + decay + 0.05);
    });
  }

  /** Filtered air that follows a frequency path — the sound of movement. */
  private air(ctx: AudioContext, t: number, path: [number, number][], gains: [number, number][], pan: [number, number] = [0, 0]) {
    if (!this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(path[0][1], t);
    path.slice(1).forEach(([time, f]) => filter.frequency.exponentialRampToValueAtTime(f, t + time));
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    gains.forEach(([time, g]) => amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, g), t + time));
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan[0], t);
    const end = gains[gains.length - 1][0];
    panner.pan.linearRampToValueAtTime(pan[1], t + end);
    src.connect(filter).connect(amp).connect(panner).connect(this.bus(ctx, 0.6));
    src.start(t, Math.random() * 1.5, end + 0.1);
  }

  /* ------------------------------------------------------------ cues */

  /** Slide change, synchronised with the 3D warp (0.45 s in, 0.9 s out) and the scene arrival. */
  transition(direction: 1 | -1, slide: number) {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime + 0.01;
    const chord = chordFor(slide);
    const fwd = direction > 0;

    // 1. The rush: air rising while the old scene flies past, then settling
    this.air(
      ctx,
      t,
      fwd ? [[0, 280], [0.45, 2400], [1.35, 520]] : [[0, 2400], [0.45, 380], [1.35, 900]],
      [[0.45, 0.42], [1.35, 0.0001]],
      fwd ? [-0.4, 0.4] : [0.4, -0.4],
    );
    // A soft tonal glide on top of the air (doppler-like)
    const glide = ctx.createOscillator();
    glide.type = 'sine';
    const root = midi(chord[0] + 24);
    glide.frequency.setValueAtTime(fwd ? root : root * 2, t);
    glide.frequency.exponentialRampToValueAtTime(fwd ? root * 2 : root, t + 0.45);
    const gg = ctx.createGain();
    gg.gain.setValueAtTime(0.0001, t);
    gg.gain.exponentialRampToValueAtTime(0.05, t + 0.4);
    gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    glide.connect(gg).connect(this.bus(ctx, 1));
    glide.start(t);
    glide.stop(t + 1);

    // 2. The arrival: the new scene's chord blooms out of the fog
    this.pad(ctx, t + 0.3, chord, { attack: 0.7, hold: 0.4, release: 2.2, level: 0.15, from: 350, to: 1900 });
    // 3. The landing: one clear note when the scene settles (≈ end of the 1.15 s entrance)
    this.pluck(ctx, t + 1.05, chord[3] + 12, 0.11, 1.6);
  }

  /** In-slide 3D transformation: the pad opens for exactly `cue.duration`, notes mark its key moments. */
  morph(slide: number, step: number, cue: SoundCue) {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime + 0.01;
    const d = cue.duration;
    const chord = chordFor(slide);
    const intensity = Math.min(1, d / 2.6);

    this.pad(ctx, t, chord.map((n) => n + 12), {
      attack: d * 0.65,
      hold: d * 0.35,
      release: 1.8,
      level: 0.07 + 0.07 * intensity,
      from: 300,
      to: 1400 + 1600 * intensity,
    });
    // Gentle air swell following the motion
    this.air(ctx, t, [[0, 400], [d * 0.7, 1800], [d + 0.8, 700]], [[d * 0.6, 0.12 + 0.12 * intensity], [d + 0.8, 0.0001]]);

    // Notes on the animation's key moments: an ascending arpeggio of the chord
    const hits = cue.hits ?? (d >= 2 ? [0.05, d * 0.45, d * 0.9] : [0.05, d * 0.7]);
    hits.forEach((h, i) => {
      const note = chord[(i + step) % chord.length] + 24 + (i >= chord.length ? 12 : 0);
      this.pluck(ctx, t + h, note, 0.09, 1.3, (i / Math.max(1, hits.length - 1) - 0.5) * 0.6);
    });
  }

  /** Simple reveal without a 3D change. */
  reveal(slide: number, step: number) {
    const ctx = this.ready();
    if (!ctx) return;
    const chord = chordFor(slide);
    this.pluck(ctx, ctx.currentTime + 0.01, chord[step % chord.length] + 24, 0.1, 1.2);
  }

  /** Discreet UI click */
  tick() {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1250, t);
    osc.frequency.exponentialRampToValueAtTime(820, t + 0.05);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(gain).connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.08);
  }
}

export const sound = new SoundEngine();
