import { Stack } from 'expo-router';

import { SCREEN_TEXT } from '~/constants/formField';

const minimalHeaderBackOptions = {
  headerBackTitle: '',
  headerBackButtonDisplayMode: 'minimal' as const,
  headerTintColor: SCREEN_TEXT.primary,
  headerShown: true,
};

export default function UsersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParentRemove" options={minimalHeaderBackOptions} />
      <Stack.Screen name="ChildRemove" options={minimalHeaderBackOptions} />
    </Stack>
  );
}
