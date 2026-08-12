import { StyleSheet } from 'react-native';

import { Colors } from '~/styles';

export const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },

  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: Colors.grey700,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },

  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.grey300,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grey700,
  },

  dayLabelSelected: {
    color: '#FFFFFF',
  },
});
