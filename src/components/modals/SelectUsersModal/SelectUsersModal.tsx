import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import CloseIcon from '~/assets/svg/common/cross.svg';
import { Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { UserListItem } from '~/components/users/UserListItem/UserListItem';
import { t } from '~/services';
import { selectAllChildren } from '~/store/children/selectors';
import { selectAllParents } from '~/store/parents/selectors';
import { ERole } from '~/store/settings/enums';
import { Colors } from '~/styles';
import { IChild } from '~/types/IChild';
import { IParent } from '~/types/IParent';

export type SelectedUser = {
  id: string;
  role: ERole;
  passwordPattern?: string;
  name: string;
  email?: string;
  username?: string;
};

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  onSelectUser: (user: SelectedUser) => void;
  onLogout: () => void;
  onChangeGroup?: () => void;
  showChangeGroup?: boolean;
};

const toParentUser = (parent: IParent): SelectedUser => ({
  id: parent.id,
  role: parent.role === ERole.admin ? ERole.admin : ERole.parent,
  passwordPattern: parent.passwordPattern,
  name: parent.name,
  email: parent.email,
  username: parent.username,
});

const toChildUser = (child: IChild): SelectedUser => ({
  id: child.id,
  role: ERole.child,
  passwordPattern: child.passwordPattern,
  name: child.name,
  username: child.username,
});

export const SelectUsersModal: React.FC<Props> = ({
  isVisible,
  onRequestClose,
  onSelectUser,
  onLogout,
  onChangeGroup,
  showChangeGroup = false,
}) => {
  const parents = useSelector(selectAllParents);
  const children = useSelector(selectAllChildren);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
    >
      <SafeAreaView style={styles.backdropContainer}>
        <Pressable style={styles.backdrop} onPress={onRequestClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text variant="titleMedium" weight="bold">
              {t('users.select_user_please')}
            </Text>
            <IconButton
              Icon={<CloseIcon width={24} height={24} fill={Colors.grey500} />}
              onPress={onRequestClose}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text variant="titleLarge" fontFamily="fredoka" weight="bold" style={styles.sectionTitle}>
              {t('users.parents')}
            </Text>
            <View style={styles.list}>
              {parents.length === 0 ? (
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {t('users.no_parents')}
                </Text>
              ) : (
                parents.map(parent => (
                  <UserListItem
                    key={parent.id}
                    name={parent.name}
                    familyRole={parent.familyRole}
                    avatar={parent.avatar}
                    color={parent.color}
                    onPress={() => onSelectUser(toParentUser(parent))}
                  />
                ))
              )}
            </View>

            <Text
              variant="titleLarge"
              fontFamily="fredoka"
              weight="bold"
              style={[styles.sectionTitle, styles.sectionSpacing]}
            >
              {t('users.children')}
            </Text>
            <View style={styles.list}>
              {children.length === 0 ? (
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {t('users.no_children')}
                </Text>
              ) : (
                children.map(child => (
                  <UserListItem
                    key={child.id}
                    name={child.name}
                    avatar={child.avatar}
                    color={child.color}
                    onPress={() => onSelectUser(toChildUser(child))}
                  />
                ))
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onLogout}
              style={({ pressed }) => [
                styles.logoutRow,
                pressed && styles.logoutRowPressed,
              ]}
            >
              <Text variant="titleMedium" weight="bold" style={styles.logoutText}>
                {t('users.logout')}
              </Text>
            </Pressable>

            {showChangeGroup && onChangeGroup ? (
              <Pressable
                accessibilityRole="button"
                onPress={onChangeGroup}
                style={({ pressed }) => [
                  styles.logoutRow,
                  pressed && styles.logoutRowPressed,
                ]}
              >
                <Text
                  variant="titleMedium"
                  weight="bold"
                  style={styles.changeGroupText}
                >
                  {t('users.change_group')}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  emptyText: {
    opacity: 0.6,
  },
  logoutRow: {
    marginTop: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.grey200,
  },
  logoutRowPressed: {
    opacity: 0.7,
  },
  logoutText: {
    color: Colors.red500,
  },
  changeGroupText: {
    color: Colors.blue600,
  },
});
