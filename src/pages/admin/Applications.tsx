import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, writeBatch, where } from 'firebase/firestore';
import type { LoanApplication, Profile, LoanProduct } from '@/lib/database.types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Eye,
  Loader2,
  FileText,
  User,
  Calendar,
  Banknote,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  ClipboardCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Scale
} from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type ApplicationWithDetails = LoanApplication & {
  customer: Profile;
  product: LoanProduct;
};

export default function Applications() {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const appsRef = collection(db, 'loan_applications');
      const q = query(appsRef, orderBy('applied_at', 'desc'));
      const appsSnapshot = await getDocs(q);
      const appsData = appsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as LoanApplication[];

      // Manual join: Fetch customers and products
      const customerIds = Array.from(new Set(appsData.map(a => a.customer_id)));
      const productIds = Array.from(new Set(appsData.map(a => a.product_id)));

      const customersMap: Record<string, Profile> = {};
      const productsMap: Record<string, LoanProduct> = {};

      if (customerIds.length > 0) {
        // Chunk fetching for customers
        const chunks = [];
        for (let i = 0; i < customerIds.length; i += 10) {
          chunks.push(customerIds.slice(i, i + 10));
        }
        for (const chunk of chunks) {
          const qCustomers = query(collection(db, 'profiles'), where('id', 'in', chunk));
          const snap = await getDocs(qCustomers);
          snap.forEach(doc => customersMap[doc.id] = doc.data() as Profile);
        }
      }

      if (productIds.length > 0) {
        // Chunk fetching for products
        const chunks = [];
        for (let i = 0; i < productIds.length; i += 10) {
          chunks.push(productIds.slice(i, i + 10));
        }
        for (const chunk of chunks) {
          const qProducts = query(collection(db, 'loan_products'), where('id', 'in', chunk));
          const snap = await getDocs(qProducts);
          snap.forEach(doc => productsMap[doc.id] = { ...doc.data(), id: doc.id } as LoanProduct);
        }
      }

      const mergedData = appsData.map(app => ({
        ...app,
        customer: customersMap[app.customer_id] || { full_name: 'Unknown', email: 'unknown@example.com' },
        product: productsMap[app.product_id] || { name: 'Unknown Product' }
      })) as ApplicationWithDetails[];

      setApplications(mergedData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selectedApp) return;

    setReviewing(true);
    try {
      const appRef = doc(db, 'loan_applications', selectedApp.id);

      await updateDoc(appRef, {
        status,
        reviewed_at: new Date().toISOString(),
        reviewer_id: auth.currentUser?.uid,
        notes: reviewNotes,
      });

      // If approved, create loan and repayment schedule
      if (status === 'approved') {
        await createLoan(selectedApp);
      }

      toast.success(`Application assessment complete: ${status.toUpperCase()}`);
      setSelectedApp(null);
      setReviewNotes('');
      fetchApplications();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to synchronize review decision');
    } finally {
      setReviewing(false);
    }
  };

  const createLoan = async (app: ApplicationWithDetails) => {
    const principal = parseFloat(app.amount as any);
    const rate = parseFloat(app.product.interest_rate as any) / 100;
    const term = app.product.term_months;

    // Calculate monthly payment using loan formula
    const monthlyRate = rate / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    const totalAmount = monthlyPayment * term;

    // Use batch for atomic writes
    const batch = writeBatch(db);

    // Create loan
    const loansRef = collection(db, 'loans');
    // Generate an ID for the loan beforehand references
    const newLoanRef = doc(loansRef);

    const loanData = {
      id: newLoanRef.id,
      application_id: app.id,
      customer_id: app.customer_id,
      product_id: app.product_id,
      principal_amount: principal,
      interest_rate: app.product.interest_rate,
      term_months: term,
      monthly_payment: monthlyPayment,
      total_amount: totalAmount,
      balance: totalAmount,
      status: 'active',
      disbursed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    batch.set(newLoanRef, loanData);

    // Create repayment schedules
    const schedulesRef = collection(db, 'repayment_schedules');
    let remainingBalance = totalAmount;
    const startDate = new Date();

    for (let i = 1; i <= term; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const interestCalc = remainingBalance * monthlyRate;
      const principalPart = monthlyPayment - interestCalc;
      remainingBalance -= principalPart;

      const newScheduleRef = doc(schedulesRef);
      batch.set(newScheduleRef, {
        id: newScheduleRef.id,
        loan_id: newLoanRef.id,
        installment_number: i,
        due_date: dueDate.toISOString().split('T')[0],
        amount: monthlyPayment,
        principal: principalPart,
        interest: interestCalc,
        balance_after: Math.max(0, remainingBalance),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Update application status to disbursed
    const appRef = doc(db, 'loan_applications', app.id);
    batch.update(appRef, { status: 'disbursed' });

    await batch.commit();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string, text: string, icon: any }> = {
      pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: Clock },
      approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle2 },
      rejected: { bg: 'bg-destructive/10', text: 'text-destructive', icon: AlertCircle },
      disbursed: { bg: 'bg-sky-500/10', text: 'text-sky-600', icon: ShieldCheck },
    };

    const variant = variants[status] || { bg: 'bg-muted', text: 'text-muted-foreground', icon: FileText };
    const Icon = variant.icon;

    return (
      <Badge variant="outline" className={cn("font-black uppercase tracking-widest text-[9px] px-2.5 py-1 rounded-full flex items-center gap-1.5 border-transparent transition-all", variant.bg, variant.text)}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0,
    }).format(amount).replace('TZS', 'TSh');
  };

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
              <ClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase tracking-widest">Loan Intake Pipeline</h1>
          </div>
          <p className="text-muted-foreground text-lg ml-11">Advanced credit evaluation and underwriting terminal for facility requests.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border/50 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{applications.length} PENDING SUBMISSIONS</span>
          </div>
        </div>
      </div>

      {/* Main Content Table Card */}
      <Card className="bg-card border-border shadow-2xl overflow-hidden rounded-2xl relative border-t-4 border-t-primary">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10 border-b border-border/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-5 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Institutional Applicant</TableHead>
                  <TableHead className="py-5 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Credit Protocol</TableHead>
                  <TableHead className="py-5 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Requested Principal</TableHead>
                  <TableHead className="py-5 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Lifecycle Status</TableHead>
                  <TableHead className="py-5 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Submission Date</TableHead>
                  <TableHead className="w-[120px] py-5 px-8 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <TableRow key={app.id} className="group border-border/50 hover:bg-muted/20 transition-all duration-200">
                      <TableCell className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center border border-border/50 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                            <span className="text-muted-foreground font-black text-sm uppercase group-hover:text-primary-foreground transition-colors">
                              {(app.customer?.full_name || app.customer?.email || '?').charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-black text-foreground group-hover:text-primary transition-colors tracking-tight leading-tight">
                              {app.customer?.full_name || 'Anonymous Entity'}
                            </p>
                            <span className="text-[10px] text-muted-foreground/60 block truncate max-w-[180px] font-bold uppercase tracking-tighter mt-0.5">
                              {app.customer?.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-8">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-muted border border-border rounded opacity-50">
                            <Briefcase className="w-3 h-3 text-foreground" />
                          </div>
                          <span className="text-xs font-black text-foreground/70 uppercase tracking-widest">{app.product?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground tracking-tight">{formatCurrency(parseFloat(app.amount as any))}</span>
                          <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">Fixed Principal</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-8 text-center">
                        <div className="flex justify-center">{getStatusBadge(app.status)}</div>
                      </TableCell>
                      <TableCell className="py-5 px-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60">
                          <Calendar className="w-3.5 h-3.5 opacity-40" />
                          {new Date(app.applied_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-8 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-95"
                        >
                          Assess
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <ClipboardCheck className="w-12 h-12" />
                        <div className="space-y-1">
                          <h3 className="text-xl font-black uppercase tracking-[0.2em]">Pipeline Inert</h3>
                          <p className="text-xs font-bold">No underwriting requests identified in current synchronized data.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Terminal (Dialog) */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="sm:max-w-[700px] bg-card border-border shadow-2xl p-0 overflow-hidden rounded-3xl">
          <div className="bg-primary/5 p-8 border-b border-border relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
              <Scale className="w-24 h-24" />
            </div>
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Protocol Assessment</DialogTitle>
                  <DialogDescription className="text-muted-foreground font-bold text-sm tracking-wide mt-1">
                    Synchronizing institutional decision for facility ID: <span className="text-primary">#{selectedApp?.id.slice(-8).toUpperCase()}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-10">
            {selectedApp && (
              <div className="space-y-10">
                {/* Visual Summary Cards */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5 leading-none">
                        <User className="w-3 h-3 opacity-60" /> Entity Identity
                      </Label>
                      <p className="text-xl font-black text-foreground tracking-tight truncate">
                        {(selectedApp as any).full_name || selectedApp.customer?.full_name || selectedApp.customer?.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5 leading-none">
                        <Briefcase className="w-3 h-3 opacity-60" /> Employment Status
                      </Label>
                      <p className="text-sm font-black text-foreground/70 uppercase tracking-widest">
                        {(selectedApp as any).employment_status || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60 flex items-center gap-1.5 leading-none">
                        <Banknote className="w-3 h-3 opacity-60" /> Exposure Demand
                      </Label>
                      <p className="text-3xl font-black text-primary tracking-tighter leading-none">
                        {formatCurrency(parseFloat(selectedApp.amount as any))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase text-primary/40 tracking-widest">CURRENT PHASE:</span>
                      {getStatusBadge(selectedApp.status)}
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-full" /> Personal Information
                  </Label>
                  <div className="bg-muted/20 p-4 rounded-2xl grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Phone:</span> <span className="font-bold">{(selectedApp as any).phone || 'N/A'}</span></div>
                    <div><span className="text-muted-foreground">Email:</span> <span className="font-bold">{(selectedApp as any).email || 'N/A'}</span></div>
                    <div><span className="text-muted-foreground">ID Number:</span> <span className="font-bold">{(selectedApp as any).id_number || 'N/A'}</span></div>
                    <div><span className="text-muted-foreground">Birth Date:</span> <span className="font-bold">{(selectedApp as any).birth_date || 'N/A'}</span></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-bold">{(selectedApp as any).address || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <div className="w-1 h-3 bg-green-500 rounded-full" /> Employment Details
                  </Label>
                  <div className="bg-muted/20 p-4 rounded-2xl grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Status:</span> <span className="font-bold uppercase">{(selectedApp as any).employment_status || 'N/A'}</span></div>
                    <div><span className="text-muted-foreground">Employer:</span> <span className="font-bold">{(selectedApp as any).employer_name || 'N/A'}</span></div>
                    <div><span className="text-muted-foreground">Job Title:</span> <span className="font-bold">{(selectedApp as any).job_title || 'N/A'}</span></div>
                    <div><span className="text-muted-foreground">Monthly Income:</span> <span className="font-bold">{formatCurrency((selectedApp as any).monthly_income || 0)}</span></div>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <div className="w-1 h-3 bg-amber-500 rounded-full" /> Loan Terms
                  </Label>
                  <div className="bg-muted/20 p-4 rounded-2xl grid grid-cols-3 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Duration:</span> <span className="font-bold">{(selectedApp as any).duration_months || 'N/A'} months</span></div>
                    <div><span className="text-muted-foreground">Monthly Payment:</span> <span className="font-bold text-green-600">{formatCurrency((selectedApp as any).monthly_payment || 0)}</span></div>
                    <div><span className="text-muted-foreground">Interest Rate:</span> <span className="font-bold">{(selectedApp as any).interest_rate || 15}% p.a.</span></div>
                  </div>
                </div>

                {/* Documents */}
                {(selectedApp as any).documents && Object.keys((selectedApp as any).documents).length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-3 bg-violet-500 rounded-full" /> Uploaded Documents
                    </Label>
                    <div className="bg-muted/20 p-4 rounded-2xl space-y-2">
                      {Object.entries((selectedApp as any).documents).map(([name, url]: [string, any]) => (
                        <a
                          key={name}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors text-sm"
                        >
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="font-medium text-primary underline">{name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purpose Statement */}
                {(selectedApp as any).purpose && (
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-3 bg-primary rounded-full" /> Narrative Statement of Need
                    </Label>
                    <div className="bg-muted/20 p-6 rounded-2xl border-l-[6px] border-l-primary/20 text-sm leading-relaxed text-foreground/80 font-medium italic relative group">
                      <MessageSquare className="absolute -top-3 -right-3 w-8 h-8 text-primary/10 rotate-12 group-hover:scale-125 transition-transform" />
                      "{(selectedApp as any).purpose}"
                    </div>
                  </div>
                )}

                {/* Assessment Logging */}
                <div className="space-y-4 pt-4">
                  <Label htmlFor="notes" className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <div className="w-1 h-3 bg-foreground/20 rounded-full" /> Internal Underwriting Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Document institutional reasoning for authorization or denial of facility request..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="min-h-[160px] bg-muted/20 border-border focus:bg-background focus:ring-0 focus:border-primary transition-all rounded-2xl p-6 font-medium leading-relaxed resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-8 bg-muted/20 border-t border-border flex sm:justify-between items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedApp(null)}
              className="px-8 font-black uppercase tracking-widest text-[10px] hover:bg-muted h-12 rounded-xl"
            >
              Discard Protocol
            </Button>

            {selectedApp?.status === 'pending' && (
              <div className="flex gap-4 ml-auto">
                <Button
                  variant="outline"
                  onClick={() => handleReview('rejected')}
                  disabled={reviewing}
                  className="border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all px-8 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  Deny Request
                </Button>
                <Button
                  onClick={() => handleReview('approved')}
                  disabled={reviewing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 px-10 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl active:scale-95 transition-all text-base"
                >
                  {reviewing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Synchronizing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Authorize Facility
                    </div>
                  )}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
