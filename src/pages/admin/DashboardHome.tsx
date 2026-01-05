import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { mockAdminStats } from '@/lib/mockData';
import {
  CreditCard,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totalLoans: number;
  activeLoans: number;
  totalCustomers: number;
  pendingApplications: number;
  totalDisbursed: number;
  totalRepayments: number;
  overduePayments: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLoans: 0,
    activeLoans: 0,
    totalCustomers: 0,
    pendingApplications: 0,
    totalDisbursed: 0,
    totalRepayments: 0,
    overduePayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {


      const loansRef = collection(db, 'loans');
      const profilesRef = collection(db, 'profiles');
      const applicationsRef = collection(db, 'loan_applications');
      const repaymentsRef = collection(db, 'repayments');
      const schedulesRef = collection(db, 'repayment_schedules');

      // Fetch total loans
      const totalLoansSnap = await getCountFromServer(loansRef);
      const totalLoans = totalLoansSnap.data().count;

      // Fetch active loans
      const qActiveLoans = query(loansRef, where('status', '==', 'active'));
      const activeLoansSnap = await getCountFromServer(qActiveLoans);
      const activeLoans = activeLoansSnap.data().count;

      // Fetch customers
      const qCustomers = query(profilesRef, where('role', '==', 'customer'));
      const totalCustomersSnap = await getCountFromServer(qCustomers);
      const totalCustomers = totalCustomersSnap.data().count;

      // Fetch pending applications
      const qPendingApps = query(applicationsRef, where('status', '==', 'pending'));
      const pendingApplicationsSnap = await getCountFromServer(qPendingApps);
      const pendingApplications = pendingApplicationsSnap.data().count;

      // Fetch total disbursed
      // Ideally we should store this as an aggregate or use an authorized backend function, 
      // but reading all loans is the only client-side way without aggregations extension.
      const loansSnap = await getDocs(loansRef);
      const loansData = loansSnap.docs.map(doc => doc.data());
      const totalDisbursed = loansData.reduce((sum, loan) => sum + parseFloat(loan.principal_amount), 0);

      // Fetch total repayments
      const repaymentsSnap = await getDocs(repaymentsRef);
      const repaymentsData = repaymentsSnap.docs.map(doc => doc.data());
      const totalRepayments = repaymentsData.reduce((sum, repayment) => sum + parseFloat(repayment.amount), 0);

      // Fetch overdue payments
      const today = new Date().toISOString().split('T')[0];
      const qOverdue = query(
        schedulesRef,
        where('status', '==', 'pending'),
        where('due_date', '<', today)
      );
      const overduePaymentsSnap = await getCountFromServer(qOverdue);
      const overduePayments = overduePaymentsSnap.data().count;

      setStats({
        totalLoans,
        activeLoans,
        totalCustomers,
        pendingApplications,
        totalDisbursed,
        totalRepayments,
        overduePayments,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Loans',
      value: stats.totalLoans,
      icon: CreditCard,
      trend: { value: '+12%', positive: true },
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Active Loans',
      value: stats.activeLoans,
      icon: TrendingUp,
      trend: { value: '+8%', positive: true },
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      trend: { value: '+23%', positive: true },
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: FileText,
      trend: { value: '-5%', positive: false },
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
    },
  ];

  const financialStats = [
    {
      title: 'Total Disbursed',
      value: formatCurrency(stats.totalDisbursed),
      icon: DollarSign,
      bgColor: 'bg-kep-blue/10',
      iconColor: 'text-kep-blue',
    },
    {
      title: 'Total Repayments',
      value: formatCurrency(stats.totalRepayments),
      icon: TrendingUp,
      bgColor: 'bg-kep-lime/10',
      iconColor: 'text-kep-lime',
    },
    {
      title: 'Overdue Payments',
      value: stats.overduePayments,
      icon: Clock,
      bgColor: 'bg-destructive/10',
      iconColor: 'text-destructive',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your loan management system</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1">
                {stat.trend.positive ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive mr-1" />
                )}
                <span className={`text-xs ${stat.trend.positive ? 'text-green-500' : 'text-destructive'}`}>
                  {stat.trend.value} from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {financialStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Recent loan applications will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
