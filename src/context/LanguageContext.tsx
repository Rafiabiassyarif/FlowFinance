import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { en, id, Translations, LanguageKey } from '../i18n/locales';
import { useFinance } from './FinanceContext';

interface LanguageContextType {
  language: LanguageKey;
  setLanguage: (lang: LanguageKey) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useFinance();
  const getValidLang = (lang: any): LanguageKey => {
    return (lang === 'en' || lang === 'id') ? lang : 'id';
  };

  const [localLang, setLocalLang] = useState<LanguageKey>(
    () => getValidLang(localStorage.getItem('language'))
  );

  // Sync with user profile when it loads
  useEffect(() => {
    if (profile?.language && profile.language !== localLang) {
      const validProfileLang = getValidLang(profile.language);
      if (validProfileLang !== localLang) {
        setLocalLang(validProfileLang);
        localStorage.setItem('language', validProfileLang);
      }
    }
  }, [profile?.language]);

  const setLanguage = (lang: LanguageKey) => {
    setLocalLang(lang);
    localStorage.setItem('language', lang);
  };

  const language = localLang;

  const translations: Record<LanguageKey, Translations> = { en, id };

  // Helper to get nested object property via string path like "dashboard.title"
  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = translations[language] || translations['id'];
    for (const key of keys) {
      if (!current || current[key] === undefined) {
        return path; // Fallback to key if not found
      }
      current = current[key];
    }
    return current as string;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
