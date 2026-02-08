import type { WhitelistEntry, WhitelistRepository } from '../../domain/index.js';

export class WhitelistService {
  constructor(private whitelistRepository: WhitelistRepository) {}

  async getWhitelistByDoctorId(doctorId: string): Promise<WhitelistEntry[]> {
    return this.whitelistRepository.findByDoctorId(doctorId);
  }

  async isPhoneNumberAllowed(doctorId: string, phoneNumber: string): Promise<boolean> {
    const entry = await this.whitelistRepository.findByPhoneNumber(doctorId, phoneNumber);
    return entry !== null;
  }

  async addToWhitelist(
    doctorId: string, 
    phoneNumber: string, 
    patientName?: string, 
    notes?: string
  ): Promise<WhitelistEntry> {
    // Check if already exists
    const existing = await this.whitelistRepository.findByPhoneNumber(doctorId, phoneNumber);
    if (existing) {
      throw new Error('Phone number already in whitelist');
    }
    
    return this.whitelistRepository.create(doctorId, phoneNumber, patientName, notes);
  }

  async removeFromWhitelist(id: string): Promise<boolean> {
    return this.whitelistRepository.delete(id);
  }
}
