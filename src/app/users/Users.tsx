import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import bgImgSrc from '~/assets/img/bg.png';
import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { Text } from '~/components/ui';
import { ChildListItem, ParentListItem } from '~/components/users/UserListItem';
import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { t } from '~/services';
import { selectAllChildren } from '~/store/children/selectors';
import { selectAllParents } from '~/store/parents/selectors';
import { ERole } from '~/store/settings/enums';
import { Colors } from '~/styles';

export default function Users() {
  useI18nHeaderTitle('users.title');

  const parents = useSelector(selectAllParents);
  const children = useSelector(selectAllChildren);

  return (
    <SafeAreaBackground bgImg={bgImgSrc}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" fontFamily="fredoka" weight="bold" style={styles.sectionTitle} >
          {t('users.parents') || 'Parents'}
        </Text>
        <View style={styles.list}>
          {parents.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptyText}>
              {t('users.no_parents') || 'No parents yet'}
            </Text>
          ) : (
            parents.map(p => (
              <View style={styles.item} key={p.id}>
                <ParentListItem id={p.id} role={ERole.parent} />
              </View>
            ))
          )}
        </View>

        <Text variant="titleLarge" fontFamily="fredoka" weight="bold" style={[styles.sectionTitle, styles.sectionSpacing]}>
          {t('users.children') || 'Children'}
        </Text>
        <View style={styles.list}>
          {children.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptyText}>
              {t('users.no_children') || 'No children yet'}
            </Text>
          ) : (
            children.map(c => (
              <View style={styles.item} key={c.id}>
                <ChildListItem id={c.id} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    color: Colors.blue500,
  },
  sectionSpacing: {
    marginTop: 16,
  },
  list: {
    gap: 8,
  },
  item: {
    // Each item already has its own padding/border; keep vertical spacing here.
  },
  emptyText: {
    opacity: 0.6,
  },
});
