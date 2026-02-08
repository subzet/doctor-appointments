// Domain entity: Doctor
export interface Doctor {
  id: string;
  name: string;
  phoneNumber: string;
  specialty?: string;
  welcomeMessage: string;
  paymentLink?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDoctorInput {
  name: string;
  phoneNumber: string;
  specialty?: string;
  welcomeMessage?: string;
  paymentLink?: string;
}

export interface UpdateDoctorInput {
  name?: string;
  specialty?: string;
  welcomeMessage?: string;
  paymentLink?: string;
  calendarConfig?: Doctor['calendarConfig'];
  subscriptionStatus?: Doctor['subscriptionStatus'];
  subscriptionExpiresAt?: Date;
}
