import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// 번역 데이터 정의
import en from './en.json';
import ko from './ko.json';
import jp from './jp.json';
import cn from './cn.json';
import tw from './tw.json';

const resources = {
  en: { translation: en },
  ko: { translation: ko },
  jp: { translation: jp },
  'zh-CN': { translation: cn },
  'zh-TW': { translation: tw },
  // Fallbacks for base 'zh'
  cn: { translation: cn },
  tw: { translation: tw },
};

// 기기 설정에서 언어 코드 추출
const locales = Localization.getLocales();
const deviceLanguage = locales[0]?.languageTag || locales[0]?.languageCode || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    // 기기 설정의 언어를 기본값으로 사용
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
