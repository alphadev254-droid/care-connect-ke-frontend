import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { availabilityService, AvailabilitySlot, CaregiverAvailability } from '@/services/availabilityService';
import { timeSlotService } from '@/services/timeSlotService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { dashboardCard, responsive } from '@/theme';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

export const AvailabilityManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draftSlots, setDraftSlots] = useState<AvailabilitySlot[]>([]);
  const [generatingSlotId, setGeneratingSlotId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<'single' | 'all' | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['caregiver-profile'],
    queryFn: async () => {
      const response = await api.get('/caregivers/profile');
      return response.data.caregiver;
    },
    enabled: !!user,
  });

  const caregiverId = profileData?.id ?? null;

  const { data: savedAvailability = [], isLoading: availLoading } = useQuery({
    queryKey: ['caregiver-availability', caregiverId],
    queryFn: async () => {
      const response = await availabilityService.getAvailability(caregiverId!);
      return (response.availability || []) as CaregiverAvailability[];
    },
    enabled: !!caregiverId,
  });

  const isLoading = profileLoading || availLoading;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['caregiver-availability', caregiverId] });

  const saveMutation = useMutation({
    mutationFn: (slots: AvailabilitySlot[]) => availabilityService.setAvailability(slots),
    onSuccess: (response) => {
      invalidate();
      setEditing(false);
      if (response.deleted !== undefined && response.created !== undefined) {
        toast.success(`Availability saved (${response.deleted} deleted, ${response.created} created)`);
      } else {
        toast.success('Availability saved successfully');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ action, slotId }: { action: 'single' | 'all'; slotId?: number }) => {
      if (action === 'single' && slotId) return availabilityService.deleteSlot(slotId);
      return availabilityService.clearAll();
    },
    onSuccess: (response, { action }) => {
      invalidate();
      if (action === 'single') {
        toast.success('Availability slot and related time slots deleted');
      } else {
        setEditing(false);
        toast.success(`All availability cleared (${(response as any).deleted} slots deleted)`);
      }
    },
    onSettled: () => {
      setDeleteDialogOpen(false);
      setSlotToDelete(null);
      setDeleteAction(null);
    },
  });

  const mutating = saveMutation.isPending || deleteMutation.isPending;

  const addAvailabilitySlot = () =>
    setDraftSlots(prev => [...prev, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);

  const removeAvailabilitySlot = (index: number) =>
    setDraftSlots(prev => prev.filter((_, i) => i !== index));

  const updateAvailabilitySlot = (index: number, field: keyof AvailabilitySlot, value: any) =>
    setDraftSlots(prev => { const u = [...prev]; u[index] = { ...u[index], [field]: value }; return u; });

  const startEditing = () => {
    setDraftSlots(savedAvailability.map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime })));
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setDraftSlots([]);
  };

  const openDeleteDialog = (slotId: number) => { setSlotToDelete(slotId); setDeleteAction('single'); setDeleteDialogOpen(true); };
  const openClearAllDialog = () => { setDeleteAction('all'); setDeleteDialogOpen(true); };
  const handleCancelDelete = () => { setDeleteDialogOpen(false); setSlotToDelete(null); setDeleteAction(null); };
  const handleConfirmDelete = () => {
    if (!caregiverId) { toast.error('Caregiver ID not found'); setDeleteDialogOpen(false); return; }
    deleteMutation.mutate({ action: deleteAction!, slotId: slotToDelete ?? undefined });
  };

  const activeSlots = editing ? draftSlots : savedAvailability.map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }));


  const generateTimeSlotsForSlot = async (availabilityId: number) => {
    if (!caregiverId) return;
    setGeneratingSlotId(availabilityId);
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await timeSlotService.generateTimeSlotsForAvailability({ availabilityId, startDate, endDate });
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['caregiver-timeslots'] });
      toast.success('Time slots generated for next 30 days');
    } catch {
      toast.error('Failed to generate time slots');
    } finally {
      setGeneratingSlotId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className={dashboardCard.base}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={dashboardCard.base}>
      <CardHeader className={dashboardCard.compactHeader}>
        <CardTitle className={`flex items-center gap-2 ${responsive.cardTitle}`}>
          <Clock className="h-4 w-4" />
          Availability Management
        </CardTitle>
      </CardHeader>
      <CardContent className={`${dashboardCard.compactBody} space-y-3`}>
        {!editing && savedAvailability && savedAvailability.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className={responsive.cardTitle}>Current Schedule</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={startEditing} disabled={mutating}>
                  Edit Schedule
                </Button>
                <Button variant="destructive" size="sm" onClick={openClearAllDialog} disabled={mutating}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              {savedAvailability.map((slot, index) => (
                <div key={index} className={`${dashboardCard.listRow}`}>
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant="secondary">
                      {DAYS.find(d => d.value === slot.dayOfWeek)?.label}
                    </Badge>
                    <span className={responsive.body}>{slot.startTime?.slice(0,5)} - {slot.endTime?.slice(0,5)}</span>
                    {slot.hasTimeSlots && (
                      <Badge variant="outline" className="text-xs">
                        {slot.timeSlotCount} slots generated
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!slot.hasTimeSlots && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => generateTimeSlotsForSlot(slot.id)}
                        disabled={generatingSlotId === slot.id || mutating}
                      >
                        {generatingSlotId === slot.id ? 'Generating...' : 'Generate Slots'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(slot.id)}
                      disabled={mutating}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(editing || savedAvailability.length === 0) && (
          <>
            {activeSlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <select
                  value={slot.dayOfWeek}
                  onChange={(e) => updateAvailabilitySlot(index, 'dayOfWeek', parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-md"
                >
                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                
                <Input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                  className="w-32"
                />
                
                <span className="text-muted-foreground">to</span>
                
                <Input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                  className="w-32"
                />
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeAvailabilitySlot(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </>
        )}

        {(editing || savedAvailability.length === 0) && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={addAvailabilitySlot}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
            <Button
              onClick={() => saveMutation.mutate(activeSlots)}
              disabled={mutating || activeSlots.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {saveMutation.isPending ? 'Saving...' : `Save Availability (${activeSlots.length})`}
            </Button>
            {editing && (
              <Button variant="outline" onClick={cancelEditing} disabled={mutating}>
                Cancel
              </Button>
            )}
          </div>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                {deleteAction === 'single'
                  ? 'Deleting this availability will also remove all related time slots. Are you sure you want to continue?'
                  : 'This will clear all availability and delete all related time slots. Are you sure you want to continue?'
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelDelete} disabled={mutating}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={mutating}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};