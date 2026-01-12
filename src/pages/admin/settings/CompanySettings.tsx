import { useState } from 'react';
import { useSettings, useCompanySettings } from '@/contexts/SettingsContext';
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
import { Loader2 } from 'lucide-react';
import SettingsLayout from './SettingsLayout';

export default function CompanySettings() {
    const { toast } = useToast();
    const { loading: contextLoading } = useSettings();
    const { company, updateCompany } = useCompanySettings();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(company);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateCompany(formData);
            toast({ title: 'Settings Saved', description: 'Company settings have been updated.' });
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
                {/* Company Information */}
                <Card className="bg-card border-border">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-foreground">Company Information</h3>
                        <p className="text-xs text-muted-foreground">Update your company details and branding</p>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Company Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="KEP Microcredit Limited"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Company Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="info@kepmicrocredit.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Phone Number</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+255 789 670 696"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Address</Label>
                                <Input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="19 Old Forest, Mpuguso, Mbeya"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Regional Settings */}
                <Card className="bg-card border-border">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-foreground">Regional Settings</h3>
                        <p className="text-xs text-muted-foreground">Configure regional formats and timezones</p>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Currency</Label>
                                <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tanzanian Shilling (TZS)">Tanzanian Shilling (TZS)</SelectItem>
                                        <SelectItem value="US Dollar (USD)">US Dollar (USD)</SelectItem>
                                        <SelectItem value="Euro (EUR)">Euro (EUR)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Timezone</Label>
                                <Select value={formData.timezone} onValueChange={(v) => setFormData({ ...formData, timezone: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Africa/Dar_es_Salaam (GMT+3)">Africa/Dar_es_Salaam (GMT+3)</SelectItem>
                                        <SelectItem value="UTC (GMT+0)">UTC (GMT+0)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Date Format</Label>
                                <Select value={formData.date_format} onValueChange={(v) => setFormData({ ...formData, date_format: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</SelectItem>
                                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</SelectItem>
                                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground/80">Fiscal Year Start</Label>
                                <Input
                                    type="date"
                                    value={formData.fiscal_year_start || '2023-01-01'}
                                    onChange={(e) => setFormData({ ...formData, fiscal_year_start: e.target.value })}
                                />
                            </div>
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
                        Save Changes
                    </Button>
                </div>
            </div>
        </SettingsLayout>
    );
}
