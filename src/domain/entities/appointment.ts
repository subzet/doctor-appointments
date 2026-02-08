// Domain entity: Appointment
export type AppointmentStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  scheduledAt: Date;
  status: AppointmentStatus;
  notes?: string;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentInput {
  doctorId: string;
  patientId: string;
  scheduledAt: Date;
  notes?: string;
}

export interface UpdateAppointmentInput {
  scheduledAt?: Date;
  status?: AppointmentStatus;
  notes?: string;
  reminderSentAt?: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}
