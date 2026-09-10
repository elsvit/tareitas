import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { Button, ProgressBar } from '~/components/ui';
import { ButtonColors } from '~/components/ui/Button';
import { Loading } from '~/components/ui/Loading';
import { ChildForm } from '~/components/users/UserForm/ChildForm';
import { ParentForm } from '~/components/users/UserForm/ParentForm';
import { t } from '~/services';
import { mapServerChildToLocal } from '~/services/api/memberMappers';
import {
  clearFamilyStore,
  hydrateFamilyStore,
} from '~/services/familySync';
import {
  beginDeviceOnlyFamilyCreate,
  clearFamilySlicesInMemory,
  completeDeviceOnlyFamilyCreate,
  flushFamilyPersistMode,
  hasFamilyDataInMemory,
  resetFamilySetupScreenMemory,
  resumeFamilyPersist,
} from '~/services/familyPersistMode';
import { setActiveFamilyPersistMode } from '~/services/storage/familyPersistStorage';
import { signupAndLoadFamily } from '~/services/multideviceSetup';
import {
    buildSignupFamilyPayload,
    createPlaceholderChildSignupData,
    formatOnboardingSignupError,
    syncOnboardingAdminProfile,
    syncOnboardingChildProfile,
} from '~/services/onboardingSignup';
import type { AppDispatch } from '~/store';
import { addChild, addChildSuccess, clearChildren, updateChildSuccess } from '~/store/children/slice';
import { selectUserImageUrls, setUserImageUrl } from '~/store/images';
import { selectParentIds } from '~/store/parents/selectors';
import { addParent, addParentSuccess, clearParents, updateParentSuccess } from '~/store/parents/slice';
import { EFamilyRole, ERole, ESyncMode } from '~/store/settings/enums';
import {
    selectAuthToken,
    selectAuthUserId,
    selectFamilyId,
    selectPendingReturnRoute,
    selectRequireLogin,
    selectSyncMode,
} from '~/store/settings/selectors';
import {
    clearMultideviceSession,
    setCurrentRole,
    setCurrentUser,
    setHasPersistedFamily,
    setPendingFamilySetup,
    setPendingReturnRoute,
    setRequireLogin,
    setSyncMode,
    setTaskCalendarDate,
} from '~/store/settings/slice';
import { store, persistor } from '~/store/store';
import { Colors, spacing } from '~/styles';
import { getTodayDateString } from '~/utils/date';
import { EFormMode } from '~/types/ECommon';
import type { ChildFormProps } from '~/types/IChild';
import type { ParentFormProps } from '~/types/IParent';

import { OnboardingComplete } from './OnboardingComplete';
import { OnboardingIntroSlide } from './OnboardingIntroSlide';
import { OnboardingSignUpAdminStep } from './OnboardingSignUpAdminStep';
import { OnboardingSignUpChildStep } from './OnboardingSignUpChildStep';
import { OnboardingStepHeader } from './OnboardingStepHeader';
import {
    OnboardingStepTransition,
    type OnboardingTransitionDirection,
} from './OnboardingStepTransition';
import {
    OnboardingSyncModeStep,
    type OnboardingSetupPath,
} from './OnboardingSyncModeStep';
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
  const [setupPath, setSetupPath] = useState<OnboardingSetupPath>('create');
  const [parent, setParent] = useState<Partial<ParentFormProps>>({
    role: ERole.admin,
  });
  const [child, setChild] = useState<ChildFormProps>();
  const [syncMode, setSyncModeSelection] = useState(storedSyncMode);
  const [signUpAdmin, setSignUpAdmin] =
    useState<Partial<SignUpAdminData>>({ role: ERole.admin });
  const [signUpChild, setSignUpChild] =
    useState<Partial<ChildFormProps>>();
  const [placeholderChildUserId, setPlaceholderChildUserId] =
    useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [isSubmittingAdminSignUp, setIsSubmittingAdminSignUp] =
    useState(false);
  const [isSubmittingSignUp, setIsSubmittingSignUp] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [isSetupMemoryReady, setIsSetupMemoryReady] = useState(
    () => initialStep !== ONBOARDING_STEP.syncMode || opensOnSetup,
  );

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

  useEffect(() => {
    if (isSyncModeStep) {
      dispatch(setPendingFamilySetup(true));
    }
  }, [dispatch, isSyncModeStep]);

  useEffect(() => {
    if (!isSyncModeStep) {
      setIsSetupMemoryReady(true);
      return;
    }

    // Change-family / login setup: memory was already prepared — do not reset
    // again when device-only reconnect loads parents (parentIds.length > 0).
    if (opensOnSetup) {
      setIsSetupMemoryReady(true);
      return;
    }

    let cancelled = false;
    setIsSetupMemoryReady(false);

    void resetFamilySetupScreenMemory(dispatch, persistor, {
      getState: store.getState,
    }).finally(() => {
      if (!cancelled) {
        setIsSetupMemoryReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch, isSyncModeStep, opensOnSetup]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, event => {
      setKeyboardInset(event.endCoordinates.height);

      if (
        isSyncModeStep &&
        (setupPath === 'connect' || setupPath === 'connect_device_only')
      ) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });
      }
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardInset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [isSyncModeStep, setupPath]);

  const onBack = () => {
    if (canExitFromSyncMode) {
      const returnRoute = pendingReturnRoute;

      dispatch(setRequireLogin(false));
      dispatch(setPendingFamilySetup(false));
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
      if (isSyncModeStep) {
        dispatch(setPendingFamilySetup(false));
      }

      goToStep(getPreviousStep(step));
    }
  };

  const enterApp = () => {
    const returnRoute = pendingReturnRoute;

    dispatch(setPendingReturnRoute(null));
    dispatch(setRequireLogin(false));
    dispatch(setPendingFamilySetup(false));
    dispatch(setTaskCalendarDate(getTodayDateString()));

    if (returnRoute) {
      router.replace({
        pathname: returnRoute.pathname as never,
        params: returnRoute.params,
      });
      return;
    }

    router.replace('/(tabs)/Tasks');
  };

  const finishOnboarding = async () => {
    if (!parent.name) {
      return;
    }

    if (!isMultideviceFlow && !child?.name) {
      return;
    }

    const parentId = uuidv4();
    const targetMode = isMultideviceFlow
      ? ESyncMode.multidevice
      : ESyncMode.deviceOnly;

    dispatch(setSyncMode(targetMode));
    setActiveFamilyPersistMode(targetMode);
    dispatch(clearParents());

    const parentEntity = {
      ...parent,
      name: parent.name,
      role: ERole.admin,
      id: parentId,
      createdAt: new Date().toISOString(),
      createdBy: parentId,
    };

    if (isMultideviceFlow) {
      dispatch(addParent({ entity: parentEntity }));
    } else {
      dispatch(addParentSuccess(parentEntity));
    }

    dispatch(clearChildren());

    if (child?.name) {
      const childId = uuidv4();
      const childEntity = {
        ...child,
        name: child.name,
        id: childId,
        createdAt: new Date().toISOString(),
        createdBy: parentId,
      };

      if (isMultideviceFlow) {
        dispatch(addChild({ entity: childEntity }));
      } else {
        dispatch(addChildSuccess(childEntity));
      }
    }

    dispatch(setCurrentUser(parentId));
    dispatch(setCurrentRole(ERole.admin));

    if (isMultideviceFlow) {
      await flushFamilyPersistMode(persistor);
      resumeFamilyPersist(persistor);
    } else {
      await completeDeviceOnlyFamilyCreate(persistor);
    }

    dispatch(setHasPersistedFamily(true));
    enterApp();
  };

  const onNext = async () => {
    if (isSyncModeStep) {
      if (setupPath !== 'create') {
        return;
      }

      dispatch(setPendingFamilySetup(false));

      if (!isMultidevice) {
        await beginDeviceOnlyFamilyCreate(dispatch, persistor);
        goToStep(ONBOARDING_STEP.parent);
        return;
      }

      persistor?.pause?.();

      try {
        if (hasFamilyDataInMemory(store.getState())) {
          setActiveFamilyPersistMode(selectSyncMode(store.getState()));
          await flushFamilyPersistMode(persistor);
        }

        setActiveFamilyPersistMode(ESyncMode.multidevice);
        dispatch(setSyncMode(ESyncMode.multidevice));
        clearFamilySlicesInMemory(dispatch);
        dispatch(clearMultideviceSession());
      } finally {
        resumeFamilyPersist(persistor);
      }

      goToStep(ONBOARDING_STEP.signUpAdmin);
      return;
    }

    if (isCompleteStep) {
      void finishOnboarding();
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

  const onSignUpAdminSubmit = async (
    value: ParentFormProps,
    credentials: {
      email: string;
      familyName: string;
      pin: string;
    },
  ) => {
    const adminData: SignUpAdminData = {
      ...value,
      email: credentials.email,
      familyName: credentials.familyName,
      pin: credentials.pin,
      passwordPattern: credentials.pin,
      role: ERole.admin,
    };

    setSignUpAdmin(adminData);
    setSignUpError(null);
    setIsSubmittingAdminSignUp(true);

    try {
      const localUserUrls = selectUserImageUrls(store.getState());
      const existingFamilyId = selectFamilyId(store.getState());
      const existingToken = selectAuthToken(store.getState());
      const existingAdminId = selectAuthUserId(store.getState());

      if (
        placeholderChildUserId &&
        existingFamilyId &&
        existingToken &&
        existingAdminId
      ) {
        const profile = await syncOnboardingAdminProfile(
          existingToken,
          existingFamilyId,
          adminData,
          localUserUrls,
        );

        dispatch(
          updateParentSuccess({
            id: existingAdminId,
            name: profile.name,
            color: profile.color ?? adminData.color,
            avatar: profile.avatar ?? adminData.avatar,
            familyRole: profile.familyRole ?? adminData.familyRole ?? EFamilyRole.mother,
            role: ERole.admin,
            email: adminData.email,
            passwordPattern: adminData.pin,
            createdAt: new Date().toISOString(),
            createdBy: existingAdminId,
          }),
        );
        goToStep(ONBOARDING_STEP.signUpChild);
        return;
      }

      const placeholderChild = createPlaceholderChildSignupData();
      const result = await signupAndLoadFamily(
        buildSignupFamilyPayload({
          familyName: adminData.familyName.trim(),
          admin: {
            email: adminData.email,
            pin: adminData.pin,
            name: adminData.name,
            avatar: adminData.avatar,
            color: adminData.color,
          },
          child: placeholderChild,
        }),
      );

      const childUserId = result.family.children[0]?.userId;

      if (!childUserId) {
        throw new Error(t('onboarding.sign_up.error_generic'));
      }

      dispatch(setSyncMode(ESyncMode.multidevice));

      try {
        await hydrateFamilyStore(
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

      setPlaceholderChildUserId(childUserId);

      const profile = await syncOnboardingAdminProfile(
        result.accessToken,
        result.familyId,
        adminData,
        localUserUrls,
      );

      dispatch(
        updateParentSuccess({
          id: result.user.id,
          name: profile.name,
          color: profile.color ?? adminData.color,
          avatar: profile.avatar ?? adminData.avatar,
          familyRole: profile.familyRole ?? adminData.familyRole ?? EFamilyRole.mother,
          role: ERole.admin,
          email: adminData.email,
          passwordPattern: adminData.pin,
          createdAt: new Date().toISOString(),
          createdBy: result.user.id,
        }),
      );

      if (
        profile.avatar &&
        adminData.avatar &&
        profile.avatar !== adminData.avatar &&
        localUserUrls[adminData.avatar]
      ) {
        dispatch(
          setUserImageUrl({
            id: profile.avatar,
            uri: localUserUrls[adminData.avatar],
          }),
        );
      }

      goToStep(ONBOARDING_STEP.signUpChild);
    } catch (caught) {
      setSignUpError(formatOnboardingSignupError(caught));
    } finally {
      setIsSubmittingAdminSignUp(false);
    }
  };

  const onSignUpChildSubmit = async (
    value: ChildFormProps,
    credentials: { username: string; pin: string },
  ) => {
    if (!placeholderChildUserId) {
      setSignUpError(t('onboarding.sign_up.error_admin_incomplete'));
      goToStep(ONBOARDING_STEP.signUpAdmin);
      return;
    }

    const familyId = selectFamilyId(store.getState());
    const accessToken = selectAuthToken(store.getState());
    const adminUserId = selectAuthUserId(store.getState());

    if (!familyId || !accessToken || !adminUserId) {
      setSignUpError(t('onboarding.sign_up.error_admin_incomplete'));
      goToStep(ONBOARDING_STEP.signUpAdmin);
      return;
    }

    setSignUpChild({
      ...value,
      username: credentials.username,
      passwordPattern: credentials.pin,
    });
    setSignUpError(null);
    setIsSubmittingSignUp(true);

    try {
      const localUserUrls = selectUserImageUrls(store.getState());
      const serverChild = await syncOnboardingChildProfile(
        accessToken,
        familyId,
        placeholderChildUserId,
        value,
        credentials,
        localUserUrls,
      );

      dispatch(
        updateChildSuccess(
          mapServerChildToLocal(
            serverChild,
            adminUserId,
            credentials.pin,
            {
              ...value,
              username: credentials.username,
              passwordPattern: credentials.pin,
            },
          ),
        ),
      );

      if (
        serverChild.avatar &&
        value.avatar &&
        serverChild.avatar !== value.avatar &&
        localUserUrls[value.avatar]
      ) {
        dispatch(
          setUserImageUrl({
            id: serverChild.avatar,
            uri: localUserUrls[value.avatar],
          }),
        );
      }

      enterApp();
    } catch (caught) {
      setSignUpError(formatOnboardingSignupError(caught));
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
      if (!isSetupMemoryReady) {
        return <Loading />;
      }

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
          isSubmitting={isSubmittingAdminSignUp}
          externalError={signUpError}
          onContinue={onSignUpAdminSubmit}
        />
      );
    }

    if (isSignUpChildStep) {
      return (
        <OnboardingSignUpChildStep
          child={signUpChild}
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
            embedded
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
            embedded
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
        style={styles.flex}
        contentContainerStyle={[
          styles.container,
          keyboardInset > 0 && {
            paddingBottom: keyboardInset + spacing(2),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
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
