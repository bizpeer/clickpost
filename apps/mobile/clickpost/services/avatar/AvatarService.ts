import { supabase } from '../SupabaseClient';
import { PersonaData } from './types';

export class AvatarService {
  /**
   * 생성된 아바타 데이터를 데이터베이스에 저장합니다.
   */
  public static async saveAvatar(userId: string, persona: PersonaData): Promise<void> {
    const { error } = await supabase
      .from('avatars')
      .upsert({
        user_id: userId,
        seed_id: persona.seedId,
        persona_prompt: persona.personaPrompt,
        asset_front_url: persona.asset_front_url,
        asset_side_url: persona.asset_side_url,
        asset_half_url: persona.asset_half_url,
        asset_full_url: persona.asset_full_url,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving avatar:', error);
      throw error;
    }
  }

  /**
   * 유저의 현재 아바타 정보를 가져옵니다.
   */
  public static async getAvatar(userId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('avatars')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
      console.error('Error fetching avatar:', error);
      return null;
    }

    return data;
  }
}
