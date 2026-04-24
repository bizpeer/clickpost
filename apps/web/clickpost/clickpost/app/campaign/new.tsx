import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { CampaignBuilder } from '../../components/campaign/CampaignBuilder';

export default function NewCampaignScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'New Campaign',
          headerShown: false,
        }} 
      />
      <View style={styles.content}>
        <CampaignBuilder />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
});
