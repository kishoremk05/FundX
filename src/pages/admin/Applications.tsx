import { useEffect, useState } from 'react';

import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc, writeBatch, where } from 'firebase/firestore';
import { mockLoanApplications, mockLoanProducts } from '@/lib/mockData';
import type { LoanApplication, Profile, LoanProduct } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Eye, Loader2 } from 'lucide-react';
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

      toast.success(`Application ${status}`);
      setSelectedApp(null);
      setReviewNotes('');
      fetchApplications();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to review application');
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
      id: newLoanRef.id, // Ensure ID is part of data if needed
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

      const interest = remainingBalance * monthlyRate;
      const principalComp = monthlyPayment - interest; // This might be negative if balance is high?

      // Let's just blindly copy the loop logic but use batch.set()
      const principal = monthlyPayment - (remainingBalance * monthlyRate); // Logic from original
      const interestCalc = remainingBalance * monthlyRate;
      remainingBalance -= principal;

      const newScheduleRef = doc(schedulesRef);
      batch.set(newScheduleRef, {
        id: newScheduleRef.id,
        loan_id: newLoanRef.id,
        installment_number: i,
        due_date: dueDate.toISOString().split('T')[0],
        amount: monthlyPayment,
        principal,
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
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      approved: 'default',
      rejected: 'destructive',
      disbursed: 'secondary',
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Loan Applications</h1>
        <p className="text-muted-foreground mt-1">Review and approve loan applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>Manage customer loan applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    {app.customer?.full_name || app.customer?.email}
                  </TableCell>
                  <TableCell>{app.product?.name}</TableCell>
                  <TableCell>{formatCurrency(parseFloat(app.amount as any))}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedApp(app)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No loan applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Loan Application</DialogTitle>
            <DialogDescription>
              Review and approve or reject this loan application
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <p className="font-medium">{selectedApp.customer?.full_name || selectedApp.customer?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Product</Label>
                  <p className="font-medium">{selectedApp.product?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">{formatCurrency(parseFloat(selectedApp.amount as any))}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{getStatusBadge(selectedApp.status)}</p>
                </div>
              </div>

              {selectedApp.purpose && (
                <div>
                  <Label className="text-muted-foreground">Purpose</Label>
                  <p className="mt-1">{selectedApp.purpose}</p>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Review Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this application..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {selectedApp?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleReview('rejected')}
                  disabled={reviewing}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleReview('approved')}
                  disabled={reviewing}
                >
                  {reviewing ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-1" />
                  )}
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
