import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, ArrowDownToLine, Clock, CheckCircle, XCircle, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { withdrawalService } from '@/services/withdrawalService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { dashboardCard, responsive } from '@/theme';

const WithdrawalsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [recipientType, setRecipientType] = useState('mobile_money');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [withdrawalToken, setWithdrawalToken] = useState('');
  const [tokenSent, setTokenSent] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch balance using React Query
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['caregiver-balance', user?.id],
    queryFn: () => withdrawalService.getBalance(),
    enabled: !!user?.id
  });

  // Fetch withdrawal history using React Query
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['withdrawal-history', user?.id],
    queryFn: () => withdrawalService.getHistory(),
    enabled: !!user?.id
  });

  // Token request mutation
  const tokenMutation = useMutation({
    mutationFn: withdrawalService.requestWithdrawalToken,
    onSuccess: () => {
      setTokenSent(true);
      setTokenExpiry(new Date(Date.now() + 3 * 60 * 1000)); // 3 minutes
      toast.success('Withdrawal token sent to your email');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send token');
    }
  });

  // Withdrawal request mutation
  const withdrawalMutation = useMutation({
    mutationFn: withdrawalService.requestWithdrawal,
    onSuccess: (data) => {
      toast.success(
        <div className="space-y-2">
          <div className="font-semibold">Withdrawal Successful!</div>
          <div className="text-sm space-y-1">
            <div>Amount: {data.currency} {data.requestedAmount}</div>
            <div>Fee: {data.currency} {data.withdrawalFee}</div>
            <div>Net Payout: {data.currency} {data.netPayout}</div>
            <div>Reference: {data.paymentReference}</div>
            <div>Recipient: {data.recipientNumber}</div>
          </div>
        </div>,
        { duration: 8000 }
      );
      setIsDialogOpen(false);
      setWithdrawalAmount('');
      setRecipientNumber('');
      setWithdrawalToken('');
      setTokenSent(false);
      setTokenExpiry(null);
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ['caregiver-balance'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-history'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit withdrawal request');
    }
  });

  // Check if token is expired
  const isTokenExpired = tokenExpiry && new Date() > tokenExpiry;

  // Reset token state when dialog closes
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setTokenSent(false);
      setTokenExpiry(null);
      setWithdrawalToken('');
    }
  };

  const withdrawals = withdrawalsData?.withdrawals || [];
  const loading = balanceLoading || withdrawalsLoading;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="caregiver">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="caregiver">
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={responsive.pageTitle}>Withdrawals</h1>
            <p className={responsive.pageSubtitle}>Manage your earnings and withdrawal requests</p>
          </div>
        </div>

      {/* Balance Card */}
      <Card className={dashboardCard.base}>
        <CardHeader className={dashboardCard.header}>
          <div>
            <CardTitle className={`flex items-center gap-2 ${responsive.cardTitle}`}>
              <Wallet className="h-5 w-5 text-primary" />
              Wallet Balance
            </CardTitle>
            <CardDescription className={responsive.cardDesc}>Your current earnings and available balance</CardDescription>
          </div>
        </CardHeader>
        <CardContent className={dashboardCard.body}>
          <div className={dashboardCard.compactStatGrid}>
            <div className={dashboardCard.balanceBlockPrimary}>
              <p className={responsive.bodyMuted}>Total Earnings</p>
              <p className={`${dashboardCard.compactBalanceValue} text-primary`}>
                {balance?.currency} {balance?.totalEarnings || '0.00'}
              </p>
            </div>
            <div className={dashboardCard.balanceBlockSuccess}>
              <p className={responsive.bodyMuted}>Available Balance</p>
              <p className={`${dashboardCard.compactBalanceValue} text-success`}>
                {balance?.currency} {balance?.availableBalance || '0.00'}
              </p>
            </div>
            <div className={dashboardCard.balanceBlockWarning}>
              <div className="flex items-center justify-center gap-1">
                <Lock className="h-3 w-3 text-warning" />
                <p className={responsive.bodyMuted}>Locked</p>
              </div>
              <p className={`${dashboardCard.compactBalanceValue} text-warning`}>
                {balance?.currency} {balance?.lockedBalance || '0.00'}
              </p>
              <p className={responsive.bodyMuted}>Submit reports to unlock</p>
            </div>
            <div className="flex items-center justify-center">
              <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full"
                    disabled={!balance || parseFloat(balance.availableBalance) <= 0}
                  >
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Request Withdrawal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className={responsive.dialogTitle}>Request Withdrawal</DialogTitle>
                    <DialogDescription className={responsive.dialogDesc}>
                      Withdraw your earnings to your mobile money or bank account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!tokenSent ? (
                      <>
                        <div>
                          <Label htmlFor="amount">Amount ({balance?.currency})</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                            max={balance?.availableBalance}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Available: {balance?.currency} {balance?.availableBalance}
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="recipientType">Recipient Type</Label>
                          <Select value={recipientType} onValueChange={setRecipientType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mobile_money">Mobile Money</SelectItem>
                              <SelectItem value="bank">Bank Account</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="recipientNumber">
                            {recipientType === 'mobile_money' ? 'Phone Number' : 'Account Number'}
                          </Label>
                          <Input
                            id="recipientNumber"
                            placeholder={recipientType === 'mobile_money' ? 'e.g., 265998123456' : 'Account number'}
                            value={recipientNumber}
                            onChange={(e) => setRecipientNumber(e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center py-4">
                          <div className="text-green-600 mb-2">
                            ✓ Token sent to your email
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Check your email and enter the 6-digit token below
                          </p>
                          {tokenExpiry && (
                            <p className="text-xs text-orange-600 mt-1">
                              Token expires in {Math.max(0, Math.ceil((tokenExpiry.getTime() - Date.now()) / 1000))} seconds
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="token">Withdrawal Token</Label>
                          <Input
                            id="token"
                            placeholder="Enter 6-digit token"
                            value={withdrawalToken}
                            onChange={(e) => setWithdrawalToken(e.target.value)}
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                          />
                        </div>
                        {isTokenExpired && (
                          <div className="text-center">
                            <p className="text-sm text-red-600 mb-2">Token expired</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setTokenSent(false);
                                setTokenExpiry(null);
                                setWithdrawalToken('');
                              }}
                            >
                              Request New Token
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleDialogClose(false)}>
                      Cancel
                    </Button>
                    {!tokenSent ? (
                      <Button 
                        onClick={() => {
                          const amount = parseFloat(withdrawalAmount);
                          if (!amount || amount <= 0) {
                            toast.error('Please enter a valid amount');
                            return;
                          }
                          if (amount > parseFloat(balance?.availableBalance || '0')) {
                            toast.error('Amount exceeds available balance');
                            return;
                          }
                          if (!recipientNumber) {
                            toast.error('Please enter recipient details');
                            return;
                          }
                          tokenMutation.mutate();
                        }}
                        disabled={tokenMutation.isPending}
                      >
                        {tokenMutation.isPending ? 'Sending...' : 'Send Token'}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => {
                          if (!withdrawalToken || withdrawalToken.length !== 6) {
                            toast.error('Please enter the 6-digit token');
                            return;
                          }
                          if (isTokenExpired) {
                            toast.error('Token has expired. Please request a new one.');
                            return;
                          }
                          
                          // First verify token with amount
                          withdrawalService.verifyWithdrawalToken(withdrawalToken, parseFloat(withdrawalAmount))
                            .then(() => {
                              // If verification succeeds, proceed with withdrawal
                              withdrawalMutation.mutate({
                                amount: parseFloat(withdrawalAmount),
                                recipientType: recipientType as 'mobile_money' | 'bank',
                                recipientNumber,
                                token: withdrawalToken
                              });
                            })
                            .catch((error) => {
                              toast.error(error.response?.data?.error || 'Token verification failed');
                            });
                        }}
                        disabled={withdrawalMutation.isPending || isTokenExpired}
                      >
                        {withdrawalMutation.isPending ? 'Processing...' : 'Confirm Withdrawal'}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card className={dashboardCard.base}>
        <CardHeader className={dashboardCard.header}>
          <div>
            <CardTitle className={responsive.cardTitle}>Withdrawal History</CardTitle>
            <CardDescription className={responsive.cardDesc}>Your recent withdrawal requests and their status</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <ArrowDownToLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`${responsive.cardTitle} mb-2`}>No withdrawals yet</h3>
              <p className={responsive.bodyMuted}>Your withdrawal requests will appear here</p>
            </div>
          ) : (
            <div className={dashboardCard.tableWrapper}>
              <Table className={dashboardCard.tableMinWidth}>
                <TableHeader>
                  <TableRow>
                    <TableHead className={dashboardCard.th}>Date</TableHead>
                    <TableHead className={dashboardCard.th}>Amount</TableHead>
                    <TableHead className={dashboardCard.th}>Fee</TableHead>
                    <TableHead className={dashboardCard.th}>Net Payout</TableHead>
                    <TableHead className={dashboardCard.th}>Recipient</TableHead>
                    <TableHead className={dashboardCard.th}>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id} className={dashboardCard.tr}>
                      <TableCell className={dashboardCard.td}>
                        {new Date(withdrawal.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className={dashboardCard.td}>
                        {balance?.currency} {parseFloat(withdrawal.requestedAmount).toFixed(2)}
                      </TableCell>
                      <TableCell className={dashboardCard.td}>
                        {balance?.currency} {parseFloat(withdrawal.withdrawalFee).toFixed(2)}
                      </TableCell>
                      <TableCell className={`${dashboardCard.td} font-medium`}>
                        {balance?.currency} {parseFloat(withdrawal.netPayout).toFixed(2)}
                      </TableCell>
                      <TableCell className={dashboardCard.td}>
                        <div>
                          <p className={`${responsive.body} capitalize`}>{withdrawal.recipientType.replace('_', ' ')}</p>
                          <p className={responsive.bodyMuted}>{withdrawal.recipientNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className={dashboardCard.td}>
                        <Badge className={getStatusColor(withdrawal.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(withdrawal.status)}
                            <span className="capitalize">{withdrawal.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
};

export default WithdrawalsPage;