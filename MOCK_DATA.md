# Mock Data Summary

## Customer Portal Data

### Current User
- **Name:** James Mwangi
- **Email:** james.mwangi@example.com
- **Phone:** +255 712 345 678

### Statistics
- Active Loans: 1
- Total Borrowed: 1,500,000 TZS
- Total Repaid: 395,800 TZS
- Pending Applications: 1

### Active Loans
1. **MISHAHARA Loan** - 1,500,000 TZS
   - Monthly Payment: 132,150 TZS
   - Balance: 1,190,000 TZS
   - Status: Active (2 months old)

### Applications
1. **BIASHARA** - 5,000,000 TZS (Pending)
   - Purpose: Business expansion
   - Applied: 2 days ago

---

## Admin Portal Data

### Statistics
- Total Loans: 125
- Active Loans: 89
- Total Customers: 450
- Pending Applications: 2
- Total Disbursed: 450,000,000 TZS
- Total Repayments: 280,000,000 TZS
- Overdue Payments: 12

### Sample Customers (3)
1. James Mwangi - james.mwangi@example.com
2. Fatuma Hassan - fatuma.hassan@example.com
3. Peter John - peter.john@example.com

### Loan Applications (4)
1. James Mwangi - 5M TZS (BIASHARA) - **Pending**
2. Fatuma Hassan - 800K TZS (DHARURA) - **Pending**
3. James Mwangi - 1.5M TZS (MISHAHARA) - Approved
4. Peter John - 10M TZS (BIASHARA) - Rejected

### Active Loans (3)
1. James - 1.5M TZS (MISHAHARA)
2. Fatuma - 2.5M TZS (DHARURA)
3. Peter - 15M TZS (BIASHARA)

### Loan Products (3)
1. DHARURA - 15% p.a. (100K - 5M, 6 months)
2. BIASHARA - 12.5% p.a. (500K - 50M, 24 months)
3. MISHAHARA - 10% p.a. (50K - 3M, 12 months)

---

## What You'll See

**Customer Portal (`/customer`):**
- Dashboard with 1 active loan, 1 pending application
- Loan details with repayment progress
- Apply for new loan form (3 products available)
- My Loans page showing active and pending items

**Admin Portal (`/admin`):**
- Dashboard with comprehensive statistics
- Applications page with 2 pending reviews
- Products page with all 3 loan types
- Mock approval/rejection workflow

All data is stored in `src/lib/mockData.ts` and automatically loads in dev mode!
