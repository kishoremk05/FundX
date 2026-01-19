import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
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

export default function Dashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="applications" element={<Applications />} />
        <Route path="loans" element={<Loans />} />
        <Route path="loans/:id" element={<LoanDetails />} />
        <Route path="borrowers" element={<Borrowers />} />
        <Route path="repayments" element={<Repayments />} />
        <Route path="products" element={<Products />} />
        <Route path="users" element={<Users />} />
        <Route path="branches" element={<Branches />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notes" element={<Notes />} />

        {/* Settings Routes */}
        <Route path="settings" element={<Navigate to="/admin/settings/company" replace />} />
        <Route path="settings/company" element={<CompanySettings />} />
        <Route path="settings/application" element={<ApplicationSettings />} />
        <Route path="settings/email" element={<EmailSettings />} />
        <Route path="settings/appearance" element={<AppearanceSettings />} />
        <Route path="settings/security" element={<SecuritySettings />} />
        <Route path="settings/storage" element={<StorageSettings />} />
        <Route path="settings/payment" element={<div className="p-8 text-center text-muted-foreground">Payment Gateway module is under construction.</div>} />
        <Route path="settings/sms" element={<SMSIntegration />} />

        {/* Placeholder for settings with no specific page yet */}
        <Route path="settings/localization" element={<ApplicationSettings />} />
        <Route path="settings/permissions" element={<Users />} />

        {/* 404 Redirect to dashboard */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
