import React, { useCallback } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import CloseIcon from '~/assets/svg/common/cross.svg';
import { Checkbox, Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { t } from '~/services';
import { selectAllChildren } from '~/store/children/selectors';
import { Colors } from '~/styles';
import { ETaskStatus } from '~/types/ETask';
import {
  TASK_CALENDAR_STATUSES,
  TaskCalendarFilter,
} from '~/utils/tasks/taskCalendarFilter';

import { styles } from './styles';

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  filter: TaskCalendarFilter;
  onFilterChange: (filter: TaskCalendarFilter) => void;
  showChildrenFilter?: boolean;
};

const getStatusLabel = (status: ETaskStatus) =>
  t(`tasks.taskStatus.${status}`);

export const TaskFilterModal: React.FC<Props> = ({
  isVisible,
  onRequestClose,
  filter,
  onFilterChange,
  showChildrenFilter = true,
}) => {
  const children = useSelector(selectAllChildren);

  const toggleChild = useCallback(
    (childId: string) => {
      onFilterChange({
        ...filter,
        childIds: {
          ...filter.childIds,
          [childId]: !filter.childIds[childId],
        },
      });
    },
    [filter, onFilterChange],
  );

  const toggleStatus = useCallback(
    (status: ETaskStatus) => {
      onFilterChange({
        ...filter,
        statuses: {
          ...filter.statuses,
          [status]: !filter.statuses[status],
        },
      });
    },
    [filter, onFilterChange],
  );

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
              {t('tasks.filter')}
            </Text>
            <IconButton
              Icon={<CloseIcon width={24} height={24} fill={Colors.grey500} />}
              onPress={onRequestClose}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {showChildrenFilter && children.length > 0 && (
              <>
                <Text
                  variant="titleLarge"
                  fontFamily="fredoka"
                  weight="bold"
                  style={styles.sectionTitle}
                >
                  {t('tasks.filter_children')}
                </Text>

                {children.map(child => (
                  <TouchableOpacity
                    key={child.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked: filter.childIds[child.id] ?? false,
                    }}
                    onPress={() => toggleChild(child.id)}
                    style={styles.checkboxRow}
                  >
                    <Checkbox
                      status={
                        filter.childIds[child.id] ? 'checked' : 'unchecked'
                      }
                      onPress={() => toggleChild(child.id)}
                    />
                    <Text style={styles.checkboxLabel}>{child.name}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <Text
              variant="titleLarge"
              fontFamily="fredoka"
              weight="bold"
              style={[
                styles.sectionTitle,
                showChildrenFilter && children.length > 0 && styles.sectionSpacing,
              ]}
            >
              {t('tasks.filter_statuses')}
            </Text>

            {TASK_CALENDAR_STATUSES.map(status => (
              <TouchableOpacity
                key={status}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: filter.statuses[status] }}
                onPress={() => toggleStatus(status)}
                style={styles.checkboxRow}
              >
                <Checkbox
                  status={filter.statuses[status] ? 'checked' : 'unchecked'}
                  onPress={() => toggleStatus(status)}
                />
                <Text style={styles.checkboxLabel}>{getStatusLabel(status)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default TaskFilterModal;
