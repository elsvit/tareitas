import { t } from '~/services';

export type OnboardingIntroSlideId =
  | 'create-tasks'
  | 'earn-stars'
  | 'select-reward';

export type OnboardingIntroSlide = {
  id: OnboardingIntroSlideId;
  step: number;
  title: string;
  description: string;
};

export const getOnboardingIntroSlides = (): OnboardingIntroSlide[] => [
  {
    id: 'create-tasks',
    step: 1,
    title: t('onboarding.slides.create_tasks.title'),
    description: t('onboarding.slides.create_tasks.description'),
  },
  {
    id: 'earn-stars',
    step: 2,
    title: t('onboarding.slides.earn_stars.title'),
    description: t('onboarding.slides.earn_stars.description'),
  },
  {
    id: 'select-reward',
    step: 3,
    title: t('onboarding.slides.select_reward.title'),
    description: t('onboarding.slides.select_reward.description'),
  },
];
