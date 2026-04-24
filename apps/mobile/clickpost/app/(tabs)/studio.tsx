import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Typography } from '@/components/common/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PersonaData } from '@/services/avatar/types';
import { storageService } from '@/services/StorageService';
import { PersonaEngine } from '@/services/avatar/PersonaEngine';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const PAYMENT_COLORS: Record<string, string> = {
  'Naver Pay': '#03C75A',
  'Kakao Pay': '#FAE100',
  'Toss Pay': '#0064FF',
  'PayPay': '#FF0033',
  'Line Pay': '#00C300',
  'Rakuten Pay': '#BF0000',
  'Au PAY': '#F39800',
  'Alipay': '#00A1E9',
  'WeChat Pay': '#09BB07',
  'Grab': '#00B14F',
};

export default function StudioScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const data = storageService.getPersonaData();
    const user = storageService.getUserInfo();
    setPersona(data);
    setUserInfo(user);
  }, []);

  const pickImage = async () => {
    if (!persona) return;
    if (persona.hasChangedAvatar) {
      Alert.alert(t('studio.limit_reached_title'), t('studio.limit_reached_msg'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setLoading(true);
      try {
        const updatedPersona = await PersonaEngine.updatePersonaWithPhoto(persona, result.assets[0].uri);
        setPersona(updatedPersona);
        await storageService.setPersonaData(updatedPersona);
        Alert.alert(t('common.success'), t('studio.refined_success'));
      } catch (error) {
        Alert.alert(t('common.error'), 'Failed to update avatar.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRegenerate = async () => {
    if (!persona) return;
    setRegenerating(true);
    try {
      const updatedPersona = await PersonaEngine.regeneratePersona(persona);
      setPersona(updatedPersona);
      await storageService.setPersonaData(updatedPersona);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to regenerate assets.');
    } finally {
      setRegenerating(false);
    }
  };

  if (!persona || !userInfo) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Typography variant="h1" bold>{t('studio.title')}</Typography>
            <Typography variant="body" color="rgba(255,255,255,0.6)">{t('studio.subtitle')}</Typography>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <IconSymbol name="gearshape.fill" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.bentoGrid}>
          {/* Primary Avatar View */}
          <View style={[styles.bentoCard, styles.bentoCardXLarge]}>
            <Image 
              source={{ uri: persona.asset_front_url }} 
              style={styles.personaLargeImage} 
              contentFit="cover" 
              transition={1000}
            />
            {regenerating && (
              <View style={styles.regeneratingOverlay}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Typography variant="body" bold style={{ marginTop: 12 }}>{t('studio.regenerating')}</Typography>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.refineButton, persona.hasChangedAvatar && styles.disabledRefine]} 
              onPress={pickImage}
              disabled={loading || regenerating}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <IconSymbol name={persona.hasChangedAvatar ? "checkmark.seal.fill" : "camera.fill"} size={18} color="#FFFFFF" />
                  <View>
                    <Typography variant="caption" bold style={{ marginLeft: 6 }}>
                      {persona.hasChangedAvatar ? t('studio.refined_label') : t('studio.button_refine')}
                    </Typography>
                    {!persona.hasChangedAvatar && (
                      <Typography variant="tiny" style={{ marginLeft: 6, opacity: 0.8 }}>{t('studio.label_one_time')}</Typography>
                    )}
                  </View>
                </>
              )}
            </TouchableOpacity>
            <View style={styles.glassLabel}>
              <Typography variant="caption" bold color="rgba(255,255,255,0.6)">{t('signup.label_persona_name')}</Typography>
              <Typography variant="h2" bold>{userInfo.name}</Typography>
            </View>
          </View>

          {/* Seed & Metrics Row */}
          <View style={styles.bentoRow}>
            <View style={[styles.bentoCard, styles.bentoCardSmall]}>
              <Typography variant="caption" color="rgba(255,255,255,0.4)">{t('studio.label_seed_id')}</Typography>
              <Typography variant="h3" bold style={{ color: theme.primary }}>#{persona.seedId}</Typography>
            </View>
            <View style={[styles.bentoCard, styles.bentoCardSmall]}>
              <Typography variant="caption" color="rgba(255,255,255,0.4)">{t('signup.label_height')}</Typography>
              <Typography variant="h3" bold>{userInfo.height}cm</Typography>
            </View>
            <View style={[styles.bentoCard, styles.bentoCardSmall]}>
              <Typography variant="caption" color="rgba(255,255,255,0.4)">{t('signup.label_weight')}</Typography>
              <Typography variant="h3" bold>{userInfo.weight}kg</Typography>
            </View>
          </View>

          {/* Stats & Vibe Row */}
          <View style={styles.bentoRow}>
            <View style={[styles.bentoCard, styles.bentoCardMedium]}>
              <Typography variant="caption" color="rgba(255,255,255,0.4)">{t('studio.label_consistency')}</Typography>
              <View style={styles.row}>
                <IconSymbol name="waveform" size={18} color={theme.primary} />
                <Typography variant="body" bold style={{ marginLeft: 8 }}>{t('studio.consistency_high')}</Typography>
              </View>
            </View>
            <View style={[styles.bentoCard, styles.bentoCardMedium]}>
              <Typography variant="caption" color="rgba(255,255,255,0.4)">{t('signup.label_aesthetic_vibe')}</Typography>
              <Typography variant="body" bold>{t(persona.aesthetic)}</Typography>
            </View>
          </View>

          {/* Multi-Angle Preview (5-Angles) */}
          <View style={[styles.bentoCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Typography variant="caption" color="rgba(255,255,255,0.4)">MULTI-ANGLE SYNC (VEO v2.0)</Typography>
              <TouchableOpacity onPress={handleRegenerate} disabled={regenerating}>
                <Typography variant="caption" bold color={theme.primary}>{t('studio.button_regenerate')}</Typography>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.anglesScroll}>
              {[
                { url: persona.asset_front_url, label: t('studio.angle_front') },
                { url: persona.asset_side_url, label: t('studio.angle_side') },
                { url: persona.asset_half_url, label: t('studio.angle_half') },
                { url: persona.asset_full_url, label: t('studio.angle_full') },
                { url: persona.asset_back_url, label: t('studio.angle_back') },
              ].map((item, idx) => (
                <View key={idx} style={styles.angleContainer}>
                  <Image source={{ uri: item.url }} style={styles.angleImage} transition={500} />
                  <Typography variant="tiny" center color="rgba(255,255,255,0.4)" style={{ marginTop: 6 }}>{item.label}</Typography>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Prompt Insights */}
          <View style={[styles.bentoCard, styles.promptCard]}>
             <Typography variant="caption" color="rgba(255,255,255,0.4)" style={{ marginBottom: 12 }}>GENERATED IDENTITY PROMPT (GEMINI)</Typography>
             <Typography variant="body" style={styles.promptText}>
               "{persona.personaPrompt}"
             </Typography>
             <View style={styles.promptBadge}>
               <Typography variant="tiny" bold color={theme.primary}>SYNCED WITH NANO-BANANA</Typography>
             </View>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Typography variant="tiny" color="rgba(255,255,255,0.3)" center style={{ lineHeight: 16 }}>
            {t('studio.disclaimer')}
          </Typography>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoGrid: {
    gap: 12,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  bentoCardXLarge: {
    height: 400,
    padding: 0,
  },
  bentoCardMedium: {
    flex: 1.5,
    height: 120,
    justifyContent: 'center',
  },
  bentoCardSmall: {
    flex: 1,
    height: 100,
    justifyContent: 'center',
  },
  personaLargeImage: {
    width: '100%',
    height: '100%',
  },
  refineButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(250,225,0,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  disabledRefine: {
    backgroundColor: 'rgba(0,200,83,0.9)',
  },
  glassLabel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  anglesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  angleContainer: {
    flex: 1,
  },
  angleImage: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  promptCard: {
    backgroundColor: 'rgba(250,225,0,0.02)',
    borderColor: 'rgba(250,225,0,0.1)',
  },
  promptText: {
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.7)',
  },
  promptBadge: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(250,225,0,0.1)',
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 40,
  },
});
