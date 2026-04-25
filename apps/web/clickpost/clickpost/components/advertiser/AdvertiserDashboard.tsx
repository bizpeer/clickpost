import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { CampaignService } from '../../services/CampaignService';
import { Link } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { CampaignDetail } from './CampaignDetail';

const { width } = Dimensions.get('window');
const isDesktop = width > 768;

export function AdvertiserDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [advertiserId, setAdvertiserId] = useState('00000000-0000-0000-0000-000000000000'); // Mock ID

  const fetchCampaigns = async () => {
    try {
      const data = await CampaignService.listCampaigns(advertiserId);
      setCampaigns(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCampaigns();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#6366f1';
      case 'DRAFT': return '#94a3b8';
      case 'EXHAUSTED': return '#f59e0b';
      case 'CLOSED': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  if (selectedCampaignId) {
    return <CampaignDetail campaignId={selectedCampaignId} onBack={() => setSelectedCampaignId(null)} />;
  }

  const totalSpent = campaigns
    .filter(c => c.status === 'ACTIVE')
    .reduce((sum, c) => sum + (c.total_budget || 0), 0);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            <Trans 
              i18nKey="dashboard.greeting" 
              values={{ name: 'ClickPost' }}
              components={[<Text style={styles.brandText} />]}
            />
          </Text>
          <Text style={styles.subGreeting}>{t('dashboard.subGreeting')}</Text>
        </View>
        <Link href="/campaign/new" asChild>
          <TouchableOpacity style={styles.newButton}>
            <Text style={styles.newButtonText}>{t('dashboard.createCampaign')}</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>


      <View style={styles.bentoGrid}>
        <Animated.View entering={FadeInRight.delay(100).duration(600)} style={[styles.bentoCard, styles.mainStat]}>
          <Text style={styles.statLabel}>{t('dashboard.totalBudgetCommitment')}</Text>
          <Text style={styles.statValue}>{totalSpent.toLocaleString()} <Text style={styles.currency}>{campaigns[0]?.currency_code || 'KRW'}</Text></Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: campaigns.length > 0 ? '75%' : '0%' }]} />
          </View>
          <Text style={styles.statSubText}>{t('dashboard.totalCampaigns', { count: campaigns.length })}</Text>
        </Animated.View>

        <View style={styles.bentoColumn}>
          <Animated.View entering={FadeInRight.delay(200).duration(600)} style={[styles.bentoCard, styles.sideStat]}>
            <Text style={styles.statLabel}>{t('dashboard.activeMissions')}</Text>
            <Text style={styles.statValueSmall}>{campaigns.filter(c => c.status === 'ACTIVE').length}</Text>
            <Text style={styles.statSubText}>{t('dashboard.currentlyScaling')}</Text>
          </Animated.View>
          <Animated.View entering={FadeInRight.delay(300).duration(600)} style={[styles.bentoCard, styles.sideStat, { borderLeftColor: '#10b981' }]}>
            <Text style={styles.statLabel}>{t('dashboard.avgRoi')}</Text>
            <Text style={[styles.statValueSmall, { color: '#10b981' }]}>4.2x</Text>
            <Text style={styles.statSubText}>{t('dashboard.basedOnImpressions')}</Text>
          </Animated.View>
        </View>
      </View>


      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('dashboard.yourCampaigns')}</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>{t('dashboard.filterByStatus')}</Text>
        </TouchableOpacity>
      </View>

      
      {campaigns.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('dashboard.noCampaigns')}</Text>
          <TouchableOpacity style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>{t('dashboard.createNow')}</Text>
          </TouchableOpacity>
        </View>

      ) : (
        <View style={isDesktop ? styles.campaignGrid : styles.campaignList}>
          {campaigns.map((item, index) => (
            <Animated.View 
              key={item.campaign_id} 
              entering={FadeInUp.delay(400 + index * 100)}
            >
              <TouchableOpacity 
                style={styles.campaignCard}
                onPress={() => setSelectedCampaignId(item.campaign_id)}
                activeOpacity={0.9}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.titleWrapper}>
                    <Text style={styles.campaignTitle}>{item.title}</Text>
                    <View style={styles.tagRow}>
                      <Text style={styles.platformBadge}>{item.target_platform}</Text>
                      <Text style={styles.typeBadge}>{t('campaign.type.aiAvatar')}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{t(`campaign.status.${item.status}`)}</Text>
                  </View>

                </View>
                
                <Text style={styles.campaignDescription} numberOfLines={2}>{item.description}</Text>
                
                <View style={styles.budgetProgressContainer}>
                  <View style={styles.budgetProgressHeader}>
                    <Text style={styles.progressLabel}>{t('campaign.details.budgetExhaustion')}</Text>
                    <Text style={styles.progressPercent}>

                      {Math.min(Math.round(((item.mission_count * (item.video_reward || 5000)) / item.total_budget) * 100), 100)}%
                    </Text>
                  </View>
                  <View style={styles.cardProgressBar}>
                    <View 
                      style={[
                        styles.cardProgressFill, 
                        { width: `${Math.min(((item.mission_count * (item.video_reward || 5000)) / item.total_budget) * 100), 100}%` }
                      ]} 
                    />
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>{t('campaign.details.totalBudget')}</Text>
                    <Text style={styles.footerValue}>{item.total_budget?.toLocaleString()} {item.currency_code}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>{t('campaign.details.participated')}</Text>
                    <Text style={styles.footerValue}>{item.mission_count || 0}</Text>
                  </View>
                  <View style={styles.footerAction}>
                    <Text style={styles.viewDetails}>{t('dashboard.manageAction')}</Text>
                  </View>
                </View>

              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    padding: isDesktop ? 48 : 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  brandText: {
    color: '#6366f1',
    fontWeight: '900',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: isDesktop ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: isDesktop ? 'center' : 'flex-start',
    marginBottom: 40,
    gap: 20,
  },
  greeting: {
    fontSize: isDesktop ? 36 : 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1.2,
  },
  subGreeting: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  newButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  newButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  bentoGrid: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: 24,
    marginBottom: 48,
  },
  bentoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  mainStat: {
    flex: 2,
    borderLeftWidth: 8,
    borderLeftColor: '#6366f1',
  },
  bentoColumn: {
    flex: 1,
    gap: 24,
  },
  sideStat: {
    flex: 1,
    padding: 24,
    borderLeftWidth: 6,
    borderLeftColor: '#818cf8',
  },
  statLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
  },
  statValueSmall: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
  },
  currency: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginTop: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  statSubText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
  },
  campaignGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  campaignList: {
    gap: 20,
  },
  campaignCard: {
    width: isDesktop ? (Dimensions.get('window').width - 120 - 48) / 2 : '100%',
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 16,
  },
  campaignTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 24,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  platformBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  campaignDescription: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 32,
    height: 48,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 24,
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '800',
  },
  footerAction: {
    paddingLeft: 12,
  },
  viewDetails: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '800',
  },
  budgetProgressContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  budgetProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
  },
  cardProgressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  cardProgressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  emptyState: {
    padding: 80,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 40,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});

