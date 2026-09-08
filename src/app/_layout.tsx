import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { Loading } from '~/components/ui/Loading';
import { prepareFamilyPersistOnBoot } from '~/services/familyPersistMode';
import { initializeRevenueCat } from '~/services/subscriptions/revenueCatInit';
import { persistor, store } from '~/store';
import { Colors } from '~/styles';
import { hideAppSplash, scheduleAppSplashFallbackHide } from '~/utils/hideAppSplash';
import RootStack from './RootStack';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    initializeRevenueCat();
    return scheduleAppSplashFallbackHide();
  }, []);

  const handleBeforeLift = useCallback(async () => {
    try {
      if (persistor) {
        await prepareFamilyPersistOnBoot(
          store.dispatch,
          store.getState,
        );
      }
    } catch (error) {
      console.error('[Tareitas] Failed to prepare family persist storage', error);
    } finally {
      hideAppSplash();
    }
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Provider store={store}>
        {persistor ? (
          <PersistGate
            loading={<Loading backgroundColor={Colors.blue400} />}
            persistor={persistor}
            onBeforeLift={handleBeforeLift}
          >
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
