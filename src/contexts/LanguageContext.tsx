import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Import locale files
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import sw from '@/locales/sw.json';

type LocaleData = typeof en;

interface Language {
    code: string;
    name: string;
    nativeName: string;
    rtl: boolean;
}

const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', rtl: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', rtl: false },
    { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
];

const locales: Record<string, LocaleData> = {
    en,
    ar,
    sw,
    fr: en, // Fallback to English for now
};

interface LanguageContextType {
    language: string;
    languages: Language[];
    isRTL: boolean;
    t: (key: string, params?: Record<string, string>) => string;
    setLanguage: (code: string) => Promise<void>;
    currentLanguage: Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const { user, profile } = useAuth();
    const [language, setLanguageState] = useState<string>(() => {
        // Check localStorage first, then default to 'en'
        if (typeof window !== 'undefined') {
            return localStorage.getItem('language') || 'en';
        }
        return 'en';
    });

    const currentLanguage = languages.find(l => l.code === language) || languages[0];
    const isRTL = currentLanguage.rtl;

    // Apply RTL to document
    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;

        // Add/remove RTL class for Tailwind
        if (isRTL) {
            document.documentElement.classList.add('rtl');
        } else {
            document.documentElement.classList.remove('rtl');
        }
    }, [isRTL, language]);

    // Load user's language preference from profile
    useEffect(() => {
        if (profile?.language && profile.language !== language) {
            setLanguageState(profile.language);
            localStorage.setItem('language', profile.language);
        }
    }, [profile?.language]);

    const t = useCallback((key: string, params?: Record<string, string>): string => {
        const locale = locales[language] || locales.en;
        const keys = key.split('.');

        let value: unknown = locale;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                // Fallback to English
                value = en;
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = (value as Record<string, unknown>)[fallbackKey];
                    } else {
                        return key; // Return key if not found
                    }
                }
                break;
            }
        }

        if (typeof value !== 'string') {
            return key;
        }

        // Replace parameters
        if (params) {
            let result = value;
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
            });
            return result;
        }

        return value;
    }, [language]);

    const setLanguage = useCallback(async (code: string) => {
        setLanguageState(code);
        localStorage.setItem('language', code);

        // Update user profile if logged in
        if (user) {
            try {
                const profileRef = doc(db, 'profiles', user.uid);
                await updateDoc(profileRef, { language: code });
            } catch (error) {
                console.error('Error updating language preference:', error);
            }
        }
    }, [user]);

    return (
        <LanguageContext.Provider value={{
            language,
            languages,
            isRTL,
            t,
            setLanguage,
            currentLanguage,
        }}>
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

// Convenience hook for translations only
export function useTranslation() {
    const { t, language, isRTL } = useLanguage();
    return { t, language, isRTL };
}
