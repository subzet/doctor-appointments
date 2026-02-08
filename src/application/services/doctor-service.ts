import type { Doctor, DoctorRepository } from '../../domain/index.js';

export class DoctorService {
  constructor(private doctorRepository: DoctorRepository) {}

  async getDoctorById(id: string): Promise<Doctor | null> {
    return this.doctorRepository.findById(id);
  }

  async getDoctorByPhoneNumber(phoneNumber: string): Promise<Doctor | null> {
    return this.doctorRepository.findByPhoneNumber(phoneNumber);
  }

  async createDoctor(input: {
    name: string;
    phoneNumber: string;
    specialty?: string;
    welcomeMessage?: string;
    paymentLink?: string;
  }): Promise<Doctor> {
    const existing = await this.doctorRepository.findByPhoneNumber(input.phoneNumber);
    if (existing) {
      throw new Error('Doctor with this phone number already exists');
    }
    return this.doctorRepository.create(input);
  }

  async updateDoctor(id: string, input: Partial<Doctor>): Promise<Doctor | null> {
    return this.doctorRepository.update(id, input);
  }

  async isSubscriptionActive(doctor: Doctor): boolean {
    if (doctor.subscriptionStatus === 'trial') return true;
    if (doctor.subscriptionStatus === 'active') {
      if (!doctor.subscriptionExpiresAt) return true;
      return doctor.subscriptionExpiresAt > new Date();
    }
    return false;
  }
}
