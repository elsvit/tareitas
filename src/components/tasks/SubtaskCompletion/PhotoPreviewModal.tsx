import React from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CloseIcon from '~/assets/svg/common/cross.svg';
import { Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { t } from '~/services';
import { Colors } from '~/styles';

type Props = {
  visible: boolean;
  imageUri: string | null;
  onRequestClose: () => void;
};

export function PhotoPreviewModal({
  visible,
  imageUri,
  onRequestClose,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[styles.closeButtonContainer, { top: insets.top + 8 }]}
        >
          <IconButton
            Icon={<CloseIcon width={24} height={24} fill={Colors.white} />}
            onPress={onRequestClose}
            size={40}
            accessibilityLabel={t('button.cancel')}
          />
        </View>

        <Pressable style={styles.contentPressable} onPress={onRequestClose}>
          <View style={styles.content}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.emptyText}>
                {t('tasks.subtask_photo_empty')}
              </Text>
            )}
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  closeButtonContainer: {
    position: 'absolute',
    right: 12,
    zIndex: 2,
  },
  contentPressable: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    minHeight: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
    minHeight: 280,
  },
  emptyText: {
    color: Colors.white,
    fontSize: 16,
  },
});
