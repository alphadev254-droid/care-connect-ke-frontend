import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ExportButton } from "@/components/shared/ExportButton";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { dashboardCard, responsive } from "@/theme";
import {
  DollarSign, TrendingUp, Calendar, Clock, CreditCard,
  Search, Filter, Eye, MapPin, User, Users,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserRecord { id: number; firstName: string; lastName: string; email: string; phone?: string; }
interface Specialty  { id: number; name: string; }
interface Caregiver  { id: number; userId: number; region?: string; district?: string; traditionalAuthority?: string; village?: string; User?: UserRecord; }
interface Patient    { id: number; userId: number; region?: string; district?: string; traditionalAuthority?: string; village?: string; User?: UserRecord; }
interface Appointment { id: number; caregiverId: number; patientId: number; scheduledDate: string; duration: number; sessionType?: string; status: string; Caregiver?: Caregiver; Patient?: Patient; Specialty?: Specialty; }
interface Transaction {
  id: number; amount: string; currency: string; status: string;
  paymentType: string; paymentMethod: string; paystackReference?: string; createdAt: string;
  baseFee?: number; convenienceFeeRate?: number; convenienceFeeAmount?: number;
  platformCommissionRate?: number; platformCommissionAmount?: number; caregiverEarnings?: number;
  Appointment?: Appointment;
}

// Summary shape returned by ?summary=true
interface SummaryAdmin {
  totalAmount: string; totalCommission: string; totalConvenienceFee: string;
  totalCaregiverEarnings: string; completedCount: number;
}
interface SummaryCaregiver {
  netEarnings: string; totalCommission: string; sessionsCompleted: number; averagePerSession: string;
}

const Earnings = () => {
  const { user } = useAuth();

  // ── Filter state (staged — only applied on button click) ──────────────────
  const [selectedPeriod,    setSelectedPeriod]    = useState("this-month");
  const [selectedCaregiver, setSelectedCaregiver] = useState("all");
  const [selectedRegion,    setSelectedRegion]    = useState("all");
  const [selectedDistrict,  setSelectedDistrict]  = useState("all");
  const [selectedTA,        setSelectedTA]        = useState("all");
  const [selectedVillage,   setSelectedVillage]   = useState("all");
  const [patientSearch,     setPatientSearch]     = useState("");
  const [caregiverSearch,   setCaregiverSearch]   = useState("");
  const [startDate,         setStartDate]         = useState("");
  const [endDate,           setEndDate]           = useState("");
  const [currentPage,       setCurrentPage]       = useState(1);
  const [pageSize,          setPageSize]          = useState(100);

  const [appliedFilters, setAppliedFilters] = useState({
    period: "this-month", caregiver: "all", region: "all", district: "all",
    traditionalAuthority: "all", village: "all", patientSearch: "", startDate: "", endDate: "",
  });

  const isAdmin = ["system_manager", "regional_manager", "Accountant"].includes(user?.role || "");
  const userAssignedRegion  = user?.assignedRegion;
  const isRegionRestricted  = (user?.role === "regional_manager" || user?.role === "Accountant")
    && userAssignedRegion && userAssignedRegion !== "all";

  // ── Build shared query params ─────────────────────────────────────────────
  const buildParams = (extra: Record<string, string> = {}) => {
    const p: Record<string, string> = {
      period: appliedFilters.period,
      ...(appliedFilters.caregiver !== "all"              && { caregiverId:           appliedFilters.caregiver }),
      ...(appliedFilters.region    !== "all"              && { region:                appliedFilters.region }),
      ...(appliedFilters.district  !== "all"              && { district:              appliedFilters.district }),
      ...(appliedFilters.traditionalAuthority !== "all"   && { traditionalAuthority:  appliedFilters.traditionalAuthority }),
      ...(appliedFilters.village   !== "all"              && { village:               appliedFilters.village }),
      ...(appliedFilters.patientSearch                    && { patientSearch:         appliedFilters.patientSearch }),
      ...(appliedFilters.startDate                        && { startDate:             appliedFilters.startDate }),
      ...(appliedFilters.endDate                          && { endDate:               appliedFilters.endDate }),
      ...extra,
    };
    return new URLSearchParams(p).toString();
  };

  const endpoint = isAdmin ? "/earnings/admin" : user?.role === "caregiver" ? "/earnings/caregiver" : "/earnings/payments/history";

  // ── Summary query (stat cards) — no pagination, no rows ──────────────────
  const { data: summaryData } = useQuery({
    queryKey: ["earnings-summary", appliedFilters, user?.role],
    queryFn: async () => {
      const res = await api.get(`${endpoint}?${buildParams({ summary: "true" })}`);
      return res.data as SummaryAdmin & SummaryCaregiver;
    },
    enabled: appliedFilters.period !== "custom" || (!!appliedFilters.startDate && !!appliedFilters.endDate),
  });

  // ── Table query (paginated rows) ──────────────────────────────────────────
  const { data: tableData, isLoading } = useQuery({
    queryKey: ["earnings-table", appliedFilters, user?.role, currentPage, pageSize],
    queryFn: async () => {
      const res = await api.get(`${endpoint}?${buildParams({ page: currentPage.toString(), limit: pageSize.toString() })}`);
      return res.data;
    },
    enabled: appliedFilters.period !== "custom" || (!!appliedFilters.startDate && !!appliedFilters.endDate),
  });

  const transactions: Transaction[] = Array.isArray(tableData?.transactions)
    ? tableData.transactions
    : Array.isArray(tableData?.payments) ? tableData.payments : [];
  const pagination = tableData?.pagination;

  // ── Location + caregiver dropdowns ────────────────────────────────────────
  const { data: caregivers } = useQuery({
    queryKey: ["caregivers-list"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (isRegionRestricted) params.append("region", userAssignedRegion);
      const res = await api.get(`/caregivers?${params}`);
      return res.data.caregivers || [];
    },
    enabled: isAdmin,
  });

  const { data: searchedCaregivers } = useQuery({
    queryKey: ["caregivers-search", caregiverSearch],
    queryFn: async () => {
      if (caregiverSearch.length < 2) return [];
      const params = new URLSearchParams({ q: caregiverSearch });
      if (isRegionRestricted) params.append("region", userAssignedRegion);
      const res = await api.get(`/earnings/caregivers/search?${params}`);
      return res.data.caregivers || [];
    },
    enabled: isAdmin,
  });

  const displayCaregivers = caregiverSearch.length >= 2 ? searchedCaregivers : caregivers;

  const { data: regions }    = useQuery({ queryKey: ["regions-list"], queryFn: async () => { if (!isAdmin) return []; if (isRegionRestricted) return [userAssignedRegion]; const r = await api.get("/locations/regions"); return r.data.data || []; }, enabled: isAdmin });
  const { data: patientRegions } = useQuery({ queryKey: ["patient-regions-list"], queryFn: async () => { const r = await api.get("/locations/regions"); return r.data.data || []; }, enabled: user?.role === "caregiver" });
  const { data: districts }  = useQuery({ queryKey: ["districts-list", selectedRegion], queryFn: async () => { if (selectedRegion === "all") return []; const r = await api.get(`/locations/districts/${isRegionRestricted ? userAssignedRegion : selectedRegion}`); return r.data.data || []; }, enabled: isAdmin && selectedRegion !== "all" });
  const { data: patientDistricts } = useQuery({ queryKey: ["patient-districts-list", selectedRegion], queryFn: async () => { if (selectedRegion === "all") return []; const r = await api.get(`/locations/districts/${selectedRegion}`); return r.data.data || []; }, enabled: user?.role === "caregiver" && selectedRegion !== "all" });
  const { data: traditionalAuthorities } = useQuery({ queryKey: ["ta-list", selectedRegion, selectedDistrict], queryFn: async () => { if (selectedDistrict === "all") return []; const r = await api.get(`/locations/traditional-authorities/${selectedRegion}/${selectedDistrict}`); return r.data.data || []; }, enabled: isAdmin && selectedDistrict !== "all" });
  const { data: patientTAs } = useQuery({ queryKey: ["patient-ta-list", selectedRegion, selectedDistrict], queryFn: async () => { if (selectedDistrict === "all") return []; const r = await api.get(`/locations/traditional-authorities/${selectedRegion}/${selectedDistrict}`); return r.data.data || []; }, enabled: user?.role === "caregiver" && selectedDistrict !== "all" });
  const { data: villages }   = useQuery({ queryKey: ["villages-list", selectedRegion, selectedDistrict, selectedTA], queryFn: async () => { if (selectedTA === "all") return []; const r = await api.get(`/locations/villages/${selectedRegion}/${selectedDistrict}/${selectedTA}`); return r.data.data || []; }, enabled: isAdmin && selectedTA !== "all" });
  const { data: patientVillages } = useQuery({ queryKey: ["patient-villages-list", selectedRegion, selectedDistrict, selectedTA], queryFn: async () => { if (selectedTA === "all") return []; const r = await api.get(`/locations/villages/${selectedRegion}/${selectedDistrict}/${selectedTA}`); return r.data.data || []; }, enabled: user?.role === "caregiver" && selectedTA !== "all" });

  const handleRegionChange   = (v: string) => { setSelectedRegion(v);   setSelectedDistrict("all"); setSelectedTA("all"); setSelectedVillage("all"); };
  const handleDistrictChange = (v: string) => { setSelectedDistrict(v); setSelectedTA("all");       setSelectedVillage("all"); };
  const handleTAChange       = (v: string) => { setSelectedTA(v);       setSelectedVillage("all"); };

  // ── Stats — READ FROM BACKEND SUMMARY, not from transaction rows ──────────
  const getStats = () => {
    if (!summaryData) return [];

    if (isAdmin) {
      const s = summaryData as SummaryAdmin;
      return [
        { title: "Total Collections",    value: `KES ${Number(s.totalAmount           || 0).toLocaleString()}`, icon: DollarSign  },
        { title: "Platform Commission",  value: `KES ${Number(s.totalCommission       || 0).toLocaleString()}`, icon: CreditCard  },
        { title: "Processing Fees",      value: `KES ${Number(s.totalConvenienceFee   || 0).toLocaleString()}`, icon: TrendingUp  },
        { title: "Caregiver Earnings",   value: `KES ${Number(s.totalCaregiverEarnings|| 0).toLocaleString()}`, icon: User        },
        { title: "Active Caregivers",    value: tableData?.uniqueCaregivers || 0,                               icon: Users       },
        { title: "Patients Served",      value: tableData?.uniquePatients   || 0,                               icon: Users       },
        { title: "Completed Sessions",   value: tableData?.completedSessions || s.completedCount || 0,          icon: Clock       },
      ];
    }

    if (user?.role === "caregiver") {
      const s = summaryData as SummaryCaregiver;
      return [
        { title: "Net Earnings",         value: `KES ${Number(s.netEarnings      || 0).toLocaleString()}`, icon: DollarSign },
        { title: "Commission Deducted",  value: `KES ${Number(s.totalCommission  || 0).toLocaleString()}`, icon: TrendingUp },
        { title: "Sessions Completed",   value: s.sessionsCompleted || 0,                                  icon: Clock      },
        { title: "Avg Earnings/Session", value: `KES ${Number(s.averagePerSession|| 0).toLocaleString()}`, icon: CreditCard },
      ];
    }

    // Patient
    const totalSpent = transactions.reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);
    return [
      { title: "Total Spent",   value: `KES ${totalSpent.toLocaleString()}`,                                                                                       icon: DollarSign },
      { title: "This Month",    value: `KES ${Number(tableData?.thisMonth || 0).toLocaleString()}`,                                                                 icon: TrendingUp },
      { title: "Payments",      value: transactions.filter(t => t.status === "completed").length,                                                                   icon: Clock      },
      { title: "Avg/Payment",   value: `KES ${transactions.length > 0 ? Math.round(totalSpent / transactions.length).toLocaleString() : 0}`,                       icon: CreditCard },
    ];
  };

  const stats = getStats();

  const applyFilters = () => {
    setAppliedFilters({ period: selectedPeriod, caregiver: selectedCaregiver, region: selectedRegion, district: selectedDistrict, traditionalAuthority: selectedTA, village: selectedVillage, patientSearch, startDate, endDate });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedPeriod("this-month"); setSelectedCaregiver("all"); setSelectedRegion("all");
    setSelectedDistrict("all"); setSelectedTA("all"); setSelectedVillage("all");
    setPatientSearch(""); setStartDate(""); setEndDate("");
    setAppliedFilters({ period: "this-month", caregiver: "all", region: "all", district: "all", traditionalAuthority: "all", village: "all", patientSearch: "", startDate: "", endDate: "" });
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || "caregiver")}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute requiredPermission="view_financial_reports">
      <DashboardLayout userRole={mapUserRole(user?.role || "caregiver")}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={responsive.pageTitle}>
                {isAdmin ? "Platform Earnings" : user?.role === "caregiver" ? "Earnings" : "Payment History"}
              </h1>
              <p className={responsive.pageSubtitle}>
                {isAdmin ? "Monitor all platform earnings and transactions"
                  : user?.role === "caregiver" ? "Track your income and transactions"
                  : "View your healthcare payments"}
              </p>
            </div>
            <ExportButton
              data={transactions}
              columns={[
                { header: "Date",         accessor: (r: Transaction) => new Date(r.createdAt).toLocaleDateString() },
                { header: "Time",         accessor: (r: Transaction) => new Date(r.createdAt).toLocaleTimeString() },
                ...(isAdmin ? [
                  { header: "Caregiver",      accessor: (r: Transaction) => `${r.Appointment?.Caregiver?.User?.firstName} ${r.Appointment?.Caregiver?.User?.lastName}` },
                  { header: "Caregiver Email",accessor: (r: Transaction) => r.Appointment?.Caregiver?.User?.email || "N/A" },
                  { header: "Commission",     accessor: (r: Transaction) => r.platformCommissionAmount || 0, format: (v: number) => `KES ${v.toLocaleString()}` },
                  { header: "Processing Fee",accessor:(r: Transaction) => r.convenienceFeeAmount || 0,       format: (v: number) => `KES ${v.toLocaleString()}` },

                ] : []),
                { header: "Patient",      accessor: (r: Transaction) => `${r.Appointment?.Patient?.User?.firstName} ${r.Appointment?.Patient?.User?.lastName}` },
                { header: "Service",      accessor: (r: Transaction) => r.Appointment?.Specialty?.name || "General Care" },
                { header: "Payment Type", accessor: (r: Transaction) => r.paymentType === "booking_fee" ? "Booking Fee" : "Session Fee" },
                { header: "Base Fee",     accessor: (r: Transaction) => r.baseFee || 0,                    format: (v: number) => `KES ${v.toLocaleString()}` },
                ...(user?.role === "caregiver" ? [
                  { header: "Commission Deducted", accessor: (r: Transaction) => r.platformCommissionAmount || 0, format: (v: number) => `KES ${v.toLocaleString()}` },
                  { header: "Net Earnings",        accessor: (r: Transaction) => r.caregiverEarnings || 0,        format: (v: number) => `KES ${v.toLocaleString()}` },
                ] : []),
                { header: "Status",       accessor: "status" },
                { header: "Reference",    accessor: (r: Transaction) => r.paystackReference || `TXN-${r.id}` },
              ]}
              filename={`${isAdmin ? "platform-earnings" : user?.role === "caregiver" ? "earnings" : "payment-history"}-${new Date().toISOString().split("T")[0]}`}
              title={isAdmin ? "Platform Earnings Report" : user?.role === "caregiver" ? "Earnings Report" : "Payment History Report"}
            />
          </div>

          {/* Filters */}
          {(isAdmin || user?.role === "caregiver") && (
            <Card className={dashboardCard.base}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4" />
                  <h3 className={responsive.cardTitle}>{isAdmin ? "Filters" : "Patient Filters"}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {/* Period */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Period</label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="this-year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom dates */}
                  {selectedPeriod === "custom" && (
                    <>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-8 text-xs" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-8 text-xs" />
                      </div>
                    </>
                  )}

                  {/* Caregiver picker (admin only) */}
                  {isAdmin && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Caregiver</label>
                      <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="h-3 w-3 absolute left-2 top-2.5 text-muted-foreground" />
                              <Input placeholder="Search caregivers..." value={caregiverSearch} onChange={e => setCaregiverSearch(e.target.value)} className="h-8 text-xs pl-7" />
                            </div>
                          </div>
                          <SelectItem value="all">All Caregivers</SelectItem>
                          {displayCaregivers?.map((c: Caregiver) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.User?.firstName} {c.User?.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Region */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{isAdmin ? "Caregiver Region" : "Patient Region"}</label>
                    <Select value={selectedRegion} onValueChange={handleRegionChange}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {(isAdmin ? regions : patientRegions)?.map((r: string) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{isAdmin ? "Caregiver District" : "Patient District"}</label>
                    <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {(isAdmin ? districts : patientDistricts)?.map((d: string) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* TA */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{isAdmin ? "Caregiver TA" : "Patient TA"}</label>
                    <Select value={selectedTA} onValueChange={handleTAChange}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All TAs</SelectItem>
                        {(isAdmin ? traditionalAuthorities : patientTAs)?.map((ta: string) => <SelectItem key={ta} value={ta}>{ta}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Village */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{isAdmin ? "Caregiver Village" : "Patient Village"}</label>
                    <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Villages</SelectItem>
                        {(isAdmin ? villages : patientVillages)?.map((v: string) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Patient search */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Patient Search</label>
                    <div className="relative">
                      <Search className="h-3 w-3 absolute left-2 top-2.5 text-muted-foreground" />
                      <Input placeholder="Name or email..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} className="h-8 text-xs pl-7" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end gap-2">
                    <Button variant="default" size="sm" className="h-8 text-xs" onClick={applyFilters}>Apply</Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={clearFilters}>Clear</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stat cards — values from backend summary */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 ${isAdmin ? "lg:grid-cols-7" : "lg:grid-cols-4"} gap-2`}>
            {stats.map(stat => (
              <Card key={stat.title} className={dashboardCard.base}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <p className={responsive.bodyMuted}>{stat.title}</p>
                      <p className={responsive.statValue}>{stat.value}</p>
                    </div>
                    <div className={dashboardCard.iconWell.primary}>
                      <stat.icon className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Transactions table */}
          <Card className={dashboardCard.base}>
            <div className={`${dashboardCard.header} border-b`}>
              <h2 className={responsive.cardTitle}>
                {isAdmin ? "All Platform Transactions" : user?.role === "caregiver" ? "Recent Earnings" : "Payment Transactions"}
              </h2>
              <p className={responsive.bodyMuted}>
                {pagination ? `${pagination.totalRecords} records · page ${pagination.currentPage} of ${pagination.totalPages}` : ""}
              </p>
            </div>
            <CardContent className="p-0 overflow-hidden">
              {transactions.length > 0 ? (
                <div className={dashboardCard.tableWrapper}>
                  <Table className={dashboardCard.tableMinWidth}>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className={dashboardCard.th}>Date</TableHead>
                        {isAdmin && <TableHead className={dashboardCard.th}>Caregiver</TableHead>}
                        <TableHead className={dashboardCard.th}>
                          {user?.role === "caregiver" || isAdmin ? "Patient" : "Caregiver"}
                        </TableHead>
                        <TableHead className={dashboardCard.th}>Appointment</TableHead>
                        <TableHead className={dashboardCard.th}>Service</TableHead>
                        <TableHead className={dashboardCard.th}>Type</TableHead>
                        <TableHead className={`${dashboardCard.th} text-right`}>Base Fee</TableHead>

                            <TableHead className={`${dashboardCard.th} text-right`}>Commission</TableHead>
                            <TableHead className={`${dashboardCard.th} text-right`}>Net Earnings</TableHead>
                      
                        {isAdmin && <TableHead className={`${dashboardCard.th} text-right`}>Convenience Fee</TableHead>}
                      {user?.role === "system_manager" && 
                      <TableHead className={`${dashboardCard.th} text-right`}>Total</TableHead>}
                        <TableHead className={dashboardCard.th}>Status</TableHead>
                        {(isAdmin || user?.role === "caregiver") && <TableHead className={dashboardCard.th}>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t: Transaction) => (
                        <TableRow key={t.id} className={dashboardCard.tr}>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {new Date(t.createdAt).toLocaleDateString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(t.createdAt).toLocaleTimeString()}
                            </p>
                          </TableCell>

                          {isAdmin && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
                                  {t.Appointment?.Caregiver?.User?.firstName?.charAt(0) || "C"}
                                </div>
                                <div>
                                  <p className="text-xs font-medium">{t.Appointment?.Caregiver?.User?.firstName} {t.Appointment?.Caregiver?.User?.lastName}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />{t.Appointment?.Caregiver?.district || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          )}

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                                {(isAdmin || user?.role === "caregiver")
                                  ? t.Appointment?.Patient?.User?.firstName?.charAt(0) || "P"
                                  : t.Appointment?.Caregiver?.User?.firstName?.charAt(0) || "C"}
                              </div>
                              <div>
                                <p className="text-xs font-medium">
                                  {(isAdmin || user?.role === "caregiver")
                                    ? `${t.Appointment?.Patient?.User?.firstName} ${t.Appointment?.Patient?.User?.lastName}`
                                    : `${t.Appointment?.Caregiver?.User?.firstName} ${t.Appointment?.Caregiver?.User?.lastName}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(isAdmin || user?.role === "caregiver")
                                    ? t.Appointment?.Patient?.User?.email
                                    : t.paystackReference || `TXN-${t.id}`}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{t.Appointment?.id ? `#${t.Appointment.id.toString().slice(0, -11)+'**********'}` : `TXN-${t.id}`}</TableCell>

                          <TableCell className="text-xs">{t.Appointment?.Specialty?.name || "General Care"}</TableCell>

                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {t.paymentType === "booking_fee" ? "Booking" : "Session"}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right text-xs">
                            KES {(t.baseFee || 0).toLocaleString()}
                          </TableCell>

                            <TableCell className="text-right text-xs">
                              KES {(t.platformCommissionAmount || 0).toLocaleString()}
                            </TableCell>
                         
                         <TableCell className="text-right text-xs font-semibold text-green-600">
                                KES {(t.caregiverEarnings || 0).toLocaleString()}
                              </TableCell>
                     
                          
                          {isAdmin && (
                            <TableCell className="text-right text-xs">
                              KES {(t.convenienceFeeAmount || 0).toLocaleString()}
                            </TableCell>
                          )}


                     
                        {user?.role === "system_manager" && 
                          <TableCell className="text-right">
                            <p className="font-semibold text-xs">KES {parseFloat(t.amount || "0").toLocaleString()}</p>
                          </TableCell>
                      }
                          <TableCell>
                            <Badge variant={t.status === "completed" ? "default" : "secondary"} className="text-xs">
                              {t.status}
                            </Badge>
                          </TableCell>

                          {(isAdmin || user?.role === "caregiver") && (
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className={responsive.dialogTitle}>Transaction Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-6 text-sm">
                                    <div>
                                      <h4 className="font-semibold mb-2">Transaction</h4>
                                      <div className="space-y-1">
                                        <p><strong>Ref:</strong> {t.paystackReference || `TXN-${t.id}`}</p>
                                        <p><strong>Status:</strong> {t.status}</p>
                                        <p><strong>Method:</strong> {t.paymentMethod || "N/A"}</p>
                                        <p><strong>Type:</strong> {t.paymentType === "booking_fee" ? "Booking Fee" : "Session Fee"}</p>
                                        <p><strong>Date:</strong> {new Date(t.createdAt).toLocaleString()}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Fee Breakdown</h4>
                                      <div className="space-y-1">
                                        <p><strong>Base Fee:</strong> KES {(t.baseFee || 0).toLocaleString()}</p>
                                        {user.role == 'system_manager' && (
                                          <p><strong>Processing Fee ({t.convenienceFeeRate}%):</strong> KES {(t.convenienceFeeAmount || 0).toLocaleString()}</p>
                                        )}
                                        {(t.platformCommissionAmount || 0) > 0 && (
                                          <p><strong>Platform Commission ({t.platformCommissionRate}%):</strong> KES {(t.platformCommissionAmount || 0).toLocaleString()}</p>
                                        )}
                                        {(t.caregiverEarnings || 0) > 0 && (
                                          <p className="text-green-600"><strong>Caregiver Earnings:</strong> KES {(t.caregiverEarnings || 0).toLocaleString()}</p>
                                        )}
                                        {user.role == 'system_manager' && (
                                          <p className="font-semibold border-t pt-1"><strong>Total:</strong> KES {parseFloat(t.amount || "0").toLocaleString()}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Appointment</h4>
                                      <div className="space-y-1">
                                        <p><strong>Service:</strong> {t.Appointment?.Specialty?.name}</p>
                                        <p><strong>Reference:</strong> #{t.Appointment?.id.toString().slice(0, -11)+'**********'}</p>
                                        <p><strong>Duration:</strong> {t.Appointment?.duration || 180} min</p>
                                        <p><strong>Type:</strong> {t.Appointment?.sessionType}</p>
                                        <p><strong>Date:</strong> {t.Appointment?.scheduledDate ? new Date(t.Appointment.scheduledDate).toLocaleDateString() : "N/A"}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Patient</h4>
                                      <div className="space-y-1">
                                        <p><strong>Name:</strong> {t.Appointment?.Patient?.User?.firstName} {t.Appointment?.Patient?.User?.lastName}</p>
                                        <p><strong>Email:</strong> {t.Appointment?.Patient?.User?.email}</p>
                                        <p><strong>Phone:</strong> {t.Appointment?.Patient?.User?.phone}</p>
                                        {user?.role === "caregiver" && (
                                          <>
                                            <p><strong>Location:</strong> {t.Appointment?.Patient?.district}, {t.Appointment?.Patient?.region}</p>
                                            <p><strong>TA:</strong> {t.Appointment?.Patient?.traditionalAuthority}</p>
                                            <p><strong>Village:</strong> {t.Appointment?.Patient?.village}</p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {isAdmin && (
                                      <div>
                                        <h4 className="font-semibold mb-2">Caregiver</h4>
                                        <div className="space-y-1">
                                          <p><strong>Name:</strong> {t.Appointment?.Caregiver?.User?.firstName} {t.Appointment?.Caregiver?.User?.lastName}</p>
                                          <p><strong>Location:</strong> {t.Appointment?.Caregiver?.district}, {t.Appointment?.Caregiver?.region}</p>
                                          <p><strong>Specialty:</strong> {t.Appointment?.Specialty?.name}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <DollarSign className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <h3 className={`${responsive.cardTitle} mb-1`}>No transactions yet</h3>
                  <p className={responsive.bodyMuted}>
                    {user?.role === "caregiver" ? "Your earnings from completed sessions will appear here" : "Your payment transactions will appear here"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={responsive.bodyMuted}>Rows per page:</span>
                <Select value={pageSize.toString()} onValueChange={v => { setPageSize(parseInt(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["100","200","500","1000"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className={responsive.bodyMuted}>Page {currentPage} of {pagination.totalPages}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)}                         disabled={currentPage === 1}>First</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)}                disabled={currentPage === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)}                disabled={currentPage === pagination.totalPages}>Next</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(pagination.totalPages)}     disabled={currentPage === pagination.totalPages}>Last</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Earnings;