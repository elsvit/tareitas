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
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { Loading } from '~/components/ui/Loading';
import { useColorScheme } from '~/hooks/use-color-scheme';
import { AppDispatch } from '~/store';
import { selectParentIds } from '~/store/parents/selectors';
import { initLanguage } from '~/store/settings';
import { selectIsLangInitiating, selectLang } from '~/store/settings/selectors';
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
  };

  // const initialRouteName = 'users/WelcomeSteps';
  // parentIds.length === 0 ? 'users/WelcomeSteps' : 'users/Users';

  // console.log(
  //   'TEST_79',
  //   parentIds.length,
  //   'initialRouteName',
  //   initialRouteName,
  // );

  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          key={`stack-${lang}`}
        // initialRouteName={initialRouteName}
        >
          <Stack.Screen
            name="users/WelcomeSteps"
            options={minimalHeaderBackOptions}
          />
          <Stack.Screen name="users/Users" options={minimalHeaderBackOptions} />

          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen
            name="more/Settings/Settings"
            options={minimalHeaderBackOptions}
          />

          <Stack.Screen
            name="users/ParentAdd"
            options={minimalHeaderBackOptions}
          />
          <Stack.Screen
            name="users/ParentEdit"
            options={minimalHeaderBackOptions}
          />
          <Stack.Screen
            name="users/ParentRemove"
            options={minimalHeaderBackOptions}
          />
          <Stack.Screen
            name="users/ChildAdd"
            options={minimalHeaderBackOptions}
          />
          <Stack.Screen
            name="users/ChildEdit"
            options={minimalHeaderBackOptions}
          />
          <Stack.Screen
            name="users/ChildRemove"
            options={minimalHeaderBackOptions}
          />

          <Stack.Screen name={EScreens.BaseTasks} options={minimalHeaderBackOptions} />
          <Stack.Screen name={EScreens.BaseTaskAdd} options={minimalHeaderBackOptions} />
          <Stack.Screen name={EScreens.BaseTaskEdit} options={minimalHeaderBackOptions} />
          <Stack.Screen name={EScreens.Tasks} options={minimalHeaderBackOptions} />
          <Stack.Screen name={EScreens.TaskAdd} options={minimalHeaderBackOptions} />
          <Stack.Screen name={EScreens.TaskEdit} options={minimalHeaderBackOptions} />
          <Stack.Screen
            name={EScreens.TaskAssignmentAdd}
            options={minimalHeaderBackOptions}
          />
          <Stack.Screen
            name={EScreens.TaskAssignmentEdit}
            options={minimalHeaderBackOptions}
          />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
