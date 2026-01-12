import { useState } from 'react';
import { useSettings, useSecuritySettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import SettingsLayout from './SettingsLayout';

export default function SecuritySettings() {
    const { toast } = useToast();
    const { loading: contextLoading } = useSettings();
    const { security, updateSecurity } = useSecuritySettings();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(security);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSecurity(formData);
            toast({ title: 'Settings Saved', description: 'Security policies updated.' });
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
                {/* Password Policy */}
                <Card className="bg-card border-border shadow-sm">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-foreground">Password Policy</h3>
                        <p className="text-xs text-muted-foreground">Define requirements for user passwords</p>
                    </div>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Minimum Password Length</Label>
                                <Input
                                    type="number"
                                    value={formData.password_policy?.min_length || 8}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        password_policy: { ...formData.password_policy, min_length: parseInt(e.target.value) }
                                    })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium text-foreground/80">Require Uppercase</Label>
                                    <p className="text-xs text-muted-foreground">At least one uppercase letter (A-Z)</p>
                                </div>
                                <Switch
                                    checked={formData.password_policy?.require_uppercase}
                                    onCheckedChange={(checked) => setFormData({
                                        ...formData,
                                        password_policy: { ...formData.password_policy, require_uppercase: checked }
                                    })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium text-foreground/80">Require Numbers</Label>
                                    <p className="text-xs text-muted-foreground">At least one numerical digit (0-9)</p>
                                </div>
                                <Switch
                                    checked={formData.password_policy?.require_numbers}
                                    onCheckedChange={(checked) => setFormData({
                                        ...formData,
                                        password_policy: { ...formData.password_policy, require_numbers: checked }
                                    })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium text-foreground/80">Require Special Characters</Label>
                                    <p className="text-xs text-muted-foreground">At least one special character (!, @, #, etc.)</p>
                                </div>
                                <Switch
                                    checked={formData.password_policy?.require_special_char}
                                    onCheckedChange={(checked) => setFormData({
                                        ...formData,
                                        password_policy: { ...formData.password_policy, require_special_char: checked }
                                    })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Authentication Security */}
                <Card className="bg-card border-border shadow-sm">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-foreground">Authentication Security</h3>
                    </div>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium text-foreground/80">Multi-Factor Authentication (MFA)</Label>
                                <p className="text-xs text-muted-foreground">Require staff to use MFA for account access</p>
                            </div>
                            <Switch
                                checked={formData.mfa_enabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, mfa_enabled: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium text-foreground/80">Failed Login Lockout</Label>
                                <p className="text-xs text-muted-foreground">Lock accounts after multiple failed attempts</p>
                            </div>
                            <Switch
                                checked={formData.lockout_enabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, lockout_enabled: checked })}
                            />
                        </div>

                        {formData.lockout_enabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground/80">Max Failed Attempts</Label>
                                    <Input
                                        type="number"
                                        value={formData.max_failed_attempts || 5}
                                        onChange={(e) => setFormData({ ...formData, max_failed_attempts: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground/80">Lockout Duration (minutes)</Label>
                                    <Input
                                        type="number"
                                        value={formData.lockout_duration || 30}
                                        onChange={(e) => setFormData({ ...formData, lockout_duration: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Security Rules
                    </Button>
                </div>
            </div>
        </SettingsLayout>
    );
}
