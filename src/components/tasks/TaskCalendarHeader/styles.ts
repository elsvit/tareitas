import { StyleSheet } from 'react-native';

import { Colors } from '~/styles';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey200,
  },

  dateArea: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  dateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  dateBadgeToday: {
    borderColor: Colors.green500,
  },

  dateText: {
    textTransform: 'capitalize',
    color: Colors.grey900,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 4,
  },

  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.grey200,
    marginLeft: 8,
  },

  chevronPrevious: {
    transform: [{ rotate: '180deg' }],
  },
});
