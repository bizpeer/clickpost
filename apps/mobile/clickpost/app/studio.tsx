import React, { useState } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from 'react-i18next';
import { storageService } from '@/services/StorageService';
import { PersonaEngine } from '@/services/avatar/PersonaEngine';
import * as ImagePicker from 'expo-image-picker';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeInRight, 
  FadeOut, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  useSharedValue, 
  withRepeat, 
  interpolate,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

export default function StudioScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const persona = storageService.getPersonaData();
  const user = storageService.getUserInfo();
  
  const [loading, setLoading] = useState(false);
  const [activeAsset, setActiveAsset] = useState<'front' | 'side' | 'half' | 'full'>('front');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Animations
  const floatValue = useSharedValue(0);
  const pulseValue = useSharedValue(1);

  React.useEffect(() => {
    floatValue.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
    pulseValue.value = withRepeat(withTiming(1.2, { duration: 1500 }), -1, true);
  }, []);

  const animatedFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue.value * -6 }],
  }));

  const animatedPulseIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: interpolate(pulseValue.value, [1, 1.2], [1, 0.5]),
  }));

  if (!persona) {
    return (
      <ScreenWrapper>
        <View style={styles.emptyState}>
          <Typography variant="h2" bold>{t('studio.no_persona')}</Typography>
          <Button title={t('studio.go_to_signup')} onPress={() => router.replace('/signup')} style={{ marginTop: 20 }} />
        </View>
      </ScreenWrapper>
    );
  }

  const handleUpdateAvatar = async () => {
    if (persona.hasChangedAvatar) {
      Alert.alert(t('studio.limit_reached_title'), t('studio.limit_reached_msg'));
      return;
    }
    setShowConfirmModal(true);
  };

  const proceedWithRefinement = async () => {
    setShowConfirmModal(false);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('studio.permission_denied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLoading(true);
      try {
        const updated = await PersonaEngine.updatePersonaWithPhoto(persona, result.assets[0].uri);
        storageService.setPersonaData(updated);
        Alert.alert(t('common.success'), t('studio.refined_success'));
      } catch (error: any) {
        Alert.alert(t('common.error'), error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getActiveImageUrl = () => {
    switch (activeAsset) {
      case 'side': return persona.asset_side_url;
      case 'half': return persona.asset_half_url;
      case 'full': return persona.asset_full_url;
      default: return persona.asset_front_url;
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Typography variant="h3" bold>{t('studio.title')}</Typography>
        <TouchableOpacity style={styles.headerAction}>
          <IconSymbol name="share.fade.fill" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.stage}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: getActiveImageUrl() }} 
              style={styles.mainImage} 
              resizeMode="cover"
            />
            <View style={styles.viewBadge}>
              <Typography variant="caption" bold style={{ color: '#1A1A1A' }}>
                {activeAsset.toUpperCase()} VIEW
              </Typography>
            </View>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Typography variant="caption" style={{ marginTop: 12, color: theme.primary }}>{t('studio.syncing')}</Typography>
              </View>
            )}
          </View>

          <View style={styles.assetPickerContainer}>
            <Typography variant="caption" bold color="rgba(255,255,255,0.3)" style={{ marginBottom: 12 }}>
              PERSPECTIVE SELECTOR
            </Typography>
            <View style={styles.assetPicker}>
              {(['front', 'side', 'half', 'full'] as const).map((type, index) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.assetThumb, activeAsset === type && styles.activeThumb]}
                  onPress={() => setActiveAsset(type)}
                >
                  <IconSymbol 
                    name={type === 'full' ? 'person.fill' : 'face.smiling.fill'} 
                    size={20} 
                    color={activeAsset === type ? '#1A1A1A' : 'rgba(255,255,255,0.5)'} 
                  />
                  <Typography variant="tiny" bold color={activeAsset === type ? '#1A1A1A' : 'rgba(255,255,255,0.3)'} style={{ marginTop: 4 }}>
                    {type}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Bento Grid Layout */}
        <View style={styles.bentoGrid}>
          {/* Main ID Card */}
          <Animated.View entering={FadeInDown.delay(300)} style={[styles.bentoBox, styles.bentoFull]}>
            <View style={styles.infoRow}>
              <View>
                <Typography variant="caption" bold color={theme.primary}>{t('studio.label_seed_id')}</Typography>
                <Typography variant="h3" bold style={styles.monoText}>{persona.seedId}</Typography>
              </View>
              <TouchableOpacity style={styles.copyButton}>
                <IconSymbol name="doc.on.doc.fill" size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Biometric Stats (Split Row) */}
          <View style={styles.bentoRow}>
            <Animated.View entering={FadeInDown.delay(400)} style={[styles.bentoBox, styles.bentoHalf, animatedFloatStyle]}>
              <View style={styles.biometricHeader}>
                <IconSymbol name="face.dashed.fill" size={16} color={theme.primary} />
                <Typography variant="tiny" color="rgba(255,255,255,0.4)" bold>{t('studio.label_symmetry')}</Typography>
              </View>
              <Typography variant="h2" bold style={{ marginTop: 12 }}>98.2%</Typography>
              <View style={styles.miniProgress}><View style={[styles.miniProgressBar, { width: '98%' }]} /></View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500)} style={[styles.bentoBox, styles.bentoHalf, animatedFloatStyle]}>
              <View style={styles.biometricHeader}>
                <IconSymbol name="shield.lefthalf.filled" size={16} color="#00E676" />
                <Typography variant="tiny" color="rgba(255,255,255,0.4)" bold>{t('studio.label_seed_integrity')}</Typography>
              </View>
              <Typography variant="h2" bold style={{ marginTop: 12 }}>99.9</Typography>
              <View style={styles.statusRow}>
                <Animated.View style={[styles.pulseDot, animatedPulseIndicatorStyle]} />
                <Typography variant="tiny" color="#00E676" bold>{t('studio.status_stable').toUpperCase()}</Typography>
              </View>
            </Animated.View>
          </View>

          {/* Vibe Score - Highlight Card */}
          <Animated.View entering={FadeInDown.delay(600)} style={[styles.bentoBox, styles.bentoFull, styles.vibeCard]}>
            <View style={styles.rowBetween}>
              <View style={styles.biometricHeader}>
                <IconSymbol name="sparkles" size={20} color="#FAE100" />
                <Typography variant="body" bold style={{ marginLeft: 8 }}>{t('studio.label_vibe_score')}</Typography>
              </View>
              <View style={styles.eliteBadge}>
                <Typography variant="tiny" bold color="#1A1A1A">{t('studio.vibe_elite')}</Typography>
              </View>
            </View>
            <View style={styles.vibeBarContainer}>
               {[1,2,3,4,5,6,7,8,9,10].map(i => (
                 <View key={i} style={[styles.vibeNode, i < 9 && styles.vibeNodeActive]} />
               ))}
            </View>
          </Animated.View>

          {/* Prompt Section */}
          <Animated.View entering={FadeInDown.delay(700)} style={[styles.bentoBox, styles.bentoFull]}>
            <View style={styles.promptHeader}>
              <Typography variant="caption" bold color={theme.primary}>{t('studio.label_prompt')}</Typography>
              <View style={styles.tag}>
                <Typography variant="tiny" bold color="#FFFFFF">VEO ULTRA</Typography>
              </View>
            </View>
            <View style={styles.promptBox}>
              <Typography variant="body" style={styles.promptText}>
                {persona.personaPrompt}
              </Typography>
            </View>
          </Animated.View>

          {/* Regional & Aesthetic Info */}
          <View style={styles.bentoRow}>
             <Animated.View entering={FadeInDown.delay(800)} style={[styles.bentoBox, styles.bentoHalf]}>
                <Typography variant="tiny" color="rgba(255,255,255,0.4)" bold>{t('studio.label_region')}</Typography>
                <Typography variant="body" bold style={{ marginTop: 4 }}>{persona.countryStyle.split(',')[0]}</Typography>
             </Animated.View>
             <Animated.View entering={FadeInDown.delay(900)} style={[styles.bentoBox, styles.bentoHalf]}>
                <Typography variant="tiny" color="rgba(255,255,255,0.4)" bold>{t('studio.label_aesthetic')}</Typography>
                <Typography variant="body" bold style={{ marginTop: 4, textTransform: 'capitalize' }}>{persona.vibe}</Typography>
             </Animated.View>
          </View>
        </View>


        {!persona.hasChangedAvatar ? (
          <Button
            title={t('studio.button_refine')}
            onPress={handleUpdateAvatar}
            style={styles.actionButton}
            icon={<IconSymbol name="camera.fill" size={20} color="#1A1A1A" />}
          />
        ) : (
          <View style={styles.limitReached}>
            <IconSymbol name="checkmark.circle.fill" size={22} color="#00C853" />
            <Typography variant="body" bold style={{ marginLeft: 10 }} color="#00C853">
              {t('studio.refined_success')}
            </Typography>
          </View>
        )}
      </ScrollView>

      {/* Premium Confirm Modal */}
      {showConfirmModal && (
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <Animated.View entering={FadeInUp.springify()} exiting={FadeOut} style={styles.modalContainer}>
            <View style={styles.modalGlow} />
            <View style={styles.modalIconBox}>
              <IconSymbol name="camera.shutter.button.fill" size={40} color="#FAE100" />
            </View>
            <Typography variant="h2" bold style={styles.modalTitle}>{t('studio.refine_confirm_title')}</Typography>
            <Typography variant="body" style={styles.modalMsg}>{t('studio.refine_confirm_msg')}</Typography>
            
            <Animated.View 
              entering={FadeIn.delay(400)}
              style={[styles.oneTimeBadge, { transform: [{ scale: pulseValue.value }] }]}
            >
              <Typography variant="tiny" bold color="#1A1A1A">{t('studio.label_one_time').toUpperCase()}</Typography>
            </Animated.View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowConfirmModal(false)}>
                <Typography variant="body" bold color="rgba(255,255,255,0.5)">{t('common.cancel')}</Typography>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalProceed} onPress={proceedWithRefinement}>
                <Typography variant="body" bold color="#1A1A1A">{t('common.upload_photo')}</Typography>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  stage: {
    alignItems: 'center',
    marginTop: 10,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3/4,
    backgroundColor: '#1C1C1E',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  viewBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FAE100',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  assetPickerContainer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
  },
  assetPicker: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  assetThumb: {
    flex: 1,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeThumb: {
    backgroundColor: '#FAE100',
    borderColor: '#FAE100',
  },
  bentoGrid: {
    marginTop: 24,
    gap: 12,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoBox: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  bentoFull: {
    width: '100%',
  },
  bentoHalf: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vibeCard: {
    backgroundColor: '#2C2C2E',
  },
  eliteBadge: {
    backgroundColor: '#FAE100',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vibeBarContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 4,
    height: 6,
  },
  vibeNode: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
  },
  vibeNodeActive: {
    backgroundColor: '#FAE100',
  },
  monoText: {
    fontFamily: 'System', 
    letterSpacing: 1,
    marginTop: 4,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promptBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  promptText: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'System',
  },
  biometricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniProgress: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  miniProgressBar: {
    height: '100%',
    backgroundColor: '#FAE100',
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(250,225,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    marginTop: 24,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAE100',
  },
  limitReached: {
    marginTop: 24,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,200,83,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,200,83,0.1)',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  modalGlow: {
    position: 'absolute',
    top: -100,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(250,225,0,0.1)',
    borderRadius: 100,
    transform: [{ scale: 2 }],
  },
  modalIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(250,225,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 2,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 12,
    zIndex: 2,
  },
  modalMsg: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
    marginBottom: 24,
    zIndex: 2,
  },
  oneTimeBadge: {
    backgroundColor: '#FAE100',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 32,
    zIndex: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    zIndex: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 6,
  },
  modalCancel: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalProceed: {
    flex: 1.5,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FAE100',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
