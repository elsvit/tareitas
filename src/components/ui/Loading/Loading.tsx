import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type Props = {
  backgroundColor?: string;
};

export function Loading({ backgroundColor }: Props) {
  return (
    <View style={[styles.container, backgroundColor && { backgroundColor }]}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
