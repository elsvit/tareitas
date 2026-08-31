import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

import {
  GesturePasswordModal,
  OTPInputModal,
  SelectUsersModal,
} from '~/components/modals';
import type { SelectedUser } from '~/components/modals';
import { t } from '~/services';
import {
  applyAuthTokensFromLogin,
  resetFamilyForOnboarding,
} from '~/services/familySync';
import type { AppDispatch } from '~/store';
import {
  selectIsChild,
  selectIsChildHasChangeFamily,
  selectIsChildPasswordObligatory,
  selectIsMultidevice,
} from '~/store/settings/selectors';
import {
  setCurrentRole,
  setCurrentUser,
  setTaskCalendarDate,
} from '~/store/settings/slice';
import { getTodayDateString } from '~/utils/date';
import {
  isPinPassword,
  patternToString,
} from '~/utils/users/passwordPattern';
import {
  userRequiresPasswordOnSwitch,
  verifyUserSwitchPassword,
} from '~/utils/users/userSwitchAuth';

export function useUserSwitch() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const isMultidevice = useSelector(selectIsMultidevice);
  const isChild = useSelector(selectIsChild);
  const isChildHasChangeFamily = useSelector(selectIsChildHasChangeFamily);
  const isChildPasswordObligatory = useSelector(
    selectIsChildPasswordObligatory,
  );
  const showChangeGroup = !isChild || isChildHasChangeFamily;
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
    resetFamilyForOnboarding(dispatch);
    router.replace('/(onboarding)?setup=1');
  }, [dispatch, router]);

  const handleSelectUser = useCallback(
    (user: SelectedUser) => {
      setIsSelectUsersVisible(false);
      logoutUser();

      const requiresPassword = userRequiresPasswordOnSwitch(
        user,
        isMultidevice,
        isChildPasswordObligatory,
      );

      if (!requiresPassword) {
        completeLogin(user);
        return;
      }

      promptForPassword(user);
    },
    [
      completeLogin,
      isChildPasswordObligatory,
      isMultidevice,
      logoutUser,
      promptForPassword,
    ],
  );

  const verifyAndComplete = useCallback(
    async (user: SelectedUser, input: string) => {
      setIsVerifyingPassword(true);
      setPasswordError(null);

      try {
        const result = await verifyUserSwitchPassword(user, input);

        if (result.ok) {
          if (result.kind === 'cloud') {
            applyAuthTokensFromLogin(dispatch, result.auth);
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
    [completeLogin],
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
