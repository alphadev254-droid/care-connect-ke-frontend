import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { usePermissions } from "@/hooks/usePermissions";
import { api } from "@/lib/api";
import { Users, Calendar } from "lucide-react";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { dashboardCard, responsive } from "@/theme";

interface Specialty {
  id: number;
  name: string;
  description: string;
  sessionFee: number;
  bookingFee: number;
  isActive: boolean;
  completedAppointments?: number;
  totalIncome?: number;
  activeCaregiversCount?: number;
}

const SpecialtyManagement = () => {
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sessionFee: "",
    bookingFee: "",
  });

  const { data: specialties, isLoading } = useQuery({
    queryKey: ["specialties", "all"],
    queryFn: async () => {
      const response = await api.get("/specialties?includeInactive=true");
      return response.data.specialties || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.post("/specialties", {
        name: data.name,
        description: data.description,
        sessionFee: parseFloat(data.sessionFee) || 0,
        bookingFee: parseFloat(data.bookingFee) || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      toast.success("Specialty created successfully");
      setCreateDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      await api.put(`/specialties/${id}`, {
        name: data.name,
        description: data.description,
        sessionFee: parseFloat(data.sessionFee) || 0,
        bookingFee: parseFloat(data.bookingFee) || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      toast.success("Specialty updated successfully");
      setEditDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/specialties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      toast.success("Specialty deactivated successfully");
      setDeleteDialog(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/specialties/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      toast.success("Specialty restored successfully");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", sessionFee: "", bookingFee: "" });
    setSelectedSpecialty(null);
  };

  const handleCreate = () => {
    if (!formData.name.trim()) { toast.error("Please enter a specialty name"); return; }
    createMutation.mutate(formData);
  };

  const handleEdit = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setFormData({
      name: specialty.name,
      description: specialty.description || "",
      sessionFee: specialty.sessionFee?.toString() || "0",
      bookingFee: specialty.bookingFee?.toString() || "0",
    });
    setEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedSpecialty) return;
    if (!formData.name.trim()) { toast.error("Please enter a specialty name"); return; }
    updateMutation.mutate({ id: selectedSpecialty.id, data: formData });
  };

  const handleDelete = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedSpecialty) deleteMutation.mutate(selectedSpecialty.id);
  };

  const handleRestore = (id: number) => restoreMutation.mutate(id);

  const activeSpecialties = specialties?.filter((s: Specialty) => s.isActive) || [];
  const inactiveSpecialties = specialties?.filter((s: Specialty) => !s.isActive) || [];

  return (
    <ProtectedRoute requiredPermission="view_specialties">
      <DashboardLayout userRole="admin">
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={responsive.pageTitle}>Specialty Management</h1>
            <p className={responsive.pageSubtitle}>
              Manage healthcare specialties and their associated fees
            </p>
          </div>
          {hasPermission('create_specialties') && (
            <Button onClick={() => setCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Specialty
            </Button>
          )}
        </div>

        <div className={dashboardCard.compactStatGrid}>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Total Caregivers</p>
                <p className={dashboardCard.compactStatValue}>
                  {activeSpecialties.reduce((sum, s) => sum + (s.activeCaregiversCount || 0), 0)}
                </p>
              </div>
              <div className={dashboardCard.iconWell.primary}>
                <Users className="h-3 w-3 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Patients Booked</p>
                <p className={dashboardCard.compactStatValue}>
                  {activeSpecialties.reduce((sum, s) => sum + (s.completedAppointments || 0), 0)}
                </p>
              </div>
              <div className={dashboardCard.iconWell.secondary}>
                <Calendar className="h-3 w-3 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Total Income (MWK)</p>
                <p className={`${dashboardCard.compactStatValue} text-success`}>
                  {activeSpecialties.reduce((sum, s) => sum + parseFloat(s.totalIncome?.toString() || '0'), 0).toLocaleString()}
                </p>
              </div>
              <div className={dashboardCard.iconWell.success}>
                <DollarSign className="h-3 w-3 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Active Specialties</p>
                <p className={dashboardCard.compactStatValue}>{activeSpecialties.length}</p>
              </div>
              <div className={dashboardCard.iconWell.accent}>
                <CheckCircle className="h-3 w-3 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={dashboardCard.base}>
          <CardHeader className={dashboardCard.header}>
            <div>
              <CardTitle className={responsive.cardTitle}>Active Specialties</CardTitle>
              <CardDescription className={responsive.cardDesc}>
                Currently available specialties for caregivers
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <div className={dashboardCard.tableWrapper}>
              <Table className={dashboardCard.tableMinWidth}>
                <TableHeader>
                  <TableRow>
                    <TableHead className={dashboardCard.th}>Name</TableHead>
                    <TableHead className={dashboardCard.th}>Description</TableHead>
                    <TableHead className={dashboardCard.th}>Caregivers</TableHead>
                    <TableHead className={dashboardCard.th}>Patients Booked</TableHead>
                    <TableHead className={dashboardCard.th}>Total Income (MWK)</TableHead>
                    <TableHead className={dashboardCard.th}>Session Fee (MWK)</TableHead>
                    <TableHead className={dashboardCard.th}>Booking Fee (MWK)</TableHead>
                    <TableHead className={dashboardCard.th}>Status</TableHead>
                    <TableHead className={dashboardCard.th}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Loading specialties...
                      </TableCell>
                    </TableRow>
                  ) : activeSpecialties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className={`text-center py-8 ${responsive.bodyMuted}`}>
                        No active specialties found
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeSpecialties.map((specialty: Specialty) => {
                      const caregiverCount = specialty.activeCaregiversCount || 0;
                      const patientCount = specialty.completedAppointments || 0;
                      const income = parseFloat(specialty.totalIncome?.toString() || '0');
                      return (
                        <TableRow key={specialty.id} className={dashboardCard.tr}>
                          <TableCell className={`${dashboardCard.td} font-medium`}>{specialty.name}</TableCell>
                          <TableCell className={`${dashboardCard.td} max-w-xs truncate`}>
                            {specialty.description || "-"}
                          </TableCell>
                          <TableCell className={dashboardCard.td}>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />{caregiverCount}
                            </span>
                          </TableCell>
                          <TableCell className={dashboardCard.td}>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />{patientCount}
                            </span>
                          </TableCell>
                          <TableCell className={dashboardCard.td}>
                            <span className="text-success font-medium">{income.toLocaleString()}</span>
                          </TableCell>
                          <TableCell className={dashboardCard.td}>{specialty.sessionFee || 0}</TableCell>
                          <TableCell className={dashboardCard.td}>{specialty.bookingFee || 0}</TableCell>
                          <TableCell className={dashboardCard.td}>
                            <Badge variant="success">Active</Badge>
                          </TableCell>
                          <TableCell className={dashboardCard.td}>
                            <div className="flex gap-2">
                              {hasPermission('edit_specialties') && (
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(specialty)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {hasPermission('delete_specialties') && (
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(specialty)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {inactiveSpecialties.length > 0 && (
          <Card className={dashboardCard.base}>
            <CardHeader className={dashboardCard.header}>
              <div>
                <CardTitle className={responsive.cardTitle}>Inactive Specialties</CardTitle>
                <CardDescription className={responsive.cardDesc}>
                  Deactivated specialties that can be restored
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className={dashboardCard.tableWrapper}>
                <Table className={dashboardCard.tableMinWidth}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={dashboardCard.th}>Name</TableHead>
                      <TableHead className={dashboardCard.th}>Description</TableHead>
                      <TableHead className={dashboardCard.th}>Session Fee</TableHead>
                      <TableHead className={dashboardCard.th}>Booking Fee</TableHead>
                      <TableHead className={dashboardCard.th}>Status</TableHead>
                      <TableHead className={dashboardCard.th}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactiveSpecialties.map((specialty: Specialty) => (
                      <TableRow key={specialty.id} className={dashboardCard.tr}>
                        <TableCell className={`${dashboardCard.td} font-medium opacity-60`}>{specialty.name}</TableCell>
                        <TableCell className={`${dashboardCard.td} max-w-xs truncate opacity-60`}>
                          {specialty.description || "-"}
                        </TableCell>
                        <TableCell className={`${dashboardCard.td} opacity-60`}>MWK {specialty.sessionFee || 0}</TableCell>
                        <TableCell className={`${dashboardCard.td} opacity-60`}>MWK {specialty.bookingFee || 0}</TableCell>
                        <TableCell className={dashboardCard.td}>
                          <Badge variant="secondary">Inactive</Badge>
                        </TableCell>
                        <TableCell className={dashboardCard.td}>
                          <Button variant="outline" size="sm" onClick={() => handleRestore(specialty.id)} className="gap-2">
                            <RotateCcw className="h-3 w-3" />
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={responsive.dialogTitle}>Create New Specialty</DialogTitle>
            <DialogDescription className={responsive.dialogDesc}>
              Add a new healthcare specialty with associated fees
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Specialty Name</Label>
              <Input id="name" placeholder="e.g., Elderly Care" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Brief description of the specialty"
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionFee">Session Fee (MWK)</Label>
                <Input id="sessionFee" type="number" placeholder="0.00" value={formData.sessionFee}
                  onChange={(e) => setFormData({ ...formData, sessionFee: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingFee">Booking Fee (MWK)</Label>
                <Input id="bookingFee" type="number" placeholder="0.00" value={formData.bookingFee}
                  onChange={(e) => setFormData({ ...formData, bookingFee: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Specialty"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={responsive.dialogTitle}>Edit Specialty</DialogTitle>
            <DialogDescription className={responsive.dialogDesc}>
              Update specialty information and fees
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Specialty Name</Label>
              <Input id="edit-name" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sessionFee">Session Fee (MWK)</Label>
                <Input id="edit-sessionFee" type="number" value={formData.sessionFee}
                  onChange={(e) => setFormData({ ...formData, sessionFee: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bookingFee">Booking Fee (MWK)</Label>
                <Input id="edit-bookingFee" type="number" value={formData.bookingFee}
                  onChange={(e) => setFormData({ ...formData, bookingFee: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Specialty"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={responsive.dialogTitle}>Deactivate Specialty</AlertDialogTitle>
            <AlertDialogDescription className={responsive.dialogDesc}>
              Are you sure you want to deactivate this specialty? This will remove
              it from the active specialties list, but you can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SpecialtyManagement;
