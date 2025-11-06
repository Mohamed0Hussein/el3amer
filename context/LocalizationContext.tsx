import { SupportedLanguage, isRtlLanguage, translations } from '@/localization/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nManager } from 'react-native';

type LocalizationContextType = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: keyof typeof translations['en']) => string;
  isRtl: boolean;
  isReady: boolean;
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const STORAGE_KEY = '@settings:language';

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === 'ar' || raw === 'en') {
          setLanguageState(raw);
          // Apply RTL settings on initial load (without reload to avoid disrupting UX)
          const shouldBeRtl = isRtlLanguage(raw);
          if (I18nManager.isRTL !== shouldBeRtl) {
            I18nManager.allowRTL(shouldBeRtl);
            I18nManager.forceRTL(shouldBeRtl);
          }
        }
      } finally {
        setIsReady(true);
      }
    };
    hydrate();
  }, []);

  const applyRtlIfNeeded = async (nextLang: SupportedLanguage) => {
    const shouldBeRtl = isRtlLanguage(nextLang);
    if (I18nManager.isRTL !== shouldBeRtl) {
      I18nManager.allowRTL(shouldBeRtl);
      I18nManager.forceRTL(shouldBeRtl);
      // Note: RTL changes will apply without reload in React Native
      // The UI will update automatically through re-renders
    }
  };

  const setLanguage = async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
    await applyRtlIfNeeded(lang);
  };

  const t = useMemo(() => {
    const dict = translations[language];
    return (key: keyof typeof translations['en']) => dict[key] ?? String(key);
  }, [language]);

  const value: LocalizationContextType = {
    language,
    setLanguage,
    t,
    isRtl: isRtlLanguage(language),
    isReady,
  };

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
};

export const useLocalization = () => {
  const ctx = useContext(LocalizationContext);
  if (!ctx) throw new Error('useLocalization must be used within LocalizationProvider');
  return ctx;
};
