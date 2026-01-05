// Mock data for development mode when Supabase is not available
import type { LoanProduct, LoanApplication, Loan, Profile } from './database.types';

// Mock loan products
export const mockLoanProducts: LoanProduct[] = [
    {
        id: '1',
        code: 'DHARURA',
        name: 'DHARURA (Emergency Loans)',
        description: 'Quick emergency loans with fast approval - Perfect for unexpected expenses',
        interest_rate: '15.00',
        min_amount: '100000',
        max_amount: '5000000',
        term_months: 6,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        code: 'BIASHARA',
        name: 'BIASHARA (Business Loans)',
        description: 'Financing for business growth and expansion - Grow your enterprise',
        interest_rate: '12.50',
        min_amount: '500000',
        max_amount: '50000000',
        term_months: 24,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '3',
        code: 'MISHAHARA',
        name: 'MISHAHARA (Salary Advance)',
        description: 'Salary advance with competitive rates - Bridge the gap until payday',
        interest_rate: '10.00',
        min_amount: '50000',
        max_amount: '3000000',
        term_months: 12,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

// Mock customer profiles
export const mockCustomers: Profile[] = [
    {
        id: 'customer-1',
        email: 'james.mwangi@example.com',
        full_name: 'James Mwangi',
        role: 'customer',
        phone: '+255 712 345 678',
        avatar_url: '',
        branch_id: null,
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'customer-2',
        email: 'fatuma.hassan@example.com',
        full_name: 'Fatuma Hassan',
        role: 'customer',
        phone: '+255 713 456 789',
        avatar_url: '',
        branch_id: null,
        created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'customer-3',
        email: 'peter.john@example.com',
        full_name: 'Peter John',
        role: 'customer',
        phone: '+255 714 567 890',
        avatar_url: '',
        branch_id: null,
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
    },
];

// Mock customer profile (current logged in user)
export const mockCustomerProfile: Profile = mockCustomers[0];

// Mock loan applications with more variety
export const mockLoanApplications: any[] = [
    {
        id: 'app-1',
        customer_id: 'customer-1',
        product_id: '2',
        amount: '5000000',
        purpose: 'Business expansion - opening new branch in Arusha',
        status: 'pending',
        applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        reviewed_at: null,
        reviewer_id: null,
        notes: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        product: mockLoanProducts[1],
        customer: mockCustomers[0],
    },
    {
        id: 'app-2',
        customer_id: 'customer-2',
        product_id: '1',
        amount: '800000',
        purpose: 'Medical emergency - hospital bills',
        status: 'pending',
        applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        reviewed_at: null,
        reviewer_id: null,
        notes: null,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        product: mockLoanProducts[0],
        customer: mockCustomers[1],
    },
    {
        id: 'app-3',
        customer_id: 'customer-1',
        product_id: '3',
        amount: '1500000',
        purpose: 'Home renovation and repairs',
        status: 'approved',
        applied_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        reviewed_at: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(),
        reviewer_id: 'admin-1',
        notes: 'Approved - Good credit history',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(),
        product: mockLoanProducts[2],
        customer: mockCustomers[0],
    },
    {
        id: 'app-4',
        customer_id: 'customer-3',
        product_id: '2',
        amount: '10000000',
        purpose: 'Purchase delivery vehicles for logistics business',
        status: 'rejected',
        applied_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        reviewed_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        reviewer_id: 'admin-1',
        notes: 'Insufficient collateral for requested amount',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        product: mockLoanProducts[1],
        customer: mockCustomers[2],
    },
];

// Mock active loans with detailed information
export const mockActiveLoans: any[] = [
    {
        id: 'loan-1',
        application_id: 'app-3',
        customer_id: 'customer-1',
        product_id: '3',
        principal_amount: '1500000',
        interest_rate: '10.00',
        term_months: 12,
        monthly_payment: '132150',
        total_amount: '1585800',
        balance: '1190000',
        status: 'active',
        disbursed_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        product: mockLoanProducts[2],
        customer: mockCustomers[0],
    },
    {
        id: 'loan-2',
        application_id: 'app-5',
        customer_id: 'customer-2',
        product_id: '1',
        principal_amount: '2500000',
        interest_rate: '15.00',
        term_months: 6,
        monthly_payment: '450000',
        total_amount: '2700000',
        balance: '1800000',
        status: 'active',
        disbursed_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        product: mockLoanProducts[0],
        customer: mockCustomers[1],
    },
    {
        id: 'loan-3',
        application_id: 'app-6',
        customer_id: 'customer-3',
        product_id: '2',
        principal_amount: '15000000',
        interest_rate: '12.50',
        term_months: 24,
        monthly_payment: '710000',
        total_amount: '17040000',
        balance: '15300000',
        status: 'active',
        disbursed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        product: mockLoanProducts[1],
        customer: mockCustomers[2],
    },
];

// Mock customer statistics (for current logged-in customer)
export const mockCustomerStats = {
    activeLoans: 1,
    totalBorrowed: 1500000,
    totalRepaid: 395800,
    pendingApplications: 1,
};

// Mock admin statistics (aggregated from all data)
export const mockAdminStats = {
    totalLoans: 125,
    activeLoans: 89,
    totalCustomers: 450,
    pendingApplications: 2,
    totalDisbursed: 450000000,
    totalRepayments: 280000000,
    overduePayments: 12,
};

// Additional mock data exports
export const mockAllApplications = mockLoanApplications;
export const mockAllLoans = mockActiveLoans;
export const mockAllCustomers = mockCustomers;
