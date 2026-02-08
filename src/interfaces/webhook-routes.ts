import { Hono } from 'hono';
import type { BotFlowHandler } from '../application/bot-flow-handler.js';
import type { AppointmentService, DoctorService } from '../application/index.js';

interface Dependencies {
  botFlowHandler: BotFlowHandler;
  appointmentService: AppointmentService;
  doctorService: DoctorService;
}

export function createWebhookRouter(deps: Dependencies): Hono {
  const router = new Hono();

  // Kapso AI / WhatsApp webhook endpoint
  router.post('/whatsapp/:doctorPhone', async (c) => {
    const doctorPhone = c.req.param('doctorPhone');
    const body = await c.req.json();
    
    // Parse incoming WhatsApp message
    // Format depends on Kapso AI webhook payload
    const { from, message } = parseWhatsAppPayload(body);
    
    if (!from || !message) {
      return c.json({ error: 'Invalid payload' }, 400);
    }

    // Process message asynchronously
    deps.botFlowHandler.handleIncomingMessage(from, message, doctorPhone)
      .catch(err => console.error('Error handling message:', err));

    return c.json({ status: 'ok' });
  });

  // Generic webhook endpoint for testing
  router.post('/webhook', async (c) => {
    const body = await c.req.json();
    console.log('Webhook received:', body);
    return c.json({ status: 'received' });
  });

  return router;
}

function parseWhatsAppPayload(payload: unknown): { from?: string; message?: string } {
  // TODO: Adjust based on Kapso AI actual webhook format
  // This is a placeholder implementation
  if (typeof payload !== 'object' || payload === null) {
    return {};
  }

  const p = payload as Record<string, unknown>;
  
  // Common webhook formats
  return {
    from: p.from as string || p.phone_number as string || p.sender as string,
    message: p.message as string || p.body as string || p.text as string,
  };
}
