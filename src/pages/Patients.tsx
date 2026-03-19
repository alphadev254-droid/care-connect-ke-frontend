import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ExportButton } from "@/components/shared/ExportButton";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { dashboardCard, responsive } from "@/theme";
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  Activity,
} from "lucide-react";

const Patients = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const { data: patientsData, isLoading } = useQuery({
    queryKey: ["caregiver-patients"],
    queryFn: async () => {
      const response = await api.get("/caregivers/my-patients");
      return response.data.patients || [];
    },
  });

  const patients = Array.isArray(patientsData) ? patientsData : [];

  const filteredPatients = patients.filter((patient: any) =>
    `${patient.User?.firstName} ${patient.User?.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const activePatients = filteredPatients.filter((p: any) => p.status === 'active');

  const handleContactClick = (patient: any) => {
    setSelectedPatient(patient);
    setContactDialogOpen(true);
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    return Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365));
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'caregiver')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'caregiver')}>
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={responsive.pageTitle}>My Patients</h1>
            <p className={responsive.pageSubtitle}>Manage and monitor your patient care</p>
          </div>
        </div>

        <div className={dashboardCard.compactStatGrid}>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Active Patients</p>
                <p className={dashboardCard.compactStatValue}>{activePatients.length}</p>
              </div>
              <div className={dashboardCard.iconWell.success}>
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Total Patients</p>
                <p className={dashboardCard.compactStatValue}>{filteredPatients.length}</p>
              </div>
              <div className={dashboardCard.iconWell.primary}>
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Visits Today</p>
                <p className={dashboardCard.compactStatValue}>
                  {filteredPatients.filter((p: any) => p.lastVisit === 'Today').length}
                </p>
              </div>
              <div className={dashboardCard.iconWell.accent}>
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name..."
              className="pl-9 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ExportButton
            data={filteredPatients}
            columns={[
              {
                header: "Patient Name",
                accessor: (row: any) => `${row.User?.firstName} ${row.User?.lastName}`,
              },
              {
                header: "ID Number",
                accessor: (row: any) => row.User?.idNumber || 'N/A',
              },
              {
                header: "Age",
                accessor: (row: any) => calculateAge(row.dateOfBirth),
                format: (value: any) => `${value} years`,
              },
              {
                header: "Phone",
                accessor: (row: any) => row.User?.phone || 'Not provided',
              },
              {
                header: "Email",
                accessor: (row: any) => row.User?.email || 'Not provided',
              },
              {
                header: "Location",
                accessor: (row: any) => row.village || row.traditionalAuthority || 'N/A',
              },
              {
                header: "District",
                accessor: (row: any) => row.district || 'N/A',
              },
              {
                header: "Region",
                accessor: (row: any) => row.region || 'N/A',
              },
              {
                header: "Emergency Contact",
                accessor: (row: any) => row.emergencyContact || 'Not provided',
              },
              {
                header: "Status",
                accessor: (row: any) => row.status || 'Active',
              },
            ]}
            filename="patients-list"
            title="Patients List"
          />
        </div>

        <Card className={dashboardCard.base}>
          <CardContent className="p-0 overflow-hidden">
            {filteredPatients.length > 0 ? (
              <div className={dashboardCard.tableWrapper}>
              <Table className={dashboardCard.tableMinWidth}>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold">Patient</TableHead>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold">Age</TableHead>
                    <TableHead className="text-xs font-semibold">Contact</TableHead>
                    <TableHead className="text-xs font-semibold">Guardian</TableHead>
                    <TableHead className="text-xs font-semibold">Location</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient: any) => (
                    <TableRow key={patient.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                            {patient.User?.firstName?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {patient.User?.firstName} {patient.User?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {patient.User?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {patient.patientType || 'Adult'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{calculateAge(patient.dateOfBirth)} yrs</TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{patient.User?.phone || 'N/A'}</span>
                          </div>
                          {patient.emergencyContact && (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-orange-500" />
                              <span className="text-xs text-orange-600">{patient.emergencyContact}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {(patient.patientType === 'child' || patient.patientType === 'elderly') && 
                         (patient.guardianFirstName || patient.guardianLastName) ? (
                          <div className="space-y-1">
                            <p className="text-xs font-medium">
                              {patient.guardianFirstName} {patient.guardianLastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {patient.guardianRelationship}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-xs">
                            <p>{patient.address || 'N/A'}</p>
                            {(patient.village || patient.traditionalAuthority || patient.district) && (
                              <p className="text-muted-foreground">
                                {[patient.village, patient.traditionalAuthority, patient.district]
                                  .filter(Boolean).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleContactClick(patient)}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <User className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                <h3 className={`${responsive.cardTitle} mb-1`}>No patients found</h3>
                <p className={responsive.bodyMuted}>
                  {searchQuery ? 'Try adjusting your search' : 'Patients will appear here once assigned'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Patient Contact Information</DialogTitle>
            <DialogDescription className="text-xs">
              Full contact details and personal information
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {selectedPatient.User?.firstName?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedPatient.User?.firstName} {selectedPatient.User?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.patientType === 'child' ? 'Child Patient' : 
                     selectedPatient.patientType === 'elderly' ? 'Elderly Patient' : 'Adult Patient'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Age: {calculateAge(selectedPatient.dateOfBirth)} years
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm border-b pb-2">Patient Information</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.User?.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.User?.email || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.address || 'Not provided'}
                        </p>
                        {(selectedPatient.village || selectedPatient.traditionalAuthority || selectedPatient.district || selectedPatient.region) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {[selectedPatient.village, selectedPatient.traditionalAuthority, selectedPatient.district, selectedPatient.region]
                              .filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Emergency Contact</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.emergencyContact || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Date of Birth</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.dateOfBirth ? 
                            new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 
                            'Not provided'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guardian Information (for child/elderly patients) */}
                {(selectedPatient.patientType === 'child' || selectedPatient.patientType === 'elderly') && 
                 (selectedPatient.guardianFirstName || selectedPatient.guardianLastName) && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm border-b pb-2">Guardian Information</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Guardian Name</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedPatient.guardianFirstName} {selectedPatient.guardianLastName}
                          </p>
                          {selectedPatient.guardianRelationship && (
                            <p className="text-xs text-muted-foreground">
                              Relationship: {selectedPatient.guardianRelationship}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {selectedPatient.guardianPhone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Guardian Phone</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedPatient.guardianPhone}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedPatient.guardianEmail && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Guardian Email</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedPatient.guardianEmail}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedPatient.guardianIdNumber && (
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Guardian ID Number</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedPatient.guardianIdNumber}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Medical Information */}
                {(selectedPatient.medicalHistory || selectedPatient.currentMedications || selectedPatient.allergies) && (
                  <div className="space-y-4 col-span-2">
                    <h4 className="font-medium text-sm border-b pb-2">Medical Information</h4>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {selectedPatient.medicalHistory && (
                        <div>
                          <p className="text-sm font-medium mb-1">Medical History</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedPatient.medicalHistory}
                          </p>
                        </div>
                      )}
                      
                      {selectedPatient.currentMedications && (
                        <div>
                          <p className="text-sm font-medium mb-1">Current Medications</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedPatient.currentMedications}
                          </p>
                        </div>
                      )}
                      
                      {selectedPatient.allergies && (
                        <div>
                          <p className="text-sm font-medium mb-1">Allergies</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedPatient.allergies}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
             
                {selectedPatient.guardianPhone && (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(`tel:${selectedPatient.guardianPhone}`)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Guardian
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open(`mailto:${selectedPatient.User?.email}`)}
                  disabled={!selectedPatient.User?.email}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Patients;
