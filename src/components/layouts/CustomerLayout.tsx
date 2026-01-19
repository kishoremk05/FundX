import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  Plus,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/customer', icon: LayoutDashboard },
  { name: 'My Loans', href: '/customer/my-loans', icon: CreditCard },
  { name: 'Apply for Loan', href: '/customer/apply', icon: Plus },
];

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { signOut, profile } = useAuth();
  const location = useLocation();

  // Show loading state or profile data
  const displayName = profile?.full_name || 'Customer';
  const displayEmail = profile?.email || 'customer@example.com';

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link to="/customer" className="flex items-center gap-3">
              <img src="/kep-logo.png" alt="KEP Microcredit" className="h-10 object-contain" />
              <div>
                <p className="text-xs text-muted-foreground">Customer Portal</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-border space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-kep-blue rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold">
                  {displayName?.charAt(0) || 'C'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
