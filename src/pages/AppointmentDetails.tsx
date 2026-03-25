import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  DollarSign,
  ArrowLeft,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
} from "lucide-react";

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: appointmentData, isLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const response = await api.get(`/appointments/${id}`);
      return response.data.appointment;
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!appointmentData) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Appointment not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const appointment = appointmentData;
  const isCaregiver = user?.role === 'caregiver';

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Appointment Details</h1>
            <p className="text-sm text-muted-foreground">ID: #{appointment.id}</p>
          </div>
        </div>

        {/* Appointment Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Appointment Information
              </span>
              <Badge className="text-xs">
                {appointment.status === 'session_waiting' ? 'Waiting for Session' :
                 appointment.status === 'session_attended' ? 'Session Completed' :
                 appointment.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="text-xs text-muted-foreground">Date</label>
                <p className="font-medium">
                  {new Date(appointment.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Time</label>
                <p className="font-medium">
                  {appointment.TimeSlot?.startTime} - {appointment.TimeSlot?.endTime}
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Specialty</label>
                <p className="font-medium">{appointment.Specialty?.name}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Type</label>
                <p className="font-medium flex items-center gap-1">
                  {appointment.sessionType === 'teleconference' ? (
                    <><Video className="h-3 w-3" />Video</>
                  ) : (
                    <><MapPin className="h-3 w-3" />In-Person</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Patient/Caregiver Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                {isCaregiver ? 'Patient Information' : 'Caregiver Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              {isCaregiver ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Name</label>
                      <p className="font-medium">{appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Type</label>
                      <p className="font-medium capitalize">{appointment.Patient?.patientType || 'Adult'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Phone</label>
                      <p className="font-medium">{appointment.Patient?.User?.phone}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Emergency</label>
                      <p className="font-medium">{appointment.Patient?.emergencyContact || 'N/A'}</p>
                    </div>
                  </div>
                  {appointment.Patient?.allergies && (
                    <div className="bg-red-50 p-2 rounded">
                      <label className="text-xs font-medium text-red-700">Allergies</label>
                      <p className="text-xs text-red-900">{appointment.Patient.allergies}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground">Name</label>
                    <p className="font-medium">{appointment.Caregiver?.User?.firstName} {appointment.Caregiver?.User?.lastName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Phone</label>
                      <p className="font-medium">{appointment.Caregiver?.User?.phone}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Email</label>
                      <p className="font-medium text-xs">{appointment.Caregiver?.User?.email}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Guardian Info (if applicable) */}
          {appointment.Patient?.patientType === 'child' && 
           (appointment.Patient?.guardianFirstName || appointment.Patient?.guardianLastName) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <p className="font-medium">{appointment.Patient.guardianFirstName} {appointment.Patient.guardianLastName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Relationship</label>
                    <p className="font-medium capitalize">{appointment.Patient.guardianRelationship || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">ID Number</label>
                    <p className="font-medium">{appointment.Patient.guardianIdNumber || 'N/A'}</p>
                  </div>
                </div>
                {(appointment.Patient.guardianPhone || appointment.Patient.guardianEmail) && (
                  <div className="grid grid-cols-2 gap-3">
                    {appointment.Patient.guardianPhone && (
                      <div>
                        <label className="text-xs text-muted-foreground">Phone</label>
                        <p className="font-medium">{appointment.Patient.guardianPhone}</p>
                      </div>
                    )}
                    {appointment.Patient.guardianEmail && (
                      <div>
                        <label className="text-xs text-muted-foreground">Email</label>
                        <p className="font-medium text-xs">{appointment.Patient.guardianEmail}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          <Card className={appointment.Patient?.patientType === 'child' ? '' : 'md:col-span-2'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-2 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Booking Fee</div>
                      <div className="font-semibold mb-1">Ksh {appointment.bookingFee}</div>
                      <Badge variant={appointment.bookingFeeStatus === 'completed' ? 'default' : 'outline'} className="text-xs">
                        {appointment.bookingFeeStatus === 'completed' ? 'Paid' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-2 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Session Fee</div>
                      <div className="font-semibold mb-1">Ksh {appointment.sessionFee}</div>
                      <Badge variant={appointment.sessionFeeStatus === 'completed' ? 'default' : 'outline'} className="text-xs">
                        {appointment.sessionFeeStatus === 'completed' ? 'Paid' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-2 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Total</div>
                      <div className="font-bold text-lg mb-1">Ksh {appointment.totalCost}</div>
                      <Badge variant={appointment.paymentStatus === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {appointment.paymentStatus === 'completed' ? 'Paid' : appointment.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Reschedule History */}
        {appointment.rescheduleHistory && appointment.rescheduleHistory.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Reschedule History ({appointment.rescheduleCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-xs text-muted-foreground">From</th>
                    <th className="text-left py-2 text-xs text-muted-foreground">To</th>
                    <th className="text-left py-2 text-xs text-muted-foreground">By</th>
                    <th className="text-left py-2 text-xs text-muted-foreground">Date</th>
                    <th className="text-left py-2 text-xs text-muted-foreground">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {appointment.rescheduleHistory.map((reschedule: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 text-red-600 font-medium">
                        {new Date(reschedule.from.date).toLocaleDateString()}<br/>
                        <span className="text-xs">{reschedule.from.startTime}</span>
                      </td>
                      <td className="py-2 text-green-600 font-medium">
                        {new Date(reschedule.to.date).toLocaleDateString()}<br/>
                        <span className="text-xs">{reschedule.to.startTime}</span>
                      </td>
                      <td className="py-2 capitalize">{reschedule.rescheduleBy}</td>
                      <td className="py-2 text-muted-foreground">{new Date(reschedule.timestamp).toLocaleDateString()}</td>
                      <td className="py-2 max-w-xs">
                        {reschedule.reason ? (
                          <span className="text-xs bg-muted/50 px-2 py-1 rounded">{reschedule.reason}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Patient Feedback */}
        {appointment.patientFeedback && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Patient Feedback</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm">
              {appointment.patientRating && (
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < appointment.patientRating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                  ))}
                  <span className="text-xs text-muted-foreground">({appointment.patientRating}/5)</span>
                </div>
              )}
              <p className="bg-muted/50 p-3 rounded text-sm">{appointment.patientFeedback}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AppointmentDetails; 