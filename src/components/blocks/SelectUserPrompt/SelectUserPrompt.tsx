import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '~/components/ui';
import { t } from '~/services';

export const SelectUserPrompt: React.FC = () => (
  <View style={styles.container}>
    <Text variant="bodyMedium" style={styles.text}>
      {t('users.select_user_please')}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  text: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
