import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { hexToHSL } from '@/lib/utils';
import type { Setting, Json } from '@/lib/database.types';

interface CompanySettings {
    name: string;
    logo_url: string | null;
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    tax_number: string;
    currency: string;
    currency_symbol: string;
    date_format: string;
    timezone: string;
    fiscal_year_start?: string;
}

interface AppSettings {
    name: string;
    url: string;
    landing_page_enabled: boolean;
    register_page_enabled: boolean;
    pricing_enabled: boolean;
    maintenance_mode: boolean;
    public_registration: boolean;
    public_landing_page: boolean;
    email_verification: boolean;
    force_2fa: boolean;
    default_language: string;
    default_theme: 'light' | 'dark' | 'system';
    default_rtl: boolean;
    recaptcha_enabled: boolean;
    recaptcha_site_key: string;
    session_timeout: number;
}

interface EmailSettings {
    enabled: boolean;
    host: string;
    port: number;
    username: string;
    password: string;
    encryption: 'tls' | 'ssl' | 'none';
    sender_name: string;
    sender_email: string;
    provider: 'smtp' | 'sendgrid' | 'mailgun';
    verification_enabled: boolean;
    notification_enabled: boolean;
}

interface SMSSettings {
    enabled: boolean;
    provider: 'twilio' | 'infobip';
    account_sid: string;
    auth_token: string;
    sender_id: string;
    auto_otp: boolean;
    notify_loan_updates: boolean;
}

interface SEOSettings {
    site_title: string;
    site_description: string;
    meta_keywords: string;
    og_image: string;
    twitter_handle: string;
    google_analytics_id: string;
}

interface SecuritySettings {
    password_policy: {
        min_length: number;
        require_uppercase: boolean;
        require_numbers: boolean;
        require_special_char: boolean;
    };
    mfa_enabled: boolean;
    lockout_enabled: boolean;
    max_failed_attempts: number;
    lockout_duration: number;
    two_factor_enabled: boolean;
    session_timeout_minutes: number;
}

interface StorageSettings {
    provider: 'local' | 'firebase' | 'aws' | 'wasabi';
    access_key: string;
    secret_key: string;
    bucket: string;
    region: string;
    max_file_size: number;
    allowed_extensions: string;
}

interface ThemeSettings {
    mode: 'light' | 'dark' | 'system';
    primary_color: string;
    secondary_color: string;
    font_family: string;
    direction: 'ltr' | 'rtl';
    border_radius: string;
}

interface AllSettings {
    company: CompanySettings;
    app: AppSettings;
    email: EmailSettings;
    sms: SMSSettings;
    seo: SEOSettings;
    security: SecuritySettings;
    storage: StorageSettings;
    theme: ThemeSettings;
}

const defaultSettings: AllSettings = {
    company: {
        name: 'FundX',
        logo_url: null,
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        tax_number: '',
        currency: 'Tanzanian Shilling (TZS)',
        currency_symbol: 'TSh',
        date_format: 'DD/MM/YYYY',
        timezone: 'Africa/Dar_es_Salaam (GMT+3)',
        fiscal_year_start: '2023-01-01'
    },
    app: {
        name: 'FundX',
        url: 'http://localhost:8081',
        landing_page_enabled: true,
        register_page_enabled: true,
        pricing_enabled: true,
        maintenance_mode: false,
        public_registration: true,
        public_landing_page: true,
        email_verification: false,
        force_2fa: false,
        default_language: 'en',
        default_theme: 'system',
        default_rtl: false,
        recaptcha_enabled: false,
        recaptcha_site_key: '',
        session_timeout: 60
    },
    email: {
        enabled: false,
        host: '',
        port: 587,
        username: '',
        password: '',
        encryption: 'tls',
        sender_name: 'FundX',
        sender_email: 'noreply@fundx.com',
        provider: 'smtp',
        verification_enabled: false,
        notification_enabled: true
    },
    sms: {
        enabled: false,
        provider: 'twilio',
        account_sid: '',
        auth_token: '',
        sender_id: '',
        auto_otp: false,
        notify_loan_updates: false
    },
    seo: {
        site_title: 'FundX - Loan Management System',
        site_description: 'Comprehensive loan management solution for microfinance institutions',
        meta_keywords: 'loan, microfinance, lending, finance',
        og_image: '',
        twitter_handle: '',
        google_analytics_id: ''
    },
    security: {
        password_policy: {
            min_length: 8,
            require_uppercase: true,
            require_numbers: true,
            require_special_char: false
        },
        mfa_enabled: false,
        lockout_enabled: true,
        max_failed_attempts: 5,
        lockout_duration: 30,
        two_factor_enabled: true,
        session_timeout_minutes: 60
    },
    storage: {
        provider: 'firebase',
        access_key: '',
        secret_key: '',
        bucket: '',
        region: 'us-east-1',
        max_file_size: 10,
        allowed_extensions: 'pdf,jpg,png,doc,docx'
    },
    theme: {
        mode: 'light',
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        font_family: 'Inter',
        direction: 'ltr',
        border_radius: '0.5rem'
    }
};

interface SettingsContextType {
    settings: AllSettings;
    loading: boolean;
    error: Error | null;
    updateSettings: <K extends keyof AllSettings>(category: K, values: Partial<AllSettings[K]>) => Promise<void>;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AllSettings>(() => {
        // Try to load from localStorage for immediate theme apply on refresh
        const saved = localStorage.getItem('fundx_settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { user } = useAuth();

    // Persist to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem('fundx_settings', JSON.stringify(settings));
    }, [settings]);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const settingsRef = collection(db, 'settings');
            const snapshot = await getDocs(settingsRef);

            const loadedSettings = { ...defaultSettings };

            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data() as Setting;
                const category = data.category as keyof AllSettings;
                if (category && category in loadedSettings) {
                    (loadedSettings as Record<string, object>)[category] = {
                        ...(loadedSettings as Record<string, object>)[category],
                        ...(data.value as object)
                    };
                }
            });

            setSettings(loadedSettings);
        } catch (err) {
            console.error('Error fetching settings:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = useCallback(async <K extends keyof AllSettings>(
        category: K,
        values: Partial<AllSettings[K]>
    ): Promise<void> => {
        try {
            const settingsRef = collection(db, 'settings');
            const q = query(settingsRef, where('category', '==', category));
            const snapshot = await getDocs(q);

            const newValue = {
                ...settings[category],
                ...values
            };

            if (snapshot.empty) {
                // Create new setting
                await setDoc(doc(settingsRef), {
                    category,
                    key: category,
                    value: newValue as Json,
                    updated_by: user?.uid || null,
                    updated_at: new Date().toISOString()
                });
            } else {
                // Update existing setting
                const docRef = snapshot.docs[0].ref;
                await updateDoc(docRef, {
                    value: newValue as Json,
                    updated_by: user?.uid || null,
                    updated_at: new Date().toISOString()
                });
            }

            setSettings(prev => ({
                ...prev,
                [category]: newValue
            }));
        } catch (err) {
            console.error(`Error updating ${category} settings:`, err);
            throw err;
        }
    }, [settings, user]);

    const refreshSettings = useCallback(async () => {
        await fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Apply Theme Settings
    useEffect(() => {
        const root = window.document.documentElement;

        // Dark Mode
        if (settings.theme.mode === 'dark') {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else if (settings.theme.mode === 'light') {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        } else {
            // System preference
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
                root.classList.add('dark');
                root.style.colorScheme = 'dark';
            } else {
                root.classList.remove('dark');
                root.style.colorScheme = 'light';
            }
        }

        // Primary Color - Convert hex to HSL for Tailwind variables
        if (settings.theme.primary_color) {
            const hslValue = hexToHSL(settings.theme.primary_color);
            root.style.setProperty('--primary', hslValue);
        }

        // Font Family
        if (settings.theme.font_family) {
            const font = settings.theme.font_family;
            if (font.includes('Inter')) {
                root.style.setProperty('--font-body', "'Inter', sans-serif");
            } else if (font.includes('Roboto')) {
                root.style.setProperty('--font-body', "'Roboto', sans-serif");
            } else if (font.includes('Outfit')) {
                root.style.setProperty('--font-body', "'Outfit', sans-serif");
            }
        }

        // Direction
        if (settings.theme.direction) {
            root.dir = settings.theme.direction;
        }

    }, [settings.theme.mode, settings.theme.primary_color, settings.theme.font_family, settings.theme.direction]);

    return (
        <SettingsContext.Provider value={{ settings, loading, error, updateSettings, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export function useCompanySettings() {
    const { settings, updateSettings } = useSettings();
    return {
        company: settings.company,
        updateCompany: (values: Partial<CompanySettings>) => updateSettings('company', values)
    };
}

export function useAppSettings() {
    const { settings, updateSettings } = useSettings();
    return {
        app: settings.app,
        updateApp: (values: Partial<AppSettings>) => updateSettings('app', values)
    };
}

export function useEmailSettings() {
    const { settings, updateSettings } = useSettings();
    return {
        email: settings.email,
        updateEmail: (values: Partial<EmailSettings>) => updateSettings('email', values)
    };
}

export function useSMSSettings() {
    const { settings, updateSettings } = useSettings();
    return {
        sms: settings.sms,
        updateSMS: (values: Partial<SMSSettings>) => updateSettings('sms', values)
    };
}

export function useSEOSettings() {
    const { settings, updateSettings } = useSettings();
    return {
        seo: settings.seo,
        updateSEO: (values: Partial<SEOSettings>) => updateSettings('seo', values)
    };
}

export function useSecuritySettings() {
    const { settings, updateSettings } = useSettings();
    return {
        security: settings.security,
        updateSecurity: (values: Partial<SecuritySettings>) => updateSettings('security', values)
    };
}

export function useStorageSettings() {
    const { settings, updateSettings } = useSettings();
    return {
        storage: settings.storage,
        updateStorage: (values: Partial<StorageSettings>) => updateSettings('storage', values)
    };
}

export function useThemeSettings() {
    const { settings, updateSettings } = useSettings();
    return {
        theme: settings.theme,
        updateTheme: (values: Partial<ThemeSettings>) => updateSettings('theme', values)
    };
}

export type {
    CompanySettings,
    AppSettings,
    EmailSettings,
    SMSSettings,
    SEOSettings,
    SecuritySettings,
    StorageSettings,
    ThemeSettings,
    AllSettings
};
