import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AdminLogin from "./pages/auth/AdminLogin";
import DebugFirebase from "./pages/DebugFirebase";
import SeedData from "./pages/SeedData";
import AdminDashboard from "./pages/admin/Dashboard";
import CustomerDashboard from "./pages/customer/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />

                {/* Auth Routes */}
                <Route
                  path="/login"
                  element={
                    <AuthGuard requireAuth={false}>
                      <Login />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <AuthGuard requireAuth={false}>
                      <Register />
                    </AuthGuard>
                  }
                />

                <Route
                  path="/forgot-password"
                  element={
                    <AuthGuard requireAuth={false}>
                      <ForgotPassword />
                    </AuthGuard>
                  }
                />

                {/* Admin Login - Separate route */}
                <Route
                  path="/admin/login"
                  element={
                    <AuthGuard requireAuth={false}>
                      <AdminLogin />
                    </AuthGuard>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <AuthGuard requiredRole="admin">
                      <AdminDashboard />
                    </AuthGuard>
                  }
                />

                {/* Customer Routes */}
                <Route
                  path="/customer/*"
                  element={
                    <AuthGuard requiredRole="customer">
                      <CustomerDashboard />
                    </AuthGuard>
                  }
                />

                {/* Debug Route */}
                <Route path="/debug" element={<DebugFirebase />} />

                {/* Seed Data Route */}
                <Route path="/seed-data" element={<SeedData />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

