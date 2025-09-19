import React, { createContext, useState, ReactNode } from "react";

// Language codes
export type Language = "en" | "hi" | "kn";

// Translation interface
export interface Translations {
  [key: string]: string | Translations;
}

// Language context interface
interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Create context
export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation imports
import enTranslations from "../locales/en.json";
import hiTranslations from "../locales/hi.json";
import knTranslations from "../locales/kn.json";

const translations: Record<Language, Translations> = {
  en: enTranslations,
  hi: hiTranslations,
  kn: knTranslations,
};

// Language Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    // Save to localStorage for persistence
    localStorage.setItem("selectedLanguage", language);
  };

  // Get nested translation by key (e.g., "landing.title" -> translations.en.landing.title)
  const getNestedTranslation = (obj: Translations, path: string): string => {
    const keys = path.split(".");
    let result: string | Translations = obj;

    for (const key of keys) {
      if (result && typeof result === "object" && key in result) {
        result = result[key];
      } else {
        return path; // Return the key if translation not found
      }
    }

    return typeof result === "string" ? result : path;
  };

  const t = (key: string): string => {
    return getNestedTranslation(translations[currentLanguage], key) || key;
  };

  // Initialize language from localStorage on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage") as Language;
    if (savedLanguage && ["en", "hi", "kn"].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const value = {
    currentLanguage,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
