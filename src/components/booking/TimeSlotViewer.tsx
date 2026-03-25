import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, RefreshCw } from 'lucide-react';
import { timeSlotService, TimeSlot } from '@/services/timeSlotService';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { dashboardCard, responsive } from '@/theme';

export const TimeSlotViewer = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'available' | 'booked'>('all');

  const { data: profileData } = useQuery({
    queryKey: ['caregiver-profile'],
    queryFn: async () => {
      const response = await api.get('/caregivers/profile');
      return response.data.caregiver;
    },
    enabled: !!user,
  });

  const caregiverId = profileData?.id ?? null;

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['caregiver-timeslots', caregiverId],
    queryFn: async () => {
      try {
        const response = await api.get(`/timeslots/caregiver/${caregiverId}`);
        return (response.data.slots || []) as TimeSlot[];
      } catch {
        return timeSlotService.getAvailableSlots({ caregiverId: caregiverId! }) as Promise<TimeSlot[]>;
      }
    },
    enabled: !!caregiverId,
  });

  const refreshSlots = () =>
    queryClient.invalidateQueries({ queryKey: ['caregiver-timeslots', caregiverId] });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/10 text-success';
      case 'booked':    return 'bg-primary/10 text-primary';
      case 'locked':    return 'bg-warning/10 text-warning';
      default:          return 'bg-muted text-muted-foreground';
    }
  };

  const filteredSlots = slots.filter(slot => {
    if (filter === 'all') return true;
    if (filter === 'available') return slot.status === 'available';
    if (filter === 'booked') return slot.status === 'booked';
    return true;
  });

  const availableCount = slots.filter(s => s.status === 'available').length;
  const bookedCount = slots.filter(s => s.status === 'booked').length;
  const lockedCount = slots.filter(s => s.status === 'locked').length;

  return (
    <Card className={dashboardCard.base}>
      <CardHeader className={dashboardCard.compactHeader}>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${responsive.cardTitle}`}>
            <Calendar className="h-4 w-4" />
            My Time Slots (3-hour sessions)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refreshSlots} disabled={isLoading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className={`${dashboardCard.compactBody} space-y-3`}>
        {/* Stats */}
        <div className={dashboardCard.compactStatGrid}>
          <div className={dashboardCard.balanceBlockSuccess}>
            <p className={`${dashboardCard.compactStatValue} text-success`}>{availableCount}</p>
            <p className={responsive.bodyMuted}>Available</p>
          </div>
          <div className={dashboardCard.balanceBlockPrimary}>
            <p className={`${dashboardCard.compactStatValue} text-primary`}>{bookedCount}</p>
            <p className={responsive.bodyMuted}>Booked</p>
          </div>
          <div className={dashboardCard.balanceBlockWarning}>
            <p className={`${dashboardCard.compactStatValue} text-warning`}>{lockedCount}</p>
            <p className={responsive.bodyMuted}>Locked</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({slots.length})
          </Button>
          <Button
            variant={filter === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('available')}
          >
            Available ({availableCount})
          </Button>
          <Button
            variant={filter === 'booked' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('booked')}
          >
            Booked ({bookedCount})
          </Button>
        </div>

        {/* Slots Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No time slots found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'Generate time slots from your availability first'
                : `No ${filter} slots available`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {filteredSlots.map((slot) => (
              <div key={slot.id} className={dashboardCard.listRow}>
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                    <Badge variant="secondary">3hrs</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(slot.status)}>{slot.status}</Badge>
                  {slot.status === 'booked' && slot.appointmentId && (
                    <Badge variant="outline">
                      <User className="h-3 w-3 mr-1" />
                      #{slot.appointmentId}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};