import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { toast } from "sonner";
import { dashboardCard, responsive } from "@/theme";
import { useSecureFile, openSecureFile } from "@/hooks/useSecureFile";
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Award,
  DollarSign,
  ArrowLeft,
  Download,
  FileText,
  Users,
  CreditCard,
  Send,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Fetches profile image via authenticated token — prevents direct URL access
const SecureImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const blobUrl = useSecureFile(src);
  if (!blobUrl) return <div className={`${className} bg-muted animate-pulse rounded-full`} />;
  return <img src={blobUrl} alt={alt} className={className} />;
};

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/admin/caregivers/${userId}/send-email`, {
        subject: emailSubject,
        message: emailMessage,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Email sent successfully");
      setEmailDialogOpen(false);
      setEmailSubject("");
      setEmailMessage("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to send email");
    },
  });

  const handleSendEmail = () => {
    if (!emailSubject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }
    if (!emailMessage.trim()) {
      toast.error("Please enter an email message");
      return;
    }
    sendEmailMutation.mutate();
  };

  const parseDocuments = (docs: string | object | null | undefined): unknown[] => {
    try {
      return typeof docs === 'string' ? JSON.parse(docs) : docs || [];
    } catch {
      return [];
    }
  };

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data.user;
    },
  });

  // Fetch caregiver appointments
  const { data: appointments } = useQuery({
    queryKey: ["caregiver-appointments", userData?.Caregiver?.id],
    queryFn: async () => {
      if (!userData?.Caregiver?.id) return [];
      const response = await api.get(`/admin/caregivers/${userData.Caregiver.id}/appointments`);
      return response.data.appointments || [];
    },
    enabled: !!userData?.Caregiver?.id,
  });

  // Fetch caregiver patients
  const { data: patients } = useQuery({
    queryKey: ["caregiver-patients", userData?.Caregiver?.id],
    queryFn: async () => {
      if (!userData?.Caregiver?.id) return [];
      const response = await api.get(`/admin/caregivers/${userData.Caregiver.id}/patients`);
      return response.data.patients || [];
    },
    enabled: !!userData?.Caregiver?.id,
  });

  // Fetch caregiver transactions
  const { data: transactionsData } = useQuery({
    queryKey: ["caregiver-transactions", userData?.Caregiver?.id],
    queryFn: async () => {
      if (!userData?.Caregiver?.id) return { transactions: [], totalEarnings: 0 };
      const response = await api.get(`/admin/caregivers/${userData.Caregiver.id}/transactions`);
      return response.data;
    },
    enabled: !!userData?.Caregiver?.id,
  });

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(currentUser?.role || 'system_manager')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout userRole={mapUserRole(currentUser?.role || 'system_manager')}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={mapUserRole(currentUser?.role || 'system_manager')}>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className={responsive.pageTitle}>{userData.firstName} {userData.lastName}</h1>
              <p className={responsive.pageSubtitle}>User Profile Details</p>
            </div>
          </div>
          {userData.Role?.name === 'caregiver' && (
            <Button size="sm" onClick={() => setEmailDialogOpen(true)}>
              <Send className="h-4 w-4 mr-1" />
              Send Email
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Profile Overview */}
          <Card className={`${dashboardCard.base} lg:col-span-1`}>
            <CardHeader className="text-center pb-3">
              {userData.Caregiver?.profileImage ? (
                <SecureImage
                  src={userData.Caregiver.profileImage}
                  alt={`${userData.firstName} ${userData.lastName}`}
                  className="h-20 w-20 rounded-full object-cover mx-auto mb-3 border-2 border-primary/20"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-3">
                  {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
                </div>
              )}
              <CardTitle className={responsive.cardTitle}>{userData.firstName} {userData.lastName}</CardTitle>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize text-xs">
                  {userData.Role?.name?.replace('_', ' ')}
                </Badge>
                <Badge variant={userData.isActive ? "default" : "secondary"} className="text-xs">
                  {userData.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className={`${dashboardCard.body} space-y-3`}>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className={responsive.body}>{userData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className={responsive.body}>{userData.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className={responsive.body}>Joined {new Date(userData.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <Card className={`${dashboardCard.base} lg:col-span-2`}>
            <CardHeader className={dashboardCard.compactHeader}>
              <CardTitle className={responsive.cardTitle}>Detailed Information</CardTitle>
            </CardHeader>
            <CardContent className={dashboardCard.compactBody}>
              <Tabs defaultValue="general" className="flex gap-3">
                <TabsList className="flex flex-col h-auto w-32 shrink-0 items-stretch gap-0.5 bg-muted/50 p-1 rounded-lg self-start">
                  <TabsTrigger value="general" className="justify-start text-xs px-2 py-1.5">General</TabsTrigger>
                  {userData.Role?.name === 'caregiver' && (
                    <>
                      <TabsTrigger value="caregiver" className="justify-start text-xs px-2 py-1.5">Caregiver Info</TabsTrigger>
                      <TabsTrigger value="appointments" className="justify-start text-xs px-2 py-1.5">Appointments</TabsTrigger>
                      <TabsTrigger value="patients" className="justify-start text-xs px-2 py-1.5">Patients</TabsTrigger>
                      <TabsTrigger value="transactions" className="justify-start text-xs px-2 py-1.5">Transactions</TabsTrigger>
                    </>
                  )}
                  {userData.Role?.name === 'patient' && (
                    <TabsTrigger value="patient" className="justify-start text-xs px-2 py-1.5">Patient Info</TabsTrigger>
                  )}
                </TabsList>
                <div className="flex-1 min-w-0 overflow-y-auto max-h-[520px] pr-1">

                <TabsContent value="general" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className={responsive.label}>First Name</p>
                      <p className={responsive.body}>{userData.firstName}</p>
                    </div>
                    <div>
                      <p className={responsive.label}>Last Name</p>
                      <p className={responsive.body}>{userData.lastName}</p>
                    </div>
                    <div>
                      <p className={responsive.label}>Email</p>
                      <p className={responsive.body}>{userData.email}</p>
                    </div>
                    <div>
                      <p className={responsive.label}>Phone</p>
                      <p className={responsive.body}>{userData.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className={responsive.label}>Role</p>
                      <p className={`${responsive.body} capitalize`}>{userData.Role?.name?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className={responsive.label}>Status</p>
                      <p className={responsive.body}>{userData.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                    {userData.assignedRegion && (
                      <div>
                        <p className={responsive.label}>Assigned Region</p>
                        <p className={responsive.body}>{userData.assignedRegion}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {userData.Role?.name === 'caregiver' && userData.Caregiver && (
                  <TabsContent value="caregiver" className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className={responsive.label}>ID Number</p>
                        <p className={responsive.body}>{userData.idNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className={responsive.label}>License Number</p>
                        <p className={responsive.body}>{userData.Caregiver.licenseNumber}</p>
                      </div>
                      <div>
                        <p className={responsive.label}>Licensing Institution</p>
                        <p className={responsive.body}>{userData.Caregiver.licensingInstitution || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className={responsive.label}>Experience</p>
                        <p className={responsive.body}>{userData.Caregiver.experience} years</p>
                      </div>
                      <div className="col-span-2">
                        <p className={responsive.label}>Qualifications</p>
                        <p className={responsive.body}>{userData.Caregiver.qualifications}</p>
                      </div>
                    </div>

                    {/* Specialties with Fees */}
                    {userData.Caregiver.Specialties && userData.Caregiver.Specialties.length > 0 && (
                      <div>
                        <p className={`${responsive.label} mb-2 flex items-center gap-1.5`}>
                          <Heart className="h-3.5 w-3.5" />Specialties & Fees
                        </p>
                        <div className="space-y-1.5">
                          {userData.Caregiver.Specialties.map((specialty: any) => (
                            <div key={specialty.id} className={`p-2 rounded-lg border ${dashboardCard.sectionBg} flex items-center justify-between gap-2 flex-wrap`}>
                              <Badge variant="secondary" className="text-xs shrink-0">{specialty.name}</Badge>
                              <div className="flex gap-3 text-xs">
                                <span className="text-muted-foreground">Session: <span className="font-semibold text-primary">KES {specialty.sessionFee ? Number(specialty.sessionFee).toFixed(2) : '0.00'}</span></span>
                                <span className="text-muted-foreground">Booking: <span className="font-semibold text-secondary">KES {specialty.bookingFee ? Number(specialty.bookingFee).toFixed(2) : '0.00'}</span></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location Information */}
                    <div>
                      <p className={`${responsive.label} mb-2 flex items-center gap-1.5`}>
                        <MapPin className="h-3.5 w-3.5" />Location Information
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className={responsive.label}>County</p>
                          <p className={responsive.body}>{userData.Caregiver.region || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className={responsive.label}>Constituency</p>
                          <p className={responsive.body}>{userData.Caregiver.district || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className={responsive.label}>Ward</p>
                          <p className={responsive.body}>{userData.Caregiver.traditionalAuthority || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className={responsive.label}>Sub-location</p>
                          <p className={responsive.body}>{userData.Caregiver.village || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Supporting Documents */}
                    {(() => {
                      const documents = parseDocuments(userData.Caregiver.supportingDocuments);
                      return documents.length > 0 && (
                        <div>
                          <p className={`${responsive.label} mb-2`}>Supporting Documents</p>
                          <div className="grid gap-2">
                            {documents.map((doc: any, index: number) => (
                              <div key={index} className={dashboardCard.listRow}>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className={responsive.body}>{doc.filename}</p>
                                    <p className="text-xs text-muted-foreground">{doc.format?.toUpperCase()}</p>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => openSecureFile(doc.url, doc.filename)}>
                                  <Download className="h-3.5 w-3.5 mr-1" />Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* ID Documents */}
                    {(() => {
                      const idDocuments = parseDocuments(userData.Caregiver.idDocuments);
                      return idDocuments.length > 0 && (
                        <div>
                          <p className={`${responsive.label} mb-2`}>ID Documents</p>
                          <div className="grid gap-2">
                            {idDocuments.map((doc: any, index: number) => (
                              <div key={index} className={dashboardCard.listRow}>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className={responsive.body}>{doc.filename}</p>
                                    <p className="text-xs text-muted-foreground">{doc.format?.toUpperCase()}</p>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => openSecureFile(doc.url, doc.filename)}>
                                  <Download className="h-3.5 w-3.5 mr-1" />View
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </TabsContent>
                )}

                {userData.Role?.name === 'caregiver' && (
                  <>
                    <TabsContent value="appointments" className="space-y-3">
                      <Card className={dashboardCard.base}>
                        <CardHeader className={dashboardCard.compactHeader}>
                          <CardTitle className={responsive.cardTitle}>All Appointments</CardTitle>
                          <CardDescription className={responsive.cardDesc}>Complete appointment history</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className={dashboardCard.tableWrapper}>
                          {appointments && appointments.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="h-9">Date</TableHead>
                                  <TableHead className="h-9">Patient</TableHead>
                                  <TableHead className="h-9">Specialty</TableHead>
                                  <TableHead className="h-9">Status</TableHead>
                                  <TableHead className="h-9 text-right">Cost</TableHead>
                                  <TableHead className="h-9 text-right">Payment</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {appointments.map((apt: any) => (
                                  <TableRow key={apt.id}>
                                    <TableCell className={`py-2 ${dashboardCard.td}`}>
                                      {new Date(apt.scheduledDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className={`py-2 ${dashboardCard.td}`}>
                                      {apt.Patient?.User?.firstName} {apt.Patient?.User?.lastName}
                                    </TableCell>
                                    <TableCell className={`py-2 text-xs ${dashboardCard.td}`}>
                                      {apt.Specialty?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell className={`py-2 ${dashboardCard.td}`}>
                                      <Badge variant={apt.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize">
                                        {apt.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className={`py-2 text-right font-semibold ${dashboardCard.td}`}>
                                      KES {parseFloat(apt.totalCost || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className={`py-2 text-right ${dashboardCard.td}`}>
                                      {apt.PaymentTransaction ? (
                                        <Badge variant={apt.PaymentTransaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize">
                                          {apt.PaymentTransaction.status}
                                        </Badge>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">Pending</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-12 text-sm text-muted-foreground">
                              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                              <p>No appointments found</p>
                            </div>
                          )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="patients" className="space-y-3">
                      <Card className={dashboardCard.base}>
                        <CardHeader className={dashboardCard.compactHeader}>
                          <CardTitle className={responsive.cardTitle}>Patients Served</CardTitle>
                          <CardDescription className={responsive.cardDesc}>Unique patients this caregiver has worked with</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className={dashboardCard.tableWrapper}>
                          {patients && patients.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="h-9">Patient Name</TableHead>
                                  <TableHead className="h-9">Email</TableHead>
                                  <TableHead className="h-9">Phone</TableHead>
                                  <TableHead className="h-9 text-right">Total Appointments</TableHead>
                                  <TableHead className="h-9 text-right">Last Visit</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {patients.map((p: any) => (
                                  <TableRow key={p.patientId}>
                                    <TableCell className={`py-2 font-medium ${dashboardCard.td}`}>
                                      {p.Patient?.User?.firstName} {p.Patient?.User?.lastName}
                                    </TableCell>
                                    <TableCell className={`py-2 text-xs text-muted-foreground ${dashboardCard.td}`}>
                                      {p.Patient?.User?.email}
                                    </TableCell>
                                    <TableCell className={`py-2 text-xs ${dashboardCard.td}`}>
                                      {p.Patient?.User?.phone || 'N/A'}
                                    </TableCell>
                                    <TableCell className={`py-2 text-right font-semibold ${dashboardCard.td}`}>
                                      {p.appointmentCount}
                                    </TableCell>
                                    <TableCell className={`py-2 text-right text-xs ${dashboardCard.td}`}>
                                      {new Date(p.lastAppointment).toLocaleDateString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-12 text-sm text-muted-foreground">
                              <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                              <p>No patients found</p>
                            </div>
                          )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="transactions" className="space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        <Card className={dashboardCard.base}>
                          <CardContent className={dashboardCard.compactStatContent}>
                            <div>
                              <p className={responsive.bodyMuted}>Total</p>
                              <p className={dashboardCard.compactStatValue}>{transactionsData?.transactions?.length || 0}</p>
                            </div>
                            <div className={dashboardCard.iconWell.primary}>
                              <CreditCard className="h-4 w-4 text-primary" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card className={dashboardCard.base}>
                          <CardContent className={dashboardCard.compactStatContent}>
                            <div>
                              <p className={responsive.bodyMuted}>Earnings</p>
                              <p className={`${dashboardCard.compactStatValue} text-success`}>
                                KES {(transactionsData?.totalEarnings || 0).toLocaleString()}
                              </p>
                            </div>
                            <div className={dashboardCard.iconWell.success}>
                              <DollarSign className="h-4 w-4 text-success" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card className={dashboardCard.base}>
                          <CardContent className={dashboardCard.compactStatContent}>
                            <div>
                              <p className={responsive.bodyMuted}>Completed</p>
                              <p className={dashboardCard.compactStatValue}>
                                {transactionsData?.transactions?.filter((t: any) => t.status === 'completed').length || 0}
                              </p>
                            </div>
                            <div className={dashboardCard.iconWell.accent}>
                              <Award className="h-4 w-4 text-accent" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className={dashboardCard.base}>
                        <CardHeader className={dashboardCard.compactHeader}>
                          <CardTitle className={responsive.cardTitle}>Payment Transactions</CardTitle>
                          <CardDescription className={responsive.cardDesc}>All payment transactions for this caregiver</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className={dashboardCard.tableWrapper}>
                          {transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="h-9">Date</TableHead>
                                  <TableHead className="h-9">Transaction ID</TableHead>
                                  <TableHead className="h-9">Patient</TableHead>
                                  <TableHead className="h-9">Specialty</TableHead>
                                  <TableHead className="h-9 text-right">Amount</TableHead>
                                  <TableHead className="h-9">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {transactionsData.transactions.map((txn: any) => (
                                  <TableRow key={txn.id}>
                                    <TableCell className={`py-2 text-xs ${dashboardCard.td}`}>
                                      {new Date(txn.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className={`py-2 text-xs font-mono ${dashboardCard.td}`}>
                                      {txn.paystackReference || 'N/A'}
                                    </TableCell>
                                    <TableCell className={`py-2 ${dashboardCard.td}`}>
                                      {txn.Appointment?.Patient?.User?.firstName} {txn.Appointment?.Patient?.User?.lastName}
                                    </TableCell>
                                    <TableCell className={`py-2 text-xs ${dashboardCard.td}`}>
                                      {txn.Appointment?.Specialty?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell className={`py-2 text-right font-bold ${dashboardCard.td}`}>
                                      KES {parseFloat(txn.amount || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="py-2">
                                      <Badge variant={txn.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize">
                                        {txn.status}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-12 text-sm text-muted-foreground">
                              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-50" />
                              <p>No transactions found</p>
                            </div>
                          )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
                )}

                {userData.Role?.name === 'patient' && userData.Patient && (
                  <TabsContent value="patient" className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className={responsive.label}>ID Number</p>
                        <p className={responsive.body}>{userData.idNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className={responsive.label}>Date of Birth</p>
                        <p className={responsive.body}>
                          {userData.Patient.dateOfBirth ? new Date(userData.Patient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className={responsive.label}>Address</p>
                        <p className={responsive.body}>{userData.Patient.address || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className={responsive.label}>Emergency Contact</p>
                        <p className={responsive.body}>{userData.Patient.emergencyContact || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className={responsive.label}>Patient Type</p>
                        <p className={`${responsive.body} capitalize`}>{userData.Patient.patientType || 'Not provided'}</p>
                      </div>
                      {userData.Patient.medicalHistory && (
                        <div>
                          <p className={responsive.label}>Medical History</p>
                          <p className={responsive.body}>{userData.Patient.medicalHistory}</p>
                        </div>
                      )}
                      {userData.Patient.currentMedications && (
                        <div>
                          <p className={responsive.label}>Current Medications</p>
                          <p className={responsive.body}>{userData.Patient.currentMedications}</p>
                        </div>
                      )}
                      {userData.Patient.allergies && (
                        <div>
                          <p className={responsive.label}>Allergies</p>
                          <p className={responsive.body}>{userData.Patient.allergies}</p>
                        </div>
                      )}
                    </div>

                    {/* Guardian Information */}
                    {(userData.Patient.patientType === 'child' || userData.Patient.patientType === 'elderly') && (
                      <div>
                        <p className={`${responsive.label} mb-2 flex items-center gap-1.5`}>
                          <Users className="h-3.5 w-3.5" />Guardian Information
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className={responsive.label}>Guardian Name</p>
                            <p className={responsive.body}>{userData.Patient.guardianFirstName} {userData.Patient.guardianLastName}</p>
                          </div>
                          <div>
                            <p className={responsive.label}>Guardian Phone</p>
                            <p className={responsive.body}>{userData.Patient.guardianPhone || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className={responsive.label}>Guardian Email</p>
                            <p className={responsive.body}>{userData.Patient.guardianEmail || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className={responsive.label}>Relationship</p>
                            <p className={`${responsive.body} capitalize`}>{userData.Patient.guardianRelationship || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className={responsive.label}>Guardian ID Number</p>
                            <p className={responsive.body}>{userData.Patient.guardianIdNumber || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Location Information */}
                    <div>
                      <p className={`${responsive.label} mb-2 flex items-center gap-1.5`}>
                        <MapPin className="h-3.5 w-3.5" />Location Information
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className={responsive.label}>County</p>
                          <p className={responsive.body}>{userData.Patient.region || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className={responsive.label}>Constituency</p>
                          <p className={responsive.body}>{userData.Patient.district || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className={responsive.label}>Ward</p>
                          <p className={responsive.body}>{userData.Patient.traditionalAuthority || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className={responsive.label}>Sub-location</p>
                          <p className={responsive.body}>{userData.Patient.village || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Send Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${responsive.dialogTitle}`}>
              <Mail className="h-4 w-4" />
              Send Email to {userData?.firstName} {userData?.lastName}
            </DialogTitle>
            <DialogDescription className={responsive.dialogDesc}>
              Compose and send an email message to this caregiver.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="email-subject">Subject</Label>
              <Input id="email-subject" placeholder="Enter email subject..." value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-message">Message</Label>
              <Textarea id="email-message" placeholder="Enter your message here..." value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} rows={6} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSendEmail} disabled={sendEmailMutation.isPending}>
              {sendEmailMutation.isPending ? (
                <><div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5" />Sending...</>
              ) : (
                <><Send className="h-3.5 w-3.5 mr-1.5" />Send Email</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserDetails;