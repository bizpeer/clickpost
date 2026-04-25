import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '../../services/SupabaseClient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp, FadeInRight, FadeIn, SlideInRight } from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedInput } from '@/components/themed-input';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function LandingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(true); // Default to showing the pop-up for convenience
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert('Login Failed', error.message);
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const processSteps = [
    {
      title: "Step 1: AI 브리핑",
      desc: "제품 이미지와 설명을 업로드하면 AI가 핵심 소구점(USP)을 분석합니다.",
      icon: "doc.text.fill",
      color: "#FF3B30"
    },
    {
      title: "Step 2: 정밀 타겟팅 & 키워드",
      desc: "노출할 지역(LBS), 연령, 성별 및 필수/제외 키워드를 설정하여 타겟을 정교화합니다.",
      icon: "target",
      color: "#FF9500"
    },
    {
      title: "Step 3: Gemini 스크립트 생성",
      desc: "Gemini API가 3종의 서로 다른 톤을 가진 샘플 스크립트를 즉시 생성합니다.",
      icon: "sparkles",
      color: "#5856D6"
    },
    {
      title: "Step 4: 검토 및 예치",
      desc: "승인된 스크립트 기반으로 캠페인 예산을 예치하면 즉시 실행 단계로 진입합니다.",
      icon: "checkmark.seal.fill",
      color: "#34C759"
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Animated.View entering={FadeInUp.duration(1000)} style={styles.heroTextContainer}>
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
                <ThemedText style={styles.buttonText}>지금 시작하기</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <ThemedText style={{ color: '#FFF' }}>데모 보기</ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Process Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>캠페인 프로세스</ThemedText>
          <View style={styles.processGrid}>
            {processSteps.map((step, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInUp.delay(200 * index).duration(800)}
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

        {/* Features Section */}
        <View style={styles.featureSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop' }} 
            style={styles.featureBg}
          />
          <BlurView intensity={30} tint="dark" style={styles.featureOverlay}>
            <ThemedText type="title" style={{ color: '#FFF', textAlign: 'center' }}>
              Gemini & Veo Ultra 기술의 집약
            </ThemedText>
            <ThemedText style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 12 }}>
              최첨단 AI 모델을 통해 고품질의 숏폼 영상을 100가지 변주로 자동 생성합니다.
            </ThemedText>
          </BlurView>
        </View>
      </ScrollView>

      {/* Hovering Login Pop-up */}
      {showLogin && (
        <Animated.View entering={SlideInRight.springify()} style={styles.loginPopup}>
          <BlurView intensity={80} tint="dark" style={styles.popupBlur}>
            <View style={styles.popupHeader}>
              <ThemedText type="subtitle" style={{ color: '#FFF' }}>광고주 로그인</ThemedText>
              <TouchableOpacity onPress={() => setShowLogin(false)}>
                <IconSymbol name="xmark" size={20} color="rgba(255,255,255,0.5)" />
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

              <View style={styles.popupFooter}>
                <ThemedText style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>계정이 없으신가요?</ThemedText>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <ThemedText type="link" style={{ marginLeft: 8, fontSize: 12, color: '#FF3B30' }}>회원가입</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.divider}>
                <View style={styles.line} />
                <ThemedText style={styles.dividerText}>OR</ThemedText>
                <View style={styles.line} />
              </View>

              <TouchableOpacity style={styles.googleButton}>
                <Image source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} style={styles.googleIcon} />
                <ThemedText style={{ color: '#FFF', fontSize: 14 }}>Google 로그인</ThemedText>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* Login Toggle Button (if hidden) */}
      {!showLogin && (
        <TouchableOpacity style={styles.loginFab} onPress={() => setShowLogin(true)}>
          <IconSymbol name="person.fill" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  hero: {
    height: height * 0.7,
    justifyContent: 'center',
    paddingHorizontal: '10%',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  heroTextContainer: {
    maxWidth: 800,
  },
  heroTitle: {
    fontSize: 56,
    lineHeight: 72,
    fontWeight: '900',
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 20,
    lineHeight: 32,
    marginTop: 24,
    opacity: 0.6,
  },
  ctaRow: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  secondaryButton: {
    backgroundColor: '#333',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 14,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: '10%',
    paddingVertical: 80,
  },
  sectionTitle: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 60,
    fontWeight: '800',
  },
  processGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  processCard: {
    width: isWeb ? 300 : '100%',
    backgroundColor: 'rgba(120,120,120,0.05)',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.1)',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  stepDesc: {
    lineHeight: 24,
    opacity: 0.6,
  },
  featureSection: {
    height: 400,
    marginHorizontal: '10%',
    borderRadius: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  featureBg: {
    width: '100%',
    height: '100%',
  },
  featureOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 40,
  },
  loginPopup: {
    position: 'absolute',
    top: 40,
    right: 40,
    width: 380,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  popupBlur: {
    padding: 32,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  popupContent: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#FF3B30',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  popupFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  loginFab: {
    position: 'absolute',
    top: 40,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    zIndex: 1000,
  }
});
