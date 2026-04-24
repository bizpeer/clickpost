import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CampaignService } from '../../services/CampaignService';

interface CampaignDetailProps {
  campaignId: string;
  onBack: () => void;
}

export function CampaignDetail({ campaignId, onBack }: CampaignDetailProps) {
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const campaignData = await CampaignService.getCampaignById(campaignId);
        setCampaign(campaignData);
        
        const statsData = await CampaignService.getCampaignStats(campaignId);
        setStats(statsData);

        // 실제 미션 참여자 목록 가져오기
        const { data: participantsData, error } = await (CampaignService as any).supabase
          .from('mission_contents')
          .select(`
            content_id,
            status,
            created_at,
            users (
              email
            )
          `)
          .eq('campaign_id', campaignId);
        
        if (participantsData) {
          setMissions(participantsData);
        }
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

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back to Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{campaign.title}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{campaign.status}</Text>
            </View>
            <Text style={styles.platformText}>{campaign.target_platform}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Manage Campaign</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Spent / Total</Text>
          <Text style={styles.statValue}>
            {stats?.spent_budget?.toLocaleString()} / {campaign.total_budget?.toLocaleString()}
          </Text>
          <Text style={styles.statSubText}>{campaign.currency_code}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Verified Missions</Text>
          <Text style={styles.statValue}>{stats?.verified_count} / {stats?.mission_count}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Exhaustion Rate</Text>
          <Text style={[styles.statValue, { color: stats?.exhaustion_rate > 90 ? '#ef4444' : '#6366f1' }]}>
            {stats?.exhaustion_rate?.toFixed(1)}%
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Mission Participants</Text>
      <View style={styles.listContainer}>
        {missions.length === 0 ? (
          <Text style={styles.emptyText}>No participants yet.</Text>
        ) : (
          missions.map((m) => (
            <View key={m.content_id} style={styles.participantCard}>
              <View style={styles.participantInfo}>
                <View style={styles.avatarPlaceholder} />
                <View>
                  <Text style={styles.userName}>{m.users?.email?.split('@')[0]}</Text>
                  <Text style={styles.dateText}>{new Date(m.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
              <View style={styles.participantAction}>
                <View style={[styles.pStatusBadge, { backgroundColor: m.status === 'READY' ? '#d1fae5' : '#fef3c7' }]}>
                  <Text style={[styles.pStatusText, { color: m.status === 'READY' ? '#059669' : '#d97706' }]}>
                    {m.status}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  platformText: {
    color: '#64748b',
    fontWeight: '700',
  },
  editButton: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  editButtonText: {
    fontWeight: '700',
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 48,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
  },
  listContainer: {
    gap: 12,
  },
  participantCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  dateText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  participantAction: {
    alignItems: 'flex-end',
    gap: 4,
  },
  pStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6366f1',
  }
});
