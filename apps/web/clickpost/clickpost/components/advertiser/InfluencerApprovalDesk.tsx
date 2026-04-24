import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CampaignService } from '../../services/CampaignService';
import { supabase } from '../../services/SupabaseClient';

export function InfluencerApprovalDesk() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [advertiserId, setAdvertiserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAdvertiserId(session.user.id);
        fetchProposals(session.user.id);
      } else {
        setLoading(false);
      }
    }
    init();
  }, []);

  const fetchProposals = async (id: string) => {
    setLoading(true);
    try {
      const data = await CampaignService.listProposals(id);
      // PENDING인 것만 필터링하거나 전체를 보여줄 수 있음. 여기서는 PENDING 우선.
      setProposals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (proposalId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      await CampaignService.updateProposalStatus(proposalId, action);
      if (advertiserId) {
        fetchProposals(advertiserId);
      }
      alert(`제안이 ${action === 'APPROVED' ? '승인' : '거절'}되었습니다.`);
    } catch (error) {
      console.error(error);
      alert('상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Influencer Approval Desk</Text>
      <Text style={styles.subtitle}>
        프로 인플루언서(10K+)들의 프리미엄 미션 역제안 내역을 검토하고 승인하세요.
      </Text>

      <ScrollView contentContainerStyle={styles.list}>
        {proposals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>대기 중인 제안이 없습니다.</Text>
          </View>
        ) : (
          proposals.map((p) => (
            <View key={p.proposal_id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.profileInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarInitial}>{p.users.email[0].toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.name}>{p.users.email.split('@')[0]}</Text>
                    <Text style={styles.niche}>
                      팔로워: {(p.users.follower_count / 1000).toFixed(1)}K • {p.users.country_code}
                    </Text>
                    <Text style={styles.campaignTitle}>캠페인: {p.campaigns.title}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadgeGlobal, { backgroundColor: p.status === 'APPROVED' ? '#4CAF50' : p.status === 'REJECTED' ? '#F44336' : '#6366f1' }]}>
                  <Text style={styles.proText}>{p.status}</Text>
                </View>
              </View>

              <View style={styles.proposalBox}>
                <View style={styles.rewardRow}>
                  <Text style={styles.proposalLabel}>Proposed Reward</Text>
                  <Text style={styles.rewardText}>
                    {p.campaigns.currency_code === 'USD' ? '$' : '₩'}{p.proposed_reward.toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.proposalLabel}>Message</Text>
                <Text style={styles.proposalText}>{p.message || '메시지가 없습니다.'}</Text>
              </View>

              {p.status === 'PENDING' && (
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={[styles.button, styles.rejectButton]} 
                    onPress={() => handleAction(p.proposal_id, 'REJECTED')}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.button, styles.approveButton]} 
                    onPress={() => handleAction(p.proposal_id, 'APPROVED')}
                  >
                    <Text style={styles.approveButtonText}>Approve Request</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    lineHeight: 24,
  },
  list: {
    gap: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  niche: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  campaignTitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  statusBadgeGlobal: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  proposalBox: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rewardText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6366f1',
  },
  proposalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  proposalText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  approveButton: {
    backgroundColor: '#0f172a',
  },
  rejectButtonText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 15,
  },
  approveButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
