import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Users, Package, CheckCircle, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

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

// Test credentials - CHANGE THESE IN PRODUCTION!
const testCredentials = {
    admin: {
        email: 'admin@kepmic.co.tz',
        password: 'Admin@123',
        role: 'admin',
        full_name: 'System Administrator'
    },
    customer: {
        email: 'customer@test.com',
        password: 'Customer@123',
        role: 'customer',
        full_name: 'Test Customer'
    }
};

export default function SeedData() {
    const [loading, setLoading] = useState<string | null>(null);
    const [seeded, setSeeded] = useState<Record<string, boolean>>({
        products: false,
        admin: false,
        customer: false
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const seedLoanProducts = async () => {
        setLoading('products');
        try {
            for (const product of loanProducts) {
                await setDoc(doc(db, 'loan_products', product.id), product);
            }
            toast.success('✅ Loan products added successfully!');
            setSeeded(prev => ({ ...prev, products: true }));
        } catch (error: any) {
            console.error('Error seeding products:', error);
            toast.error(`Failed to add products: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    const createUser = async (type: 'admin' | 'customer') => {
        setLoading(type);
        const creds = testCredentials[type];

        try {
            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, creds.email, creds.password);
            const userId = userCredential.user.uid;

            // Create profile in Firestore
            await setDoc(doc(db, 'profiles', userId), {
                id: userId,
                email: creds.email,
                full_name: creds.full_name,
                phone: null,
                role: creds.role,
                avatar_url: null,
                branch_id: null,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            toast.success(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} user created!`);
            setSeeded(prev => ({ ...prev, [type]: true }));
        } catch (error: any) {
            console.error(`Error creating ${type}:`, error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error(`${creds.email} already exists. Try logging in.`);
                setSeeded(prev => ({ ...prev, [type]: true }));
            } else {
                toast.error(`Failed: ${error.message}`);
            }
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Setup & Test Data</h1>
                <p className="text-muted-foreground mt-2">Initialize your database with test data and credentials</p>
            </div>

            {/* Admin User Card */}
            <Card className="border-primary/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-primary" />
                            <div>
                                <CardTitle>Admin User</CardTitle>
                                <CardDescription>Create an administrator account</CardDescription>
                            </div>
                        </div>
                        {seeded.admin && <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Created</Badge>}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-mono">{testCredentials.admin.email}</code>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(testCredentials.admin.email)}><Copy className="w-3 h-3" /></Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Password:</span>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-mono">{testCredentials.admin.password}</code>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(testCredentials.admin.password)}><Copy className="w-3 h-3" /></Button>
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => createUser('admin')} disabled={loading === 'admin' || seeded.admin} className="w-full">
                        {loading === 'admin' ? 'Creating...' : seeded.admin ? 'Admin Created ✓' : 'Create Admin User'}
                    </Button>
                </CardContent>
            </Card>

            {/* Customer User Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6 text-blue-500" />
                            <div>
                                <CardTitle>Test Customer</CardTitle>
                                <CardDescription>Create a test customer account</CardDescription>
                            </div>
                        </div>
                        {seeded.customer && <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Created</Badge>}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-mono">{testCredentials.customer.email}</code>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(testCredentials.customer.email)}><Copy className="w-3 h-3" /></Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Password:</span>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-mono">{testCredentials.customer.password}</code>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(testCredentials.customer.password)}><Copy className="w-3 h-3" /></Button>
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => createUser('customer')} disabled={loading === 'customer' || seeded.customer} variant="outline" className="w-full">
                        {loading === 'customer' ? 'Creating...' : seeded.customer ? 'Customer Created ✓' : 'Create Test Customer'}
                    </Button>
                </CardContent>
            </Card>

            {/* Loan Products Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Package className="w-6 h-6 text-amber-500" />
                            <div>
                                <CardTitle>Loan Products</CardTitle>
                                <CardDescription>Add sample loan products</CardDescription>
                            </div>
                        </div>
                        {seeded.products && <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Added</Badge>}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {loanProducts.map(p => (
                            <li key={p.id}>
                                <strong>{p.name}</strong> - {p.interest_rate}% interest, TZS {p.min_amount.toLocaleString()} - {p.max_amount.toLocaleString()}, {p.term_months} months
                            </li>
                        ))}
                    </ul>
                    <Button onClick={seedLoanProducts} disabled={loading === 'products' || seeded.products} variant="outline" className="w-full">
                        {loading === 'products' ? 'Adding...' : seeded.products ? 'Products Added ✓' : 'Add Loan Products'}
                    </Button>
                </CardContent>
            </Card>

            {/* Quick Links */}
            {(seeded.admin || seeded.customer) && (
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold mb-3">🎉 Ready to test!</h3>
                        <div className="flex flex-wrap gap-2">
                            <Link to="/admin/login">
                                <Button variant="default" size="sm"><Shield className="w-4 h-4 mr-2" />Go to Admin Login</Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" size="sm"><Users className="w-4 h-4 mr-2" />Go to Customer Login</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
