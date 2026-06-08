import React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Card,
  Space,
  Text,
} from '~/components/ui';
import { t } from '~/services';
import { spacing } from '~/styles';
import { Colors } from '~/styles';

export const Welcome3: React.FC = () => {
  const getCard = ({
    title,
    color,
    description,
  }: {
    title: string;
    color: string;
    description: string;
  }) => (
    <Card style={[styles.card, { borderColor: color }]}>
      <Card.Content>
        <Text
          variant="titleLarge"
          fontFamily="fredoka"
          weight="bold"
          color={color}
        >
          {title}
        </Text>
        <Space size={8} />
        <Text variant="titleLarge">{description}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text
          variant="headlineMedium"
          fontFamily="fredoka"
          weight="bold"
          color={Colors.orange500}
        >
          {t('welcome.how_it_works')}
        </Text>
      </View>
      <View style={styles.titleContainer}>
        <Text variant="bodyLarge">{t('welcome.howItWorksSubtitle')}</Text>
      </View>

      {getCard({
        title: `1. ${t('welcome.add_your_children')}`,
        color: Colors.blue600,
        description: t('welcome.addYourChildrenDescription'),
      })}

      {getCard({
        title: `2. ${t('welcome.create_tasks_and_habits')}`,
        color: Colors.brightGreen500,
        description: t('welcome.createTasksAndRoutinesDescription'),
      })}

      {getCard({
        title: `3. ${t('welcome.children_completion_and_earn')}`,
        color: Colors.orange500,
        description: t('welcome.childrenCompletionAndEarnDescription'),
      })}

      {getCard({
        title: `4. ${t('welcome.parent_approval_and_rewards')}`,
        color: Colors.yellow500,
        description: t('welcome.parentApprovalAndRewardsDescription'),
      })}
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
  card: {
    borderColor: Colors.grey500,
    borderWidth: 4,
    borderRadius: 8,
    marginVertical: spacing(2),
  },
  textContainer: {
    flex: 1,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignSelf: 'center',
  },
});

export default Welcome3;
