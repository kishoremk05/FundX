import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { mockCustomerStats } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, FileText, DollarSign, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CustomerStats {
  activeLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  pendingApplications: number;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CustomerStats>({
    activeLoans: 0,
    totalBorrowed: 0,
    totalRepaid: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, wait for user
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {


      if (!user) return;

      const loansRef = collection(db, 'loans');
      const applicationsRef = collection(db, 'loan_applications');
      const repaymentsRef = collection(db, 'repayments');

      // Fetch active loans count
      const qActive = query(
        loansRef,
        where('customer_id', '==', user.uid),
        where('status', '==', 'active')
      );
      const activeLoansSnapshot = await getCountFromServer(qActive);
      const activeLoans = activeLoansSnapshot.data().count;

      // Fetch total borrowed
      const qAllLoans = query(loansRef, where('customer_id', '==', user.uid));
      const loansSnapshot = await getDocs(qAllLoans);
      const loansData = loansSnapshot.docs.map(doc => doc.data());

      const totalBorrowed = loansData.reduce((sum, loan) => sum + parseFloat(loan.principal_amount), 0);

      // Fetch total repaid
      let totalRepaid = 0;
      const loanIds = loansData.map(loan => loan.id); // Assuming loan objects have 'id' inside data or we need doc.id

      if (loanIds.length > 0) {
        // Firestore 'in' query supports up to 10 items. Chunking may be needed for production.
        // For now, handling small batches.
        const chunks = [];
        for (let i = 0; i < loanIds.length; i += 10) {
          chunks.push(loanIds.slice(i, i + 10));
        }

        for (const chunk of chunks) {
          const qRepayments = query(repaymentsRef, where('loan_id', 'in', chunk));
          const repaymentsSnapshot = await getDocs(qRepayments);
          repaymentsSnapshot.forEach(doc => {
            totalRepaid += parseFloat(doc.data().amount);
          });
        }
      }

      // Fetch pending applications
      const qPendingApps = query(
        applicationsRef,
        where('customer_id', '==', user.uid),
        where('status', '==', 'pending')
      );
      const pendingAppsSnapshot = await getCountFromServer(qPendingApps);
      const pendingApplications = pendingAppsSnapshot.data().count;

      setStats({
        activeLoans,
        totalBorrowed,
        totalRepaid,
        pendingApplications,
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
      title: 'Active Loans',
      value: stats.activeLoans,
      icon: CreditCard,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Total Borrowed',
      value: formatCurrency(stats.totalBorrowed),
      icon: TrendingUp,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Total Repaid',
      value: formatCurrency(stats.totalRepaid),
      icon: DollarSign,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: FileText,
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
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
        <h1 className="text-3xl font-heading font-bold text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your loan portfolio</p>
      </div>

      {/* Stats Grid */}
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link to="/customer/apply">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Apply for New Loan
            </Button>
          </Link>
          <Link to="/customer/my-loans">
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              View My Loans
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Loan Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Repayment Progress</span>
              <span className="text-sm font-semibold">
                {stats.totalRepaid > 0
                  ? Math.round((stats.totalRepaid / stats.totalBorrowed) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-kep-lime h-2 rounded-full transition-all"
                style={{
                  width: `${stats.totalRepaid > 0
                    ? Math.round((stats.totalRepaid / stats.totalBorrowed) * 100)
                    : 0}%`
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Paid: {formatCurrency(stats.totalRepaid)}</span>
              <span>Total: {formatCurrency(stats.totalBorrowed)}</span>
            </div>
          </div>

          {stats.activeLoans > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats.totalBorrowed - stats.totalRepaid)}
                  </p>
                </div>
                <Link to="/customer/my-loans">
                  <Button variant="outline" size="sm">
                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>

          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.pendingApplications > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-1">
                  <FileText className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Loan Application Pending</p>
                  <p className="text-sm text-muted-foreground">
                    Your application is being reviewed by our team
                  </p>
                  <Link to="/customer/my-loans">
                    <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-orange-600">
                      Track Status →
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {stats.activeLoans > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Active Loan</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.activeLoans} loan{stats.activeLoans > 1 ? 's' : ''} in good standing
                  </p>
                  <Link to="/customer/my-loans">
                    <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-blue-600">
                      Make Payment →
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {stats.activeLoans === 0 && stats.pendingApplications === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No recent activity</p>
                <Link to="/customer/apply">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Apply for Your First Loan
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Loan Products */}
      <Card>
        <CardHeader>
          <CardTitle>Available Loan Products</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">DHARURA</h3>
              <Badge variant="secondary">6 months</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Quick emergency loans with fast approval</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-semibold">15% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Range:</span>
                <span className="font-semibold">100K - 5M TZS</span>
              </div>
            </div>
            <Link to="/customer/apply">
              <Button variant="outline" size="sm" className="w-full mt-3">
                Apply Now
              </Button>
            </Link>
          </div>

          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer border-primary/50 bg-primary/5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">BIASHARA</h3>
              <Badge>24 months</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Financing for business growth</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-semibold">12.5% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Range:</span>
                <span className="font-semibold">500K - 50M TZS</span>
              </div>
            </div>
            <Link to="/customer/apply">
              <Button size="sm" className="w-full mt-3">
                Apply Now
              </Button>
            </Link>
          </div>

          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">MISHAHARA</h3>
              <Badge variant="secondary">12 months</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Salary advance with competitive rates</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-semibold">10% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Range:</span>
                <span className="font-semibold">50K - 3M TZS</span>
              </div>
            </div>
            <Link to="/customer/apply">
              <Button variant="outline" size="sm" className="w-full mt-3">
                Apply Now
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
