import { useState, useEffect } from 'react';
import { useSettings, useThemeSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Monitor, Moon, Sun, Check } from 'lucide-react';
import SettingsLayout from './SettingsLayout';
import { cn } from '@/lib/utils';

export default function AppearanceSettings() {
    const { toast } = useToast();
    const { loading: contextLoading } = useSettings();
    const { theme, updateTheme } = useThemeSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(theme);

    // Sync formData with theme when it's loaded from context
    useEffect(() => {
        setFormData(theme);
    }, [theme]);

    const colors = [
        { name: 'Blue', value: '#3B82F6', hsl: '217 91% 60%' },
        { name: 'Green', value: '#10B981', hsl: '161 84% 39%' },
        { name: 'Purple', value: '#8B5CF6', hsl: '262 83% 58%' },
        { name: 'Red', value: '#EF4444', hsl: '0 84% 60%' },
        { name: 'Dark', value: '#1E293B', hsl: '215 25% 27%' },
    ];

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateTheme(formData);
            toast({ title: 'Theme Updated', description: 'Appearance settings have been saved.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (contextLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <SettingsLayout>
            <div className="space-y-6">
                <Card className="bg-card border-border shadow-md">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <h3 className="font-bold text-lg text-foreground tracking-tight">Appearance</h3>
                        <p className="text-sm text-muted-foreground">Customize the look and feel of the application</p>
                    </div>
                    <CardContent className="p-6 space-y-10">
                        {/* Theme Mode */}
                        <div className="space-y-4">
                            <Label className="text-sm font-bold text-foreground">Theme Mode</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <button
                                    onClick={() => setFormData({ ...formData, mode: 'light' })}
                                    className={cn(
                                        "relative aspect-video rounded-xl border-2 p-1 overflow-hidden transition-all group",
                                        formData.mode === 'light' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="w-full h-full bg-slate-50 rounded-lg flex flex-col gap-2 p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-slate-200" />
                                            <div className="w-12 h-2 rounded bg-slate-200" />
                                        </div>
                                        <div className="w-full h-8 rounded bg-white shadow-sm border border-slate-100" />
                                        <div className="flex items-center gap-2 mt-auto">
                                            <div className="w-8 h-8 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20" />
                                            <div className="w-20 h-4 rounded bg-slate-200" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors" />
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white text-slate-800 px-3 py-1.5 rounded-full shadow-lg border border-slate-100">
                                        <Sun className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Light</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setFormData({ ...formData, mode: 'dark' })}
                                    className={cn(
                                        "relative aspect-video rounded-xl border-2 p-1 overflow-hidden transition-all group",
                                        formData.mode === 'dark' ? "border-primary bg-slate-900" : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="w-full h-full bg-slate-950 rounded-lg flex flex-col gap-2 p-3 text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-slate-800" />
                                            <div className="w-12 h-2 rounded bg-slate-800" />
                                        </div>
                                        <div className="w-full h-8 rounded bg-slate-900 shadow-sm border border-slate-800" />
                                        <div className="flex items-center gap-2 mt-auto">
                                            <div className="w-8 h-8 rounded-full bg-primary shadow-lg shadow-primary/20" />
                                            <div className="w-20 h-4 rounded bg-slate-800" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.05] transition-colors" />
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-900 text-slate-200 px-3 py-1.5 rounded-full shadow-lg border border-slate-800">
                                        <Moon className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Dark</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setFormData({ ...formData, mode: 'system' })}
                                    className={cn(
                                        "relative aspect-video rounded-xl border-2 p-1 overflow-hidden transition-all group",
                                        formData.mode === 'system' ? "border-primary bg-slate-100 dark:bg-slate-800" : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="w-full h-full rounded-lg flex overflow-hidden">
                                        <div className="w-1/2 bg-slate-50 p-3 flex flex-col gap-2">
                                            <div className="w-4 h-4 rounded-full bg-slate-200" />
                                            <div className="w-full h-8 rounded bg-white shadow-sm border border-slate-100" />
                                        </div>
                                        <div className="w-1/2 bg-slate-950 p-3 flex flex-col gap-2">
                                            <div className="w-4 h-4 rounded-full bg-slate-800" />
                                            <div className="w-full h-8 rounded bg-slate-900 shadow-sm border border-slate-800" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-full shadow-lg border border-slate-100 dark:border-slate-800">
                                        <Monitor className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">System</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Primary Color */}
                        <div className="space-y-4">
                            <Label className="text-sm font-bold text-foreground">Brand Color</Label>
                            <div className="flex flex-wrap gap-4">
                                {colors.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => setFormData({ ...formData, primary_color: color.value })}
                                        className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110",
                                            formData.primary_color === color.value ? "ring-4 ring-offset-4 ring-primary ring-offset-background scale-110" : "opacity-80 hover:opacity-100"
                                        )}
                                        style={{ backgroundColor: color.value }}
                                    >
                                        {formData.primary_color === color.value && <Check className="w-6 h-6 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-foreground">Font Family</Label>
                                <Select value={formData.font_family} onValueChange={(v) => setFormData({ ...formData, font_family: v })}>
                                    <SelectTrigger className="h-11 bg-background border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Inter (Modern)">Inter (Modern)</SelectItem>
                                        <SelectItem value="Roboto (Classic)">Roboto (Classic)</SelectItem>
                                        <SelectItem value="Outfit (Geometric)">Outfit (Geometric)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-foreground">Layout Direction</Label>
                                <Select value={formData.direction} onValueChange={(v) => setFormData({ ...formData, direction: v as 'ltr' | 'rtl' })}>
                                    <SelectTrigger className="h-11 bg-background border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ltr">LT-RT (Left to Right)</SelectItem>
                                        <SelectItem value="rtl">RT-LT (Right to Left)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="lg"
                        className="px-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold tracking-tight rounded-xl py-6"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        Apply Theme
                    </Button>
                </div>
            </div>
        </SettingsLayout>
    );
}
