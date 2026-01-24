import { Routes, Route } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import ApplyLoan from './ApplyLoan';
import MyLoans from './MyLoans';
import Forms from './Forms';
import GuaranteeForm from './GuaranteeForm';
import LoanAgreementForm from './LoanAgreementForm';

export default function Dashboard() {
  return (
    <Routes>
      <Route index element={<DashboardHome />} />
      <Route path="apply" element={<ApplyLoan />} />
      <Route path="my-loans" element={<MyLoans />} />
      <Route path="forms" element={<Forms />} />
      <Route path="forms/guarantee" element={<GuaranteeForm />} />
      <Route path="forms/loan-agreement" element={<LoanAgreementForm />} />
    </Routes>
  );
}
