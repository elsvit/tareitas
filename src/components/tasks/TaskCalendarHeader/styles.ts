import { StyleSheet } from 'react-native';

import { Colors } from '~/styles';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  dateText: {
    flex: 1,
    textTransform: 'capitalize',
    color: Colors.grey900,
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
});
