import React from 'react';
import { StyleSheet } from 'react-native';
import { AdvertiserDashboard } from '@/components/advertiser/AdvertiserDashboard';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <AdvertiserDashboard />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

