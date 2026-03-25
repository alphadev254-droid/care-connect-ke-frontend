import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, RefreshCw, CheckCircle, Clock, AlertCircle, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { settlementsService } from '@/services/settlementsService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { dashboardCard, responsive } from '@/theme';

const WithdrawalsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [businessName, setBusinessName] = useState('');
  const [settlementBank, setSettlementBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [settlementsPage, setSettlementsPage] = useState(1);

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['caregiver-balance', user?.id],
    queryFn: () => settlementsService.getBalance(),
    enabled: !!user?.id
  });

  const { data: subaccountData, isLoading: subaccountLoading } = useQuery({
    queryKey: ['my-subaccount', user?.id],
    queryFn: () => settlementsService.getMySubaccount(),
    enabled: !!user?.id
  });

  const { data: banksData } = useQuery({
    queryKey: ['paystack-banks'],
    queryFn: () => settlementsService.getBanks(),
  });

  const { data: settlementsData, isLoading: settlementsLoading } = useQuery({
    queryKey: ['my-settlements', user?.id, settlementsPage],
    queryFn: () => settlementsService.getSettlements(settlementsPage),
    enabled: !!user?.id
  });

  const saveMutation = useMutation({
    mutationFn: settlementsService.saveSubaccount,
    onSuccess: (data) => {
      toast.success(data.message || 'Bank details saved successfully');
      queryClient.invalidateQueries({ queryKey: ['my-subaccount'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to save bank details');
    }
  });

  const syncMutation = useMutation({
    mutationFn: settlementsService.syncSettlements,
    onSuccess: (data) => {
      toast.success(data.message || 'Settlements synced');
      queryClient.invalidateQueries({ queryKey: ['my-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['caregiver-balance'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to sync settlements');
    }
  });

  const subaccount = subaccountData?.subaccount;
  const balance = balanceData;
  const settlements = settlementsData?.settlements || [];
  const pagination = settlementsData?.pagination || {};
  const banks = banksData?.banks || [];

  const handleSaveSubaccount = () => {
    if (!businessName || !settlementBank || !accountNumber) {
      toast.error('Business name, bank, and account number are required');
      return;
    }
    saveMutation.mutate({ businessName, settlementBank, accountNumber, accountName });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <DashboardLayout userRole="caregiver">
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={responsive.pageTitle}>Settlements & Bank Details</h1>
            <p className={responsive.pageSubtitle}>Manage your bank account and view Paystack settlements</p>
          </div>
        </div>

        {/* Balance Card */}
        <Card className={dashboardCard.base}>
          <CardHeader className={dashboardCard.header}>
            <CardTitle className={`flex items-center gap-2 ${responsive.cardTitle}`}>
              <Wallet className="h-5 w-5 text-primary" />
              Wallet Balance
            </CardTitle>
            <CardDescription className={responsive.cardDesc}>Your earnings tracked on platform</CardDescription>
          </CardHeader>
          <CardContent className={dashboardCard.body}>
            {balanceLoading ? (
              <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading...</span></div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className={dashboardCard.balanceBlockPrimary}>
                  <p className={responsive.bodyMuted}>Total Earnings</p>
                  <p className={`${dashboardCard.compactBalanceValue} text-primary`}>
                    KES {balance?.totalEarnings || '0.00'}
                  </p>
                </div>
                <div className={dashboardCard.balanceBlockSuccess}>
                  <p className={responsive.bodyMuted}>Wallet Balance</p>
                  <p className={`${dashboardCard.compactBalanceValue} text-success`}>
                    KES {balance?.availableBalance || '0.00'}
                  </p>
                  <p className={responsive.bodyMuted}>Paystack settles directly to your bank</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Setup */}
        <Card className={dashboardCard.base}>
          <CardHeader className={dashboardCard.header}>
            <CardTitle className={`flex items-center gap-2 ${responsive.cardTitle}`}>
              <Building2 className="h-5 w-5 text-primary" />
              {subaccount ? 'Bank Account (Registered)' : 'Set Up Bank Account'}
            </CardTitle>
            <CardDescription className={responsive.cardDesc}>
              {subaccount
                ? `Subaccount: ${subaccount.subaccountCode} · ${subaccount.businessName}`
                : 'Register your bank account to receive Paystack settlements'}
            </CardDescription>
          </CardHeader>
          <CardContent className={dashboardCard.body}>
            {subaccountLoading ? (
              <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading...</span></div>
            ) : (
              <div className="space-y-4 max-w-md">
                {subaccount && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm space-y-1">
                    <p><strong>Bank:</strong> {subaccount.settlementBank}</p>
                    <p><strong>Account:</strong> {subaccount.accountNumber}</p>
                    {subaccount.accountName && <p><strong>Name:</strong> {subaccount.accountName}</p>}
                    <p><strong>Split:</strong> {subaccount.percentageCharge}% to your account</p>
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <Label>Business / Account Name</Label>
                    <Input
                      placeholder="e.g. Jane Doe Healthcare"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Bank</Label>
                    <Select value={settlementBank} onValueChange={setSettlementBank}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((b) => (
                          <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input
                      placeholder="Enter account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Account Holder Name (optional)</Label>
                    <Input
                      placeholder="As it appears on the account"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSaveSubaccount} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : subaccount ? 'Update Bank Details' : 'Save Bank Details'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settlements History */}
        <Card className={dashboardCard.base}>
          <CardHeader className={dashboardCard.header}>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle className={responsive.cardTitle}>Settlement History</CardTitle>
                <CardDescription className={responsive.cardDesc}>Paystack settlements to your bank account</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                {syncMutation.isPending
                  ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Syncing...</>
                  : <><RefreshCw className="h-3 w-3 mr-1" />Sync</>}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            {settlementsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : settlements.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold text-sm mb-1">No settlements yet</h3>
                <p className="text-xs text-muted-foreground">Paystack settlements will appear here once processed</p>
              </div>
            ) : (
              <>
                <div className={dashboardCard.tableWrapper}>
                  <Table className={dashboardCard.tableMinWidth}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={dashboardCard.th}>Settlement ID</TableHead>
                        <TableHead className={dashboardCard.th}>Settled At</TableHead>
                        <TableHead className={`${dashboardCard.th} text-right`}>Amount</TableHead>
                        <TableHead className={`${dashboardCard.th} text-right`}>Fees</TableHead>
                        <TableHead className={dashboardCard.th}>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settlements.map((s: any) => (
                        <TableRow key={s.id} className={dashboardCard.tr}>
                          <TableCell className="text-xs font-mono">{s.paystackSettlementId}</TableCell>
                          <TableCell className="text-xs">
                            {s.settledAt ? new Date(s.settledAt).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold">
                            KES {Number(s.amount).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            KES {Number(s.totalFees || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(s.status)}>
                              <span className="flex items-center gap-1 text-xs">
                                {s.status === 'settled' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                {s.status}
                              </span>
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSettlementsPage(p => p - 1)} disabled={settlementsPage <= 1}>Previous</Button>
                      <Button variant="outline" size="sm" onClick={() => setSettlementsPage(p => p + 1)} disabled={settlementsPage >= pagination.totalPages}>Next</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WithdrawalsPage;
