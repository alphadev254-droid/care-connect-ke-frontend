import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AvailabilityManager } from "@/components/booking/AvailabilityManager";
import { TimeSlotViewer } from "@/components/booking/TimeSlotViewer";
import { RescheduleModal } from "@/components/booking/RescheduleModal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { toast } from "sonner";
import { dashboardCard, responsive, btn } from "@/theme";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Check,
  X,
  Phone,
  DollarSign,
  CheckCircle,
  Eye,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Schedule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["caregiver-appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments");
      return response.data.appointments || [];
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await api.put(`/appointments/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caregiver-appointments"] });
      toast.success("Appointment updated successfully");
    },
    onError: () => {
      toast.error("Failed to update appointment");
    },
  });

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

  const confirmedAppointments = appointments.filter(apt => apt.bookingFeeStatus === 'completed' && apt.status === 'session_waiting');
  const completedAppointments = appointments.filter(apt => apt.paymentStatus === 'completed' && apt.status === 'session_attended');

  const handleReschedule = (appointment: any) => {
    setAppointmentToReschedule(appointment);
    setShowRescheduleModal(true);
  };

  const canReschedule = (appointment: any) => {
    const cutoffHours = parseInt(import.meta.env.VITE_RESCHEDULE_CUTOFF_HOURS) || 12;
    const maxReschedules = parseInt(import.meta.env.VITE_MAX_RESCHEDULES_PER_APPOINTMENT) || 2;
    
    const hoursUntilAppointment = (new Date(appointment.scheduledDate) - new Date()) / (1000 * 60 * 60);
    const rescheduleCount = appointment.rescheduleCount || 0;
    
    return hoursUntilAppointment >= cutoffHours && 
           rescheduleCount < maxReschedules &&
           appointment.status === 'session_waiting';
  };

  const tabSpinner = (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
    </div>
  );

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'caregiver')}>
      <div className="space-y-3 md:space-y-4">
        <div>
          <h1 className={responsive.pageTitle}>My Schedule</h1>
          <p className={responsive.pageSubtitle}>Manage your appointments and availability</p>
        </div>

        <Card className={dashboardCard.base}>
          <CardContent className={dashboardCard.compactBody}>
            {/* Stat row */}
            <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
              <div className={dashboardCard.compactStatContent + " rounded-lg bg-muted/40"}>
                <div>
                  <p className={responsive.bodyMuted}>Confirmed Appointments</p>
                  <p className={dashboardCard.compactStatValue}>{confirmedAppointments.length}</p>
                </div>
                <div className={dashboardCard.iconWell.primary}>
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
              </div>
              <div className={dashboardCard.compactStatContent + " rounded-lg bg-muted/40"}>
                <div>
                  <p className={responsive.bodyMuted}>Completed Appointments</p>
                  <p className={dashboardCard.compactStatValue}>{completedAppointments.length}</p>
                </div>
                <div className={dashboardCard.iconWell.success}>
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="confirmed" className="flex gap-3">
              <TabsList className="flex flex-col h-auto w-32 shrink-0 items-stretch gap-0.5 bg-muted/50 p-1 rounded-lg self-start">
                <TabsTrigger value="confirmed" className="justify-start text-xs px-2 py-1.5 gap-1.5">
                  Confirmed
                  <Badge variant="secondary" className="ml-auto text-xs px-1">{confirmedAppointments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="justify-start text-xs px-2 py-1.5 gap-1.5">
                  Completed
                  <Badge variant="secondary" className="ml-auto text-xs px-1">{completedAppointments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="availability" className="justify-start text-xs px-2 py-1.5">
                  Availability
                </TabsTrigger>
                <TabsTrigger value="timeslots" className="justify-start text-xs px-2 py-1.5">
                  Time Slots
                </TabsTrigger>
              </TabsList>
              <div className="flex-1 min-w-0">

          <TabsContent value="confirmed" className="space-y-4">
            <Card className={dashboardCard.base}>
              <div className={`${dashboardCard.compactHeader} border-b`}>
                <h2 className={responsive.cardTitle}>Confirmed Appointments</h2>
                <p className={responsive.bodyMuted}>Appointments with booking fee paid, awaiting session</p>
              </div>
              <CardContent className="p-0 overflow-hidden">
                {isLoading ? tabSpinner : confirmedAppointments.length > 0 ? (
                  <div className={dashboardCard.tableWrapper}>
                  <Table className={dashboardCard.tableMinWidth}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Session Type</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {confirmedAppointments.map((appointment: any) => {
                        const bookingFeePaid = appointment.bookingFeeStatus === 'completed';
                        const sessionFeePaid = appointment.sessionFeeStatus === 'completed';

                        return (
                          <TableRow key={appointment.id} className={dashboardCard.tr}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{new Date(appointment.scheduledDate).toLocaleDateString()}</p>
                                  <p className={responsive.bodyMuted}>{appointment.TimeSlot?.startTime} - {appointment.TimeSlot?.endTime}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={dashboardCard.avatar}>
                                  {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
                                </div>
                                <div>
                                  <p className="font-medium">{appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}</p>
                                  <p className={responsive.bodyMuted}>ID: #{appointment.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p>{appointment.Specialty?.name || 'General Care'}</p>
                              <p className={responsive.bodyMuted}>{appointment.TimeSlot?.duration || 180} min</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {appointment.sessionType === 'video' || appointment.sessionType === 'teleconference' ? (
                                  <><Video className="h-3 w-3 text-muted-foreground" /><span>Video Call</span></>
                                ) : (
                                  <><MapPin className="h-3 w-3 text-muted-foreground" /><span>In-Person</span></>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge variant={bookingFeePaid ? 'default' : 'outline'} className={`w-fit ${bookingFeePaid ? 'bg-success/10 text-success' : ''}`}>
                                  {bookingFeePaid ? <CheckCircle className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                                  Booking
                                </Badge>
                                <Badge variant={sessionFeePaid ? 'default' : 'outline'} className={`w-fit ${sessionFeePaid ? 'bg-primary/10 text-primary' : ''}`}>
                                  {sessionFeePaid ? <CheckCircle className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                                  Session
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/appointment/${appointment.id}`)}
                                  className={btn.size.sm + " " + btn.text}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReschedule(appointment)}
                                  disabled={!canReschedule(appointment)}
                                  className={btn.size.sm + " " + btn.text}
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  Reschedule
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => navigate(`/dashboard/reports?appointment=${appointment.id}`)}
                                  disabled={!sessionFeePaid}
                                  className={btn.size.sm + " " + btn.text + " bg-green-600 hover:bg-green-700"}
                                  title={!sessionFeePaid ? "Session fee must be paid before completing" : "Complete session and create report"}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Complete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <h3 className={`${responsive.cardTitle} mb-1`}>No confirmed appointments</h3>
                    <p className={responsive.bodyMuted}>Confirmed appointments will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card className={dashboardCard.base}>
              <div className={`${dashboardCard.compactHeader} border-b`}>
                <h2 className={responsive.cardTitle}>Completed Appointments</h2>
                <p className={responsive.bodyMuted}>Sessions completed with reports submitted</p>
              </div>
              <CardContent className="p-0 overflow-hidden">
                {isLoading ? tabSpinner : completedAppointments.length > 0 ? (
                  <div className={dashboardCard.tableWrapper}>
                  <Table className={dashboardCard.tableMinWidth}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Session Type</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedAppointments.map((appointment: any) => {
                        const bookingFeePaid = appointment.bookingFeeStatus === 'completed';
                        const sessionFeePaid = appointment.sessionFeeStatus === 'completed';

                        return (
                          <TableRow key={appointment.id} className={dashboardCard.tr}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{new Date(appointment.scheduledDate).toLocaleDateString()}</p>
                                  <p className={responsive.bodyMuted}>{appointment.TimeSlot?.startTime} - {appointment.TimeSlot?.endTime}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={dashboardCard.avatar}>
                                  {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
                                </div>
                                <div>
                                  <p className="font-medium">{appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}</p>
                                  <p className={responsive.bodyMuted}>ID: #{appointment.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p>{appointment.Specialty?.name || 'General Care'}</p>
                              <p className={responsive.bodyMuted}>{appointment.TimeSlot?.duration || 180} min</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {appointment.sessionType === 'video' || appointment.sessionType === 'teleconference' ? (
                                  <><Video className="h-3 w-3 text-muted-foreground" /><span>Video Call</span></>
                                ) : (
                                  <><MapPin className="h-3 w-3 text-muted-foreground" /><span>In-Person</span></>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge variant={bookingFeePaid ? 'default' : 'outline'} className={`w-fit ${bookingFeePaid ? 'bg-success/10 text-success' : ''}`}>
                                  {bookingFeePaid ? <CheckCircle className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                                  Booking
                                </Badge>
                                <Badge variant={sessionFeePaid ? 'default' : 'outline'} className={`w-fit ${sessionFeePaid ? 'bg-primary/10 text-primary' : ''}`}>
                                  {sessionFeePaid ? <CheckCircle className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                                  Session
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/appointment/${appointment.id}`)}
                                className={btn.size.sm + " " + btn.text}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <CheckCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <h3 className={`${responsive.cardTitle} mb-1`}>No completed appointments</h3>
                    <p className={responsive.bodyMuted}>Completed appointments will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityManager />
          </TabsContent>

          <TabsContent value="timeslots">
            <TimeSlotViewer />
          </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Reschedule Modal */}
        <RescheduleModal
          open={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setAppointmentToReschedule(null);
          }}
          appointment={appointmentToReschedule}
          onRescheduleSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["caregiver-appointments"] });
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Schedule;