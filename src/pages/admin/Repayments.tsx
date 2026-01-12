import { useState, useMemo } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { cn } from '@/lib/utils';
import type { Repayment, Loan, Profile } from '@/lib/database.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Repayments() {
  const { toast } = useToast();
  const borrowerOptions = useMemo(() => ({
    filters: [{ field: 'role', operator: '==' as const, value: 'customer' }]
  }), []);

  const { data: repayments = [], loading: repaymentsLoading } = useFirestore<Repayment>('repayments');
  const { data: loans = [] } = useFirestore<Loan>('loans');
  const { data: borrowers = [] } = useFirestore<Profile>('profiles', borrowerOptions);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    loan_id: '',
    amount: '',
    payment_method: 'mobile_money' as 'cash' | 'bank_transfer' | 'mobile_money' | 'card',
    reference: '',
    notes: '',
  });

  const getLoanBorrower = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return 'Unknown';
    const borrower = borrowers.find(b => b.id === loan.customer_id);
    return borrower?.full_name || 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const getMethodBadge = (method: string) => {
    const styles: Record<string, string> = {
      cash: 'bg-green-100 text-green-700',
      bank_transfer: 'bg-blue-100 text-blue-700',
      mobile_money: 'bg-purple-100 text-purple-700',
      card: 'bg-orange-100 text-orange-700',
    };

    const labels: Record<string, string> = {
      cash: 'CASH',
      bank_transfer: 'BANK',
      mobile_money: 'MOBILE MONEY',
      card: 'CARD',
    };

    return (
      <Badge className={cn("font-medium text-xs uppercase", styles[method] || 'bg-muted text-muted-foreground')}>
        {labels[method] || method}
      </Badge>
    );
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.loan_id || !paymentForm.amount) return;

    setIsSubmitting(true);
    try {
      toast({
        title: 'Payment Recorded',
        description: `Payment of ${formatCurrency(Number(paymentForm.amount))} has been recorded.`,
      });
      setIsRecordModalOpen(false);
      setPaymentForm({
        loan_id: '',
        amount: '',
        payment_method: 'mobile_money',
        reference: '',
        notes: '',
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRepayments = repayments.filter(r => {
    const borrower = getLoanBorrower(r.loan_id).toLowerCase();
    const loanId = r.loan_id.toLowerCase();
    const ref = (r.reference || '').toLowerCase();
    return borrower.includes(searchQuery.toLowerCase()) || loanId.includes(searchQuery.toLowerCase()) || ref.includes(searchQuery.toLowerCase());
  });

  if (repaymentsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Repayments</h1>
        <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>Record a new loan repayment</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Loan</Label>
                <Select value={paymentForm.loan_id} onValueChange={(v) => setPaymentForm({ ...paymentForm, loan_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loans.filter(l => l.status === 'active').map(loan => (
                      <SelectItem key={loan.id} value={loan.id}>
                        L{loan.id.slice(-3).toUpperCase()} - {getLoanBorrower(loan.id)} ({formatCurrency(loan.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={paymentForm.payment_method} onValueChange={(v: any) => setPaymentForm({ ...paymentForm, payment_method: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reference</Label>
                <Input
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  placeholder="TX12345678"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRecordModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordPayment} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Payment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference or loan ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
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
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Loan ID</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Amount</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Method</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Reference</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Recorded By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepayments.length > 0 ? (
                filteredRepayments.map((rep) => (
                  <TableRow key={rep.id} className="hover:bg-muted/10 border-b border-border">
                    <TableCell className="py-4 text-sm">
                      {new Date(rep.paid_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-medium text-primary">L{rep.loan_id.slice(-3).toUpperCase()}</span>
                    </TableCell>
                    <TableCell className="py-4 text-sm font-medium">
                      {formatCurrency(rep.amount)}
                    </TableCell>
                    <TableCell className="py-4">
                      {getMethodBadge(rep.payment_method)}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground font-mono">
                      {rep.reference || '-'}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      Admin
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No repayments found
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
