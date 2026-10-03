import Toast from 'react-native-toast-message';

export function showErrorToast(message: string) {
  const text = message.trim();

  if (!text) {
    return;
  }

  Toast.show({
    type: 'error',
    text1: text,
    visibilityTime: 4500,
    position: 'bottom',
  });
}

export function showSuccessToast(message: string) {
  const text = message.trim();

  if (!text) {
    return;
  }

  Toast.show({
    type: 'success',
    text1: text,
    visibilityTime: 3000,
    position: 'bottom',
  });
}
