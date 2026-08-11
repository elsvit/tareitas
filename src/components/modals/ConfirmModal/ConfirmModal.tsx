import React from 'react';
import { Modal, Pressable, SafeAreaView, View } from 'react-native';

import { Button, ButtonColors, Text } from '~/components/ui';
import { t } from '~/services';

import { styles } from './styles';

export type ConfirmModalProps = {
  isVisible?: boolean;
  onRequestClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmBgColor?: ButtonColors;
  dismissOnBackdrop?: boolean;
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isVisible,
  onRequestClose,
  onConfirm,
  title,
  message,
  confirmLabel = t('button.confirm'),
  cancelLabel = t('button.cancel'),
  confirmBgColor = ButtonColors.Green,
  dismissOnBackdrop = true,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onRequestClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onRequestClose}
    >
      <SafeAreaView style={styles.backdropContainer}>
        <Pressable
          style={styles.backdrop}
          onPress={dismissOnBackdrop ? onRequestClose : undefined}
        />

        <View style={styles.sheet}>
          {!!title && (
            <Text variant="titleMedium" weight="bold" style={styles.title}>
              {title}
            </Text>
          )}

          {!!message && (
            <Text style={styles.message}>{message}</Text>
          )}

          <View style={styles.actions}>
            <Button mode="outlined" onPress={onRequestClose}>
              {cancelLabel}
            </Button>
            <Button mode="contained" bgColor={confirmBgColor} onPress={handleConfirm}>
              {confirmLabel}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ConfirmModal;
