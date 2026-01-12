import { Routes, Route } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import ApplyLoan from './ApplyLoan';
import MyLoans from './MyLoans';

export default function Dashboard() {
  return (
    <Routes>
      <Route index element={<DashboardHome />} />
      <Route path="apply" element={<ApplyLoan />} />
      <Route path="my-loans" element={<MyLoans />} />
    </Routes>
  );
}
