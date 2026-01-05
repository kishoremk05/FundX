import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const loanProducts = [
    {
        id: 'biashara',
        name: 'BIASHARA',
        code: 'BIASHARA',
        description: 'Business loan for entrepreneurs and small business owners',
        interest_rate: 15,
        min_amount: 10000,
        max_amount: 100000,
        term_months: 12,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'emergency',
        name: 'Emergency Loan',
        code: 'EMERGENCY',
        description: 'Quick access loan for urgent financial needs',
        interest_rate: 18,
        min_amount: 5000,
        max_amount: 50000,
        term_months: 6,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'education',
        name: 'Education Loan',
        code: 'EDUCATION',
        description: 'Loan for school fees and educational expenses',
        interest_rate: 12,
        min_amount: 20000,
        max_amount: 200000,
        term_months: 24,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export default function SeedData() {
    const [loading, setLoading] = useState(false);
    const [seeded, setSeeded] = useState(false);

    const seedLoanProducts = async () => {
        setLoading(true);
        try {
            for (const product of loanProducts) {
                await setDoc(doc(db, 'loan_products', product.id), product);
            }
            toast.success('✅ Loan products added successfully!');
            setSeeded(true);
        } catch (error: any) {
            console.error('Error seeding products:', error);
            toast.error(`Failed to add products: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Initialize Loan Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            Click the button below to add the default loan products (BIASHARA, Emergency, Education) to your database.
                        </p>

                        {seeded && (
                            <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800">
                                ✅ Loan products have been added! You can now go to the "Apply for Loan" page.
                            </div>
                        )}

                        <div className="space-y-2">
                            <h3 className="font-semibold">Products to be added:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {loanProducts.map(p => (
                                    <li key={p.id}>
                                        <strong>{p.name}</strong> - {p.interest_rate}% interest,
                                        TZS {p.min_amount.toLocaleString()} - {p.max_amount.toLocaleString()},
                                        {p.term_months} months
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button
                            onClick={seedLoanProducts}
                            disabled={loading || seeded}
                            className="w-full"
                        >
                            {loading ? 'Adding Products...' : seeded ? 'Products Added ✓' : 'Add Loan Products'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
