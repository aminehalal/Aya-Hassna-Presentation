import type { ComponentType } from 'react';
import type { SlideId } from '../../../content/types';
import type { SceneProps } from '../sceneSettings';
import { BibliographyScene } from './BibliographyScene';
import { ChangeScene } from './ChangeScene';
import { ConclusionScene } from './ConclusionScene';
import { InnovationOrgsScene } from './InnovationOrgsScene';
import { InnovationScene } from './InnovationScene';
import { IntroScene } from './IntroScene';
import { LearningOrgScene } from './LearningOrgScene';
import { LearningScene } from './LearningScene';
import { LevelsScene } from './LevelsScene';
import { MoroccoScene } from './MoroccoScene';
import { QuestionScene } from './QuestionScene';
import { QuestionsScene } from './QuestionsScene';
import { RelationshipScene } from './RelationshipScene';
import { ResistanceScene } from './ResistanceScene';

/** One unique visual metaphor per slide. */
export const sceneComponents: Record<SlideId, ComponentType<SceneProps>> = {
  intro: IntroScene,
  question: QuestionScene,
  change: ChangeScene,
  'change-types': LevelsScene,
  resistance: ResistanceScene,
  innovation: InnovationScene,
  'innovation-orgs': InnovationOrgsScene,
  learning: LearningScene,
  'learning-org': LearningOrgScene,
  relationship: RelationshipScene,
  morocco: MoroccoScene,
  conclusion: ConclusionScene,
  bibliography: BibliographyScene,
  questions: QuestionsScene,
};
