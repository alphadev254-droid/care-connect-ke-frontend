import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { appointmentService } from "@/services/appointmentService";
import { reportService } from "@/services/reportService";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CaregiverOnboardingDialog from "@/components/CaregiverOnboardingDialog";
import { dashboardTokens, dashboardCard, responsive } from "@/theme";
import {
  Calendar,
  Search,
  FileText,
  Video,
  Clock,
  ArrowRight,
  Star,
  Activity,
  Bell,
  Loader2,
  Users,
  Heart,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const onboardingKey = user ? `caregiver_onboarded_${user.id}` : null;
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user?.role === 'caregiver' && onboardingKey && !localStorage.getItem(onboardingKey)) {
      setShowOnboarding(true);
    }
  }, [user, onboardingKey]);

  const handleOnboardingClose = () => {
    if (onboardingKey) localStorage.setItem(onboardingKey, '1');
    setShowOnboarding(false);
  };

  // Fetch admin data for system managers and regional managers only
  const { data: adminData } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const requests = [api.get("/admin/users")];

      // Only fetch pending caregivers if user has view_caregivers permission
      if (hasPermission('view_caregivers')) {
        requests.push(api.get("/admin/caregivers/pending"));
      }

      const responses = await Promise.all(requests);
      const usersRes = responses[0];
      const pendingRes = responses[1];

      return {
        users: usersRes.data.users || [],
        pendingCaregivers: pendingRes?.data.caregivers || []
      };
    },
    enabled: user?.role === 'system_manager' || user?.role === 'regional_manager' || user?.role === 'Accountant'
  });

  // Fetch caregivers for accountants and regional managers with region check
  const { data: caregiversData } = useQuery({
    queryKey: ["caregivers", user?.role],
    queryFn: async () => {
      const endpoint = (user?.role === 'Accountant' || user?.role === 'regional_manager')
        ? "/admin/caregivers"
        : "/public/caregivers";
      const response = await api.get(endpoint);
      return response.data.caregivers || [];
    },
    enabled: !['system_manager'].includes(user?.role || '')
  });

  // Fetch caregiver's patients
  const { data: patientsData } = useQuery({
    queryKey: ["caregiver-patients"],
    queryFn: async () => {
      const response = await api.get("/caregivers/my-patients");
      return response.data.patients || [];
    },
    enabled: user?.role === 'caregiver'
  });

  // Fetch appointments
  const { data: appointmentsData, isLoading: loadingAppointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentService.getAppointments({ limit: 5 }),
    enabled: user?.role !== 'Accountant'
  });

  // Fetch reports
  const { data: reportsData, isLoading: loadingReports } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportService.getReports({ limit: 5 }),
    enabled: user?.role !== 'Accountant'
  });

  // Fetch earnings/transaction data for financial metrics
  const { data: earningsData } = useQuery({
    queryKey: ["earnings-dashboard", user?.role],
    queryFn: async () => {
      const isAdmin = ['system_manager', 'regional_manager', 'Accountant'].includes(user?.role || '');
      const endpoint = isAdmin
        ? '/earnings/admin?period=this-month&limit=1000'
        : user?.role === 'caregiver'
        ? '/earnings/caregiver?period=this-month&limit=1000'
        : '/earnings/payments/history?period=this-month&limit=1000';

      const response = await api.get(endpoint);
      return response.data.transactions || response.data.payments || [];
    },
    enabled: ['caregiver', 'system_manager', 'regional_manager', 'Accountant'].includes(user?.role || '')
  });

  const upcomingAppointments = appointmentsData?.appointments || [];
  const recentReports = reportsData?.reports || [];
  const transactions = earningsData || [];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  };

  const getQuickActions = () => {
    const role = user?.role || 'patient';

    switch (role) {
      case 'system_manager':
      case 'regional_manager':
        return [
          {
            icon: Search,
            label: "User Management",
            description: "Manage all users",
            href: "/dashboard/users",
            color: "primary",
          },
          {
            icon: FileText,
            label: "Reports",
            description: "System analytics",
            href: "/dashboard/reports",
            color: "secondary",
          },
          {
            icon: Activity,
            label: "Specialties",
            description: "Manage specialties",
            href: "/dashboard/specialties",
            color: "accent",
          },
          {
            icon: Bell,
            label: "Settings",
            description: "System config",
            href: "/dashboard/settings",
            color: "success",
          },
        ];
      case 'Accountant':
        return [
          {
            icon: DollarSign,
            label: "Financial Reports",
            description: "View earnings",
            href: "/dashboard/earnings",
            color: "primary",
          },
          {
            icon: TrendingUp,
            label: "Analytics",
            description: "Financial analytics",
            href: "/dashboard/reports",
            color: "secondary",
          },
          {
            icon: FileText,
            label: "Tax Reports",
            description: "Tax collections",
            href: "/dashboard/earnings",
            color: "accent",
          },
          {
            icon: Wallet,
            label: "Commissions",
            description: "Platform revenue",
            href: "/dashboard/earnings",
            color: "success",
          },
        ];
      case 'caregiver':
        return [
          {
            icon: Calendar,
            label: "My Schedule",
            description: "View appointments",
            href: "/dashboard/schedule",
            color: "primary",
          },
          {
            icon: Search,
            label: "My Patients",
            description: "Manage patients",
            href: "/dashboard/patients",
            color: "secondary",
          },
          {
            icon: Video,
            label: "Start Session",
            description: "Teleconference",
            href: "/dashboard/teleconference",
            color: "accent",
          },
          {
            icon: FileText,
            label: "Earnings",
            description: "Track income",
            href: "/dashboard/earnings",
            color: "success",
          },
        ];
      case 'primary_physician':
        return [
          {
            icon: Search,
            label: "My Patients",
            description: "Monitor health",
            href: "/dashboard/patients",
            color: "primary",
          },
          {
            icon: Star,
            label: "Recommendations",
            description: "Recommend care",
            href: "/dashboard/recommendations",
            color: "secondary",
          },
          {
            icon: FileText,
            label: "Health Reports",
            description: "Review reports",
            href: "/dashboard/reports",
            color: "accent",
          },
          {
            icon: Activity,
            label: "Analytics",
            description: "Patient outcomes",
            href: "/dashboard/analytics",
            color: "success",
          },
        ];
      default: // patient
        return [
          {
            icon: Search,
            label: "Find Caregiver",
            description: "Browse caregivers",
            href: "/dashboard/caregivers",
            color: "primary",
          },
          {
            icon: Calendar,
            label: "Book Appointment",
            description: "Schedule session",
            href: "/dashboard/appointments",
            color: "secondary",
          },
          {
            icon: Video,
            label: "Teleconference",
            description: "Video call",
            href: "/dashboard/teleconference",
            color: "accent",
          },
          {
            icon: FileText,
            label: "View Reports",
            description: "Care reports",
            href: "/dashboard/reports",
            color: "success",
          },
        ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <DashboardLayout userRole={['system_manager', 'regional_manager', 'Accountant'].includes(user?.role || '') ? 'admin' : (user?.role || "patient")}>
      <div className="space-y-4 md:space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className={responsive.pageTitle}>
              Welcome back, {user?.firstName || "User"}!
            </h1>
            <p className={responsive.pageSubtitle}>
              {user?.role === 'Accountant'
                ? "Financial overview and earnings dashboard"
                : ['system_manager', 'regional_manager'].includes(user?.role || '')
                ? "System overview and management dashboard"
                : user?.role === 'caregiver'
                ? "Manage your patients and schedule efficiently"
                : user?.role === 'primary_physician'
                ? "Monitor patient health and recommend care"
                : "Here's an overview of your healthcare journey"
              }
            </p>
          </div>
          {user?.role === 'patient' && (
            <div className="flex items-center gap-2">
              <Link to="/dashboard/caregivers">
                <Button size="sm" className="gap-2 bg-primary text-white hover:bg-primary/90 h-9 text-xs">
                  <Search className="h-4 w-4" />
                  Find Caregiver
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Role-based Statistics - Compact */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {['system_manager', 'regional_manager', 'Accountant'].includes(user?.role || '') ? (
            <>
              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Total Collections</p>
                      <p className={responsive.statValue}>
                        MWK {transactions
                          .filter((t: Record<string, unknown>) => t.status === 'completed')
                          .reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.amount || 0), 0)
                          .toLocaleString()}
                      </p>
                      <p className={responsive.bodyMuted}>
                        {transactions.filter((t: Record<string, unknown>) => t.status === 'completed').length} transactions
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Tax Collected</p>
                      <p className={responsive.statValue}>
                        MWK {transactions
                          .filter((t: Record<string, unknown>) => t.status === 'completed')
                          .reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.taxAmount || 0), 0)
                          .toLocaleString()}
                      </p>
                      <p className={responsive.bodyMuted}>VAT @ 17.5%</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Platform Commission</p>
                      <p className={responsive.statValue}>
                        MWK {transactions
                          .filter((t: Record<string, unknown>) => t.status === 'completed')
                          .reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.convenienceFeeAmount || 0), 0)
                          .toLocaleString()}
                      </p>
                      <p className={`${responsive.bodyMuted} text-success`}>Platform revenue</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Caregiver Earnings</p>
                      <p className={responsive.statValue}>
                        MWK {transactions
                          .filter((t: Record<string, unknown>) => t.status === 'completed')
                          .reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.baseFee || 0), 0)
                          .toLocaleString()}
                      </p>
                      <p className={responsive.bodyMuted}>Total payable</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : user?.role === 'caregiver' ? (
            <>
              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Net Earnings</p>
                      <p className={responsive.statValue}>
                        MWK {transactions
                          .filter((t: Record<string, unknown>) => t.status === 'completed' && t.paymentType === 'session_fee')
                          .reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.caregiverEarnings || 0), 0)
                          .toLocaleString()}
                      </p>
                      <p className={responsive.bodyMuted}>After commission</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Commission Deducted</p>
                      <p className={responsive.statValue}>
                        MWK {transactions
                          .filter((t: Record<string, unknown>) => t.status === 'completed' && t.paymentType === 'session_fee')
                          .reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.platformCommissionAmount || 0), 0)
                          .toLocaleString()}
                      </p>
                      <p className={responsive.bodyMuted}>Platform fee @ 20%</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Sessions Completed</p>
                      <p className={responsive.statValue}>
                        {transactions.filter((t: Record<string, unknown>) => t.status === 'completed' && t.paymentType === 'session_fee').length}
                      </p>
                      <p className={responsive.bodyMuted}>Total sessions</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Avg Earnings/Session</p>
                      <p className={responsive.statValue}>
                        MWK {(() => {
                          const sessionTxs = transactions.filter((t: Record<string, unknown>) => t.status === 'completed' && t.paymentType === 'session_fee');
                          const totalEarnings = sessionTxs.reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.caregiverEarnings || 0), 0);
                          const avgEarnings = sessionTxs.length > 0 ? Math.round(totalEarnings / sessionTxs.length) : 0;
                          return avgEarnings.toLocaleString();
                        })()}
                      </p>
                      <p className={responsive.bodyMuted}>Per completed session</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : user?.role === 'primary_physician' ? (
            <>
              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Active Patients</p>
                      <p className={responsive.statValue}>0</p>
                      <p className={responsive.bodyMuted}>Under care</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Recommendations</p>
                      <p className={responsive.statValue}>0</p>
                      <p className={responsive.bodyMuted}>Caregivers referred</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Health Reports</p>
                      <p className={responsive.statValue}>{recentReports?.length || 0}</p>
                      <p className={responsive.bodyMuted}>Reviews pending</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Patient Status</p>
                      <p className={responsive.statValue}>Stable</p>
                      <p className={`${responsive.bodyMuted} text-success`}>Overall health</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : user?.role !== 'Accountant' ? (
            <>
              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Upcoming Appointments</p>
                      <p className={responsive.statValue}>{upcomingAppointments?.length || 0}</p>
                      <p className={responsive.bodyMuted}>Scheduled sessions</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Active Caregivers</p>
                      <p className={responsive.statValue}>{caregiversData?.length || 0}</p>
                      <p className={responsive.bodyMuted}>Available now</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Care Reports</p>
                      <p className={responsive.statValue}>{recentReports?.length || 0}</p>
                      <p className={responsive.bodyMuted}>Total received</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={dashboardCard.statContent}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={responsive.bodyMuted}>Next Appointment</p>
                      <p className={responsive.statValue}>
                        {upcomingAppointments?.[0] ? formatDate(upcomingAppointments[0].scheduledDate).split(',')[0] : 'None'}
                      </p>
                      <p className={`${responsive.bodyMuted} text-success`}>
                        {upcomingAppointments?.[0] ? 'Confirmed' : 'Book now'}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {user?.role !== 'Accountant' && (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Role-based main content - Compact */}
            <Card className={`lg:col-span-2 ${dashboardCard.base}`}>
              <CardHeader className={dashboardCard.header}>
                <div>
                  <CardTitle className={responsive.cardTitle}>
                    {user?.role === 'system_manager' || user?.role === 'regional_manager'
                      ? "Recent User Activity"
                      : user?.role === 'caregiver'
                      ? "Pending Requests"
                      : user?.role === 'primary_physician'
                      ? "Patient Overview"
                      : "Upcoming Appointments"
                    }
                  </CardTitle>
                  <CardDescription className={responsive.cardDesc}>
                    {user?.role === 'system_manager' || user?.role === 'regional_manager'
                      ? "Latest registrations and system activity"
                      : user?.role === 'caregiver'
                      ? "New appointment requests"
                      : user?.role === 'primary_physician'
                      ? "Patients under your care"
                      : "Your scheduled care sessions"
                    }
                  </CardDescription>
                </div>
                <Link to={user?.role === 'caregiver' ? "/dashboard/schedule" : "/dashboard/appointments"}>
                  <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                    View All <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className={dashboardCard.body}>
                {user?.role === 'system_manager' || user?.role === 'regional_manager' ? (
                  <div className="space-y-2">
                    {adminData?.users?.slice(0, 5).map((user: Record<string, unknown>) => (
                      <div
                        key={user.id}
                        className={dashboardCard.listRow}
                      >
                        <div className="flex items-center gap-3">
                          <div className={dashboardTokens.avatar}>
                            {user.firstName?.charAt(0)}
                          </div>
                          <div>
                            <p className={`font-medium ${responsive.body}`}>{user.firstName} {user.lastName}</p>
                            <p className={`${responsive.bodyMuted} capitalize`}>{user.Role?.name?.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                          className="capitalize text-xs"
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    )) || []}
                    {(!adminData?.users || adminData.users.length === 0) && (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        No users found
                      </div>
                    )}
                  </div>
                ) : loadingAppointments ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingAppointments.slice(0, 3).map((appointment: Record<string, unknown>) => {
                      const caregiverName = appointment.Caregiver?.User
                        ? `${appointment.Caregiver.User.firstName} ${appointment.Caregiver.User.lastName}`
                        : "Caregiver";
                      const specialtyName = appointment.Specialty?.name || "General Care";

                      return (
                        <div
                          key={appointment.id}
                          className={dashboardCard.listRow}
                        >
                          <div className="flex items-center gap-3">
                            <div className={dashboardTokens.avatar}>
                              {caregiverName.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-medium ${responsive.body}`}>{caregiverName}</p>
                              <p className={responsive.bodyMuted}>{specialtyName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs mb-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {formatDate(appointment.scheduledDate)}
                            </div>
                            <Badge
                              variant={appointment.status === "confirmed" ? "default" : "secondary"}
                              className="capitalize text-xs"
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    {upcomingAppointments.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        No upcoming appointments
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role-based sidebar - Compact */}
            <Card className={dashboardCard.base}>
              <CardHeader className="p-3 sm:p-5">
                <CardTitle className={responsive.cardTitle}>
                  {user?.role === 'system_manager' || user?.role === 'regional_manager'
                    ? "System Status"
                    : user?.role === 'caregiver'
                    ? "Today's Summary"
                    : user?.role === 'primary_physician'
                    ? "Patient Status"
                    : "Health Overview"
                  }
                </CardTitle>
                <CardDescription className="text-xs">
                  {user?.role === 'system_manager' || user?.role === 'regional_manager'
                    ? "Overall system health"
                    : user?.role === 'caregiver'
                    ? "Your daily summary"
                    : user?.role === 'primary_physician'
                    ? "Patient health status"
                    : "Your health status"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-3 pt-0 sm:p-5 sm:pt-0">
                {user?.role === 'system_manager' || user?.role === 'regional_manager' ? (
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <Activity className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="font-display text-xl font-bold text-primary">Online</p>
                    <p className="text-xs text-muted-foreground">System Status</p>
                  </div>
                ) : (
                  <div className="text-center p-4 rounded-lg bg-success/10">
                    <Activity className="h-6 w-6 text-success mx-auto mb-2" />
                    <p className="font-display text-xl font-bold text-success">Stable</p>
                    <p className="text-xs text-muted-foreground">Current Status</p>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-semibold text-xs">
                    {user?.role === 'system_manager' || user?.role === 'regional_manager'
                      ? "Recent Activity"
                      : "Recent Reports"
                    }
                  </h4>
                  {user?.role === 'system_manager' || user?.role === 'regional_manager' ? (
                    adminData?.pendingCaregivers?.slice(0, 3).map((caregiver: Record<string, unknown>) => (
                      <div
                        key={caregiver.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="text-xs font-medium">{caregiver.firstName} {caregiver.lastName}</p>
                          <p className="text-xs text-muted-foreground">Pending Approval</p>
                        </div>
                        <Badge variant="outline" className="text-warning border-warning text-xs">
                          Pending
                        </Badge>
                      </div>
                    )) || (
                      <p className="text-xs text-muted-foreground text-center py-3">No pending approvals</p>
                    )
                  ) : loadingReports ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : recentReports.length > 0 ? (
                    recentReports.slice(0, 3).map((report: Record<string, unknown>) => {
                      const reportDate = new Date(report.createdAt || report.Appointment?.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const statusColor = {
                        stable: "text-success border-success",
                        improving: "text-primary border-primary",
                        deteriorating: "text-warning border-warning",
                        critical: "text-destructive border-destructive",
                        cured: "text-success border-success",
                        deceased: "text-muted-foreground border-muted-foreground"
                      }[report.patientStatus] || "text-muted-foreground border-muted-foreground";

                      return (
                        <div
                          key={report.id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div>
                            <p className="text-xs font-medium">{reportDate}</p>
                            <p className="text-xs text-muted-foreground">Care Report</p>
                          </div>
                          <Badge variant="outline" className={`capitalize text-xs ${statusColor}`}>
                            {report.patientStatus}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-3">No reports yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Role-based bottom section - Compact */}
        {user?.role !== 'Accountant' && (
          <Card className={dashboardCard.base}>
            <CardHeader className={dashboardCard.header}>
              <div>
                <CardTitle className={responsive.cardTitle}>
                  {user?.role === 'caregiver'
                    ? "Recent Patients"
                    : user?.role === 'primary_physician'
                    ? "Recommended Caregivers"
                    : "Recommended for You"
                  }
                </CardTitle>
                <CardDescription className="text-xs">
                  {user?.role === 'caregiver'
                    ? "Recently provided care"
                    : user?.role === 'primary_physician'
                    ? "Top-rated caregivers"
                    : "Matching your needs"
                  }
                </CardDescription>
              </div>
              <Link to={user?.role === 'caregiver' ? "/dashboard/patients" : "/dashboard/caregivers"}>
                <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                  {user?.role === 'caregiver' ? "View All" : "Browse"} <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className={dashboardCard.body}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {user?.role === 'system_manager' || user?.role === 'regional_manager' ? (
                  // Show real admin stats - Compact
                  <>
                    <div className="p-3 rounded-lg border bg-primary/5">
                      <h4 className="font-semibold text-primary text-xs mb-1">Total Users</h4>
                      <p className="text-xl font-bold">{adminData?.users?.length || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-warning/5">
                      <h4 className="font-semibold text-warning text-xs mb-1">Pending Approvals</h4>
                      <p className="text-xl font-bold">{adminData?.pendingCaregivers?.length || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-success/5">
                      <h4 className="font-semibold text-success text-xs mb-1">Active Caregivers</h4>
                      <p className="text-xl font-bold">{adminData?.users?.filter((u: Record<string, unknown>) => u.Role?.name === 'caregiver' && u.isActive)?.length || 0}</p>
                    </div>
                  </>
                ) : user?.role === 'caregiver' ? (
                  // Show caregiver's recent patients
                  patientsData && patientsData.length > 0 ? (
                    patientsData.slice(0, 3).map((patient: Record<string, unknown>) => (
                      <div
                        key={patient.id}
                        className="p-3 rounded-lg border hover:border-primary/30 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={dashboardTokens.avatar}>
                            {patient.User?.firstName?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{patient.User?.firstName} {patient.User?.lastName}</p>
                            <p className="text-xs text-muted-foreground">{patient.patientType || 'Patient'}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {patient.User?.email}
                        </p>
                        <Link to={`/dashboard/patients`}>
                          <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No patients yet</p>
                      <p className="text-xs text-muted-foreground">Patients will appear here after appointments</p>
                    </div>
                  )
                ) : (
                  // Show real caregivers - Compact
                  caregiversData?.slice(0, 3).map((caregiver: Record<string, unknown>) => (
                    <div
                      key={caregiver.id}
                      className="p-3 rounded-lg border hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={dashboardTokens.avatar}>
                          {caregiver.firstName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{caregiver.firstName} {caregiver.lastName}</p>
                          <p className="text-xs text-muted-foreground">{caregiver.Caregiver?.qualifications || 'Healthcare Pro'}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="mb-2 text-xs">{caregiver.Caregiver?.experience || 0} years experience</Badge>
                      <p className="text-xs text-muted-foreground mb-3">
                        {caregiver.Caregiver?.Specialties?.[0]?.name || 'General Care'}
                      </p>
                      <Link to="/dashboard/caregivers">
                        <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  )) || [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={dashboardTokens.avatar}>
                          C{i}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Caregiver {i}</p>
                          <p className="text-xs text-muted-foreground">Healthcare Professional</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="mb-2 text-xs">Nursing Care</Badge>
                      <p className="text-xs text-muted-foreground mb-3">
                        5+ years in home healthcare
                      </p>
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                        View Profile
                      </Button>
                    </div>
                  ))
                )}
              </div>
          </CardContent>
        </Card>
        )}

        {/* Quick Actions for all roles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link key={index} to={action.href}>
                <Card className={dashboardCard.actionCard}>
                  <CardContent className={dashboardCard.statContent}>
                    <div className="flex items-center gap-3">
                      <div className={dashboardCard.actionIconWell[action.color as keyof typeof dashboardCard.actionIconWell]}>
                        <IconComponent className={`h-5 w-5 text-${action.color}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${responsive.body}`}>{action.label}</p>
                        <p className={responsive.bodyMuted}>{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
      <CaregiverOnboardingDialog open={showOnboarding} onClose={handleOnboardingClose} />
    </DashboardLayout>
  );
};

export default Dashboard;
