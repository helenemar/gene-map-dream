import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fr } from '@/i18n/fr';
import { en } from '@/i18n/en';
import { de } from '@/i18n/de';
import type { Translations } from '@/i18n/types';

export type Lang = 'fr' | 'en' | 'de';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: fr,
});

const TRANSLATIONS: Record<Lang, Translations> = { fr, en, de };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('genogy-lang');
    return (stored === 'en' || stored === 'fr' || stored === 'de') ? stored : 'fr';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('genogy-lang', l);
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = TRANSLATIONS[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
