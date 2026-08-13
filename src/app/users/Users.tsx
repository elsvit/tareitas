import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import { useRouter } from 'expo-router';

import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { Button, Space, Text } from '~/components/ui';
import { ChildListItem, ParentListItem } from '~/components/users/UserListItem';
import { t } from '~/services';
import { selectAllChildren } from '~/store/children/selectors';
import { selectAllParents } from '~/store/parents/selectors';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole } from '~/store/settings/selectors';
import { Colors } from '~/styles';
import { EScreens } from '~/types';

export default function Users() {
  const router = useRouter();
  const parents = useSelector(selectAllParents);
  const children = useSelector(selectAllChildren);
  const currentRole = useSelector(selectCurrentRole);
  const isAdmin = currentRole === ERole.admin;

  const handleAddParent = useCallback(() => {
    router.push(`/${EScreens.ParentAdd}` as any);
  }, [router]);

  const handleAddChild = useCallback(() => {
    router.push(`/${EScreens.ChildAdd}` as any);
  }, [router]);

  return (
    <SafeAreaBgImage>
      <ScreenHeader
        hasBackButton
        title={t('users.title')}
        containerStyle={styles.screenHeader}
      />
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
                <ParentListItem id={p.id} />
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

        {isAdmin && (
          <View style={styles.actions}>
            <Button mode="contained" onPress={handleAddParent}>
              {t('users.add_parent')}
            </Button>
            <Space size={12} />
            <Button mode="contained" onPress={handleAddChild}>
              {t('users.add_child')}
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaBgImage>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },

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
  actions: {
    marginTop: 24,
  },
});
