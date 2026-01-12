import { useState } from 'react';
import { useSettings, useStorageSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Loader2, HardDrive, Shield } from 'lucide-react';
import SettingsLayout from './SettingsLayout';

export default function StorageSettings() {
    const { toast } = useToast();
    const { loading: contextLoading } = useSettings();
    const { storage, updateStorage } = useStorageSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(storage);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateStorage(formData);
            toast({ title: 'Settings Saved', description: 'Cloud storage configuration updated.' });
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
                {/* Storage Provider */}
                <Card className="bg-card border-border shadow-sm">
                    <div className="p-4 border-b border-border/50 bg-muted/30">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-primary" />
                            Storage Provider
                        </h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Select where to store application files and documents</p>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2 max-w-md">
                            <Label className="text-sm font-bold text-foreground">Service Provider</Label>
                            <Select value={formData.provider} onValueChange={(v) => setFormData({ ...formData, provider: v as any })}>
                                <SelectTrigger className="bg-background border-border h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="firebase">Firebase Storage (Built-in)</SelectItem>
                                    <SelectItem value="aws">AWS S3 (Standard Cloud)</SelectItem>
                                    <SelectItem value="wasabi">Wasabi Cloud Storage</SelectItem>
                                    <SelectItem value="local">Local Development Cache (Dev only)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.provider !== 'firebase' && formData.provider !== 'local' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50 mt-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                                        Access Key ID
                                    </Label>
                                    <Input
                                        value={formData.access_key}
                                        onChange={(e) => setFormData({ ...formData, access_key: e.target.value })}
                                        placeholder="AKIA..."
                                        className="bg-muted/30 focus:bg-background transition-all h-10 font-mono text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground">Secret Access Key</Label>
                                    <Input
                                        type="password"
                                        value={formData.secret_key}
                                        onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                                        placeholder="••••••••••••"
                                        className="bg-muted/30 focus:bg-background transition-all h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground">Bucket Name</Label>
                                    <Input
                                        value={formData.bucket}
                                        onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                                        placeholder="fundx-storage-bucket"
                                        className="bg-muted/30 focus:bg-background transition-all h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground text-foreground">Region</Label>
                                    <Input
                                        value={formData.region}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        placeholder="us-east-1"
                                        className="bg-muted/30 focus:bg-background transition-all h-10"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upload Limits */}
                <Card className="bg-card border-border shadow-sm">
                    <div className="p-4 border-b border-border/50 bg-muted/30">
                        <h3 className="font-bold text-foreground uppercase tracking-widest text-xs">Upload Policy & Limits</h3>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-foreground">Max File Size (MB)</Label>
                                <Input
                                    type="number"
                                    value={formData.max_file_size || 10}
                                    onChange={(e) => setFormData({ ...formData, max_file_size: parseInt(e.target.value) })}
                                    className="bg-muted/30 focus:bg-background h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-foreground">Allowed File Extensions</Label>
                                <Input
                                    value={formData.allowed_extensions || 'pdf,jpg,png,doc,docx'}
                                    onChange={(e) => setFormData({ ...formData, allowed_extensions: e.target.value })}
                                    className="bg-muted/30 focus:bg-background h-10 font-medium"
                                    placeholder="e.g. pdf, jpg, docx"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Separate multiple extensions with commas</p>
                            </div>
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
                        Update Infrastructure
                    </Button>
                </div>
            </div>
        </SettingsLayout>
    );
}
