import { useParams, Link } from 'react-router-dom';
import { useFirestoreDoc } from '@/hooks/useFirestore';
import { useFirestore } from '@/hooks/useFirestore';
import type { Loan, Repayment, Profile } from '@/lib/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    FileText,
    TrendingUp,
    User,
    Loader2,
    Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoanDetails() {
    const { id } = useParams<{ id: string }>();
    const { data: loan, loading: loanLoading } = useFirestoreDoc<Loan>('loans', id || null);

    const borrowerOptions = {
        filters: [{ field: 'id', operator: '==' as const, value: loan?.customer_id }]
    };
    const { data: borrowerArr } = useFirestore<Profile>('profiles', loan ? borrowerOptions : {});
    const borrower = borrowerArr[0];

    const repaymentOptions = {
        filters: [{ field: 'loan_id', operator: '==' as const, value: id }]
    };
    const { data: repayments = [], loading: repaymentsLoading } = useFirestore<Repayment>('repayments', id ? repaymentOptions : {});

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            maximumFractionDigits: 0
        }).format(amount).replace('TZS', 'TSh');
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-700',
            active: 'bg-blue-100 text-blue-700',
            paid: 'bg-green-100 text-green-700',
            overdue: 'bg-red-100 text-red-700',
        };
        return (
            <Badge className={cn("font-medium capitalize", styles[status.toLowerCase()] || 'bg-gray-100')}>
                {status}
            </Badge>
        );
    };

    if (loanLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!loan) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <div className="max-w-md mx-auto space-y-4">
                    <p className="text-xl font-semibold">Loan not found</p>
                    <p>The loan record you are looking for does not exist or has been removed.</p>
                    <Button asChild variant="outline">
                        <Link to="/admin/loans">Back to Loans</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const paidAmount = (loan.total_amount || 0) - (loan.balance || 0);
    const paidPercentage = loan.total_amount ? (paidAmount / loan.total_amount) * 100 : 0;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link to="/admin/loans"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Loan Detail <span className="text-muted-foreground font-normal">#L{loan.id.slice(-5).toUpperCase()}</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">Disbursed on {loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(loan.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Loan Summary */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Repayment Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Principal</p>
                                <p className="text-lg font-bold">{formatCurrency(loan.principal_amount)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Total Repayable</p>
                                <p className="text-lg font-bold">{formatCurrency(loan.total_amount)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase font-semibold text-green-600">Total Paid</p>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(paidAmount)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase font-semibold text-blue-600">Balance</p>
                                <p className="text-lg font-bold text-blue-600">{formatCurrency(loan.balance)}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-semibold">{Math.round(paidPercentage)}%</span>
                            </div>
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-500"
                                    style={{ width: `${paidPercentage}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Borrower Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5 text-muted-foreground" />
                            Borrower Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">{borrower?.full_name || 'Loading Name...'}</p>
                            <p className="text-xs text-muted-foreground">ID: {loan.customer_id}</p>
                        </div>
                        <div className="pt-2 border-t space-y-2">
                            <p className="text-xs flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span>{borrower?.email || 'N/A'}</span>
                            </p>
                            <p className="text-xs flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span>{borrower?.phone || 'N/A'}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Repayment History */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-muted-foreground" />
                            Repayment History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {repayments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="py-3 px-6 text-left font-medium text-muted-foreground">Date</th>
                                            <th className="py-3 px-6 text-left font-medium text-muted-foreground">Reference</th>
                                            <th className="py-3 px-6 text-left font-medium text-muted-foreground">Method</th>
                                            <th className="py-3 px-6 text-right font-medium text-muted-foreground">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {repayments.map((rep) => (
                                            <tr key={rep.id} className="border-b hover:bg-muted/10">
                                                <td className="py-4 px-6">{new Date(rep.paid_at).toLocaleDateString()}</td>
                                                <td className="py-4 px-6 font-mono text-xs">{rep.reference || '-'}</td>
                                                <td className="py-4 px-6 capitalize">{rep.payment_method?.replace('_', ' ') || 'cash'}</td>
                                                <td className="py-4 px-6 text-right font-semibold text-green-600">{formatCurrency(rep.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                No repayments recorded for this loan yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
