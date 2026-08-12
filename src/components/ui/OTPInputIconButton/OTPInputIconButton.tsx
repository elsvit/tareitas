import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StyleProp, ViewStyle } from 'react-native';

import OTPInputIcon from '~/assets/svg/users/password-pin.svg';
import { OTPInputModal } from '~/components/modals';
import { ButtonColors } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { t } from '~/services';

type Props = {
  onChange?: (password: string) => void;
  title?: string;
  size?: number;
  maxLength?: number;
  Icon?: any;
  bgColor?: ButtonColors;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const OTPInputIconButton: React.FC<Props> = ({
  onChange,
  title = t('users.password'),
  maxLength = 4,
  Icon: IconProp,
  disabled,
  style,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleComplete = React.useCallback(
    (str: string) => {
      onChange?.(str);
      setOpen(false);
    },
    [onChange],
  );

  const Icon = IconProp || OTPInputIcon;

  return (
    <View style={[styles.container, style]}>
      <IconButton
        Icon={<Icon width={40} height={40} />}
        onPress={() => setOpen(true)}
        disabled={disabled}
        size={44}
      />

      <OTPInputModal
        isVisible={open}
        onRequestClose={() => setOpen(false)}
        title={title}
        maxLength={maxLength}
        onComplete={handleComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  btnContent: {
    minHeight: 40,
  },
  squareButton: {
    // make it closer to icon-only square button
    width: 48,
    height: 48,
  },
});

export default OTPInputIconButton;
