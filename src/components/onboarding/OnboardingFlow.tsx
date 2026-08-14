import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { Button, ProgressBar } from '~/components/ui';
import { ButtonColors } from '~/components/ui/Button';
import { ChildForm } from '~/components/users/UserForm/ChildForm';
import { ParentForm } from '~/components/users/UserForm/ParentForm';
import { t } from '~/services';
import { addChild, clearChildren } from '~/store/children/slice';
import { addParent, clearParents } from '~/store/parents/slice';
import { ERole } from '~/store/settings/enums';
import { setCurrentRole, setCurrentUser } from '~/store/settings/slice';
import { Colors } from '~/styles';
import { EFormMode } from '~/types/ECommon';
import type { ChildFormProps } from '~/types/IChild';
import type { ParentFormProps } from '~/types/IParent';

import { OnboardingComplete } from './OnboardingComplete';
import { OnboardingIntroSlide } from './OnboardingIntroSlide';
import { OnboardingStepHeader } from './OnboardingStepHeader';
import {
  OnboardingStepTransition,
  type OnboardingTransitionDirection,
} from './OnboardingStepTransition';
import {
  ONBOARDING_INTRO_SLIDES_COUNT,
  ONBOARDING_STEP,
  ONBOARDING_TOTAL_STEPS,
} from './constants';
import { getOnboardingIntroSlides } from './onboardingSlides';
import { onboardingStyles as styles } from './styles';

export function OnboardingFlow() {
  const dispatch = useDispatch();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const introSlides = useMemo(() => getOnboardingIntroSlides(), []);

  const [step, setStep] = useState(0);
  const [transitionDirection, setTransitionDirection] =
    useState<OnboardingTransitionDirection>(1);
  const [parent, setParent] = useState<Partial<ParentFormProps>>({
    role: ERole.admin,
  });
  const [child, setChild] = useState<ChildFormProps>();

  const lastStep = ONBOARDING_TOTAL_STEPS - 1;
  const progress = useMemo(() => (step / lastStep) * 100, [step, lastStep]);

  const isIntroStep = step < ONBOARDING_INTRO_SLIDES_COUNT;
  const isParentStep = step === ONBOARDING_STEP.parent;
  const isChildStep = step === ONBOARDING_STEP.child;
  const isCompleteStep = step === ONBOARDING_STEP.complete;

  const headerTitle = isParentStep
    ? t('users.add_parent')
    : isChildStep
      ? t('users.add_child')
      : isCompleteStep
        ? t('onboarding.complete.header')
        : t('onboarding.header');

  const goToStep = (nextStep: number) => {
    setTransitionDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  const onBack = () => {
    if (step > 0) {
      goToStep(step - 1);
    }
  };

  const finishOnboarding = () => {
    if (!parent.name || !child?.name) {
      return;
    }

    const parentId = uuidv4();
    const childId = uuidv4();

    dispatch(clearParents());
    dispatch(
      addParent({
        entity: {
          ...parent,
          name: parent.name,
          role: ERole.admin,
          id: parentId,
          createdAt: new Date().toISOString(),
          createdBy: parentId,
        },
      }),
    );
    dispatch(clearChildren());
    dispatch(
      addChild({
        entity: {
          ...child,
          name: child.name,
          id: childId,
          createdAt: new Date().toISOString(),
          createdBy: parentId,
        },
      }),
    );
    dispatch(setCurrentUser(parentId));
    dispatch(setCurrentRole(ERole.admin));
    router.replace('/(tabs)/Tasks');
  };

  const onNext = () => {
    if (isCompleteStep) {
      finishOnboarding();
      return;
    }

    if (step < lastStep) {
      goToStep(step + 1);
    }
  };

  const onParentSave = (value: ParentFormProps) => {
    setParent(value);
    goToStep(ONBOARDING_STEP.child);
  };

  const onChildSave = (value: ChildFormProps) => {
    setChild(value);
    goToStep(ONBOARDING_STEP.complete);
  };

  const renderStepContent = () => {
    if (isIntroStep) {
      return (
        <OnboardingIntroSlide
          slide={introSlides[step]}
          activeIndex={step}
          totalIntroSlides={ONBOARDING_INTRO_SLIDES_COUNT}
        />
      );
    }

    if (isParentStep) {
      return (
        <>
          <OnboardingStepHeader
            title={t('users.add_parent')}
            description={t('onboarding.parent.subtitle')}
            stepIndicator={t('onboarding.parent.step_indicator')}
            accentColor={Colors.orange500}
          />
          <ParentForm
            mode={EFormMode.Add}
            parent={parent}
            onSave={onParentSave}
            showScreenHeader={false}
          />
        </>
      );
    }

    if (isChildStep) {
      return (
        <>
          <OnboardingStepHeader
            title={t('users.add_child')}
            description={t('onboarding.child.subtitle')}
            stepIndicator={t('onboarding.child.step_indicator')}
            accentColor={Colors.blue600}
          />
          <ChildForm
            mode={EFormMode.Add}
            child={child}
            onSave={onChildSave}
            showScreenHeader={false}
          />
        </>
      );
    }

    if (isCompleteStep) {
      return <OnboardingComplete parent={parent} child={child} />;
    }

    return null;
  };

  return (
    <SafeAreaBgImage>
      <ScreenHeader
        title={headerTitle}
        containerStyle={styles.screenHeader}
        hasBackButton={step > 0}
        onBackPress={onBack}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressBar progress={progress} style={styles.progressBar} />

        {isIntroStep ? (
          renderStepContent()
        ) : (
          <OnboardingStepTransition stepKey={step} direction={transitionDirection}>
            {renderStepContent()}
          </OnboardingStepTransition>
        )}

        {(isIntroStep || isCompleteStep) && (
          <View style={styles.footer}>
            {step > 0 ? (
              <Button
                mode="contained"
                onPress={onBack}
                bgColor={ButtonColors.Gray}
                style={styles.footerBtn}
              >
                {t('button.go_back')}
              </Button>
            ) : (
              <View />
            )}
            <Button mode="contained" onPress={onNext} style={styles.footerBtn}>
              {isCompleteStep ? t('onboarding.complete.cta') : t('button.next')}
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaBgImage>
  );
}
