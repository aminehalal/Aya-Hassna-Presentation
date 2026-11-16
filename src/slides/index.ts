import type { ComponentType } from 'react';
import type { SlideId } from '../content/types';
import { Slide01Intro } from './Slide01Intro';
import { Slide02Question } from './Slide02Question';
import { Slide03Change } from './Slide03Change';
import { Slide04ChangeTypes } from './Slide04ChangeTypes';
import { Slide05Resistance } from './Slide05Resistance';
import { Slide06Innovation } from './Slide06Innovation';
import { Slide07InnovationInOrganizations } from './Slide07InnovationInOrganizations';
import { Slide08Learning } from './Slide08Learning';
import { Slide09LearningOrganization } from './Slide09LearningOrganization';
import { Slide10Relationship } from './Slide10Relationship';
import { Slide11Morocco } from './Slide11Morocco';
import { Slide12Conclusion } from './Slide12Conclusion';
import { Slide13Bibliography } from './Slide13Bibliography';
import { Slide14Questions } from './Slide14Questions';
import type { SlideProps } from './types';

/** Text layer of each slide (the 3D layer lives in components/3d/scenes). */
export const slideComponents: Record<SlideId, ComponentType<SlideProps>> = {
  intro: Slide01Intro,
  question: Slide02Question,
  change: Slide03Change,
  'change-types': Slide04ChangeTypes,
  resistance: Slide05Resistance,
  innovation: Slide06Innovation,
  'innovation-orgs': Slide07InnovationInOrganizations,
  learning: Slide08Learning,
  'learning-org': Slide09LearningOrganization,
  relationship: Slide10Relationship,
  morocco: Slide11Morocco,
  conclusion: Slide12Conclusion,
  bibliography: Slide13Bibliography,
  questions: Slide14Questions,
};
