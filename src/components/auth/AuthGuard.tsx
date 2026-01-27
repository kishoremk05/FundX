import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'customer' | 'loan_officer' | 'branch_manager' | 'md_finance';
}

export function AuthGuard({ children, requireAuth = true, requiredRole }: AuthGuardProps) {
  const { user, profile, loading, profileError } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    // Redirect to login if authentication is required but user is not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && user) {
    // Wait for profile to load before redirecting
    if (!profile && !profileError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    // Redirect authenticated users away from auth pages based on their role
    const officerRoles = ['admin', 'loan_officer', 'md_finance', 'ops_director', 'ceo', 'finance_officer'];
    const isOfficerOrAdmin = profile?.role && officerRoles.includes(profile.role);
    const redirectTo = isOfficerOrAdmin ? '/admin' : '/customer';
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // If user is logged in but profile hasn't loaded yet (and no error), show loading instead of access denied
    if (user && !profile && !profileError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Special case: all officer roles can access admin routes
    const officerRolesForAdmin = ['loan_officer', 'md_finance', 'ops_director', 'ceo', 'finance_officer'];
    if (requiredRole === 'admin' && profile?.role && officerRolesForAdmin.includes(profile.role)) {
      return <>{children}</>;
    }

    // Special case: admin can also access customer routes (for testing)
    if (requiredRole === 'customer' && profile?.role === 'admin') {
      return <>{children}</>;
    }

    // User doesn't have required role
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
          <div className="mt-4 p-4 bg-muted rounded text-left text-xs font-mono overflow-auto max-w-md mx-auto">
            <p className="font-bold border-b mb-2 pb-1">Debug Information</p>
            <p>User ID: {user?.uid}</p>
            <p>Email: {user?.email}</p>
            <p>Profile Loaded: {profile ? 'Yes' : 'No'}</p>
            <p>Current Role: {profile?.role || 'None'}</p>
            <p>Required Role: {requiredRole}</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
