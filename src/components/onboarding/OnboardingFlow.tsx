import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { Button, ProgressBar } from '~/components/ui';
import { ButtonColors } from '~/components/ui/Button';
import { ChildForm } from '~/components/users/UserForm/ChildForm';
import { ParentForm } from '~/components/users/UserForm/ParentForm';
import { t } from '~/services';
import { signupAndLoadFamily } from '~/services/multideviceSetup';
import { clearFamilyStore, hydrateFamilyStore } from '~/services/familySync';
import { ApiError } from '~/services/api/client';
import type { AppDispatch } from '~/store';
import { addChild, clearChildren } from '~/store/children/slice';
import { addParent, clearParents } from '~/store/parents/slice';
import { selectParentIds } from '~/store/parents/selectors';
import { ERole, ESyncMode } from '~/store/settings/enums';
import {
  selectPendingReturnRoute,
  selectRequireLogin,
  selectSyncMode,
} from '~/store/settings/selectors';
import {
  setCurrentRole,
  setCurrentUser,
  setPendingReturnRoute,
  setRequireLogin,
  setSyncMode,
} from '~/store/settings/slice';
import { Colors } from '~/styles';
import { EFormMode } from '~/types/ECommon';
import type { ChildFormProps } from '~/types/IChild';
import type { ParentFormProps } from '~/types/IParent';

import { OnboardingComplete } from './OnboardingComplete';
import { OnboardingIntroSlide } from './OnboardingIntroSlide';
import { OnboardingSignUpAdminStep } from './OnboardingSignUpAdminStep';
import { OnboardingSignUpChildStep } from './OnboardingSignUpChildStep';
import {
  OnboardingSyncModeStep,
  type OnboardingSetupPath,
} from './OnboardingSyncModeStep';
import { OnboardingStepHeader } from './OnboardingStepHeader';
import {
  OnboardingStepTransition,
  type OnboardingTransitionDirection,
} from './OnboardingStepTransition';
import {
  ONBOARDING_DEVICE_ONLY_TOTAL,
  ONBOARDING_INTRO_SLIDES_COUNT,
  ONBOARDING_MULTIDEVICE_TOTAL,
  ONBOARDING_STEP,
} from './constants';
import { getOnboardingIntroSlides } from './onboardingSlides';
import { onboardingStyles as styles } from './styles';

type SignUpAdminData = ParentFormProps & {
  email: string;
  familyName: string;
  pin: string;
};

type OnboardingFlowProps = {
  /** Skip intro slides and open directly on "Elige tu configuración". */
  skipIntro?: boolean;
};

export function OnboardingFlow({
  skipIntro = false,
}: OnboardingFlowProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const requireLogin = useSelector(selectRequireLogin);
  const pendingReturnRoute = useSelector(selectPendingReturnRoute);
  const parentIds = useSelector(selectParentIds);
  const storedSyncMode = useSelector(selectSyncMode);

  const introSlides = useMemo(() => getOnboardingIntroSlides(), []);

  const opensOnSetup = skipIntro || requireLogin;
  const initialStep = opensOnSetup ? ONBOARDING_STEP.syncMode : 0;

  const [step, setStep] = useState(initialStep);
  const [transitionDirection, setTransitionDirection] =
    useState<OnboardingTransitionDirection>(1);
  const [setupPath, setSetupPath] = useState<OnboardingSetupPath>(
    requireLogin ? 'connect' : 'create',
  );
  const [parent, setParent] = useState<Partial<ParentFormProps>>({
    role: ERole.admin,
  });
  const [child, setChild] = useState<ChildFormProps>();
  const [syncMode, setSyncModeSelection] = useState(storedSyncMode);
  const [signUpAdmin, setSignUpAdmin] =
    useState<Partial<SignUpAdminData>>({ role: ERole.admin });
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [isSubmittingSignUp, setIsSubmittingSignUp] = useState(false);

  const isMultidevice = syncMode === ESyncMode.multidevice;
  const isMultideviceFlow =
    setupPath === 'connect' ||
    (setupPath === 'create' && isMultidevice);
  const totalSteps = isMultideviceFlow
    ? ONBOARDING_MULTIDEVICE_TOTAL
    : ONBOARDING_DEVICE_ONLY_TOTAL;
  const lastStep = totalSteps - 1;
  const progress = useMemo(
    () => (step / lastStep) * 100,
    [step, lastStep],
  );

  const isIntroStep = step < ONBOARDING_INTRO_SLIDES_COUNT;
  const isSyncModeStep = step === ONBOARDING_STEP.syncMode;
  const isSignUpAdminStep =
    isMultideviceFlow && step === ONBOARDING_STEP.signUpAdmin;
  const isSignUpChildStep =
    isMultideviceFlow && step === ONBOARDING_STEP.signUpChild;
  const isParentStep =
    !isMultideviceFlow && step === ONBOARDING_STEP.parent;
  const isChildStep =
    !isMultideviceFlow && step === ONBOARDING_STEP.child;
  const isCompleteStep = step === ONBOARDING_STEP.complete;
  const canExitFromSyncMode =
    opensOnSetup && parentIds.length > 0 && isSyncModeStep;
  const canGoBack =
    step > (opensOnSetup ? ONBOARDING_STEP.syncMode : 0) ||
    canExitFromSyncMode;

  const headerTitle = isSyncModeStep
    ? t('onboarding.sync_mode.header')
    : isSignUpAdminStep
        ? t('onboarding.sign_up.admin_header')
        : isSignUpChildStep
          ? t('onboarding.sign_up.child_header')
          : isParentStep
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

  const getPreviousStep = (currentStep: number) => {
    if (
      isMultideviceFlow &&
      currentStep === ONBOARDING_STEP.signUpAdmin
    ) {
      return ONBOARDING_STEP.syncMode;
    }

    if (
      isMultideviceFlow &&
      currentStep === ONBOARDING_STEP.signUpChild
    ) {
      return ONBOARDING_STEP.signUpAdmin;
    }

    if (
      !isMultideviceFlow &&
      currentStep === ONBOARDING_STEP.child
    ) {
      return ONBOARDING_STEP.parent;
    }

    return currentStep - 1;
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  const onBack = () => {
    if (canExitFromSyncMode) {
      const returnRoute = pendingReturnRoute;

      dispatch(setRequireLogin(false));
      dispatch(setPendingReturnRoute(null));

      if (returnRoute) {
        router.replace({
          pathname: returnRoute.pathname as never,
          params: returnRoute.params,
        });
        return;
      }

      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace('/(tabs)/Tasks');
      return;
    }

    if (canGoBack) {
      goToStep(getPreviousStep(step));
    }
  };

  const enterApp = () => {
    const returnRoute = pendingReturnRoute;

    dispatch(setPendingReturnRoute(null));
    dispatch(setRequireLogin(false));

    if (returnRoute) {
      router.replace({
        pathname: returnRoute.pathname as never,
        params: returnRoute.params,
      });
      return;
    }

    router.replace('/(tabs)/Tasks');
  };

  const finishOnboarding = () => {
    if (!parent.name) {
      return;
    }

    if (!isMultideviceFlow && !child?.name) {
      return;
    }

    const parentId = uuidv4();

    dispatch(setSyncMode(syncMode));
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

    if (child?.name) {
      const childId = uuidv4();

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
    }

    dispatch(setCurrentUser(parentId));
    dispatch(setCurrentRole(ERole.admin));
    enterApp();
  };

  const onNext = () => {
    if (isSyncModeStep) {
      if (setupPath !== 'create') {
        return;
      }

      goToStep(
        isMultidevice
          ? ONBOARDING_STEP.signUpAdmin
          : ONBOARDING_STEP.parent,
      );
      return;
    }

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

  const onSignUpAdminContinue = (
    value: ParentFormProps,
    credentials: {
      email: string;
      familyName: string;
      pin: string;
    },
  ) => {
    setSignUpError(null);
    setSignUpAdmin({
      ...value,
      email: credentials.email,
      familyName: credentials.familyName,
      pin: credentials.pin,
      passwordPattern: credentials.pin,
    });
    goToStep(ONBOARDING_STEP.signUpChild);
  };

  const onSignUpChildSubmit = async (
    value: ChildFormProps,
    credentials: { username: string; pin: string },
  ) => {
    const adminData = signUpAdmin as SignUpAdminData;

    if (!adminData?.name || !adminData.email || !adminData.pin) {
      setSignUpError(t('onboarding.sign_up.error_admin_incomplete'));
      return;
    }

    if (!adminData.familyName?.trim()) {
      setSignUpError(t('onboarding.sign_up.error_family_name_required'));
      return;
    }

    setSignUpError(null);
    setIsSubmittingSignUp(true);

    try {
      const result = await signupAndLoadFamily({
        familyName: adminData.familyName.trim(),
        admin: {
          email: adminData.email,
          pin: adminData.pin,
          name: adminData.name,
          avatar: adminData.avatar,
          color: adminData.color,
        },
        child: {
          username: credentials.username,
          pin: credentials.pin,
          name: value.name,
          avatar: value.avatar,
          color: value.color,
        },
      });

      dispatch(setSyncMode(ESyncMode.multidevice));

      try {
        hydrateFamilyStore(
          dispatch,
          result.family,
          result.user,
          {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        );
      } catch (hydrateError) {
        clearFamilyStore(dispatch);
        throw hydrateError;
      }

      enterApp();
    } catch (caught) {
      setSignUpError(
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : t('onboarding.sign_up.error_generic'),
      );
    } finally {
      setIsSubmittingSignUp(false);
    }
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

    if (isSyncModeStep) {
      return (
        <OnboardingSyncModeStep
          setupPath={setupPath}
          onSetupPathChange={setSetupPath}
          value={syncMode}
          onChange={setSyncModeSelection}
          onMemberLoginSuccess={enterApp}
        />
      );
    }

    if (isSignUpAdminStep) {
      return (
        <OnboardingSignUpAdminStep
          parent={signUpAdmin}
          initialFamilyName={signUpAdmin.familyName}
          initialEmail={signUpAdmin.email}
          onContinue={onSignUpAdminContinue}
        />
      );
    }

    if (isSignUpChildStep) {
      return (
        <OnboardingSignUpChildStep
          isSubmitting={isSubmittingSignUp}
          externalError={signUpError}
          onSubmit={onSignUpChildSubmit}
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
        hasBackButton={canGoBack}
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

        {(isIntroStep ||
          (isSyncModeStep && setupPath === 'create') ||
          isCompleteStep) && (
          <View style={styles.footer}>
            {canGoBack ? (
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
