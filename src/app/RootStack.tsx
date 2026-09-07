import { useEffect } from 'react';

import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
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
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Provider as PaperProvider } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { Loading } from '~/components/ui/Loading';
import { usePruneOrphanedTaskAssignments } from '~/hooks/usePruneOrphanedTaskAssignments';
import { useCatalogForegroundSync } from '~/hooks/useCatalogForegroundSync';
import { AppDispatch } from '~/store';
import { initLanguage, ensureAppInstalledAt } from '~/store/settings';
import { selectIsLangInitiating, selectLang } from '~/store/settings/selectors';
import { Colors } from '~/styles';
import { lightPaperTheme } from '~/styles/paperTheme';
import { ELang } from '~/types/ELang';

export default function RootStack() {
  const dispatch = useDispatch<AppDispatch>();

  usePruneOrphanedTaskAssignments();
  useCatalogForegroundSync();

  const lang = useSelector(selectLang) ?? ELang.es;

  const isLangInitiating = useSelector(selectIsLangInitiating);

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,

    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,

    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  const isBootstrapping = !fontsLoaded || isLangInitiating;

  useEffect(() => {
    dispatch(initLanguage());
    dispatch(ensureAppInstalledAt());
  }, [dispatch]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    void SplashScreen.hideAsync();
  }, [isBootstrapping]);

  return (
    <PaperProvider theme={lightPaperTheme}>
      <ThemeProvider value={DefaultTheme}>
        <View style={styles.root}>
          <Stack
            key={`stack-${lang}`}
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.blue400 },
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
                animation: 'none',
              }}
            />

            <Stack.Screen
              name="(onboarding)"
              options={{ headerShown: false }}
            />

            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen
              name="users"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="more"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="tasks"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="rewards"
              options={{ headerShown: false }}
            />
          </Stack>

          {isBootstrapping ? (
            <View style={styles.bootstrapOverlay}>
              <Loading backgroundColor={Colors.blue400} />
            </View>
          ) : null}
        </View>
      </ThemeProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bootstrapOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
