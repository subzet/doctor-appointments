import type { 
  Doctor, 
  Patient, 
  WhatsAppService,
  TimeSlot 
} from '../domain/index.js';
import type { 
  DoctorService, 
  PatientService, 
  AppointmentService,
  BookingSession 
} from '../application/index.js';

export class BotFlowHandler {
  constructor(
    private doctorService: DoctorService,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private whatsAppService: WhatsAppService
  ) {}

  async handleIncomingMessage(from: string, body: string, doctorPhoneNumber: string): Promise<void> {
    const doctor = await this.doctorService.getDoctorByPhoneNumber(doctorPhoneNumber);
    
    if (!doctor) {
      console.error(`Doctor not found for phone number: ${doctorPhoneNumber}`);
      return;
    }

    // Check subscription
    const isActive = await this.doctorService.isSubscriptionActive(doctor);
    if (!isActive) {
      await this.whatsAppService.sendMessage(
        from,
        'Lo sentimos, el servicio no está disponible en este momento.'
      );
      return;
    }

    const session = this.appointmentService.getSession(from);
    const message = body.trim().toLowerCase();

    // Handle commands
    if (message === 'turno' || message === 'quiero un turno' || message === 'reservar') {
      await this.startBookingFlow(from, doctor);
      return;
    }

    if (message === 'cancelar') {
      await this.handleCancellation(from, doctor);
      return;
    }

    if (message === 'ayuda' || message === 'help') {
      await this.sendHelpMessage(from, doctor);
      return;
    }

    // Handle booking flow steps
    if (session) {
      await this.handleBookingStep(session, message, from, doctor);
      return;
    }

    // Default: send welcome message
    await this.sendWelcomeMessage(from, doctor);
  }

  private async startBookingFlow(from: string, doctor: Doctor): Promise<void> {
    this.appointmentService.createSession(from, doctor.id);
    
    await this.whatsAppService.sendMessage(
      from,
      `¡Perfecto! Vamos a reservar tu turno con el Dr./Dra. ${doctor.name}.\n\n¿Cómo te llamás?`
    );
    
    this.appointmentService.updateSession(from, { step: 'asking_name' });
  }

  private async handleBookingStep(
    session: BookingSession,
    message: string,
    from: string,
    doctor: Doctor
  ): Promise<void> {
    switch (session.step) {
      case 'asking_name':
        await this.handleNameInput(session, message, from, doctor);
        break;
      
      case 'showing_slots':
        await this.handleSlotSelection(session, message, from, doctor);
        break;
      
      case 'confirming_slot':
        await this.handleSlotConfirmation(session, message, from, doctor);
        break;
      
      default:
        await this.sendWelcomeMessage(from, doctor);
        this.appointmentService.clearSession(from);
    }
  }

  private async handleNameInput(
    session: BookingSession,
    name: string,
    from: string,
    doctor: Doctor
  ): Promise<void> {
    // Get or create patient
    const patient = await this.patientService.createOrUpdatePatient({
      doctorId: doctor.id,
      phoneNumber: from,
      name,
    });

    this.appointmentService.updateSession(from, {
      step: 'showing_slots',
      patientName: name,
      patientId: patient.id,
    });

    // Show available slots for next 7 days
    const slots = await this.getNextAvailableSlots(doctor.id, 7);
    
    if (slots.length === 0) {
      await this.whatsAppService.sendMessage(
        from,
        'Lo sentimos, no hay turnos disponibles en los próximos días. Por favor, contactá directamente al consultorio.'
      );
      this.appointmentService.clearSession(from);
      return;
    }

    const slotsMessage = this.formatSlotsMessage(slots);
    await this.whatsAppService.sendMessage(
      from,
      `Gracias, ${name}. Estos son los próximos turnos disponibles:\n\n${slotsMessage}\n\nRespondé con el número del turno que prefieras (1-${slots.length}).`
    );

    // Store slots in session for reference
    (session as unknown as Record<string, unknown>).availableSlots = slots;
  }

  private async handleSlotSelection(
    session: BookingSession,
    message: string,
    from: string,
    doctor: Doctor
  ): Promise<void> {
    const slotIndex = parseInt(message) - 1;
    const availableSlots = (session as unknown as Record<string, unknown>).availableSlots as TimeSlot[];

    if (isNaN(slotIndex) || slotIndex < 0 || slotIndex >= (availableSlots?.length || 0)) {
      await this.whatsAppService.sendMessage(
        from,
        'Por favor, respondé con un número válido de la lista.'
      );
      return;
    }

    const selectedSlot = availableSlots[slotIndex];
    this.appointmentService.updateSession(from, {
      step: 'confirming_slot',
      selectedSlot,
      selectedDate: selectedSlot.start,
    });

    const dateStr = selectedSlot.start.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const timeStr = selectedSlot.start.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    await this.whatsAppService.sendMessage(
      from,
      `¿Confirmás el turno para el ${dateStr} a las ${timeStr}?\n\nRespondé *SÍ* para confirmar o *NO* para elegir otro horario.`
    );
  }

  private async handleSlotConfirmation(
    session: BookingSession,
    message: string,
    from: string,
    doctor: Doctor
  ): Promise<void> {
    if (message === 'si' || message === 'sí') {
      if (!session.patientId || !session.selectedDate) {
        await this.whatsAppService.sendMessage(
          from,
          'Hubo un error. Por favor, empezá de nuevo escribiendo *TURNO*.'
        );
        this.appointmentService.clearSession(from);
        return;
      }

      // Create appointment
      const appointment = await this.appointmentService.bookAppointment({
        doctorId: doctor.id,
        patientId: session.patientId,
        scheduledAt: session.selectedDate,
      });

      const patient = await this.patientService.getPatientById(session.patientId);
      
      if (patient) {
        await this.appointmentService.sendPaymentInfo(doctor, patient);
        await this.appointmentService.sendAppointmentConfirmation(patient, appointment, doctor);
      }

      this.appointmentService.updateSession(from, { step: 'completed' });
      this.appointmentService.clearSession(from);
    } else if (message === 'no') {
      // Go back to slot selection
      this.appointmentService.updateSession(from, { step: 'showing_slots' });
      
      const slots = await this.getNextAvailableSlots(doctor.id, 7);
      const slotsMessage = this.formatSlotsMessage(slots);
      
      await this.whatsAppService.sendMessage(
        from,
        `Estos son los turnos disponibles:\n\n${slotsMessage}\n\nRespondé con el número del turno que prefieras (1-${slots.length}).`
      );
      
      (session as unknown as Record<string, unknown>).availableSlots = slots;
    } else {
      await this.whatsAppService.sendMessage(
        from,
        'Por favor, respondé *SÍ* para confirmar o *NO* para elegir otro horario.'
      );
    }
  }

  private async handleCancellation(from: string, doctor: Doctor): Promise<void> {
    // TODO: Implement cancellation flow
    await this.whatsAppService.sendMessage(
      from,
      'Para cancelar tu turno, por favor contactá directamente al consultorio.'
    );
  }

  private async sendWelcomeMessage(from: string, doctor: Doctor): Promise<void> {
    const message = doctor.welcomeMessage + '\n\nEscribí *TURNO* para reservar una consulta o *AYUDA* para ver las opciones.';
    await this.whatsAppService.sendMessage(from, message);
  }

  private async sendHelpMessage(from: string, doctor: Doctor): Promise<void> {
    const message = `*Opciones disponibles:*\n\n• Escribí *TURNO* para reservar una consulta\n• Escribí *CANCELAR* para cancelar un turno existente\n• Escribí *AYUDA* para ver este mensaje\n\n_Dr./Dra. ${doctor.name}_`;
    await this.whatsAppService.sendMessage(from, message);
  }

  private async getNextAvailableSlots(doctorId: string, days: number): Promise<TimeSlot[]> {
    const allSlots: TimeSlot[] = [];
    const today = new Date();
    
    for (let i = 0; i < days && allSlots.length < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const slots = await this.appointmentService.getAvailableSlots(doctorId, date);
      const availableSlots = slots.filter(s => s.available);
      
      allSlots.push(...availableSlots);
    }
    
    return allSlots.slice(0, 10);
  }

  private formatSlotsMessage(slots: TimeSlot[]): string {
    return slots
      .map((slot, index) => {
        const dateStr = slot.start.toLocaleDateString('es-AR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });
        const timeStr = slot.start.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `${index + 1}. ${dateStr} - ${timeStr}`;
      })
      .join('\n');
  }
}
