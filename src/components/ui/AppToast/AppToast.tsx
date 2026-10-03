import React from 'react';
import { StyleSheet } from 'react-native';
import Toast, {
  BaseToast,
  ErrorToast,
  type ToastConfig,
} from 'react-native-toast-message';

import { Colors, spacing } from '~/styles';

const toastConfig: ToastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={styles.success}
      contentContainerStyle={styles.content}
      text1Style={styles.text1}
      text1NumberOfLines={4}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={styles.error}
      contentContainerStyle={styles.content}
      text1Style={styles.text1}
      text1NumberOfLines={4}
    />
  ),
};

export function AppToast() {
  return <Toast config={toastConfig} bottomOffset={spacing(10)} />;
}

const styles = StyleSheet.create({
  success: {
    borderLeftColor: Colors.green500,
    backgroundColor: Colors.white,
  },
  error: {
    borderLeftColor: Colors.red500,
    backgroundColor: Colors.white,
  },
  content: {
    paddingHorizontal: spacing(2),
  },
  text1: {
    fontSize: 15,
    color: Colors.grey900,
  },
});
