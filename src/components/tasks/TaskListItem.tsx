import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { CHILDREN_AVATARS, PARENT_AVATARS } from '~/assets/img/users/users';
import DeleteIcon from '~/assets/svg/common/delete.svg';
import EditIcon from '~/assets/svg/common/edit.svg';
import { Text } from '~/components/ui';

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
  color?: string;
  hasButtons?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
};

export const TaskListItem: React.FC<Props> = ({
  avatar,
  name,
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
        textColor={color}
        hasButtons={hasButtons}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }, [avatar, isRemote, name]);

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
  textColor,
  hasButtons,
  onEdit,
  onDelete,
}) => {

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

export default TaskListItem;
