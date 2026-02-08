import { 
  TursoDoctorRepository,
  TursoPatientRepository,
  TursoAppointmentRepository,
} from '../infrastructure/database/index.js';
import { KapsoWhatsAppService } from '../infrastructure/whatsapp/kapso-service.js';
import { AppointmentService } from './services/appointment-service.js';
import { getDb, closeDb } from '../infrastructure/database/client.js';

async function sendReminders() {
  console.log('Running reminder job...');
  
  // Initialize services
  const doctorRepository = new TursoDoctorRepository();
  const patientRepository = new TursoPatientRepository();
  const appointmentRepository = new TursoAppointmentRepository();
  const whatsAppService = new KapsoWhatsAppService();
  
  const appointmentService = new AppointmentService(
    appointmentRepository,
    patientRepository,
    whatsAppService
  );

  try {
    // Get appointments that need reminders (24h before)
    const appointments = await appointmentService.getPendingReminders(1440);
    
    console.log(`Found ${appointments.length} appointments needing reminders`);

    for (const appointment of appointments) {
      const [doctor, patient] = await Promise.all([
        doctorRepository.findById(appointment.doctorId),
        patientRepository.findById(appointment.patientId),
      ]);

      if (!doctor || !patient) {
        console.error(`Missing data for appointment ${appointment.id}`);
        continue;
      }

      try {
        await appointmentService.sendReminder(appointment, patient, doctor);
        await appointmentService.markReminderSent(appointment.id);
        console.log(`Reminder sent to ${patient.phoneNumber}`);
      } catch (error) {
        console.error(`Failed to send reminder for ${appointment.id}:`, error);
      }
    }

    console.log('Reminder job completed');
  } catch (error) {
    console.error('Reminder job failed:', error);
  } finally {
    await closeDb();
  }
}

sendReminders();
