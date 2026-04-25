import { supabase } from './SupabaseClient';
import { storageService } from './StorageService';

export class AuthService {
  /**
   * 이메일/비밀번호로 로그인합니다.
   */
  public static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      await storageService.setUserInfo({
        id: data.user.id,
        email: data.user.email || '',
      });
    }

    return data;
  }

  /**
   * 구글 소셜 로그인을 진행합니다.
   */
  public static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'clickpost://(tabs)', // Expo deep link
      },
    });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * 비밀번호 초기화 메일을 전송합니다.
   */
  public static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'clickpost://reset-password',
    });

    if (error) {
      throw error;
    }
  }

  /**
   * 로그아웃합니다.
   */
  public static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    await storageService.clear();
  }

  /**
   * 현재 세션을 확인합니다.
   */
  public static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }
}
