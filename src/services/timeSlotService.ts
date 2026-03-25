import { api } from '@/lib/api';

export interface TimeSlot {
  id: number;
  caregiverId: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: 'available' | 'locked' | 'booked';
  lockedUntil?: string;
  isBooked: boolean;
  appointmentId?: number;
  Caregiver?: any;
}

export interface GenerateTimeSlotsData {
  caregiverId: number;
  startDate: string;
  endDate: string;
}

export interface GenerateTimeSlotsForAvailabilityData {
  availabilityId: number;
  startDate: string;
  endDate: string;
}

export const timeSlotService = {
  getAvailableSlots: async (params?: { caregiverId?: number; date?: string; day?: number; month?: number; year?: number }) => {
    const response = await api.get('/timeslots/available', { params });
    return response.data.slots;
  },

  generateTimeSlots: async (data: GenerateTimeSlotsData) => {
    const response = await api.post('/timeslots/generate', data);
    return response.data;
  },

  generateTimeSlotsForAvailability: async (data: GenerateTimeSlotsForAvailabilityData) => {
    const response = await api.post('/timeslots/generate-for-availability', data);
    return response.data;
  },

  lockSlot: async (timeSlotId: number) => {
    const response = await api.post(`/timeslots/${timeSlotId}/lock`);
    return response.data;
  },

  unlockSlot: async (timeSlotId: number) => {
    const response = await api.post(`/timeslots/${timeSlotId}/unlock`);
    return response.data;
  },
};