import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { paymentService } from "@/services/paymentService";
import { toast } from "sonner";
import { dashboardCard, responsive, btn } from "@/theme";
import {
  CheckCircle, Clock, XCircle, Loader2, Receipt, DollarSign, ArrowUpRight, Eye,
} from "lucide-react";

const Billing = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const reference = searchParams.get('reference');
    if (status === 'success' && reference) toast.success('Payment completed successfully!');
    else if (status === 'failed') toast.error('Payment failed. Please try again.');
  }, [searchParams]);

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => paymentService.getPaymentHistory(),
  });

  const payments = paymentsData?.payments || [];

  const totalPaid = payments
    .filter((p: any) => p.status === 'completed')
    .reduce((sum: number, p: any) => sum + parseFloat(p.baseFee || p.amount), 0);

  const totalPending = payments
    .filter((p: any) => p.status === 'pending')
    .reduce((sum: number, p: any) => sum + parseFloat(p.baseFee || p.amount), 0);

  return (
    <DashboardLayout userRole={user?.role || 'patient'}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className={responsive.pageTitle}>Payment & Billing</h1>
          <p className={responsive.pageSubtitle}>Manage your payments and billing information</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className={dashboardCard.statContent}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className={responsive.bodyMuted}>Total Paid</p>
                  <p className={responsive.statValue}>KES {totalPaid.toLocaleString()}</p>
                </div>
                <div className={dashboardCard.iconWell.success}>
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-success" />
                <span className={`${responsive.bodyMuted} text-success`}>Completed payments</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className={dashboardCard.statContent}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className={responsive.bodyMuted}>Pending</p>
                  <p className={responsive.statValue}>KES {totalPending.toLocaleString()}</p>
                </div>
                <div className={dashboardCard.iconWell.warning}>
                  <Clock className="h-4 w-4 text-warning" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-warning" />
                <span className={`${responsive.bodyMuted} text-warning`}>Awaiting payment</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className={dashboardCard.statContent}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className={responsive.bodyMuted}>Transactions</p>
                  <p className={responsive.statValue}>{payments.length}</p>
                </div>
                <div className={dashboardCard.iconWell.primary}>
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
              </div>
              <span className={responsive.bodyMuted}>Total transactions</span>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card>
          <div className={`${dashboardCard.compactHeader} border-b`}>
            <h2 className={responsive.cardTitle}>Payment History</h2>
            <p className={responsive.bodyMuted}>All your payment transactions</p>
          </div>
          <CardContent className="p-0">
            {loadingPayments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className={`${responsive.cardTitle} mb-1`}>No payment history</h3>
                <p className={responsive.bodyMuted}>Your transactions will appear here</p>
              </div>
            ) : (
              <div className={dashboardCard.tableWrapper}>
                <Table className={dashboardCard.tableMinWidth}>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className={`${responsive.body} font-semibold ${dashboardCard.th}`}>Date</TableHead>
                      <TableHead className={`${responsive.body} font-semibold ${dashboardCard.th}`}>Transaction ID</TableHead>
                      <TableHead className={`${responsive.body} font-semibold ${dashboardCard.th}`}>Appointment</TableHead>
                      <TableHead className={`${responsive.body} font-semibold ${dashboardCard.th}`}>Type</TableHead>
                      <TableHead className={`${responsive.body} font-semibold ${dashboardCard.th}`}>Method</TableHead>
                      <TableHead className={`${responsive.body} font-semibold ${dashboardCard.th}`}>Status</TableHead>
                      <TableHead className={`${responsive.body} font-semibold text-right ${dashboardCard.th}`}>Amount</TableHead>
                      <TableHead className={dashboardCard.th}></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: any) => (
                      <TableRow key={payment.id} className={dashboardCard.tr}>
                        <TableCell className={dashboardCard.td}>
                          <p className={`${responsive.body} font-medium`}>{new Date(payment.createdAt).toLocaleDateString()}</p>
                          <p className={responsive.bodyMuted}>{new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </TableCell>
                        <TableCell className={dashboardCard.td}>
                          <p className="text-xs font-mono">
                            {(() => { const r = payment.paystackReference || ''; return r.length > 18 ? `${r.slice(0, 18)}••••` : r || `TXN-${payment.id.toString().slice(0, 8).toUpperCase()}`; })()}
                          </p>
                        </TableCell>
                        <TableCell className={dashboardCard.td}>
                          <p className={`${responsive.body} font-medium`}>{payment.appointmentRef || `APT-${payment.appointmentId?.toString().slice(0, 8).toUpperCase()}`}</p>
                          <p className={responsive.bodyMuted}>
                            {payment.Appointment?.scheduledDate ? new Date(payment.Appointment.scheduledDate).toLocaleDateString() : '—'}
                          </p>
                        </TableCell>
                        <TableCell className={dashboardCard.td}>
                          <Badge variant="outline" className={responsive.body}>
                            {payment.paymentType === 'booking_fee' ? 'Booking Fee' : 'Session Fee'}
                          </Badge>
                        </TableCell>
                        <TableCell className={`${dashboardCard.td} capitalize`}>
                          <p className={responsive.body}>{payment.channel || payment.paymentMethod}</p>
                        </TableCell>
                        <TableCell className={dashboardCard.td}>
                          <Badge
                            variant={payment.status === 'completed' ? 'default' : payment.status === 'failed' ? 'destructive' : 'secondary'}
                            className={responsive.body}
                          >
                            {payment.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {payment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {payment.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={`${dashboardCard.td} text-right`}>
                          <p className={`${responsive.body} font-semibold`}>KES {parseFloat(payment.baseFee || payment.amount).toLocaleString()}</p>
                          {payment.convenienceFeeAmount && parseFloat(payment.convenienceFeeAmount) > 0 && (
                            <p className="text-[10px] text-muted-foreground">+KES {parseFloat(payment.convenienceFeeAmount).toLocaleString()} fee</p>
                          )}
                        </TableCell>
                        <TableCell className={dashboardCard.td}>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className={`${btn.size.icon} !h-7 !w-7`}>
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className={responsive.dialogTitle}>Transaction Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 text-sm">
                                <div>
                                  <p className={`${responsive.bodyMuted} uppercase tracking-wide font-semibold mb-2`}>Payment</p>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Reference</span>
                                      <span className="font-mono text-xs">
                                        {(() => { const r = payment.paystackReference || ''; return r.length > 18 ? `${r.slice(0, 18)}••••` : r || `TXN-${payment.id.toString().slice(0, 8).toUpperCase()}`; })()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Type</span>
                                      <span>{payment.paymentType === 'booking_fee' ? 'Booking Fee' : 'Session Fee'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Channel</span>
                                      <span className="capitalize">{payment.channel || payment.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Status</span>
                                      <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs h-5">
                                        {payment.status}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Paid At</span>
                                      <span>{payment.paidAt ? new Date(payment.paidAt).toLocaleString() : '—'}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold pt-1 border-t">
                                      <span>{payment.paymentType === 'booking_fee' ? 'Booking Fee' : 'Session Fee'}</span>
                                      <span>KES {parseFloat(payment.baseFee || payment.amount).toLocaleString()}</span>
                                    </div>
                                    {payment.convenienceFeeAmount && parseFloat(payment.convenienceFeeAmount) > 0 && (
                                      <div className="flex justify-between text-muted-foreground">
                                        <span>Transaction cost</span>
                                        <span>KES {parseFloat(payment.convenienceFeeAmount).toLocaleString()}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-muted-foreground">
                                      <span>Total charged</span>
                                      <span>KES {parseFloat(payment.amount).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <p className={`${responsive.bodyMuted} uppercase tracking-wide font-semibold mb-2`}>Appointment</p>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Session Type</span>
                                      <span className="capitalize">{payment.Appointment?.sessionType?.replace('_', ' ') || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Scheduled</span>
                                      <span>{payment.Appointment?.scheduledDate ? new Date(payment.Appointment.scheduledDate).toLocaleDateString() : '—'}</span>
                                    </div>
                                    <div className="flex justify-between pt-1 border-t">
                                      <span className="text-muted-foreground">Booking Fee</span>
                                      <span>KES {payment.Appointment?.bookingFee || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Session Fee</span>
                                      <span>KES {payment.Appointment?.sessionFee || '—'}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                      <span>Total</span>
                                      <span>KES {payment.Appointment?.totalCost || '—'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Footer */}
        {payments.length > 0 && (
          <Card>
            <CardContent className={dashboardCard.compactBody}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className={responsive.bodyMuted}>Total Payments</p>
                  <p className={responsive.statValue}>{payments.length}</p>
                </div>
                <div>
                  <p className={responsive.bodyMuted}>Successful</p>
                  <p className={`${responsive.statValue} text-success`}>
                    {payments.filter((p: any) => p.status === 'completed').length}
                  </p>
                </div>
                <div>
                  <p className={responsive.bodyMuted}>Total Amount</p>
                  <p className={responsive.statValue}>KES {totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Billing;
