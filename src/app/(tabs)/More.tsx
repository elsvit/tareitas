import React, { FC } from 'react';
import { ScrollView } from 'react-native';

import { useRouter } from 'expo-router';
import { Divider, List } from 'react-native-paper';
import { SvgProps } from 'react-native-svg';

import bgImgSrc from '~/assets/img/bg.png';
import ChevronDownIcon from '~/assets/svg/common/chevron-down.svg';
import ChevronUpIcon from '~/assets/svg/common/chevron-up.svg';
import SettingsIcon from '~/assets/svg/more/settings.svg';
import UsersIcon from '~/assets/svg/users/users.svg';
import { ScreenHeaderWithLogo } from "~/components/blocks";
import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { t } from '~/services';
import { spacing, styleSheetFactory } from '~/styles';
import { useStyle } from '~/styles/hooks';
import { EScreens } from '~/types/ENavigation';

export interface IMoreItem {
  title: string;
  Icon: FC<SvgProps>;
  fill?: string;
  navigateTo?: EScreens;
  navigateToParams?: any;
  onPress?: () => void;
  items?: IMoreItem[];
}

export default function More() {
  const router = useRouter();

  const [styles] = useStyle(themedStyles);

  const MORE_ITEMS: IMoreItem[] = [
    {
      title: t('settings.title'),
      Icon: SettingsIcon,
      navigateTo: EScreens.Settings,
    },
    {
      title: t('users.title'),
      Icon: UsersIcon,
      navigateTo: EScreens.Users,
    },
    {
      title: t('tasks.base_tasks'),
      Icon: UsersIcon,
      navigateTo: EScreens.BaseTasks,
    }
  ];

  const title = t('more.title');

  const handlePress = (
    navigateTo: EScreens | undefined,
    navigateToParams?: any,
  ) => {
    navigateTo &&
      router.push({
        pathname: navigateTo as any,
        params: navigateToParams,
      });
  };

  const keyExtractor = (item: IMoreItem, index: number) =>
    `${item.title}-${index}`;

  return (
    <SafeAreaBackground hasTopInsets bgImg={bgImgSrc}>
      <ScreenHeaderWithLogo containerStyle={{backgroundColor: 'transparent'}} />
      <ScrollView>
        <List.Section>
          {MORE_ITEMS.map((item, index) => {
            if (item.items) {
              return (
                <React.Fragment key={keyExtractor(item, index)}>
                  <List.Accordion
                    title={item.title}
                    left={props => (
                      <item.Icon
                        {...props}
                        style={styles.icon}
                        width={24}
                        height={24}
                        fill={item.fill}
                      />
                    )}
                    right={({ isExpanded }) =>
                      isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />
                    }
                    style={styles.item}
                    titleStyle={styles.title}
                  >
                    {item.items.map((subItem, subIndex) => (
                      <List.Item
                        key={keyExtractor(subItem, subIndex)}
                        title={subItem.title}
                        left={props => (
                          <subItem.Icon
                            {...props}
                            style={styles.icon}
                            width={24}
                            height={24}
                          />
                        )}
                        onPress={() =>
                          subItem.navigateTo &&
                          handlePress(
                            subItem.navigateTo,
                            subItem.navigateToParams,
                          )
                        }
                        style={styles.subItem}
                        titleStyle={styles.subtitle}
                      />
                    ))}
                  </List.Accordion>
                  <Divider />
                </React.Fragment>
              );
            }

            // Otherwise, render a regular List.Item
            return (
              <React.Fragment key={keyExtractor(item, index)}>
                <List.Item
                  title={item.title}
                  left={props => (
                    <item.Icon
                      {...props}
                      style={styles.icon}
                      width={24}
                      height={24}
                    />
                  )}
                  onPress={() => handlePress(item.navigateTo)}
                  style={styles.item}
                  titleStyle={styles.title}
                />
                <Divider />
              </React.Fragment>
            );
          })}
        </List.Section>
      </ScrollView>
    </SafeAreaBackground>
  );
}

const themedStyles = styleSheetFactory(palette => ({
  root: {
    flex: 1,
    // backgroundColor: palette.background.primary,
    position: 'relative',
  },
  item: {
    height: 52,
    maxHeight: 52,
    paddingHorizontal: spacing(5),
    // backgroundColor: palette.background.primary,
  },
  icon: {},
  title: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.2,
    fontWeight: '700',
    color: palette.text.primary,
  },
  disabledTitle: {
    color: palette.text.disabled,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    fontWeight: '400',
    color: palette.text.placeholder,
  },
  subItem: {
    height: 48,
    maxHeight: 48,
    paddingRight: spacing(),
    paddingLeft: spacing(8),
    // backgroundColor: palette.background.primary,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: palette.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
  },
  logout: {
    marginBottom: 32,
  },
  logoutText: { fontSize: 16, fontWeight: '400' },
}));
