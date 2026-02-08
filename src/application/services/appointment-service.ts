import type { 
  Appointment, 
  AppointmentRepository, 
  TimeSlot,
  Patient,
  PatientRepository,
  WhatsAppService,
  Doctor 
} from '../../domain/index.js';

export type BookingStep = 
  | 'idle'
  | 'asking_name'
  | 'showing_slots'
  | 'confirming_slot'
  | 'asking_payment'
  | 'completed';

export interface BookingSession {
  patientPhone: string;
  doctorId: string;
  step: BookingStep;
  patientName?: string;
  selectedDate?: Date;
  selectedSlot?: TimeSlot;
  patientId?: string;
}

export class AppointmentService {
  private sessions: Map<string, BookingSession> = new Map();

  constructor(
    private appointmentRepository: AppointmentRepository,
    private patientRepository: PatientRepository,
    private whatsAppService: WhatsAppService
  ) {}

  async getAvailableSlots(doctorId: string, date: Date): Promise<TimeSlot[]> {
    return this.appointmentRepository.getAvailableSlots(doctorId, date);
  }

  async getAppointmentsByDoctorId(doctorId: string, from: Date, to: Date): Promise<Appointment[]> {
    return this.appointmentRepository.findByDoctorId(doctorId, from, to);
  }

  async getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findByPatientId(patientId);
  }

  async bookAppointment(input: {
    doctorId: string;
    patientId: string;
    scheduledAt: Date;
    notes?: string;
  }): Promise<Appointment> {
    return this.appointmentRepository.create(input);
  }

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) return false;
    
    await this.appointmentRepository.update(appointmentId, { status: 'cancelled' });
    return true;
  }

  async getPendingReminders(thresholdMinutes: number = 1440): Promise<Appointment[]> {
    return this.appointmentRepository.findPendingReminders(thresholdMinutes);
  }

  async markReminderSent(appointmentId: string): Promise<void> {
    await this.appointmentRepository.update(appointmentId, { reminderSentAt: new Date() });
  }

  // Session management for booking flow
  getSession(patientPhone: string): BookingSession | undefined {
    return this.sessions.get(patientPhone);
  }

  createSession(patientPhone: string, doctorId: string): BookingSession {
    const session: BookingSession = {
      patientPhone,
      doctorId,
      step: 'idle',
    };
    this.sessions.set(patientPhone, session);
    return session;
  }

  updateSession(patientPhone: string, updates: Partial<BookingSession>): void {
    const session = this.sessions.get(patientPhone);
    if (session) {
      Object.assign(session, updates);
    }
  }

  clearSession(patientPhone: string): void {
    this.sessions.delete(patientPhone);
  }

  async sendPaymentInfo(doctor: Doctor, patient: Patient): Promise<void> {
    if (!doctor.paymentLink) {
      await this.whatsAppService.sendMessage(
        patient.phoneNumber,
        'La consulta debe ser abonada en el consultorio. ¡Te espero!'
      );
      return;
    }

    const message = `Para confirmar tu turno, por favor realizá el pago aquí: ${doctor.paymentLink}\n\nUna vez realizado, responderé con tu confirmación.`;
    await this.whatsAppService.sendMessage(patient.phoneNumber, message);
  }

  async sendAppointmentConfirmation(
    patient: Patient, 
    appointment: Appointment,
    doctor: Doctor
  ): Promise<void> {
    const dateStr = appointment.scheduledAt.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const timeStr = appointment.scheduledAt.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `✅ *Turno confirmado*\n\n📅 ${dateStr}\n🕐 ${timeStr}\n👨‍⚕️ Dr./Dra. ${doctor.name}\n\n*Dirección:* [Agregar dirección del consultorio]\n\nTe enviaré un recordatorio el día anterior. ¡Gracias por confiar en nosotros!`;

    await this.whatsAppService.sendMessage(patient.phoneNumber, message);
  }

  async sendReminder(appointment: Appointment, patient: Patient, doctor: Doctor): Promise<void> {
    const dateStr = appointment.scheduledAt.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const timeStr = appointment.scheduledAt.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `⏰ *Recordatorio de turno*\n\nHola ${patient.name}, te recordamos que mañana tenés turno:\n\n📅 ${dateStr}\n🕐 ${timeStr}\n👨‍⚕️ Dr./Dra. ${doctor.name}\n\n¿Confirmás tu asistencia? Respondé *SÍ* para confirmar o *NO* para cancelar.`;

    await this.whatsAppService.sendMessage(patient.phoneNumber, message);
  }
}
