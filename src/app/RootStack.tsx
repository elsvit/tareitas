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
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { Loading } from '~/components/ui/Loading';
import { SCREEN_TEXT } from '~/constants/formField';
import { useColorScheme } from '~/hooks/use-color-scheme';
import { AppDispatch } from '~/store';
import { selectParentIds } from '~/store/parents/selectors';
import { initLanguage } from '~/store/settings';
import { selectIsLangInitiating, selectLang } from '~/store/settings/selectors';
import { lightPaperTheme } from '~/styles/paperTheme';
import { EScreens } from '~/types';
import { ELang } from '~/types/ELang';

export default function RootStack() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch<AppDispatch>();

  const lang = useSelector(selectLang) ?? ELang.es;

  const isLangInitiating = useSelector(selectIsLangInitiating);
  const parentIds = useSelector(selectParentIds);

  console.log('TEST_51 RootStack', parentIds);

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
  }, [dispatch]);

  if (!fontsLoaded || isLangInitiating) {
    return <Loading />;
  }

  const minimalHeaderBackOptions: NativeStackNavigationOptions = {
    headerBackTitle: '',
    headerBackButtonDisplayMode: 'minimal',
    headerTintColor: SCREEN_TEXT.primary,
  };

  // const initialRouteName = 'users/WelcomeSteps';
  // parentIds.length === 0 ? 'users/WelcomeSteps' : 'users/Users';

  // console.log(
  //   'TEST_79',
  //   parentIds.length,
  //   'initialRouteName',
  //   initialRouteName,
  // );

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
            name="users/WelcomeSteps"
            options={{ headerShown: false }}
          />

          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen
            name="users/Users"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="more/Settings/Settings"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="users/ParentAdd"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="users/ParentEdit"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="users/ParentRemove"
            options={minimalHeaderBackOptions}
          />
          <Stack.Screen
            name="users/ChildAdd"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="users/ChildEdit"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="users/ChildRemove"
            options={minimalHeaderBackOptions}
          />

          <Stack.Screen
            name={EScreens.BaseTasks}
            options={{ headerShown: false }}
          />
          <Stack.Screen name={EScreens.BaseTaskAdd} options={{ headerShown: false }} />
          <Stack.Screen name={EScreens.BaseTaskEdit} options={{ headerShown: false }} />
          <Stack.Screen name={EScreens.Tasks} options={minimalHeaderBackOptions} />
          <Stack.Screen
            name={EScreens.TaskAssignmentAdd}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={EScreens.TaskAssignmentEdit}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={EScreens.FilteredTasks}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={EScreens.BaseRewards}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={EScreens.BaseRewardAdd}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={EScreens.BaseRewardEdit}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={EScreens.RewardAdd}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={EScreens.RewardEdit}
            options={{ headerShown: false }}
          />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
