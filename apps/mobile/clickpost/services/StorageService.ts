import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfo, PersonaData } from './avatar/types';

const STORAGE_KEYS = {
  USER_INFO: 'clickpost_user_info',
  PERSONA_DATA: 'clickpost_persona_data',
  ONBOARDED: 'clickpost_onboarded',
};

class StorageService {
  private static instance: StorageService;
  private userInfo: UserInfo | null = null;
  private personaData: PersonaData | null = null;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public async init() {
    try {
      const info = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
      const persona = await AsyncStorage.getItem(STORAGE_KEYS.PERSONA_DATA);
      
      if (info) {
        const parsedInfo = JSON.parse(info);
        // Date strings need to be converted back to Date objects
        if (parsedInfo.birthDate) parsedInfo.birthDate = new Date(parsedInfo.birthDate);
        this.userInfo = parsedInfo;
      }
      
      if (persona) {
        this.personaData = JSON.parse(persona);
      }
    } catch (e) {
      console.error('Failed to initialize StorageService', e);
    }
  }

  public async setUserInfo(info: UserInfo) {
    this.userInfo = info;
    await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(info));
  }

  public getUserInfo(): UserInfo | null {
    return this.userInfo;
  }

  public async setPersonaData(data: PersonaData) {
    this.personaData = data;
    await AsyncStorage.setItem(STORAGE_KEYS.PERSONA_DATA, JSON.stringify(data));
  }

  public getPersonaData(): PersonaData | null {
    return this.personaData;
  }

  public async isOnboarded(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED);
    return value === 'true';
  }

  public async setOnboarded(value: boolean) {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, value.toString());
  }

  public async clear() {
    this.userInfo = null;
    this.personaData = null;
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_INFO,
      STORAGE_KEYS.PERSONA_DATA,
      STORAGE_KEYS.ONBOARDED
    ]);
  }
}

export const storageService = StorageService.getInstance();
