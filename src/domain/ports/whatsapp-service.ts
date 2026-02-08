export interface WhatsAppMessage {
  from: string; // phone number
  body: string;
  timestamp: Date;
  messageId: string;
}

export interface WhatsAppService {
  sendMessage(to: string, body: string): Promise<void>;
  parseIncomingMessage(payload: unknown): WhatsAppMessage | null;
}
