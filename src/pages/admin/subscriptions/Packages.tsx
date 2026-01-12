import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import type { Subscription, SubscriptionInsert } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Check, Package, Star, Zap } from 'lucide-react';

const billingCycles = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'lifetime', label: 'Lifetime' },
];

export default function SubscriptionPackages() {
    const { toast } = useToast();
    const { data: packages, loading, add, update, remove } = useFirestore<Subscription>('subscriptions', { orderByField: 'price', orderDirection: 'asc' });

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Subscription | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const emptyForm: {
        name: string,
        description: string,
        price: number,
        billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime',
        features: string,
        max_users: number,
        max_branches: number,
        max_loans: number,
        is_active: boolean,
        is_popular: boolean
    } = { name: '', description: '', price: 0, billing_cycle: 'monthly', features: '', max_users: 1, max_branches: 1, max_loans: 100, is_active: true, is_popular: false };
    const [formData, setFormData] = useState(emptyForm);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const handleCreate = async () => {
        if (!formData.name || formData.price < 0) {
            toast({ title: 'Validation Error', description: 'Fill all required fields.', variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        try {
            const data: SubscriptionInsert = {
                ...formData,
                features: formData.features.split('\n').filter(f => f.trim()),
            };
            await add(data);
            toast({ title: 'Package Created' });
            setFormData(emptyForm);
            setIsCreateOpen(false);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedPackage) return;
        setIsSubmitting(true);
        try {
            await update(selectedPackage.id, {
                ...formData,
                features: typeof formData.features === 'string' ? formData.features.split('\n').filter(f => f.trim()) : formData.features,
            });
            toast({ title: 'Package Updated' });
            setIsEditOpen(false);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (pkg: Subscription) => {
        if (!confirm('Delete this package?')) return;
        try {
            await remove(pkg.id);
            toast({ title: 'Package Deleted' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const openEditDialog = (pkg: Subscription) => {
        setSelectedPackage(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description || '',
            price: pkg.price,
            billing_cycle: pkg.billing_cycle,
            features: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
            max_users: pkg.max_users || 1,
            max_branches: pkg.max_branches || 1,
            max_loans: pkg.max_loans || 100,
            is_active: pkg.is_active,
            is_popular: pkg.is_popular || false,
        });
        setIsEditOpen(true);
    };

    if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const PackageForm = () => (
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Package Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Pro Plan" /></div>
                <div className="grid gap-2"><Label>Billing Cycle *</Label><Select value={formData.billing_cycle} onValueChange={(v: any) => setFormData({ ...formData, billing_cycle: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{billingCycles.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Price (USD) *</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} /></div>
                <div className="grid gap-2"><Label>Max Users</Label><Input type="number" value={formData.max_users} onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) || 1 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Max Branches</Label><Input type="number" value={formData.max_branches} onChange={(e) => setFormData({ ...formData, max_branches: parseInt(e.target.value) || 1 })} /></div>
                <div className="grid gap-2"><Label>Max Loans</Label><Input type="number" value={formData.max_loans} onChange={(e) => setFormData({ ...formData, max_loans: parseInt(e.target.value) || 100 })} /></div>
            </div>
            <div className="grid gap-2"><Label>Features (one per line)</Label><Textarea value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} rows={4} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" /></div>
            <div className="flex items-center justify-between"><div><Label>Mark as Popular</Label><p className="text-sm text-muted-foreground">Highlight this plan</p></div><Switch checked={formData.is_popular} onCheckedChange={(v) => setFormData({ ...formData, is_popular: v })} /></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Subscription Packages</h1>
                    <p className="text-muted-foreground mt-1">Manage and configure your pricing plans</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setFormData(emptyForm)} className="shadow-lg hover:shadow-primary/20 transition-all">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Package
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Package</DialogTitle>
                        </DialogHeader>
                        <PackageForm />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Package'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                    <Card
                        key={pkg.id}
                        className={`relative overflow-hidden group transition-all hover:shadow-xl ${pkg.is_popular
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                            : 'bg-card'
                            }`}
                    >
                        {pkg.is_popular && (
                            <div className="absolute top-0 right-0">
                                <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-8 py-1 rotate-45 translate-x-6 translate-y-2 shadow-sm">
                                    Popular
                                </div>
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg ${pkg.is_popular ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <Package className="w-5 h-5" />
                                </div>
                                <Badge
                                    variant={pkg.is_active ? 'outline' : 'secondary'}
                                    className={pkg.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                                >
                                    {pkg.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px]">{pkg.description || 'No description provided'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-foreground">{formatCurrency(pkg.price)}</span>
                                <span className="text-muted-foreground font-medium">/{pkg.billing_cycle}</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border/50">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Zap className="w-4 h-4 text-primary" />
                                        <span className="text-muted-foreground">Team Size</span>
                                    </div>
                                    <span className="font-bold text-foreground text-sm">{pkg.max_users} Users</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border/50">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Zap className="w-4 h-4 text-primary" />
                                        <span className="text-muted-foreground">Branches</span>
                                    </div>
                                    <span className="font-bold text-foreground text-sm">{pkg.max_branches}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border/50">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Zap className="w-4 h-4 text-primary" />
                                        <span className="text-muted-foreground">Active Loans</span>
                                    </div>
                                    <span className="font-bold text-foreground text-sm">{pkg.max_loans}</span>
                                </div>
                            </div>

                            {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-border">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">What's Included</p>
                                    <div className="space-y-3">
                                        {(pkg.features as string[]).map((f, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                <div className="mt-1 w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-2.5 h-2.5 text-green-500" />
                                                </div>
                                                <span className="text-foreground/80 leading-tight">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(pkg)}
                                className="flex-1 hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(pkg)}
                                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors px-3"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {packages.length === 0 && (
                    <div className="col-span-full py-20 bg-muted/30 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center">
                        <Package className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-bold text-foreground">No Packages Yet</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mt-1">Get started by creating your first subscription plan.</p>
                        <Button variant="outline" className="mt-6" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Package
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Package</DialogTitle>
                    </DialogHeader>
                    <PackageForm />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
