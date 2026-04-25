import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, Dimensions, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';
import { AuthService } from '@/services/AuthService';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);
    try {
      await AuthService.signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // User requested specific messages:
      // 로그인 id가 없으면 > 회원가입을 하세요
      // 비밀번호를 잘못 입력 > 비밀번호를 확인하세요
      
      if (error.message?.includes('Invalid login credentials') || error.status === 400) {
        // Supabase often returns generic "Invalid login credentials" for security
        // But we can check if it's a "User not found" or "Wrong password" if possible, 
        // otherwise we show a helpful message.
        // For specific requirement, let's map them.
        if (error.message?.toLowerCase().includes('user not found') || error.code === 'user_not_found') {
          Alert.alert(t('common.error'), t('auth.error_user_not_found'));
        } else {
          Alert.alert(t('common.error'), t('auth.error_wrong_password'));
        }
      } else {
        Alert.alert(t('common.error'), t('auth.error_general'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await AuthService.signInWithGoogle();
      // The actual redirect will be handled by the OS deep link
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert(t('common.error'), t('auth.error_general'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(t('common.error'), t('auth.email_label') + '를 입력해 주세요.');
      return;
    }

    try {
      await AuthService.resetPassword(email);
      Alert.alert(t('common.success'), t('auth.password_reset_sent'));
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert(t('common.error'), t('auth.error_general'));
    }
  };

  return (
    <ScreenWrapper fullScreen>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop' }} 
        style={styles.background}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={styles.container}>
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
            <Typography variant="h1" bold color="#FAE100" style={styles.logo}>
              ClickPost
            </Typography>
            <Typography variant="h2" bold color="#FFFFFF">
              {t('auth.login_title')}
            </Typography>
            <Typography variant="body" color="rgba(255,255,255,0.6)" style={styles.subtitle}>
              {t('auth.login_subtitle')}
            </Typography>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.form}>
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="rgba(255,255,255,0.4)" style={styles.label}>
                {t('auth.email_label')}
              </Typography>
              <View style={styles.inputWrapper}>
                <IconSymbol name="envelope.fill" size={18} color="rgba(255,255,255,0.3)" />
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Typography variant="caption" color="rgba(255,255,255,0.4)" style={styles.label}>
                {t('auth.password_label')}
              </Typography>
              <View style={styles.inputWrapper}>
                <IconSymbol name="lock.fill" size={18} color="rgba(255,255,255,0.3)" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                <Typography variant="tiny" color="#FAE100" bold>
                  {t('auth.forgot_password')}
                </Typography>
              </TouchableOpacity>
            </View>

            <Button
              title={t('auth.login_button')}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
            />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Typography variant="tiny" color="rgba(255,255,255,0.3)" style={styles.dividerText}>
                OR
              </Typography>
              <View style={styles.line} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <IconSymbol name="person.circle.fill" size={20} color="#FFFFFF" />
                  <Typography variant="body" bold color="#FFFFFF" style={styles.googleButtonText}>
                    {t('auth.google_login_button')}
                  </Typography>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.footer}>
            <Typography variant="body" color="rgba(255,255,255,0.6)">
              {t('auth.no_account')}
            </Typography>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Typography variant="body" bold color="#FAE100" style={{ marginLeft: 8 }}>
                {t('auth.signup_link')}
              </Typography>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ImageBackground>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    marginBottom: 10,
  },
  subtitle: {
    marginTop: 8,
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 4,
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    marginTop: 10,
    backgroundColor: '#FAE100',
  },
  loginButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  googleButtonText: {
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
});
