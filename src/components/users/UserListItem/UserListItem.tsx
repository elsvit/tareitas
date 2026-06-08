import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import DeleteIcon from '~/assets/svg/common/delete.svg';
import EditIcon from '~/assets/svg/common/edit.svg';
import { Text } from '~/components/ui';
import { CHILDREN_AVATARS } from '~/components/users/UserForm/ChildForm';
import { PARENT_AVATARS } from '~/components/users/UserForm/ParentForm';

const USER_AVATARS = { ...PARENT_AVATARS, ...CHILDREN_AVATARS };
import { t } from '~/services';
import { EFamilyRole } from '~/store/settings/enums';
import { lightenColor } from '~/utils/color';

type Props = {
  avatar?: string;
  name: string;
  familyRole?: string;
  color?: string;
  hasButtons?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
};

export const UserListItem: React.FC<Props> = ({
  avatar,
  name,
  familyRole,
  color,
  hasButtons,
  onEdit,
  onDelete,
  onPress,
}) => {
  const isRemote = !!avatar && /^(https?:\/\/|data:)/.test(avatar);

  const gradientColors = React.useMemo<
    readonly [string, string] | undefined
  >(() => {
    if (!color) return undefined;

    return [lightenColor(color, 0.2), lightenColor(color, 0.8)] as const;
  }, [color]);

  const renderContent = React.useCallback(() => {
    return (
      <RowContent
        avatar={avatar}
        isRemote={isRemote}
        name={name}
        familyRole={familyRole}
        textColor={color}
        hasButtons={hasButtons}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }, [avatar, isRemote, name, familyRole]);

  if (!renderContent) return null;

  return (
    <View style={[styles.container, color && { borderColor: color }]}>
      {gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          end={{ x: 0.5, y: 0 }}
          // end={{ x: 0.5, y: 1 }}
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
              {renderContent()}
            </Pressable>
          ) : (
            renderContent()
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
              {renderContent()}
            </Pressable>
          ) : (
            renderContent()
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
  hasButtons?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

const RowContent: React.FC<RowProps> = ({
  avatar,
  isRemote,
  name,
  familyRole,
  textColor,
  hasButtons,
  onEdit,
  onDelete,
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
          ) : USER_AVATARS[avatar as keyof typeof USER_AVATARS] ? (
            <Image
              source={USER_AVATARS[avatar as keyof typeof USER_AVATARS]}
              style={styles.avatarImage}
            />
          ) : (
            <View style={[styles.avatarImage, styles.avatarFallback]}>
              <Text
                style={[styles.avatarText, textColor && { color: textColor }]}
                numberOfLines={1}
              >
                {name?.[0]?.toUpperCase?.() || '?'}
              </Text>
            </View>
          )
        ) : (
          <View style={[styles.avatarImage, styles.avatarFallback]}>
            <Text
              style={[styles.avatarText, textColor && { color: textColor }]}
              numberOfLines={1}
            >
              {name?.[0]?.toUpperCase?.() || '?'}
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

      {!!(hasButtons && (onEdit || onDelete)) && (
        <View style={styles.actions}>
          {!!onEdit && (
            <ActionButton onPress={onEdit} accessibilityLabel="Edit user">
              <EditIcon width={22} height={22} />
            </ActionButton>
          )}
          {!!onDelete && (
            <ActionButton onPress={onDelete} accessibilityLabel="Delete user">
              <DeleteIcon width={22} height={22} />
            </ActionButton>
          )}
        </View>
      )}
    </View>
  );
};

type ActionButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  onPress,
  children,
  accessibilityLabel,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.actionTouchable,
        pressed && { opacity: 0.7 },
      ]}
      hitSlop={8}
    >
      {children}
    </Pressable>
  );
};

// function withAlpha(col: string, alpha: number): string {
//   // If color is already rgba or argb-like, try to inject alpha
//   if (/^rgba?\(/i.test(col)) {
//     // extract numbers
//     const parts = col
//       .replace(/rgba?\(/i, '')
//       .replace(/\)/, '')
//       .split(',')
//       .map(s => s.trim());
//     const [r, g, b] = parts;
//     return `rgba(${r}, ${g}, ${b}, ${alpha})`;
//   }
//   // handle #RRGGBB or #RGB
//   let hex = col.replace('#', '');
//   if (hex.length === 3) {
//     hex = hex.split('').map(ch => ch + ch).join('');
//   }
//   const r = parseInt(hex.slice(0, 2), 16);
//   const g = parseInt(hex.slice(2, 4), 16);
//   const b = parseInt(hex.slice(4, 6), 16);
//   return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// }

// function lightenColor(col: string, percent: number): string {
//   // Clamp percent between 0–100
//   const amount = Math.max(0, Math.min(100, percent)) / 100;
//
//   let r: number, g: number, b: number;
//
//   // Handle rgb/rgba
//   if (/^rgba?\(/i.test(col)) {
//     const parts = col
//       .replace(/rgba?\(/i, '')
//       .replace(/\)/, '')
//       .split(',')
//       .map(s => s.trim());
//
//     r = parseInt(parts[0], 10);
//     g = parseInt(parts[1], 10);
//     b = parseInt(parts[2], 10);
//   } else {
//     // Handle hex
//     let hex = col.replace('#', '');
//
//     if (hex.length === 3) {
//       hex = hex
//         .split('')
//         .map(ch => ch + ch)
//         .join('');
//     }
//
//     r = parseInt(hex.slice(0, 2), 16);
//     g = parseInt(hex.slice(2, 4), 16);
//     b = parseInt(hex.slice(4, 6), 16);
//   }
//
//   // Move each channel toward white (255)
//   const newR = Math.round(r + (255 - r) * amount);
//   const newG = Math.round(g + (255 - g) * amount);
//   const newB = Math.round(b + (255 - b) * amount);
//
//   return `rgb(${newR}, ${newG}, ${newB})`;
// }

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  gradient: {
    // wrapper to apply inner padding while keeping rounded bg
  },
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
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionTouchable: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
