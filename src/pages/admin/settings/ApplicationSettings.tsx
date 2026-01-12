import { useState } from 'react';
import { useSettings, useAppSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import SettingsLayout from './SettingsLayout';

export default function ApplicationSettings() {
    const { toast } = useToast();
    const { loading: contextLoading } = useSettings();
    const { app, updateApp } = useAppSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(app);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateApp(formData);
            toast({ title: 'Settings Saved', description: 'Application configuration updated.' });
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
                {/* Application Configuration */}
                <Card className="bg-card border-border">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-foreground">Application Configuration</h3>
                        <p className="text-xs text-muted-foreground">Global system settings and feature toggles</p>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Site Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="KEP Enterprise"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Site URL</Label>
                                <Input
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://app.kepmicrocredit.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Session Timeout (minutes)</Label>
                                <Input
                                    type="number"
                                    value={formData.session_timeout || 60}
                                    onChange={(e) => setFormData({ ...formData, session_timeout: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Toggles */}
                <Card className="bg-card border-border">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-foreground">Feature Toggles</h3>
                    </div>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium text-foreground/80">Maintenance Mode</Label>
                                <p className="text-xs text-muted-foreground">Put the site in maintenance mode. Only admins can access.</p>
                            </div>
                            <Switch
                                checked={formData.maintenance_mode}
                                onCheckedChange={(checked) => setFormData({ ...formData, maintenance_mode: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium text-foreground/80">Public Registration</Label>
                                <p className="text-xs text-muted-foreground">Allow new users to register accounts.</p>
                            </div>
                            <Switch
                                checked={formData.public_registration}
                                onCheckedChange={(checked) => setFormData({ ...formData, public_registration: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium text-foreground/80">Public Landing Page</Label>
                                <p className="text-xs text-muted-foreground">Enable the public-facing landing page.</p>
                            </div>
                            <Switch
                                checked={formData.public_landing_page}
                                onCheckedChange={(checked) => setFormData({ ...formData, public_landing_page: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium text-foreground/80">Email Verification</Label>
                                <p className="text-xs text-muted-foreground">Require email verification for new accounts.</p>
                            </div>
                            <Switch
                                checked={formData.email_verification}
                                onCheckedChange={(checked) => setFormData({ ...formData, email_verification: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium text-foreground/80">Force 2FA</Label>
                                <p className="text-xs text-muted-foreground">Require Two-Factor Authentication for all staff.</p>
                            </div>
                            <Switch
                                checked={formData.force_2fa}
                                onCheckedChange={(checked) => setFormData({ ...formData, force_2fa: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Configuration
                    </Button>
                </div>
            </div>
        </SettingsLayout>
    );
}
