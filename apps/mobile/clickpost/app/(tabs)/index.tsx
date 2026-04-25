import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  Image, 
  View, 
  TouchableOpacity, 
  RefreshControl,
  ScrollView,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Typography } from '@/components/common/Typography';
import { Card } from '@/components/common/Card';
import { CampaignService } from '@/services/campaign/CampaignService';
import { Campaign } from '@/services/campaign/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';
import { storageService } from '@/services/StorageService';
import { supabase } from '@/services/SupabaseClient';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', icon: 'square.grid.2x2.fill' },
  { id: 'premium', icon: 'star.fill' },
  { id: 'video', icon: 'play.fill' },
  { id: 'social', icon: 'person.2.fill' },
];

export default function MarketplaceScreen() {
  const { t } = useTranslation();
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadData = async () => {
    try {
      const [campaignData, missionData] = await Promise.all([
        CampaignService.getCampaigns(),
        user?.id ? CampaignService.getMyMissions(user.id) : Promise.resolve([])
      ]);
      setCampaigns(campaignData);
      setActiveMissions(missionData.filter(m => m.status === 'GENERATING' || m.status === 'READY'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const user = storageService.getUserInfo();
  const persona = storageService.getPersonaData();

  useEffect(() => {
    loadData();
    
    // Subscribe to active missions for real-time status updates
    if (user?.id) {
      const subscription = supabase
        .channel('active-missions')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mission_contents',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            loadData(); // Re-fetch all data when any of the user's missions change
          }
        )
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderActiveMissions = () => {
    if (activeMissions.length === 0) return null;

    return (
      <View style={styles.activeMissionsContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" bold>{t('marketplace.active_missions')}</Typography>
          <TouchableOpacity onPress={() => router.push('/missions')}>
            <Typography variant="caption" color={theme.primary}>{t('common.see_all')}</Typography>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeMissionsContent}
        >
          {activeMissions.map((mission, index) => (
            <Animated.View 
              key={mission.content_id} 
              entering={FadeInRight.delay(200 + index * 100).springify()}
            >
              <TouchableOpacity 
                style={styles.activeMissionCard}
                onPress={() => router.push({ pathname: "/campaign/[id]", params: { id: mission.campaign_id } })}
              >
                <View style={styles.missionIconBox}>
                  {mission.status === 'GENERATING' ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <IconSymbol name="play.circle.fill" size={24} color={theme.primary} />
                  )}
                </View>
                <View style={styles.missionInfo}>
                  <Typography variant="label" bold numberOfLines={1} style={{ maxWidth: 120 }}>
                    {mission.campaigns?.title}
                  </Typography>
                  <Typography variant="caption" color={mission.status === 'READY' ? theme.primary : theme.icon}>
                    {mission.status === 'GENERATING' ? 'AI Synthesizing...' : 'Video Ready!'}
                  </Typography>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderBentoHeader = () => (
    <View style={styles.bentoContainer}>
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.bentoMain}>
        <TouchableOpacity 
          style={styles.mainCard} 
          activeOpacity={0.9}
          onPress={() => router.push('/studio')}
        >
          <Image 
            source={{ uri: persona?.asset_full_url || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800' }} 
            style={styles.bentoBgImage}
            blurRadius={20}
          />
          <View style={styles.glassOverlayMain} />
          <View style={styles.mainCardContent}>
            <View>
              <Typography variant="caption" color="rgba(255,255,255,0.6)" bold>
                {t('studio.title')}
              </Typography>
              <Typography variant="h2" color="#FFFFFF" bold style={{ marginTop: 4 }}>
                {t('marketplace.hello', { name: user?.name || t('marketplace.partner') })}
              </Typography>
              <View style={styles.statusBadge}>
                <View style={styles.pulseDot} />
                <Typography variant="caption" color="#00C853" bold style={{ marginLeft: 6 }}>
                  {t('studio.vibe_elite')}
                </Typography>
              </View>
            </View>
            <Image 
              source={{ uri: persona?.asset_front_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }} 
              style={styles.bentoAvatar}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.bentoRow}>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.bentoSmall}>
          <Card style={styles.statsCard}>
            <View style={styles.glassOverlaySmall} />
            <IconSymbol name="banknote.fill" size={20} color={theme.primary} />
            <Typography variant="h3" bold style={{ marginTop: 8 }}>
              ₩12,400
            </Typography>
            <Typography variant="caption" color={theme.icon}>
              {t('marketplace.potential_reward')}
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.bentoSmall}>
          <Card style={[styles.statsCard, { backgroundColor: theme.primary }]}>
            <IconSymbol name="checkmark.seal.fill" size={20} color="#1A1A1A" />
            <Typography variant="h3" color="#1A1A1A" bold style={{ marginTop: 8 }}>
              {activeMissions.length + 5}
            </Typography>
            <Typography variant="caption" color="rgba(26,26,26,0.6)" bold>
              {t('campaign.video_generated')}
            </Typography>
          </Card>
        </Animated.View>
      </View>
    </View>
  );

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContent}
    >
      {CATEGORIES.map((cat, index) => (
        <Animated.View key={cat.id} entering={FadeInRight.delay(400 + index * 100).springify()}>
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategory === cat.id && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <IconSymbol 
              name={cat.icon as any} 
              size={14} 
              color={selectedCategory === cat.id ? '#1A1A1A' : theme.icon} 
            />
            <Typography 
              variant="caption" 
              bold 
              style={{ marginLeft: 6 }}
              color={selectedCategory === cat.id ? '#1A1A1A' : theme.icon}
            >
              {cat.id.toUpperCase()}
            </Typography>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );

  const renderCampaign = ({ item, index }: { item: Campaign; index: number }) => (
    <Animated.View entering={FadeInDown.delay(600 + index * 100).springify()}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: "/campaign/[id]", params: { id: item.id } })}
      >
        <Card style={styles.card}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <View style={styles.glassOverlay} />
            {item.isPremium && (
              <View style={styles.premiumBadge}>
                <IconSymbol name="star.fill" size={10} color="#1A1A1A" />
                <Typography variant="caption" color="#1A1A1A" bold style={{ marginLeft: 4, fontSize: 10 }}>
                  {t('marketplace.premium')}
                </Typography>
              </View>
            )}
            <View style={styles.platformBadge}>
              <IconSymbol 
                name={item.platform === 'TIKTOK' ? 'play.fill' : 'camera.fill'} 
                size={12} 
                color="#FFFFFF" 
              />
              <Typography variant="caption" color="#FFFFFF" bold style={{ marginLeft: 4 }}>
                {item.platform}
              </Typography>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Typography variant="caption" color={theme.icon} style={{ marginBottom: 4 }}>
                {item.brandName}
              </Typography>
              <View style={styles.rewardPill}>
                <Typography variant="caption" color={theme.primary} bold>
                  ₩{item.reward.toLocaleString()}
                </Typography>
              </View>
            </View>
            <Typography variant="h3" numberOfLines={1} style={styles.title}>
              {item.title}
            </Typography>
            
            <View style={styles.footerRow}>
              <View style={styles.infoPill}>
                <IconSymbol name="flame.fill" size={10} color="#FF5252" />
                <Typography variant="caption" color="#FF5252" style={{ marginLeft: 4, fontSize: 10 }}>
                  {Math.floor(Math.random() * 50) + 10}명 참여중
                </Typography>
              </View>
              <IconSymbol name="arrow.right" size={16} color={theme.icon} />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ScreenWrapper>
      <FlatList
        data={campaigns}
        renderItem={renderCampaign}
        ListHeaderComponent={
          <>
            {renderBentoHeader()}
            {renderActiveMissions()}
            {renderCategoryFilter()}
            <Typography variant="h2" bold style={styles.listTitle}>
              {t('marketplace.subtitle')}
            </Typography>
          </>
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  bentoContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  bentoMain: {
    width: '100%',
    marginBottom: 12,
  },
  mainCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bentoAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FAE100',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(0,200,83,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C853',
  },
  bentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bentoSmall: {
    width: '48.5%',
  },
  statsCard: {
    padding: 16,
    borderRadius: 20,
    height: 110,
    justifyContent: 'center',
    backgroundColor: '#2B2B2B',
    borderWidth: 0,
  },
  categoryScroll: {
    marginBottom: 24,
  },
  categoryContent: {
    paddingRight: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B2B2B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  listTitle: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    marginBottom: 20,
    padding: 0,
    borderWidth: 0,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#2B2B2B',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  platformBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(26,26,26,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FAE100',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rewardPill: {
    backgroundColor: 'rgba(250,225,0,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  title: {
    marginVertical: 12,
    fontSize: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,82,82,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});

