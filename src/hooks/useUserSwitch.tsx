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
import { clearFamilyStore } from '~/services/familySync';
import type { AppDispatch } from '~/store';
import { selectIsMultidevice } from '~/store/settings/selectors';
import {
  setCurrentRole,
  setCurrentUser,
  setTaskCalendarDate,
} from '~/store/settings/slice';
import { getTodayDateString } from '~/utils/date';
import {
  isPinPassword,
  patternToString,
  verifyPassword,
} from '~/utils/users/passwordPattern';

export function useUserSwitch() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const isMultidevice = useSelector(selectIsMultidevice);

  const [isSelectUsersVisible, setIsSelectUsersVisible] = useState(false);
  const [pendingUser, setPendingUser] = useState<SelectedUser | null>(null);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [isGestureModalVisible, setIsGestureModalVisible] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
    },
    [dispatch],
  );

  const handleLogout = useCallback(() => {
    setIsSelectUsersVisible(false);
    logoutUser();
  }, [logoutUser]);

  const handleChangeGroup = useCallback(() => {
    setIsSelectUsersVisible(false);
    clearFamilyStore(dispatch);
    router.replace('/(onboarding)');
  }, [dispatch, router]);

  const handleSelectUser = useCallback(
    (user: SelectedUser) => {
      setIsSelectUsersVisible(false);
      logoutUser();

      if (!user.passwordPattern) {
        completeLogin(user);
        return;
      }

      setPendingUser(user);

      if (isPinPassword(user.passwordPattern)) {
        setIsPinModalVisible(true);
      } else {
        setIsGestureModalVisible(true);
      }
    },
    [completeLogin, logoutUser],
  );

  const handlePinComplete = useCallback(
    (input: string) => {
      if (!pendingUser?.passwordPattern) {
        return;
      }

      if (verifyPassword(pendingUser.passwordPattern, input)) {
        completeLogin(pendingUser);
        return;
      }

      setPasswordError(t('users.wrong_password'));
    },
    [completeLogin, pendingUser],
  );

  const handleGestureComplete = useCallback(
    (pattern: number[]) => {
      if (!pendingUser?.passwordPattern) {
        return;
      }

      const input = patternToString(pattern);

      if (verifyPassword(pendingUser.passwordPattern, input)) {
        completeLogin(pendingUser);
        return;
      }

      setPasswordError(t('users.wrong_password'));
    },
    [completeLogin, pendingUser],
  );

  const closePinModal = useCallback(() => {
    setIsPinModalVisible(false);
    setPendingUser(null);
    setPasswordError(null);
  }, []);

  const closeGestureModal = useCallback(() => {
    setIsGestureModalVisible(false);
    setPendingUser(null);
    setPasswordError(null);
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
        showChangeGroup={isMultidevice}
      />

      <OTPInputModal
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
