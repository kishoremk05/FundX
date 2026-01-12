// Database types for Firebase/Firestore

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
                    is_active: boolean
                    two_factor_enabled: boolean
                    two_factor_secret: string | null
                    email_verified: boolean
                    language: string
                    theme: 'light' | 'dark' | 'system'
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
                    is_active?: boolean
                    two_factor_enabled?: boolean
                    two_factor_secret?: string | null
                    email_verified?: boolean
                    language?: string
                    theme?: 'light' | 'dark' | 'system'
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
                    is_active?: boolean
                    two_factor_enabled?: boolean
                    two_factor_secret?: string | null
                    email_verified?: boolean
                    language?: string
                    theme?: 'light' | 'dark' | 'system'
                    created_at?: string
                    updated_at?: string
                }
            }
            branches: {
                Row: {
                    id: string
                    name: string
                    code: string
                    address: string | null
                    city: string | null
                    state: string | null
                    country: string | null
                    phone: string | null
                    email: string | null
                    manager_id: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code: string
                    address?: string | null
                    city?: string | null
                    state?: string | null
                    country?: string | null
                    phone?: string | null
                    email?: string | null
                    manager_id?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string
                    address?: string | null
                    city?: string | null
                    state?: string | null
                    country?: string | null
                    phone?: string | null
                    email?: string | null
                    manager_id?: string | null
                    is_active?: boolean
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
            accounts: {
                Row: {
                    id: string
                    name: string
                    type: 'cash' | 'bank' | 'mobile_money'
                    account_number: string | null
                    bank_name: string | null
                    balance: number
                    is_active: boolean
                    branch_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    type: 'cash' | 'bank' | 'mobile_money'
                    account_number?: string | null
                    bank_name?: string | null
                    balance?: number
                    is_active?: boolean
                    branch_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: 'cash' | 'bank' | 'mobile_money'
                    account_number?: string | null
                    bank_name?: string | null
                    balance?: number
                    is_active?: boolean
                    branch_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    account_id: string
                    type: 'credit' | 'debit'
                    category: 'loan_disbursement' | 'loan_repayment' | 'expense' | 'deposit' | 'withdrawal' | 'transfer' | 'other'
                    amount: number
                    balance_after: number
                    reference: string | null
                    description: string | null
                    related_id: string | null
                    related_type: string | null
                    created_by: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    account_id: string
                    type: 'credit' | 'debit'
                    category: 'loan_disbursement' | 'loan_repayment' | 'expense' | 'deposit' | 'withdrawal' | 'transfer' | 'other'
                    amount: number
                    balance_after: number
                    reference?: string | null
                    description?: string | null
                    related_id?: string | null
                    related_type?: string | null
                    created_by: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    account_id?: string
                    type?: 'credit' | 'debit'
                    category?: 'loan_disbursement' | 'loan_repayment' | 'expense' | 'deposit' | 'withdrawal' | 'transfer' | 'other'
                    amount?: number
                    balance_after?: number
                    reference?: string | null
                    description?: string | null
                    related_id?: string | null
                    related_type?: string | null
                    created_by?: string
                    created_at?: string
                }
            }
            expenses: {
                Row: {
                    id: string
                    category_id: string | null
                    account_id: string
                    amount: number
                    description: string
                    receipt_url: string | null
                    expense_date: string
                    status: 'pending' | 'approved' | 'rejected'
                    approved_by: string | null
                    approved_at: string | null
                    created_by: string
                    branch_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    category_id?: string | null
                    account_id: string
                    amount: number
                    description: string
                    receipt_url?: string | null
                    expense_date: string
                    status?: 'pending' | 'approved' | 'rejected'
                    approved_by?: string | null
                    approved_at?: string | null
                    created_by: string
                    branch_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    category_id?: string | null
                    account_id?: string
                    amount?: number
                    description?: string
                    receipt_url?: string | null
                    expense_date?: string
                    status?: 'pending' | 'approved' | 'rejected'
                    approved_by?: string | null
                    approved_at?: string | null
                    created_by?: string
                    branch_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            expense_categories: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            notes: {
                Row: {
                    id: string
                    entity_type: 'customer' | 'loan' | 'application' | 'branch' | 'other'
                    entity_id: string
                    content: string
                    is_private: boolean
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    entity_type: 'customer' | 'loan' | 'application' | 'branch' | 'other'
                    entity_id: string
                    content: string
                    is_private?: boolean
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    entity_type?: 'customer' | 'loan' | 'application' | 'branch' | 'other'
                    entity_id?: string
                    content?: string
                    is_private?: boolean
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            contacts: {
                Row: {
                    id: string
                    name: string
                    email: string
                    phone: string | null
                    subject: string
                    message: string
                    status: 'new' | 'read' | 'replied' | 'closed'
                    assigned_to: string | null
                    reply: string | null
                    replied_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email: string
                    phone?: string | null
                    subject: string
                    message: string
                    status?: 'new' | 'read' | 'replied' | 'closed'
                    assigned_to?: string | null
                    reply?: string | null
                    replied_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    phone?: string | null
                    subject?: string
                    message?: string
                    status?: 'new' | 'read' | 'replied' | 'closed'
                    assigned_to?: string | null
                    reply?: string | null
                    replied_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            settings: {
                Row: {
                    id: string
                    category: 'company' | 'app' | 'email' | 'seo' | 'theme' | 'security' | 'storage' | 'landing'
                    key: string
                    value: Json
                    updated_by: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    category: 'company' | 'app' | 'email' | 'seo' | 'theme' | 'security' | 'storage' | 'landing'
                    key: string
                    value: Json
                    updated_by?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    category?: 'company' | 'app' | 'email' | 'seo' | 'theme' | 'security' | 'storage' | 'landing'
                    key?: string
                    value?: Json
                    updated_by?: string | null
                    updated_at?: string
                }
            }
            permissions: {
                Row: {
                    id: string
                    role: 'admin' | 'customer' | 'branch_manager' | 'loan_officer'
                    module: string
                    can_view: boolean
                    can_create: boolean
                    can_edit: boolean
                    can_delete: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    role: 'admin' | 'customer' | 'branch_manager' | 'loan_officer'
                    module: string
                    can_view?: boolean
                    can_create?: boolean
                    can_edit?: boolean
                    can_delete?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    role?: 'admin' | 'customer' | 'branch_manager' | 'loan_officer'
                    module?: string
                    can_view?: boolean
                    can_create?: boolean
                    can_edit?: boolean
                    can_delete?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            subscriptions: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    price: number
                    billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime'
                    features: Json
                    max_users: number
                    max_branches: number
                    max_loans: number
                    storage_limit_mb: number
                    is_active: boolean
                    is_popular: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    price: number
                    billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime'
                    features: Json
                    max_users?: number
                    max_branches?: number
                    max_loans?: number
                    storage_limit_mb?: number
                    is_active?: boolean
                    is_popular?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    billing_cycle?: 'monthly' | 'quarterly' | 'yearly' | 'lifetime'
                    features?: Json
                    max_users?: number
                    max_branches?: number
                    max_loans?: number
                    storage_limit_mb?: number
                    is_active?: boolean
                    is_popular?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            coupons: {
                Row: {
                    id: string
                    code: string
                    discount_type: 'percentage' | 'fixed'
                    discount_value: number
                    max_uses: number | null
                    used_count: number
                    expires_at: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    discount_type: 'percentage' | 'fixed'
                    discount_value: number
                    max_uses?: number | null
                    used_count?: number
                    expires_at?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    code?: string
                    discount_type?: 'percentage' | 'fixed'
                    discount_value?: number
                    max_uses?: number | null
                    used_count?: number
                    expires_at?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            coupon_history: {
                Row: {
                    id: string
                    coupon_id: string
                    user_id: string
                    subscription_id: string | null
                    discount_amount: number
                    used_at: string
                }
                Insert: {
                    id?: string
                    coupon_id: string
                    user_id: string
                    subscription_id?: string | null
                    discount_amount: number
                    used_at?: string
                }
                Update: {
                    id?: string
                    coupon_id?: string
                    user_id?: string
                    subscription_id?: string | null
                    discount_amount?: number
                    used_at?: string
                }
            }
            email_templates: {
                Row: {
                    id: string
                    name: string
                    type: string
                    subject: string
                    body: string
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    type: string
                    subject: string
                    body: string
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: string
                    subject?: string
                    body?: string
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            landing_page_content: {
                Row: {
                    id: string
                    section_type: string
                    title: string | null
                    subtitle: string | null
                    content: string | null
                    button_text: string | null
                    button_link: string | null
                    image_url: string | null
                    order: number
                    is_active: boolean
                    updated_by: string | null
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    section_type: string
                    title?: string | null
                    subtitle?: string | null
                    content?: string | null
                    button_text?: string | null
                    button_link?: string | null
                    image_url?: string | null
                    order?: number
                    is_active?: boolean
                    updated_by?: string | null
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    section_type?: string
                    title?: string | null
                    subtitle?: string | null
                    content?: string | null
                    button_text?: string | null
                    button_link?: string | null
                    image_url?: string | null
                    order?: number
                    is_active?: boolean
                    updated_by?: string | null
                    updated_at?: string
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
            account_type: 'cash' | 'bank' | 'mobile_money'
            transaction_type: 'credit' | 'debit'
            transaction_category: 'loan_disbursement' | 'loan_repayment' | 'expense' | 'deposit' | 'withdrawal' | 'transfer' | 'other'
            expense_status: 'pending' | 'approved' | 'rejected'
            contact_status: 'new' | 'read' | 'replied' | 'closed'
            setting_category: 'company' | 'app' | 'email' | 'seo' | 'theme' | 'security' | 'storage' | 'landing'
            discount_type: 'percentage' | 'fixed'
            billing_cycle: 'monthly' | 'yearly'
            entity_type: 'customer' | 'loan' | 'application' | 'branch' | 'other'
        }
    }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Branch = Database['public']['Tables']['branches']['Row']
export type BranchInsert = Database['public']['Tables']['branches']['Insert']
export type BranchUpdate = Database['public']['Tables']['branches']['Update']

export type LoanProduct = Database['public']['Tables']['loan_products']['Row']
export type LoanProductInsert = Database['public']['Tables']['loan_products']['Insert']
export type LoanProductUpdate = Database['public']['Tables']['loan_products']['Update']

export type LoanApplication = Database['public']['Tables']['loan_applications']['Row']
export type LoanApplicationInsert = Database['public']['Tables']['loan_applications']['Insert']
export type LoanApplicationUpdate = Database['public']['Tables']['loan_applications']['Update']

export type Loan = Database['public']['Tables']['loans']['Row']
export type LoanInsert = Database['public']['Tables']['loans']['Insert']
export type LoanUpdate = Database['public']['Tables']['loans']['Update']

export type RepaymentSchedule = Database['public']['Tables']['repayment_schedules']['Row']
export type RepaymentScheduleInsert = Database['public']['Tables']['repayment_schedules']['Insert']
export type RepaymentScheduleUpdate = Database['public']['Tables']['repayment_schedules']['Update']

export type Repayment = Database['public']['Tables']['repayments']['Row']
export type RepaymentInsert = Database['public']['Tables']['repayments']['Insert']
export type RepaymentUpdate = Database['public']['Tables']['repayments']['Update']

export type Account = Database['public']['Tables']['accounts']['Row']
export type AccountInsert = Database['public']['Tables']['accounts']['Insert']
export type AccountUpdate = Database['public']['Tables']['accounts']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']
export type ExpenseCategoryInsert = Database['public']['Tables']['expense_categories']['Insert']
export type ExpenseCategoryUpdate = Database['public']['Tables']['expense_categories']['Update']

export type Note = Database['public']['Tables']['notes']['Row']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
export type NoteUpdate = Database['public']['Tables']['notes']['Update']

export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export type Setting = Database['public']['Tables']['settings']['Row']
export type SettingInsert = Database['public']['Tables']['settings']['Insert']
export type SettingUpdate = Database['public']['Tables']['settings']['Update']

export type Permission = Database['public']['Tables']['permissions']['Row']
export type PermissionInsert = Database['public']['Tables']['permissions']['Insert']
export type PermissionUpdate = Database['public']['Tables']['permissions']['Update']

export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export type Coupon = Database['public']['Tables']['coupons']['Row']
export type CouponInsert = Database['public']['Tables']['coupons']['Insert']
export type CouponUpdate = Database['public']['Tables']['coupons']['Update']

export type CouponHistory = Database['public']['Tables']['coupon_history']['Row']
export type CouponHistoryInsert = Database['public']['Tables']['coupon_history']['Insert']
export type CouponHistoryUpdate = Database['public']['Tables']['coupon_history']['Update']

export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert']
export type EmailTemplateUpdate = Database['public']['Tables']['email_templates']['Update']

export type LandingPageContent = Database['public']['Tables']['landing_page_content']['Row']
export type LandingPageContentInsert = Database['public']['Tables']['landing_page_content']['Insert']
export type LandingPageContentUpdate = Database['public']['Tables']['landing_page_content']['Update']

export type UserRole = Database['public']['Enums']['user_role']
export type LoanStatus = Database['public']['Enums']['loan_status']
export type ActiveLoanStatus = Database['public']['Enums']['active_loan_status']
export type PaymentMethod = Database['public']['Enums']['payment_method']
export type AccountType = Database['public']['Enums']['account_type']
export type TransactionType = Database['public']['Enums']['transaction_type']
export type TransactionCategory = Database['public']['Enums']['transaction_category']
export type ExpenseStatus = Database['public']['Enums']['expense_status']
export type ContactStatus = Database['public']['Enums']['contact_status']
export type SettingCategory = Database['public']['Enums']['setting_category']
export type DiscountType = Database['public']['Enums']['discount_type']
export type BillingCycle = Database['public']['Enums']['billing_cycle']
export type EntityType = Database['public']['Enums']['entity_type']
