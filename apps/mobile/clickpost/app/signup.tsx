import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Gender, PersonaData } from '@/services/avatar/types';
import { storageService } from '@/services/StorageService';
import { PersonaEngine } from '@/services/avatar/PersonaEngine';
import { useTranslation } from 'react-i18next';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft, 
  FadeInRight, 
  FadeInDown, 
  Layout, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  interpolate,
  withSequence,
  withDelay,
  withSpring
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';

const { width, height: screenHeight } = Dimensions.get('window');

const COUNTRIES = [
  { code: 'KR', name: 'South Korea', payments: ['Naver Pay', 'Kakao Pay', 'Toss Pay'] },
  { code: 'JP', name: 'Japan', payments: ['PayPay', 'Line Pay', 'Rakuten Pay', 'Au PAY'] },
  { code: 'CN', name: 'China', payments: ['Alipay', 'WeChat Pay'] },
  { code: 'TW', name: 'Taiwan', payments: ['JKOPAY', 'Line Pay', 'PXPay'] },
  { code: 'VN', name: 'Vietnam', payments: ['MoMo', 'ZaloPay', 'ShopeePay', 'Grab'] },
  { code: 'TH', name: 'Thailand', payments: ['PromptPay', 'TrueMoney', 'ShopeePay'] },
  { code: 'PH', name: 'Philippines', payments: ['GCash', 'Maya', 'Grab'] },
  { code: 'ID', name: 'Indonesia', payments: ['GoPay', 'OVO', 'DANA', 'ShopeePay'] },
];

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
  'JKOPAY': '#D8232A',
  'PXPay': '#005598',
  'MoMo': '#A50064',
  'ZaloPay': '#0085FF',
  'ShopeePay': '#EE4D2D',
  'Grab': '#00B14F',
  'PromptPay': '#17365D',
  'TrueMoney': '#FF8100',
  'GCash': '#007DFE',
  'Maya': '#000000',
  'GoPay': '#00AED6',
  'OVO': '#4C2A86',
  'DANA': '#118EEA',
};

export default function SignupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: 'MALE' as Gender,
    country: COUNTRIES[0],
    height: '175',
    weight: '70',
    payment: '',
    paymentAccount: '',
  });

  const progress = useSharedValue(step / 5);

  useEffect(() => {
    progress.value = withTiming(step / 5, { duration: 500 });
  }, [step]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const pulse = useSharedValue(1);
  const scanner = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );
    scanner.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.15], [0.8, 1]),
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 60,
  }));

  const animatedScannerStyle = useAnimatedStyle(() => ({
    top: `${scanner.value * 100}%`,
    opacity: interpolate(scanner.value, [0, 0.05, 0.95, 1], [0, 1, 1, 0]),
  }));

  const animatedScannerTrailStyle = useAnimatedStyle(() => ({
    top: `${(scanner.value * 100) - 20}%`,
    height: 80,
    opacity: interpolate(scanner.value, [0, 0.1, 0.9, 1], [0, 0.4, 0.4, 0]),
  }));

  const animatedScannerGlowStyle = useAnimatedStyle(() => ({
    top: `${(scanner.value * 100) - 5}%`,
    opacity: interpolate(scanner.value, [0, 0.1, 0.9, 1], [0, 0.6, 0.6, 0]),
    transform: [{ scaleX: 1.2 }],
  }));

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
    else handleComplete();
  };

  const prevStep = () => {
    if (step > 1) {
      if (step === 5) setPersona(null);
      setStep(step - 1);
    }
  };

  const generatePersona = async () => {
    setLoading(true);
    setGenerationStep('prompt'); // New state for granular feedback
    try {
      const birthDateObj = new Date(formData.birthDate || '2000-01-01');
      const userInfo = {
        name: formData.name,
        birthDate: birthDateObj,
        gender: formData.gender,
        countryCode: formData.country.code,
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        preferredPayment: formData.payment,
        paymentAccountInfo: formData.paymentAccount,
      };

      await storageService.setUserInfo(userInfo);
      
      // The async engine now handles the simulation delays internally
      const generatedPersona = await PersonaEngine.generatePersona(userInfo);
      
      setGenerationStep('assets');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Final sync delay
      
      setPersona(generatedPersona);
      await storageService.setPersonaData(generatedPersona);
    } catch (error) {
      console.error('Persona generation error:', error);
      Alert.alert(t('common.error'), 'Failed to generate persona.');
    } finally {
      setLoading(false);
      setGenerationStep('idle');
    }
  };

  const [generationStep, setGenerationStep] = useState<'idle' | 'prompt' | 'assets'>('idle');

  useEffect(() => {
    if (step === 5 && !persona && !loading) {
      generatePersona();
    }
  }, [step]);

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

  const [isFinishing, setIsFinishing] = useState(false);

  const handleComplete = async () => {
    if (!persona) return;
    setIsFinishing(true);
    try {
      // Finalize and save onboarded state
      await storageService.setOnboarded(true);
      
      // Simulate final account creation and session establishment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsFinishing(false);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Finalization error:', error);
      setIsFinishing(false);
      Alert.alert(t('common.error'), 'Failed to finalize your account.');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Typography variant="h1" bold style={styles.stepTitle}>{t('signup.step1_title')}</Typography>
      <Typography variant="body" color="rgba(255,255,255,0.6)" style={styles.stepSubtitle}>{t('signup.step1_subtitle')}</Typography>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('signup.name_placeholder')}
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          autoFocus
        />
        {formData.name.length > 0 && (
          <View style={styles.inputIcon}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={theme.primary} />
          </View>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Typography variant="h1" bold style={styles.stepTitle}>{t('signup.step2_title')}</Typography>
      <Typography variant="body" color="rgba(255,255,255,0.6)" style={styles.stepSubtitle}>{t('signup.step2_subtitle')}</Typography>
      
      <View style={styles.inputGroup}>
        <Typography variant="caption" style={styles.label}>{t('signup.label_birth')}</Typography>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={formData.birthDate}
          onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Typography variant="caption" style={styles.label}>{t('signup.label_gender')}</Typography>
        <View style={styles.row}>
          {['MALE', 'FEMALE'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.chip, formData.gender === g && styles.activeChip]}
              onPress={() => setFormData({ ...formData, gender: g as Gender })}
            >
              <Typography variant="body" bold color={formData.gender === g ? '#1A1A1A' : '#FFFFFF'}>
                {g === 'MALE' ? t('common.male') : t('common.female')}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Typography variant="caption" style={styles.label}>{t('signup.label_country')}</Typography>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryList}>
          {COUNTRIES.map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[styles.countryChip, formData.country.code === c.code && styles.activeChip]}
              onPress={() => setFormData({ ...formData, country: c, payment: '' })}
            >
              <Typography variant="body" bold color={formData.country.code === c.code ? '#1A1A1A' : '#FFFFFF'}>{c.name}</Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Typography variant="h1" bold style={styles.stepTitle}>{t('signup.step3_title')}</Typography>
      <Typography variant="body" color="rgba(255,255,255,0.6)" style={styles.stepSubtitle}>{t('signup.step3_subtitle')}</Typography>

      <View style={styles.inputGroup}>
        <Typography variant="caption" style={styles.label}>{t('signup.label_height')}</Typography>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData.height}
            onChangeText={(text) => setFormData({ ...formData, height: text })}
            maxLength={3}
          />
          <Typography variant="body" style={styles.unitText}>{t('common.height_unit')}</Typography>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Typography variant="caption" style={styles.label}>{t('signup.label_weight')}</Typography>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData.weight}
            onChangeText={(text) => setFormData({ ...formData, weight: text })}
            maxLength={3}
          />
          <Typography variant="body" style={styles.unitText}>{t('common.weight_unit')}</Typography>
        </View>
      </View>
    </View>
  );

  const [authStatus, setAuthStatus] = useState<'idle' | 'linking' | 'success'>('idle');

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Typography variant="h1" bold style={styles.stepTitle}>{t('signup.step4_title')}</Typography>
      <Typography variant="body" color="rgba(255,255,255,0.6)" style={styles.stepSubtitle}>
        {t('signup.step4_subtitle')}
      </Typography>

      <ScrollView style={{ marginTop: 24 }} showsVerticalScrollIndicator={false}>
        {!formData.payment ? (
          formData.country.payments.map((p) => {
            const brandColor = PAYMENT_COLORS[p] || '#FFFFFF';
            return (
              <TouchableOpacity 
                key={p} 
                style={styles.paymentCard}
                onPress={() => setFormData({ ...formData, payment: p })}
              >
                <View style={[styles.paymentIcon, { backgroundColor: brandColor }]}>
                  <IconSymbol 
                    name="creditcard.fill" 
                    size={22} 
                    color={brandColor === '#FAE100' ? '#1A1A1A' : '#FFFFFF'} 
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Typography variant="h3" bold>{p}</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.4)">
                    {t('signup.one_tap_connection')}
                  </Typography>
                </View>
                <IconSymbol name="chevron.right" size={20} color="rgba(255,255,255,0.2)" />
              </TouchableOpacity>
            );
          })
        ) : (
          <Animated.View entering={FadeInRight} style={styles.accountInputContainer}>
            <View style={styles.paymentInfoBox}>
              <View style={[styles.paymentIconSmall, { backgroundColor: PAYMENT_COLORS[formData.payment] }]}>
                <IconSymbol 
                  name="creditcard.fill" 
                  size={14} 
                  color={PAYMENT_COLORS[formData.payment] === '#FAE100' ? '#1A1A1A' : '#FFFFFF'} 
                />
              </View>
              <Typography variant="body" bold style={{ marginLeft: 10 }}>{formData.payment}</Typography>
              <TouchableOpacity 
                style={{ marginLeft: 'auto' }} 
                onPress={() => setFormData({ ...formData, payment: '', paymentAccount: '' })}
              >
                <Typography variant="caption" color={theme.primary}>{t('common.cancel')}</Typography>
              </TouchableOpacity>
            </View>

            <Typography variant="caption" style={styles.label}>{t('signup.label_payment_account')}</Typography>
            <TextInput
              style={styles.input}
              placeholder={t('signup.payment_account_placeholder')}
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={formData.paymentAccount}
              onChangeText={(text) => setFormData({ ...formData, paymentAccount: text })}
              autoFocus
            />

            <Button
              title={t('signup.button_pay_auth', { payment: formData.payment })}
              style={{ marginTop: 24 }}
              disabled={!formData.paymentAccount}
              onPress={() => {
                setAuthStatus('linking');
                setTimeout(() => {
                  setAuthStatus('success');
                  setTimeout(() => {
                    nextStep();
                  }, 2500);
                }, 3500);
              }}
            />
          </Animated.View>
        )}
      </ScrollView>

      {authStatus !== 'idle' && (
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut} 
          style={StyleSheet.absoluteFill}
        >
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={styles.secureOverlayContent}>
              <Animated.View 
                entering={FadeInDown.springify()} 
                style={[styles.authIconCircle, { borderColor: PAYMENT_COLORS[formData.payment] || theme.primary }, animatedPulseStyle]}
              >
                <Animated.View style={StyleSheet.absoluteFill}>
                   <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                </Animated.View>
                {authStatus === 'linking' ? (
                  <ActivityIndicator size="large" color={PAYMENT_COLORS[formData.payment] || theme.primary} />
                ) : (
                  <Animated.View entering={FadeIn.springify()}>
                    <IconSymbol name="checkmark.circle.fill" size={60} color={PAYMENT_COLORS[formData.payment] || theme.primary} />
                  </Animated.View>
                )}
              </Animated.View>
              
              <Animated.View entering={FadeInDown.delay(200).springify()}>
                <Typography variant="h1" bold style={{ marginTop: 32, textAlign: 'center', letterSpacing: -0.5 }}>
                  {authStatus === 'linking' ? t('signup.secure_link_title') : t('signup.auth_success_title')}
                </Typography>
                
                <Typography variant="body" color="rgba(255,255,255,0.6)" style={{ marginTop: 12, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 }}>
                  {authStatus === 'linking' 
                    ? t('signup.secure_link_subtitle', { payment: formData.payment })
                    : t('signup.auth_success_subtitle')}
                </Typography>
              </Animated.View>

              {authStatus === 'linking' && (
                <Animated.View entering={FadeIn.delay(400)} style={styles.secureBadgeRow}>
                  <View style={styles.secureBadge}>
                    <IconSymbol name="lock.fill" size={12} color="rgba(255,255,255,0.4)" />
                    <Typography variant="tiny" color="rgba(255,255,255,0.4)" style={{ marginLeft: 6, fontWeight: '700' }}>SSL 256-BIT</Typography>
                  </View>
                  <View style={styles.secureBadge}>
                    <IconSymbol name="shield.fill" size={12} color="rgba(255,255,255,0.4)" />
                    <Typography variant="tiny" color="rgba(255,255,255,0.4)" style={{ marginLeft: 6, fontWeight: '700' }}>{formData.payment.toUpperCase()} SECURE</Typography>
                  </View>
                </Animated.View>
              )}
            </View>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Typography variant="h1" bold style={styles.stepTitle}>{t('signup.step5_title')}</Typography>
      <Typography variant="body" color="rgba(255,255,255,0.6)" style={styles.stepSubtitle}>{t('signup.step5_subtitle')}</Typography>

      {persona ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.bentoGrid}>
            {/* Primary Avatar View */}
            <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.bentoCard, styles.bentoCardXLarge]}>
              <Image source={{ uri: persona.asset_front_url }} style={styles.personaLargeImage} contentFit="cover" />
              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.refineButton} 
                onPress={pickImage}
              >
                <IconSymbol name="camera.fill" size={18} color="#1A1A1A" />
                <View style={{ marginLeft: 8 }}>
                  <Typography variant="caption" bold color="#1A1A1A">{t('studio.button_refine')}</Typography>
                  <Typography variant="tiny" bold color="#1A1A1A" style={{ opacity: 0.7 }}>{t('studio.label_one_time')}</Typography>
                </View>
              </TouchableOpacity>
              <View style={styles.glassLabel}>
                <Typography variant="caption" bold color="rgba(255,255,255,0.6)">{t('signup.label_persona_name')}</Typography>
                <Typography variant="h2" bold>{formData.name}</Typography>
              </View>
            </Animated.View>

            {/* Seed & Metrics */}
            <View style={styles.bentoRow}>
              <Animated.View layout={Layout.springify()} entering={FadeInRight.delay(400)} style={[styles.bentoCard, styles.bentoCardSmall]}>
                <Typography variant="caption" color="rgba(255,255,255,0.4)" bold>{t('studio.label_seed_id')}</Typography>
                <Typography variant="h3" bold style={{ color: theme.primary, marginTop: 4 }}>#{persona.seedId}</Typography>
              </Animated.View>
              <Animated.View layout={Layout.springify()} entering={FadeInRight.delay(500)} style={[styles.bentoCard, styles.bentoCardSmall]}>
                <Typography variant="caption" color="rgba(255,255,255,0.4)" bold>{t('signup.label_height')}</Typography>
                <Typography variant="h3" bold style={{ marginTop: 4 }}>{formData.height}cm</Typography>
              </Animated.View>
            </View>

            {/* Consistency & Region */}
            <View style={styles.bentoRow}>
              <Animated.View layout={Layout.springify()} entering={FadeInRight.delay(600)} style={[styles.bentoCard, styles.bentoCardMedium]}>
                <Typography variant="caption" color="rgba(255,255,255,0.4)" bold>{t('studio.label_consistency')}</Typography>
                <View style={[styles.row, { marginTop: 8 }]}>
                  <IconSymbol name="waveform" size={18} color={theme.primary} />
                  <Typography variant="body" bold style={{ marginLeft: 8 }}>{t('studio.consistency_high')}</Typography>
                </View>
              </Animated.View>
              <Animated.View layout={Layout.springify()} entering={FadeInRight.delay(700)} style={[styles.bentoCard, styles.bentoCardMedium]}>
                <Typography variant="caption" color="rgba(255,255,255,0.4)" bold>{t('signup.label_bio_symmetry')}</Typography>
                <View style={[styles.row, { marginTop: 8 }]}>
                  <IconSymbol name="face.dashed" size={18} color={theme.primary} />
                  <Typography variant="body" bold style={{ marginLeft: 8 }}>{t(persona.symmetry)}</Typography>
                </View>
              </Animated.View>
            </View>

            {/* Other Angles */}
            <Animated.View entering={FadeInDown.delay(800)} style={[styles.bentoCard, { height: 140 }]}>
              <Typography variant="caption" color="rgba(255,255,255,0.4)" bold style={{ marginBottom: 12 }}>MULTI-ANGLE SYNC</Typography>
              <View style={styles.anglesRow}>
                {[persona.asset_side_url, persona.asset_half_url, persona.asset_full_url].map((url, i) => (
                  <View key={i} style={styles.angleThumbWrapper}>
                    <Image source={{ uri: url }} style={styles.angleThumb} />
                    <View style={styles.angleLabel}>
                      <Typography variant="tiny" bold color="#FFFFFF">{['SIDE', '45°', 'BODY'][i]}</Typography>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      ) : (
        <View style={styles.emptyPersona}>
          <View style={styles.scanningContainer}>
            <View style={styles.dataStreamOverlay}>
              {/* Decorative data stream elements */}
              {[1, 2, 3].map((_, i) => (
                <Animated.View 
                  key={i}
                  entering={FadeIn.delay(i * 300)}
                  style={[
                    styles.dataNode, 
                    { 
                      left: `${25 * (i + 1)}%`, 
                      top: `${Math.random() * 80}%`,
                    }
                  ]} 
                />
              ))}
            </View>
            
            <Animated.View 
              style={[styles.scannerGlow, { backgroundColor: theme.primary }, animatedScannerGlowStyle]} 
            />
            <Animated.View 
              style={[styles.scannerTrail, { backgroundColor: theme.primary }, animatedScannerTrailStyle]} 
            />
            <Animated.View 
              style={[styles.scannerLine, { backgroundColor: theme.primary }, animatedScannerStyle]} 
            />
            <View style={styles.pulseRingsContainer}>
              <Animated.View style={[styles.pulseRing, { borderColor: theme.primary }, animatedPulseStyle]} />
              <Animated.View style={[styles.pulseRing, { borderColor: theme.primary, opacity: 0.2 }, animatedPulseStyle]} />
            </View>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
          
          <Animated.View entering={FadeIn} key={generationStep} style={{ alignItems: 'center', marginTop: 40 }}>
            <View style={styles.stepIndicatorRow}>
              <View style={[styles.stepIndicator, generationStep === 'prompt' && styles.stepIndicatorActive]} />
              <View style={[styles.stepIndicator, generationStep === 'assets' && styles.stepIndicatorActive]} />
            </View>
            
            <Typography variant="h2" bold style={{ textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase' }}>
              {generationStep === 'prompt' ? 'Gemini Synthesis' : 'Veo Ultra Gen'}
            </Typography>
            
            <View style={styles.progressDetailBox}>
              <Typography variant="body" color="rgba(255,255,255,0.7)" style={{ textAlign: 'center', lineHeight: 22 }}>
                {generationStep === 'prompt' 
                  ? 'Gemini 1.5 Pro is analyzing your demographic heritage to construct a high-fidelity visual prompt...' 
                  : 'Google Veo v2.0 Ultra is processing your biometric seed to render consistent identity across all dimensions...'}
              </Typography>
            </View>
            
            <View style={styles.processingMetrics}>
              <View style={styles.metricItem}>
                <Typography variant="tiny" bold color="rgba(255,255,255,0.3)">LATENCY</Typography>
                <Typography variant="caption" bold color={theme.primary}>14ms</Typography>
              </View>
              <View style={styles.metricItem}>
                <Typography variant="tiny" bold color="rgba(255,255,255,0.3)">SYNC</Typography>
                <Typography variant="caption" bold color={theme.primary}>ULTRA</Typography>
              </View>
              <View style={styles.metricItem}>
                <Typography variant="tiny" bold color="rgba(255,255,255,0.3)">SEED</Typography>
                <Typography variant="caption" bold color={theme.primary}>FIXED</Typography>
              </View>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        {step > 1 && step < 5 && (
          <TouchableOpacity onPress={prevStep} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
          </View>
          <Typography variant="caption" color="rgba(255,255,255,0.4)" style={{ marginLeft: 12, width: 32 }}>{step}/5</Typography>
        </View>
      </View>

      <View style={styles.content}>
        <Animated.View 
          key={step} 
          entering={FadeInRight.duration(400)} 
          exiting={SlideOutLeft.duration(400)} 
          style={{ flex: 1 }}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Button
          title={step === 4 ? t('signup.button_initialize') : step === 5 ? t('signup.button_complete') : t('signup.button_continue')}
          onPress={nextStep}
          loading={loading}
          disabled={
            (step === 1 && !formData.name) || 
            (step === 2 && (!formData.birthDate || !formData.gender)) ||
            (step === 3 && (!formData.height || !formData.weight)) ||
            (step === 4 && (!formData.payment || !formData.paymentAccount)) ||
            (step === 5 && !persona)
          }
          style={[
            styles.nextButton,
            ((step === 1 && !formData.name) || (step === 4 && (!formData.payment || !formData.paymentAccount))) && styles.disabledButton
          ]}
        />
      </View>

      {(loading || isFinishing) && step < 6 && (
        <View style={styles.fullOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
          {isFinishing && (
            <Animated.View entering={FadeInDown} style={{ alignItems: 'center', marginTop: 24 }}>
              <Typography variant="h3" bold>Establishing Secure Session</Typography>
              <Typography variant="body" color="rgba(255,255,255,0.6)" style={{ marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
                {t('signup.session_securing_wallet')}{'\n'}
                {t('signup.session_finalizing_identity')}
              </Typography>
            </Animated.View>
          )}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FAE100',
  },
  content: {
    flex: 1,
    paddingHorizontal: 4,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 20,
  },
  stepTitle: {
    fontSize: 34,
    lineHeight: 42,
    marginBottom: 8,
  },
  stepSubtitle: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#1C1C1E',
    height: 64,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    flex: 1,
    height: 56,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeChip: {
    backgroundColor: '#FAE100',
    borderColor: '#FAE100',
  },
  countryList: {
    flexGrow: 0,
  },
  countryChip: {
    paddingHorizontal: 20,
    height: 48,
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  unitText: {
    position: 'absolute',
    right: 20,
    top: 20,
    opacity: 0.3,
    fontWeight: '700',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fetchingOverlay: {
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(250,225,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(250,225,0,0.1)',
    alignItems: 'center',
  },
  paymentInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  accountInputContainer: {
    paddingBottom: 40,
  },
  paymentIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPersona: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  scannerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 5,
    shadowColor: '#FAE100',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  scannerTrail: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 4,
  },
  scannerGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
    zIndex: 3,
    opacity: 0.5,
  },
  dataStreamOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  dataNode: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FAE100',
  },
  pulseRingsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  stepIndicator: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  stepIndicatorActive: {
    backgroundColor: '#FAE100',
    width: 56,
  },
  progressDetailBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 24,
    borderRadius: 24,
    marginTop: 24,
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  processingMetrics: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 48,
  },
  metricItem: {
    alignItems: 'center',
    gap: 6,
  },
  bentoGrid: {
    gap: 12,
    paddingTop: 12,
  },
  bentoCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bentoCardXLarge: {
    width: '100%',
    aspectRatio: 1,
    padding: 0,
    overflow: 'hidden',
  },
  bentoCardSmall: {
    flex: 1,
    height: 110,
    justifyContent: 'center',
  },
  bentoCardMedium: {
    flex: 1,
    height: 130,
    justifyContent: 'center',
  },
  personaLargeImage: {
    width: '100%',
    height: '100%',
  },
  refineButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: '#FAE100',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 10,
  },
  glassLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  anglesRow: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  angleThumbWrapper: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  angleThumb: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  angleLabel: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
  nextButton: {
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FAE100',
  },
  disabledButton: {
    opacity: 0.4,
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  secureOverlayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  secureBadgeRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 48,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
});
});
