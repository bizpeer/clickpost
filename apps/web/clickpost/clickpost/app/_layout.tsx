import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '../services/SupabaseClient';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import '../services/i18n';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const inAuthGroup = segments[0] === '(auth)';
      const isRoot = segments.length === 0 || segments[0] === '';
      
      if (!session && !inAuthGroup && !isRoot) {
        // 비로그인 사용자가 보호된 페이지 접근 시 랜딩페이지로 이동
        router.replace('/');
      } else if (session && (inAuthGroup || isRoot)) {
        // 로그인 사용자가 로그인/회원가입/랜딩페이지 접근 시 대시보드로 이동
        router.replace('/(tabs)');
      }
      setIsAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, [segments]);

  if (!isAuthReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="campaign/new" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
