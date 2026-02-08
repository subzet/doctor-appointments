import type { Patient, CreatePatientInput, UpdatePatientInput } from '../entities/patient.js';

export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  findByPhoneNumber(doctorId: string, phoneNumber: string): Promise<Patient | null>;
  findByDoctorId(doctorId: string): Promise<Patient[]>;
  create(input: CreatePatientInput): Promise<Patient>;
  update(id: string, input: UpdatePatientInput): Promise<Patient | null>;
  delete(id: string): Promise<boolean>;
}
