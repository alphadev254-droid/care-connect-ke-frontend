import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  Bell,
  LogOut,
  User,
  Search,
  Video,
  CreditCard,
  ChevronDown,
  UserCheck,
  Key,
  Wallet,
  HelpCircle,
} from "lucide-react";
import { CLOUDINARY_IMAGES } from "@/config/images";
import CaregiverOnboardingDialog from "@/components/CaregiverOnboardingDialog";
import { responsive } from "@/theme";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: "patient" | "caregiver" | "physician" | "admin";
}

const DashboardLayout = ({ children, userRole = "patient" }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch real notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const response = await api.get('/notifications?limit=10');
      return response.data.data;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications', 'count', user?.id],
    queryFn: async () => {
      const response = await api.get('/notifications/count');
      return response.data;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await api.put(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  
  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadCountData?.count || 0;
  
  // Use actual user role if available, fallback to prop
  const actualRole = user?.role === 'system_manager' || user?.role === 'regional_manager' || user?.role === 'Accountant' ? 'admin' : (user?.role || userRole);

  // Show loading while authentication or permissions are loading
  if (authLoading || permissionsLoading) {
    return <LoadingScreen />;
  }

  // Get user initials
  const getInitials = () => {
    if (!user) return "?";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  // Get full name
  const getFullName = () => {
    if (!user) return "User";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = {
    patient: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Search, label: "Find Caregivers", href: "/dashboard/caregivers" },
      { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
      { icon: FileText, label: "Care Reports", href: "/dashboard/reports" },
      { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
    ],
    caregiver: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Calendar, label: "Schedule", href: "/dashboard/schedule" },
      { icon: Users, label: "My Patients", href: "/dashboard/patients" },
      { icon: FileText, label: "Care Reports", href: "/dashboard/reports" },
      { icon: CreditCard, label: "Earnings", href: "/dashboard/earnings" },
      { icon: Wallet, label: "Withdrawals", href: "/dashboard/withdrawals" },
    ],
    physician: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Users, label: "Patients", href: "/dashboard/patients" },
      { icon: Heart, label: "Recommendations", href: "/dashboard/recommendations" },
      { icon: FileText, label: "Health Reports", href: "/dashboard/reports" },
    ],
    admin: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      ...((hasPermission('view_users') || hasPermission('view_caregivers') || hasPermission('view_patients') || hasPermission('view_accountants') || hasPermission('view_regional_managers') || hasPermission('view_system_managers')) ? [{ icon: Users, label: "User Management", href: "/dashboard/users" }] : []),
      ...(hasPermission('view_roles') ? [{ icon: UserCheck, label: "Roles Management", href: "/dashboard/roles" }] : []),
      ...(hasPermission('view_permissions') ? [{ icon: Key, label: "Permissions", href: "/dashboard/permissions" }] : []),
      ...(hasPermission('view_specialties') ? [{ icon: Heart, label: "Specialties", href: "/dashboard/specialties" }] : []),
      { icon: Video, label: "Teleconference", href: "/dashboard/admin/teleconference" },
      ...(hasPermission('view_withdrawal_requests') ? [{ icon: Wallet, label: "Withdrawals", href: "/dashboard/admin/withdrawals" }] : []),
      ...(hasPermission('view_financial_reports') ? [{ icon: CreditCard, label: "Earnings", href: "/dashboard/earnings" }] : []),
      ...(hasPermission('view_care_plans') ? [{ icon: FileText, label: "Reports", href: "/dashboard/reports" }] : []),
    ],
  };

  const currentMenu = menuItems[actualRole as keyof typeof menuItems] || [];

  const isActive = (href: string) => location.pathname === href;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden bg-muted/30">
        <Sidebar className="border-r">
          <div className="p-4 border-b">
            <Link to="/" className="flex items-center gap-2">
              <img src={CLOUDINARY_IMAGES.logo} alt="CareConnect" className="h-8 w-auto" />
              <span className="font-display text-lg font-bold">
                Care<span className="text-primary">Connect</span>
              </span>
            </Link>
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {currentMenu.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                      >
                        <Link to={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/dashboard/profile")}>
                      <Link to="/dashboard/profile">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")}>
                      <Link to="/dashboard/settings">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-16 border-b bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="hidden md:block">
                <h1 className="font-display font-semibold capitalize">
                  {location.pathname.split("/").pop() || "Dashboard"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {actualRole === 'caregiver' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHelpOpen(true)}
                  title="Help & Navigation Guide"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              )}

              <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification: any) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                            !notification.isRead ? 'bg-muted/30' : ''
                          }`}
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsReadMutation.mutate(notification.id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-2 w-2 rounded-full mt-2 ${
                              !notification.isRead ? 'bg-primary' : 'bg-transparent'
                            }`} />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isPending}
                      >
                        {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {getInitials()}
                    </div>
                    <span className="hidden md:inline">{getFullName()}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className={responsive.main}>
            {children}
          </main>
        </div>
      </div>
      <CaregiverOnboardingDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </SidebarProvider>
  );
};

export default DashboardLayout;
