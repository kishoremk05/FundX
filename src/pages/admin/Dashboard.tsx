import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHome from './DashboardHome';
import Applications from './Applications';
import Loans from './Loans';
import Borrowers from './Borrowers';
import Repayments from './Repayments';
import Products from './Products';
import Users from './Users';
import Branches from './Branches';
import Accounts from './Accounts';
import Transactions from './Transactions';
import Expenses from './Expenses';
import Contacts from './Contacts';
import Reports from './Reports';
import Notes from './Notes';
import LoanDetails from './LoanDetails';

// Settings
import CompanySettings from './settings/CompanySettings';
import ApplicationSettings from './settings/ApplicationSettings';
import EmailSettings from './settings/EmailSettings';
import AppearanceSettings from './settings/AppearanceSettings';
import SecuritySettings from './settings/SecuritySettings';
import StorageSettings from './settings/StorageSettings';
import SMSIntegration from './settings/SMSIntegration';

// Officer roles that can only access Applications page
const OFFICER_ROLES = ['loan_officer', 'md_finance', 'ops_director', 'ceo', 'finance_officer'];

export default function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const location = useLocation();

  // Check if user is an officer (not admin)
  const isOfficer = profile?.role && OFFICER_ROLES.includes(profile.role);

  // Officers can only access /admin/applications
  if (isOfficer && !location.pathname.startsWith('/admin/applications') && location.pathname !== '/admin/applications') {
    return <Navigate to="/admin/applications" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        {/* Officers go directly to applications */}
        <Route index element={isOfficer ? <Navigate to="/admin/applications" replace /> : <DashboardHome />} />
        <Route path="applications" element={<Applications />} />

        {/* Admin-only routes */}
        <Route path="loans" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Loans />} />
        <Route path="loans/:id" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <LoanDetails />} />
        <Route path="borrowers" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Borrowers />} />
        <Route path="repayments" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Repayments />} />
        <Route path="products" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Products />} />
        <Route path="users" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Users />} />
        <Route path="branches" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Branches />} />
        <Route path="accounts" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Accounts />} />
        <Route path="transactions" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Transactions />} />
        <Route path="expenses" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Expenses />} />
        <Route path="contacts" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Contacts />} />
        <Route path="reports" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Reports />} />
        <Route path="notes" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Notes />} />

        {/* Settings Routes - Admin only */}
        <Route path="settings" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Navigate to="/admin/settings/company" replace />} />
        <Route path="settings/company" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <CompanySettings />} />
        <Route path="settings/application" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <ApplicationSettings />} />
        <Route path="settings/email" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <EmailSettings />} />
        <Route path="settings/appearance" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <AppearanceSettings />} />
        <Route path="settings/security" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <SecuritySettings />} />
        <Route path="settings/storage" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <StorageSettings />} />
        <Route path="settings/payment" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <div className="p-8 text-center text-muted-foreground">Payment Gateway module is under construction.</div>} />
        <Route path="settings/sms" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <SMSIntegration />} />

        {/* Placeholder for settings with no specific page yet */}
        <Route path="settings/localization" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <ApplicationSettings />} />
        <Route path="settings/permissions" element={isOfficer ? <Navigate to="/admin/applications" replace /> : <Users />} />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to={isOfficer ? "/admin/applications" : "/admin"} replace />} />
      </Routes>
    </AdminLayout>
  );
}
