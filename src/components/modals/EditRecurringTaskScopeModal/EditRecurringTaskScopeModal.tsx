import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '~/components/ui';
import { t } from '~/services';
import { ERecurringEditScope } from '~/types/ECommon';

import { styles } from './styles';

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  onSelectScope: (scope: ERecurringEditScope) => void;
  variant?: 'edit' | 'delete';
};

const EDIT_OPTIONS: Array<{
  scope: ERecurringEditScope;
  titleKey: 'tasks.recurring_edit_only_this' | 'tasks.recurring_edit_following' | 'tasks.recurring_edit_all';
  descriptionKey:
    | 'tasks.recurring_edit_only_this_desc'
    | 'tasks.recurring_edit_following_desc'
    | 'tasks.recurring_edit_all_desc';
}> = [
  {
    scope: ERecurringEditScope.OnlyThis,
    titleKey: 'tasks.recurring_edit_only_this',
    descriptionKey: 'tasks.recurring_edit_only_this_desc',
  },
  {
    scope: ERecurringEditScope.ThisAndFollowing,
    titleKey: 'tasks.recurring_edit_following',
    descriptionKey: 'tasks.recurring_edit_following_desc',
  },
  {
    scope: ERecurringEditScope.All,
    titleKey: 'tasks.recurring_edit_all',
    descriptionKey: 'tasks.recurring_edit_all_desc',
  },
];

const DELETE_OPTIONS: Array<{
  scope: ERecurringEditScope;
  titleKey: 'tasks.recurring_delete_only_this' | 'tasks.recurring_delete_following' | 'tasks.recurring_delete_all';
  descriptionKey:
    | 'tasks.recurring_delete_only_this_desc'
    | 'tasks.recurring_delete_following_desc'
    | 'tasks.recurring_delete_all_desc';
}> = [
  {
    scope: ERecurringEditScope.OnlyThis,
    titleKey: 'tasks.recurring_delete_only_this',
    descriptionKey: 'tasks.recurring_delete_only_this_desc',
  },
  {
    scope: ERecurringEditScope.ThisAndFollowing,
    titleKey: 'tasks.recurring_delete_following',
    descriptionKey: 'tasks.recurring_delete_following_desc',
  },
  {
    scope: ERecurringEditScope.All,
    titleKey: 'tasks.recurring_delete_all',
    descriptionKey: 'tasks.recurring_delete_all_desc',
  },
];

export const EditRecurringTaskScopeModal: React.FC<Props> = ({
  isVisible,
  onRequestClose,
  onSelectScope,
  variant = 'edit',
}) => {
  const options = variant === 'delete' ? DELETE_OPTIONS : EDIT_OPTIONS;
  const titleKey =
    variant === 'delete'
      ? 'tasks.recurring_delete_title'
      : 'tasks.recurring_edit_title';

  return (
  <Modal
    visible={isVisible}
    animationType="slide"
    transparent
    onRequestClose={onRequestClose}
  >
    <SafeAreaView style={styles.backdropContainer}>
      <Pressable style={styles.backdrop} onPress={onRequestClose} />

      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text variant="titleMedium" weight="bold">
            {t(titleKey)}
          </Text>
        </View>

        {options.map(option => (
          <Pressable
            key={option.scope}
            accessibilityRole="button"
            onPress={() => onSelectScope(option.scope)}
            style={({ pressed }) => [
              styles.option,
              pressed && styles.optionPressed,
            ]}
          >
            <Text variant="titleMedium" weight="bold" style={styles.optionTitle}>
              {t(option.titleKey)}
            </Text>
            <Text variant="bodySmall" style={styles.optionDescription}>
              {t(option.descriptionKey)}
            </Text>
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          onPress={onRequestClose}
          style={({ pressed }) => [
            styles.cancelRow,
            pressed && styles.optionPressed,
          ]}
        >
          <Text variant="titleMedium" weight="bold" style={styles.optionTitle}>
            {t('button.cancel')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  </Modal>
  );
};

export default EditRecurringTaskScopeModal;
