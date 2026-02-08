import type { Doctor, DoctorRepository } from '../../domain/index.js';

export class DoctorService {
  constructor(private doctorRepository: DoctorRepository) {}

  async getDoctorById(id: string): Promise<Doctor | null> {
    return this.doctorRepository.findById(id);
  }

  async getDoctorByPhoneNumber(phoneNumber: string): Promise<Doctor | null> {
    return this.doctorRepository.findByPhoneNumber(phoneNumber);
  }

  async getDoctorByKapsoPhoneNumberId(phoneNumberId: string): Promise<Doctor | null> {
    return this.doctorRepository.findByKapsoPhoneNumberId(phoneNumberId);
  }

  async createDoctor(input: {
    id?: string;
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

  async createOrGetDoctor(input: {
    id: string;
    name: string;
    email: string;
  }): Promise<{ doctor: Doctor; isNew: boolean }> {
    // Check if doctor already exists with this ID
    const existing = await this.doctorRepository.findById(input.id);
    if (existing) {
      return { doctor: existing, isNew: false };
    }

    // Create new doctor with placeholder phone
    const doctor = await this.doctorRepository.create({
      id: input.id,
      name: input.name,
      phoneNumber: 'pending', // Will be updated during onboarding
      specialty: '',
      welcomeMessage: `¡Hola! Soy el asistente virtual del Dr./Dra. ${input.name}. ¿En qué puedo ayudarte?`,
    });

    return { doctor, isNew: true };
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
