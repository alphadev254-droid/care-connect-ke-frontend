import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Caregivers from "./pages/Caregivers";
import Appointments from "./pages/Appointments";
import CareReports from "./pages/CareReports";
import Teleconference from "./pages/Teleconference";
import Billing from "./pages/Billing";
import HowItWorks from "./pages/HowItWorks";
import Specialties from "./pages/Specialties";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Schedule from "./pages/Schedule";
import Patients from "./pages/Patients";
import Earnings from "./pages/Earnings";
import WithdrawalsPage from "./pages/WithdrawalsPage";
import AdminWithdrawalsPage from "./pages/AdminWithdrawalsPage";
// import AdminWithdrawalDetailPage from "./pages/AdminWithdrawalDetailPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import AdminReports from "./pages/AdminReports";
import UserDetails from "./pages/UserDetails";
import UserEdit from "./pages/UserEdit";
import PublicCaregivers from "./pages/PublicCaregivers";
import SpecialtyManagement from "./pages/SpecialtyManagement";
import RolesManagement from "./pages/RolesManagement";
import PermissionsManagement from "./pages/PermissionsManagement";
import AppointmentDetails from "./pages/AppointmentDetails";
import MeetingJoin from "./pages/MeetingJoin";
import TeleconferenceAdmin from "./pages/TeleconferenceAdmin";
import TeleconferenceSessionDetails from "./pages/TeleconferenceSessionDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/specialties" element={<Specialties />} />
            <Route path="/caregivers" element={<PublicCaregivers />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/meeting/join/:token" element={<MeetingJoin />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/caregivers"
              element={
                <ProtectedRoute>
                  <Caregivers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/reports"
              element={
                <ProtectedRoute>
                  <CareReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teleconference"
              element={
                <ProtectedRoute>
                  <Teleconference />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/billing"
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/schedule"
              element={
                <ProtectedRoute>
                  <Schedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patients"
              element={
                <ProtectedRoute>
                  <Patients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/earnings"
              element={
                <ProtectedRoute >
                  <Earnings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/withdrawals"
              element={
                <ProtectedRoute>
                  <WithdrawalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/withdrawals"
              element={
                <ProtectedRoute requiredPermission="view_withdrawal_requests">
                  <AdminWithdrawalsPage />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/dashboard/admin/withdrawals/:caregiverId"
              element={
                <ProtectedRoute requiredPermission="view_withdrawal_requests">
                  <AdminWithdrawalDetailPage />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/dashboard/admin/teleconference"
              element={
                <ProtectedRoute>
                  <TeleconferenceAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/teleconference/session/:sessionId"
              element={
                <ProtectedRoute>
                  <TeleconferenceSessionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/users"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/user/:userId"
              element={
                <ProtectedRoute>
                  <UserDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/users/edit/:userId"
              element={
                <ProtectedRoute>
                  <UserEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/specialties"
              element={
                <ProtectedRoute>
                  <SpecialtyManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/roles"
              element={
                <ProtectedRoute>
                  <RolesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/permissions"
              element={
                <ProtectedRoute>
                  <PermissionsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/permissions"
              element={
                <ProtectedRoute>
                  <PermissionsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointment/:id"
              element={
                <ProtectedRoute>
                  <AppointmentDetails />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
