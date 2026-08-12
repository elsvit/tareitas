import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '~/store';
import RootStack from './RootStack';

import { useFonts } from 'expo-font';

import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';

import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_700Bold,
} from '@expo-google-fonts/rubik';

import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';



// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Provider store={store}>
        {persistor ? (
          <PersistGate loading={null} persistor={persistor}>
            <RootStack />
          </PersistGate>
        ) : (
          <>
            <RootStack />
            <StatusBar style="auto" />
          </>
        )}
      </Provider>
    </SafeAreaProvider>
  );
}
