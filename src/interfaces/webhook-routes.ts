import { Hono } from 'hono';
import type { BotFlowHandler } from '../application/bot-flow-handler.js';
import type { AppointmentService, DoctorService } from '../application/index.js';
import { KapsoSetupService } from '../infrastructure/kapso/kapso-setup-service.js';

interface Dependencies {
  botFlowHandler: BotFlowHandler;
  appointmentService: AppointmentService;
  doctorService: DoctorService;
  kapsoSetupService?: KapsoSetupService;
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

  // Kapso webhook for phone number connection events
  // This is called when a doctor completes the WhatsApp setup flow
  router.post('/webhooks/kapso', async (c) => {
    const body = await c.req.json();
    console.log('Kapso webhook received:', body);

    if (!deps.kapsoSetupService) {
      return c.json({ error: 'Kapso service not configured' }, 500);
    }

    // Handle phone_number.connected event
    const phoneData = deps.kapsoSetupService.parsePhoneConnectedWebhook(body);
    
    if (phoneData) {
      try {
        // Update doctor with connected phone number info
        await deps.doctorService.updateDoctor(phoneData.doctorId, {
          kapsoPhoneNumberId: phoneData.phoneNumberId,
          kapsoWabaId: phoneData.wabaId,
          whatsappNumber: phoneData.phoneNumber,
          whatsappStatus: 'connected',
        });

        console.log(`Doctor ${phoneData.doctorId} WhatsApp connected: ${phoneData.phoneNumber}`);
        return c.json({ status: 'ok', event: 'phone_number.connected' });
      } catch (error) {
        console.error('Error updating doctor WhatsApp status:', error);
        return c.json({ error: 'Failed to update doctor' }, 500);
      }
    }

    // Handle incoming messages
    const message = deps.botFlowHandler.parseIncomingMessage(body);
    if (message) {
      // Process message asynchronously using the phoneNumberId from the webhook
      deps.botFlowHandler.handleIncomingMessage(message.from, message.body, message.phoneNumberId)
        .catch(err => console.error('Error handling message:', err));

      return c.json({ status: 'ok', event: 'message.inbound' });
    }

    return c.json({ status: 'ok', event: 'unknown' });
  });

  return router;
}
