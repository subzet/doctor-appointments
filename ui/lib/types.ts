export interface Doctor {
  id: string;
  name: string;
  phoneNumber: string;
  specialty?: string;
  welcomeMessage: string;
  paymentLink?: string;
  calendarConfig: {
    workingHours: {
      day: number;
      start: string;
      end: string;
    }[];
    slotDurationMinutes: number;
  };
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  subscriptionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  doctorId: string;
  name: string;
  phoneNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  scheduledAt: string;
  status: AppointmentStatus;
  notes?: string;
  reminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}
