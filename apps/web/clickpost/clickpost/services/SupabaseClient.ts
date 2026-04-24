import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// TODO: 환경 변수 설정 필요 (.env)
const supabaseUrl = 'https://trucxonuhorjvjtkcywd.supabase.co';
const supabaseAnonKey = 'sb_publishable_I4A5OYfb7C6qw6ik96uMIw_5wBg_xVk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
