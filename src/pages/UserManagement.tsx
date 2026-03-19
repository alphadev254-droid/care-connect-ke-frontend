import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { dashboardCard, dashboardTokens, responsive } from "@/theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Eye,
  Heart,
  Activity,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UserManagement = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    idNumber: "",
    roleId: "",
    assignedRegion: ""
  });
  const queryClient = useQueryClient();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, selectedSpecialty, statusFilter]);

  // Set role filter from URL params
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setRoleFilter(roleParam);
    }
  }, [searchParams]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin", "users", currentPage, debouncedSearch, roleFilter, selectedSpecialty, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "100",
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(selectedSpecialty !== "all" && { specialty: selectedSpecialty }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const response = await api.get(`/admin/users?${params}`);
      return response.data;
    },
  });

  const users = usersData?.users || [];
  const totalUsers = usersData?.total || 0;
  const totalPages = Math.ceil(totalUsers / 100);

  // Get stats from separate endpoint
  const { data: statsData } = useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: async () => {
      const response = await api.get("/admin/users/stats");
      return response.data;
    },
  });

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/admin/roles");
      return response.data;
    },
  });

  const roles = rolesData?.roles || [];

  const { data: specialties } = useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const response = await api.get("/specialties");
      return response.data.specialties || [];
    },
  });

  const verifyCaregiver = useMutation({
    mutationFn: async (userId: string) => {
      setActionInProgress({ userId, label: "Verifying..." });
      await api.put(`/admin/caregivers/${userId}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Caregiver verified successfully");
    },
    onSettled: () => setActionInProgress(null),
  });

  const rejectCaregiver = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      setActionInProgress({ userId, label: "Rejecting..." });
      await api.put(`/admin/caregivers/${userId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Caregiver rejected successfully");
      setRejectDialog({ open: false, userId: "", reason: "" });
    },
    onSettled: () => setActionInProgress(null),
  });

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    userId: string;
    reason: string;
  }>({ open: false, userId: "", reason: "" });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({ open: false, userId: "", userName: "" });

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  // Track which user has an action in progress and what it is
  const [actionInProgress, setActionInProgress] = useState<{
    userId: string;
    label: string;
  } | null>(null);

  const toggleUserMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      setActionInProgress({ userId, label: isActive ? "Activating..." : "Deactivating..." });
      await api.put(`/admin/users/${userId}/toggle-status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("User status updated successfully");
      setConfirmDialog(prev => ({ ...prev, open: false }));
    },
    onSettled: () => setActionInProgress(null),
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await api.post('/admin/users', userData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success('User created successfully and credentials sent via email');
      setCreateUserDialog(false);
      setCreateUserForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        idNumber: "",
        roleId: "",
        assignedRegion: ""
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      setActionInProgress({ userId, label: "Deleting..." });
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success('User deleted successfully');
      setDeleteDialog({ open: false, userId: "", userName: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    },
    onSettled: () => setActionInProgress(null),
  });

  const handleRejectCaregiver = (userId: string) => {
    setRejectDialog({ open: true, userId, reason: "" });
  };

  const handleConfirmReject = () => {
    if (rejectDialog.reason.trim()) {
      rejectCaregiver.mutate({ userId: rejectDialog.userId, reason: rejectDialog.reason });
    }
  };

  const handleToggleUser = (user: any) => {
    setConfirmDialog({
      open: true,
      title: user.isActive ? "Deactivate User" : "Activate User",
      description: `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.firstName} ${user.lastName}?`,
      action: () => toggleUserMutation.mutate({ userId: user.id, isActive: !user.isActive })
    });
  };

  const handleCreateUser = () => {
    createUserMutation.mutate(createUserForm);
  };

  const handleDeleteUser = (user: any) => {
    setDeleteDialog({
      open: true,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`
    });
  };

  const confirmDeleteUser = () => {
    deleteUserMutation.mutate(deleteDialog.userId);
  };

  // Helper function to check if current user can view details of a specific user role
  const canViewUserDetails = (userRole: string) => {
    const role = userRole?.toLowerCase();
    if (role === 'caregiver' && !hasPermission('view_caregivers')) return false;
    if (role === 'patient' && !hasPermission('view_patients')) return false;
    if (role === 'accountant' && !hasPermission('view_accountants')) return false;
    if (role === 'regional_manager' && !hasPermission('view_regional_managers')) return false;
    if (role === 'system_manager' && !hasPermission('view_system_managers')) return false;
    return true;
  };

  // Helper function to check if current user can perform specific actions on user roles
  const canEditUser = (userRole: string) => {
    const role = userRole?.toLowerCase();
    if (role === 'caregiver') return hasPermission('edit_caregivers');
    if (role === 'patient') return hasPermission('edit_patients');
    if (role === 'accountant') return hasPermission('edit_accountants');
    if (role === 'regional_manager') return hasPermission('edit_regional_managers');
    if (role === 'system_manager') return hasPermission('edit_system_managers');
    return false; // Default to false for unknown roles
  };

  const canActivateDeactivateUser = (userRole: string, isActive: boolean) => {
    const role = userRole?.toLowerCase();
    if (role === 'caregiver') {
      return isActive ? hasPermission('deactivate_caregivers') : hasPermission('activate_caregivers');
    }
    if (role === 'patient') {
      return isActive ? hasPermission('deactivate_patients') : hasPermission('activate_patients');
    }
    if (role === 'accountant' || role === 'Accountant') {
      return isActive ? hasPermission('deactivate_accountants') : hasPermission('activate_accountants');
    }
    if (role === 'regional_manager') {
      return isActive ? hasPermission('deactivate_regional_managers') : hasPermission('activate_regional_managers');
    }
    if (role === 'system_manager') {
      return isActive ? hasPermission('deactivate_system_managers') : hasPermission('activate_system_managers');
    }
    return false; // Default to false for unknown roles
  };

  // Filter roles for user creation (exclude patient, caregiver, system_manager)
  const createUserRoles = roles.filter((role: any) => 
    !['patient', 'caregiver', 'system_manager'].includes(role.name)
  );

  const requiresRegion = ['regional_manager', 'accountant','Accountant'].includes(
    roles.find((r: any) => r.id.toString() === createUserForm.roleId)?.name
  );

  const stats = [
    {
      title: "Total Users",
      value: statsData?.total || 0,
      icon: Users,
      well: dashboardCard.iconWell.primary,
      iconColor: "text-primary",
    },
    {
      title: "Active Users",
      value: statsData?.active || 0,
      icon: UserCheck,
      well: dashboardCard.iconWell.success,
      iconColor: "text-success",
    },
    {
      title: "Caregivers",
      value: statsData?.caregivers || 0,
      icon: Heart,
      well: dashboardCard.iconWell.secondary,
      iconColor: "text-secondary",
    },
    {
      title: "Patients",
      value: statsData?.patients || 0,
      icon: Activity,
      well: dashboardCard.iconWell.accent,
      iconColor: "text-accent",
    },
    {
      title: "Accountants",
      value: statsData?.accountants || 0,
      icon: Users,
      well: dashboardCard.iconWell.primary,
      iconColor: "text-primary",
    },
    {
      title: "Regional Managers",
      value: statsData?.regionalManagers || 0,
      icon: UserCheck,
      well: dashboardCard.iconWell.secondary,
      iconColor: "text-secondary",
    },
    {
      title: "System Managers",
      value: statsData?.systemManagers || 0,
      icon: UserCheck,
      well: dashboardCard.iconWell.warning,
      iconColor: "text-warning",
    },
  ];

  return (
    <ProtectedRoute requiredPermissions={['view_caregivers', 'view_patients', 'view_accountants', 'view_regional_managers', 'view_system_managers']}>
      <DashboardLayout userRole={mapUserRole(user?.role || 'system_manager')}>
        <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className={responsive.pageTitle}>User Management</h1>
            <p className={responsive.pageSubtitle}>Manage and monitor all system users</p>
          </div>
          {hasPermission('create_users') && (
            <Button onClick={() => setCreateUserDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stats.map((stat) => (
            <Card key={stat.title} className={dashboardCard.base}>
              <CardContent className="p-2 sm:p-3">
                <div className="text-center">
                  <div className={`${stat.well} !h-7 !w-7 sm:!h-9 sm:!w-9 mx-auto mb-1`}>
                    <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.iconColor}`} />
                  </div>
                  <p className={`${responsive.bodyMuted} leading-tight mb-0.5`}>{stat.title}</p>
                  <p className="text-sm sm:text-base md:text-lg font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className={dashboardCard.base}>
          <CardHeader className="p-3 sm:p-5">
            <CardTitle className={responsive.cardTitle}>Search & Filters</CardTitle>
            <CardDescription className={responsive.cardDesc}>Find users by name, email, role, specialty, or status</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-5 sm:pt-0">
            <div className="grid md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles?.filter((role: any) => {
                    // Filter roles based on permissions
                    const roleName = role.name?.toLowerCase();
                    if (roleName === 'caregiver' && !hasPermission('view_caregivers')) return false;
                    if (roleName === 'patient' && !hasPermission('view_patients')) return false;
                    if (roleName === 'accountant' && !hasPermission('view_accountants')) return false;
                    if (roleName === 'regional_manager' && !hasPermission('view_regional_managers')) return false;
                    if (roleName === 'system_manager' && !hasPermission('view_system_managers')) return false;
                    return true;
                  }).map((role: any) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties?.map((specialty: any) => (
                    <SelectItem key={specialty.id} value={specialty.id.toString()}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className={`${dashboardCard.base} min-w-0`}>
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-5">
            <CardTitle className={responsive.cardTitle}>Users ({totalUsers})</CardTitle>
            <p className={responsive.bodyMuted}>Page {currentPage}/{totalPages} • {users.length} shown</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className={dashboardCard.tableWrapper}>
            <Table>
                <TableHeader>
                <TableRow>
                  <TableHead className={dashboardCard.th}>User</TableHead>
                  <TableHead className={dashboardCard.th}>Role</TableHead>
                  <TableHead className={dashboardCard.th}>Contact</TableHead>
                  <TableHead className={dashboardCard.th}>Account Status</TableHead>
                  <TableHead className={dashboardCard.th}>Verification</TableHead>
                  <TableHead className={dashboardCard.th}>Joined</TableHead>
                  <TableHead className={`${dashboardCard.th} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <span className="text-sm text-muted-foreground">Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length > 0 ? (
                  users.filter((user: any) => {
                    // Filter users based on role permissions
                    const roleName = user.Role?.name?.toLowerCase();
                    if (roleName === 'caregiver' && !hasPermission('view_caregivers')) return false;
                    if (roleName === 'patient' && !hasPermission('view_patients')) return false;
                    if (roleName === 'accountant' && !hasPermission('view_accountants')) return false;
                    if (roleName === 'regional_manager' && !hasPermission('view_regional_managers')) return false;
                    if (roleName === 'system_manager' && !hasPermission('view_system_managers')) return false;
                    return true;
                  }).map((user: any) => (
                    <TableRow key={user.id} className={dashboardCard.tr}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`${dashboardTokens.avatar} flex-shrink-0`}>
                            {user.firstName?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-medium whitespace-nowrap ${responsive.body}`}>{user.firstName} {user.lastName}</p>
                            <p className={`${responsive.bodyMuted} truncate max-w-[120px] sm:max-w-[160px]`}>{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize whitespace-nowrap">
                          {user.Role?.name?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {user.phone || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"} className="whitespace-nowrap">
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.role === 'caregiver' && user.Caregiver ? (
                          <Badge
                            variant={
                              user.Caregiver.verificationStatus === 'APPROVED' ? "default" :
                              user.Caregiver.verificationStatus === 'REJECTED' ? "destructive" : "secondary"
                            }
                            className="whitespace-nowrap"
                          >
                            {user.Caregiver.verificationStatus === 'PENDING' ? 'Awaiting' : user.Caregiver.verificationStatus}
                          </Badge>
                        ) : (
                          <span className={responsive.bodyMuted}>N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.Role?.name !== 'system_manager' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant={actionInProgress?.userId === user.id ? "secondary" : "outline"}
                                size="sm"
                                className="h-7 text-xs gap-1.5"
                                disabled={actionInProgress?.userId === user.id}
                              >
                                {actionInProgress?.userId === user.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                    {actionInProgress.label}
                                  </>
                                ) : (
                                  <>
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                    Actions
                                  </>
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {/* View */}
                              {canViewUserDetails(user.Role?.name) && (
                                <DropdownMenuItem onClick={() => navigate(`/dashboard/user/${user.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              )}

                              {/* Edit */}
                              {canEditUser(user.Role?.name) && (
                                <DropdownMenuItem onClick={() => navigate(`/dashboard/users/edit/${user.id}`)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                              )}

                              {/* Caregiver verification actions */}
                              {user.role === 'caregiver' && user.Caregiver && (
                                <>
                                  {(user.Caregiver.verificationStatus === 'PENDING' || user.Caregiver.verificationStatus === 'REJECTED') && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => verifyCaregiver.mutate(user.id)}
                                        disabled={verifyCaregiver.isPending && verifyCaregiver.variables === user.id}
                                      >
                                        <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                        {user.Caregiver.verificationStatus === 'REJECTED' ? 'Re-verify' : 'Verify'}
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {user.Caregiver.verificationStatus === 'PENDING' && (
                                    <DropdownMenuItem
                                      onClick={() => handleRejectCaregiver(user.id)}
                                      disabled={rejectCaregiver.isPending}
                                      className="text-orange-600 focus:text-orange-600"
                                    >
                                      <UserX className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}

                              {/* Activate / Deactivate */}
                              {canActivateDeactivateUser(user.Role?.name, user.isActive) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleToggleUser(user)}
                                    disabled={toggleUserMutation.isPending}
                                    className={user.isActive ? "text-orange-600 focus:text-orange-600" : "text-green-600 focus:text-green-600"}
                                  >
                                    {user.isActive ? <UserX className="h-4 w-4 mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                  </DropdownMenuItem>
                                </>
                              )}

                              {/* Delete - show for inactive users or rejected caregivers */}
                              {hasPermission('delete_users') && (!user.isActive || (user.role === 'caregiver' && user.Caregiver?.verificationStatus === 'REJECTED')) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user)}
                                    disabled={deleteUserMutation.isPending}
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <div className="text-xs text-muted-foreground">Protected</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                      No users found matching the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Showing {((currentPage - 1) * 100) + 1} to {Math.min(currentPage * 100, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const maxButtons = 5;
                      let startPage: number;
                      let endPage: number;

                      if (totalPages <= maxButtons) {
                        startPage = 1;
                        endPage = totalPages;
                      } else {
                        if (currentPage <= 3) {
                          startPage = 1;
                          endPage = maxButtons;
                        } else if (currentPage >= totalPages - 2) {
                          startPage = totalPages - maxButtons + 1;
                          endPage = totalPages;
                        } else {
                          startPage = currentPage - 2;
                          endPage = currentPage + 2;
                        }
                      }

                      return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                        const pageNum = startPage + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0 text-xs"
                          >
                            {pageNum}
                          </Button>
                        );
                      });
                    })()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => {
          if (!toggleUserMutation.isPending) {
            setConfirmDialog(prev => ({ ...prev, open }));
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className={responsive.dialogTitle}>{confirmDialog.title}</AlertDialogTitle>
              <AlertDialogDescription className={responsive.dialogDesc}>{confirmDialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={toggleUserMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDialog.action}
                disabled={toggleUserMutation.isPending}
              >
                {toggleUserMutation.isPending ? "Processing..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={createUserDialog} onOpenChange={setCreateUserDialog}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={responsive.dialogTitle}>Create New User</DialogTitle>
              <DialogDescription className={responsive.dialogDesc}>Create a new user account with role assignment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={createUserForm.firstName}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={createUserForm.lastName}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={createUserForm.phone}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="idNumber">ID Number (Optional)</Label>
                <Input
                  id="idNumber"
                  value={createUserForm.idNumber}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, idNumber: e.target.value }))}
                  placeholder="Enter ID number"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={createUserForm.roleId} onValueChange={(value) => setCreateUserForm(prev => ({ ...prev, roleId: value, assignedRegion: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {createUserRoles.map((role: any) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {requiresRegion && (
                <div>
                  <Label htmlFor="region">Assigned Region</Label>
                  <Select value={createUserForm.assignedRegion} onValueChange={(value) => setCreateUserForm(prev => ({ ...prev, assignedRegion: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {rolesData?.regions?.map((region: string) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateUserDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending || !createUserForm.firstName || !createUserForm.lastName || !createUserForm.email || !createUserForm.password || !createUserForm.roleId || (requiresRegion && !createUserForm.assignedRegion)}
              >
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectDialog.open} onOpenChange={(open) => {
          if (!rejectCaregiver.isPending) {
            setRejectDialog(prev => ({ ...prev, open }));
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className={responsive.dialogTitle}>Reject Caregiver Application</DialogTitle>
              <DialogDescription className={responsive.dialogDesc}>Please provide a reason for rejecting this caregiver application</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for rejection</Label>
                <Textarea
                  id="reason"
                  value={rejectDialog.reason}
                  onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter detailed reason for rejection..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialog({ open: false, userId: "", reason: "" })}
                disabled={rejectCaregiver.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={rejectCaregiver.isPending || !rejectDialog.reason.trim()}
              >
                {rejectCaregiver.isPending ? "Rejecting..." : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => {
          if (!deleteUserMutation.isPending) {
            setDeleteDialog(prev => ({ ...prev, open }));
          }
        }}>
          <AlertDialogContent className="border-destructive/50">
            <AlertDialogHeader>
              <AlertDialogTitle className={`flex items-center gap-2 text-destructive ${responsive.dialogTitle}`}>
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                Permanently Delete User
              </AlertDialogTitle>
              <AlertDialogDescription className={`space-y-3 ${responsive.dialogDesc}`}>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive font-medium">
                  Warning: This action is irreversible and cannot be undone.
                </div>
                <p>You are about to permanently delete <strong className="text-foreground">{deleteDialog.userName}</strong> and all their associated data, including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>User account and profile information</li>
                  <li>All associated records (appointments, reports, etc.)</li>
                  <li>Any linked caregiver/patient data</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteUserMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteUser}
                disabled={deleteUserMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteUserMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Yes, Delete Permanently
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UserManagement;