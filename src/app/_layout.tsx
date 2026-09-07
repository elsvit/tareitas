import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { Loading } from '~/components/ui/Loading';
import { initializeRevenueCat } from '~/services/subscriptions/revenueCatInit';
import { persistor, store } from '~/store';
import { Colors } from '~/styles';
import RootStack from './RootStack';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Provider store={store}>
        {persistor ? (
          <PersistGate
            loading={<Loading backgroundColor={Colors.blue400} />}
            persistor={persistor}
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
