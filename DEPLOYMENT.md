# KEP Microcredit Loan Management SaaS - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or bun package manager
- Supabase account (free tier)
- Vercel account (free tier)
- Git installed

---

## Part 1: Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in with **masaahr9@gmail.com**
3. Click "New Project"
4. Fill in details:
   - **Name:** KEP Microcredit
   - **Database Password:** (create a strong password - save it!)
   - **Region:** Choose closest to Tanzania (e.g., Frankfurt)
   - **Plan:** Free
5. Wait 2-3 minutes for project creation

### Step 2: Run Database Schema

1. In your Supabase project dashboard, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Open `c:\fiverr projects\figma design\figma clone\supabase\schema.sql`
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click "Run" button
7. Verify success message appears

**What this does:**
- Creates 6 tables (profiles, loan_products, loan_applications, loans, repayment_schedules, repayments)
- Sets up Row Level Security policies
- Creates triggers for auto-profile creation
- Seeds 3 loan products

### Step 3: Get API Credentials

1. In Supabase dashboard, click "Settings" > "API"
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJ...` (long string)
3. Keep these handy for next step

### Step 4: Configure Email Authentication

1. Go to "Authentication" > "Providers" in Supabase
2. Make sure "Email" is **Enabled**
3. Scroll to "Email Templates"
4. (Optional) Customize the confirmation email template
5. Save changes

---

## Part 2: Local Development Setup

### Step 1: Install Dependencies

```bash
cd "c:\fiverr projects\figma design\figma clone"
npm install
```

Wait for installation to complete (~2-3 minutes).

### Step 2: Configure Environment Variables

1. Locate the file `.env.local.example` in project root
2. Create a copy named `.env.local` 
3. Edit `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with the values from Step 3 above.

### Step 3: Start Development Server

```bash
npm run dev
```

You should see:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 4: Open Application

Open browser and go to: **http://localhost:5173**

You should see the KEP Microcredit landing page.

---

## Part 3: Create Test Users

### Step 1: Register Customer Account

1. Click "Sign up" or navigate to `/register`
2. Fill in:
   - **Name:** Test Customer
   - **Email:** customer@test.com
   - **Password:** Test123456
3. Click "Create Account"
4. Check email inbox for Supabase confirmation
5. Click confirmation link

### Step 2: Register Admin Account

1. Open new incognito window (or logout)
2. Navigate to `/register`
3. Fill in:
   - **Name:** Admin User
   - **Email:** masaahr9@gmail.com
   - **Password:** (your preferred password)
4. Click "Create Account"
5. Confirm email

### Step 3: Promote Admin User

1. Back to Supabase dashboard
2. Click "SQL Editor"
3. Run this query:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'masaahr9@gmail.com';
```

4. Verify "Success. 1 row affected"

---

## Part 4: Test the Application

### Test Flow 1: Customer Applies for Loan

1. Login as **customer@test.com**
2. Click "Apply for Loan"
3. Select "BIASHARA (Business Loans)"
4. Enter amount: **5000000** (5 million TZS)
5. Purpose: "Business expansion"
6. Click "Calculate Repayment"
7. Review the breakdown
8. Click "Submit Application"
9. Go to "My Loans" → Application shows as PENDING

### Test Flow 2: Admin Approves Loan

1. Logout customer
2. Login as **masaahr9@gmail.com**
3. Go to "Loan Applications"
4. Click "Review" on the pending application
5. Review details
6. Add notes: "Approved"
7. Click "Approve" button
8. Wait for success message

### Test Flow 3: Verify Loan Created

1. Go to Supabase dashboard
2. Click "Table Editor"
3. Select "loans" table
4. Verify new loan record exists
5. Select "repayment_schedules" table
6. Verify 24 repayment records created (for BIASHARA)

### Test Flow 4: Customer Sees Loan

1. Logout admin
2. Login as customer
3. Go to "My Loans"
4. Click "Active Loans" tab
5. Verify loan appears with balance, monthly payment

---

## Part 5: Vercel Deployment

### Step 1: Push to GitHub (if not already)

```bash
cd "c:\fiverr projects\figma design\figma clone"
git init
git add .
git commit -m "Initial commit - Loan Management SaaS MVP"
```

Create repository on GitHub, then:

```bash
git remote add origin https://github.com/yourusername/kep-microcredit.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure Project:
   - **Framework Preset:** Vite
   - **Root Directory:** ./ (leave default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click "Environment Variables"
6. Add:
   - **Name:** `VITE_SUPABASE_URL`  
     **Value:** (your Supabase URL)
   - **Name:** `VITE_SUPABASE_ANON_KEY`  
     **Value:** (your Supabase anon key)
7. Click "Deploy"

Wait 2-3 minutes for deployment.

### Step 3: Verify Production Deployment

1. Click the generated URL (e.g., `https://kep-microcredit.vercel.app`)
2. Test login
3. Test customer application flow
4. Test admin approval flow

---

## Part 6: Production Configuration

### Update Supabase Site URL

1. Go to Supabase dashboard
2. Click "Authentication" > "URL Configuration"
3. Add your Vercel URL to:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** Add `https://your-app.vercel.app/**`
4. Save

This ensures email confirmation links redirect to production.

### (Optional) Custom Domain

1. In Vercel project settings > "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs accordingly

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:** Ensure `.env.local` exists and has correct values. Restart dev server.

### Issue: "Network error" when testing

**Solution:** Check Supabase project is active. Verify URL and key in `.env.local`.

### Issue: Cannot login after registration

**Solution:** Check email spam folder. Verify email provider enabled in Supabase.

### Issue: 403 Access Denied when accessing /admin

**Solution:** Run SQL to update user role to 'admin' in profiles table.

### Issue: Loan approval fails

**Solution:** Check browser console for errors. Verify application status is 'pending'.

### Issue: Build fails on Vercel

**Solution:** 
1. Verify all dependencies in package.json
2. Check build logs for specific error
3. Ensure environment variables are set
4. Try local build: `npm run build`

---

## Post-Deployment Checklist

✅ Supabase project created  
✅ Database schema executed  
✅ Environment variables configured  
✅ Local development tested  
✅ Admin user created  
✅ Test loan application submitted  
✅ Test loan approved  
✅ Vercel deployment successful  
✅ Production URL accessible  
✅ Supabase redirect URLs updated  

---

## Security Best Practices

### Production Considerations

1. **Change Default Passwords:** Update all test account passwords
2. **Disable Signups (Optional):** In Supabase > Authentication > Providers > Email > "Enable email signup" OFF
3. **Rate Limiting:** Configure in Supabase > API Settings
4. **Environment Variables:** NEVER commit `.env.local` to Git (already in .gitignore)
5. **RLS Policies:** Already configured, but review for your use case
6. **Database Backups:** Enable in Supabase > Database > Backups (paid feature)

---

## Maintenance

### Daily Backups (Manual)

```sql
-- In Supabase SQL Editor
-- Export data
COPY (SELECT * FROM profiles) TO '/path/to/backup/profiles.csv' CSV HEADER;
COPY (SELECT * FROM loan_applications) TO '/path/to/backup/applications.csv' CSV HEADER;
-- Repeat for all tables
```

### Monitoring

- **Supabase Dashboard:** Monitor database size, API requests
- **Vercel Analytics:** Track page views, performance
- **Error Tracking:** Check browser console on production

---

## Support

For issues:
1. Check [Implementation Plan](file:///C:/Users/kisho/.gemini/antigravity/brain/8b2c73ee-4511-4bde-855e-c9fe472a859c/implementation_plan.md)
2. Review [Walkthrough](file:///C:/Users/kisho/.gemini/antigravity/brain/8b2c73ee-4511-4bde-855e-c9fe472a859c/walkthrough.md)
3. Check Supabase logs
4. Review Vercel build logs

---

## What's Next?

After successful deployment, you can:
1. Customize loan products (add/edit in Supabase)
2. Invite real users
3. Monitor applications
4. Plan Phase 2 features (payment recording, email notifications, etc.)

**Your MVP is now live! 🎉**
