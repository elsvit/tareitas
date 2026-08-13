import React from 'react';
import { StyleSheet, View } from 'react-native';

import PlusIcon from '~/assets/svg/common/plus.svg';
import CheckDoneIcon from '~/assets/svg/tasks/check-done.svg';
import { IconButton } from '~/components/ui/IconButton';
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
  if (!showAdd && !showCompletedHistory) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showCompletedHistory && onOpenCompletedHistory && (
        <IconButton
          Icon={<CheckDoneIcon width={28} height={28} stroke="#FFFFFF" />}
          onPress={onOpenCompletedHistory}
          size={56}
          backgroundColor={Colors.green500}
        />
      )}

      {showAdd && (
        <IconButton
          Icon={<PlusIcon width={32} height={32} fill="#FFFFFF" />}
          onPress={onAdd}
          size={56}
          backgroundColor={Colors.blue500}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
