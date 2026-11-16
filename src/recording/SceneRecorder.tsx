import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import { useEffect, useRef, useState } from 'react';
import { slides } from '../content/presentation';
import SceneCanvas from '../components/3d/SceneCanvas';

/**
 * Recording mode (`?record=1`), used to export the 3D scenes for the
 * PowerPoint version. It plays every step of every slide in order — exactly
 * like a live presentation — and records the canvas of each step as a video
 * clip, uploaded to the dev server (see the `scene-recordings` plugin in
 * vite.config.ts). The text is not recorded: in PowerPoint it is native text.
 *
 * URL options: `dpr` (pixel ratio, default 1.25), `seconds` (clip length,
 * default 9), `only` (e.g. `only=3` to record a single slide).
 */

const params = new URLSearchParams(window.location.search);
const DPR = Number(params.get('dpr') ?? 1.25);
const CLIP_SECONDS = Number(params.get('seconds') ?? 9);
const ONLY = params.get('only') ? Number(params.get('only')) - 1 : null;
const SETTLE_MS = 3200;

const FPS = 30;
const BITRATE = 3_200_000;
const CODECS = ['avc1.640028', 'avc1.4d4028', 'avc1.42e028'];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pad = (n: number) => String(n).padStart(2, '0');

async function log(message: string) {
  console.log('[record]', message);
  await fetch('/__recordings/log', { method: 'POST', body: `${new Date().toISOString()} ${message}` }).catch(() => {});
}

async function measureFps(ms = 2000) {
  let frames = 0;
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      frames++;
      if (performance.now() - start < ms) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
  return (frames * 1000) / (performance.now() - start);
}

/**
 * Encodes the canvas with WebCodecs (H.264) into a standard, non-fragmented
 * MP4 (moov atom first) — the format PowerPoint can embed.
 */
async function recordClip(canvas: HTMLCanvasElement, seconds: number, codec: string, begin: () => void) {
  const { width, height } = canvas;
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width, height, frameRate: FPS },
    fastStart: 'in-memory',
  });
  let failure: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => (failure = e),
  });
  encoder.configure({ codec, width, height, bitrate: BITRATE, framerate: FPS, avc: { format: 'avc' } });

  const total = Math.round(seconds * FPS);
  let frameIndex = 0;
  const start = performance.now();
  begin();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = performance.now() - start;
      // One encoded frame every 1/30 s of real time
      while (frameIndex < total && (frameIndex * 1000) / FPS <= elapsed) {
        const frame = new VideoFrame(canvas, { timestamp: Math.round((frameIndex * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
        encoder.encode(frame, { keyFrame: frameIndex % (FPS * 2) === 0 });
        frame.close();
        frameIndex++;
      }
      if (frameIndex < total) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
  await encoder.flush();
  encoder.close();
  muxer.finalize();
  if (failure) throw failure;
  return muxer.target.buffer;
}

interface RecState {
  index: number;
  step: number;
  resetKey: number;
}

export function SceneRecorder() {
  // When re-recording one slide, start from the previous slide's final state so the
  // first clip still shows the transition into this slide.
  const [state, setState] = useState<RecState>(() =>
    ONLY ? { index: ONLY - 1, step: slides[ONLY - 1].steps - 1, resetKey: 0 } : { index: 0, step: 0, resetKey: 0 },
  );
  const [status, setStatus] = useState('Préparation…');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      await sleep(2500);
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        await log('ERROR no canvas');
        return;
      }
      let codec: string | undefined;
      for (const c of CODECS) {
        const support = await VideoEncoder.isConfigSupported({ codec: c, width: canvas.width, height: canvas.height, bitrate: BITRATE, framerate: FPS });
        if (support.supported) {
          codec = c;
          break;
        }
      }
      if (!codec) {
        await log('ERROR no supported H.264 encoder');
        return;
      }
      const fps = await measureFps();
      await log(`START codec=${codec} canvas=${canvas.width}x${canvas.height} fps=${fps.toFixed(1)}`);

      const clips = slides.flatMap((s, i) => Array.from({ length: s.steps }, (_, st) => ({ i, st })));
      const todo = ONLY === null ? clips : clips.filter((c) => c.i === ONLY);

      for (const [n, clip] of todo.entries()) {
        const name = `slide-${pad(clip.i + 1)}-step-${clip.st + 1}.mp4`;
        setStatus(`${n + 1}/${todo.length} — ${name}`);
        // The previous clip ended on this clip's starting state: let it settle.
        await sleep(SETTLE_MS);
        const isFirst = n === 0;
        const buffer = await recordClip(canvas, CLIP_SECONDS, codec, () =>
          setState((prev) =>
            isFirst && clip.i === 0 && clip.st === 0
              ? { index: clip.i, step: 0, resetKey: prev.resetKey + 1 } // fresh entrance
              : { index: clip.i, step: clip.st, resetKey: prev.resetKey },
          ),
        );
        await fetch(`/__recordings/${name}`, { method: 'POST', body: buffer });
        await log(`SAVED ${name} ${(buffer.byteLength / 1e6).toFixed(1)}MB`);
      }
      setStatus('Terminé');
      await log('DONE');
    };
    run().catch((e) => log(`ERROR ${String(e)}`));
  }, []);

  return (
    // Exactly 16:9 (1280×720 CSS px), whatever the browser window size
    <div style={{ position: 'fixed', left: 0, top: 0, width: 1280, height: 720, overflow: 'hidden', background: '#03050b' }}>
      <SceneCanvas index={state.index} step={state.step} direction={1} reducedMotion={false} fixedDpr={DPR} resetKey={state.resetKey} />
      <div style={{ position: 'fixed', left: 8, top: 730, color: '#ffffff55', font: '12px sans-serif', pointerEvents: 'none' }}>
        {status}
      </div>
    </div>
  );
}
