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
import { Wallet, Search, Users, TrendingUp, Eye, CheckCircle, Clock, AlertCircle, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { dashboardCard, responsive } from '@/theme';

const AdminWithdrawalsPage = () => {
  const navigate = useNavigate();

  const [overviewPage, setOverviewPage] = useState(1);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [settlementsPage, setSettlementsPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  // Caregiver earnings overview
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin-earnings-overview', overviewPage, search, regionFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: overviewPage.toString(),
        limit: '20',
        ...(search && { search }),
        ...(regionFilter !== 'all' && { region: regionFilter })
      });
      const res = await api.get(`/admin/withdrawals/overview?${params}`);
      return res.data;
    }
  });

  // All settlements history
  const { data: settlementsData, isLoading: settlementsLoading } = useQuery({
    queryKey: ['admin-all-settlements', settlementsPage, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: settlementsPage.toString(),
        limit: '30',
        ...(statusFilter !== 'all' && { status: statusFilter })
      });
      const res = await api.get(`/admin/settlements?${params}`);
      return res.data;
    }
  });

  const caregivers = overviewData?.caregivers || [];
  const overviewPagination = overviewData?.pagination || {};
  const settlements = settlementsData?.settlements || [];
  const settlementsPagination = settlementsData?.pagination || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-3 md:space-y-4">
        <div>
          <h1 className={responsive.pageTitle}>Caregiver Settlements</h1>
          <p className={responsive.pageSubtitle}>Monitor caregiver earnings and Paystack settlement activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Total Caregivers</p>
                <p className={dashboardCard.compactStatValue}>{overviewPagination.totalRecords || 0}</p>
              </div>
              <div className={dashboardCard.iconWell.primary}><Users className="h-4 w-4 text-primary" /></div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Total Earnings (Platform)</p>
                <p className={dashboardCard.compactStatValue}>
                  KES {Number(overviewData?.totalEarnings || 0).toLocaleString()}
                </p>
              </div>
              <div className={dashboardCard.iconWell.success}><Wallet className="h-4 w-4 text-success" /></div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Subaccounts Registered</p>
                <p className={dashboardCard.compactStatValue}>{overviewData?.subaccountCount || 0}</p>
              </div>
              <div className={dashboardCard.iconWell.secondary}><Building2 className="h-4 w-4 text-secondary" /></div>
            </CardContent>
          </Card>
          <Card className={dashboardCard.base}>
            <CardContent className={dashboardCard.compactStatContent}>
              <div>
                <p className={responsive.bodyMuted}>Total Settlements</p>
                <p className={dashboardCard.compactStatValue}>{settlementsPagination.totalRecords || 0}</p>
              </div>
              <div className={dashboardCard.iconWell.accent}><TrendingUp className="h-4 w-4 text-accent" /></div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="balances">
          <TabsList>
            <TabsTrigger value="balances">Caregiver Balances</TabsTrigger>
            <TabsTrigger value="settlements">All Settlements</TabsTrigger>
          </TabsList>

          {/* Caregiver Balances Tab */}
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
                  <SelectItem value="Nairobi">Nairobi</SelectItem>
                  <SelectItem value="Mombasa">Mombasa</SelectItem>
                  <SelectItem value="Kisumu">Kisumu</SelectItem>
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
                            <TableHead>Subaccount</TableHead>
                            <TableHead className="text-right">Total Earnings</TableHead>
                            <TableHead className="text-right">Wallet Balance</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {caregivers.map((cg: any) => (
                            <TableRow key={cg.id}>
                              <TableCell>
                                <p className="font-medium">{cg.name}</p>
                                <p className="text-xs text-muted-foreground">{cg.email}</p>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm">{cg.region || '—'}</p>
                                <p className="text-xs text-muted-foreground">{cg.district || '—'}</p>
                              </TableCell>
                              <TableCell>
                                {cg.subaccountCode ? (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {cg.subaccountCode}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Not set up
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                KES {Number(cg.totalEarnings || 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-sm font-semibold ${Number(cg.availableBalance) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                  KES {Number(cg.availableBalance || 0).toLocaleString()}
                                </span>
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

          {/* All Settlements Tab */}
          <TabsContent value="settlements" className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setSettlementsPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="settled">Settled</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className={dashboardCard.base}>
              <CardContent className="p-0 overflow-hidden">
                {settlementsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : settlements.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No settlements found</p>
                  </div>
                ) : (
                  <>
                    <div className={dashboardCard.tableWrapper}>
                      <Table className={dashboardCard.tableMinWidth}>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Settlement ID</TableHead>
                            <TableHead>Caregiver</TableHead>
                            <TableHead>Subaccount</TableHead>
                            <TableHead>Settled At</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Fees</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {settlements.map((s: any) => (
                            <TableRow key={s.id}>
                              <TableCell className="text-xs font-mono">{s.paystackSettlementId}</TableCell>
                              <TableCell>
                                <p className="text-sm font-medium">{s.Caregiver?.User?.firstName} {s.Caregiver?.User?.lastName}</p>
                                <p className="text-xs text-muted-foreground">{s.Caregiver?.User?.email}</p>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{s.subaccountCode}</TableCell>
                              <TableCell className="text-sm">{s.settledAt ? new Date(s.settledAt).toLocaleDateString() : '—'}</TableCell>
                              <TableCell className="text-right font-medium">KES {Number(s.amount).toLocaleString()}</TableCell>
                              <TableCell className="text-right text-muted-foreground">KES {Number(s.totalFees || 0).toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(s.status)}>
                                  {s.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        {settlementsPagination.totalRecords > 0
                          ? `Showing ${(settlementsPage - 1) * 30 + 1}–${Math.min(settlementsPage * 30, settlementsPagination.totalRecords)} of ${settlementsPagination.totalRecords}`
                          : 'No records'}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSettlementsPage(p => p - 1)} disabled={settlementsPage <= 1}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => setSettlementsPage(p => p + 1)} disabled={settlementsPage >= (settlementsPagination.totalPages || 1)}>Next</Button>
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
