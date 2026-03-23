import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { RescheduleModal } from "@/components/booking/RescheduleModal";
import CancelModal from "@/components/booking/CancelModal";
import { ExportButton } from "@/components/shared/ExportButton";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { toast } from "sonner";
import { dashboardCard, dashboardTokens, responsive } from "@/theme";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  MoreVertical,
  DollarSign,
  User,
  Mail,
  Home,
  RotateCcw,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const Appointments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isCaregiver = user?.role === 'caregiver';
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments");
      return response.data.appointments || [];
    },
  });

  const markAttendedMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      await api.patch(`/appointments/${appointmentId}/status`, { 
        status: "session_attended" 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const paySessionFeeMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      console.log('Initiating session fee payment for:', appointmentData);
      const response = await api.post('/payments/initiate-session', {
        appointmentId: appointmentData.id
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Session fee payment response:', data);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        toast.success('Redirecting to payment...');
      } else {
        toast.success('Payment initiated successfully');
      }
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
    }
  });

  const handlePaySessionFee = (appointment: any) => {
    console.log('Pay session fee clicked for appointment:', appointment);
    setSelectedAppointment(appointment);
    paySessionFeeMutation.mutate(appointment);
  };

  const handleShowContact = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowContactDialog(true);
  };

  const handleReschedule = (appointment: any) => {
    setAppointmentToReschedule(appointment);
    setShowRescheduleModal(true);
  };

  const handleCancel = (appointment: any) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const cancelAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, reason }: { appointmentId: number; reason?: string }) => {
      const response = await api.post(`/appointments/${appointmentId}/cancel`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowCancelModal(false);
      setAppointmentToCancel(null);
      toast.success('Appointment cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel appointment');
    }
  });

  const canCancel = (appointment: any) => {
    const cutoffHours = 16; // 16 hours before appointment
    const appointmentDateTime = new Date(`${appointment.TimeSlot?.date || appointment.scheduledDate} ${appointment.TimeSlot?.startTime || ''}`);
    const currentTime = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilAppointment >= cutoffHours && 
           (appointment.status === 'session_waiting' || appointment.status === 'pending');
  };

  const canReschedule = (appointment: any) => {
    const cutoffHours = parseInt(import.meta.env.VITE_RESCHEDULE_CUTOFF_HOURS) || 12;
    const maxReschedules = parseInt(import.meta.env.VITE_MAX_RESCHEDULES_PER_APPOINTMENT) || 2;
    
    const hoursUntilAppointment = (new Date(appointment.scheduledDate || appointment.date) - new Date()) / (1000 * 60 * 60);
    const rescheduleCount = appointment.rescheduleCount || 0;
    
    // Debug logging
    console.log('Reschedule check for appointment:', appointment.id, {
      hoursUntilAppointment,
      rescheduleCount,
      maxReschedules,
      cutoffHours,
      status: appointment.status,
      canReschedule: hoursUntilAppointment >= cutoffHours && rescheduleCount < maxReschedules && appointment.status === 'session_waiting'
    });
    
    return hoursUntilAppointment >= cutoffHours && 
           rescheduleCount < maxReschedules &&
           appointment.status === 'session_waiting';
  };

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "session_waiting" || apt.status === "pending"
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === "session_attended" || apt.status === "session_cancelled"
  );
  const rescheduledAppointments = appointments.filter(
    (apt) => apt.status === "session_rescheduled"
  );

  const confirmedAppointments = appointments.filter(
    (apt) => apt.bookingFeeStatus === "completed" && apt.status === "session_waiting"
  );
  const completedAppointments = appointments.filter(
    (apt) => apt.paymentStatus === "completed" && apt.status === "session_attended"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "session_waiting":
        return "bg-primary/10 text-primary";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "session_attended":
        return "bg-success text-success-foreground";
      case "session_cancelled":
        return "bg-destructive text-destructive-foreground";
      case "session_rescheduled":
        return "bg-warning/20 text-warning-foreground";
      default:
        return "";
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "session_waiting":
        return "Waiting for Session";
      case "session_attended":
        return "Session Completed";
      case "session_cancelled":
        return "Cancelled";
      case "session_rescheduled":
        return "Rescheduled";
      default:
        return status;
    }
  };

  const PatientCard = ({ appointment }: { appointment: typeof appointments[0] }) => (
    <Card className={`${dashboardCard.base} hover:shadow-md transition-shadow`}>
      <CardContent className={dashboardCard.statContent}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-base font-bold">
              {(appointment.caregiver || appointment.Caregiver?.User?.firstName || 'C').charAt(0)}
            </div>
            <div>
              <h3 className={`font-semibold ${responsive.body}`}>{appointment.caregiver || `${appointment.Caregiver?.User?.firstName || ''} ${appointment.Caregiver?.User?.lastName || ''}`.trim() || 'Caregiver'}</h3>
              <p className={responsive.bodyMuted}>{appointment.Specialty?.name || appointment.specialty || 'General Care'}</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <Badge className={`${getStatusColor(appointment.status)} text-xs px-2.5 py-1 h-6`}>
                  {getStatusLabel(appointment.status)}
                </Badge>
                {appointment.bookingFeeStatus === 'completed' && (
                  <Badge variant="outline" className="bg-success/10 text-success text-[11px] px-1.5 py-0.5 h-5">
                    Booking ✓
                  </Badge>
                )}
                {appointment.sessionFeeStatus === 'completed' && (
                  <Badge variant="outline" className="bg-primary/10 text-primary text-[11px] px-1.5 py-0.5 h-5">
                    Session ✓
                  </Badge>
                )}
                {appointment.rescheduleCount > 0 && (
                  <Badge variant="outline" className="bg-warning/10 text-warning-foreground text-[11px] px-1.5 py-0.5 h-5">
                    Rescheduled {appointment.rescheduleCount}x
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/appointment/${appointment.id}`)} className="text-sm">View Details</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleReschedule(appointment)}
                disabled={!canReschedule(appointment)}
                className="text-sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reschedule
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive text-sm"
                onClick={() => handleCancel(appointment)}
                disabled={!canCancel(appointment)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{new Date(appointment.scheduledDate || appointment.date).toLocaleDateString()}</span>
          </div>
          <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{appointment.TimeSlot ?
              `${appointment.TimeSlot.startTime} - ${appointment.TimeSlot.endTime}` :
              new Date(appointment.scheduledDate || appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            }</span>
          </div>
          <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
            {appointment.sessionType === "teleconference" || appointment.type === "video" ? (
              <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="truncate">{appointment.sessionType === "teleconference" || appointment.type === "video" ? "Video" : "In-Person"}</span>
          </div>
          <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium truncate">MWK {appointment.totalCost || appointment.TimeSlot?.price || 'N/A'}</span>
          </div>
        </div>

        {(appointment.jitsiRoomName || appointment.patientMeetingToken) && appointment.sessionType === "teleconference" && (
          <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="space-y-2">
              {appointment.jitsiRoomName && (
                <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
                  <Video className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${responsive.bodyMuted}`}>Meeting Room</p>
                    <p className={`truncate ${responsive.bodyMuted}`}>{appointment.jitsiRoomName}</p>
                  </div>
                </div>
              )}
              {appointment.patientMeetingToken && (
                <div className={appointment.jitsiRoomName ? "pt-2 border-t border-primary/20" : ""}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-8"
                    onClick={() => {
                      const meetingUrl = `${window.location.origin}/meeting/join/${appointment.patientMeetingToken}`;
                      navigator.clipboard.writeText(meetingUrl);
                      toast.success('Meeting link copied to clipboard');
                    }}
                  >
                    <Video className="h-3 w-3 mr-1.5" />
                    Copy Meeting Link
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {appointment.sessionType === "in_person" && appointment.Location && (
          <div className="mt-3 p-3 bg-success/5 rounded-lg border border-success/20">
            <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
              <MapPin className="h-4 w-4 text-success flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${responsive.bodyMuted}`}>Location</p>
                <p className={responsive.bodyMuted}>{appointment.Location.name}</p>
                {appointment.Location.address && (
                  <p className={responsive.bodyMuted}>{appointment.Location.address}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {appointment.notes && (
          <div className="mt-3 p-3 bg-muted/50 rounded">
            <p className={`font-medium mb-1 ${responsive.bodyMuted}`}>Notes:</p>
            <p className={responsive.bodyMuted}>{appointment.notes}</p>
          </div>
        )}

        {appointment.status === "session_waiting" && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            {appointment.sessionType === "teleconference" || appointment.type === "video" ? (
              <Button
                className="flex-1 gap-2 h-8 text-xs"
                onClick={() => navigate(`/teleconference?appointmentId=${appointment.id}`)}
              >
                <Video className="h-4 w-4" />
                Join Call
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1 gap-2 h-8 text-xs"
                onClick={() => handleShowContact(appointment)}
              >
                <Phone className="h-4 w-4" />
                Contact
              </Button>
            )}
              <Button
                variant="outline"
                className="flex-1 gap-2 h-8 text-xs"
                onClick={() => handleReschedule(appointment)}
                disabled={!canReschedule(appointment)}
              >
                <RotateCcw className="h-4 w-4" />
                Reschedule
              </Button>
          </div>
        )}

        {appointment.status === "session_waiting" && appointment.sessionFeeStatus === "pending" && (
          <div className="mt-3 pt-3 border-t">
            <div className="bg-muted/40 p-3 rounded mb-2 space-y-1">
              <div className={`flex justify-between ${responsive.bodyMuted}`}>
                <span>Base fee:</span>
                <span>MWK {Number(appointment.sessionFee || 0).toLocaleString()}</span>
              </div>
              <div className={`flex justify-between ${responsive.bodyMuted}`}>
                <span>Tax ({appointment.Specialty?.taxRate || 17.5}%):</span>
                <span>MWK {Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 17.5) / 100)).toLocaleString()}</span>
              </div>
              <div className={`flex justify-between ${responsive.bodyMuted}`}>
                <span>Processing ({appointment.Specialty?.convenienceFeePercentage || 2}%):</span>
                <span>MWK {Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100)).toLocaleString()}</span>
              </div>
              <div className={`flex justify-between font-semibold border-t pt-1 ${responsive.body}`}>
                <span>Total:</span>
                <span>MWK {(
                  Number(appointment.sessionFee || 0) +
                  Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 17.5) / 100)) +
                  Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100))
                ).toLocaleString()}</span>
              </div>
            </div>
            <Button
              className="w-full gap-2 bg-primary hover:bg-primary/90 h-8 text-xs"
              onClick={() => {
                console.log('Button clicked for appointment:', appointment.id);
                handlePaySessionFee(appointment);
              }}
              disabled={paySessionFeeMutation.isPending}
            >
              <DollarSign className="h-4 w-4" />
              {paySessionFeeMutation.isPending ? 'Processing...' : `Pay Session Fee - MWK ${(
                Number(appointment.sessionFee || 0) +
                Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 17.5) / 100)) +
                Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100))
              ).toLocaleString()}`}
            </Button>
          </div>
        )}

        {appointment.status === "session_attended" && appointment.sessionFeeStatus === "pending" && (
          <div className="mt-3 pt-3 border-t">
            <div className="bg-muted/40 p-3 rounded mb-2 space-y-1">
              <div className={`flex justify-between ${responsive.bodyMuted}`}>
                <span>Base fee:</span>
                <span>MWK {Number(appointment.sessionFee || 0).toLocaleString()}</span>
              </div>
              <div className={`flex justify-between ${responsive.bodyMuted}`}>
                <span>Tax ({appointment.Specialty?.taxRate || 17.5}%):</span>
                <span>MWK {Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 17.5) / 100)).toLocaleString()}</span>
              </div>
              <div className={`flex justify-between ${responsive.bodyMuted}`}>
                <span>Processing ({appointment.Specialty?.convenienceFeePercentage || 2}%):</span>
                <span>MWK {Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100)).toLocaleString()}</span>
              </div>
              <div className={`flex justify-between font-semibold border-t pt-1 ${responsive.body}`}>
                <span>Total:</span>
                <span>MWK {(
                  Number(appointment.sessionFee || 0) +
                  Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 17.5) / 100)) +
                  Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100))
                ).toLocaleString()}</span>
              </div>
            </div>
            <Button
              className="w-full gap-2 bg-primary hover:bg-primary/90 h-8 text-xs"
              onClick={() => handlePaySessionFee(appointment)}
              disabled={paySessionFeeMutation.isPending}
            >
              <DollarSign className="h-4 w-4" />
              Pay Session Fee - MWK {(
                Number(appointment.sessionFee || 0) +
                Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 17.5) / 100)) +
                Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100))
              ).toLocaleString()}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CaregiverCard = ({ appointment }: { appointment: typeof appointments[0] }) => (
    <Card className={`${dashboardCard.base} mb-3`}>
      <CardContent className={dashboardCard.statContent}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={dashboardCard.iconWell.primary}>
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className={`font-semibold ${responsive.body}`}>
                {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
              </h4>
              <p className={responsive.bodyMuted}>{appointment.Specialty?.name}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(appointment.status)} text-xs px-2.5 py-1`}>
            {appointment.status === "session_waiting" ? "Confirmed" : "Completed"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
          </div>
          <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{appointment.TimeSlot?.startTime} - {appointment.TimeSlot?.endTime}</span>
          </div>
          <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
            {appointment.sessionType === "teleconference" ? (
              <Video className="w-4 h-4 text-muted-foreground" />
            ) : (
              <MapPin className="w-4 h-4 text-muted-foreground" />
            )}
            <span>{appointment.sessionType === "teleconference" ? "Video Call" : "In-Person"}</span>
          </div>
          <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>MWK {appointment.totalCost}</span>
          </div>
        </div>

        {(appointment.jitsiRoomName || appointment.caregiverMeetingToken) && appointment.sessionType === "teleconference" && (
          <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="space-y-2">
              {appointment.jitsiRoomName && (
                <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
                  <Video className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${responsive.bodyMuted}`}>Meeting Room</p>
                    <p className={`truncate ${responsive.bodyMuted}`}>{appointment.jitsiRoomName}</p>
                  </div>
                </div>
              )}
              {appointment.caregiverMeetingToken && (
                <div className={appointment.jitsiRoomName ? "pt-2 border-t border-primary/20" : ""}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-8"
                    onClick={() => {
                      const meetingUrl = `${window.location.origin}/meeting/join/${appointment.caregiverMeetingToken}`;
                      navigator.clipboard.writeText(meetingUrl);
                      toast.success('Meeting link copied to clipboard');
                    }}
                  >
                    <Video className="h-3 w-3 mr-1.5" />
                    Copy Meeting Link
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {appointment.sessionType === "in_person" && appointment.Location && (
          <div className="mt-3 p-3 bg-success/5 rounded-lg border border-success/20">
            <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
              <MapPin className="h-4 w-4 text-success flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${responsive.bodyMuted}`}>Location</p>
                <p className={responsive.bodyMuted}>{appointment.Location.name}</p>
                {appointment.Location.address && (
                  <p className={responsive.bodyMuted}>{appointment.Location.address}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {appointment.notes && (
          <div className="mt-3 p-3 bg-muted/50 rounded">
            <span className={`font-medium ${responsive.bodyMuted}`}>Notes: </span>
            <span className={responsive.bodyMuted}>{appointment.notes}</span>
          </div>
        )}

        {appointment.status === "session_waiting" && (
          <div className="mt-3 pt-3 border-t">
            <Button
              onClick={() => markAttendedMutation.mutate(appointment.id)}
              disabled={markAttendedMutation.isPending}
              className="w-full h-9 text-sm"
            >
              Mark Session Attended
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className={responsive.pageTitle}>
            {isCaregiver ? "My Appointments" : "Appointments"}
          </h1>
          <p className={responsive.pageSubtitle}>
            {isCaregiver ? "Manage your patient appointments" : "Manage your healthcare appointments"}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-3">
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.statContent}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={responsive.bodyMuted}>{isCaregiver ? 'Confirmed' : 'Upcoming'}</p>
                  <p className={responsive.statValue}>{upcomingAppointments.length}</p>
                </div>
                <div className={dashboardCard.iconWell.primary}>
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.statContent}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={responsive.bodyMuted}>{isCaregiver ? 'Completed' : 'Past'}</p>
                  <p className={responsive.statValue}>{pastAppointments.length}</p>
                </div>
                <div className={dashboardCard.iconWell.success}>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.statContent}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={responsive.bodyMuted}>Total Appointments</p>
                  <p className={responsive.statValue}>{appointments.length}</p>
                </div>
                <div className={dashboardCard.iconWell.accent}>
                  <AlertCircle className="h-4 w-4 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Appointments Tabs */}
        <Tabs defaultValue={isCaregiver ? "confirmed" : "upcoming"} className="space-y-6">
          <TabsList className="h-9">
            {isCaregiver ? (
              <>
                <TabsTrigger value="confirmed" className="gap-2 text-xs">
                  Confirmed
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{confirmedAppointments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2 text-xs">
                  Completed
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{completedAppointments.length}</Badge>
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="upcoming" className="gap-2 text-xs">
                  Upcoming
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{upcomingAppointments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2 text-xs">
                  Past
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{pastAppointments.length}</Badge>
                </TabsTrigger>
                {rescheduledAppointments.length > 0 && (
                  <TabsTrigger value="rescheduled" className="gap-2 text-xs">
                    Rescheduled
                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{rescheduledAppointments.length}</Badge>
                  </TabsTrigger>
                )}
              </>
            )}
          </TabsList>

          {isCaregiver ? (
            <>
              <TabsContent value="confirmed" className="mt-4">
                <Card className={dashboardCard.base}>
                  <CardHeader className={dashboardCard.header}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <CardTitle className={responsive.cardTitle}>Confirmed Appointments</CardTitle>
                        <CardDescription className={responsive.cardDesc}>
                          {confirmedAppointments.length} confirmed appointment(s)
                        </CardDescription>
                      </div>
                      {confirmedAppointments.length > 0 && (
                        <ExportButton
                          data={confirmedAppointments}
                          columns={[
                            {
                              header: "Date",
                              accessor: (row: any) => new Date(row.scheduledDate).toLocaleDateString(),
                            },
                            {
                              header: "Time",
                              accessor: (row: any) => row.TimeSlot ? `${row.TimeSlot.startTime} - ${row.TimeSlot.endTime}` : 'N/A',
                            },
                            {
                              header: "Patient",
                              accessor: (row: any) => `${row.Patient?.User?.firstName || ''} ${row.Patient?.User?.lastName || ''}`,
                            },
                            {
                              header: "Specialty",
                              accessor: (row: any) => row.Specialty?.name || 'General Care',
                            },
                            {
                              header: "Session Type",
                              accessor: (row: any) => row.sessionType === 'teleconference' ? 'Video Call' : 'In-Person',
                            },
                            {
                              header: "Amount",
                              accessor: (row: any) => `MWK ${row.totalCost || 0}`,
                            },
                          ]}
                          filename={`confirmed-appointments-${new Date().toISOString().split('T')[0]}`}
                          title="Confirmed Appointments"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="py-12">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">Loading appointments...</p>
                        </div>
                      </div>
                    ) : confirmedAppointments.length === 0 ? (
                      <div className="py-12 text-center">
                        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <h3 className="font-semibold text-sm mb-1">No confirmed appointments</h3>
                        <p className="text-xs text-muted-foreground">
                          Confirmed appointments will appear here
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs font-semibold">Patient</TableHead>
                            <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                            <TableHead className="text-xs font-semibold">Specialty</TableHead>
                            <TableHead className="text-xs font-semibold">Type</TableHead>
                            <TableHead className="text-xs font-semibold">Amount</TableHead>
                            <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {confirmedAppointments.map((appointment) => (
                            <TableRow key={appointment.id} className="hover:bg-muted/30">
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold" aria-hidden="true">
                                    {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.Patient?.User?.phone || 'No phone'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {new Date(appointment.scheduledDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.TimeSlot ? `${appointment.TimeSlot.startTime} - ${appointment.TimeSlot.endTime}` : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <p className="text-sm">{appointment.Specialty?.name || 'General Care'}</p>
                              </TableCell>
                              <TableCell className="p-3">
                                <div className="flex items-center gap-1 text-sm">
                                  {appointment.sessionType === 'teleconference' ? (
                                    <><Video className="h-3 w-3" /> Video</>
                                  ) : (
                                    <><MapPin className="h-3 w-3" /> In-Person</>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <p className="text-sm font-medium">MWK {appointment.totalCost || 0}</p>
                              </TableCell>
                              <TableCell className="p-3 text-right">
                                <Button
                                  onClick={() => markAttendedMutation.mutate(appointment.id)}
                                  disabled={markAttendedMutation.isPending}
                                  size="sm"
                                  className="h-7 text-xs"
                                >
                                  Mark Attended
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <Card className={dashboardCard.base}>
                  <CardHeader className={dashboardCard.header}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <CardTitle className={responsive.cardTitle}>Completed Appointments</CardTitle>
                        <CardDescription className={responsive.cardDesc}>
                          {completedAppointments.length} completed appointment(s)
                        </CardDescription>
                      </div>
                      {completedAppointments.length > 0 && (
                        <ExportButton
                          data={completedAppointments}
                          columns={[
                            {
                              header: "Date",
                              accessor: (row: any) => new Date(row.scheduledDate).toLocaleDateString(),
                            },
                            {
                              header: "Time",
                              accessor: (row: any) => row.TimeSlot ? `${row.TimeSlot.startTime} - ${row.TimeSlot.endTime}` : 'N/A',
                            },
                            {
                              header: "Patient",
                              accessor: (row: any) => `${row.Patient?.User?.firstName || ''} ${row.Patient?.User?.lastName || ''}`,
                            },
                            {
                              header: "Specialty",
                              accessor: (row: any) => row.Specialty?.name || 'General Care',
                            },
                            {
                              header: "Session Type",
                              accessor: (row: any) => row.sessionType === 'teleconference' ? 'Video Call' : 'In-Person',
                            },
                            {
                              header: "Amount",
                              accessor: (row: any) => `MWK ${row.totalCost || 0}`,
                            },
                          ]}
                          filename={`completed-appointments-${new Date().toISOString().split('T')[0]}`}
                          title="Completed Appointments"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="py-12">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">Loading appointments...</p>
                        </div>
                      </div>
                    ) : completedAppointments.length === 0 ? (
                      <div className="py-12 text-center">
                        <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <h3 className="font-semibold text-sm mb-1">No completed appointments</h3>
                        <p className="text-xs text-muted-foreground">
                          Completed appointments will appear here
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs font-semibold">Patient</TableHead>
                            <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                            <TableHead className="text-xs font-semibold">Specialty</TableHead>
                            <TableHead className="text-xs font-semibold">Type</TableHead>
                            <TableHead className="text-xs font-semibold">Amount</TableHead>
                            <TableHead className="text-xs font-semibold text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedAppointments.map((appointment) => (
                            <TableRow key={appointment.id} className="hover:bg-muted/30">
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-success/10 flex items-center justify-center text-success text-xs font-semibold">
                                    {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.Patient?.User?.phone || 'No phone'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {new Date(appointment.scheduledDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.TimeSlot ? `${appointment.TimeSlot.startTime} - ${appointment.TimeSlot.endTime}` : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <p className="text-sm">{appointment.Specialty?.name || 'General Care'}</p>
                              </TableCell>
                              <TableCell className="p-3">
                                <div className="flex items-center gap-1 text-sm">
                                  {appointment.sessionType === 'teleconference' ? (
                                    <><Video className="h-3 w-3" /> Video</>
                                  ) : (
                                    <><MapPin className="h-3 w-3" /> In-Person</>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <p className="text-sm font-medium">MWK {appointment.totalCost || 0}</p>
                              </TableCell>
                              <TableCell className="p-3 text-right">
                                <Badge variant="default" className="text-xs bg-success">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="upcoming" className="space-y-4">
                {isLoading ? (
                  <Card className={dashboardCard.base}>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Loading appointments...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {upcomingAppointments.map((appointment) => (
                      <PatientCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <Card className={dashboardCard.base}>
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <h3 className={`font-semibold mb-2 ${responsive.cardTitle}`}>No upcoming appointments</h3>
                      <p className={responsive.bodyMuted}>
                        Your confirmed appointments will appear here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {isLoading ? (
                  <Card className={dashboardCard.base}>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Loading appointments...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : pastAppointments.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pastAppointments.map((appointment) => (
                      <PatientCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <Card className={dashboardCard.base}>
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <h3 className={`font-semibold mb-2 ${responsive.cardTitle}`}>No past appointments</h3>
                      <p className={responsive.bodyMuted}>
                        Your completed appointments will appear here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {rescheduledAppointments.length > 0 && (
                <TabsContent value="rescheduled" className="space-y-4">
                  {isLoading ? (
                    <Card className={dashboardCard.base}>
                      <CardContent className="py-12">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className={responsive.bodyMuted}>Loading appointments...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rescheduledAppointments.map((appointment) => (
                        <PatientCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </>
          )}
        </Tabs>

        {/* Contact Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Caregiver Contact Information</DialogTitle>
              <DialogDescription className="text-sm">
                Contact details for your appointment
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {selectedAppointment.Caregiver?.User?.firstName} {selectedAppointment.Caregiver?.User?.lastName}
                    </h3>
                    <p className="text-xs text-muted-foreground">{selectedAppointment.Specialty?.name}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.Caregiver?.User?.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Email</p>
                      <p className="text-sm text-muted-foreground break-all">
                        {selectedAppointment.Caregiver?.User?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.Caregiver?.village && selectedAppointment.Caregiver?.district ?
                          `${selectedAppointment.Caregiver.village}, ${selectedAppointment.Caregiver.traditionalAuthority || ''} ${selectedAppointment.Caregiver.district}, ${selectedAppointment.Caregiver.region}`.replace(', ,', ',').trim() :
                          'Location will be provided closer to appointment time'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Appointment</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedAppointment.scheduledDate).toLocaleDateString()} at {selectedAppointment.TimeSlot?.startTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-sm"
                    onClick={() => window.open(`tel:${selectedAppointment.Caregiver?.User?.phone}`)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-sm"
                    onClick={() => window.open(`mailto:${selectedAppointment.Caregiver?.User?.email}`)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reschedule Modal */}
        <RescheduleModal
          open={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setAppointmentToReschedule(null);
          }}
          appointment={appointmentToReschedule}
          onRescheduleSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
          }}
        />

        {/* Cancel Modal */}
        {appointmentToCancel && (
          <CancelModal
            isOpen={showCancelModal}
            onClose={() => {
              setShowCancelModal(false);
              setAppointmentToCancel(null);
            }}
            onConfirm={(reason) => {
              cancelAppointmentMutation.mutate({
                appointmentId: appointmentToCancel.id,
                reason
              });
            }}
            appointmentDetails={{
              date: new Date(appointmentToCancel.scheduledDate || appointmentToCancel.TimeSlot?.date).toLocaleDateString(),
              time: appointmentToCancel.TimeSlot?.startTime || new Date(appointmentToCancel.scheduledDate).toLocaleTimeString(),
              caregiver: `${appointmentToCancel.Caregiver?.User?.firstName || ''} ${appointmentToCancel.Caregiver?.User?.lastName || ''}`.trim() || 'Caregiver'
            }}
            isLoading={cancelAppointmentMutation.isPending}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
