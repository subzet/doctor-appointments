import type { Doctor, CreateDoctorInput, UpdateDoctorInput } from '../entities/doctor.js';

export interface DoctorRepository {
  findById(id: string): Promise<Doctor | null>;
  findByPhoneNumber(phoneNumber: string): Promise<Doctor | null>;
  create(input: CreateDoctorInput): Promise<Doctor>;
  update(id: string, input: UpdateDoctorInput): Promise<Doctor | null>;
  delete(id: string): Promise<boolean>;
}
