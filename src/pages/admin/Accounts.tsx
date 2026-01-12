import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Wallet, Landmark, Banknote, Smartphone, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Account {
    id: string;
    name: string;
    account_type: 'cash' | 'bank' | 'mobile_money';
    account_number?: string;
    balance: number;
    is_active: boolean;
    created_at: string;
}

export default function Accounts() {
    const { data: accounts = [], loading, add, update, remove } = useFirestore<Account>('accounts');
    const { toast } = useToast();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        account_type: 'cash' as 'cash' | 'bank' | 'mobile_money',
        account_number: '',
        balance: 0,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            maximumFractionDigits: 0
        }).format(amount).replace('TZS', 'TSh');
    };

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'cash':
                return <Banknote className="w-5 h-5 text-gray-400" />;
            case 'bank':
                return <Landmark className="w-5 h-5 text-gray-400" />;
            case 'mobile_money':
                return <Smartphone className="w-5 h-5 text-gray-400" />;
            default:
                return <Wallet className="w-5 h-5 text-gray-400" />;
        }
    };

    const getAccountTypeBadge = (type: string) => {
        const config: Record<string, { label: string; className: string }> = {
            cash: { label: 'CASH', className: 'bg-gray-100 text-gray-600' },
            bank: { label: 'BANK', className: 'bg-blue-100 text-blue-600' },
            mobile_money: { label: 'MOBILE MONEY', className: 'bg-purple-100 text-purple-600' },
        };
        const { label, className } = config[type] || { label: type.toUpperCase(), className: 'bg-gray-100 text-gray-600' };
        return (
            <Badge className={cn("text-[10px] font-semibold px-2 py-0.5 rounded", className)}>
                {label}
            </Badge>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingAccount) {
                await update(editingAccount.id, { ...formData });
                toast({ title: 'Account Updated', description: `${formData.name} has been updated.` });
            } else {
                await add({
                    ...formData,
                    is_active: true,
                    created_at: new Date().toISOString(),
                });
                toast({ title: 'Account Created', description: `${formData.name} has been added.` });
            }
            setDialogOpen(false);
            resetForm();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (account: Account) => {
        setEditingAccount(account);
        setFormData({
            name: account.name,
            account_type: account.account_type,
            account_number: account.account_number || '',
            balance: account.balance,
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await remove(id);
                toast({ title: 'Account Deleted', description: `${name} has been removed.` });
            } catch (error: any) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            }
        }
    };

    const resetForm = () => {
        setEditingAccount(null);
        setFormData({ name: '', account_type: 'cash', account_number: '', balance: 0 });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Accounts & Wallets</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage cash, bank, and mobile money accounts</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingAccount ? 'Edit Account' : 'Add Account'}</DialogTitle>
                            <DialogDescription>
                                {editingAccount ? 'Update account details' : 'Add a new account to track funds'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Account Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Main Cash Vault"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Account Type</Label>
                                    <Select
                                        value={formData.account_type}
                                        onValueChange={(value) => setFormData({ ...formData, account_type: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank">Bank</SelectItem>
                                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Account ID</Label>
                                    <Input
                                        value={formData.account_number}
                                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                        placeholder="ACC001"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Initial Balance</Label>
                                <Input
                                    type="number"
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        editingAccount ? 'Update Account' : 'Add Account'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Account Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {accounts.length > 0 ? (
                    accounts.map((account) => (
                        <Card key={account.id} className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                {/* Header with icon and badge */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                        {getAccountIcon(account.account_type)}
                                    </div>
                                    <div className="flex gap-2">
                                        {getAccountTypeBadge(account.account_type)}
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleEdit(account)}
                                            >
                                                <Pencil className="w-3 h-3 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(account.id, account.name)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Name and ID */}
                                <div className="mb-4">
                                    <h3 className="font-semibold text-foreground text-lg">{account.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        ID: {account.account_number || `ACC${account.id.slice(0, 3).toUpperCase()}`}
                                    </p>
                                </div>

                                {/* Balance */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                                    <p className="text-2xl font-bold text-foreground">{formatCurrency(account.balance)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="col-span-full bg-card border-2 border-dashed border-border">
                        <CardContent className="p-12 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wallet className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">No accounts yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">Add your first account to start tracking funds</p>
                            <Button onClick={() => setDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Account
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
