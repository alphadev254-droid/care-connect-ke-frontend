import { api } from '@/lib/api';

export interface Appointment {
  id: number;
  patientId: number;
  caregiverId: number;
  specialtyId: number;
  scheduledDate: string;
  duration: number;
  sessionType: 'in_person' | 'teleconference';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalCost: number;
  notes?: string;
  Patient?: any;
  Caregiver?: any;
  Specialty?: any;
}

export interface CreateAppointmentData {
  timeSlotId: string;
  specialtyId: string;
  sessionType: 'in_person' | 'teleconference';
  notes?: string;
  phoneNumber?: string;
  paymentMethod: 'card' | 'mobile_money';
}

export const appointmentService = {
  getAppointments: async (params?: any) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  getAppointmentById: async (id: string) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data.appointment;
  },

  createAppointment: async (data: CreateAppointmentData) => {
    const response = await api.post('/payments/initiate-booking', data);
    return response.data;
  },

  initiateSessionPayment: async (appointmentId: string, paymentMethod: 'card' | 'mobile_money') => {
    const response = await api.post('/payments/initiate-session', { appointmentId, paymentMethod });
    return response.data;
  },

  updateAppointmentStatus: async (id: number, status: string) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data.appointment;
  },

  confirmPayment: async (appointmentId: number) => {
    const response = await api.post('/appointments/confirm-payment', { appointmentId });
    return response.data.appointment;
  },

  rescheduleAppointment: async (id: number, newTimeSlotId: number, reason?: string) => {
    const response = await api.post(`/appointments/${id}/reschedule`, {
      newTimeSlotId,
      reason
    });
    return response.data;
  },

  cancelAppointment: async (id: number, reason?: string) => {
    const response = await api.post(`/appointments/${id}/cancel`, {
      reason
    });
    return response.data;
  },

  canCancelAppointment: (appointmentDate: string, appointmentTime: string): { canCancel: boolean; hoursLeft: number } => {
    const appointmentDateTime = new Date(`${appointmentDate} ${appointmentTime}`);
    const currentTime = new Date();
    const timeDifference = appointmentDateTime.getTime() - currentTime.getTime();
    const hoursLeft = Math.floor(timeDifference / (1000 * 60 * 60));
    
    return {
      canCancel: hoursLeft >= 16,
      hoursLeft
    };
  },
};
