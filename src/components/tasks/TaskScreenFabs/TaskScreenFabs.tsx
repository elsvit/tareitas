import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import PlusIcon from '~/assets/svg/common/plus.svg';
import CheckDoneIcon from '~/assets/svg/tasks/check-done.svg';
import { IconButton } from '~/components/ui/IconButton';
import { useDebouncedPress } from '~/hooks/useDebouncedPress';
import { useTabScreenFabBottom } from '~/hooks/useTabBarBottomInset';
import { Colors } from '~/styles';

type Props = {
  showAdd: boolean;
  onAdd: () => void;
  showCompletedHistory?: boolean;
  onOpenCompletedHistory?: () => void;
};

export const TaskScreenFabs: React.FC<Props> = ({
  showAdd,
  onAdd,
  showCompletedHistory = false,
  onOpenCompletedHistory,
}) => {
  const fabBottom = useTabScreenFabBottom();
  const handleOpenCompletedHistory = useCallback(() => {
    onOpenCompletedHistory?.();
  }, [onOpenCompletedHistory]);
  const debouncedOnAdd = useDebouncedPress(onAdd);
  const debouncedOnOpenCompletedHistory = useDebouncedPress(
    handleOpenCompletedHistory,
  );

  if (!showAdd && !showCompletedHistory) {
    return null;
  }

  return (
    <View style={[styles.container, { bottom: fabBottom }]}>
      {showCompletedHistory && onOpenCompletedHistory && (
        <IconButton
          Icon={<CheckDoneIcon width={28} height={28} stroke="#FFFFFF" />}
          onPress={debouncedOnOpenCompletedHistory}
          size={56}
          backgroundColor={Colors.green500}
        />
      )}

      {showAdd && (
        <IconButton
          Icon={<PlusIcon width={32} height={32} fill="#FFFFFF" />}
          onPress={debouncedOnAdd}
          size={56}
          backgroundColor={Colors.blue500}
          testID="tasks-add-button"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
