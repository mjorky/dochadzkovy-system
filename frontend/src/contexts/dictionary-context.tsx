'use client';

import React, { createContext, useContext } from 'react';
import type { Dictionary, Locale } from '@/lib/dictionary-types';

interface DictionaryContextType {
  dictionary: Dictionary;
  locale: Locale;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

interface DictionaryProviderProps {
  children: React.ReactNode;
  dictionary: Dictionary;
  locale: Locale;
}

export function DictionaryProvider({ children, dictionary, locale }: DictionaryProviderProps) {
  return (
    <DictionaryContext.Provider value={{ dictionary, locale }}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (context === undefined) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
}

// Convenience hook to get just the translations
export function useTranslations() {
  const { dictionary } = useDictionary();
  return dictionary;
}

// Convenience hook to get just the locale
export function useLocale() {
  const { locale } = useDictionary();
  return locale;
}
