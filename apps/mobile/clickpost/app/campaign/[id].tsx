import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { 
  FadeInDown, 
  FadeIn,
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate,
  useSharedValue,
  withDelay
} from 'react-native-reanimated';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { CampaignService } from '@/services/campaign/CampaignService';
import { Campaign } from '@/services/campaign/types';
import { VideoService } from '@/services/video/VideoService';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

export default function CampaignDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const synthesisProgress = useSharedValue(0);

  useEffect(() => {
    if (id) {
      CampaignService.getCampaignById(id).then(data => {
        setCampaign(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (generating) {
      synthesisProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        true
      );
    } else {
      synthesisProgress.value = 0;
    }
  }, [generating]);

  const handleGenerateVideo = async () => {
    if (!campaign) return;

    setGenerating(true);
    try {
      // Simulation of Google Veo API call
      setTimeout(() => {
        setVideoUrl('https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4');
        setGenerating(false);
        // Alert.alert(t('common.success'), t('campaign.jit_ready'));
      }, 4000);
    } catch (error) {
      console.error(error);
      Alert.alert(t('common.error'), t('campaign.generate_failed'));
      setGenerating(false);
    }
  };

  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(synthesisProgress.value, [0, 1], [0.3, 0.7]),
      transform: [{ scale: interpolate(synthesisProgress.value, [0, 1], [1, 1.05]) }]
    };
  });

  if (loading) {
    return (
      <ScreenWrapper style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ScreenWrapper>
    );
  }

  if (!campaign) {
    return (
      <ScreenWrapper style={styles.centered}>
        <Typography variant="h2">{t('campaign.not_found')}</Typography>
        <Button title={t('campaign.go_back')} onPress={() => router.back()} style={{ marginTop: 20 }} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper withPadding={false}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: campaign.imageUrl }} style={styles.headerImage} />
          <View style={styles.overlay} />
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          {campaign.isPremium && (
            <Animated.View entering={FadeIn.delay(300)} style={styles.premiumBadge}>
              <IconSymbol name="star.fill" size={10} color="#1A1A1A" />
              <Typography variant="caption" color="#1A1A1A" bold style={{ marginLeft: 4 }}>{t('marketplace.premium')}</Typography>
            </Animated.View>
          )}

          {generating && (
            <Animated.View style={[styles.synthesisOverlay, animatedOverlayStyle]}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Typography variant="h3" color={theme.primary} bold style={{ marginTop: 20 }}>
                SYNTHESIZING...
              </Typography>
              <Typography variant="caption" color="#FFFFFF" style={{ marginTop: 8 }}>
                Using Google Veo v2.1 (720p)
              </Typography>
            </Animated.View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.dragHandle} />
          
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.brandRow}>
            <View style={styles.brandInfo}>
              <View style={styles.brandLogoPlaceholder}>
                <Typography variant="caption" color="#1A1A1A" bold>{campaign.brandName[0]}</Typography>
              </View>
              <Typography variant="label" color={theme.primary} style={{ marginLeft: 8 }}>{campaign.brandName}</Typography>
            </View>
            <View style={styles.platformBadge}>
              <Typography variant="caption" color="#FFFFFF" bold>{campaign.platform}</Typography>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Typography variant="h1" bold style={styles.title}>{campaign.title}</Typography>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Card style={styles.rewardCard}>
              <View>
                <Typography variant="caption" color="rgba(255,255,255,0.5)">{t('campaign.potential_earnings')}</Typography>
                <Typography variant="h1" color={theme.primary} bold style={{ fontSize: 36 }}>
                  ₩{campaign.reward.toLocaleString()}
                </Typography>
              </View>
              <IconSymbol name="banknote.fill" size={40} color={theme.primary} style={{ opacity: 0.2 }} />
            </Card>
          </Animated.View>

          <Typography variant="h3" bold style={styles.sectionTitle}>{t('campaign.brief')}</Typography>
          <Typography variant="body" color={theme.icon} style={styles.description}>
            {campaign.description}
          </Typography>

          <Typography variant="h3" bold style={styles.sectionTitle}>{t('campaign.usp_title')}</Typography>
          <View style={styles.uspGrid}>
            {campaign.usp.map((point, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInDown.delay(400 + index * 100).springify()}
                style={styles.uspCard}
              >
                <View style={styles.uspIconBox}>
                  <IconSymbol name="sparkles" size={14} color="#1A1A1A" />
                </View>
                <Typography variant="caption" bold style={{ marginTop: 8 }} numberOfLines={2}>
                  {point}
                </Typography>
              </Animated.View>
            ))}
          </View>

          <Typography variant="h3" bold style={styles.sectionTitle}>{t('campaign.script_title')}</Typography>
          <Animated.View entering={FadeInDown.delay(600).springify()}>
            <Card style={styles.scriptCard}>
              <IconSymbol name="quote.bubble.fill" size={24} color={theme.primary} style={styles.quoteIcon} />
              <Typography variant="body" style={styles.scriptText}>
                "Hey everyone! Check out the new {campaign.brandName} collection. {campaign.usp[0]} is seriously next level. #ClickPost #{campaign.brandName} #AI"
              </Typography>
              <TouchableOpacity style={styles.copyButton}>
                <IconSymbol name="doc.on.doc.fill" size={14} color={theme.primary} />
              </TouchableOpacity>
            </Card>
          </Animated.View>

          <View style={styles.actionSection}>
            <View style={styles.engineHeader}>
              <Typography variant="h3" bold>{t('campaign.on_demand_title')}</Typography>
              <View style={styles.veoBadge}>
                <Typography variant="caption" color="#1A1A1A" bold>VE0-720P-JIT</Typography>
              </View>
            </View>
            
            {videoUrl ? (
              <Animated.View entering={FadeIn.springify()}>
                <Card style={styles.videoSuccess}>
                  <View style={styles.videoPreviewPlaceholder}>
                    <IconSymbol name="play.fill" size={30} color={theme.primary} />
                  </View>
                  <View style={styles.videoText}>
                    <Typography variant="body" bold>{t('campaign.video_generated')}</Typography>
                    <Typography variant="caption" color={theme.icon}>{t('campaign.video_spec', { platform: campaign.platform })}</Typography>
                  </View>
                  <Button 
                    title={t('campaign.upload')} 
                    onPress={() => Alert.alert(t('common.success'), t('campaign.submission_success'))} 
                    style={styles.submitButton}
                    variant="primary"
                  />
                </Card>
              </Animated.View>
            ) : (
              <Button 
                title={generating ? t('campaign.processing_assets') : t('campaign.generate_video')} 
                onPress={handleGenerateVideo} 
                loading={generating}
                style={styles.generateButton}
              />
            )}
            
            <View style={styles.disclaimerBox}>
              <IconSymbol name="info.circle" size={14} color={theme.icon} />
              <Typography variant="caption" style={styles.disclaimer}>
                {t('campaign.disclaimer')}
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Sticky Bottom Action if video is not generated yet */}
      {!videoUrl && !generating && (
        <Animated.View entering={FadeInDown.delay(800)} style={styles.stickyAction}>
          <View style={styles.stickyActionContent}>
            <View>
              <Typography variant="caption" color="rgba(255,255,255,0.5)" bold>EST. REWARD</Typography>
              <Typography variant="h3" color={theme.primary} bold>₩{campaign.reward.toLocaleString()}</Typography>
            </View>
            <Button 
              title={t('campaign.generate_video')} 
              onPress={handleGenerateVideo}
              style={styles.stickyButton}
            />
          </View>
        </Animated.View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    height: 400,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  synthesisOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,26,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26,26,26,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  premiumBadge: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#FAE100',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 11,
  },
  content: {
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -40,
    backgroundColor: '#1A1A1A',
    minHeight: height - 100,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAE100',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 24,
  },
  rewardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    padding: 24,
    backgroundColor: '#262626',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    color: '#FFFFFF',
  },
  description: {
    marginBottom: 32,
    lineHeight: 24,
    fontSize: 16,
    opacity: 0.8,
  },
  uspGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  uspCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  uspIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FAE100',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scriptCard: {
    padding: 24,
    backgroundColor: 'rgba(250,225,0,0.05)',
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(250,225,0,0.1)',
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: -12,
    left: 20,
  },
  scriptText: {
    fontStyle: 'italic',
    lineHeight: 24,
    color: '#FFFFFF',
    fontSize: 15,
  },
  copyButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(250,225,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 100,
  },
  engineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  veoBadge: {
    backgroundColor: '#FAE100',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  generateButton: {
    height: 64,
    borderRadius: 20,
  },
  videoSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#262626',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FAE100',
  },
  videoPreviewPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: 'rgba(250, 225, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoText: {
    marginLeft: 16,
    flex: 1,
  },
  submitButton: {
    width: 90,
    height: 44,
    borderRadius: 12,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  disclaimer: {
    marginLeft: 10,
    opacity: 0.5,
    flex: 1,
    fontSize: 12,
  },
  stickyAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26,26,26,0.9)',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stickyActionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stickyButton: {
    width: '60%',
    height: 56,
  }
});

