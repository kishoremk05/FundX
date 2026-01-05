import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '@/components/layouts/CustomerLayout';
import DashboardHome from './DashboardHome';
import ApplyLoan from './ApplyLoan';
import MyLoans from './MyLoans';

export default function Dashboard() {
  return (
    <CustomerLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="apply" element={<ApplyLoan />} />
        <Route path="my-loans" element={<MyLoans />} />
      </Routes>
    </CustomerLayout>
  );
}
