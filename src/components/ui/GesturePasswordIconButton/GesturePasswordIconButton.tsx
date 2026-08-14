import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import GesturePasswordIcon from '~/assets/svg/users/password-gesture.svg';
import { ButtonColors } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { GesturePasswordModal } from '~/components/users/UserPassword';
import { t } from '~/services';

type Props = {
  onChange?: (password: string) => void;
  title?: any;
  size?: number;
  minLength?: number;
  Icon?: string;
  bgColor?: ButtonColors;
  disabled?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export const GesturePasswordIconButton: React.FC<Props> = ({
  onChange,
  title = t('users.password'),
  size,
  minLength = 4,
  Icon: IconProp,
  // bgColor = ButtonColors.Violet,
  disabled,
  style
}) => {
  const [open, setOpen] = React.useState(false);

  const handleComplete = React.useCallback(
    (pattern: number[]) => {
      const str = (pattern || []).join('');
      onChange?.(str);
      setOpen(false);
    },
    [onChange],
  );

  const Icon = IconProp || GesturePasswordIcon;

  return (
    <View style={[styles.container, style]}>
      <IconButton
        Icon={<Icon width={40} height={40} />}
        onPress={() => setOpen(true)}
        disabled={disabled}
        size={44}
      />

      <GesturePasswordModal
        isVisible={open}
        onRequestClose={() => setOpen(false)}
        title={title}
        minLength={minLength}
        size={size}
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

export default GesturePasswordIconButton;
