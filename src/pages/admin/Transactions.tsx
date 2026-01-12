import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { cn } from '@/lib/utils';
import type { Transaction, Account } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    TrendingDown,
    History,
    Wallet,
    ArrowRightLeft,
    Filter,
    Calendar,
    Hash,
    Info,
    Loader2,
    Banknote
} from 'lucide-react';

const categoryLabels: Record<string, string> = {
    loan_disbursement: 'Loan Disbursement',
    loan_repayment: 'Loan Repayment',
    expense: 'Expense',
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    transfer: 'Transfer',
    other: 'Other',
};

const categoryIcons: Record<string, any> = {
    loan_disbursement: Banknote,
    loan_repayment: History,
    expense: TrendingDown,
    deposit: TrendingUp,
    withdrawal: ArrowUpRight,
    transfer: ArrowRightLeft,
    other: Info,
};

export default function Transactions() {
    const { data: transactions, loading } = useFirestore<Transaction>('transactions', {
        orderByField: 'created_at',
        orderDirection: 'desc'
    });
    const { data: accounts = [] } = useFirestore<Account>('accounts');

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.reference?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const totalCredits = transactions.filter(tx => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0);
    const totalDebits = transactions.filter(tx => tx.type === 'debit').reduce((sum, tx) => sum + tx.amount, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            maximumFractionDigits: 0,
        }).format(amount).replace('TZS', 'TSh');
    };

    const getAccountName = (accountId: string) => accounts.find(a => a.id === accountId)?.name || 'Unknown Entity';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-ping absolute"></div>
                    <div className="h-16 w-16 rounded-full border-4 border-t-primary animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <History className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transaction Audit</h1>
                    </div>
                    <p className="text-muted-foreground text-lg ml-11">Immutable ledger of all institutional capital flows and settlements.</p>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-card border-border shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden border-l-4 border-l-emerald-500">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-emerald-500 transition-colors">Aggregate Inflow</p>
                                    <p className="text-2xl font-black text-emerald-500 tracking-tighter">{formatCurrency(totalCredits)}</p>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-500/60 bg-emerald-500/5 px-2 py-1 rounded-md w-fit border border-emerald-500/10">
                                    <TrendingUp className="w-3 h-3" />
                                    TOTAL CREDITS
                                </div>
                            </div>
                            <div className="p-3 bg-emerald-500/5 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
                                <ArrowDownLeft className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden border-l-4 border-l-destructive">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-destructive transition-colors">Aggregate Outflow</p>
                                    <p className="text-2xl font-black text-destructive tracking-tighter">{formatCurrency(totalDebits)}</p>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-black text-destructive/60 bg-destructive/5 px-2 py-1 rounded-md w-fit border border-destructive/10">
                                    <TrendingDown className="w-3 h-3" />
                                    TOTAL DEBITS
                                </div>
                            </div>
                            <div className="p-3 bg-destructive/5 rounded-xl group-hover:bg-destructive/10 transition-colors">
                                <ArrowUpRight className="w-6 h-6 text-destructive" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden border-l-4 border-l-primary">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">Net Capital Flow</p>
                                    <p className={cn(
                                        "text-2xl font-black tracking-tighter",
                                        (totalCredits - totalDebits >= 0 ? "text-primary" : "text-destructive")
                                    )}>
                                        {formatCurrency(totalCredits - totalDebits)}
                                    </p>
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1.5 text-xs font-black px-2 py-1 rounded-md w-fit border transition-colors",
                                    (totalCredits - totalDebits >= 0
                                        ? "text-primary/60 bg-primary/5 border-primary/10"
                                        : "text-destructive/60 bg-destructive/5 border-destructive/10")
                                )}>
                                    <Wallet className="w-3 h-3" />
                                    REMAINING BALANCE
                                </div>
                            </div>
                            <div className={cn(
                                "p-3 rounded-xl transition-colors",
                                (totalCredits - totalDebits >= 0 ? "bg-primary/5 group-hover:bg-primary/10" : "bg-destructive/5 group-hover:bg-destructive/10")
                            )}>
                                <Wallet className={cn("w-6 h-6", (totalCredits - totalDebits >= 0 ? "text-primary" : "text-destructive"))} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Integrated Search & Table */}
            <Card className="bg-card border-border shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="bg-muted/20 border-b border-border/50 px-8 py-6">
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search audit trail by description or reference hash..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 bg-muted/30 border-border h-12 focus:bg-background transition-all font-medium rounded-xl ring-offset-background placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <Filter className="w-3 h-3" /> Filter By
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full lg:w-[180px] h-12 bg-muted/30 border-border font-bold rounded-xl ring-offset-background">
                                    <SelectValue placeholder="Journal Type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border bg-card">
                                    <SelectItem value="all" className="rounded-lg">All Flow Types</SelectItem>
                                    <SelectItem value="credit" className="rounded-lg">Credits (Inflows)</SelectItem>
                                    <SelectItem value="debit" className="rounded-lg">Debits (Outflows)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/10 border-b border-border/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="py-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Timestamp</TableHead>
                                    <TableHead className="py-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Audit Badge</TableHead>
                                    <TableHead className="py-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Protocol Class</TableHead>
                                    <TableHead className="py-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Institutional Account</TableHead>
                                    <TableHead className="py-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Description Ledger</TableHead>
                                    <TableHead className="py-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Capital Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-24">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <History className="w-12 h-12" />
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black uppercase tracking-[0.2em]">Audit Trail Empty</p>
                                                    <p className="text-[10px] font-bold">No synchronization matches for current parameters.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((tx) => {
                                        const CategoryIcon = categoryIcons[tx.category] || Info;
                                        return (
                                            <TableRow key={tx.id} className="group border-border/50 hover:bg-muted/20 transition-all duration-200">
                                                <TableCell className="py-5 px-8">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                        <Calendar className="w-3 h-3 opacity-40" />
                                                        {new Date(tx.created_at).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5 px-8">
                                                    <Badge variant="outline" className={cn(
                                                        "font-black uppercase tracking-[0.15em] text-[9px] px-2.5 py-1 rounded-full flex items-center w-fit border-transparent transition-all",
                                                        tx.type === 'credit'
                                                            ? 'bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/20'
                                                            : 'bg-destructive/10 text-destructive group-hover:bg-destructive/20'
                                                    )}>
                                                        {tx.type === 'credit' ? (
                                                            <><ArrowDownLeft className="w-3 h-3 mr-1.5 opacity-60" />Credit</>
                                                        ) : (
                                                            <><ArrowUpRight className="w-3 h-3 mr-1.5 opacity-60" />Debit</>
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-5 px-8">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-1.5 bg-muted rounded-md border border-border/50 group-hover:bg-background transition-colors">
                                                            <CategoryIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                        </div>
                                                        <span className="text-xs font-black text-foreground/80 lowercase tracking-tight">
                                                            {categoryLabels[tx.category] || tx.category}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5 px-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-primary/20" />
                                                        <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{getAccountName(tx.account_id)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5 px-8">
                                                    <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                                        <Info className="w-3.5 h-3.5 text-muted-foreground/30" />
                                                        <span className="max-w-[180px] truncate text-xs font-bold text-muted-foreground/80">{tx.description || tx.reference || 'Institutional Journal Entry'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className={cn(
                                                    "py-5 px-8 text-right font-black text-sm tracking-tight",
                                                    tx.type === 'credit' ? 'text-emerald-500' : 'text-destructive'
                                                )}>
                                                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

