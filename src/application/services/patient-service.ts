import type { Patient, PatientRepository } from '../../domain/index.js';

export class PatientService {
  constructor(private patientRepository: PatientRepository) {}

  async getPatientById(id: string): Promise<Patient | null> {
    return this.patientRepository.findById(id);
  }

  async getPatientByPhoneNumber(doctorId: string, phoneNumber: string): Promise<Patient | null> {
    return this.patientRepository.findByPhoneNumber(doctorId, phoneNumber);
  }

  async getPatientsByDoctorId(doctorId: string): Promise<Patient[]> {
    return this.patientRepository.findByDoctorId(doctorId);
  }

  async createOrUpdatePatient(input: {
    doctorId: string;
    phoneNumber: string;
    name?: string;
  }): Promise<Patient> {
    const existing = await this.patientRepository.findByPhoneNumber(
      input.doctorId,
      input.phoneNumber
    );

    if (existing) {
      if (input.name && !existing.name) {
        return this.patientRepository.update(existing.id, { name: input.name }) as Promise<Patient>;
      }
      return existing;
    }

    const name = input.name || 'Paciente';
    return this.patientRepository.create({
      doctorId: input.doctorId,
      phoneNumber: input.phoneNumber,
      name,
    });
  }

  async updatePatientName(patientId: string, name: string): Promise<Patient | null> {
    return this.patientRepository.update(patientId, { name });
  }
}
