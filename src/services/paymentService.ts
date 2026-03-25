import { api } from '@/lib/api';

export interface PaymentTransaction {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paidAt?: string;
  createdAt: string;
  Appointment?: any;
}

export interface FeePreview {
  baseFee: number;
  channel: string;
  convenienceFee: number;
  platformCommissionRate: number;
  platformCommission: number;
  caregiverEarnings: number;
  totalAmount: number;
  transactionCharge: number;
}

export const paymentService = {
  getFeePreview: async (params: {
    paymentMethod: 'card' | 'mobile_money';
    specialtyId?: string;
    feeType?: 'booking_fee' | 'session_fee';
    appointmentId?: string;
  }): Promise<FeePreview> => {
    const response = await api.get('/payments/fee-preview', { params });
    return response.data;
  },

  verifyPayment: async (tx_ref: string) => {
    const response = await api.get(`/payments/verify/${tx_ref}`);
    return response.data;
  },

  getAppointmentPayments: async (appointmentId: string) => {
    const response = await api.get(`/payments/appointment/${appointmentId}`);
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },
};
