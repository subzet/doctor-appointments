import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { closeDb } from './infrastructure/database/client.js';
import { TursoDoctorRepository } from './infrastructure/database/doctor-repository.js';
import { TursoPatientRepository } from './infrastructure/database/patient-repository.js';
import { TursoAppointmentRepository } from './infrastructure/database/appointment-repository.js';
import { TursoWhitelistRepository } from './infrastructure/database/whitelist-repository.js';
import { KapsoWhatsAppService } from './infrastructure/whatsapp/kapso-service.js';
import { 
  DoctorService, 
  PatientService, 
  AppointmentService,
  WhitelistService
} from './application/index.js';
import { BotFlowHandler } from './application/bot-flow-handler.js';
import { createWebhookRouter, createApiRouter } from './interfaces/index.js';

// Initialize repositories
const doctorRepository = new TursoDoctorRepository();
const patientRepository = new TursoPatientRepository();
const appointmentRepository = new TursoAppointmentRepository();
const whitelistRepository = new TursoWhitelistRepository();

// Initialize services
const whatsAppService = new KapsoWhatsAppService();
const doctorService = new DoctorService(doctorRepository);
const patientService = new PatientService(patientRepository);
const appointmentService = new AppointmentService(
  appointmentRepository,
  patientRepository,
  whatsAppService
);
const whitelistService = new WhitelistService(whitelistRepository);

// Initialize bot flow handler
const botFlowHandler = new BotFlowHandler(
  doctorService,
  patientService,
  appointmentService,
  whatsAppService,
  whitelistService
);

// Create main app
const app = new Hono();

// Enable CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({ 
    name: 'Doctor Appointments API',
    version: '0.1.0',
    status: 'ok',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'healthy' });
});

// Mount routes
app.route('/api', createApiRouter({
  doctorService,
  patientService,
  appointmentService,
  whitelistService,
}));

app.route('/', createWebhookRouter({
  botFlowHandler,
  appointmentService,
  doctorService,
}));

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...');
  await closeDb();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connection...');
  await closeDb();
  process.exit(0);
});

const port = process.env.PORT ?? '3000';
console.log(`Server starting on port ${port}...`);

export default {
  port: parseInt(port, 10),
  fetch: app.fetch,
};
