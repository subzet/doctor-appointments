import type { Appointment, CreateAppointmentInput, UpdateAppointmentInput, TimeSlot } from '../entities/appointment.js';

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByDoctorId(doctorId: string, from: Date, to: Date): Promise<Appointment[]>;
  findByPatientId(patientId: string): Promise<Appointment[]>;
  findPendingReminders(thresholdMinutes: number): Promise<Appointment[]>;
  create(input: CreateAppointmentInput): Promise<Appointment>;
  update(id: string, input: UpdateAppointmentInput): Promise<Appointment | null>;
  delete(id: string): Promise<boolean>;
  getAvailableSlots(doctorId: string, date: Date): Promise<TimeSlot[]>;
}
