import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Dev-only endpoint used by the recording mode (`?record=1`) to save the
 * 3D scene clips for the PowerPoint export. Active only when the dev server
 * is started with RECORD_SCENES=1; files land in ./recordings (git-ignored).
 */
function sceneRecordings(): Plugin {
  return {
    name: 'scene-recordings',
    apply: 'serve',
    configureServer(server) {
      if (!process.env.RECORD_SCENES) return;
      const dir = path.resolve(process.cwd(), 'recordings');
      fs.mkdirSync(dir, { recursive: true });
      server.middlewares.use('/__recordings', (req, res, next) => {
        if (req.method !== 'POST') return next();
        const name = decodeURIComponent((req.url ?? '').replace(/^\//, '')).replace(/[^\w.-]/g, '_');
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', () => {
          const body = Buffer.concat(chunks);
          if (name === 'log') fs.appendFileSync(path.join(dir, 'log.txt'), `${body.toString()}\n`);
          else fs.writeFileSync(path.join(dir, name), body);
          res.statusCode = 200;
          res.end('ok');
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sceneRecordings()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1600,
  },
});
