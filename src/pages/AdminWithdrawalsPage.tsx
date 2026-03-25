import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, CheckCircle, Clock, AlertCircle, Loader2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { dashboardCard, responsive } from '@/theme';

const AdminSettlementsPage = () => {
  const queryClient = useQueryClient();

  // ── Filter state (staged — applied on button click) ───────────────────
  const [search,     setSearch]     = useState('');
  const [region,     setRegion]     = useState('all');
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [page,       setPage]       = useState(1);
  const [limit]                     = useState(100);

  const [applied, setApplied] = useState({
    search: '', region: 'all', startDate: '', endDate: '',
  });

  const applyFilters = () => {
    setApplied({ search, region, startDate, endDate });
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(''); setRegion('all'); setStartDate(''); setEndDate('');
    setApplied({ search: '', region: 'all', startDate: '', endDate: '' });
    setPage(1);
  };

  // ── Query ─────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['admin-settlements', applied, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page:  page.toString(),
        limit: limit.toString(),
        ...(applied.search                 && { search:     applied.search }),
        ...(applied.region !== 'all'       && { region:     applied.region }),
        ...(applied.startDate              && { startDate:  applied.startDate }),
        ...(applied.endDate                && { endDate:    applied.endDate }),
      });
      const res = await api.get(`/admin/withdrawals/overview?${params}`);
      return res.data;
    },
  });

  const settlements  = data?.settlements  || [];
  const pagination   = data?.pagination   || {};

  // ── Sync mutation — per caregiver ─────────────────────────────────────
  const syncMutation = useMutation({
    mutationFn: (caregiverId: string | number) =>
      api.post(`/admin/withdrawals/sync/${caregiverId}`).then(r => r.data),
    onSuccess: (data) => {
      toast.success(data.message || 'Settlements synced');
      queryClient.invalidateQueries({ queryKey: ['admin-settlements'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Sync failed');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'settled':
        return <Badge className="bg-green-100 text-green-800 text-xs gap-1"><CheckCircle className="h-3 w-3" />Settled</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 text-xs gap-1"><Clock className="h-3 w-3" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 text-xs gap-1"><AlertCircle className="h-3 w-3" />Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-3 md:space-y-4">

        {/* Header */}
        <div>
          <h1 className={responsive.pageTitle}>Caregiver Settlements</h1>
          <p className={responsive.pageSubtitle}>
            View Paystack settlement activity per caregiver subaccount
          </p>
        </div>

        {/* Filters */}
        <Card className={dashboardCard.base}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className={responsive.cardTitle}>Filters</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

              {/* Search */}
              <div className="lg:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Search caregiver</label>
                <div className="relative">
                  <Search className="h-3 w-3 absolute left-2 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyFilters()}
                    className="h-8 text-xs pl-7"
                  />
                </div>
              </div>

              {/* Region */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Region</label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="Nairobi">Nairobi</SelectItem>
                    <SelectItem value="Mombasa">Mombasa</SelectItem>
                    <SelectItem value="Kisumu">Kisumu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date range */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex items-end gap-2">
                <Button variant="default" size="sm" className="h-8 text-xs" onClick={applyFilters}>Apply</Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={clearFilters}>Clear</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className={dashboardCard.base}>
          <div className={`${dashboardCard.header} border-b`}>
            <h2 className={responsive.cardTitle}>Settlement Records</h2>
            <p className={responsive.bodyMuted}>
              {pagination.totalRecords
                ? `${pagination.totalRecords} records · page ${pagination.currentPage} of ${pagination.totalPages}`
                : ''}
            </p>
          </div>

          <CardContent className="p-0 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : settlements.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm font-medium mb-1">No settlements found</p>
                <p className="text-xs text-muted-foreground">Try adjusting filters or syncing a caregiver</p>
              </div>
            ) : (
              <div className={dashboardCard.tableWrapper}>
                <Table className={dashboardCard.tableMinWidth}>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className={dashboardCard.th}>Settlement ID</TableHead>
                      <TableHead className={dashboardCard.th}>Caregiver</TableHead>
                      <TableHead className={dashboardCard.th}>Subaccount</TableHead>
                      <TableHead className={dashboardCard.th}>Bank Details</TableHead>
                      <TableHead className={dashboardCard.th}>Settled At</TableHead>
                      <TableHead className={`${dashboardCard.th} text-right`}>Amount</TableHead>
                      <TableHead className={`${dashboardCard.th} text-right`}>Fees</TableHead>
                      <TableHead className={dashboardCard.th}>Status</TableHead>
                      <TableHead className={dashboardCard.th}>Sync</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlements.map((s: any) => (
                      <TableRow key={s.id} className={dashboardCard.tr}>

                        {/* Settlement ID */}
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {s.paystackSettlementId || `STL-${s.id.slice(0, 8)}`}
                        </TableCell>

                        {/* Caregiver */}
                        <TableCell>
                          <p className="text-xs font-medium">
                            {s.Caregiver?.User?.firstName} {s.Caregiver?.User?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.Caregiver?.User?.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.Caregiver?.district}, {s.Caregiver?.region}
                          </p>
                        </TableCell>

                        {/* Subaccount code — unmasked for admin */}
                        <TableCell>
                          {s.Caregiver?.PaystackSubaccount ? (
                            <div>
                              <p className="text-xs font-mono font-medium">
                                {s.Caregiver.PaystackSubaccount.subaccountCode}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {s.Caregiver.PaystackSubaccount.businessName}
                              </p>
                              <Badge
                                className={`text-xs mt-0.5 ${s.Caregiver.PaystackSubaccount.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                              >
                                {s.Caregiver.PaystackSubaccount.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          ) : (
                            // Fallback — settlement's own subaccountCode column
                            <p className="text-xs font-mono text-muted-foreground">{s.subaccountCode || '—'}</p>
                          )}
                        </TableCell>

                        {/* Bank details */}
                        <TableCell>
                          {s.Caregiver?.PaystackSubaccount ? (
                            <div>
                              <p className="text-xs font-medium">
                                {s.Caregiver.PaystackSubaccount.settlementBank}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {s.Caregiver.PaystackSubaccount.accountNumber}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Settled at */}
                        <TableCell className="text-xs">
                          {s.settledAt ? new Date(s.settledAt).toLocaleDateString() : '—'}
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-right text-xs font-semibold">
                          KES {Number(s.amount).toLocaleString()}
                        </TableCell>

                        {/* Fees */}
                        <TableCell className="text-right text-xs text-muted-foreground">
                          KES {Number(s.totalFees || 0).toLocaleString()}
                        </TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(s.status)}</TableCell>

                        {/* Per-caregiver sync */}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            disabled={syncMutation.isPending}
                            onClick={() => syncMutation.mutate(s.caregiverId)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Sync
                          </Button>
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                {`Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, pagination.totalRecords)} of ${pagination.totalRecords}`}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(1)}          disabled={page <= 1}>First</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}>Next</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(pagination.totalPages)} disabled={page >= pagination.totalPages}>Last</Button>
              </div>
            </div>
          )}
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default AdminSettlementsPage;