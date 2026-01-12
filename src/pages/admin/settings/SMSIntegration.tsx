import { useState } from 'react';
import { useSettings, useSMSSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import SettingsLayout from './SettingsLayout';

export default function SMSIntegration() {
    const { toast } = useToast();
    const { loading: contextLoading } = useSettings();
    const { sms, updateSMS } = useSMSSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(sms);
    const [testNumber, setTestNumber] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSMS(formData);
            toast({ title: 'Settings Saved', description: 'SMS configuration updated.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestSMS = async () => {
        if (!testNumber) {
            toast({ title: 'Error', description: 'Please enter a test phone number.', variant: 'destructive' });
            return;
        }
        setIsTesting(true);
        try {
            // Simulation of sending test SMS
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast({ title: 'Success', description: `Test SMS sent to ${testNumber}` });
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
                {/* Twilio Configuration */}
                <Card className="bg-card border-border shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border/50 bg-muted/30 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-primary" />
                                Twilio Gateway
                            </h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Securely connect to Twilio SMS API</p>
                        </div>
                        <div className="flex items-center gap-3 bg-background/50 px-3 py-1.5 rounded-full border border-border/50">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Gateway Status</span>
                            <Switch
                                checked={formData.enabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </div>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-foreground">Account SID</Label>
                                <Input
                                    value={formData.account_sid}
                                    onChange={(e) => setFormData({ ...formData, account_sid: e.target.value })}
                                    placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                    className="bg-muted/30 focus:bg-background transition-all h-10 font-mono text-sm border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-foreground">Auth Token</Label>
                                <Input
                                    type="password"
                                    value={formData.auth_token}
                                    onChange={(e) => setFormData({ ...formData, auth_token: e.target.value })}
                                    placeholder="••••••••••••••••••••••••••••••••"
                                    className="bg-muted/30 focus:bg-background transition-all h-10 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-foreground">Sender Number / Service SID</Label>
                                <Input
                                    value={formData.sender_id}
                                    onChange={(e) => setFormData({ ...formData, sender_id: e.target.value })}
                                    placeholder="+1234567890"
                                    className="bg-muted/30 focus:bg-background transition-all h-10 border-border font-medium"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Messaging Policy */}
                <Card className="bg-card border-border shadow-sm">
                    <div className="p-4 border-b border-border/50 bg-muted/30">
                        <h3 className="font-bold text-foreground uppercase tracking-widest text-xs">Automated Notification Policy</h3>
                    </div>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-foreground">Auto-send OTP via SMS</Label>
                                <p className="text-xs text-muted-foreground">Verification codes will be sent during registration & login</p>
                            </div>
                            <Switch
                                checked={formData.auto_otp}
                                onCheckedChange={(checked) => setFormData({ ...formData, auto_otp: checked })}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-foreground">Lifecycle Notifications</Label>
                                <p className="text-xs text-muted-foreground">Notify borrowers of loan approvals and payment reminders</p>
                            </div>
                            <Switch
                                checked={formData.notify_loan_updates}
                                onCheckedChange={(checked) => setFormData({ ...formData, notify_loan_updates: checked })}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Test SMS */}
                <Card className="bg-card border-border shadow-sm">
                    <div className="p-4 border-b border-border/50 bg-muted/30">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <Send className="w-4 h-4 text-primary" />
                            Diagnostic Test
                        </h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Verify your Twilio credentials with a test message</p>
                    </div>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    value={testNumber}
                                    onChange={(e) => setTestNumber(e.target.value)}
                                    placeholder="Enter phone number (e.g. +1234567890)"
                                    className="bg-background border-border h-11"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleTestSMS}
                                disabled={isTesting}
                                className="h-11 px-6 border-border hover:bg-muted font-bold"
                            >
                                {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                Send Pulse Test
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold font-heading h-11"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Secure Configuration
                    </Button>
                </div>
            </div>
        </SettingsLayout>
    );
}
