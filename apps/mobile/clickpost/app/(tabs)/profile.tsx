import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Typography } from '@/components/common/Typography';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const stats = [
    { label: 'Completed', value: '12', icon: 'checkmark.circle.fill' },
    { label: 'Followers', value: '1.2k', icon: 'person.2.fill' },
    { label: 'Multiplier', value: 'x1.2', icon: 'bolt.fill' },
  ];

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => router.push('/studio')}
              style={styles.avatarContainer}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }} 
                style={styles.avatarImage}
              />
              <View style={styles.editBadge}>
                <IconSymbol name="pencil" size={10} color="#1A1A1A" />
              </View>
            </TouchableOpacity>
            <View style={styles.nameContainer}>
              <Typography variant="h2" bold>BizPeer</Typography>
              <Typography variant="caption" color={theme.icon}>Premium Member</Typography>
            </View>
          </View>
        </View>

        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Typography variant="caption" color="#1A1A1A" bold>TOTAL AVAILABLE POINTS</Typography>
            <View style={styles.proBadge}>
              <Typography variant="caption" color="#FFFFFF" bold style={{ fontSize: 8 }}>PRO</Typography>
            </View>
          </View>
          <View style={styles.pointsRow}>
            <Typography variant="h1" color="#1A1A1A" style={{ fontSize: 42 }}>24,500</Typography>
            <Typography variant="h3" color="#1A1A1A" style={{ marginLeft: 8 }}>CP</Typography>
          </View>
          <Typography variant="caption" color="#1A1A1A" style={{ opacity: 0.7 }}>≈ ₩24,500 KRW</Typography>
          
          <TouchableOpacity style={styles.withdrawButton} activeOpacity={0.8}>
            <Typography variant="body" bold color="#FFFFFF">Initiate Withdrawal</Typography>
            <IconSymbol name="arrow.right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </Card>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statItem}>
              <IconSymbol name={stat.icon as any} size={20} color={theme.primary} />
              <Typography variant="h3" bold style={{ marginTop: 8 }}>{stat.value}</Typography>
              <Typography variant="caption" color={theme.icon}>{stat.label}</Typography>
            </Card>
          ))}
        </View>

        <Typography variant="h2" bold style={styles.sectionTitle}>Payout Methods</Typography>
        <Card style={styles.payoutCard}>
          <TouchableOpacity style={styles.payoutItem}>
            <IconSymbol name="creditcard.fill" size={24} color={theme.text} />
            <Typography variant="body" style={{ marginLeft: 16, flex: 1 }}>Naver Pay</Typography>
            <Typography variant="caption" color={theme.icon}>Primary</Typography>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.payoutItem}>
            <IconSymbol name="building.columns.fill" size={24} color={theme.text} />
            <Typography variant="body" style={{ marginLeft: 16, flex: 1 }}>Bank Transfer</Typography>
            <IconSymbol name="chevron.right" size={16} color={theme.icon} />
          </TouchableOpacity>
        </Card>

        <Button 
          title="Sign Out" 
          variant="outline" 
          onPress={() => console.log('Sign Out')} 
          style={styles.signOutButton}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#FAE100',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FAE100',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  nameContainer: {
    marginLeft: 20,
  },
  balanceCard: {
    backgroundColor: '#FAE100',
    padding: 24,
    borderWidth: 0,
    marginBottom: 24,
    borderRadius: 24,
    elevation: 12,
    shadowColor: '#FAE100',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proBadge: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  withdrawButton: {
    marginTop: 24,
    backgroundColor: '#1A1A1A',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    width: '31%',
    alignItems: 'center',
    padding: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  payoutCard: {
    padding: 0,
    marginBottom: 30,
  },
  payoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  signOutButton: {
    borderColor: '#FF4444',
  },
});
