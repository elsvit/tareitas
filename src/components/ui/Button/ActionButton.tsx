import { Pressable, StyleSheet, View } from 'react-native';

export type ActionButtonProps = {
    onPress: () => void;
    children: React.ReactNode;
    accessibilityLabel?: string;
  };

export const ActionButton: React.FC<ActionButtonProps> = ({
    onPress,
    children,
    accessibilityLabel,
  }) => {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          styles.actionTouchable,
          pressed && { opacity: 0.7 },
        ]}
        hitSlop={8}
      >
        {children}
      </Pressable>
    );
  };

  const styles = StyleSheet.create({
    actionTouchable: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
  });
  
  export default ActionButton;