-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (
        role IN (
            'admin',
            'customer',
            'branch_manager',
            'loan_officer'
        )
    ),
    avatar_url TEXT,
    branch_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Loan Products
CREATE TABLE loan_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    interest_rate DECIMAL(5, 2) NOT NULL, -- Annual interest rate percentage
    min_amount DECIMAL(12, 2) NOT NULL,
    max_amount DECIMAL(12, 2) NOT NULL,
    term_months INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Loan Applications
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    customer_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES loan_products (id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    purpose TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'approved',
            'rejected',
            'disbursed'
        )
    ),
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewer_id UUID REFERENCES profiles (id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Active Loans
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    application_id UUID NOT NULL REFERENCES loan_applications (id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES loan_products (id) ON DELETE RESTRICT,
    principal_amount DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    term_months INTEGER NOT NULL,
    monthly_payment DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    balance DECIMAL(12, 2) NOT NULL,
    disbursed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'paid', 'defaulted')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Repayment Schedules
CREATE TABLE repayment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    loan_id UUID NOT NULL REFERENCES loans (id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    principal DECIMAL(12, 2) NOT NULL,
    interest DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'paid', 'overdue')
    ),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (loan_id, installment_number)
);

-- Repayments
CREATE TABLE repayments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    loan_id UUID NOT NULL REFERENCES loans (id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES repayment_schedules (id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (
        payment_method IN (
            'cash',
            'bank_transfer',
            'mobile_money',
            'card'
        )
    ),
    reference TEXT,
    notes TEXT,
    received_by UUID NOT NULL REFERENCES profiles (id) ON DELETE RESTRICT,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_role ON profiles (role);

CREATE INDEX idx_profiles_email ON profiles (email);

CREATE INDEX idx_loan_applications_customer ON loan_applications (customer_id);

CREATE INDEX idx_loan_applications_status ON loan_applications (status);

CREATE INDEX idx_loans_customer ON loans (customer_id);

CREATE INDEX idx_loans_status ON loans (status);

CREATE INDEX idx_repayment_schedules_loan ON repayment_schedules (loan_id);

CREATE INDEX idx_repayments_loan ON repayments (loan_id);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;

ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

ALTER TABLE repayment_schedules ENABLE ROW LEVEL SECURITY;

ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid () = id);

CREATE POLICY "Admins can view all profiles" ON profiles FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

-- Loan products policies (public read, admin write)
CREATE POLICY "Anyone can view active loan products" ON loan_products FOR
SELECT USING (is_active = true);

CREATE POLICY "Admins can manage loan products" ON loan_products FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- Loan applications policies
CREATE POLICY "Customers can view own applications" ON loan_applications FOR
SELECT USING (customer_id = auth.uid ());

CREATE POLICY "Customers can create applications" ON loan_applications FOR
INSERT
WITH
    CHECK (customer_id = auth.uid ());

CREATE POLICY "Admins can view all applications" ON loan_applications FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('admin', 'loan_officer')
        )
    );

CREATE POLICY "Admins can update applications" ON loan_applications FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('admin', 'loan_officer')
    )
);

-- Loans policies
CREATE POLICY "Customers can view own loans" ON loans FOR
SELECT USING (customer_id = auth.uid ());

CREATE POLICY "Admins can view all loans" ON loans FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('admin', 'loan_officer')
        )
    );

CREATE POLICY "Admins can manage loans" ON loans FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('admin', 'loan_officer')
    )
);

-- Repayment schedules policies
CREATE POLICY "Customers can view own schedules" ON repayment_schedules FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM loans
            WHERE
                loans.id = repayment_schedules.loan_id
                AND loans.customer_id = auth.uid ()
        )
    );

CREATE POLICY "Admins can view all schedules" ON repayment_schedules FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('admin', 'loan_officer')
        )
    );

CREATE POLICY "Admins can manage schedules" ON repayment_schedules FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('admin', 'loan_officer')
    )
);

-- Repayments policies
CREATE POLICY "Customers can view own repayments" ON repayments FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM loans
            WHERE
                loans.id = repayments.loan_id
                AND loans.customer_id = auth.uid ()
        )
    );

CREATE POLICY "Admins can view all repayments" ON repayments FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('admin', 'loan_officer')
        )
    );

CREATE POLICY "Admins can manage repayments" ON repayments FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('admin', 'loan_officer')
    )
);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_loan_products_updated_at BEFORE UPDATE ON loan_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_repayment_schedules_updated_at BEFORE UPDATE ON repayment_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default loan products
INSERT INTO
    loan_products (
        name,
        code,
        description,
        interest_rate,
        min_amount,
        max_amount,
        term_months,
        is_active
    )
VALUES (
        'DHARURA (Emergency Loans)',
        'DHARURA',
        'Quick emergency loans for urgent financial needs with fast approval',
        15.00,
        100000,
        5000000,
        6,
        true
    ),
    (
        'BIASHARA (Business Loans)',
        'BIASHARA',
        'Financing for business growth, expansion and working capital needs',
        12.50,
        500000,
        50000000,
        24,
        true
    ),
    (
        'MISHAHARA (Salary Advance)',
        'MISHAHARA',
        'Salary advance loans for salaried employees with competitive rates',
        10.00,
        50000,
        3000000,
        12,
        true
    );

-- Insert admin user (you'll need to create this user in Supabase Auth first)
-- Then update their role:
-- UPDATE profiles SET role = 'admin' WHERE email = 'masaahr9@gmail.com';