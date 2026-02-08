import type { Doctor, CreateDoctorInput, UpdateDoctorInput } from '../../domain/entities/doctor.js';
import type { DoctorRepository } from '../../domain/ports/doctor-repository.js';
import { getDb } from './client.js';
import { randomUUID } from 'crypto';

const DEFAULT_CALENDAR_CONFIG = {
  workingHours: [
    { day: 1, start: '09:00', end: '18:00' }, // Monday
    { day: 2, start: '09:00', end: '18:00' }, // Tuesday
    { day: 3, start: '09:00', end: '18:00' }, // Wednesday
    { day: 4, start: '09:00', end: '18:00' }, // Thursday
    { day: 5, start: '09:00', end: '18:00' }, // Friday
  ],
  slotDurationMinutes: 30,
};

export class TursoDoctorRepository implements DoctorRepository {
  async findById(id: string): Promise<Doctor | null> {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM doctors WHERE id = ?',
      args: [id],
    });
    
    if (result.rows.length === 0) return null;
    return this.mapRowToDoctor(result.rows[0]);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Doctor | null> {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM doctors WHERE phone_number = ?',
      args: [phoneNumber],
    });
    
    if (result.rows.length === 0) return null;
    return this.mapRowToDoctor(result.rows[0]);
  }

  async create(input: CreateDoctorInput & { id?: string }): Promise<Doctor> {
    const db = getDb();
    const id = input.id ?? randomUUID();
    const now = new Date().toISOString();
    
    const welcomeMessage = input.welcomeMessage ?? 
      `¡Hola! Soy el asistente virtual del Dr./Dra. ${input.name}. ¿En qué puedo ayudarte?`;
    
    await db.execute({
      sql: `
        INSERT INTO doctors (id, name, phone_number, whatsapp_number, specialty, welcome_message, payment_link, calendar_config, whitelist_mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        input.name,
        input.phoneNumber,
        input.whatsappNumber ?? null,
        input.specialty ?? null,
        welcomeMessage,
        input.paymentLink ?? null,
        JSON.stringify(DEFAULT_CALENDAR_CONFIG),
        input.whitelistMode ? 1 : 0,
        now,
        now,
      ],
    });

    const doctor = await this.findById(id);
    if (!doctor) throw new Error('Failed to create doctor');
    return doctor;
  }

  async update(id: string, input: UpdateDoctorInput): Promise<Doctor | null> {
    const db = getDb();
    const existing = await this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const args: (string | number | null)[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      args.push(input.name);
    }
    if (input.phoneNumber !== undefined) {
      updates.push('phone_number = ?');
      args.push(input.phoneNumber);
    }
    if (input.whatsappNumber !== undefined) {
      updates.push('whatsapp_number = ?');
      args.push(input.whatsappNumber);
    }
    if (input.specialty !== undefined) {
      updates.push('specialty = ?');
      args.push(input.specialty);
    }
    if (input.welcomeMessage !== undefined) {
      updates.push('welcome_message = ?');
      args.push(input.welcomeMessage);
    }
    if (input.paymentLink !== undefined) {
      updates.push('payment_link = ?');
      args.push(input.paymentLink);
    }
    if (input.whitelistMode !== undefined) {
      updates.push('whitelist_mode = ?');
      args.push(input.whitelistMode ? 1 : 0);
    }
    if (input.calendarConfig !== undefined) {
      updates.push('calendar_config = ?');
      args.push(JSON.stringify(input.calendarConfig));
    }
    if (input.subscriptionStatus !== undefined) {
      updates.push('subscription_status = ?');
      args.push(input.subscriptionStatus);
    }
    if (input.subscriptionExpiresAt !== undefined) {
      updates.push('subscription_expires_at = ?');
      args.push(input.subscriptionExpiresAt.toISOString());
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    args.push(new Date().toISOString());
    args.push(id);

    await db.execute({
      sql: `UPDATE doctors SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.execute({
      sql: 'DELETE FROM doctors WHERE id = ?',
      args: [id],
    });
    return result.rowsAffected > 0;
  }

  private mapRowToDoctor(row: Record<string, unknown>): Doctor {
    return {
      id: row.id as string,
      name: row.name as string,
      phoneNumber: row.phone_number as string,
      whatsappNumber: row.whatsapp_number as string | undefined,
      specialty: row.specialty as string | undefined,
      welcomeMessage: row.welcome_message as string,
      paymentLink: row.payment_link as string | undefined,
      whitelistMode: Boolean(row.whitelist_mode),
      calendarConfig: JSON.parse(row.calendar_config as string),
      subscriptionStatus: row.subscription_status as Doctor['subscriptionStatus'],
      subscriptionExpiresAt: row.subscription_expires_at ? new Date(row.subscription_expires_at as string) : undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}
