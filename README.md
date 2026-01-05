# KEP Microcredit Loan Management SaaS - README

## Overview

A complete loan management SaaS application for KEP Microcredit, built with React, TypeScript, and Supabase.

## Features

✅ **Authentication** - Secure login/registration with Supabase Auth  
✅ **Admin Dashboard** - Real-time loan statistics and management  
✅ **Customer Portal** - Apply for loans and track applications  
✅ **Loan Products** - DHARURA, BIASHARA, MISHAHARA (pre-configured)  
✅ **Approval Workflow** - Admin review and approve/reject applications  
✅ **Automatic Calculations** - Loan repayment schedules auto-generated  
✅ **Role-Based Access** - Secure data isolation via Row Level Security  

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** TailwindCSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth)
- **Deployment:** Vercel
- **State:** TanStack Query

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- npm or bun

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/kep-microcredit.git
cd kep-microcredit

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# Then run dev server
npm run dev
```

Visit **http://localhost:5173**

## Setup Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication guards
│   ├── layouts/       # Admin & Customer layouts
│   └── ui/            # shadcn/ui components
├── contexts/          # React contexts (Auth)
├── lib/               # Supabase client, types
├── pages/
│   ├── admin/         # Admin dashboard pages
│   ├── auth/          # Login/Register
│   └── customer/      # Customer portal pages
└── App.tsx            # Main router

supabase/
└── schema.sql         # Database schema & RLS policies
```

## Database Schema

- `profiles` - User profiles (extends auth.users)
- `loan_products` - Loan types (DHARURA, BIASHARA, MISHAHARA)
- `loan_applications` - Customer loan requests
- `loans` - Active loans
- `repayment_schedules` - Payment schedules
- `repayments` - Payment records

## Default Loan Products

| Product | Interest Rate | Term | Min Amount | Max Amount |
|---------|---------------|------|------------|------------|
| DHARURA | 15% p.a. | 6 months | 100,000 TZS | 5,000,000 TZS |
| BIASHARA | 12.5% p.a. | 24 months | 500,000 TZS | 50,000,000 TZS |
| MISHAHARA | 10% p.a. | 12 months | 50,000 TZS | 3,000,000 TZS |

## User Roles

- **Customer** - Can apply for loans, view own loans
- **Admin** - Can approve/reject applications, view all data
- **Loan Officer** - Same as admin (future feature)

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

Set environment variables in Vercel dashboard.

## Testing

### Create Admin User

After registering, update role in Supabase:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

### Test Workflow

1. Register customer account
2. Apply for loan
3. Login as admin
4. Approve loan application
5. Verify loan created with repayment schedule

## Documentation

- [Implementation Plan](./brain/implementation_plan.md) - Technical architecture
- [Feature Gap Analysis](./brain/feature_gap_analysis.md) - What's implemented vs roadmap
- [Walkthrough](./brain/walkthrough.md) - Detailed feature walkthrough
- [Deployment Guide](./DEPLOYMENT.md) - Setup instructions

## Known Limitations (MVP)

- No payment recording UI (admin can't record payments yet)
- No email/SMS notifications
- No payment gateway integration
- No file uploads (customer documents)
- Tables have no pagination/search
- Mobile sidebar toggle not functional

See Phase 2 roadmap in walkthrough.md.

## Support

For issues or questions:
1. Check documentation in `/brain` folder
2. Review Supabase logs
3. Check browser console for errors

## License

Proprietary - KEP Microcredit Limited

## Credits

Built with:
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---

**Version:** MVP 1.0  
**Status:** Production Ready  
**Last Updated:** January 2026
