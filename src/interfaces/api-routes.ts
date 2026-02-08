import { Hono } from 'hono';
import type { DoctorService, PatientService, AppointmentService, WhitelistService } from '../application/index.js';
import { KapsoSetupService } from '../infrastructure/kapso/kapso-setup-service.js';

interface Dependencies {
  doctorService: DoctorService;
  patientService: PatientService;
  appointmentService: AppointmentService;
  whitelistService: WhitelistService;
  kapsoSetupService?: KapsoSetupService;
}

export function createApiRouter(deps: Dependencies): Hono {
  const router = new Hono();

  // Auth/Onboarding - Create or get doctor from Firebase user
  router.post('/auth/doctor', async (c) => {
    const body = await c.req.json();
    const { uid, name, email } = body;

    if (!uid || !name) {
      return c.json({ error: 'UID and name are required' }, 400);
    }

    try {
      const result = await deps.doctorService.createOrGetDoctor({
        id: uid,
        name,
        email,
      });
      return c.json({ 
        doctor: result.doctor, 
        isNew: result.isNew 
      }, result.isNew ? 201 : 200);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500);
    }
  });

  // Doctor routes
  router.get('/doctors/:id', async (c) => {
    const id = c.req.param('id');
    const doctor = await deps.doctorService.getDoctorById(id);
    
    if (!doctor) {
      return c.json({ error: 'Doctor not found' }, 404);
    }
    
    return c.json(doctor);
  });

  router.post('/doctors', async (c) => {
    const body = await c.req.json();
    
    try {
      const doctor = await deps.doctorService.createDoctor(body);
      return c.json(doctor, 201);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400);
    }
  });

  router.patch('/doctors/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    try {
      const doctor = await deps.doctorService.updateDoctor(id, body);
      if (!doctor) {
        return c.json({ error: 'Doctor not found' }, 404);
      }
      return c.json(doctor);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400);
    }
  });

  // Whitelist routes
  router.get('/doctors/:doctorId/whitelist', async (c) => {
    const doctorId = c.req.param('doctorId');
    const entries = await deps.whitelistService.getWhitelistByDoctorId(doctorId);
    return c.json(entries);
  });

  router.post('/doctors/:doctorId/whitelist', async (c) => {
    const doctorId = c.req.param('doctorId');
    const body = await c.req.json();
    
    if (!body.phoneNumber) {
      return c.json({ error: 'phoneNumber is required' }, 400);
    }

    try {
      const entry = await deps.whitelistService.addToWhitelist(
        doctorId,
        body.phoneNumber,
        body.patientName,
        body.notes
      );
      return c.json(entry, 201);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400);
    }
  });

  router.delete('/whitelist/:id', async (c) => {
    const id = c.req.param('id');
    const success = await deps.whitelistService.removeFromWhitelist(id);
    
    if (!success) {
      return c.json({ error: 'Entry not found' }, 404);
    }
    
    return c.json({ status: 'deleted' });
  });

  // Patient routes
  router.get('/doctors/:doctorId/patients', async (c) => {
    const doctorId = c.req.param('doctorId');
    const patients = await deps.patientService.getPatientsByDoctorId(doctorId);
    return c.json(patients);
  });

  router.get('/patients/:id', async (c) => {
    const id = c.req.param('id');
    const patient = await deps.patientService.getPatientById(id);
    
    if (!patient) {
      return c.json({ error: 'Patient not found' }, 404);
    }
    
    return c.json(patient);
  });

  // Appointment routes
  router.get('/doctors/:doctorId/appointments', async (c) => {
    const doctorId = c.req.param('doctorId');
    const from = c.req.query('from');
    const to = c.req.query('to');
    
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : new Date(fromDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const appointments = await deps.appointmentService.getAppointmentsByDoctorId(
      doctorId,
      fromDate,
      toDate
    );
    
    return c.json(appointments);
  });

  router.get('/patients/:patientId/appointments', async (c) => {
    const patientId = c.req.param('patientId');
    const appointments = await deps.appointmentService.getAppointmentsByPatientId(patientId);
    return c.json(appointments);
  });

  router.get('/doctors/:doctorId/slots', async (c) => {
    const doctorId = c.req.param('doctorId');
    const date = c.req.query('date');
    
    if (!date) {
      return c.json({ error: 'Date parameter required' }, 400);
    }
    
    const slots = await deps.appointmentService.getAvailableSlots(doctorId, new Date(date));
    return c.json(slots);
  });

  router.post('/appointments', async (c) => {
    const body = await c.req.json();
    
    try {
      const appointment = await deps.appointmentService.bookAppointment(body);
      return c.json(appointment, 201);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400);
    }
  });

  router.post('/appointments/:id/cancel', async (c) => {
    const id = c.req.param('id');
    const success = await deps.appointmentService.cancelAppointment(id);
    
    if (!success) {
      return c.json({ error: 'Appointment not found' }, 404);
    }
    
    return c.json({ status: 'cancelled' });
  });

  // Kapso Setup Links - WhatsApp Onboarding
  // POST /api/doctors/:id/setup-link - Create a new setup link
  router.post('/doctors/:id/setup-link', async (c) => {
    const id = c.req.param('id');
    const doctor = await deps.doctorService.getDoctorById(id);
    
    if (!doctor) {
      return c.json({ error: 'Doctor not found' }, 404);
    }

    if (!deps.kapsoSetupService) {
      return c.json({ error: 'Kapso service not configured' }, 500);
    }

    try {
      const setupLink = await deps.kapsoSetupService.createSetupLink(id, doctor.name);
      
      // Save the setup link ID to the doctor record
      await deps.doctorService.updateDoctor(id, {
        kapsoSetupLinkId: setupLink.id,
        whatsappStatus: 'pending',
      });

      return c.json({
        setupLinkId: setupLink.id,
        url: setupLink.url,
        status: setupLink.status,
      }, 201);
    } catch (error) {
      console.error('Error creating setup link:', error);
      return c.json({ error: 'Failed to create setup link' }, 500);
    }
  });

  // GET /api/doctors/:id/whatsapp-status - Check WhatsApp connection status
  router.get('/doctors/:id/whatsapp-status', async (c) => {
    const id = c.req.param('id');
    const doctor = await deps.doctorService.getDoctorById(id);
    
    if (!doctor) {
      return c.json({ error: 'Doctor not found' }, 404);
    }

    // If already connected, return cached status
    if (doctor.whatsappStatus === 'connected' && doctor.kapsoPhoneNumberId) {
      return c.json({
        status: doctor.whatsappStatus,
        phoneNumberId: doctor.kapsoPhoneNumberId,
        wabaId: doctor.kapsoWabaId,
        connectedAt: doctor.updatedAt,
      });
    }

    // Check for connected phone numbers via Kapso API
    if (deps.kapsoSetupService && doctor.whatsappStatus === 'pending') {
      try {
        const phoneNumbers = await deps.kapsoSetupService.getConnectedPhoneNumbers(id);
        
        if (phoneNumbers.length > 0) {
          const primaryNumber = phoneNumbers[0];
          
          // Update doctor with connected phone number
          await deps.doctorService.updateDoctor(id, {
            kapsoPhoneNumberId: primaryNumber.id,
            kapsoWabaId: primaryNumber.wabaId,
            whatsappStatus: 'connected',
          });

          return c.json({
            status: 'connected',
            phoneNumberId: primaryNumber.id,
            wabaId: primaryNumber.wabaId,
            phoneNumber: primaryNumber.phoneNumber,
            displayName: primaryNumber.displayName,
          });
        }
      } catch (error) {
        console.error('Error checking phone numbers:', error);
      }
    }

    return c.json({
      status: doctor.whatsappStatus,
      setupLinkId: doctor.kapsoSetupLinkId,
    });
  });

  return router;
}
