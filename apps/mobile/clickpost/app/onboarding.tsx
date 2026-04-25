import React from 'react';
import { StyleSheet, View, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop' }} 
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Typography variant="h1" bold color="#FAE100" style={styles.title}>
              ClickPost
            </Typography>
            <Typography variant="h2" bold color="#FFFFFF" style={styles.subtitle}>
              {t('onboarding.subtitle')}
            </Typography>
            <Typography variant="body" color="#FFFFFF" style={styles.description}>
              {t('onboarding.description')}
            </Typography>
          </View>

          <View style={styles.footer}>
            <Button 
              title={t('onboarding.get_started')} 
              onPress={() => router.replace('/login')} 
              style={styles.button}
            />
            <Typography variant="caption" color="#FFFFFF" style={styles.terms}>
              {t('onboarding.terms')}
            </Typography>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  content: {
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 28,
    marginBottom: 20,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  footer: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 30,
  },
  terms: {
    marginTop: 20,
    opacity: 0.5,
  },
});
