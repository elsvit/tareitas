import React, { useEffect, useState } from 'react';
import { Modal, Pressable, SafeAreaView, View } from 'react-native';

import CloseIcon from '~/assets/svg/common/cross.svg';
import { Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { OTPInput } from '~/components/ui/OTPInput';
import { t } from '~/services';
import { Colors } from '~/styles';

import { styles } from './styles';

type Props = {
  isVisible?: boolean;
  onRequestClose: () => void;
  onComplete?: (password: string) => void;
  title?: string;
  errorMessage?: string;
  maxLength?: number;
  dismissOnBackdrop?: boolean;
};

export const OTPInputModal: React.FC<Props> = ({
  isVisible,
  onRequestClose,
  onComplete,
  title = t('users.password'),
  errorMessage,
  maxLength = 4,
  dismissOnBackdrop = true,
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!isVisible) {
      setValue('');
    }
  }, [isVisible]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  const handleComplete = (newValue: string) => {
    onComplete?.(newValue);
  };

  const handleClose = () => {
    setValue('');
    onRequestClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.backdropContainer}>
        <Pressable
          style={styles.backdrop}
          onPress={dismissOnBackdrop ? handleClose : undefined}
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
              onPress={handleClose}
            />
          </View>

          {!!errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <OTPInput
            maxLength={maxLength}
            value={value}
            onChange={handleChange}
            onComplete={handleComplete}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// const styles = StyleSheet.create({
//   backdropContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backdrop: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//   },
//   sheet: {
//     width: '90%',
//     maxWidth: 520,
//     borderRadius: 16,
//     backgroundColor: '#fff',
//     padding: 16,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowOffset: { width: 0, height: 8 },
//     shadowRadius: 16,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
// });

export default OTPInputModal;
