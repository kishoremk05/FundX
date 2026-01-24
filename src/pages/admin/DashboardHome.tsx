import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getCountFromServer, orderBy, limit, doc, getDoc, updateDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import type { Loan, Profile, Branch } from '@/lib/database.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { jsPDF } from 'jspdf';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CreditCard,
  Users,
  AlertCircle,
  Wallet,
  Plus,
  TrendingUp,
  Loader2,
  MoreHorizontal,
  Eye,
  FileText,
  Download,
  Phone,
  Play,
} from 'lucide-react';

interface DashboardStats {
  totalPortfolioValue: number;
  activeLoans: number;
  overdueLoans: number;
  totalBorrowers: number;
  portfolioChange: number;
}

interface RecentApplication {
  id: string;
  borrower: string;
  amount: number;
  status: 'pending' | 'active' | 'paid' | 'overdue';
  current_step: number;
  date: string;
}

export default function DashboardHome() {
  const { toast } = useToast();
  const borrowerOptions = useMemo(() => ({
    filters: [{ field: 'role', operator: '==' as const, value: 'customer' }]
  }), []);

  const { add: addProfile } = useFirestore<Profile>('profiles');
  const { data: borrowers = [] } = useFirestore<Profile>('profiles', borrowerOptions);
  const { data: branches = [] } = useFirestore<Branch>('branches');
  const { add: addLoan } = useFirestore<Loan>('loans');
  const { update: updateLoan } = useFirestore<Loan>('loans');

  const [stats, setStats] = useState<DashboardStats>({
    totalPortfolioValue: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalBorrowers: 0,
    portfolioChange: 12,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [isAddBorrowerOpen, setIsAddBorrowerOpen] = useState(false);
  const [isCreateLoanOpen, setIsCreateLoanOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [addBorrowerForm, setAddBorrowerForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    branch_id: '',
  });

  const [createLoanForm, setCreateLoanForm] = useState({
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

  const handleAddBorrower = async () => {
    if (!addBorrowerForm.full_name || !addBorrowerForm.email) {
      toast({ title: 'Error', description: 'Please fill name and email.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await addProfile({
        ...addBorrowerForm,
        role: 'customer',
        is_active: true,
      } as Partial<Profile>);
      toast({ title: 'Success', description: 'Borrower added successfully.' });
      setIsAddBorrowerOpen(false);
      setAddBorrowerForm({ full_name: '', email: '', phone: '', branch_id: '' });
      fetchDashboardData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLoan = async () => {
    if (!createLoanForm.customer_id || !createLoanForm.principal_amount) {
      toast({ title: 'Error', description: 'Please select borrower and amount.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const principal = parseFloat(createLoanForm.principal_amount);
      const interestRate = parseFloat(createLoanForm.interest_rate) / 100;
      const duration = parseInt(createLoanForm.duration_months);
      const totalRepayment = principal + (principal * interestRate * (duration / 12));

      await addLoan({
        customer_id: createLoanForm.customer_id,
        principal_amount: principal,
        balance: totalRepayment,
        total_repayment: totalRepayment,
        interest_rate: parseFloat(createLoanForm.interest_rate),
        duration_months: duration,
        status: 'active',
        disbursed_at: new Date().toISOString(),
        loan_purpose: createLoanForm.loan_purpose,
      } as Partial<Loan>);

      toast({ title: 'Success', description: 'Loan created successfully.' });
      setIsCreateLoanOpen(false);
      setCreateLoanForm({ customer_id: '', principal_amount: '', interest_rate: '15', duration_months: '6', loan_purpose: '' });
      fetchDashboardData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedLoanId || !paymentForm.amount) return;
    setIsSubmitting(true);
    try {
      const amount = Number(paymentForm.amount);

      // 1. Find the loan associated with this application
      const loansRef = collection(db, 'loans');
      const qLoan = query(loansRef, where('application_id', '==', selectedLoanId));
      const loanSnap = await getDocs(qLoan);

      if (loanSnap.empty) {
        throw new Error('No disbursed loan found for this application. Please disburse the loan first.');
      }

      const loanDoc = loanSnap.docs[0];
      const loanId = loanDoc.id;
      const loanData = loanDoc.data() as Loan;

      const currentBalance = loanData.balance || 0;
      const newBalance = Math.max(0, currentBalance - amount);
      const newStatus = newBalance <= 0 ? 'paid' : loanData.status;

      // 2. Add repayment record
      await addDoc(collection(db, 'repayments'), {
        loan_id: loanId,
        amount: amount,
        payment_method: paymentForm.payment_method,
        notes: paymentForm.notes,
        paid_at: new Date().toISOString(),
        status: 'completed',
        recorded_by: 'admin'
      });

      // 3. Update loan balance
      await updateDoc(doc(db, 'loans', loanId), {
        balance: newBalance,
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      toast({ title: 'Success', description: `Recorded payment of ${formatCurrency(amount)}.` });
      setIsPaymentOpen(false);
      setPaymentForm({ amount: '', payment_method: 'mobile_money', notes: '' });
      fetchDashboardData();
    } catch (e: any) {
      console.error('Error recording payment:', e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPDF = (appId: string) => {
    try {
      const app = recentApplications.find(a => a.id === appId);
      if (!app) return;

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text('KEP Microcredit - Loan Agreement', 20, 20);
      doc.setFontSize(14);
      doc.text(`Reference: ${app.id.toUpperCase()}`, 20, 35);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);

      doc.setLineWidth(0.5);
      doc.line(20, 50, 190, 50);

      doc.text('Borrower Details:', 20, 65);
      doc.text(`Name: ${app.borrower}`, 30, 75);

      doc.text('Loan Details:', 20, 95);
      doc.text(`Principal Amount: ${formatCurrency(app.amount)}`, 30, 105);
      doc.text(`Status: ${app.status.toUpperCase()}`, 30, 115);

      doc.setFontSize(10);
      doc.text('Term: 6 Months (Standard)', 30, 125);
      doc.text('Interest Rate: 15% p.a.', 30, 135);

      doc.save(`loan_${app.id.slice(0, 8)}.pdf`);

      toast({ title: 'Success', description: 'Loan agreement exported successfully.' });
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  useEffect(() => {
    const loansRef = collection(db, 'loans');
    const profilesRef = collection(db, 'profiles');
    const appsRef = collection(db, 'loan_applications');

    // 1. Listen for Loans (Portfolio Value, Active/Overdue counts)
    const unsubLoans = onSnapshot(loansRef, (snapshot) => {
      const loansData = snapshot.docs.map(doc => doc.data());
      const totalPortfolioValue = loansData.reduce((sum, loan) => sum + parseFloat(loan.principal_amount || 0), 0);
      const activeCount = loansData.filter(l => l.status === 'active').length;
      const overdueCount = loansData.filter(l => l.status === 'overdue').length;

      setStats(prev => ({
        ...prev,
        totalPortfolioValue,
        activeLoans: activeCount,
        overdueLoans: overdueCount
      }));
    });

    // 2. Listen for Profiles (Borrower count)
    const qCustomers = query(profilesRef, where('role', '==', 'customer'));
    const unsubProfiles = onSnapshot(qCustomers, (snapshot) => {
      setStats(prev => ({
        ...prev,
        totalBorrowers: snapshot.size
      }));
    });

    // 3. Listen for Recent Applications
    const qRecent = query(appsRef, orderBy('created_at', 'desc'), limit(4));
    const unsubApps = onSnapshot(qRecent, (snapshot) => {
      const apps = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          borrower: data.full_name || 'Unknown',
          amount: parseFloat(data.amount || 0),
          status: data.status || 'pending',
          current_step: data.current_step || 1,
          date: data.created_at ? new Date(data.created_at).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
          }) : 'N/A',
        };
      });
      setRecentApplications(apps as RecentApplication[]);
      setLoading(false);
    });

    return () => {
      unsubLoans();
      unsubProfiles();
      unsubApps();
    };
  }, []);

  const fetchDashboardData = () => {
    // No longer needed as listeners handle it, but kept to prevent breakage if called elsewhere
    // Actually, I can remove it if it's only called in useEffect.
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0,
    }).format(amount).replace('TZS', 'TSh');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      active: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
    };
    return (
      <Badge className={cn("font-medium text-xs capitalize", variants[status] || 'bg-gray-100 text-gray-700')}>
        {status}
      </Badge>
    );
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsAddBorrowerOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Borrower
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setIsCreateLoanOpen(true)}>
            <Plus className="w-4 h-4" />
            New Loan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(stats.totalPortfolioValue)}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{stats.portfolioChange}% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.activeLoans}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Loans</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdueLoans}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Borrowers</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalBorrowers}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Loan Applications Table */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
          <CardTitle className="text-lg font-semibold text-foreground">Recent Loan Applications</CardTitle>
          <Link to="/admin/loans">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Borrower</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Protocol Stage</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => {
                const borrowerProfile = borrowers.find(b => b.id === (app as any).customer_id);
                const borrowerName = borrowerProfile?.full_name || app.borrower;

                return (
                  <tr key={app.id} className="border-b border-border hover:bg-muted/10">
                    <td className="py-4 px-6 text-sm font-medium text-foreground">{borrowerName}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{formatCurrency(app.amount)}</td>
                    <td className="py-4 px-6">
                      <Badge variant="outline" className="text-[10px] font-semibold border-primary/20 bg-primary/5 text-primary">
                        {app.current_step === 1 ? 'Loan Officer' :
                          app.current_step === 2 ? 'Ops Director' :
                            app.current_step === 3 ? 'MD/Finance' :
                              app.current_step === 4 ? 'CEO Approval' :
                                app.current_step === 5 ? 'Finance Disb.' : `Stage ${app.current_step}`}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(app.status)}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{app.date}</td>
                    <td className="py-4 px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link to="/admin/applications" className="flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              View Detail
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedLoanId(app.id);
                            setIsPaymentOpen(true);
                          }}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Record Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportPDF(app.id)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Export PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Borrower Dialog */}
      <Dialog open={isAddBorrowerOpen} onOpenChange={setIsAddBorrowerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Borrower</DialogTitle>
            <DialogDescription>Create a new customer profile.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="e.g. John Doe"
                value={addBorrowerForm.full_name}
                onChange={(e) => setAddBorrowerForm({ ...addBorrowerForm, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={addBorrowerForm.email}
                onChange={(e) => setAddBorrowerForm({ ...addBorrowerForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="+255..."
                  value={addBorrowerForm.phone}
                  onChange={(e) => setAddBorrowerForm({ ...addBorrowerForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={addBorrowerForm.branch_id} onValueChange={(v) => setAddBorrowerForm({ ...addBorrowerForm, branch_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBorrowerOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBorrower} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Borrower'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Loan Dialog */}
      <Dialog open={isCreateLoanOpen} onOpenChange={setIsCreateLoanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Loan</DialogTitle>
            <DialogDescription>Disburse a new loan to a borrower.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Borrower</Label>
              <Select value={createLoanForm.customer_id} onValueChange={(v) => setCreateLoanForm({ ...createLoanForm, customer_id: v })}>
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
              <Label>Amount (TZS)</Label>
              <Input
                type="number"
                placeholder="500000"
                value={createLoanForm.principal_amount}
                onChange={(e) => setCreateLoanForm({ ...createLoanForm, principal_amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateLoanOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateLoan} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Create & Disburse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a manual payment for this loan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (TZS)</Label>
              <Input
                type="number"
                placeholder="100000"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={isSubmitting || !paymentForm.amount}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
