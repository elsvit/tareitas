import { Stack } from 'expo-router';

import { SCREEN_TEXT } from '~/constants/formField';

const minimalHeaderBackOptions = {
  headerBackTitle: '',
  headerBackButtonDisplayMode: 'minimal' as const,
  headerTintColor: SCREEN_TEXT.primary,
  headerShown: true,
};

export default function TasksLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tasks" options={minimalHeaderBackOptions} />
    </Stack>
  );
}
