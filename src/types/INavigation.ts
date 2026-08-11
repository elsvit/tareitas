// import type { StackNavigationProp } from '@react-navigation/stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { EMainTabs, EScreens } from './ENavigation';
export type ScreenRoutes = EMainTabs | EScreens;

export type ScreenRoutesParams = {
  // [EScreens.MainTabs]: undefined;
  [EMainTabs.Tasks]: undefined;
  [EMainTabs.Routines]: undefined;
  [EMainTabs.Rewards]: undefined;
  [EMainTabs.More]: undefined;
  [EScreens.Settings]: undefined;
  [EScreens.Users]: undefined;
  [EScreens.ParentAdd]: { id: string };
  [EScreens.ParentEdit]: { id: string };
  [EScreens.ParentRemove]: { id: string };
  [EScreens.ChildAdd]: { id: string };
  [EScreens.ChildEdit]: { id: string };
  [EScreens.ChildRemove]: { id: string };
  [EScreens.WelcomeSteps]: undefined;
};

export type NavigationProp = NativeStackNavigationProp<ScreenRoutesParams>;
