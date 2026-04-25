import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { CampaignService } from '../../services/CampaignService';
import { Link } from 'expo-router';
import Animated, { FadeInUp, FadeInRight, FadeIn } from 'react-native-reanimated';
import { CampaignDetail } from './CampaignDetail';
import { supabase } from '../../services/SupabaseClient';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;
const isTablet = width > 768 && width <= 1024;

export function AdvertiserDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [advertiserId, setAdvertiserId] = useState<string | null>(null);

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

  const fetchSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setAdvertiserId(session.user.id);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (advertiserId) {
      fetchCampaigns();
    }
  }, [advertiserId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCampaigns();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
      case 'DRAFT': return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
      case 'EXHAUSTED': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'CLOSED': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      default: return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
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
            <Text style={styles.newButtonText}>+ {t('dashboard.createCampaign')}</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>

      <View style={styles.bentoGrid}>
        <Animated.View entering={FadeInRight.delay(100).duration(600)} style={[styles.bentoCard, styles.mainStat]}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>{t('dashboard.totalBudgetCommitment')}</Text>
            <View style={styles.trendBadge}>
              <Text style={styles.trendText}>+12.5%</Text>
            </View>
          </View>
          <Text style={styles.statValue}>
            {totalSpent.toLocaleString()} <Text style={styles.currency}>{campaigns[0]?.currency_code || 'KRW'}</Text>
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressFill, { width: campaigns.length > 0 ? '75%' : '0%' }]} />
          </View>
          <Text style={styles.statSubText}>{t('dashboard.totalCampaigns', { count: campaigns.length })}</Text>
        </Animated.View>

        <View style={styles.bentoColumn}>
          <Animated.View entering={FadeInRight.delay(200).duration(600)} style={[styles.bentoCard, styles.sideStat]}>
            <Text style={styles.statLabel}>{t('dashboard.activeMissions')}</Text>
            <View style={styles.row}>
              <Text style={styles.statValueSmall}>{campaigns.filter(c => c.status === 'ACTIVE').length}</Text>
              <View style={styles.activePulsar} />
            </View>
            <Text style={styles.statSubText}>{t('dashboard.currentlyScaling')}</Text>
          </Animated.View>
          <Animated.View entering={FadeInRight.delay(300).duration(600)} style={[styles.bentoCard, styles.sideStat]}>
            <Text style={styles.statLabel}>{t('dashboard.avgRoi')}</Text>
            <Text style={[styles.statValueSmall, { color: '#10b981' }]}>4.2x</Text>
            <Text style={styles.statSubText}>{t('dashboard.basedOnImpressions')}</Text>
          </Animated.View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('dashboard.yourCampaigns')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>{t('dashboard.filterByStatus')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {campaigns.length === 0 ? (
        <Animated.View entering={FadeIn.duration(800)} style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>🚀</Text>
          </View>
          <Text style={styles.emptyText}>{t('dashboard.noCampaigns')}</Text>
          <TouchableOpacity style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>{t('dashboard.createNow')}</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <View style={styles.campaignContainer}>
          {campaigns.map((item, index) => {
            const statusStyle = getStatusStyle(item.status);
            const progress = Math.min(Math.round(((item.mission_count * (item.video_reward || 5000)) / item.total_budget) * 100), 100);
            
            return (
              <Animated.View 
                key={item.campaign_id} 
                entering={FadeInUp.delay(400 + index * 50)}
                style={isDesktop ? styles.desktopCardWrapper : styles.mobileCardWrapper}
              >
                <TouchableOpacity 
                  style={styles.campaignCard}
                  onPress={() => setSelectedCampaignId(item.campaign_id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardMain}>
                    <View style={styles.cardHeader}>
                      <View style={styles.titleArea}>
                        <Text style={styles.campaignTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.badgeRow}>
                          <Text style={styles.platformBadge}>{item.target_platform}</Text>
                          <Text style={styles.typeBadge}>AI Avatar</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                          {t(`campaign.status.${item.status}`)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.campaignDesc} numberOfLines={2}>
                      {item.description || 'No description provided for this campaign.'}
                    </Text>

                    <View style={styles.cardStats}>
                      <View style={styles.cardStatItem}>
                        <Text style={styles.cardStatLabel}>{t('campaign.details.totalBudget')}</Text>
                        <Text style={styles.cardStatValue}>
                          {item.total_budget?.toLocaleString()} <Text style={styles.cardCurrency}>{item.currency_code}</Text>
                        </Text>
                      </View>
                      <View style={styles.cardStatItem}>
                        <Text style={styles.cardStatLabel}>{t('campaign.details.participated')}</Text>
                        <Text style={styles.cardStatValue}>{item.mission_count || 0}</Text>
                      </View>
                    </View>

                    <View style={styles.progressArea}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>{t('campaign.details.budgetExhaustion')}</Text>
                        <Text style={[styles.progressVal, { color: progress > 80 ? '#ef4444' : '#6366f1' }]}>{progress}%</Text>
                      </View>
                      <View style={styles.cardProgressBar}>
                        <View style={[styles.cardProgressFill, { width: `${progress}%`, backgroundColor: progress > 80 ? '#ef4444' : '#6366f1' }]} />
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.manageText}>{t('dashboard.manageAction')}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: isDesktop ? 64 : 20,
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: isDesktop ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: isDesktop ? 'center' : 'flex-start',
    marginBottom: 48,
    gap: 24,
  },
  greeting: {
    fontSize: isDesktop ? 42 : 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1.5,
  },
  brandText: {
    color: '#6366f1',
  },
  subGreeting: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 8,
    fontWeight: '500',
  },
  newButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  newButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 18,
  },
  bentoGrid: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: 24,
    marginBottom: 64,
  },
  bentoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 40,
    padding: 36,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 2,
  },
  mainStat: {
    flex: 2,
    backgroundColor: '#ffffff',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trendText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '800',
  },
  bentoColumn: {
    flex: 1,
    gap: 24,
  },
  sideStat: {
    flex: 1,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -2,
  },
  statValueSmall: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -1,
  },
  currency: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    marginTop: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 6,
  },
  statSubText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activePulsar: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
    opacity: 0.6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
  },
  campaignContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -12,
  },
  desktopCardWrapper: {
    width: '33.33%',
    padding: 12,
  },
  mobileCardWrapper: {
    width: '100%',
    padding: 12,
  },
  campaignCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  cardMain: {
    padding: 28,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
    marginRight: 12,
  },
  campaignTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  badgeRow: {
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  campaignDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginTop: 20,
    height: 44,
  },
  cardStats: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 24,
  },
  cardStatItem: {
    flex: 1,
  },
  cardStatLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardCurrency: {
    fontSize: 12,
    color: '#94a3b8',
  },
  progressArea: {
    marginTop: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  progressVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  cardProgressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  cardProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  manageText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '800',
  },
  emptyState: {
    padding: 80,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});


