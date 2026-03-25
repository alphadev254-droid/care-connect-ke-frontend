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
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  CreditCard,
  Search,
  Filter,
  Eye,
  MapPin,
  User,
} from "lucide-react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Specialty {
  id: number;
  name: string;
}

interface Caregiver {
  id: number;
  userId: number;
  region?: string;
  district?: string;
  traditionalAuthority?: string;
  village?: string;
  User?: User;
}

interface Patient {
  id: number;
  userId: number;
  region?: string;
  district?: string;
  traditionalAuthority?: string;
  village?: string;
  User?: User;
}

interface Appointment {
  id: number;
  caregiverId: number;
  patientId: number;
  scheduledDate: string;
  duration: number;
  sessionType?: string;
  status: string;
  Caregiver?: Caregiver;
  Patient?: Patient;
  Specialty?: Specialty;
}

interface Transaction {
  id: number;
  amount: string;
  currency: string;
  status: string;
  paymentType: string;
  paymentMethod: string;
  paystackReference?: string;
  createdAt: string;
  // Fee breakdown fields
  baseFee?: number;
  convenienceFeeRate?: number;
  convenienceFeeAmount?: number;
  platformCommissionRate?: number;
  platformCommissionAmount?: number;
  caregiverEarnings?: number;
  Appointment?: Appointment;
}

interface EarningsData {
  total?: number;
  thisMonth?: number;
  completedSessions?: number;
  uniqueCaregivers?: number;
  uniquePatients?: number;
  sessionsCompleted?: number;
  averagePerSession?: number;
  transactions?: Transaction[];
  payments?: Transaction[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
  };
}

interface StatItem {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trendUp: boolean;
}

const Earnings = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");
  const [selectedCaregiver, setSelectedCaregiver] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedTA, setSelectedTA] = useState("all");
  const [selectedVillage, setSelectedVillage] = useState("all");
  const [patientSearch, setPatientSearch] = useState("");
  const [caregiverSearch, setCaregiverSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [appliedFilters, setAppliedFilters] = useState({
    period: 'this-month',
    caregiver: 'all',
    region: 'all',
    district: 'all',
    traditionalAuthority: 'all',
    village: 'all',
    patientSearch: '',
    startDate: '',
    endDate: ''
  });
  
  const isAdmin = user?.role === 'system_manager' || user?.role === 'regional_manager' || user?.role === 'Accountant';
  const userAssignedRegion = user?.assignedRegion;
  const isRegionRestricted = (user?.role === 'regional_manager' || user?.role === 'Accountant') && userAssignedRegion && userAssignedRegion !== 'all';

  const { data: earningsData, isLoading } = useQuery({
    queryKey: ["earnings", appliedFilters, user?.role, currentPage, pageSize],
    queryFn: async () => {
      if (isAdmin) {
        const params = new URLSearchParams({
          period: appliedFilters.period,
          page: currentPage.toString(),
          limit: pageSize.toString(),
          ...(appliedFilters.caregiver !== 'all' && { caregiverId: appliedFilters.caregiver }),
          ...(appliedFilters.region !== 'all' && { region: appliedFilters.region }),
          ...(appliedFilters.district !== 'all' && { district: appliedFilters.district }),
          ...(appliedFilters.traditionalAuthority !== 'all' && { traditionalAuthority: appliedFilters.traditionalAuthority }),
          ...(appliedFilters.village !== 'all' && { village: appliedFilters.village }),
          ...(appliedFilters.patientSearch && { patientSearch: appliedFilters.patientSearch }),
          ...(appliedFilters.startDate && { startDate: appliedFilters.startDate }),
          ...(appliedFilters.endDate && { endDate: appliedFilters.endDate })
        });
        const response = await api.get(`/earnings/admin?${params}`);
        return response.data || {};
      } else {
        const params = new URLSearchParams({
          period: appliedFilters.period,
          page: currentPage.toString(),
          limit: pageSize.toString(),
          ...(appliedFilters.patientSearch && { patientSearch: appliedFilters.patientSearch }),
          ...(appliedFilters.region !== 'all' && { region: appliedFilters.region }),
          ...(appliedFilters.district !== 'all' && { district: appliedFilters.district }),
          ...(appliedFilters.traditionalAuthority !== 'all' && { traditionalAuthority: appliedFilters.traditionalAuthority }),
          ...(appliedFilters.village !== 'all' && { village: appliedFilters.village }),
          ...(appliedFilters.startDate && { startDate: appliedFilters.startDate }),
          ...(appliedFilters.endDate && { endDate: appliedFilters.endDate })
        });
        const endpoint = user?.role === 'caregiver'
          ? `/earnings/caregiver?${params}`
          : `/earnings/payments/history?${params}`;
        const response = await api.get(endpoint);
        return response.data || {};
      }
    },
    enabled: appliedFilters.period !== 'custom' || (!!appliedFilters.startDate && !!appliedFilters.endDate)
  });

  // Fetch caregivers - restricted to user's assigned region
  const { data: caregivers } = useQuery({
    queryKey: ["caregivers-list"],
    queryFn: async () => {
      if (!isAdmin) return [];
      const params = new URLSearchParams();
      if (isRegionRestricted) {
        params.append('region', userAssignedRegion);
      }
      const response = await api.get(`/caregivers?${params}`);
      return response.data.caregivers || [];
    },
    enabled: isAdmin
  });

  // Fetch locations for caregiver filters (patient locations)
  const { data: patientRegions } = useQuery({
    queryKey: ["patient-regions-list"],
    queryFn: async () => {
      if (user?.role !== 'caregiver') return [];
      const response = await api.get('/locations/regions');
      return response.data.data || [];
    },
    enabled: user?.role === 'caregiver'
  });

  const { data: patientDistricts } = useQuery({
    queryKey: ["patient-districts-list", selectedRegion],
    queryFn: async () => {
      if (user?.role !== 'caregiver' || selectedRegion === 'all') return [];
      const response = await api.get(`/locations/districts/${selectedRegion}`);
      return response.data.data || [];
    },
    enabled: user?.role === 'caregiver' && selectedRegion !== 'all'
  });

  const { data: patientTAs } = useQuery({
    queryKey: ["patient-ta-list", selectedRegion, selectedDistrict],
    queryFn: async () => {
      if (user?.role !== 'caregiver' || selectedDistrict === 'all') return [];
      const response = await api.get(`/locations/traditional-authorities/${selectedRegion}/${selectedDistrict}`);
      return response.data.data || [];
    },
    enabled: user?.role === 'caregiver' && selectedDistrict !== 'all'
  });

  const { data: patientVillages } = useQuery({
    queryKey: ["patient-villages-list", selectedRegion, selectedDistrict, selectedTA],
    queryFn: async () => {
      if (user?.role !== 'caregiver' || selectedTA === 'all') return [];
      const response = await api.get(`/locations/villages/${selectedRegion}/${selectedDistrict}/${selectedTA}`);
      return response.data.data || [];
    },
    enabled: user?.role === 'caregiver' && selectedTA !== 'all'
  });

  // Search caregivers - restricted to user's assigned region
  const { data: searchedCaregivers } = useQuery({
    queryKey: ["caregivers-search", caregiverSearch],
    queryFn: async () => {
      if (!isAdmin) return [];
      if (caregiverSearch.length >= 2) {
        const params = new URLSearchParams({ q: caregiverSearch });
        if (isRegionRestricted) {
          params.append('region', userAssignedRegion);
        }
        const response = await api.get(`/earnings/caregivers/search?${params}`);
        return response.data.caregivers || [];
      }
      return [];
    },
    enabled: isAdmin
  });

  const displayCaregivers = caregiverSearch.length >= 2 ? searchedCaregivers : caregivers;

  // Fetch regions for admin filters - restricted users only see their assigned region
  const { data: regions } = useQuery({
    queryKey: ["regions-list"],
    queryFn: async () => {
      if (!isAdmin) return [];
      if (isRegionRestricted) {
        return [userAssignedRegion]; // Only show assigned region
      }
      const response = await api.get('/locations/regions');
      return response.data.data || [];
    },
    enabled: isAdmin
  });

  // Fetch districts - restricted to user's assigned region
  const { data: districts } = useQuery({
    queryKey: ["districts-list", selectedRegion],
    queryFn: async () => {
      if (!isAdmin || selectedRegion === 'all') return [];
      const regionToUse = isRegionRestricted ? userAssignedRegion : selectedRegion;
      const response = await api.get(`/locations/districts/${regionToUse}`);
      return response.data.data || [];
    },
    enabled: isAdmin && selectedRegion !== 'all'
  });

  const { data: traditionalAuthorities } = useQuery({
    queryKey: ["ta-list", selectedRegion, selectedDistrict],
    queryFn: async () => {
      if (!isAdmin || selectedDistrict === 'all') return [];
      const response = await api.get(`/locations/traditional-authorities/${selectedRegion}/${selectedDistrict}`);
      return response.data.data || [];
    },
    enabled: isAdmin && selectedDistrict !== 'all'
  });

  const { data: villages } = useQuery({
    queryKey: ["villages-list", selectedRegion, selectedDistrict, selectedTA],
    queryFn: async () => {
      if (!isAdmin || selectedTA === 'all') return [];
      const response = await api.get(`/locations/villages/${selectedRegion}/${selectedDistrict}/${selectedTA}`);
      return response.data.data || [];
    },
    enabled: isAdmin && selectedTA !== 'all'
  });

  // Reset dependent filters when parent changes
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedDistrict('all');
    setSelectedTA('all');
    setSelectedVillage('all');
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedTA('all');
    setSelectedVillage('all');
  };

  const handleTAChange = (value: string) => {
    setSelectedTA(value);
    setSelectedVillage('all');
  };

  const earnings = earningsData || {};
  const allTransactions = Array.isArray(earnings.transactions)
    ? earnings.transactions
    : Array.isArray(earnings.payments)
    ? earnings.payments
    : [];
  
  // Apply frontend filtering for real-time UI updates
  const transactions = allTransactions.filter((transaction: Transaction) => {
    // Patient search filter
    if (patientSearch) {
      const patientName = `${transaction.Appointment?.Patient?.User?.firstName || ''} ${transaction.Appointment?.Patient?.User?.lastName || ''}`.toLowerCase();
      const patientEmail = transaction.Appointment?.Patient?.User?.email?.toLowerCase() || '';
      const searchLower = patientSearch.toLowerCase();
      if (!patientName.includes(searchLower) && !patientEmail.includes(searchLower)) {
        return false;
      }
    }
    
    // Patient location filters (for caregivers)
    if (user?.role === 'caregiver') {
      if (selectedRegion !== 'all') {
        if (transaction.Appointment?.Patient?.region !== selectedRegion) {
          return false;
        }
      }
      
      if (selectedDistrict !== 'all') {
        if (transaction.Appointment?.Patient?.district !== selectedDistrict) {
          return false;
        }
      }
      
      if (selectedTA !== 'all') {
        if (transaction.Appointment?.Patient?.traditionalAuthority !== selectedTA) {
          return false;
        }
      }
      
      if (selectedVillage !== 'all') {
        if (transaction.Appointment?.Patient?.village !== selectedVillage) {
          return false;
        }
      }
    }
    
    // Caregiver filter
    if (selectedCaregiver !== 'all') {
      if (transaction.Appointment?.caregiverId?.toString() !== selectedCaregiver) {
        return false;
      }
    }
    
    // Location filters
    if (selectedRegion !== 'all') {
      if (transaction.Appointment?.Caregiver?.region !== selectedRegion) {
        return false;
      }
    }
    
    if (selectedDistrict !== 'all') {
      if (transaction.Appointment?.Caregiver?.district !== selectedDistrict) {
        return false;
      }
    }
    
    if (selectedTA !== 'all') {
      if (transaction.Appointment?.Caregiver?.traditionalAuthority !== selectedTA) {
        return false;
      }
    }
    
    if (selectedVillage !== 'all') {
      if (transaction.Appointment?.Caregiver?.village !== selectedVillage) {
        return false;
      }
    }
    
    return true;
  });
  
  const totalPages = earnings.pagination?.totalPages || 1;
  
  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setAppliedFilters({
      period: selectedPeriod,
      caregiver: selectedCaregiver,
      region: selectedRegion,
      district: selectedDistrict,
      traditionalAuthority: selectedTA,
      village: selectedVillage,
      patientSearch,
      startDate,
      endDate
    });
    setCurrentPage(1);
  };

  const getStats = (): StatItem[] => {
    if (isAdmin) {
      const completedTransactions = transactions.filter((t: Transaction) => t.status === 'completed');
      const totalEarnings = completedTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.amount || 0), 0);
      const totalCommission = completedTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.platformCommissionAmount || 0), 0);
      const totalConvenienceFees = completedTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.convenienceFeeAmount || 0), 0);
      const totalCaregiverEarnings = completedTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.caregiverEarnings || 0), 0);
      const uniqueCaregivers = new Set(transactions.map((t: Transaction) => t.Appointment?.caregiverId)).size;
      const uniquePatients = new Set(transactions.map((t: Transaction) => t.Appointment?.patientId)).size;

      return [
        {
          title: "Total Collections",
          value: `KES ${Math.round(totalEarnings).toLocaleString()}`,
          icon: DollarSign,
          trendUp: true,
        },
        {
          title: "Platform Commission",
          value: `KES ${Math.round(totalCommission).toLocaleString()}`,
          icon: CreditCard,
          trendUp: true,
        },
        {
          title: "Processing Fees",
          value: `KES ${Math.round(totalConvenienceFees).toLocaleString()}`,
          icon: DollarSign,
          trendUp: true,
        },
        {
          title: "Caregiver Earnings",
          value: `KES ${Math.round(totalCaregiverEarnings).toLocaleString()}`,
          icon: User,
          trendUp: true,
        },
        {
          title: "Active Caregivers",
          value: uniqueCaregivers,
          icon: User,
          trendUp: true,
        },
        {
          title: "Total Patients",
          value: uniquePatients,
          icon: User,
          trendUp: true,
        },
        {
          title: "Completed Sessions",
          value: earnings.completedSessions || 0,
          icon: Clock,
          trendUp: true,
        },
      ];
    } else if (user?.role === 'caregiver') {
      const completedTransactions = transactions.filter((t: Transaction) => t.status === 'completed' && t.paymentType === 'session_fee');
      const netEarnings = completedTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.caregiverEarnings || 0), 0);
      const commissionDeducted = completedTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.platformCommissionAmount || 0), 0);

      return [
        {
          title: "Net Earnings",
          value: `KES ${Math.round(netEarnings).toLocaleString()}`,
          icon: DollarSign,
          trendUp: true,
        },
        {
          title: "Commission Deducted",
          value: `KES ${Math.round(commissionDeducted).toLocaleString()}`,
          icon: TrendingUp,
          trendUp: false,
        },
        {
          title: "Sessions Completed",
          value: completedTransactions.length,
          icon: Clock,
          trendUp: true,
        },
        {
          title: "Avg Earnings/Session",
          value: `KES ${completedTransactions.length > 0 ? Math.round(netEarnings / completedTransactions.length).toLocaleString() : 0}`,
          icon: CreditCard,
          trendUp: true,
        },
      ];
    } else {
      const totalSpent = transactions.reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount || '0'), 0);
      return [
        {
          title: "Total Spent",
          value: `KES ${totalSpent.toFixed(0)}`,
          icon: DollarSign,
          trendUp: false,
        },
        {
          title: "This Month",
          value: `KES ${(earnings.thisMonth || 0).toLocaleString()}`,
          icon: TrendingUp,
          trendUp: false,
        },
        {
          title: "Payments",
          value: transactions.filter((t: Transaction) => t.status === 'completed').length,
          icon: Clock,
          trendUp: false,
        },
        {
          title: "Avg/Payment",
          value: `MWK ${transactions.length > 0 ? (totalSpent / transactions.length).toFixed(0) : 0}`,
          icon: CreditCard,
          trendUp: true,
        },
      ];
    }
  };

  const stats = getStats();

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
    <ProtectedRoute requiredPermission="view_financial_reports">
      <DashboardLayout userRole={mapUserRole(user?.role || 'caregiver')}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={responsive.pageTitle}>
              {isAdmin ? 'Platform Earnings' : user?.role === 'caregiver' ? 'Earnings' : 'Payment History'}
            </h1>
            <p className={responsive.pageSubtitle}>
              {isAdmin
                ? 'Monitor all platform earnings and transactions'
                : user?.role === 'caregiver'
                ? 'Track your income and transactions'
                : 'View your healthcare payments'
              }
            </p>
          </div>
          <ExportButton
            data={transactions}
            columns={[
              {
                header: "Date",
                accessor: (row: Transaction) => new Date(row.createdAt).toLocaleDateString(),
              },
              {
                header: "Time",
                accessor: (row: Transaction) => new Date(row.createdAt).toLocaleTimeString(),
              },
              ...(isAdmin ? [
                {
                  header: "Caregiver",
                  accessor: (row: Transaction) => `${row.Appointment?.Caregiver?.User?.firstName} ${row.Appointment?.Caregiver?.User?.lastName}`,
                },
                {
                  header: "Caregiver Email",
                  accessor: (row: Transaction) => row.Appointment?.Caregiver?.User?.email || 'N/A',
                },
                {
                  header: "Caregiver Location",
                  accessor: (row: Transaction) => `${row.Appointment?.Caregiver?.district}, ${row.Appointment?.Caregiver?.region}`,
                },
              ] : user?.role === 'caregiver' ? [
                {
                  header: "Patient Location",
                  accessor: (row: Transaction) => `${row.Appointment?.Patient?.district || 'N/A'}, ${row.Appointment?.Patient?.region || 'N/A'}`,
                },
                {
                  header: "Patient TA",
                  accessor: (row: Transaction) => row.Appointment?.Patient?.traditionalAuthority || 'N/A',
                },
                {
                  header: "Patient Village",
                  accessor: (row: Transaction) => row.Appointment?.Patient?.village || 'N/A',
                },
              ] : []),
              {
                header: isAdmin ? "Patient" : user?.role === 'caregiver' ? "Patient" : "Caregiver",
                accessor: (row: Transaction) => isAdmin || user?.role === 'caregiver'
                  ? `${row.Appointment?.Patient?.User?.firstName} ${row.Appointment?.Patient?.User?.lastName}`
                  : `${row.Appointment?.Caregiver?.User?.firstName} ${row.Appointment?.Caregiver?.User?.lastName}`,
              },
              {
                header: "Email",
                accessor: (row: Transaction) => isAdmin || user?.role === 'caregiver'
                  ? row.Appointment?.Patient?.User?.email
                  : row.Appointment?.Caregiver?.User?.email,
              },
              {
                header: "Service",
                accessor: (row: Transaction) => row.Appointment?.Specialty?.name || 'General Care',
              },
              {
                header: "Duration",
                accessor: (row: Transaction) => row.Appointment?.duration || 180,
                format: (value: number) => `${value} min`,
              },
              {
                header: "Payment Type",
                accessor: (row: Transaction) => row.paymentType === 'booking_fee' ? 'Booking Fee' : 'Session Fee',
              },
              {
                header: "Payment Method",
                accessor: (row: Transaction) => row.paymentMethod || 'Card',
              },
              {
                header: "Base Fee",
                accessor: (row: Transaction) => row.baseFee || 0,
                format: (value: number) => `KES ${value.toLocaleString()}`,
              },
              ...(isAdmin ? [
                {
                  header: "Platform Commission",
                  accessor: (row: Transaction) => row.platformCommissionAmount || 0,
                  format: (value: number) => `KES ${value.toLocaleString()}`,
                },
                {
                  header: "Commission Rate",
                  accessor: (row: Transaction) => row.platformCommissionRate || 0,
                  format: (value: number) => `${value}%`,
                },
              ] : []),
              ...(user?.role === 'caregiver' ? [
                {
                  header: "Commission Deducted",
                  accessor: (row: Transaction) => row.platformCommissionAmount || 0,
                  format: (value: number) => `KES ${value.toLocaleString()}`,
                },
                {
                  header: "Net Earnings",
                  accessor: (row: Transaction) => row.caregiverEarnings || 0,
                  format: (value: number) => `KES ${value.toLocaleString()}`,
                },
              ] : []),
              {
                header: "Processing Fee",
                accessor: (row: Transaction) => row.convenienceFeeAmount || 0,
                format: (value: number) => `KES ${value.toLocaleString()}`,
              },
              {
                header: "Status",
                accessor: "status",
              },
              {
                header: "Total Amount",
                accessor: (row: Transaction) => parseFloat(row.amount || '0'),
                format: (value: number) => `KES ${value.toLocaleString()}`,
              },
              {
                header: "Currency",
                accessor: (row: Transaction) => row.currency || 'KES',
              },
              {
                header: "Transaction ID",
                accessor: (row: Transaction) => row.paystackReference || `TXN-${row.id}`,
              },
            ]}
            filename={`${isAdmin ? 'platform-earnings' : user?.role === 'caregiver' ? 'earnings' : 'payment-history'}-${new Date().toISOString().split('T')[0]}`}
            title={isAdmin ? 'Platform Earnings Report' : user?.role === 'caregiver' ? 'Earnings Report' : 'Payment History Report'}
          />
        </div>

        {/* Date Range Filter - Show for all users when custom period is selected */}
        {selectedPeriod === 'custom' && (
          <Card className={dashboardCard.base}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4" />
                <h3 className={responsive.cardTitle}>Date Range</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                  >
                    Clear Dates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {(isAdmin || user?.role === 'caregiver') && (
          <Card className={dashboardCard.base}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4" />
                <h3 className={responsive.cardTitle}>{isAdmin ? 'Filters' : 'Patient Filters'}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-8 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Period</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedPeriod === 'custom' && (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </>
                )}
                {isAdmin && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Caregiver</label>
                    <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <div className="relative">
                            <Search className="h-3 w-3 absolute left-2 top-2.5 text-muted-foreground" />
                            <Input
                              placeholder="Search caregivers..."
                              value={caregiverSearch}
                              onChange={(e) => setCaregiverSearch(e.target.value)}
                              className="h-8 text-xs pl-7"
                            />
                          </div>
                        </div>
                        <SelectItem value="all">All Caregivers</SelectItem>
                        {displayCaregivers?.filter((caregiver: Caregiver) => {
                          if (!caregiverSearch) return true;
                          const searchLower = caregiverSearch.toLowerCase();
                          const name = `${caregiver.User?.firstName} ${caregiver.User?.lastName}`.toLowerCase();
                          const email = caregiver.User?.email?.toLowerCase() || '';
                          return name.includes(searchLower) || email.includes(searchLower);
                        }).map((caregiver: Caregiver) => (
                          <SelectItem key={caregiver.id} value={caregiver.id.toString()}>
                            <div>
                              <div>{caregiver.User?.firstName} {caregiver.User?.lastName}</div>
                              <div className="text-xs text-muted-foreground">{caregiver.User?.email}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isAdmin ? 'Caregiver Region' : 'Patient Region'}
                  </label>
                  <Select value={selectedRegion} onValueChange={handleRegionChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {(isAdmin ? regions : patientRegions)?.map((region: string) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isAdmin ? 'Caregiver District' : 'Patient District'}
                  </label>
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {(isAdmin ? districts : patientDistricts)?.map((district: string) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isAdmin ? 'Caregiver TA' : 'Patient TA'}
                  </label>
                  <Select value={selectedTA} onValueChange={handleTAChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All TAs</SelectItem>
                      {(isAdmin ? traditionalAuthorities : patientTAs)?.map((ta: string) => (
                        <SelectItem key={ta} value={ta}>
                          {ta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Patient Search</label>
                  <div className="relative">
                    <Search className="h-3 w-3 absolute left-2 top-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Name or email..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="h-8 text-xs pl-7"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setSelectedPeriod('this-month');
                      setSelectedCaregiver('all');
                      setSelectedRegion('all');
                      setSelectedDistrict('all');
                      setSelectedTA('all');
                      setSelectedVillage('all');
                      setPatientSearch('');
                      setStartDate('');
                      setEndDate('');
                      setAppliedFilters({
                        period: 'this-month',
                        caregiver: 'all',
                        region: 'all',
                        district: 'all',
                        traditionalAuthority: 'all',
                        village: 'all',
                        patientSearch: '',
                        startDate: '',
                        endDate: ''
                      });
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Combined Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {stats.map((stat: StatItem) => (
            <Card key={stat.title} className={dashboardCard.base}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
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
          {transactions.length > 0 && (
            <>
              <Card className={dashboardCard.base}>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className={responsive.bodyMuted}>Total Transactions</p>
                    <p className={responsive.statValue}>{transactions.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCard.base}>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className={responsive.bodyMuted}>Completed</p>
                    <p className={`${responsive.statValue} text-success`}>
                      {transactions.filter((t: Transaction) => t.status === 'completed').length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCard.base}>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className={responsive.bodyMuted}>Pending</p>
                    <p className={`${responsive.statValue} text-warning`}>
                      {transactions.filter((t: Transaction) => t.status === 'pending').length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className={dashboardCard.base}>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className={responsive.bodyMuted}>Total Paid</p>
                    <p className={responsive.statValue}>
                      KES {transactions
                        .filter((t: Transaction) => t.status === 'completed')
                        .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount || '0'), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Transactions Table */}
        <Card className={dashboardCard.base}>
          <div className={`${dashboardCard.header} border-b`}>
            <div>
              <h2 className={responsive.cardTitle}>
                {isAdmin ? 'All Platform Transactions' : user?.role === 'caregiver' ? 'Recent Earnings' : 'Payment Transactions'}
              </h2>
              <p className={responsive.bodyMuted}>
                {isAdmin
                  ? 'Complete transaction history across all caregivers and patients'
                  : `View all your ${user?.role === 'caregiver' ? 'earnings' : 'payments'} and transaction details`
                }
              </p>
            </div>
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
                        {isAdmin ? 'Patient' : user?.role === 'caregiver' ? 'Patient' : 'Caregiver'}
                      </TableHead>
                      <TableHead className={dashboardCard.th}>Service</TableHead>
                      <TableHead className={dashboardCard.th}>Payment Type</TableHead>
                      <TableHead className={`${dashboardCard.th} text-right`}>Base Fee</TableHead>
                      <TableHead className={`${dashboardCard.th} text-right`}>Tax</TableHead>
                      <TableHead className={`${dashboardCard.th} text-right`}>Processing Fee</TableHead>
                      {isAdmin && <TableHead className={`${dashboardCard.th} text-right`}>Commission</TableHead>}
                      {user?.role === 'caregiver' && <TableHead className={`${dashboardCard.th} text-right`}>Commission</TableHead>}
                      {user?.role === 'caregiver' && <TableHead className={`${dashboardCard.th} text-right`}>Net Earnings</TableHead>}
                      <TableHead className={`${dashboardCard.th} text-right`}>Total</TableHead>
                      <TableHead className={dashboardCard.th}>Status</TableHead>
                      {(isAdmin || user?.role === 'caregiver') && <TableHead className={dashboardCard.th}>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {transactions.map((transaction: Transaction) => (
                    <TableRow key={transaction.id} className={dashboardCard.tr}>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </p>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
                              {transaction.Appointment?.Caregiver?.User?.firstName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <p className="text-xs font-medium">
                                {transaction.Appointment?.Caregiver?.User?.firstName} {transaction.Appointment?.Caregiver?.User?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {transaction.Appointment?.Caregiver?.district || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                            {isAdmin || user?.role === 'caregiver'
                              ? transaction.Appointment?.Patient?.User?.firstName?.charAt(0) || 'P'
                              : transaction.Appointment?.Caregiver?.User?.firstName?.charAt(0) || 'C'
                            }
                          </div>
                          <div>
                            <p className="text-xs font-medium">
                              {isAdmin || user?.role === 'caregiver'
                                ? `${transaction.Appointment?.Patient?.User?.firstName} ${transaction.Appointment?.Patient?.User?.lastName}`
                                : `${transaction.Appointment?.Caregiver?.User?.firstName} ${transaction.Appointment?.Caregiver?.User?.lastName}`
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isAdmin || user?.role === 'caregiver'
                                ? transaction.Appointment?.Patient?.User?.email
                                : `ID: ${transaction.paystackReference || `TXN-${transaction.id}`}`
                              }
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {transaction.Appointment?.Specialty?.name || 'General Care'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {transaction.paymentType === 'booking_fee' ? 'Booking' : 'Session'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        KES {(transaction.baseFee || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        —
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        KES {(transaction.convenienceFeeAmount || 0).toLocaleString()}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right text-xs">
                          KES {(transaction.platformCommissionAmount || 0).toLocaleString()}
                        </TableCell>
                      )}
                      {user?.role === 'caregiver' && (
                        <TableCell className="text-right text-xs text-red-600">
                          -KES {(transaction.platformCommissionAmount || 0).toLocaleString()}
                        </TableCell>
                      )}
                      {user?.role === 'caregiver' && (
                        <TableCell className="text-right text-xs font-semibold text-green-600">
                          KES {(transaction.caregiverEarnings || 0).toLocaleString()}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <p className="font-semibold text-xs">
                          KES {parseFloat(transaction.amount || 0).toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      {(isAdmin || user?.role === 'caregiver') && (
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
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Transaction Info</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>ID:</strong> {transaction.paystackReference || `TXN-${transaction.id}`}</p>
                                      <p><strong>Total Amount:</strong> KES {parseFloat(transaction.amount || '0').toLocaleString()}</p>
                                      <p><strong>Status:</strong> {transaction.status}</p>
                                      <p><strong>Method:</strong> {transaction.paymentMethod || 'N/A'}</p>
                                      <p><strong>Type:</strong> {transaction.paymentType === 'booking_fee' ? 'Booking Fee' : 'Session Fee'}</p>
                                      <p><strong>Date:</strong> {new Date(transaction.createdAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Fee Breakdown</h4>
                                    <div className="space-y-1 text-sm">
                                      {transaction.baseFee !== undefined && (
                                        <p><strong>Base Fee:</strong> KES {(transaction.baseFee || 0).toLocaleString()}</p>
                                      )}
                                      {transaction.convenienceFeeAmount !== undefined && (
                                        <p><strong>Processing ({transaction.convenienceFeeRate}%):</strong> KES {(transaction.convenienceFeeAmount || 0).toLocaleString()}</p>
                                      )}
                                      {transaction.platformCommissionAmount !== undefined && transaction.platformCommissionAmount > 0 && (
                                        <p><strong>Platform Commission ({transaction.platformCommissionRate}%):</strong> KES {(transaction.platformCommissionAmount || 0).toLocaleString()}</p>
                                      )}
                                      {transaction.caregiverEarnings !== undefined && transaction.caregiverEarnings > 0 && (
                                        <p className="text-green-600"><strong>Caregiver Earnings:</strong> KES {(transaction.caregiverEarnings || 0).toLocaleString()}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Appointment Info</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>Service:</strong> {transaction.Appointment?.Specialty?.name}</p>
                                      <p><strong>Duration:</strong> {transaction.Appointment?.duration || 180} min</p>
                                      <p><strong>Type:</strong> {transaction.Appointment?.sessionType}</p>
                                      <p><strong>Date:</strong> {transaction.Appointment?.scheduledDate ? new Date(transaction.Appointment.scheduledDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Patient Details</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>Name:</strong> {transaction.Appointment?.Patient?.User?.firstName} {transaction.Appointment?.Patient?.User?.lastName}</p>
                                      <p><strong>Email:</strong> {transaction.Appointment?.Patient?.User?.email}</p>
                                      <p><strong>Phone:</strong> {transaction.Appointment?.Patient?.User?.phone}</p>
                                      {user?.role === 'caregiver' && (
                                        <>
                                          <p><strong>Location:</strong> {transaction.Appointment?.Patient?.district}, {transaction.Appointment?.Patient?.region}</p>
                                          <p><strong>TA:</strong> {transaction.Appointment?.Patient?.traditionalAuthority}</p>
                                          <p><strong>Village:</strong> {transaction.Appointment?.Patient?.village}</p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {isAdmin && (
                                    <div>
                                      <h4 className="font-medium mb-2">Caregiver Details</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Name:</strong> {transaction.Appointment?.Caregiver?.User?.firstName} {transaction.Appointment?.Caregiver?.User?.lastName}</p>
                                        <p><strong>Location:</strong> {transaction.Appointment?.Caregiver?.district}, {transaction.Appointment?.Caregiver?.region}</p>
                                        <p><strong>Specialty:</strong> {transaction.Appointment?.Specialty?.name}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
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
                  {user?.role === 'caregiver'
                    ? 'Your earnings from completed sessions will appear here'
                    : 'Your payment transactions will appear here'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Pagination */}
        {transactions.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={responsive.bodyMuted}>Rows per page:</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className={responsive.bodyMuted}>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
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
