import React from 'react';
import { Tabs } from 'expo-router';
import { t } from 'i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import MoreIcon from '~/assets/img/tabs/tab_more.png';
import MoreActiveIcon from '~/assets/img/tabs/tab_more_active.png';
import RewardsIcon from '~/assets/img/tabs/tab_rewards.png';
import RewardsActiveIcon from '~/assets/img/tabs/tab_rewards_active.png';
import RoutinesIcon from '~/assets/img/tabs/tab_habits.png';
import RoutinesActiveIcon from '~/assets/img/tabs/tab_habits_active.png';
import TasksIcon from '~/assets/img/tabs/tab_tasks.png';
import TasksActiveIcon from '~/assets/img/tabs/tab_tasks_active.png';
import { HapticTab } from '~/components/haptic-tab';
import { BottomTab } from '~/components/ui/BottomTab/BottomTab';
import { IS_ANDROID } from '~/constants/settings';
import { ThemeColors } from '~/constants/theme';
import { useColorScheme } from '~/hooks/use-color-scheme';
import { selectIsRecurringTabSeparated } from '~/store/settings/selectors';
import { EMainTabs } from '~/types/ENavigation';

const TAB_BAR_PADDING_TOP = 20;
const TAB_BAR_MIN_PADDING_BOTTOM = 12;
const TAB_BAR_CONTENT_HEIGHT = 60;
const TAB_BAR_COLOR = '#016FE8';
const ANDROID_SYSTEM_BAR_COLOR = '#000000';

function TabBarBackground({
  bottomInset,
}: {
  bottomInset: number;
}) {
  if (!IS_ANDROID) {
    return <View style={{ flex: 1, backgroundColor: TAB_BAR_COLOR }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: TAB_BAR_COLOR }} />
      <View
        style={{
          height: bottomInset,
          backgroundColor: ANDROID_SYSTEM_BAR_COLOR,
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const tabBarPaddingBottom = Math.max(insets.bottom, TAB_BAR_MIN_PADDING_BOTTOM);
  const tabBarHeight =
    TAB_BAR_PADDING_TOP + TAB_BAR_CONTENT_HEIGHT + tabBarPaddingBottom;

  const isRoutinesTabSeparated = useSelector(selectIsRecurringTabSeparated);

  const MAIN_TABS = [
    {
      name: EMainTabs.Tasks,
      Icon: TasksIcon,
      ActiveIcon: TasksActiveIcon,
      title: t('tasks.title') || 'Tasks',
    },
    {
      name: EMainTabs.Routines,
      Icon: RoutinesIcon,
      ActiveIcon: RoutinesActiveIcon,
      title: t('habits.title') || 'Routines',
    },
    {
      name: EMainTabs.Rewards,
      Icon: RewardsIcon,
      ActiveIcon: RewardsActiveIcon,
      title: t('rewards.title') || 'Rewards',
    },
    {
      name: EMainTabs.More,
      Icon: MoreIcon,
      ActiveIcon: MoreActiveIcon,
      title: t('more.title') || 'More',
    },
  ];

  // Do not filter out routes: expo-router auto-registers all files under this layout.
  // Instead, conditionally hide a specific tab by setting `options.href = null`.

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarShowLabel: false,

        tabBarActiveTintColor: ThemeColors[colorScheme ?? 'light'].tint,

        tabBarInactiveTintColor: '#8e8e93',

        tabBarStyle: {
          height: tabBarHeight,
          paddingTop: TAB_BAR_PADDING_TOP,
          paddingBottom: tabBarPaddingBottom,
          paddingHorizontal: 8,
          backgroundColor: IS_ANDROID ? 'transparent' : TAB_BAR_COLOR,
          borderTopWidth: 0,
        },

        tabBarBackground: () => (
          <TabBarBackground bottomInset={tabBarPaddingBottom} />
        ),

        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },

        tabBarButton: HapticTab,
      }}
    >
      {MAIN_TABS.map(({ name, Icon, ActiveIcon, title }) => {
        const hideThisTab = !isRoutinesTabSeparated && name === EMainTabs.Routines;
        return (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            // Hide the Routines tab when it isn't separated
            href: hideThisTab ? null : undefined,
            tabBarIcon: ({ focused }) => (
              <BottomTab
                Icon={Icon}
                ActiveIcon={ActiveIcon}
                focused={focused}
                label={title}
                // badge={1}
                // size={56}
              />
            ),
          }}
        />
        );
      })}
    </Tabs>
  );
}
