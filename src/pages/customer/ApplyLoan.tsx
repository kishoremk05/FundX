import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { mockLoanProducts } from '@/lib/mockData';
import type { LoanProduct } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calculator } from 'lucide-react';
import { toast } from 'sonner';

export default function ApplyLoan() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calculation, setCalculation] = useState<{
    monthlyPayment: number;
    totalAmount: number;
    totalInterest: number;
  } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'loan_products');
      // Using only where clause to avoid needing a composite index
      const q = query(productsRef, where('is_active', '==', true));
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LoanProduct[];

      // Sort in memory instead of in the query
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

      setProducts(sortedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load loan products');
    }
  };

  const calculateLoan = () => {
    if (!selectedProduct || !amount) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    setCalculating(true);

    const principal = parseFloat(amount);
    const rate = parseFloat(product.interest_rate as any) / 100 / 12; // Monthly rate
    const term = product.term_months;

    // Monthly payment formula: P * (r(1+r)^n) / ((1+r)^n - 1)
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    const totalAmount = monthlyPayment * term;
    const totalInterest = totalAmount - principal;

    setCalculation({
      monthlyPayment,
      totalAmount,
      totalInterest,
    });

    setCalculating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !amount) {
      toast.error('Please fill all required fields');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const amountNum = parseFloat(amount);
    const minAmount = parseFloat(product.min_amount as any);
    const maxAmount = parseFloat(product.max_amount as any);

    if (amountNum < minAmount || amountNum > maxAmount) {
      toast.error(`Amount must be between ${formatCurrency(minAmount)} and ${formatCurrency(maxAmount)}`);
      return;
    }

    setLoading(true);

    try {
      // In dev mode, simulate submission
      const applicationsRef = collection(db, 'loan_applications');
      await addDoc(applicationsRef, {
        customer_id: user!.uid,
        product_id: selectedProduct,
        amount: amountNum,
        purpose,
        status: 'pending',
        applied_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      toast.success('Loan application submitted successfully!');
      navigate('/customer/my-loans');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application');
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

  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-heading font-bold">Apply for Loan</h1>
        <p className="text-muted-foreground mt-1">Fill out the form to apply for a new loan</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Application Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Loan Application Form</CardTitle>
            <CardDescription>Enter your loan details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Loan Product *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a loan product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {parseFloat(product.interest_rate as any).toFixed(2)}% interest
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProductData && (
                  <p className="text-xs text-muted-foreground">
                    Amount range: {formatCurrency(parseFloat(selectedProductData.min_amount as any))} - {formatCurrency(parseFloat(selectedProductData.max_amount as any))}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (TZS) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="5000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Loan</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe what you'll use the loan for..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  disabled={loading}
                  rows={4}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={calculateLoan}
                disabled={!selectedProduct || !amount || calculating}
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Repayment
              </Button>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Calculation Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Repayment Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              {calculation ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Payment</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(calculation.monthlyPayment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(calculation.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Interest</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(calculation.totalInterest)}
                    </p>
                  </div>
                  {selectedProductData && (
                    <div>
                      <p className="text-sm text-muted-foreground">Loan Term</p>
                      <p className="text-lg font-semibold">
                        {selectedProductData.term_months} months
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Select a product and enter an amount, then click "Calculate Repayment" to see your payment breakdown
                </p>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription className="text-sm">
              <strong>Processing Time:</strong> Applications are typically reviewed within 24 hours during business days.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
