import { supabase } from './SupabaseClient';

export interface UserProfile {
  user_id: string;
  email: string;
  fcm_token?: string;
  birth_date?: string;
  gender?: string;
  country_code?: string;
  follower_count: number;
  is_pro_verified: boolean;
  total_points: number;
  created_at: string;
}

export class UserService {
  /**
   * 새로운 유저 프로필을 생성합니다.
   */
  public static async createProfile(profile: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .insert({
        ...profile,
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * 유저 프로필 정보를 가져옵니다.
   */
  public static async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  /**
   * 유저의 위치 정보를 업데이트합니다. (LBS 타겟팅용)
   */
  public static async updateLocation(userId: string, latitude: number, longitude: number): Promise<void> {
    // PostGIS point format: 'SRID=4326;POINT(longitude latitude)'
    const point = `POINT(${longitude} ${latitude})`;
    
    const { error } = await supabase
      .from('users')
      .update({ 
        last_location: point,
        last_active_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating location:', error);
    }
  }

  /**
   * 유저의 포인트를 업데이트합니다.
   */
  public static async addPoints(userId: string, points: number): Promise<void> {
    // RPC 호출을 통해 Atomic하게 업데이트하는 것이 안전하지만, 
    // 여기서는 간단하게 구현합니다. (실제 환경에선 rpc('increment_points') 권장)
    const profile = await this.getProfile(userId);
    if (!profile) return;

    const { error } = await supabase
      .from('users')
      .update({ total_points: profile.total_points + points })
      .eq('user_id', userId);

    if (error) {
      console.error('Error adding points:', error);
    }
  }

  /**
   * 유저의 FCM 토큰을 업데이트합니다.
   */
  public static async updateFcmToken(userId: string, token: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ fcm_token: token })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating FCM token:', error);
    }
  }
}
