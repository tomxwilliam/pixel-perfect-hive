import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CookiePreferences {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

interface CookieConsentContextType {
  preferences: CookiePreferences | null;
  hasConsented: boolean;
  hasConsent: (category: keyof CookiePreferences) => boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: Partial<CookiePreferences>) => void;
  openPreferenceCenter: () => void;
  closePreferenceCenter: () => void;
  isPreferenceCenterOpen: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const STORAGE_KEY = 'cookie-consent-preferences';
const POLICY_VERSION = '1.0';

const defaultPreferences: CookiePreferences = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
  timestamp: new Date().toISOString(),
  version: POLICY_VERSION,
};

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [isPreferenceCenterOpen, setIsPreferenceCenterOpen] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences(parsed);
        setHasConsented(true);
      } catch (error) {
        console.error('Failed to parse cookie preferences:', error);
      }
    }
  }, []);

  const saveToStorage = (prefs: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setHasConsented(true);
  };

  const acceptAll = () => {
    const prefs: CookiePreferences = {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: POLICY_VERSION,
    };
    saveToStorage(prefs);
    setIsPreferenceCenterOpen(false);
  };

  const rejectAll = () => {
    const prefs: CookiePreferences = {
      ...defaultPreferences,
      timestamp: new Date().toISOString(),
    };
    saveToStorage(prefs);
    setIsPreferenceCenterOpen(false);
  };

  const savePreferences = (customPrefs: Partial<CookiePreferences>) => {
    const prefs: CookiePreferences = {
      necessary: true,
      preferences: customPrefs.preferences ?? false,
      analytics: customPrefs.analytics ?? false,
      marketing: customPrefs.marketing ?? false,
      timestamp: new Date().toISOString(),
      version: POLICY_VERSION,
    };
    saveToStorage(prefs);
    setIsPreferenceCenterOpen(false);
  };

  const hasConsent = (category: keyof CookiePreferences): boolean => {
    if (!preferences) return false;
    if (category === 'necessary') return true;
    return preferences[category] === true;
  };

  const openPreferenceCenter = () => setIsPreferenceCenterOpen(true);
  const closePreferenceCenter = () => setIsPreferenceCenterOpen(false);

  return (
    <CookieConsentContext.Provider
      value={{
        preferences,
        hasConsented,
        hasConsent,
        acceptAll,
        rejectAll,
        savePreferences,
        openPreferenceCenter,
        closePreferenceCenter,
        isPreferenceCenterOpen,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
