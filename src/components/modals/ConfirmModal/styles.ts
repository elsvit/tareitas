import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  backdropContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  sheet: {
    width: '90%',
    maxWidth: 520,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },

  title: {
    marginBottom: 12,
  },

  message: {
    marginBottom: 24,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});
