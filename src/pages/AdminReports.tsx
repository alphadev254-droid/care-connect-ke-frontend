import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { dashboardCard, responsive } from "@/theme";
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  Download,
  Calendar,
  FileText,
  Heart,
  DollarSign,
  Award,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generatePDFReport } from "@/components/ReportPDF";

const AdminReports = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");

  // Remove non-existent API call
  const isLoading = false;

  const { data: usersData } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data.users || [];
    },
  });

  const { data: specialtyAppointments } = useQuery({
    queryKey: ["admin", "analytics", "specialty-appointments", selectedPeriod],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics/specialty-appointments?period=${selectedPeriod}`);
      return response.data.data || [];
    },
  });

  const { data: topCaregivers } = useQuery({
    queryKey: ["admin", "analytics", "top-caregivers", selectedPeriod],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics/top-caregivers?period=${selectedPeriod}`);
      return response.data.data || [];
    },
  });

  const { data: appointmentStats } = useQuery({
    queryKey: ["admin", "analytics", "appointment-stats", selectedPeriod],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics/appointment-stats?period=${selectedPeriod}`);
      return response.data.data || {};
    },
  });

  const { data: revenueBySpecialty } = useQuery({
    queryKey: ["admin", "analytics", "revenue-by-specialty", selectedPeriod],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics/revenue-by-specialty?period=${selectedPeriod}`);
      return response.data.data || [];
    },
  });

  const { data: caregiversByLocation } = useQuery({
    queryKey: ["admin", "analytics", "caregivers-by-location"],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics/caregivers-by-location?groupBy=all`);
      return response.data.data || [];
    },
  });

  const { data: patientsByLocation } = useQuery({
    queryKey: ["admin", "analytics", "patients-by-location"],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics/patients-by-location?groupBy=all`);
      return response.data.data || [];
    },
  });

  const { data: locationSummary } = useQuery({
    queryKey: ["admin", "analytics", "location-summary"],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics/location-summary`);
      return response.data.data || [];
    },
  });

  const stats = [
    {
      title: "Total Appointments",
      value: appointmentStats?.total || 0,
      icon: Calendar,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Total Revenue",
      value: `MWK ${(appointmentStats?.totalRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-success/10 text-success",
    },
    {
      title: "Active Caregivers",
      value: usersData?.filter((u: any) => u.Role?.name === 'caregiver' && u.isActive)?.length || 0,
      icon: Heart,
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Total Patients",
      value: usersData?.filter((u: any) => u.Role?.name === 'patient')?.length || 0,
      icon: Users,
      color: "bg-accent/10 text-accent",
    },
  ];


  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'system_manager')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'system_manager')}>
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={responsive.pageTitle}>System Reports & Analytics</h1>
            <p className={responsive.pageSubtitle}>
              Comprehensive system analytics and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                generatePDFReport(usersData || [], stats, selectedPeriod);
              }}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards - Compact */}
        <div className={dashboardCard.compactStatGrid}>
          {stats.map((stat) => (
            <Card key={stat.title} className={dashboardCard.base}>
              <CardContent className={dashboardCard.compactStatContent}>
                <div>
                  <p className={responsive.bodyMuted}>{stat.title}</p>
                  <p className={dashboardCard.compactStatValue}>{stat.value}</p>
                </div>
                <div className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="caregivers">Caregiver Analytics</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="locations">Location Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className={dashboardCard.base}>
                <CardHeader className={dashboardCard.compactHeader}>
                  <CardTitle className={responsive.cardTitle}>Appointments by Specialty</CardTitle>
                  <CardDescription className={responsive.cardDesc}>Number of appointments per specialty</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  {specialtyAppointments && specialtyAppointments.length > 0 ? (
                    <div className={dashboardCard.tableWrapper}>
                    <Table className={dashboardCard.tableMinWidth}>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-9">Specialty</TableHead>
                          <TableHead className="h-9 text-right">Count</TableHead>
                          <TableHead className="h-9 text-right">Avg Cost</TableHead>
                          <TableHead className="h-9 text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {specialtyAppointments.map((item: any) => (
                          <TableRow key={item.specialtyId}>
                            <TableCell className="font-medium">{item.Specialty?.name || 'Unknown'}</TableCell>
                            <TableCell className="text-right">{item.appointmentCount}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              MWK {parseFloat(item.avgRevenue || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              MWK {parseFloat(item.totalRevenue || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No appointment data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={dashboardCard.base}>
                <CardHeader className={dashboardCard.compactHeader}>
                  <CardTitle className={responsive.cardTitle}>Appointment Status</CardTitle>
                  <CardDescription className={responsive.cardDesc}>Breakdown by current status</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  {appointmentStats?.byStatus && appointmentStats.byStatus.length > 0 ? (
                    <div className={dashboardCard.tableWrapper}>
                    <Table className={dashboardCard.tableMinWidth}>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-9">Status</TableHead>
                          <TableHead className="h-9 text-right">Count</TableHead>
                          <TableHead className="h-9 text-right">Percentage</TableHead>
                          <TableHead className="h-9 text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointmentStats.byStatus.map((item: any) => (
                          <TableRow key={item.status}>
                            <TableCell className="font-medium capitalize">{item.status}</TableCell>
                            <TableCell className="text-right">{item.count}</TableCell>
                            <TableCell className="text-right">
                              {((item.count / appointmentStats.total) * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              MWK {parseFloat(item.totalAmount || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No appointment data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className={dashboardCard.base}>
              <CardHeader className={dashboardCard.compactHeader}>
                <CardTitle className={responsive.cardTitle}>System Performance Metrics</CardTitle>
                <CardDescription className={responsive.cardDesc}>Key performance indicators for the platform</CardDescription>
              </CardHeader>
              <CardContent className={dashboardCard.compactBody}>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className={dashboardCard.balanceBlockPrimary}>
                    <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 mx-auto text-primary mb-1" />
                    <p className={dashboardCard.compactStatValue}>{usersData?.filter((u: any) => u.isActive)?.length || 0}</p>
                    <p className={responsive.bodyMuted}>Active Users</p>
                  </div>
                  <div className={dashboardCard.balanceBlockSuccess}>
                    <Users className="h-6 w-6 sm:h-7 sm:w-7 mx-auto text-success mb-1" />
                    <p className={dashboardCard.compactStatValue}>{usersData?.filter((u: any) => u.Role?.name === 'caregiver' && u.isActive)?.length || 0}</p>
                    <p className={responsive.bodyMuted}>Active Caregivers</p>
                  </div>
                  <div className={dashboardCard.balanceBlockWarning}>
                    <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 mx-auto text-accent mb-1" />
                    <p className={dashboardCard.compactStatValue}>{usersData?.filter((u: any) => u.Role?.name === 'patient')?.length || 0}</p>
                    <p className={responsive.bodyMuted}>Total Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="caregivers" className="space-y-4">
            <Card className={dashboardCard.base}>
              <CardHeader className={dashboardCard.compactHeader}>
                <CardTitle className={responsive.cardTitle}>Top Performing Caregivers</CardTitle>
                <CardDescription className={responsive.cardDesc}>Ranked by appointments and revenue</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                {topCaregivers && topCaregivers.length > 0 ? (
                  <div className={dashboardCard.tableWrapper}>
                  <Table className={dashboardCard.tableMinWidth}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-9 w-12">Rank</TableHead>
                        <TableHead className="h-9">Caregiver</TableHead>
                        <TableHead className="h-9">Email</TableHead>
                        <TableHead className="h-9 text-right">Appointments</TableHead>
                        <TableHead className="h-9 text-right">Total Earnings</TableHead>
                        <TableHead className="h-9 text-right">Avg Per Appointment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...topCaregivers]
                        .sort((a: any, b: any) => parseFloat(b.totalEarnings || 0) - parseFloat(a.totalEarnings || 0))
                        .map((item: any, index: number) => (
                          <TableRow key={item.caregiverId}>
                            <TableCell>
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                #{index + 1}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.Caregiver?.User?.firstName} {item.Caregiver?.User?.lastName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.Caregiver?.User?.email}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {item.appointmentCount}
                            </TableCell>
                            <TableCell className="text-right font-bold text-success">
                              MWK {parseFloat(item.totalEarnings || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              MWK {(parseFloat(item.totalEarnings || 0) / item.appointmentCount).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    <Award className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No caregiver data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card className={dashboardCard.base}>
              <CardHeader className={dashboardCard.compactHeader}>
                <CardTitle className={responsive.cardTitle}>Revenue by Specialty</CardTitle>
                <CardDescription className={responsive.cardDesc}>Total revenue generated per specialty (completed appointments)</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                {revenueBySpecialty && revenueBySpecialty.length > 0 ? (
                  <div className={dashboardCard.tableWrapper}>
                  <Table className={dashboardCard.tableMinWidth}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-9">Specialty</TableHead>
                        <TableHead className="h-9 text-right">Completed</TableHead>
                        <TableHead className="h-9 text-right">Total Revenue</TableHead>
                        <TableHead className="h-9 text-right">Avg Revenue</TableHead>
                        <TableHead className="h-9 text-right">% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueBySpecialty.map((item: any) => {
                        const totalRev = revenueBySpecialty.reduce((sum: number, i: any) => sum + parseFloat(i.totalRevenue || 0), 0);
                        const percentage = ((parseFloat(item.totalRevenue || 0) / totalRev) * 100).toFixed(1);
                        return (
                          <TableRow key={item.specialtyId}>
                            <TableCell className="font-medium">{item.Specialty?.name || 'Unknown'}</TableCell>
                            <TableCell className="text-right">{item.appointmentCount}</TableCell>
                            <TableCell className="text-right font-bold text-success">
                              MWK {parseFloat(item.totalRevenue || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              MWK {(parseFloat(item.totalRevenue || 0) / item.appointmentCount).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">{percentage}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No revenue data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className={dashboardCard.base}>
                <CardHeader className={dashboardCard.compactHeader}>
                  <CardTitle className={responsive.cardTitle}>Caregivers by Location</CardTitle>
                  <CardDescription className={responsive.cardDesc}>Distribution of caregivers across regions</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  {caregiversByLocation && caregiversByLocation.length > 0 ? (
                    <div className={dashboardCard.tableWrapper}>
                    <Table className={dashboardCard.tableMinWidth}>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-9">Region</TableHead>
                          <TableHead className="h-9">District</TableHead>
                          <TableHead className="h-9">Traditional Authority</TableHead>
                          <TableHead className="h-9">Village</TableHead>
                          <TableHead className="h-9 text-right">Caregivers</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caregiversByLocation.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.region || '-'}</TableCell>
                            <TableCell>{item.district || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{item.traditionalAuthority || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{item.village || '-'}</TableCell>
                            <TableCell className="text-right font-semibold">{item.caregiverCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-sm text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No caregiver location data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={dashboardCard.base}>
                <CardHeader className={dashboardCard.compactHeader}>
                  <CardTitle className={responsive.cardTitle}>Patients by Location</CardTitle>
                  <CardDescription className={responsive.cardDesc}>Distribution of patients across regions</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  {patientsByLocation && patientsByLocation.length > 0 ? (
                    <div className={dashboardCard.tableWrapper}>
                    <Table className={dashboardCard.tableMinWidth}>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-9">Region</TableHead>
                          <TableHead className="h-9">District</TableHead>
                          <TableHead className="h-9">Traditional Authority</TableHead>
                          <TableHead className="h-9">Village</TableHead>
                          <TableHead className="h-9 text-right">Patients</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patientsByLocation.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.region || '-'}</TableCell>
                            <TableCell>{item.district || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{item.traditionalAuthority || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{item.village || '-'}</TableCell>
                            <TableCell className="text-right font-semibold">{item.patientCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-sm text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No patient location data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className={dashboardCard.base}>
              <CardHeader className={dashboardCard.compactHeader}>
                <CardTitle className={responsive.cardTitle}>Location Summary by Region</CardTitle>
                <CardDescription className={responsive.cardDesc}>Combined view of caregivers and patients per region</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                {locationSummary && locationSummary.length > 0 ? (
                  <div className={dashboardCard.tableWrapper}>
                  <Table className={dashboardCard.tableMinWidth}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-9">Region</TableHead>
                        <TableHead className="h-9 text-right">Caregivers</TableHead>
                        <TableHead className="h-9 text-right">Patients</TableHead>
                        <TableHead className="h-9 text-right">Total Users</TableHead>
                        <TableHead className="h-9 text-right">Ratio (C:P)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locationSummary.map((item: any) => {
                        const ratio = item.patientCount > 0
                          ? (item.caregiverCount / item.patientCount).toFixed(2)
                          : 'N/A';
                        return (
                          <TableRow key={item.region}>
                            <TableCell className="font-medium">{item.region || 'Unknown'}</TableCell>
                            <TableCell className="text-right text-primary font-semibold">
                              {item.caregiverCount}
                            </TableCell>
                            <TableCell className="text-right text-secondary font-semibold">
                              {item.patientCount}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {item.caregiverCount + item.patientCount}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {ratio}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No location summary data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;