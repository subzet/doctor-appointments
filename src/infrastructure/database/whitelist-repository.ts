import type { WhitelistEntry } from '../../domain/entities/doctor.js';
import type { WhitelistRepository } from '../../domain/ports/whitelist-repository.js';
import { getDb } from './client.js';
import { randomUUID } from 'crypto';

export class TursoWhitelistRepository implements WhitelistRepository {
  async findByDoctorId(doctorId: string): Promise<WhitelistEntry[]> {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM doctor_whitelist WHERE doctor_id = ? ORDER BY created_at DESC',
      args: [doctorId],
    });
    
    return result.rows.map(row => this.mapRowToEntry(row));
  }

  async findByPhoneNumber(doctorId: string, phoneNumber: string): Promise<WhitelistEntry | null> {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM doctor_whitelist WHERE doctor_id = ? AND phone_number = ?',
      args: [doctorId, phoneNumber],
    });
    
    if (result.rows.length === 0) return null;
    return this.mapRowToEntry(result.rows[0]);
  }

  async create(
    doctorId: string, 
    phoneNumber: string, 
    patientName?: string, 
    notes?: string
  ): Promise<WhitelistEntry> {
    const db = getDb();
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `
        INSERT INTO doctor_whitelist (id, doctor_id, phone_number, patient_name, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [id, doctorId, phoneNumber, patientName ?? null, notes ?? null, now],
    });

    const entry = await this.findById(id);
    if (!entry) throw new Error('Failed to create whitelist entry');
    return entry;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.execute({
      sql: 'DELETE FROM doctor_whitelist WHERE id = ?',
      args: [id],
    });
    return result.rowsAffected > 0;
  }

  private async findById(id: string): Promise<WhitelistEntry | null> {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM doctor_whitelist WHERE id = ?',
      args: [id],
    });
    
    if (result.rows.length === 0) return null;
    return this.mapRowToEntry(result.rows[0]);
  }

  private mapRowToEntry(row: Record<string, unknown>): WhitelistEntry {
    return {
      id: row.id as string,
      doctorId: row.doctor_id as string,
      phoneNumber: row.phone_number as string,
      patientName: row.patient_name as string | undefined,
      notes: row.notes as string | undefined,
      createdAt: new Date(row.created_at as string),
    };
  }
}
