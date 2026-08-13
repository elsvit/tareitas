import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '~/components/ui';
import { GesturePassword } from '~/components/ui/GesturePassword';
import { IconButton } from '~/components/ui/IconButton';
import { t } from '~/services';
import CloseIcon from '~/assets/svg/common/cross.svg';
import { Colors } from '~/styles';

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  onComplete?: (pattern: number[]) => void;
  title?: string;
  errorMessage?: string;
  size?: number;
  minLength?: number;
  dismissOnBackdrop?: boolean;
};

export const GesturePasswordModal: React.FC<Props> = ({
  isVisible,
  onRequestClose,
  onComplete,
  title = t('users.password'),
  errorMessage,
  size,
  minLength,
  dismissOnBackdrop = true,
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
    >
      <SafeAreaView style={styles.backdropContainer}>
        <Pressable
          style={styles.backdrop}
          onPress={dismissOnBackdrop ? onRequestClose : undefined}
        />

        <View style={styles.sheet}>
          <View style={styles.header}>
            {!!title && (
              <Text variant="titleMedium" weight="bold">
                {title}
              </Text>
            )}
            <IconButton
              Icon={<CloseIcon width={24} height={24} fill={Colors.grey500} />}
              onPress={onRequestClose}
              size={24}
              // iconColor={ThemeColors.dark.icon}
            />
          </View>

          {!!errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <GesturePassword
            size={size}
            minLength={minLength}
            onComplete={onComplete}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    width: '90%',
    maxWidth: 520,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default GesturePasswordModal;
