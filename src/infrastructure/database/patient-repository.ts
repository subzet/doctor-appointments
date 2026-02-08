import type { Patient, CreatePatientInput, UpdatePatientInput } from '../../domain/entities/patient.js';
import type { PatientRepository } from '../../domain/ports/patient-repository.js';
import { getDb } from './client.js';
import { randomUUID } from 'crypto';

export class TursoPatientRepository implements PatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM patients WHERE id = ?',
      args: [id],
    });
    
    if (result.rows.length === 0) return null;
    return this.mapRowToPatient(result.rows[0]);
  }

  async findByPhoneNumber(doctorId: string, phoneNumber: string): Promise<Patient | null> {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM patients WHERE doctor_id = ? AND phone_number = ?',
      args: [doctorId, phoneNumber],
    });
    
    if (result.rows.length === 0) return null;
    return this.mapRowToPatient(result.rows[0]);
  }

  async findByDoctorId(doctorId: string): Promise<Patient[]> {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM patients WHERE doctor_id = ? ORDER BY name',
      args: [doctorId],
    });
    
    return result.rows.map(row => this.mapRowToPatient(row));
  }

  async create(input: CreatePatientInput): Promise<Patient> {
    const db = getDb();
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `
        INSERT INTO patients (id, doctor_id, name, phone_number, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        input.doctorId,
        input.name,
        input.phoneNumber,
        input.notes ?? null,
        now,
        now,
      ],
    });

    const patient = await this.findById(id);
    if (!patient) throw new Error('Failed to create patient');
    return patient;
  }

  async update(id: string, input: UpdatePatientInput): Promise<Patient | null> {
    const db = getDb();
    const existing = await this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const args: (string | null)[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      args.push(input.name);
    }
    if (input.phoneNumber !== undefined) {
      updates.push('phone_number = ?');
      args.push(input.phoneNumber);
    }
    if (input.notes !== undefined) {
      updates.push('notes = ?');
      args.push(input.notes);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    args.push(new Date().toISOString());
    args.push(id);

    await db.execute({
      sql: `UPDATE patients SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.execute({
      sql: 'DELETE FROM patients WHERE id = ?',
      args: [id],
    });
    return result.rowsAffected > 0;
  }

  private mapRowToPatient(row: Record<string, unknown>): Patient {
    return {
      id: row.id as string,
      doctorId: row.doctor_id as string,
      name: row.name as string,
      phoneNumber: row.phone_number as string,
      notes: row.notes as string | undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}
