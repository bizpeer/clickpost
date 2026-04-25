import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '../../services/SupabaseClient';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  FadeIn, 
  SlideInRight, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedInput } from '@/components/themed-input';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = width < 768;

export default function LandingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(!isMobile);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Background Animation
  const blob1Pos = useSharedValue(0);
  const blob2Pos = useSharedValue(0);

  useEffect(() => {
    blob1Pos.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 3000 }),
        withTiming(-20, { duration: 3000 })
      ),
      -1,
      true
    );
    blob2Pos.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 4000 }),
        withTiming(30, { duration: 4000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedBlob1 = useAnimatedStyle(() => ({
    transform: [{ translateY: blob1Pos.value }, { translateX: blob1Pos.value * 0.5 }],
  }));

  const animatedBlob2 = useAnimatedStyle(() => ({
    transform: [{ translateY: blob2Pos.value }, { translateX: -blob2Pos.value * 0.8 }],
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert('로그인 실패', '비밀번호를 확인하세요.');
        } else {
          Alert.alert('로그인 실패', error.message);
        }
      }
    } catch (err) {
      Alert.alert('오류', '예기치 않은 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const processSteps = [
    {
      title: "01. AI 브리핑",
      desc: "제품 이미지와 설명을 업로드하면 AI가 핵심 소구점(USP)을 분석합니다.",
      icon: "doc.text.fill",
      color: "#FF3B30"
    },
    {
      title: "02. 타겟팅 설정",
      desc: "노출 지역(LBS), 연령, 성별 및 필수 키워드를 설정하여 타겟을 정교화합니다.",
      icon: "target",
      color: "#FF9500"
    },
    {
      title: "03. Gemini 스크립트",
      desc: "Gemini API가 3종의 서로 다른 톤을 가진 샘플 스크립트를 즉시 생성합니다.",
      icon: "sparkles",
      color: "#5856D6"
    },
    {
      title: "04. 캠페인 실행",
      desc: "승인된 스크립트 기반으로 AI 아바타가 결합된 영상이 SNS에 배포됩니다.",
      icon: "play.fill",
      color: "#34C759"
    }
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Background Blobs */}
      <Animated.View style={[styles.blob, styles.blob1, animatedBlob1]} />
      <Animated.View style={[styles.blob, styles.blob2, animatedBlob2]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation / Header */}
        <View style={styles.navBar}>
          <ThemedText type="title" style={styles.logoText}>ClickPost</ThemedText>
          {!showLogin && (
            <TouchableOpacity style={styles.navLoginBtn} onPress={() => setShowLogin(true)}>
              <ThemedText style={{ color: '#FFF', fontWeight: '600' }}>로그인</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Animated.View entering={FadeInUp.duration(1000)} style={styles.heroTextContainer}>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>SaaS 2.0 AI 마케팅 플랫폼</ThemedText>
            </View>
            <ThemedText type="title" style={styles.heroTitle}>
              당신의 브랜드를 위한{"\n"}
              <ThemedText type="title" style={{ color: '#FF3B30' }}>고정 AI 아바타</ThemedText> 마케팅
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              전 세계 인플루언서의 고유한 페르소나와 결합된{"\n"}
              일관성 있는 AI 마케팅 파이프라인을 구축하세요.
            </ThemedText>
            
            <View style={styles.ctaRow}>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={() => router.push('/(auth)/register')}
              >
                <ThemedText style={styles.buttonText}>지금 무료로 시작하기</ThemedText>
                <IconSymbol name="chevron.right" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.trustedBy}>
              <ThemedText style={styles.trustedText}>TRUSTED BY GLOBAL BRANDS</ThemedText>
              <View style={styles.brandRow}>
                {['Google', 'Meta', 'TikTok', 'YouTube'].map(brand => (
                  <ThemedText key={brand} style={styles.brandName}>{brand}</ThemedText>
                ))}
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Process Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>어떻게 작동하나요?</ThemedText>
          <View style={styles.processGrid}>
            {processSteps.map((step, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInDown.delay(200 * index).duration(800)}
                style={styles.processCard}
              >
                <View style={[styles.iconCircle, { backgroundColor: step.color + '20' }]}>
                  <IconSymbol name={step.icon as any} size={28} color={step.color} />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.stepTitle}>{step.title}</ThemedText>
                <ThemedText style={styles.stepDesc}>{step.desc}</ThemedText>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Call to Action Banner */}
        <Animated.View entering={FadeIn.delay(1000)} style={styles.ctaBanner}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop' }} 
            style={styles.ctaBannerBg}
          />
          <BlurView intensity={40} tint="dark" style={styles.ctaBannerOverlay}>
            <ThemedText type="title" style={{ color: '#FFF', textAlign: 'center', fontSize: 32 }}>
              지금 바로 캠페인을 생성하세요
            </ThemedText>
            <TouchableOpacity style={[styles.primaryButton, { marginTop: 32, alignSelf: 'center' }]} onPress={() => router.push('/(auth)/register')}>
              <ThemedText style={styles.buttonText}>캠페인 시작하기</ThemedText>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </ScrollView>

      {/* Hovering Login Pop-up */}
      {showLogin && (
        <Animated.View 
          entering={isMobile ? FadeInDown : SlideInRight.springify()} 
          style={[styles.loginPopup, isMobile && styles.mobilePopup]}
        >
          <BlurView intensity={100} tint="dark" style={styles.popupBlur}>
            <View style={styles.popupHeader}>
              <View>
                <ThemedText type="subtitle" style={{ color: '#FFF' }}>광고주 로그인</ThemedText>
                <ThemedText style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
                  관리자 계정으로 접속하세요
                </ThemedText>
              </View>
              <TouchableOpacity onPress={() => setShowLogin(false)} style={styles.closeBtn}>
                <IconSymbol name="xmark" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.popupContent}>
              <ThemedInput
                label="이메일"
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                style={{ marginBottom: 16 }}
              />
              <ThemedInput
                label="비밀번호"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ marginBottom: 24 }}
              />

              <TouchableOpacity 
                style={[styles.loginButton, loading && { opacity: 0.7 }]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.loginButtonText}>로그인</ThemedText>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotBtn}>
                <ThemedText style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>비밀번호를 잊으셨나요?</ThemedText>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.line} />
                <ThemedText style={styles.dividerText}>또는</ThemedText>
                <View style={styles.line} />
              </View>

              <TouchableOpacity style={styles.googleButton}>
                <Image source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} style={styles.googleIcon} />
                <ThemedText style={{ color: '#FFF', fontSize: 14 }}>Google 계정으로 로그인</ThemedText>
              </TouchableOpacity>

              <View style={styles.popupFooter}>
                <ThemedText style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>계정이 없으신가요?</ThemedText>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <ThemedText type="link" style={{ marginLeft: 8, fontSize: 13, color: '#FF3B30', fontWeight: '700' }}>회원가입</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  blob: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.15,
    filter: 'blur(80px)',
    zIndex: 0,
  } as any,
  blob1: {
    backgroundColor: '#FF3B30',
    top: -100,
    left: -100,
  },
  blob2: {
    backgroundColor: '#5856D6',
    bottom: -100,
    right: -100,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  navBar: {
    height: 80,
    paddingHorizontal: isMobile ? '5%' : '10%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
  navLoginBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hero: {
    height: height * 0.8,
    justifyContent: 'center',
    paddingHorizontal: isMobile ? '5%' : '10%',
  },
  heroTextContainer: {
    maxWidth: 900,
  },
  badge: {
    backgroundColor: 'rgba(255,59,48,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    alignSelf: 'flex-start',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.2)',
  },
  badgeText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: isMobile ? 40 : 72,
    lineHeight: isMobile ? 52 : 88,
    fontWeight: '900',
    letterSpacing: -2,
    color: '#FFF',
  },
  heroSubtitle: {
    fontSize: isMobile ? 18 : 22,
    lineHeight: isMobile ? 28 : 36,
    marginTop: 24,
    color: 'rgba(255,255,255,0.6)',
  },
  ctaRow: {
    flexDirection: 'row',
    marginTop: 48,
  },
  primaryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 36,
    paddingVertical: 20,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  trustedBy: {
    marginTop: 80,
  },
  trustedText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    gap: isMobile ? 24 : 48,
    alignItems: 'center',
  },
  brandName: {
    fontSize: isMobile ? 18 : 24,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.15)',
  },
  section: {
    paddingHorizontal: isMobile ? '5%' : '10%',
    paddingVertical: 100,
  },
  sectionTitle: {
    fontSize: isMobile ? 28 : 40,
    textAlign: 'center',
    marginBottom: 80,
    fontWeight: '900',
    color: '#FFF',
  },
  processGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'center',
  },
  processCard: {
    width: isWeb ? 340 : '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 40,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    marginBottom: 16,
    color: '#FFF',
  },
  stepDesc: {
    lineHeight: 26,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },
  ctaBanner: {
    height: 500,
    marginHorizontal: isMobile ? '5%' : '10%',
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 60,
  },
  ctaBannerBg: {
    width: '100%',
    height: '100%',
  },
  ctaBannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 40,
  },
  loginPopup: {
    position: 'absolute',
    top: 100,
    right: '10%',
    width: 420,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.6,
    shadowRadius: 50,
  },
  mobilePopup: {
    top: 'auto',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    borderRadius: 0,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
  popupBlur: {
    padding: 40,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContent: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#FF3B30',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  forgotBtn: {
    alignSelf: 'center',
    marginTop: 20,
  },
  popupFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  }
});
