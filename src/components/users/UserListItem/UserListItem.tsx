import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { CHILDREN_AVATARS, PARENT_AVATARS } from '~/assets/img/users/users';
import { Text } from '~/components/ui';

import { t } from '~/services';
import { EFamilyRole } from '~/store/settings/enums';
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
  familyRole?: string;
  color?: string;
  onPress?: () => void;
};

export const UserListItem: React.FC<Props> = ({
  avatar,
  name,
  familyRole,
  color,
  onPress,
}) => {
  const isRemote = !!avatar && /^(https?:\/\/|data:)/.test(avatar);

  const gradientColors = React.useMemo<
    readonly [string, string] | undefined
  >(() => {
    if (!color) return undefined;

    return [lightenColor(color, 0.2), lightenColor(color, 0.8)] as const;
  }, [color]);

  const content = (
    <RowContent
      avatar={avatar}
      isRemote={isRemote}
      name={name}
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
  isRemote: boolean;
  name: string;
  familyRole?: string;
  textColor?: string;
};

const RowContent: React.FC<RowProps> = ({
  avatar,
  isRemote,
  name,
  familyRole,
  textColor,
}) => {
  const familyRoleText = React.useMemo(() => {
    switch (familyRole) {
      case EFamilyRole.mother:
        return t('users.familyRole.mother');
      case EFamilyRole.father:
        return t('users.familyRole.father');
      case EFamilyRole.grandmother:
        return t('users.familyRole.grandmother');
      case EFamilyRole.grandfather:
        return t('users.familyRole.grandfather');
      case EFamilyRole.sister:
        return t('users.familyRole.sister');
      case EFamilyRole.brother:
        return t('users.familyRole.brother');
      case EFamilyRole.nanny:
        return t('users.familyRole.nanny');
      case EFamilyRole.aunt:
        return t('users.familyRole.aunt');
      case EFamilyRole.uncle:
        return t('users.familyRole.uncle');
      case EFamilyRole.reviewer:
        return t('users.familyRole.reviewer');
      case EFamilyRole.reviewee:
        return t('users.familyRole.reviewee');
      case EFamilyRole.other:
        return t('common.other');
      default:
        return '';
    }
  }, [familyRole]);

  return (
    <View style={styles.row}>
      <View style={styles.avatarOuter}>
        {avatar ? (
          isRemote ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : USER_AVATAR_MAP[avatar] ? (
            <Image
              source={USER_AVATAR_MAP[avatar]}
              style={styles.avatarImage}
            />
          ) : (
            <View style={[styles.avatarImage, styles.avatarFallback]}>
              <Text
                style={[styles.avatarText, textColor && { color: textColor }]}
                numberOfLines={1}
              >
                {name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )
        ) : (
          <View style={[styles.avatarImage, styles.avatarFallback]}>
            <Text
              style={[styles.avatarText, textColor && { color: textColor }]}
              numberOfLines={1}
            >
              {name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
      </View>

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
        {!!familyRoleText && familyRoleText !== '' && (
          <Text
            variant="bodySmall"
            fontFamily="fredoka"
            weight="medium"
            style={[styles.subtitle, textColor && { color: textColor, fontSize: 18 }]}
            numberOfLines={1}
          >
            {familyRoleText}
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
  avatarOuter: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    backgroundColor: '#E5E7EB',
  },
  avatarText: {
    fontSize: 18,
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
