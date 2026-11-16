import { MotionConfig } from 'motion/react';
import { PresentationEngine } from './components/presentation/PresentationEngine';
import { PresentationProvider } from './components/presentation/PresentationContext';
import { PresenterView } from './components/presentation/PresenterView';

const isPresenterView = new URLSearchParams(window.location.search).get('view') === 'presenter';

export default function App() {
  if (isPresenterView) return <PresenterView />;
  return (
    <MotionConfig reducedMotion="user">
      <PresentationProvider>
        <PresentationEngine />
      </PresentationProvider>
    </MotionConfig>
  );
}
