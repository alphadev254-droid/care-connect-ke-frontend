import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Search, Users, TrendingUp, ArrowDownToLine, Eye, CheckCircle, XCircle, Clock, AlertCircle, Lock, Landmark, Banknote } from 'lucide-react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { dashboardCard, responsive } from '@/theme';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-3.5 w-3.5" />;
    case 'failed': return <XCircle className="h-3.5 w-3.5" />;
    case 'processing': return <Clock className="h-3.5 w-3.5" />;
    default: return <AlertCircle className="h-3.5 w-3.5" />;
  }
};

const AdminWithdrawalsPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const [overviewPage, setOverviewPage] = useState(1);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

  const [historyPage, setHistoryPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  // Stats summary
  const { data: statsData } = useQuery({
    queryKey: ['admin-withdrawal-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/withdrawals/stats');
      return res.data.stats;
    }
  });

  // PayChangu live balance (only fetch if user has permission)
  const canViewPaychangu = hasPermission('view_paychangu_balance');
  const { data: paychanguBalance } = useQuery({
    queryKey: ['paychangu-balance'],
    queryFn: async () => {
      const res = await api.get('/admin/withdrawals/paychangu-balance');
      return res.data.balance;
    },
    refetchInterval: 60000,
    enabled: canViewPaychangu
  });

  // Caregiver balances overview
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin-withdrawal-overview', overviewPage, search, regionFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: overviewPage.toString(),
        limit: '20',
        search,
        ...(regionFilter !== 'all' && { region: regionFilter })
      });
      const res = await api.get(`/admin/withdrawals/overview?${params}`);
      return res.data;
    }
  });

  // All withdrawals history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['admin-withdrawal-history', historyPage, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: historyPage.toString(),
        limit: '30',
        ...(statusFilter !== 'all' && { status: statusFilter })
      });
      const res = await api.get(`/admin/withdrawals/history?${params}`);
      return res.data;
    }
  });

  const caregivers = overviewData?.caregivers || [];
  const overviewPagination = overviewData?.pagination || {};

  const withdrawals = historyData?.withdrawals || [];
  const historyPagination = historyData?.pagination || {};

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-3 md:space-y-4">
        <div>
          <h1 className={responsive.pageTitle}>Caregiver Withdrawals</h1>
          <p className={responsive.pageSubtitle}>Monitor all caregiver earnings, balances, and withdrawal activities</p>
        </div>

        {/* PayChangu Live Balance */}
        {canViewPaychangu && paychanguBalance && (
          <div className={dashboardCard.compactStatGrid}>
            <Card className={dashboardCard.base}>
              <CardContent className={dashboardCard.compactStatContent}>
                <div>
                  <p className={responsive.bodyMuted}>PayChangu Main Balance</p>
                  <p className={`${dashboardCard.compactBalanceValue} text-primary`}>
                    MWK {Number(paychanguBalance.main_balance || 0).toLocaleString()}
                  </p>
                  <p className={`${responsive.bodyMuted} mt-0.5`}>Available for payouts</p>
                </div>
                <div className={dashboardCard.iconWell.primary}>
                  <Landmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className={dashboardCard.base}>
              <CardContent className={dashboardCard.compactStatContent}>
                <div>
                  <p className={responsive.bodyMuted}>PayChangu Collection Balance</p>
                  <p className={`${dashboardCard.compactBalanceValue} text-primary`}>
                    MWK {Number(paychanguBalance.collection_balance || 0).toLocaleString()}
                  </p>
                  <p className={`${responsive.bodyMuted} mt-0.5`}>Pending settlement</p>
                </div>
                <div className={dashboardCard.iconWell.primary}>
                  <Banknote className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className={dashboardCard.base}>
              <CardContent className={dashboardCard.compactStatContent}>
                <div>
                  <p className={responsive.bodyMuted}>Environment</p>
                  <p className={`${dashboardCard.compactBalanceValue} text-primary capitalize`}>{paychanguBalance.environment}</p>
                  <p className={`${responsive.bodyMuted} mt-0.5`}>{paychanguBalance.currency} account</p>
                </div>
                <div className={dashboardCard.iconWell.primary}>
                  <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Total Caregivers</p>
                <p className={dashboardCard.compactStatValue}>{overviewPagination.totalRecords || 0}</p>
              </div>
              <div className={dashboardCard.iconWell.primary}>
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Total Available</p>
                <p className={dashboardCard.compactStatValue}>MWK {Number(statsData?.totalAvailableBalance || 0).toLocaleString()}</p>
              </div>
              <div className={dashboardCard.iconWell.success}>
                <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Locked (Pending Reports)</p>
                <p className={`${dashboardCard.compactStatValue} text-warning`}>MWK {Number(statsData?.totalLockedBalance || 0).toLocaleString()}</p>
              </div>
              <div className={dashboardCard.iconWell.warning}>
                <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Total Paid Out</p>
                <p className={dashboardCard.compactStatValue}>MWK {Number(statsData?.totalProcessed || 0).toLocaleString()}</p>
              </div>
              <div className={dashboardCard.iconWell.secondary}>
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Pending</p>
                <p className={dashboardCard.compactStatValue}>MWK {Number(statsData?.totalPending || 0).toLocaleString()}</p>
              </div>
              <div className={dashboardCard.iconWell.accent}>
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="balances">
          <TabsList>
            <TabsTrigger value="balances">Caregiver Balances</TabsTrigger>
            <TabsTrigger value="withdrawals">All Withdrawals</TabsTrigger>
          </TabsList>

          {/* ── Caregiver Balances Tab ── */}
          <TabsContent value="balances" className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setOverviewPage(1); }}
                  className="pl-10"
                />
              </div>
              <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v); setOverviewPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  <SelectItem value="Northern">Northern</SelectItem>
                  <SelectItem value="Central">Central</SelectItem>
                  <SelectItem value="Southern">Southern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className={dashboardCard.base}>
              <CardContent className="p-0 overflow-hidden">
                {overviewLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : caregivers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No caregivers found</p>
                  </div>
                ) : (
                  <>
                    <div className={dashboardCard.tableWrapper}>
                    <Table className={dashboardCard.tableMinWidth}>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Caregiver</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead className="text-right">Total Earnings</TableHead>
                          <TableHead className="text-right">Available</TableHead>
                          <TableHead className="text-right">Locked</TableHead>
                          <TableHead className="text-right">Withdrawn</TableHead>
                          <TableHead className="text-center">Count</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caregivers.map((cg: any) => (
                          <TableRow key={cg.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{cg.name}</p>
                                <p className="text-xs text-muted-foreground">{cg.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{cg.region || '—'}</p>
                              <p className="text-xs text-muted-foreground">{cg.district || '—'}</p>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {Number(cg.totalEarnings).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-sm font-semibold ${Number(cg.availableBalance) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {Number(cg.availableBalance).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(cg.lockedBalance) > 0 ? (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                                  {Number(cg.lockedBalance).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {Number(cg.totalWithdrawn).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {cg.totalWithdrawals}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/dashboard/admin/withdrawals/${cg.id}`)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        {overviewPagination.totalRecords > 0
                          ? `Showing ${(overviewPage - 1) * 20 + 1}–${Math.min(overviewPage * 20, overviewPagination.totalRecords)} of ${overviewPagination.totalRecords}`
                          : 'No records'}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setOverviewPage(p => p - 1)} disabled={overviewPage <= 1}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => setOverviewPage(p => p + 1)} disabled={overviewPage >= (overviewPagination.totalPages || 1)}>Next</Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── All Withdrawals Tab ── */}
          <TabsContent value="withdrawals" className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setHistoryPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className={dashboardCard.base}>
              <CardContent className="p-0 overflow-hidden">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : withdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowDownToLine className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No withdrawals found</p>
                  </div>
                ) : (
                  <>
                    <div className={dashboardCard.tableWrapper}>
                    <Table className={dashboardCard.tableMinWidth}>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Caregiver</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Fee</TableHead>
                          <TableHead className="text-right">Net Payout</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawals.map((w: any) => (
                          <TableRow key={w.id}>
                            <TableCell className="text-sm">{new Date(w.requestedAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <p className="text-sm font-medium">{w.Caregiver?.User?.firstName} {w.Caregiver?.User?.lastName}</p>
                              <p className="text-xs text-muted-foreground">{w.Caregiver?.User?.email}</p>
                            </TableCell>
                            <TableCell className="text-right font-medium">{Number(w.requestedAmount).toLocaleString()}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{Number(w.withdrawalFee).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium">{Number(w.netPayout).toLocaleString()}</TableCell>
                            <TableCell className="text-sm capitalize">{w.recipientType?.replace('_', ' ')}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(w.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(w.status)}
                                  {w.status}
                                </span>
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        {historyPagination.totalRecords > 0
                          ? `Showing ${(historyPage - 1) * 30 + 1}–${Math.min(historyPage * 30, historyPagination.totalRecords)} of ${historyPagination.totalRecords}`
                          : 'No records'}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setHistoryPage(p => p - 1)} disabled={historyPage <= 1}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => setHistoryPage(p => p + 1)} disabled={historyPage >= (historyPagination.totalPages || 1)}>Next</Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminWithdrawalsPage;
