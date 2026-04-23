import React from 'react';
import { StyleSheet, View, FlatList, Image } from 'react-native';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Typography } from '@/components/common/Typography';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MissionsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const mockMissions = [
    {
      id: 'm1',
      title: 'NeonCore Vanguard Launch',
      status: 'VERIFIED',
      reward: 850,
      daysLeft: 12,
      imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'm2',
      title: 'Minimalist Tech Accessories',
      status: 'SUBMITTED',
      reward: 1200,
      daysLeft: 45,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400&auto=format&fit=crop',
    },
  ];

  const renderMission = ({ item }: { item: any }) => (
    <Card style={styles.missionCard}>
      <View style={styles.missionHeader}>
        <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
        <View style={styles.missionTitleContainer}>
          <Typography variant="label" numberOfLines={1}>{item.title}</Typography>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'VERIFIED' ? '#4CAF50' : '#FF9800' }]}>
            <Typography variant="caption" color="#FFFFFF" bold>{item.status}</Typography>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.missionFooter}>
        <View style={styles.footerItem}>
          <Typography variant="caption" color={theme.icon}>45-Day Retention</Typography>
          <Typography variant="body" bold>{item.daysLeft} days left</Typography>
        </View>
        <View style={styles.footerItemRight}>
          <Typography variant="caption" color={theme.icon}>Reward</Typography>
          <Typography variant="body" color={theme.primary} bold>₩{item.reward.toLocaleString()}</Typography>
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Typography variant="h1" bold>My Missions</Typography>
        <Typography variant="body" color={theme.icon}>Track your campaign performance</Typography>
      </View>

      <FlatList
        data={mockMissions}
        renderItem={renderMission}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="list.bullet" size={60} color={theme.border} />
            <Typography variant="body" color={theme.icon} style={{ marginTop: 16 }}>
              No active missions. Join one in the Market!
            </Typography>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  list: {
    paddingBottom: 40,
  },
  missionCard: {
    marginBottom: 16,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  missionTitleContainer: {
    marginLeft: 16,
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flex: 1,
  },
  footerItemRight: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
});
