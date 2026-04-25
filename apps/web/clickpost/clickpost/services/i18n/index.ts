import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import ko from './ko.json';

const resources = {
  en: { translation: en },
  ko: { translation: ko },
};

// Get device/browser language
const getDeviceLanguage = () => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const lang = locales[0].languageCode;
    // Default to 'ko' if the language is not 'en' or 'ko', or if 'ko' is preferred
    return (lang === 'en' || lang === 'ko') ? lang : 'ko';
  }
  return 'ko';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
