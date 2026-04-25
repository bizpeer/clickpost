import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '../../services/SupabaseClient';
import { Alert, Image as RNImage } from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

import { ThemedInput } from '@/components/themed-input';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', t('auth.fillAll'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(800)} style={styles.logoContainer}>
          <ThemedText type="title" style={styles.logoText}>ClickPost</ThemedText>
          <ThemedText style={styles.subtitle}>{t('dashboard.subGreeting')}</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.form}>
          <ThemedInput
            label={t('auth.email')}
            placeholder="example@clickpost.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <ThemedInput
            label={t('auth.password')}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <ThemedText type="link" style={styles.linkText}>{t('auth.forgotPassword')}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <ThemedText style={styles.loginButtonText}>{t('auth.login')}</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <ThemedText style={styles.dividerText}>OR</ThemedText>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleButton}>
            <Image 
              source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} 
              style={styles.googleIcon} 
            />
            <ThemedText style={styles.googleButtonText}>{t('auth.googleLogin')}</ThemedText>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(600)} style={styles.footer}>
          <ThemedText>{t('auth.noAccount')} </ThemedText>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <ThemedText type="link" style={styles.linkText}>{t('auth.signup')}</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FF3B30', // ClickPost Brand Red
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 4,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  loginButton: {
    backgroundColor: '#FF3B30',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
    opacity: 0.1,
  },
  dividerText: {
    marginHorizontal: 15,
    opacity: 0.5,
  },
  googleButton: {
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkText: {
    fontWeight: 'bold',
  },
});
