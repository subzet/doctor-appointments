// Domain entity: Doctor
export interface Doctor {
  id: string;
  name: string;
  phoneNumber: string;
  whatsappNumber?: string;
  specialty?: string;
  welcomeMessage: string;
  paymentLink?: string;
  whitelistMode: boolean;
  calendarConfig: {
    workingHours: {
      day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
      start: string; // HH:MM format
      end: string;
    }[];
    slotDurationMinutes: number;
  };
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  subscriptionExpiresAt?: Date;
  // Kapso WhatsApp integration
  kapsoSetupLinkId?: string;
  kapsoPhoneNumberId?: string;
  kapsoWabaId?: string;
  whatsappStatus: 'pending' | 'connected' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDoctorInput {
  name: string;
  phoneNumber: string;
  whatsappNumber?: string;
  specialty?: string;
  welcomeMessage?: string;
  paymentLink?: string;
  whitelistMode?: boolean;
}

export interface UpdateDoctorInput {
  name?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  specialty?: string;
  welcomeMessage?: string;
  paymentLink?: string;
  whitelistMode?: boolean;
  calendarConfig?: Doctor['calendarConfig'];
  subscriptionStatus?: Doctor['subscriptionStatus'];
  subscriptionExpiresAt?: Date;
  // Kapso WhatsApp integration
  kapsoSetupLinkId?: string;
  kapsoPhoneNumberId?: string;
  kapsoWabaId?: string;
  whatsappStatus?: Doctor['whatsappStatus'];
}

// Whitelist entry for allowed patient phone numbers
export interface WhitelistEntry {
  id: string;
  doctorId: string;
  phoneNumber: string;
  patientName?: string;
  notes?: string;
  createdAt: Date;
}
