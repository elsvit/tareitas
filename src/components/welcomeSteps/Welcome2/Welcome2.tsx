import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import CheckCircleOutlineIcon from '~/assets/svg/common/check-circle-outline.svg';
import {
  Space,
  Text,
} from '~/components/ui';
import { Colors, spacing } from '~/styles';

export const Welcome2: React.FC = () => {
  const getCheckedText = ({
    text,
    color,
    index,
  }: {
    text: string;
    color?: string;
    index: number;
  }) => (
    <View style={styles.rowCenter} key={index}>
      <CheckCircleOutlineIcon />
      <View style={styles.textContainer}>
        <Text variant="titleMedium" color={color ?? Colors.green900}>
          {text}
        </Text>
      </View>
    </View>
  );

  const getGradientCard = ({
    title,
    color,
    textColor,
    texts
  }: {
    title: string;
    color: string;
    textColor: string;
    texts: string[];
  }) => (
    <LinearGradient
      colors={[color, '#FFFFFF']}
      end={{ x: 0.5, y: 0 }}
      start={{ x: 0.5, y: 1 }}
      locations={[0.01, 0.8]}
      style={[styles.gradient, { borderColor: color}]}
    >
      <View style={styles.textContainer}>
        <Text
          fontFamily="fredoka"
          weight="bold"
          variant="titleLarge"
          color={color}
        >
          {title}
        </Text>
        <Space size={8} />
        {texts.map((text, index) => getCheckedText({ text, color: textColor, index }))}
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {/* <View style={styles.titleContainer}>
        <Text
          variant="headlineMedium"
          fontFamily="fredoka"
          weight="bold"
          color={Colors.orange500}
        >
          {t('welcome.key_features')}
        </Text>
      </View>
      <View style={styles.titleContainer}>
        <Text variant="bodyLarge">{t('welcome.learn_what_we_do')}</Text>
      </View>

      {getGradientCard({
        title: t('welcome.smart_task_management'),
        color: Colors.blue500,
        textColor: Colors.blue900,
        texts: [
          t('welcome.smartTaskManagement1'),
          t('welcome.smartTaskManagement2'),
          t('welcome.smartTaskManagement3'),
          t('welcome.smartTaskManagement4'),
        ],
      })}

      {getGradientCard({
        title: t('welcome.daily_habits'),
        color: Colors.brightGreen500,
        textColor: Colors.brightGreen900,
        texts: [
          t('welcome.dailyRoutines1'),
          t('welcome.dailyRoutines2'),
          t('welcome.dailyRoutines3'),
          t('welcome.dailyRoutines4'),
        ],
      })}

      {getGradientCard({
        title: t('welcome.rewards_gamification'),
        color: Colors.orange500,
        textColor: Colors.orange900,
        texts: [
          t('welcome.rewardsGamification1'),
          t('welcome.rewardsGamification2'),
          t('welcome.rewardsGamification3'),
          t('welcome.rewardsGamification4'),
        ],
      })}

      {getGradientCard({
        title: t('welcome.progress_tracking'),
        color: Colors.pink500,
        textColor: Colors.pink900,
        texts: [
          t('welcome.progressTracking1'),
          t('welcome.progressTracking2'),
          t('welcome.progressTracking3'),
          t('welcome.progressTracking4'),
        ],
      })} */}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    paddingVertical: spacing(4),
  },
  titleContainer: {
    marginBottom: spacing(2),
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  rowCenter: {
    flexDirection: 'row',
    gap: spacing(2),
    alignItems: 'center',
  },
  card: {
    borderColor: Colors.grey500,
    borderWidth: 4,
    borderRadius: 8,
    marginVertical: spacing(2),
  },
  gradient: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 4,
    marginVertical: spacing(2),
    padding: spacing(4),
  },
  textContainer: {
    flex: 1,
  },
  intro: {
    borderColor: Colors.green500,
  },
  introImages: {
    flexDirection: 'row',
    gap: spacing(2),
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    marginVertical: spacing(2),
  },
  introImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    alignSelf: 'center',
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignSelf: 'center',
  },
  forFamilies: {
    borderColor: Colors.blue500,
  },
  motivation: {
    borderColor: Colors.green500,
  },
  insights: {
    borderColor: Colors.yellow500,
  },
});

export default Welcome2;
