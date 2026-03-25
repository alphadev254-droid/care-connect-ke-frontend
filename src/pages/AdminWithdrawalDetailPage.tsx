import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Wallet, TrendingUp, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'settled': return 'bg-green-100 text-green-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

const AdminWithdrawalDetailPage = () => {
  const { caregiverId } = useParams<{ caregiverId: string }>();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: caregiverInfo, isLoading: infoLoading } = useQuery({
    queryKey: ['admin-caregiver-detail', caregiverId],
    queryFn: async () => {
      const res = await api.get(`/admin/withdrawals/overview?caregiverId=${caregiverId}`);
      return res.data.caregivers?.[0] || null;
    },
    enabled: !!caregiverId
  });

  const { data: settlementsData, isLoading: settlementsLoading } = useQuery({
    queryKey: ['admin-caregiver-settlements', caregiverId, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        caregiverId: caregiverId!,
        page: page.toString(),
        limit: '30',
        ...(statusFilter !== 'all' && { status: statusFilter })
      });
      const res = await api.get(`/admin/settlements?${params}`);
      return res.data;
    },
    enabled: !!caregiverId
  });

  const caregiver = caregiverInfo;
  const settlements = settlementsData?.settlements || [];
  const pagination = settlementsData?.pagination || {};

  if (infoLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!caregiver) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Caregiver not found</p>
          <Button variant="outline" onClick={() => navigate('/dashboard/admin/withdrawals')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" className="mt-0.5" onClick={() => navigate('/dashboard/admin/withdrawals')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{caregiver.name}</h1>
          <p className="text-muted-foreground">{caregiver.email} · {caregiver.region || '—'}, {caregiver.district || '—'}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">KES {Number(caregiver.totalEarnings || 0).toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-2xl font-bold text-green-600">KES {Number(caregiver.availableBalance || 0).toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subaccount</p>
                  <p className="text-sm font-mono font-bold mt-1">{caregiver.subaccountCode || 'Not registered'}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Settlements</p>
                  <p className="text-2xl font-bold">{pagination.totalRecords || 0}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settlements History */}
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
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

        <Card>
          <CardContent className="p-0">
            {settlementsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : settlements.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No settlements found</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Settlement ID</TableHead>
                      <TableHead>Settled At</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Fees</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlements.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-sm font-mono">{s.paystackSettlementId}</TableCell>
                        <TableCell className="text-sm">{s.settledAt ? new Date(s.settledAt).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-right font-medium">KES {Number(s.amount).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">KES {Number(s.totalFees || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(s.status)}>
                            <span className="flex items-center gap-1">
                              {s.status === 'settled' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              {s.status}
                            </span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    {pagination.totalRecords > 0
                      ? `Showing ${(page - 1) * 30 + 1}–${Math.min(page * 30, pagination.totalRecords)} of ${pagination.totalRecords}`
                      : 'No records'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= (pagination.totalPages || 1)}>Next</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminWithdrawalDetailPage;
