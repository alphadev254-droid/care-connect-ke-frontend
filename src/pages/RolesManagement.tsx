import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UserCheck, Plus, Edit, Trash2, Shield, MapPin } from "lucide-react";
import { dashboardCard, responsive } from "@/theme";

interface Role {
  id: number;
  name: string;
  description?: string;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface RoleFormData {
  name: string;
  description: string;
  assignedRegion?: string;
}

const RolesManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
    assignedRegion: ""
  });

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/admin/roles");
      return response.data;
    },
  });

  const roles = rolesData?.roles || [];
  const regions = rolesData?.regions || [];

  const createRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      const response = await api.post("/admin/roles", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Role created successfully!");
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => {
      toast.error("Failed to create role");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RoleFormData }) => {
      const response = await api.put(`/admin/roles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Role updated successfully!");
      setEditingRole(null);
      setIsEditDialogOpen(false);
      setFormData({ name: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/roles/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Role deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => {
      toast.error("Failed to delete role");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createRoleMutation.mutate(formData);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this role?")) {
      deleteRoleMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingRole(null);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    resetForm();
  };

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
    <ProtectedRoute requiredPermission="view_roles">
      <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={responsive.pageTitle}>Roles Management</h1>
            <p className={responsive.pageSubtitle}>Manage user roles and permissions</p>
          </div>
        </div>

        <Card className={dashboardCard.base}>
          <CardHeader className={dashboardCard.header}>
            <CardTitle className={`flex items-center gap-2 ${responsive.cardTitle}`}>
              <Shield className="h-5 w-5 text-primary" />
              System Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <div className={dashboardCard.tableWrapper}>
              <Table className={dashboardCard.tableMinWidth}>
                <TableHeader>
                  <TableRow>
                    <TableHead className={dashboardCard.th}>Role Name</TableHead>
                    <TableHead className={dashboardCard.th}>Description</TableHead>
                    <TableHead className={dashboardCard.th}>Users Count</TableHead>
                    <TableHead className={dashboardCard.th}>Created</TableHead>
                    <TableHead className={`${dashboardCard.th} text-right`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles?.map((role: Role) => (
                    <TableRow key={role.id} className={dashboardCard.tr}>
                      <TableCell className={dashboardCard.td}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {role.name}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className={`${dashboardCard.td} ${responsive.bodyMuted}`}>
                        {role.description || "No description"}
                      </TableCell>
                      <TableCell className={dashboardCard.td}>
                        <Badge variant="secondary">
                          {role.userCount || 0} users
                        </Badge>
                      </TableCell>
                      <TableCell className={`${dashboardCard.td} ${responsive.bodyMuted}`}>
                        {new Date(role.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className={`${dashboardCard.td} text-right`}>
                        <span className={responsive.bodyMuted}>View Only</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
};

export default RolesManagement;