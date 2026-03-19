import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Key, Check, X } from "lucide-react";
import { dashboardCard, responsive } from "@/theme";

interface Permission {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  hasPermission?: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

const PermissionsManagement = () => {
  const { user } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/admin/roles");
      return response.data;
    },
  });

  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ["permissions", selectedRoleId],
    queryFn: async () => {
      const params = selectedRoleId && selectedRoleId !== "all" ? `?roleId=${selectedRoleId}` : "";
      const response = await api.get(`/admin/permissions${params}`);
      return response.data;
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId, hasPermission }: { roleId: string, permissionId: number, hasPermission: boolean }) => {
      await api.put(`/admin/roles/${roleId}/permissions`, { permissionId, hasPermission });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", selectedRoleId] });
      toast.success("Permission updated successfully");
    },
    onError: () => {
      toast.error("Failed to update permission");
    },
  });

  const handlePermissionToggle = (permissionId: number, hasPermission: boolean) => {
    if (!selectedRoleId || selectedRoleId === "all") return;
    updatePermissionMutation.mutate({ roleId: selectedRoleId, permissionId, hasPermission });
  };

  // Categorize permissions function
  const categorizePermissions = (permissions: Permission[]) => {
    const categories: { [key: string]: Permission[] } = {
      'User Management': [],
      'Caregiver Management': [],
      'Patient Management': [],
      'Accountant Management': [],
      'Regional Manager Management': [],
      'System Manager Management': [],
      'Role & Permission Management': [],
      'Specialty Management': [],
      'Financial & Reports': []
    };
    
    permissions.forEach(permission => {
      if (permission.name.includes('view_users') || permission.name.includes('create_users') || permission.name.includes('delete_users')) {
        categories['User Management'].push(permission);
      } else if (permission.name.includes('caregiver')) {
        categories['Caregiver Management'].push(permission);
      } else if (permission.name.includes('patient')) {
        categories['Patient Management'].push(permission);
      } else if (permission.name.includes('accountant') || permission.name.includes('Accountant')) {
        categories['Accountant Management'].push(permission);
      } else if (permission.name.includes('regional_manager')) {
        categories['Regional Manager Management'].push(permission);
      } else if (permission.name.includes('system_manager')) {
        categories['System Manager Management'].push(permission);
      } else if (permission.name.includes('role') || permission.name.includes('permission')) {
        categories['Role & Permission Management'].push(permission);
      } else if (permission.name.includes('specialt')) {
        categories['Specialty Management'].push(permission);
      } else if (permission.name.includes('financial') || permission.name.includes('care_plan') || permission.name.includes('withdrawal') || permission.name.includes('paychangu')) {
        categories['Financial & Reports'].push(permission);
      }
    });
    
    return categories;
  };

  const roles = (rolesData?.roles || []).filter((role: Role) => 
    role.name !== 'patient' && role.name !== 'caregiver'
  );
  const permissions = permissionsData?.permissions || [];
  const categorizedPermissions = categorizePermissions(permissions);
  const selectedRole = permissionsData?.role;

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute requiredPermission="view_permissions">
      <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={responsive.pageTitle}>Permissions Management</h1>
            <p className={responsive.pageSubtitle}>Manage role permissions</p>
          </div>
        </div>

        <Card className={dashboardCard.base}>
          <CardHeader className={dashboardCard.compactHeader}>
            <div className={dashboardCard.compactHeaderRow}>
              <CardTitle className={`flex items-center gap-2 ${responsive.cardTitle}`}>
                <Key className="h-4 w-4 text-primary" />
                Role Permissions
              </CardTitle>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className={dashboardCard.selectTriggerSm}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Permissions</SelectItem>
                  {roles.map((role: Role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRole && (
              <p className={`${responsive.bodyMuted} mt-2`}>
                Managing permissions for: <strong>{selectedRole.name.replace('_', ' ')}</strong>
              </p>
            )}
          </CardHeader>
          <CardContent className={dashboardCard.compactBody}>
            {selectedRoleId === "all" ? (
              <div className="space-y-4">
                {Object.entries(categorizedPermissions).map(([category, categoryPermissions]) => {
                  if (categoryPermissions.length === 0) return null;
                  return (
                    <div key={category}>
                      <h3 className={`${responsive.cardTitle} mb-2 text-primary`}>{category}</h3>
                      <div className={dashboardCard.tightGrid}>
                        {categoryPermissions.map((permission: Permission) => (
                          <div key={permission.id} className={dashboardCard.compactRow}>
                            <div>
                              <Badge variant="outline" className="capitalize text-xs mb-0.5">
                                {permission.name.replace(/_/g, ' ')}
                              </Badge>
                              <p className={responsive.bodyMuted}>{permission.description || "No description"}</p>
                            </div>
                            <span className={responsive.bodyMuted}>
                              {new Date(permission.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(categorizedPermissions).map(([category, categoryPermissions]) => {
                  if (categoryPermissions.length === 0) return null;
                  return (
                    <div key={category}>
                      <h3 className={`${responsive.cardTitle} mb-2 text-primary`}>{category}</h3>
                      <div className={dashboardCard.tightGrid}>
                        {categoryPermissions.map((permission: Permission) => (
                          <div key={permission.id} className={dashboardCard.compactRow}>
                            <div className="flex-1">
                              <Badge variant="outline" className="capitalize text-xs mb-0.5">
                                {permission.name.replace(/_/g, ' ')}
                              </Badge>
                              <p className={responsive.bodyMuted}>{permission.description || "No description"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={responsive.bodyMuted}>
                                {new Date(permission.createdAt).toLocaleDateString()}
                              </span>
                              <Checkbox
                                checked={permission.hasPermission || false}
                                onCheckedChange={(checked) => handlePermissionToggle(permission.id, !!checked)}
                                disabled={updatePermissionMutation.isPending || selectedRole?.name === 'system_manager'}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
};

export default PermissionsManagement;