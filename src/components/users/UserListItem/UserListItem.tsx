import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import { LinearGradient } from 'expo-linear-gradient';

import { CHILDREN_AVATARS, PARENT_AVATARS } from '~/assets/img/users/users';
import { Text } from '~/components/ui';
import { UserAvatar } from '~/components/users/UserAvatar';
import { selectUserImageUrls } from '~/store/images';
import { selectLang } from '~/store/settings/selectors';
import { getFamilyRoleLabel } from '~/utils/users';
import { lightenColor } from '~/utils/color';

const USER_AVATAR_MAP = Object.fromEntries(
  [...PARENT_AVATARS, ...CHILDREN_AVATARS].map(({ value, image }) => [
    value,
    image,
  ]),
);

type Props = {
  avatar?: string;
  name: string;
  username?: string;
  showLoginName?: boolean;
  familyRole?: string;
  color?: string;
  onPress?: () => void;
};

export const UserListItem: React.FC<Props> = ({
  avatar,
  name,
  username,
  showLoginName = false,
  familyRole,
  color,
  onPress,
}) => {
  const userUrls = useSelector(selectUserImageUrls);

  const gradientColors = React.useMemo<
    readonly [string, string] | undefined
  >(() => {
    if (!color) return undefined;

    return [lightenColor(color, 0.2), lightenColor(color, 0.8)] as const;
  }, [color]);

  const content = (
    <RowContent
      avatar={avatar}
      userUrls={userUrls}
      name={name}
      username={username}
      showLoginName={showLoginName}
      familyRole={familyRole}
      textColor={color}
    />
  );

  return (
    <View style={[styles.container, color && { borderColor: color }]}>
      {gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          end={{ x: 0.5, y: 0 }}
          start={{ x: 0.5, y: 1 }}
          locations={[0.2, 0.8]}
          style={styles.gradient}
        >
          {onPress ? (
            <Pressable
              onPress={onPress}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.pressable,
                pressed && styles.pressed,
              ]}
              android_ripple={{
                color: lightenColor(color || '#000000', 0.08),
                borderless: false,
              }}
            >
              {content}
            </Pressable>
          ) : (
            content
          )}
        </LinearGradient>
      ) : (
        <View style={styles.gradient}>
          {onPress ? (
            <Pressable
              onPress={onPress}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.pressable,
                pressed && styles.pressed,
              ]}
              android_ripple={{
                color: lightenColor(color || '#000000', 0.08),
                borderless: false,
              }}
            >
              {content}
            </Pressable>
          ) : (
            content
          )}
        </View>
      )}
    </View>
  );
};

const AVATAR_SIZE = 48;

type RowProps = {
  avatar?: string;
  userUrls: Record<string, string>;
  name: string;
  username?: string;
  showLoginName?: boolean;
  familyRole?: string;
  textColor?: string;
};

const RowContent: React.FC<RowProps> = ({
  avatar,
  userUrls,
  name,
  username,
  showLoginName = false,
  familyRole,
  textColor,
}) => {
  const lang = useSelector(selectLang);
  const familyRoleText = React.useMemo(
    () => getFamilyRoleLabel(familyRole),
    [familyRole, lang],
  );

  const subtitle = React.useMemo(() => {
    const loginName = showLoginName ? username?.trim() : '';
    if (familyRoleText && loginName) {
      return `${familyRoleText} (${loginName})`;
    }
    if (familyRoleText) {
      return familyRoleText;
    }
    if (loginName) {
      return `(${loginName})`;
    }
    return '';
  }, [familyRoleText, showLoginName, username]);

  return (
    <View style={styles.row}>
      <UserAvatar
        avatar={avatar}
        name={name}
        textColor={textColor}
        customUrls={userUrls}
        builtInImages={USER_AVATAR_MAP}
        size={AVATAR_SIZE}
      />

      <View style={styles.texts}>
        <Text
          variant="titleLarge"
          fontFamily="fredoka"
          weight="bold"
          numberOfLines={1}
          style={textColor && { color: textColor, fontSize: 26 }}
        >
          {name}
        </Text>
        {!!subtitle && (
          <Text
            variant="bodySmall"
            fontFamily="fredoka"
            weight="medium"
            style={[styles.subtitle, textColor && { color: textColor, fontSize: 18 }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  gradient: {},
  pressable: {
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  texts: {
    flex: 1,
    marginLeft: 12,
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 2,
  },
});

export default UserListItem;
