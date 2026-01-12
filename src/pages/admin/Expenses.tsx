import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
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
import { Plus, Search, Receipt, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Expense {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
    recorded_by: string;
    created_at: string;
}

export default function Expenses() {
    const { data: expenses = [], loading, add } = useFirestore<Expense>('expenses');
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'Rent',
        description: '',
        amount: 0,
    });

    const categories = ['Rent', 'Utilities', 'Transport', 'Office Supplies', 'Salaries', 'Marketing', 'Other'];

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const filteredExpenses = expenses.filter(expense =>
        expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            maximumFractionDigits: 0,
        }).format(amount).replace('TZS', 'TSh');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            Rent: 'bg-blue-100 text-blue-700',
            Utilities: 'bg-yellow-100 text-yellow-700',
            Transport: 'bg-green-100 text-green-700',
            'Office Supplies': 'bg-purple-100 text-purple-700',
            Salaries: 'bg-pink-100 text-pink-700',
            Marketing: 'bg-orange-100 text-orange-700',
            Other: 'bg-gray-100 text-gray-600',
        };
        return (
            <Badge className={cn("font-medium text-xs", colors[category] || colors.Other)}>
                {category}
            </Badge>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await add({
                ...formData,
                recorded_by: 'Admin',
                created_at: new Date().toISOString(),
            });
            toast({
                title: 'Expense Recorded',
                description: `${formatCurrency(formData.amount)} has been added.`,
            });
            setDialogOpen(false);
            setFormData({ date: new Date().toISOString().split('T')[0], category: 'Rent', description: '', amount: 0 });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
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
                    <h1 className="text-2xl font-semibold text-foreground">Expenses</h1>
                    <p className="text-sm text-muted-foreground mt-1">Track and manage business expenses</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Record Expense</DialogTitle>
                            <DialogDescription>Add a new expense to the ledger</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Expense description..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
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
                                    ) : 'Add Expense'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Card */}
            <Card className="bg-card border border-border shadow-sm mb-6">
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-lg">
                            <Receipt className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Expenses</p>
                            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalExpenses)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search */}
            <Card className="bg-card border border-border shadow-sm mb-6">
                <CardContent className="p-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search expenses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-background border-border"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-card border border-border shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border">
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Date</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Category</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Description</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Amount</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Recorded By</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExpenses.length > 0 ? (
                                filteredExpenses.map((expense) => (
                                    <TableRow key={expense.id} className="hover:bg-muted/10 border-b border-border">
                                        <TableCell className="py-4 px-6 text-sm text-muted-foreground">
                                            {formatDate(expense.date)}
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            {getCategoryBadge(expense.category)}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-sm text-foreground">
                                            {expense.description}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-sm font-medium text-red-600">
                                            -{formatCurrency(expense.amount)}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-sm text-muted-foreground">
                                            {expense.recorded_by || 'Admin'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                        No expenses found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
