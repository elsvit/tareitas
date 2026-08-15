import { StyleSheet } from 'react-native';

import { Colors } from '~/styles';

export const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey200,
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 8,
  },

  sideSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 88,
    flexShrink: 0,
  },

  sideSlotRight: {
    justifyContent: 'flex-end',
  },

  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },

  dateBadge: {
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
    textAlign: 'center',
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.grey200,
  },

  iconButtonActive: {
    borderColor: Colors.blue500,
    backgroundColor: '#EFF6FF',
  },

  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.blue500,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },

  chevronPrevious: {
    transform: [{ rotate: '180deg' }],
  },

  searchContainer: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
});
