import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  onPress: () => void;
  Icon: React.ReactNode; // Pass SVG component here
  size?: number;
  backgroundColor?: string;
  borderRadius?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export const IconButton: React.FC<Props> = ({
  onPress,
  Icon,
  size = 44,
  backgroundColor = 'transparent',
  borderRadius,
  disabled = false,
  accessibilityLabel,
  testID,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          backgroundColor,
          borderRadius: borderRadius ?? size / 2,
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {Icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconButton;

// import React from 'react';
// import type { ComponentProps } from 'react';
//
// import { IconButton as PaperIconButton } from 'react-native-paper';
//
// import { Button } from '~/components/ui/Button/Button';
// import { ButtonColors } from '~/components/ui/Button';
//
// type BaseProps = {
//   icon?: string;
//   onPress?: () => void;
//   size?: number;
//   iconColor?: string;
//   disabled?: boolean;
//   children?: React.ReactNode;
// };
//
// // IconButton wrapper:
// // - If children provided -> render regular Button with an icon and label (useful for toolbars/modals)
// // - If no children -> render Paper IconButton (icon-only)
// export const IconButton: React.FC<BaseProps> = ({
//   icon = 'close',
//   onPress,
//   size = 24,
//   iconColor,
//   disabled,
//   children,
// }) => {
//   if (children) {
//     return (
//       <Button
//         mode="contained"
//         icon={icon}
//         onPress={onPress}
//         bgColor={ButtonColors.Gray}
//         disabled={disabled}
//       >
//         {children}
//       </Button>
//     );
//   }
//
//   return (
//     <PaperIconButton
//       icon={icon as ComponentProps<typeof PaperIconButton>['icon']}
//       onPress={onPress}
//       size={size}
//       disabled={disabled}
//       iconColor={iconColor}
//     />
//   );
// };

// export default IconButton;
