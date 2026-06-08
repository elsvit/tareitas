import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import RewardImage from '~/assets/img/tabs/tab_rewards_active.png';
import RoutinesImage from '~/assets/img/tabs/tab_habits_active.png';
import TasksImage from '~/assets/img/tabs/tab_tasks_active.png';
import { Card, Space, Text } from '~/components/ui';
import { t } from '~/services';
import { spacing } from '~/styles';
import { Colors } from '~/styles';

export const Welcome1: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text
          variant="headlineMedium"
          fontFamily="fredoka"
          weight="bold"
          color={Colors.orange500}
        >
          {t('welcome.welcome_to_tareitas')}
        </Text>
      </View>
      <View style={styles.titleContainer}>
        <Text variant="bodyLarge">{t('welcome.learn_what_we_do')}</Text>
      </View>

      <Card style={[styles.card, styles.intro]}>
        <Card.Content>
          <Text variant="titleLarge" color={Colors.blue600}>
            {t('welcome.intro')}
          </Text>
          <Space size={8} />
          <Text variant="titleLarge" color={Colors.blue600}>
            {t('welcome.intro2')}
          </Text>
        </Card.Content>
        <View style={styles.introImages}>
          <Image source={TasksImage} style={styles.introImage} />
          <Image source={RoutinesImage} style={styles.introImage} />
          <Image source={RewardImage} style={styles.introImage} />
        </View>
      </Card>

      <LinearGradient
        colors={[Colors.blue500, Colors.blue100]}
        end={{ x: 0.5, y: 0 }}
        start={{ x: 0.5, y: 1 }}
        locations={[0.2, 0.8]}
        style={[styles.gradient, styles.forFamilies]}
      >
        <View style={styles.row}>
          <View>
            <Image source={TasksImage} style={styles.cardImage} />
          </View>
          <View style={styles.textContainer}>
            <Text
              fontFamily="fredoka"
              weight="bold"
              variant="titleLarge"
              color={Colors.blue600}
            >
              {t('welcome.for_families')}
            </Text>
            <Space size={8} />
            <Text variant="titleLarge" color={Colors.blue900}>
              {t('welcome.forFamiliesDescription')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={[Colors.brightGreen500, Colors.brightGreen100]}
        end={{ x: 0.5, y: 0 }}
        start={{ x: 0.5, y: 1 }}
        locations={[0.2, 0.8]}
        style={[styles.gradient, styles.motivation]}
      >
        <View style={styles.row}>
          <View>
            <Image source={RewardImage} style={styles.cardImage} />
          </View>
          <View style={styles.textContainer}>
            <Text
              fontFamily="fredoka"
              weight="bold"
              variant="titleLarge"
              color={Colors.brightGreen500}
            >
              {t('welcome.motivation')}
            </Text>
            <Space size={8} />
            <Text variant="titleLarge" color={Colors.brightGreen900}>
              {t('welcome.motivationDescription')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={[Colors.yellow500, Colors.yellow100]}
        end={{ x: 0.5, y: 0 }}
        start={{ x: 0.5, y: 1 }}
        locations={[0.2, 0.8]}
        style={[styles.gradient, styles.insights]}
      >
        <View style={styles.row}>
          <View>
            <Image source={TasksImage} style={styles.cardImage} />
          </View>
          <View style={styles.textContainer}>
            <Text
              fontFamily="fredoka"
              weight="bold"
              variant="titleLarge"
              color={Colors.yellow500}
            >
              {t('welcome.insights')}
            </Text>
            <Space size={8} />
            <Text variant="titleLarge" color={Colors.orange900}>
              {t('welcome.insightsDescription')}
            </Text>
          </View>
        </View>
      </LinearGradient>
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

export default Welcome1;
