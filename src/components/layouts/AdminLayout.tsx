import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  RefreshCw,
  BarChart3,
  Building2,
  UserCog,
  Wallet,
  Receipt,
  MessageSquare,
  StickyNote,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  Package,
  FileText,
  Bell,
  Mail,
  Shield,
  Cloud,
  Palette,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: NavigationItem[];
}

// Navigation structure matching reference design
const mainNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Applications', href: '/admin/applications', icon: FileText },
  { name: 'Borrowers', href: '/admin/borrowers', icon: Users },
  { name: 'Loans', href: '/admin/loans', icon: CreditCard },
  { name: 'Repayments', href: '/admin/repayments', icon: RefreshCw },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

const managementNavigation: NavigationItem[] = [
  { name: 'Branches', href: '/admin/branches', icon: Building2 },
  { name: 'Users & Roles', href: '/admin/users', icon: UserCog },
  { name: 'Loan Types', href: '/admin/products', icon: Package },
  { name: 'Accounts', href: '/admin/accounts', icon: Wallet },
  { name: 'Expenses', href: '/admin/expenses', icon: Receipt },
  { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare },
  { name: 'Notes', href: '/admin/notes', icon: StickyNote },
];

const systemNavigation: NavigationItem[] = [
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'Company', href: '/admin/settings/company', icon: Building2 },
      { name: 'Application', href: '/admin/settings/application', icon: Settings },
      { name: 'Theme', href: '/admin/settings/appearance', icon: Palette },
      { name: 'Email', href: '/admin/settings/email', icon: Mail },
      { name: 'Payment', href: '/admin/settings/payment', icon: CreditCard },
      { name: 'Security', href: '/admin/settings/security', icon: Shield },
      { name: 'Storage', href: '/admin/settings/storage', icon: Cloud },
    ],
  },
];

interface AdminLayoutProps {
  children: ReactNode;
}

function NavItem({ item, pathname }: { item: NavigationItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(
    item.children?.some(child => child.href && pathname.startsWith(child.href)) || false
  );

  const isActive = item.href
    ? (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href))
    : false;

  if (item.children) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <item.icon className="w-5 h-5" />
            <span className="flex-1 text-left">{item.name}</span>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-1 mt-1">
          {item.children.map((child) => {
            const childActive = child.href && (pathname === child.href || pathname.startsWith(child.href + '/'));
            return (
              <Link
                key={child.name}
                to={child.href || '#'}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  childActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <child.icon className="w-4 h-4" />
                {child.name}
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      to={item.href || '#'}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <item.icon className="w-5 h-5" />
      {item.name}
    </Link>
  );
}

function SidebarContent({ signOut, pathname }: { signOut: () => void; pathname: string }) {
  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-primary font-bold text-lg">K</span>
          </div>
          <div>
            <p className="font-bold text-foreground tracking-tight">KEP</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest -mt-0.5">ENTERPRISE</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        {/* MAIN Section */}
        <div className="mb-6">
          <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Main
          </p>
          <nav className="space-y-1">
            {mainNavigation.map((item) => (
              <NavItem key={item.name} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>

        {/* MANAGEMENT Section */}
        <div className="mb-6">
          <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Management
          </p>
          <nav className="space-y-1">
            {managementNavigation.map((item) => (
              <NavItem key={item.name} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>

        {/* SYSTEM Section */}
        <div className="mb-6">
          <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            System
          </p>
          <nav className="space-y-1">
            {systemNavigation.map((item) => (
              <NavItem key={item.name} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* Sign Out */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = profile?.full_name || 'Admin User';
  const displayRole = profile?.role === 'admin' ? 'Super Admin' : profile?.role || 'Admin';

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <SidebarContent signOut={signOut} pathname={location.pathname} />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40 bg-background shadow-md border border-border">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-none">
            <SidebarContent signOut={signOut} pathname={location.pathname} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
            <h1 className="text-lg font-semibold text-foreground hidden lg:block">
              KEP - ADMIN TERMINAL
            </h1>
            <div className="lg:hidden" />

            {/* Right side - Notifications and Profile */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No new notifications</p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-8 w-px bg-border" />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:bg-muted rounded-lg px-2 py-1.5 transition-colors">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-foreground">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{displayRole}</p>
                    </div>
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {displayName?.charAt(0) || 'A'}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/admin/settings/company" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
