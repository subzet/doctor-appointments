// Kapso Setup Links Service
// Handles WhatsApp number onboarding via Kapso Platforms

export interface KapsoSetupLink {
  id: string;
  url: string;
  status: 'active' | 'used' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
}

export interface KapsoPhoneNumber {
  id: string;
  displayName: string;
  phoneNumber: string;
  status: 'connected' | 'pending' | 'error';
  wabaId: string;
}

export class KapsoSetupService {
  private apiKey: string;
  private baseUrl = 'https://api.kapso.ai/platform/v1';

  constructor() {
    this.apiKey = process.env.KAPSO_API_KEY ?? '';

    if (!this.apiKey) {
      console.warn('KAPSO_API_KEY not configured');
    }
  }

  /**
   * Create a setup link for WhatsApp onboarding
   * The doctor will be redirected to this URL to connect their WhatsApp number
   */
  async createSetupLink(doctorId: string, doctorName: string): Promise<KapsoSetupLink> {
    const response = await fetch(`${this.baseUrl}/setup-links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: doctorId,
        customer_name: doctorName,
        // Optional: auto-provision a new number if they don't have one
        // provision_number: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create Kapso setup link: ${error}`);
    }

    const data = await response.json();
    
    return {
      id: data.id,
      url: data.url,
      status: data.status,
      createdAt: new Date(data.created_at),
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    };
  }

  /**
   * List all setup links for a customer (doctor)
   */
  async listSetupLinks(doctorId: string): Promise<KapsoSetupLink[]> {
    const response = await fetch(
      `${this.baseUrl}/setup-links?customer_id=${encodeURIComponent(doctorId)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list Kapso setup links: ${error}`);
    }

    const data = await response.json();
    
    return data.setup_links.map((link: Record<string, unknown>) => ({
      id: link.id as string,
      url: link.url as string,
      status: link.status as KapsoSetupLink['status'],
      createdAt: new Date(link.created_at as string),
      expiresAt: link.expires_at ? new Date(link.expires_at as string) : undefined,
    }));
  }

  /**
   * Get connected phone numbers for a doctor
   * Used after the doctor completes the setup link flow
   */
  async getConnectedPhoneNumbers(doctorId: string): Promise<KapsoPhoneNumber[]> {
    const response = await fetch(
      `${this.baseUrl}/phone-numbers?customer_id=${encodeURIComponent(doctorId)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get phone numbers: ${error}`);
    }

    const data = await response.json();
    
    return data.phone_numbers.map((phone: Record<string, unknown>) => ({
      id: phone.id as string,
      displayName: phone.display_name as string,
      phoneNumber: phone.phone_number as string,
      status: phone.status as KapsoPhoneNumber['status'],
      wabaId: phone.waba_id as string,
    }));
  }

  /**
   * Get a specific phone number details
   */
  async getPhoneNumber(phoneNumberId: string): Promise<KapsoPhoneNumber | null> {
    const response = await fetch(
      `${this.baseUrl}/phone-numbers/${phoneNumberId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get phone number: ${error}`);
    }

    const data = await response.json();
    
    return {
      id: data.id,
      displayName: data.display_name,
      phoneNumber: data.phone_number,
      status: data.status,
      wabaId: data.waba_id,
    };
  }

  /**
   * Parse Kapso webhook payload when phone number is connected
   */
  parsePhoneConnectedWebhook(payload: unknown): {
    doctorId: string;
    phoneNumberId: string;
    wabaId: string;
    phoneNumber: string;
  } | null {
    if (typeof payload !== 'object' || payload === null) {
      return null;
    }

    const p = payload as Record<string, unknown>;
    
    // Kapso webhook format for phone_number.connected event
    if (p.event === 'phone_number.connected' && p.data) {
      const data = p.data as Record<string, unknown>;
      return {
        doctorId: data.customer_id as string,
        phoneNumberId: data.phone_number_id as string,
        wabaId: data.waba_id as string,
        phoneNumber: data.phone_number as string,
      };
    }

    return null;
  }
}
