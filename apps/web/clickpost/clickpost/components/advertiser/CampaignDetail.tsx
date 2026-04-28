import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Image } from 'react-native';
import { CampaignService } from '../../services/CampaignService';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '../../services/SupabaseClient';

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
        const { data: scriptsData, error: sError } = await supabase
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

  // Three-column layout constants
  const renderBasicInfo = () => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.sectionCard}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{t('campaign.details.infoTitle')}</ThemedText>
      <View style={styles.infoList}>
        <View style={styles.infoItemSmall}>
          <ThemedText style={styles.infoLabel}>{t('campaign.builder.purposeLabel')}</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.infoValue}>{t(`campaign.builder.${campaign.purpose?.toLowerCase()}`)}</ThemedText>
        </View>
        <View style={styles.infoItemSmall}>
          <ThemedText style={styles.infoLabel}>{t('campaign.details.platformGoal')}</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.infoValue}>{campaign.target_platform}</ThemedText>
        </View>
        <View style={styles.infoItemSmall}>
          <ThemedText style={styles.infoLabel}>{t('campaign.builder.periodLabel')}</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.infoValue}>
            {new Date(campaign.start_date).toLocaleDateString()} ~ {new Date(campaign.end_date).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );

  const renderStats = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.statsContainer}>
      <View style={[styles.statCardCompact, { borderLeftColor: '#FF3B30' }]}>
        <ThemedText style={styles.statLabel}>{t('campaign.details.spentTotal')}</ThemedText>
        <ThemedText type="subtitle" style={styles.statValueSmall}>
          {stats?.spent_budget?.toLocaleString()} <ThemedText style={styles.statCurrencySmall}>{campaign.currency_code}</ThemedText>
        </ThemedText>
        <ThemedText style={styles.statLimitSmall}>/ {campaign.total_budget?.toLocaleString()}</ThemedText>
      </View>
      <View style={[styles.statCardCompact, { borderLeftColor: '#34C759' }]}>
        <ThemedText style={styles.statLabel}>{t('campaign.details.verifiedMissions')}</ThemedText>
        <ThemedText type="subtitle" style={styles.statValueSmall}>{stats?.verified_count}</ThemedText>
        <ThemedText style={styles.statLimitSmall}>{t('campaign.details.participated')}: {stats?.mission_count}</ThemedText>
      </View>
    </Animated.View>
  );

  const renderMaterialsAndKeywords = () => (
    <>
      <Animated.View entering={FadeInDown.delay(300)} style={styles.sectionCard}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{t('campaign.details.materialsTitle')}</ThemedText>
        <View style={styles.materialsList}>
          {campaign.provided_media_urls?.length > 0 ? (
            campaign.provided_media_urls.map((url: string, idx: number) => (
              <View key={idx} style={styles.materialItem}>
                <View style={styles.materialIcon}>
                  <ThemedText>📄</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.materialName} numberOfLines={1}>Material_{idx + 1}</ThemedText>
                <TouchableOpacity style={styles.viewButton}>
                  <ThemedText style={styles.viewButtonText}>{t('campaign.details.viewMaterial')}</ThemedText>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <ThemedText style={styles.emptyText}>No materials uploaded.</ThemedText>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)} style={[styles.sectionCard, { marginTop: 24 }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{t('campaign.details.keywordsTitle')}</ThemedText>
        <View style={styles.keywordCloud}>
          {campaign.must_include_keywords?.map((k: string, idx: number) => (
            <View key={idx} style={styles.essentialTag}>
              <ThemedText type="defaultSemiBold" style={styles.essentialTagText}># {k}</ThemedText>
            </View>
          ))}
        </View>
        {campaign.must_exclude_keywords?.length > 0 && (
          <>
            <ThemedText type="defaultSemiBold" style={[styles.sectionSubtitle, { marginTop: 24, marginBottom: 12 }]}>{t('campaign.details.restrictedKeywords')}</ThemedText>
            <View style={styles.keywordCloud}>
              {campaign.must_exclude_keywords.map((k: string, idx: number) => (
                <View key={idx} style={styles.restrictedTag}>
                  <ThemedText type="defaultSemiBold" style={styles.restrictedTagText}>! {k}</ThemedText>
                </View>
              ))}
            </View>
          </>
        )}
      </Animated.View>
    </>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ThemedText type="defaultSemiBold" style={styles.backText}>← {t('common.back')}</ThemedText>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
           <ThemedText type="title" style={styles.headerTitle}>{campaign.title}</ThemedText>
           <View style={[styles.statusBadge, { backgroundColor: campaign.status === 'ACTIVE' ? 'rgba(255, 59, 48, 0.1)' : '#f1f5f9' }]}>
             <ThemedText type="defaultSemiBold" style={[styles.statusText, { color: campaign.status === 'ACTIVE' ? '#FF3B30' : '#64748b' }]}>
               {t(`campaign.status.${campaign.status}`)}
             </ThemedText>
           </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.manageButton}>
            <ThemedText type="defaultSemiBold" style={styles.manageButtonText}>{t('campaign.details.manageCampaign')}</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={isDesktop ? styles.threeColumnLayout : styles.mobileLayout}>
          {/* LEFT COLUMN: BASIC INFO & STATS */}
          <View style={styles.leftColumn}>
            {renderBasicInfo()}
            {renderStats()}
          </View>

          {/* RIGHT COLUMN: MATERIALS & KEYWORDS */}
          <View style={styles.rightColumn}>
            {renderMaterialsAndKeywords()}
          </View>
        </View>

        {/* BOTTOM SECTION: AI SCRIPTS (FULL WIDTH) */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.bottomSection}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText type="subtitle" style={styles.sectionTitle}>{t('campaign.details.scriptsTitle')}</ThemedText>
                <ThemedText style={styles.sectionDesc}>AI-powered script variations tailored for your campaign</ThemedText>
              </View>
              <View style={styles.aiBadge}>
                <ThemedText type="defaultSemiBold" style={styles.aiBadgeText}>Gemini AI Active</ThemedText>
              </View>
            </View>
            
            {scripts.length === 0 ? (
              <ThemedText style={styles.emptyText}>{t('campaign.details.noScripts')}</ThemedText>
            ) : (
              <View style={styles.scriptsGrid}>
                {scripts.map((s, idx) => (
                  <View key={s.script_id} style={[styles.scriptCard, s.is_approved && styles.approvedScriptCard]}>
                    <View style={styles.scriptHeader}>
                      <ThemedText style={styles.scriptOption}>Option {idx + 1}</ThemedText>
                      {s.is_approved && (
                        <View style={styles.approvedBadge}>
                          <ThemedText type="defaultSemiBold" style={styles.approvedBadgeText}>APPROVED</ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText style={styles.scriptText}>{s.script_text}</ThemedText>
                    {!s.is_approved && (
                      <TouchableOpacity style={styles.scriptApproveButton}>
                        <ThemedText type="defaultSemiBold" style={styles.scriptApproveText}>{t('campaign.details.approveAction')}</ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS Light Gray Background
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
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
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 16,
  },
  scrollContent: {
    padding: isDesktop ? 64 : 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  threeColumnLayout: {
    flexDirection: 'row',
    gap: 32,
  },
  mobileLayout: {
    flexDirection: 'column',
    gap: 24,
  },
  leftColumn: {
    flex: 1.2,
    gap: 24,
  },
  rightColumn: {
    flex: 1,
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
    marginBottom: 24,
    color: '#1C1C1E',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  sectionDesc: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginTop: -16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  infoList: {
    gap: 20,
  },
  infoItemSmall: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  statCardCompact: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 24,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValueSmall: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  statCurrencySmall: {
    fontSize: 14,
    color: '#94a3b8',
  },
  statLimitSmall: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  materialsList: {
    gap: 12,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    gap: 12,
  },
  materialIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  materialName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  viewButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  viewButtonText: {
    fontSize: 11,
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
    borderRadius: 8,
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
    borderRadius: 8,
  },
  restrictedTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  bottomSection: {
    marginTop: 32,
    width: '100%',
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
  scriptsGrid: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: 24,
  },
  scriptCard: {
    flex: 1,
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


