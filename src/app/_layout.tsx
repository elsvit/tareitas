import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { initializeRevenueCat } from '~/services/subscriptions/revenueCatInit';
import { persistor, store } from '~/store';
import RootStack from './RootStack';

export default function RootLayout() {

  useEffect(() => {
    initializeRevenueCat();
  }, []);

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
