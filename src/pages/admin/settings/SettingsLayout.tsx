import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    Building2,
    Settings,
    Palette,
    Mail,
    CreditCard,
    ShieldCheck,
    HardDrive,
    MessageSquare
} from 'lucide-react';

const menuItems = [
    { id: 'company', label: 'Company Settings', icon: Building2, path: '/admin/settings/company', description: 'Manage company details' },
    { id: 'application', label: 'Application', icon: Settings, path: '/admin/settings/application', description: 'Site configuration & mode' },
    { id: 'theme', label: 'Theme & UI', icon: Palette, path: '/admin/settings/appearance', description: 'Look and feel customization' },
    { id: 'email', label: 'Email Configuration', icon: Mail, path: '/admin/settings/email', description: 'SMTP & templates' },
    { id: 'payment', label: 'Payment Gateways', icon: CreditCard, path: '/admin/settings/payment', description: 'Stripe, PayPal, Flutterwave' },
    { id: 'security', label: 'Security', icon: ShieldCheck, path: '/admin/settings/security', description: '2FA & access control' },
    { id: 'storage', label: 'Storage', icon: HardDrive, path: '/admin/settings/storage', description: 'Cloud storage settings' },
    { id: 'sms', label: 'SMS Integration', icon: MessageSquare, path: '/admin/settings/sms', description: 'Twilio configuration' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">System Settings</h1>
                <p className="text-muted-foreground text-sm">Manage your enterprise platform configuration</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="w-full lg:w-72 flex-shrink-0">
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <nav className="flex flex-col">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigate(item.path)}
                                        className={cn(
                                            "flex items-start gap-3 p-4 text-left transition-colors border-l-2",
                                            isActive
                                                ? "bg-primary/5 border-primary text-primary"
                                                : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        )}
                                    >
                                        <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", isActive ? "text-primary" : "text-muted-foreground")} />
                                        <div>
                                            <div className={cn("text-sm font-medium", isActive ? "text-primary font-semibold" : "text-foreground")}>
                                                {item.label}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                                                {item.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
