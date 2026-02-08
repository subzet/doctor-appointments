import { Hono } from 'hono';
import { closeDb } from './infrastructure/database/client.js';

const app = new Hono();

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
