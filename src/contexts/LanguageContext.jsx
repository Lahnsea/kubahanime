import { createContext, useContext, useState, useEffect } from 'react';

/**
 * LanguageContext — Global server/bahasa toggle
 * 
 * 'id' = Server Indonesia (prioritas chapter Indonesia)
 * 'en' = Server Inggris   (hanya chapter Inggris)
 */

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('kubahanime_lang') || 'id';
  });

  useEffect(() => {
    localStorage.setItem('kubahanime_lang', lang);
  }, [lang]);

  function toggleLang() {
    setLang(prev => prev === 'id' ? 'en' : 'id');
  }

  function setLanguage(l) {
    setLang(l);
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
