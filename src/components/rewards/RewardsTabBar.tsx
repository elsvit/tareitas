import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TabBar, TabBarProps } from 'react-native-tab-view';

import { Text } from '~/components/ui';
import { Colors } from '~/styles';

export type RewardsTabRoute = {
  key: string;
  title: string;
  badge?: number;
};

type RewardsTabBarProps = TabBarProps<RewardsTabRoute>;

function TabCountBadge({ count }: { count: number }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
}

export function RewardsTabBar({
  navigationState,
  ...rest
}: RewardsTabBarProps) {
  const options = useMemo(() => {
    const nextOptions: NonNullable<RewardsTabBarProps['options']> = {};

    for (const route of navigationState.routes) {
      const rewardsRoute = route as RewardsTabRoute;

      nextOptions[route.key] = {
        labelText: rewardsRoute.title,
      };

      if (typeof rewardsRoute.badge === 'number' && rewardsRoute.badge > 0) {
        const count = rewardsRoute.badge;
        nextOptions[route.key] = {
          ...nextOptions[route.key],
          badge: () => <TabCountBadge count={count} />,
        };
      }
    }

    return nextOptions;
  }, [navigationState.routes]);

  return (
    <TabBar
      {...rest}
      navigationState={navigationState}
      options={options}
      scrollEnabled
      activeColor={Colors.blue500}
      inactiveColor={Colors.blue500}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      tabStyle={styles.tab}
    />
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIndicator: {
    backgroundColor: Colors.blue500,
    height: 3,
  },
  tab: {
    width: 'auto',
    minWidth: 88,
    overflow: 'visible',
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: Colors.blue500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});

export default RewardsTabBar;
