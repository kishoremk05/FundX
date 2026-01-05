import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { mockLoanApplications, mockActiveLoans } from '@/lib/mockData';
import type { Loan, LoanProduct, LoanApplication } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type LoanWithProduct = Loan & {
  product: LoanProduct;
};

type ApplicationWithProduct = LoanApplication & {
  product: LoanProduct;
};

export default function MyLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<LoanWithProduct[]>([]);
  const [applications, setApplications] = useState<ApplicationWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, wait for user
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      if (!user) return;

      const loansRef = collection(db, 'loans');
      const applicationsRef = collection(db, 'loan_applications');
      const productsRef = collection(db, 'loan_products');

      // Fetch active loans
      const qLoans = query(
        loansRef,
        where('customer_id', '==', user.uid)
        // orderBy('disbursed_at', 'desc') // Requires index, sorting client-side for now
      );
      const loansSnapshot = await getDocs(qLoans);
      const loansData = loansSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Loan[];

      // Fetch applications
      const qApps = query(
        applicationsRef,
        where('customer_id', '==', user.uid)
        // orderBy('applied_at', 'desc') // Requires index
      );
      const appsSnapshot = await getDocs(qApps);
      const appsData = appsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as LoanApplication[];

      // Fetch products
      // distinct product IDs
      const productIds = Array.from(new Set([
        ...loansData.map(l => l.product_id),
        ...appsData.map(a => a.product_id)
      ]));

      const productsMap: Record<string, LoanProduct> = {};

      if (productIds.length > 0) {
        // Fetch products in chunks or individually
        // Since products are likely static and few, we could fetch all active products, but let's stick to IDs
        const chunks = [];
        for (let i = 0; i < productIds.length; i += 10) {
          chunks.push(productIds.slice(i, i + 10));
        }

        for (const chunk of chunks) {
          const qProducts = query(productsRef, where('id', 'in', chunk));
          const productsSnapshot = await getDocs(qProducts);
          productsSnapshot.forEach(doc => {
            productsMap[doc.id] = { ...doc.data(), id: doc.id } as LoanProduct;
          });
        }
      }

      // Merge data
      const loansWithProduct = loansData.map(loan => ({
        ...loan,
        product: productsMap[loan.product_id] || { name: 'Unknown Product' } // Fallback
      })).sort((a, b) => new Date(b.disbursed_at).getTime() - new Date(a.disbursed_at).getTime()) as LoanWithProduct[];

      const appsWithProduct = appsData.map(app => ({
        ...app,
        product: productsMap[app.product_id] || { name: 'Unknown Product' }
      })).sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()) as ApplicationWithProduct[];

      setLoans(loansWithProduct);
      setApplications(appsWithProduct);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      paid: 'secondary',
      defaulted: 'destructive',
      pending: 'outline',
      approved: 'default',
      rejected: 'destructive',
      disbursed: 'secondary',
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
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
        <h1 className="text-3xl font-heading font-bold">My Loans</h1>
        <p className="text-muted-foreground mt-1">View your active loans and applications</p>
      </div>

      <Tabs defaultValue="loans">
        <TabsList>
          <TabsTrigger value="loans">Active Loans ({loans.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Active Loans</CardTitle>
              <CardDescription>Manage and track your loan repayments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Disbursed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.product?.name}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(loan.principal_amount as any))}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(loan.balance as any))}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(loan.monthly_payment as any))}</TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>{new Date(loan.disbursed_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {loans.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No active loans found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Loan Applications</CardTitle>
              <CardDescription>Track the status of your loan applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.product?.name}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(app.amount as any))}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {app.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {applications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No loan applications found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
