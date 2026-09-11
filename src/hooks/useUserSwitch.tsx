import { useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

import {
  GesturePasswordModal,
  OTPInputModal,
  SelectUsersModal,
} from '~/components/modals';
import type { SelectedUser } from '~/components/modals';
import { t } from '~/services';
import { prepareFamilyChangeScreen } from '~/services/familyPersistMode';
import {
  applyAuthTokensFromLogin,
} from '~/services/familySync';
import type { AppDispatch } from '~/store';
import {
  selectHasAuthSession,
  selectIsChild,
  selectIsChildHasChangeFamily,
  selectIsMultidevice,
  selectRequireLogin,
} from '~/store/settings/selectors';
import {
  setCurrentRole,
  setCurrentUser,
  setRequireLogin,
  setTaskCalendarDate,
} from '~/store/settings/slice';
import { getTodayDateString } from '~/utils/date';
import {
  isPinPassword,
  patternToString,
} from '~/utils/users/passwordPattern';
import {
  userCanReauthenticateOnSwitch,
  userNeedsCloudReauthOnSwitch,
  verifyUserSwitchPassword,
} from '~/utils/users/userSwitchAuth';

export function useUserSwitch() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const isMultidevice = useSelector(selectIsMultidevice);
  const hasAuthSession = useSelector(selectHasAuthSession);
  const requireLogin = useSelector(selectRequireLogin);
  const isChild = useSelector(selectIsChild);
  const isChildHasChangeFamily = useSelector(selectIsChildHasChangeFamily);
  const showChangeGroup = isMultidevice
    ? !isChild || isChildHasChangeFamily
    : !isChild;
  const [isSelectUsersVisible, setIsSelectUsersVisible] = useState(false);
  const [pendingUser, setPendingUser] = useState<SelectedUser | null>(null);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [isGestureModalVisible, setIsGestureModalVisible] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pinAttempt, setPinAttempt] = useState(0);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const openSelectUsers = useCallback(() => {
    setIsSelectUsersVisible(true);
  }, []);

  const closeSelectUsers = useCallback(() => {
    setIsSelectUsersVisible(false);
  }, []);

  const logoutUser = useCallback(() => {
    dispatch(setCurrentUser(null));
    dispatch(setCurrentRole(null));
    setPendingUser(null);
    setIsPinModalVisible(false);
    setIsGestureModalVisible(false);
    setPasswordError(null);
    setPinAttempt(0);
    setIsVerifyingPassword(false);
  }, [dispatch]);

  const completeLogin = useCallback(
    (user: SelectedUser) => {
      dispatch(setCurrentUser(user.id));
      dispatch(setCurrentRole(user.role));
      dispatch(setTaskCalendarDate(getTodayDateString()));
      setPendingUser(null);
      setIsPinModalVisible(false);
      setIsGestureModalVisible(false);
      setPasswordError(null);
      setPinAttempt(0);
      setIsVerifyingPassword(false);
    },
    [dispatch],
  );

  const promptForPassword = useCallback((user: SelectedUser) => {
    setPendingUser(user);
    setPasswordError(null);
    setPinAttempt(0);

    if (user.passwordPattern && !isPinPassword(user.passwordPattern)) {
      setIsGestureModalVisible(true);
      return;
    }

    setIsPinModalVisible(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsSelectUsersVisible(false);
    logoutUser();
  }, [logoutUser]);

  const handleChangeGroup = useCallback(() => {
    setIsSelectUsersVisible(false);

    void prepareFamilyChangeScreen(dispatch).then(() => {
      InteractionManager.runAfterInteractions(() => {
        router.replace('/(onboarding)?setup=1');
      });
    });
  }, [dispatch, router]);

  const handleSelectUser = useCallback(
    (user: SelectedUser) => {
      setIsSelectUsersVisible(false);
      logoutUser();

      if (
        isMultidevice &&
        (requireLogin || !hasAuthSession) &&
        !userCanReauthenticateOnSwitch(user)
      ) {
        router.replace('/(onboarding)?setup=1');
        return;
      }

      promptForPassword(user);
    },
    [
      hasAuthSession,
      isMultidevice,
      logoutUser,
      promptForPassword,
      requireLogin,
      router,
    ],
  );

  const verifyAndComplete = useCallback(
    async (user: SelectedUser, input: string) => {
      setIsVerifyingPassword(true);
      setPasswordError(null);

      const needsCloudReauth = userNeedsCloudReauthOnSwitch(
        user,
        isMultidevice,
        { hasAuthSession, requireLogin },
      );

      try {
        const result = await verifyUserSwitchPassword(user, input, {
          preferCloudAuth: needsCloudReauth,
          localOnly: !isMultidevice,
        });

        if (result.ok) {
          if (result.kind === 'cloud' && isMultidevice) {
            applyAuthTokensFromLogin(dispatch, result.auth);
            dispatch(setRequireLogin(false));
          } else if (needsCloudReauth) {
            setPasswordError(t('users.wrong_password'));
            setPinAttempt(current => current + 1);
            return;
          }

          completeLogin(user);
          return;
        }

        setPasswordError(t('users.wrong_password'));
        setPinAttempt(current => current + 1);
      } finally {
        setIsVerifyingPassword(false);
      }
    },
    [completeLogin, dispatch, hasAuthSession, isMultidevice, requireLogin],
  );

  const handlePinComplete = useCallback(
    (input: string) => {
      if (!pendingUser || isVerifyingPassword) {
        return;
      }

      void verifyAndComplete(pendingUser, input);
    },
    [isVerifyingPassword, pendingUser, verifyAndComplete],
  );

  const handleGestureComplete = useCallback(
    (pattern: number[]) => {
      if (!pendingUser?.passwordPattern || isVerifyingPassword) {
        return;
      }

      void verifyAndComplete(
        pendingUser,
        patternToString(pattern),
      );
    },
    [isVerifyingPassword, pendingUser, verifyAndComplete],
  );

  const closePinModal = useCallback(() => {
    setIsPinModalVisible(false);
    setPendingUser(null);
    setPasswordError(null);
    setPinAttempt(0);
    setIsVerifyingPassword(false);
  }, []);

  const closeGestureModal = useCallback(() => {
    setIsGestureModalVisible(false);
    setPendingUser(null);
    setPasswordError(null);
    setIsVerifyingPassword(false);
  }, []);

  const passwordTitle = pendingUser
    ? `${t('users.password')} — ${pendingUser.name}`
    : t('users.password');

  const modals = (
    <>
      <SelectUsersModal
        isVisible={isSelectUsersVisible}
        onRequestClose={closeSelectUsers}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
        onChangeGroup={handleChangeGroup}
        showChangeGroup={showChangeGroup}
      />

      <OTPInputModal
        key={`pin-${pendingUser?.id ?? 'none'}-${pinAttempt}`}
        isVisible={isPinModalVisible}
        onRequestClose={closePinModal}
        onComplete={handlePinComplete}
        title={passwordTitle}
        errorMessage={passwordError ?? undefined}
        maxLength={4}
      />

      <GesturePasswordModal
        isVisible={isGestureModalVisible}
        onRequestClose={closeGestureModal}
        onComplete={handleGestureComplete}
        title={passwordTitle}
        errorMessage={passwordError ?? undefined}
        minLength={4}
      />
    </>
  );

  return {
    openSelectUsers,
    passwordError,
    modals,
  };
}
