// Database types will be generated from Supabase schema
// For now, we'll define the core types manually

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    phone: string | null
                    role: 'admin' | 'customer' | 'branch_manager' | 'loan_officer'
                    avatar_url: string | null
                    branch_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    phone?: string | null
                    role?: 'admin' | 'customer' | 'branch_manager' | 'loan_officer'
                    avatar_url?: string | null
                    branch_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    phone?: string | null
                    role?: 'admin' | 'customer' | 'branch_manager' | 'loan_officer'
                    avatar_url?: string | null
                    branch_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            loan_products: {
                Row: {
                    id: string
                    name: string
                    code: string
                    description: string | null
                    interest_rate: number
                    min_amount: number
                    max_amount: number
                    term_months: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code: string
                    description?: string | null
                    interest_rate: number
                    min_amount: number
                    max_amount: number
                    term_months: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string
                    description?: string | null
                    interest_rate?: number
                    min_amount?: number
                    max_amount?: number
                    term_months?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            loan_applications: {
                Row: {
                    id: string
                    customer_id: string
                    product_id: string
                    amount: number
                    purpose: string | null
                    status: 'pending' | 'approved' | 'rejected' | 'disbursed'
                    applied_at: string
                    reviewed_at: string | null
                    reviewer_id: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    customer_id: string
                    product_id: string
                    amount: number
                    purpose?: string | null
                    status?: 'pending' | 'approved' | 'rejected' | 'disbursed'
                    applied_at?: string
                    reviewed_at?: string | null
                    reviewer_id?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    customer_id?: string
                    product_id?: string
                    amount?: number
                    purpose?: string | null
                    status?: 'pending' | 'approved' | 'rejected' | 'disbursed'
                    applied_at?: string
                    reviewed_at?: string | null
                    reviewer_id?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            loans: {
                Row: {
                    id: string
                    application_id: string
                    customer_id: string
                    product_id: string
                    principal_amount: number
                    interest_rate: number
                    term_months: number
                    monthly_payment: number
                    total_amount: number
                    balance: number
                    disbursed_at: string
                    status: 'active' | 'paid' | 'defaulted'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    application_id: string
                    customer_id: string
                    product_id: string
                    principal_amount: number
                    interest_rate: number
                    term_months: number
                    monthly_payment: number
                    total_amount: number
                    balance?: number
                    disbursed_at?: string
                    status?: 'active' | 'paid' | 'defaulted'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    application_id?: string
                    customer_id?: string
                    product_id?: string
                    principal_amount?: number
                    interest_rate?: number
                    term_months?: number
                    monthly_payment?: number
                    total_amount?: number
                    balance?: number
                    disbursed_at?: string
                    status?: 'active' | 'paid' | 'defaulted'
                    created_at?: string
                    updated_at?: string
                }
            }
            repayment_schedules: {
                Row: {
                    id: string
                    loan_id: string
                    installment_number: number
                    due_date: string
                    amount: number
                    principal: number
                    interest: number
                    balance_after: number
                    status: 'pending' | 'paid' | 'overdue'
                    paid_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    loan_id: string
                    installment_number: number
                    due_date: string
                    amount: number
                    principal: number
                    interest: number
                    balance_after: number
                    status?: 'pending' | 'paid' | 'overdue'
                    paid_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    loan_id?: string
                    installment_number?: number
                    due_date?: string
                    amount?: number
                    principal?: number
                    interest?: number
                    balance_after?: number
                    status?: 'pending' | 'paid' | 'overdue'
                    paid_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            repayments: {
                Row: {
                    id: string
                    loan_id: string
                    schedule_id: string | null
                    amount: number
                    payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card'
                    reference: string | null
                    notes: string | null
                    received_by: string
                    paid_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    loan_id: string
                    schedule_id?: string | null
                    amount: number
                    payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card'
                    reference?: string | null
                    notes?: string | null
                    received_by: string
                    paid_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    loan_id?: string
                    schedule_id?: string | null
                    amount?: number
                    payment_method?: 'cash' | 'bank_transfer' | 'mobile_money' | 'card'
                    reference?: string | null
                    notes?: string | null
                    received_by?: string
                    paid_at?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'admin' | 'customer' | 'branch_manager' | 'loan_officer'
            loan_status: 'pending' | 'approved' | 'rejected' | 'disbursed'
            active_loan_status: 'active' | 'paid' | 'defaulted'
            schedule_status: 'pending' | 'paid' | 'overdue'
            payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card'
        }
    }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type LoanProduct = Database['public']['Tables']['loan_products']['Row']
export type LoanApplication = Database['public']['Tables']['loan_applications']['Row']
export type Loan = Database['public']['Tables']['loans']['Row']
export type RepaymentSchedule = Database['public']['Tables']['repayment_schedules']['Row']
export type Repayment = Database['public']['Tables']['repayments']['Row']

export type UserRole = Database['public']['Enums']['user_role']
export type LoanStatus = Database['public']['Enums']['loan_status']
export type ActiveLoanStatus = Database['public']['Enums']['active_loan_status']
export type PaymentMethod = Database['public']['Enums']['payment_method']
