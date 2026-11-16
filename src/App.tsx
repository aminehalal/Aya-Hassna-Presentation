import { MotionConfig } from 'motion/react';
import { Suspense, lazy } from 'react';
import { PresentationEngine } from './components/presentation/PresentationEngine';
import { PresentationProvider } from './components/presentation/PresentationContext';
import { PresenterView } from './components/presentation/PresenterView';

const query = new URLSearchParams(window.location.search);
const isPresenterView = query.get('view') === 'presenter';
const isRecording = import.meta.env.DEV && query.get('record') === '1';

// Recording mode is development-only and loaded on demand (never in the production bundle).
const SceneRecorder = lazy(() => import('./recording/SceneRecorder').then((m) => ({ default: m.SceneRecorder })));

export default function App() {
  if (isRecording)
    return (
      <Suspense fallback={null}>
        <SceneRecorder />
      </Suspense>
    );
  if (isPresenterView) return <PresenterView />;
  return (
    <MotionConfig reducedMotion="user">
      <PresentationProvider>
        <PresentationEngine />
      </PresentationProvider>
    </MotionConfig>
  );
}
