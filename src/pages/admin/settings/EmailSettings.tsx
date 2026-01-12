import { useState } from 'react';
import { useSettings, useEmailSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Send } from 'lucide-react';
import SettingsLayout from './SettingsLayout';

export default function EmailSettings() {
    const { toast } = useToast();
    const { loading: contextLoading } = useSettings();
    const { email, updateEmail } = useEmailSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(email);
    const [testEmail, setTestEmail] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateEmail(formData);
            toast({ title: 'Settings Saved', description: 'Email configuration updated.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestConnection = async () => {
        if (!testEmail) {
            toast({ title: 'Error', description: 'Please enter a test email address.', variant: 'destructive' });
            return;
        }
        setIsTesting(true);
        try {
            // Simulation of sending test email
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast({ title: 'Success', description: `Test email sent to ${testEmail}` });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsTesting(false);
        }
    };

    if (contextLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <SettingsLayout>
            <div className="space-y-6">
                {/* SMTP Configuration */}
                <Card className="bg-card border-border shadow-sm">
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-foreground">SMTP Configuration</h3>
                            <p className="text-xs text-muted-foreground">Configure your outgoing email server</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Enable SMTP</span>
                            <Switch
                                checked={formData.enabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                            />
                        </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">SMTP Host</Label>
                                <Input
                                    value={formData.host}
                                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                    placeholder="smtp.gmail.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Port</Label>
                                <Input
                                    type="number"
                                    value={formData.port}
                                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                                    placeholder="587"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Username</Label>
                                <Input
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="notifications@kepmicrocredit.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Password</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Sender Name</Label>
                                <Input
                                    value={formData.sender_name}
                                    onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                                    placeholder="KEP Enterprise"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Sender Email</Label>
                                <Input
                                    type="email"
                                    value={formData.sender_email}
                                    onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                                    placeholder="no-reply@kepmicrocredit.com"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Label className="text-sm font-medium text-foreground/80">Encryption</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="encryption"
                                        checked={formData.encryption === 'tls'}
                                        onChange={() => setFormData({ ...formData, encryption: 'tls' })}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm text-muted-foreground">TLS</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="encryption"
                                        checked={formData.encryption === 'ssl'}
                                        onChange={() => setFormData({ ...formData, encryption: 'ssl' })}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm text-muted-foreground">SSL</span>
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Test Connection */}
                <Card className="bg-card border-border shadow-sm">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-foreground">Test Connection</h3>
                        <p className="text-xs text-muted-foreground">Send a test email to verify your SMTP settings</p>
                    </div>
                    <CardContent className="p-6">
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <Input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    placeholder="Enter email address"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleTestConnection}
                                disabled={isTesting}
                                className="flex-shrink-0"
                            >
                                {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                Send Test Email
                            </Button>
                        </div>
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
                        Save Configuration
                    </Button>
                </div>
            </div>
        </SettingsLayout>
    );
}
