import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '~/components/ui/Text';
import { GesturePassword } from '~/components/ui/GesturePassword';
import { t } from '~/services';

type Props = {
  title?: string;
  size?: number;
  minLength?: number;
  onComplete?: (pattern: number[]) => void;
};

export const UserPassword: React.FC<Props> = ({
  title = t('users.password'),
  size,
  minLength,
  onComplete,
}) => {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" weight="bold">
        {title}
      </Text>
      <GesturePassword
        size={size}
        minLength={minLength}
        onComplete={onComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});

export default UserPassword;
