import type { WhatsAppService, WhatsAppMessage } from '../../domain/ports/whatsapp-service.js';

export class KapsoWhatsAppService implements WhatsAppService {
  private apiKey: string;
  private baseUrl = 'https://api.kapso.ai/platform/v1';

  constructor() {
    this.apiKey = process.env.KAPSO_API_KEY ?? '';

    if (!this.apiKey) {
      console.warn('KAPSO_API_KEY not configured');
    }
  }

  async sendMessage(phoneNumberId: string, to: string, body: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number_id: phoneNumberId,
        to,
        type: 'text',
        text: { body },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send WhatsApp message: ${error}`);
    }
  }

  parseIncomingMessage(payload: unknown): WhatsAppMessage | null {
    if (typeof payload !== 'object' || payload === null) {
      return null;
    }

    const p = payload as Record<string, unknown>;
    
    // Kapso webhook format for inbound messages
    if (p.event === 'message.inbound' && p.data) {
      const data = p.data as Record<string, unknown>;
      const message = data.message as Record<string, unknown>;
      
      return {
        from: data.from as string,
        body: message.text?.body as string || '',
        timestamp: new Date(data.timestamp as string),
        messageId: data.message_id as string,
      };
    }

    // Fallback for generic webhook format
    return {
      from: p.from as string || p.phone_number as string || p.sender as string || '',
      body: p.message as string || p.body as string || p.text as string || '',
      timestamp: new Date(p.timestamp as string || Date.now()),
      messageId: p.message_id as string || p.id as string || '',
    };
  }
}
