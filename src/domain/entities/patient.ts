// Domain entity: Patient
export interface Patient {
  id: string;
  doctorId: string;
  name: string;
  phoneNumber: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientInput {
  doctorId: string;
  name: string;
  phoneNumber: string;
  notes?: string;
}

export interface UpdatePatientInput {
  name?: string;
  phoneNumber?: string;
  notes?: string;
}
