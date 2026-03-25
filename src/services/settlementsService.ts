import { api } from '@/lib/api';

export interface PaystackSubaccount {
  id: number;
  caregiverId: number;
  businessName: string;
  settlementBank: string;
  accountNumber: string;
  accountName?: string;
  subaccountCode: string;
  percentageCharge: number;
  isActive: boolean;
  createdAt: string;
}

export interface Settlement {
  id: number;
  caregiverId: number;
  subaccountCode: string;
  paystackSettlementId: string;
  amount: number;
  totalFees: number;
  status: string;
  settledAt?: string;
  createdAt: string;
}

export interface Bank {
  name: string;
  code: string;
  type: string;
}

export const settlementsService = {
  getBanks: async (): Promise<{ banks: Bank[] }> => {
    const res = await api.get('/settlements/banks');
    return res.data;
  },

  getMySubaccount: async (): Promise<{ subaccount: PaystackSubaccount | null }> => {
    const res = await api.get('/settlements/subaccount');
    return res.data;
  },

  saveSubaccount: async (data: {
    businessName: string;
    settlementBank: string;
    accountNumber: string;
    accountName?: string;
  }) => {
    const res = await api.post('/settlements/subaccount', data);
    return res.data;
  },

  getBalance: async () => {
    const res = await api.get('/settlements/balance');
    return res.data;
  },

  getSettlements: async (page = 1, limit = 20) => {
    const res = await api.get(`/settlements/settlements?page=${page}&limit=${limit}`);
    return res.data;
  },

  syncSettlements: async () => {
    const res = await api.post('/settlements/sync');
    return res.data;
  },
};
