import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import DashboardHome from './DashboardHome';
import Applications from './Applications';
import Loans from './Loans';
import Customers from './Customers';
import Repayments from './Repayments';
import Products from './Products';
import Users from './Users';
import Settings from './Settings';

export default function Dashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="applications" element={<Applications />} />
        <Route path="loans" element={<Loans />} />
        <Route path="customers" element={<Customers />} />
        <Route path="repayments" element={<Repayments />} />
        <Route path="products" element={<Products />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </AdminLayout>
  );
}
