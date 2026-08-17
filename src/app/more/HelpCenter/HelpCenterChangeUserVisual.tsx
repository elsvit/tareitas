import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Image as ExpoImage } from 'expo-image';

import Boy1 from '~/assets/img/users/boy1_320.jpg';
import Woman1 from '~/assets/img/users/woman1_320.jpg';
import ChevronRightIcon from '~/assets/svg/common/chevron-right.svg';
import { Text } from '~/components/ui';
import { t } from '~/services';
import { Colors } from '~/styles';

const AVATAR_SIZE = 32;

type UserChipProps = {
  name: string;
  image: number;
  color: string;
};

const UserChip: React.FC<UserChipProps> = ({ name, image, color }) => (
  <View style={styles.userChip}>
    <Text
      fontFamily="fredoka"
      weight="medium"
      numberOfLines={1}
      style={[styles.userName, { color }]}
    >
      {name}
    </Text>
    <View style={[styles.avatar, { borderColor: color }]}>
      <ExpoImage source={image} style={styles.avatarImage} contentFit="cover" />
    </View>
  </View>
);

export const HelpCenterChangeUserVisual: React.FC = () => (
  <View style={styles.visual}>
    <UserChip
      name={t('users.parent')}
      image={Woman1}
      color={Colors.pink500}
    />
    <ChevronRightIcon width={14} height={14} fill={Colors.grey500} />
    <UserChip name={t('users.child')} image={Boy1} color={Colors.blue500} />
  </View>
);

const styles = StyleSheet.create({
  visual: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    maxWidth: '100%',
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 140,
  },
  userName: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});

export default HelpCenterChangeUserVisual;
