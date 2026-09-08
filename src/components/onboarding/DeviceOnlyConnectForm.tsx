import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { CHILDREN_AVATARS, PARENT_AVATARS } from '~/assets/img/users/users';
import CheckIcon from '~/assets/svg/common/check.svg';
import {
  Button,
  ButtonColors,
  Space,
  Text,
} from '~/components/ui';
import { OTPInput } from '~/components/ui/OTPInput';
import { UserAvatar } from '~/components/users/UserAvatar';
import { t } from '~/services';
import { selectAllChildren } from '~/store/children/selectors';
import { selectUserImageUrls } from '~/store/images/selectors';
import { selectAllParents } from '~/store/parents/selectors';
import { ERole, ESyncMode } from '~/store/settings/enums';
import { selectIsChildPasswordObligatory } from '~/store/settings/selectors';
import {
  setCurrentRole,
  setCurrentUser,
  setRequireLogin,
  setSyncMode,
  setTaskCalendarDate,
} from '~/store/settings/slice';
import type { AppDispatch } from '~/store/store';
import { Colors } from '~/styles';
import { getTodayDateString } from '~/utils/date';
import {
  userRequiresPasswordOnSwitch,
  verifyUserSwitchPassword,
  type SwitchableUser,
} from '~/utils/users/userSwitchAuth';

import { onboardingStyles as styles } from './styles';

const USER_AVATAR_MAP = Object.fromEntries(
  [...PARENT_AVATARS, ...CHILDREN_AVATARS].map(({ value, image }) => [
    value,
    image,
  ]),
);

type DeviceOnlyConnectFormProps = {
  onSuccess: () => void;
};

function sortParentsFirst(parents: ReturnType<typeof selectAllParents>) {
  return [...parents].sort((left, right) => {
    const leftIsAdmin = left.role === ERole.admin ? 0 : 1;
    const rightIsAdmin = right.role === ERole.admin ? 0 : 1;

    if (leftIsAdmin !== rightIsAdmin) {
      return leftIsAdmin - rightIsAdmin;
    }

    return (
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    );
  });
}

function sortByCreatedAt<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

export function DeviceOnlyConnectForm({
  onSuccess,
}: DeviceOnlyConnectFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const parents = useSelector(selectAllParents);
  const children = useSelector(selectAllChildren);
  const userUrls = useSelector(selectUserImageUrls);
  const isChildPasswordObligatory = useSelector(
    selectIsChildPasswordObligatory,
  );

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasLocalFamily = parents.length > 0;

  const users = useMemo<SwitchableUser[]>(
    () => [
      ...sortParentsFirst(parents).map(parent => ({
        id: parent.id,
        role:
          parent.role === ERole.admin ? ERole.admin : ERole.parent,
        passwordPattern: parent.passwordPattern,
        name: parent.name,
        email: parent.email,
        username: parent.username,
      })),
      ...sortByCreatedAt(children).map(child => ({
        id: child.id,
        role: ERole.child,
        passwordPattern: child.passwordPattern,
        name: child.name,
        username: child.username,
      })),
    ],
    [children, parents],
  );

  const memberById = useMemo(() => {
    const map = new Map<
      string,
      (typeof parents)[number] | (typeof children)[number]
    >();

    parents.forEach(parent => map.set(parent.id, parent));
    children.forEach(child => map.set(child.id, child));

    return map;
  }, [children, parents]);

  const selectedUser = useMemo(
    () => users.find(user => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  useEffect(() => {
    if (users.length === 0) {
      setSelectedUserId(null);
      return;
    }

    if (!selectedUserId || !users.some(user => user.id === selectedUserId)) {
      setSelectedUserId(users[0].id);
    }
  }, [selectedUserId, users]);

  const completeLogin = useCallback(
    (user: SwitchableUser) => {
      dispatch(setSyncMode(ESyncMode.deviceOnly));
      dispatch(setRequireLogin(false));
      dispatch(setCurrentUser(user.id));
      dispatch(setCurrentRole(user.role));
      dispatch(setTaskCalendarDate(getTodayDateString()));
      setPin('');
      setLoginError(null);
      onSuccess();
    },
    [dispatch, onSuccess],
  );

  const handleSelectUser = useCallback((user: SwitchableUser) => {
    setSelectedUserId(user.id);
    setPin('');
    setLoginError(null);
  }, []);

  const handleSubmitPin = useCallback(async () => {
    if (!selectedUser) {
      return;
    }

    setLoginError(null);

    const requiresPassword = userRequiresPasswordOnSwitch(
      selectedUser,
      false,
      isChildPasswordObligatory,
    );

    if (!requiresPassword) {
      completeLogin(selectedUser);
      return;
    }

    if (pin.length !== 4) {
      setLoginError(t('onboarding.login.error_pin_required'));
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);

    try {
      const result = await verifyUserSwitchPassword(selectedUser, pin);

      if (result.ok) {
        completeLogin(selectedUser);
        return;
      }

      setLoginError(t('users.wrong_password'));
    } finally {
      setIsSubmitting(false);
    }
  }, [completeLogin, isChildPasswordObligatory, pin, selectedUser]);

  if (!hasLocalFamily) {
    return (
      <Text variant="bodyMedium" style={styles.deviceOnlyConnectEmpty}>
        {t('onboarding.sync_mode.device_only_connect_empty')}
      </Text>
    );
  }

  return (
    <View>
      <Text variant="bodyMedium" style={styles.deviceOnlyConnectHint}>
        {t('onboarding.sync_mode.device_only_connect_hint')}
      </Text>

      <Space size={2} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.deviceOnlyUserRow}
      >
        {users.map(user => {
          const member = memberById.get(user.id);
          const selected = user.id === selectedUserId;

          if (!member) {
            return null;
          }

          return (
            <Pressable
              key={user.id}
              onPress={() => handleSelectUser(user)}
              style={styles.deviceOnlyUserItem}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View
                style={[
                  styles.deviceOnlyAvatarWrap,
                  selected && styles.deviceOnlyAvatarWrapSelected,
                  member.color
                    ? { borderColor: member.color }
                    : null,
                ]}
              >
                <UserAvatar
                  avatar={member.avatar}
                  name={member.name}
                  textColor={member.color}
                  customUrls={userUrls}
                  builtInImages={USER_AVATAR_MAP}
                  size={44}
                />
                {selected ? (
                  <View style={styles.deviceOnlyCheckBadge}>
                    <CheckIcon width={10} height={10} fill={Colors.white} />
                  </View>
                ) : null}
              </View>
              <Text
                variant="bodyMedium"
                weight={selected ? 'bold' : 'regular'}
                numberOfLines={2}
                style={[
                  styles.deviceOnlyUserName,
                  selected ? { color: member.color ?? Colors.orange500 } : null,
                ]}
              >
                {member.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {selectedUser ? (
        <View style={styles.deviceOnlyPinSection}>
          <Space size={2} />
          <Text variant="bodyMedium">{t('onboarding.login.pin')}</Text>
          <Space size={1} />
          <OTPInput
            maxLength={4}
            value={pin}
            onChange={setPin}
            onComplete={handleSubmitPin}
          />
          {loginError ? (
            <>
              <Space size={2} />
              <Text variant="bodyMedium" color={Colors.red500}>
                {loginError}
              </Text>
            </>
          ) : null}
          <Space size={2} />
          <Button
            mode="contained"
            bgColor={ButtonColors.Green}
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleSubmitPin}
          >
            {t('onboarding.login.submit')}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
