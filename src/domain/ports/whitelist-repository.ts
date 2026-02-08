import type { WhitelistEntry } from '../entities/doctor.js';

export interface WhitelistRepository {
  findByDoctorId(doctorId: string): Promise<WhitelistEntry[]>;
  findByPhoneNumber(doctorId: string, phoneNumber: string): Promise<WhitelistEntry | null>;
  create(doctorId: string, phoneNumber: string, patientName?: string, notes?: string): Promise<WhitelistEntry>;
  delete(id: string): Promise<boolean>;
}
