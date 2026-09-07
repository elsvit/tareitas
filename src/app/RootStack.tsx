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
import { Stack, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { Loading } from '~/components/ui/Loading';
import { useColorScheme } from '~/hooks/use-color-scheme';
import { usePruneOrphanedTaskAssignments } from '~/hooks/usePruneOrphanedTaskAssignments';
import { useCatalogForegroundSync } from '~/hooks/useCatalogForegroundSync';
import { AppDispatch } from '~/store';
import { initLanguage, ensureAppInstalledAt } from '~/store/settings';
import { selectIsLangInitiating, selectLang } from '~/store/settings/selectors';
import { Colors } from '~/styles';
import { lightPaperTheme } from '~/styles/paperTheme';
import { ELang } from '~/types/ELang';

export default function RootStack() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch<AppDispatch>();

  usePruneOrphanedTaskAssignments();
  useCatalogForegroundSync();

  const lang = useSelector(selectLang) ?? ELang.es;

  const isLangInitiating = useSelector(selectIsLangInitiating);
  const navigationState = useRootNavigationState();

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

  useEffect(() => {
    dispatch(initLanguage());
    dispatch(ensureAppInstalledAt());
  }, [dispatch]);

  useEffect(() => {
    if (
      !fontsLoaded ||
      isLangInitiating ||
      !navigationState?.key
    ) {
      return;
    }

    void SplashScreen.hideAsync();
  }, [fontsLoaded, isLangInitiating, navigationState?.key]);

  if (!fontsLoaded || isLangInitiating) {
    return <Loading backgroundColor={Colors.blue400} />;
  }

  // const initialRouteName = 'users/WelcomeSteps';
  // parentIds.length === 0 ? 'users/WelcomeSteps' : 'users/Users';

  // <PaperProvider theme={colorScheme === 'dark' ? darkPaperTheme : lightPaperTheme}>
  // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

  return (
    <PaperProvider theme={lightPaperTheme}>
      <ThemeProvider value={DefaultTheme}>
        <Stack
          key={`stack-${lang}`}
        // initialRouteName={initialRouteName}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.blue400 },
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
      </ThemeProvider>
    </PaperProvider>
  );
}
