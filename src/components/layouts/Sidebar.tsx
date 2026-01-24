import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Receipt,
  BarChart3,
  Building2,
  UserCog,
  Package,
  Wallet,
  DollarSign,
  Contact,
  StickyNote,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const mainNavigation = [
  { name: 'DASHBOARD - VERIFIED', href: '/admin', icon: LayoutDashboard },
  { name: 'Borrowers', href: '/admin/borrowers', icon: Users },
  { name: 'Loans', href: '/admin/loans', icon: CreditCard },
  { name: 'Repayments', href: '/admin/repayments', icon: Receipt },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Applications', href: '/admin/applications', icon: FileText },
];

const managementNavigation = [
  { name: 'Branches', href: '/admin/branches', icon: Building2 },
  { name: 'Users & Roles', href: '/admin/users', icon: UserCog },
  { name: 'Loan Types', href: '/admin/products', icon: Package },
  { name: 'Accounts', href: '/admin/accounts', icon: Wallet },
  { name: 'Expenses', href: '/admin/expenses', icon: DollarSign },
  { name: 'Contacts', href: '/admin/contacts', icon: Contact },
  { name: 'Notes', href: '/admin/notes', icon: StickyNote },
];

const systemNavigation = [
  { name: 'Settings', href: '/admin/settings', icon: Settings, hasSubmenu: true },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const NavLink = ({ item }: { item: typeof mainNavigation[0] & { hasSubmenu?: boolean } }) => {
    const isActive = location.pathname === item.href ||
      (item.href !== '/admin' && location.pathname.startsWith(item.href));

    return (
      <Link
        to={item.href}
        className={cn(
          'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground/70 hover:bg-muted hover:text-foreground'
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          <span>{item.name}</span>
        </div>
        {item.hasSubmenu && <ChevronRight className="w-4 h-4 opacity-50" />}
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-[#1e3a5f] text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/10">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">K</span>
          </div>
          <div>
            <h1 className="font-bold text-sm text-white">KEP</h1>
            <p className="text-[10px] text-white/60 uppercase tracking-wider">Enterprise</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Main</p>
          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Management</p>
          <div className="space-y-1">
            {managementNavigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold text-white/40 uppercase tracking-wider">System</p>
          <div className="space-y-1">
            {systemNavigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
