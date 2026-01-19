import { useState, useMemo } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { cn } from '@/lib/utils';
import type { Loan, Profile } from '@/lib/database.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  FileText,
  TrendingUp,
  Loader2,
  Filter,
  Download,
  Trash2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Loans() {
  const borrowerOptions = useMemo(() => ({
    filters: [{ field: 'role', operator: '==' as const, value: 'customer' }]
  }), []);

  const { toast } = useToast();
  const { data: loans = [], loading, add, update, remove } = useFirestore<Loan>('loans');
  const { data: borrowers = [] } = useFirestore<Profile>('profiles', borrowerOptions);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    customer_id: '',
    principal_amount: '',
    interest_rate: '15',
    duration_months: '6',
    loan_purpose: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'mobile_money',
    notes: '',
  });

  const handleCreateLoan = async () => {
    if (!createForm.customer_id || !createForm.principal_amount) {
      toast({
        title: 'Validation Error',
        description: 'Please select a borrower and enter an amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const principal = parseFloat(createForm.principal_amount);
      const interestRate = parseFloat(createForm.interest_rate) / 100;
      const duration = parseInt(createForm.duration_months);

      const totalInterest = principal * interestRate * (duration / 12);
      const totalRepayment = principal + totalInterest;

      await add({
        customer_id: createForm.customer_id,
        principal_amount: principal,
        interest_rate: parseFloat(createForm.interest_rate),
        term_months: duration,
        status: 'active',
        balance: totalRepayment,
        total_amount: totalRepayment,
        disbursed_at: new Date().toISOString(),
        loan_purpose: createForm.loan_purpose,
      } as Partial<Loan>);

      toast({
        title: 'Loan Created',
        description: 'New loan has been successfully created and disbursed.',
      });

      setIsCreateOpen(false);
      setCreateForm({
        customer_id: '',
        principal_amount: '',
        interest_rate: '15',
        duration_months: '6',
        loan_purpose: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedLoan || !paymentForm.amount) return;

    setIsSubmitting(true);
    try {
      const paymentAmount = parseFloat(paymentForm.amount);
      const newBalance = Math.max(0, (selectedLoan.balance || 0) - paymentAmount);
      const newStatus = newBalance <= 0 ? 'paid' : selectedLoan.status;

      await update(selectedLoan.id, {
        balance: newBalance,
        status: newStatus,
      });

      toast({
        title: 'Payment Recorded',
        description: `Successfully recorded payment of ${formatCurrency(paymentAmount)}.`,
      });

      setIsPaymentOpen(false);
      setSelectedLoan(null);
      setPaymentForm({ amount: '', payment_method: 'mobile_money', notes: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPDF = (loan: Loan) => {
    try {
      const borrowerName = getBorrowerName(loan.customer_id);
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text('KEP Microcredit', 20, 20);
      doc.setFontSize(16);
      doc.text('Loan Agreement', 20, 30);

      // Line
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.line(20, 35, 190, 35);

      // Loan ID & Date
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Loan ID: L${loan.id.toUpperCase()}`, 20, 42);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 42);

      // Borrower Section
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('BORROWER INFORMATION', 20, 55);
      doc.setFontSize(11);
      doc.text(`Full Name: ${borrowerName}`, 20, 65);
      doc.text(`Customer ID: ${loan.customer_id}`, 20, 72);

      // Loan Details
      doc.setFontSize(14);
      doc.text('LOAN TERMS', 20, 85);
      doc.setFontSize(11);
      doc.text(`Principal Amount: ${formatCurrency(loan.principal_amount)}`, 20, 95);
      doc.text(`Interest Rate: ${loan.interest_rate}% p.a.`, 20, 102);
      doc.text(`Duration: ${loan.term_months} Months`, 20, 109);
      doc.text(`Total Repayment: ${formatCurrency(loan.total_amount)}`, 20, 116);
      doc.text(`Disbursement Date: ${new Date(loan.disbursed_at).toLocaleDateString()}`, 20, 123);

      // Current Status
      doc.setFillColor(241, 245, 249);
      doc.rect(20, 135, 170, 20, 'F');
      doc.setTextColor(30, 41, 59);
      doc.text(`Current Outstanding Balance: ${formatCurrency(loan.balance)}`, 25, 147);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('This is a computer generated document and does not require a physical signature.', 20, 280);

      doc.save(`LoanAgreement_${loan.id.slice(-5)}.pdf`);

      toast({ title: 'Success', description: 'Loan agreement exported successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this loan? This action cannot be undone.')) {
      try {
        await remove(id);
        toast({ title: 'Loan Deleted', description: 'Loan record has been removed.' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  const getBorrowerName = (borrowerId: string) => {
    const borrower = borrowers.find(b => b.id === borrowerId);
    return borrower?.full_name || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      active: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      rejected: 'bg-gray-100 text-gray-600',
    };

    return (
      <Badge className={cn("font-medium text-xs capitalize", styles[status.toLowerCase()] || 'bg-gray-100 text-gray-600')}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const filteredLoans = loans.filter(loan => {
    const borrowerName = getBorrowerName(loan.customer_id).toLowerCase();
    const loanId = loan.id.toLowerCase();
    const matchesSearch = borrowerName.includes(searchQuery.toLowerCase()) || loanId.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
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
        <h1 className="text-2xl font-bold text-foreground">Loans Management</h1>
        <Button
          className="gap-2 bg-primary hover:bg-primary/90"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Create Loan
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search loans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Loan ID</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Borrower</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Amount</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Balance</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Due Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <TableRow key={loan.id} className="hover:bg-muted/10">
                    <TableCell className="py-4 text-sm font-medium">
                      L{loan.id.slice(-3).toUpperCase()}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-medium text-primary">{getBorrowerName(loan.customer_id)}</span>
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      {formatCurrency(loan.principal_amount)}
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      {formatCurrency(loan.balance)}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {new Date(loan.disbursed_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="py-4">
                      {getStatusBadge(loan.status)}
                    </TableCell>
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/loans/${loan.id}`} className="flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedLoan(loan);
                            setIsPaymentOpen(true);
                          }}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Record Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportPDF(loan)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(loan.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Loan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No loans found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Loan Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Loan</DialogTitle>
            <DialogDescription>
              Disburse a new loan to an existing borrower.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Borrower</Label>
              <Select value={createForm.customer_id} onValueChange={(v) => setCreateForm({ ...createForm, customer_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a borrower" />
                </SelectTrigger>
                <SelectContent>
                  {borrowers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Principal Amount (TZS)</Label>
              <Input
                type="number"
                placeholder="e.g. 500000"
                value={createForm.principal_amount}
                onChange={(e) => setCreateForm({ ...createForm, principal_amount: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interest Rate (% p.a.)</Label>
                <Input
                  type="number"
                  value={createForm.interest_rate}
                  onChange={(e) => setCreateForm({ ...createForm, interest_rate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (Months)</Label>
                <Select value={createForm.duration_months} onValueChange={(v) => setCreateForm({ ...createForm, duration_months: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 6, 12, 18, 24].map((m) => (
                      <SelectItem key={m} value={m.toString()}>{m} Months</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Loan Purpose</Label>
              <Input
                placeholder="e.g. Business expansion"
                value={createForm.loan_purpose}
                onChange={(e) => setCreateForm({ ...createForm, loan_purpose: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateLoan} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create & Disburse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a manual repayment for L{selectedLoan?.id.slice(-3).toUpperCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Current Balance</p>
              <p className="text-xl font-bold text-blue-900">{selectedLoan ? formatCurrency(selectedLoan.balance || 0) : '0'}</p>
            </div>
            <div className="space-y-2">
              <Label>Payment Amount (TZS)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentForm.payment_method} onValueChange={(v) => setPaymentForm({ ...paymentForm, payment_method: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                placeholder="e.g. Transaction ID"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={isSubmitting || !paymentForm.amount}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
