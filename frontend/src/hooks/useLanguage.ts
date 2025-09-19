import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language options for dropdown
export const languageOptions = [
  { code: 'en' as const, name: 'English', nativeName: 'English' },
  { code: 'hi' as const, name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn' as const, name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];