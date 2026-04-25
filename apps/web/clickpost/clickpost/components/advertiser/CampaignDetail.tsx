import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Image } from 'react-native';
import { CampaignService } from '../../services/CampaignService';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;

interface CampaignDetailProps {
  campaignId: string;
  onBack: () => void;
}

type TabType = 'overview' | 'strategy' | 'messages';

export function CampaignDetail({ campaignId, onBack }: CampaignDetailProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [campaign, setCampaign] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [scripts, setScripts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const campaignData = await CampaignService.getCampaignById(campaignId);
        setCampaign(campaignData);
        
        const statsData = await CampaignService.getCampaignStats(campaignId);
        setStats(statsData);

        // Fetch scripts associated with this campaign
        const { data: scriptsData, error: sError } = await (CampaignService as any).supabase
          .from('campaign_scripts')
          .select('*')
          .eq('campaign_id', campaignId);
        
        if (scriptsData) setScripts(scriptsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [campaignId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!campaign) return null;

  const renderOverview = () => (
    <Animated.View entering={FadeInDown.duration(600)} style={styles.tabContent}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('campaign.details.infoTitle')}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('campaign.builder.nameLabel')}</Text>
            <Text style={styles.infoValue}>{campaign.title}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('campaign.builder.purposeLabel')}</Text>
            <Text style={styles.infoValue}>{t(`campaign.builder.${campaign.purpose?.toLowerCase()}`)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('campaign.details.platformGoal')}</Text>
            <Text style={styles.infoValue}>{campaign.target_platform}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('campaign.builder.periodLabel')}</Text>
            <Text style={styles.infoValue}>
              {new Date(campaign.start_date).toLocaleDateString()} ~ {new Date(campaign.end_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#6366f1' }]}>
          <Text style={styles.statLabel}>{t('campaign.details.spentTotal')}</Text>
          <Text style={styles.statValue}>
            {stats?.spent_budget?.toLocaleString()} <Text style={styles.statCurrency}>{campaign.currency_code}</Text>
          </Text>
          <Text style={styles.statLimit}>/ {campaign.total_budget?.toLocaleString()}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
          <Text style={styles.statLabel}>{t('campaign.details.verifiedMissions')}</Text>
          <Text style={styles.statValue}>{stats?.verified_count}</Text>
          <Text style={styles.statLimit}>{t('campaign.details.participated')}: {stats?.mission_count}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
          <Text style={styles.statLabel}>{t('campaign.details.exhaustionRate')}</Text>
          <Text style={[styles.statValue, { color: stats?.exhaustion_rate > 90 ? '#ef4444' : '#0f172a' }]}>
            {stats?.exhaustion_rate?.toFixed(1)}%
          </Text>
          <View style={styles.miniProgressBar}>
             <View style={[styles.miniProgressFill, { width: `${Math.min(stats?.exhaustion_rate || 0, 100)}%` }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderStrategy = () => (
    <Animated.View entering={FadeInDown.duration(600)} style={styles.tabContent}>
      <View style={styles.gridRow}>
        <View style={[styles.sectionCard, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>{t('campaign.details.materialsTitle')}</Text>
          <View style={styles.materialsList}>
            {campaign.provided_media_urls?.length > 0 ? (
              campaign.provided_media_urls.map((url: string, idx: number) => (
                <View key={idx} style={styles.materialItem}>
                  <View style={styles.materialIcon}>
                    <Text>📄</Text>
                  </View>
                  <Text style={styles.materialName} numberOfLines={1}>Material_{idx + 1}</Text>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>{t('campaign.details.viewMaterial')}</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No materials uploaded.</Text>
            )}
          </View>
        </View>

        <View style={[styles.sectionCard, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>{t('campaign.details.keywordsTitle')}</Text>
          <View style={styles.keywordCloud}>
            {campaign.must_include_keywords?.map((k: string, idx: number) => (
              <View key={idx} style={styles.essentialTag}>
                <Text style={styles.essentialTagText}># {k}</Text>
              </View>
            ))}
          </View>
          {campaign.must_exclude_keywords?.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24, fontSize: 16 }]}>{t('campaign.details.restrictedKeywords')}</Text>
              <View style={styles.keywordCloud}>
                {campaign.must_exclude_keywords.map((k: string, idx: number) => (
                  <View key={idx} style={styles.restrictedTag}>
                    <Text style={styles.restrictedTagText}>! {k}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );

  const renderMessages = () => (
    <Animated.View entering={FadeInDown.duration(600)} style={styles.tabContent}>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('campaign.details.scriptsTitle')}</Text>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>Gemini AI Powered</Text>
          </View>
        </View>
        
        {scripts.length === 0 ? (
          <Text style={styles.emptyText}>{t('campaign.details.noScripts')}</Text>
        ) : (
          <View style={styles.scriptsGrid}>
            {scripts.map((s, idx) => (
              <View key={s.script_id} style={[styles.scriptCard, s.is_approved && styles.approvedScriptCard]}>
                <View style={styles.scriptHeader}>
                  <Text style={styles.scriptOption}>Option {idx + 1}</Text>
                  {s.is_approved && (
                    <View style={styles.approvedBadge}>
                      <Text style={styles.approvedBadgeText}>APPROVED</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.scriptText} numberOfLines={6}>{s.script_text}</Text>
                {!s.is_approved && (
                  <TouchableOpacity style={styles.scriptApproveButton}>
                    <Text style={styles.scriptApproveText}>{t('campaign.details.approveAction')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
           <Text style={styles.headerTitle}>{campaign.title}</Text>
           <View style={[styles.statusBadge, { backgroundColor: campaign.status === 'ACTIVE' ? 'rgba(99, 102, 241, 0.1)' : '#f1f5f9' }]}>
             <Text style={[styles.statusText, { color: campaign.status === 'ACTIVE' ? '#6366f1' : '#64748b' }]}>
               {t(`campaign.status.${campaign.status}`)}
             </Text>
           </View>
        </View>
        <TouchableOpacity style={styles.manageButton}>
          <Text style={styles.manageButtonText}>{t('campaign.details.manageCampaign')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {(['overview', 'strategy', 'messages'] as TabType[]).map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {t(`campaign.details.section${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'strategy' && renderStrategy()}
        {activeTab === 'messages' && renderMessages()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isDesktop ? 64 : 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
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
  manageButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  manageButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: isDesktop ? 64 : 20,
    backgroundColor: '#ffffff',
    gap: 32,
  },
  tab: {
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
  },
  activeTabText: {
    color: '#6366f1',
  },
  scrollContent: {
    padding: isDesktop ? 64 : 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  tabContent: {
    gap: 24,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.02,
    shadowRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  aiBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6366f1',
    textTransform: 'uppercase',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
  },
  infoItem: {
    minWidth: 240,
  },
  infoLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 24,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
  },
  statLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  statCurrency: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  statLimit: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  miniProgressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  gridRow: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: 24,
  },
  materialsList: {
    gap: 16,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    gap: 16,
  },
  materialIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  materialName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  viewButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
  },
  keywordCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  essentialTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  essentialTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366f1',
  },
  restrictedTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  restrictedTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  scriptsGrid: {
    flexDirection: isDesktop ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 20,
  },
  scriptCard: {
    width: isDesktop ? '31%' : '100%',
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  approvedScriptCard: {
    borderColor: '#6366f1',
    backgroundColor: '#ffffff',
    borderWidth: 2,
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scriptOption: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  approvedBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  approvedBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
  },
  scriptText: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 24,
    marginBottom: 20,
  },
  scriptApproveButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  scriptApproveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6366f1',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 40,
  }
});

