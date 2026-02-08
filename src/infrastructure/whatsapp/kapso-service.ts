import type { WhatsAppService, WhatsAppMessage } from '../../domain/ports/whatsapp-service.js';

export class KapsoWhatsAppService implements WhatsAppService {
  private apiKey: string;
  private phoneNumberId: string;

  constructor() {
    this.apiKey = process.env.KAPSO_API_KEY ?? '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';

    if (!this.apiKey) {
      console.warn('KAPSO_API_KEY not configured');
    }
  }

  async sendMessage(to: string, body: string): Promise<void> {
    // TODO: Implement Kapso AI WhatsApp API integration
    console.log(`[WhatsApp] To: ${to}, Body: ${body}`);
    
    // Placeholder for actual implementation
    // const response = await fetch(`https://api.kapso.ai/v1/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     phone_number_id: this.phoneNumberId,
    //     to,
    //     type: 'text',
    //     text: { body },
    //   }),
    // });
  }

  parseIncomingMessage(payload: unknown): WhatsAppMessage | null {
    // TODO: Implement Kapso AI webhook payload parsing
    // Placeholder implementation
    return null;
  }
}
