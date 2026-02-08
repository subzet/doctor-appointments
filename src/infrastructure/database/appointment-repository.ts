import type { 
  Appointment, 
  CreateAppointmentInput, 
  UpdateAppointmentInput, 
  TimeSlot 
} from '../../domain/entities/appointment.js';
import type { AppointmentRepository } from '../../domain/ports/appointment-repository.js';
import type { Doctor } from '../../domain/entities/doctor.js';
import { getDb } from './client.js';
import { randomUUID } from 'crypto';

export class TursoAppointmentRepository implements AppointmentRepository {
  async findById(id: string): Promise<Appointment | null> {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM appointments WHERE id = ?',
      args: [id],
    });
    
    if (result.rows.length === 0) return null;
    return this.mapRowToAppointment(result.rows[0]);
  }

  async findByDoctorId(doctorId: string, from: Date, to: Date): Promise<Appointment[]> {
    const db = getDb();
    const result = await db.execute({
      sql: `
        SELECT * FROM appointments 
        WHERE doctor_id = ? 
        AND scheduled_at >= ? 
        AND scheduled_at < ?
        ORDER BY scheduled_at
      `,
      args: [doctorId, from.toISOString(), to.toISOString()],
    });
    
    return result.rows.map(row => this.mapRowToAppointment(row));
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM appointments WHERE patient_id = ? ORDER BY scheduled_at DESC',
      args: [patientId],
    });
    
    return result.rows.map(row => this.mapRowToAppointment(row));
  }

  async findPendingReminders(thresholdMinutes: number): Promise<Appointment[]> {
    const db = getDb();
    const threshold = new Date();
    threshold.setMinutes(threshold.getMinutes() + thresholdMinutes);
    
    const result = await db.execute({
      sql: `
        SELECT * FROM appointments 
        WHERE status IN ('confirmed', 'paid') 
        AND reminder_sent_at IS NULL
        AND scheduled_at <= ?
        AND scheduled_at > datetime('now')
        ORDER BY scheduled_at
      `,
      args: [threshold.toISOString()],
    });
    
    return result.rows.map(row => this.mapRowToAppointment(row));
  }

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const db = getDb();
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `
        INSERT INTO appointments (id, doctor_id, patient_id, scheduled_at, status, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        input.doctorId,
        input.patientId,
        input.scheduledAt.toISOString(),
        'pending',
        input.notes ?? null,
        now,
        now,
      ],
    });

    const appointment = await this.findById(id);
    if (!appointment) throw new Error('Failed to create appointment');
    return appointment;
  }

  async update(id: string, input: UpdateAppointmentInput): Promise<Appointment | null> {
    const db = getDb();
    const existing = await this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const args: (string | null)[] = [];

    if (input.scheduledAt !== undefined) {
      updates.push('scheduled_at = ?');
      args.push(input.scheduledAt.toISOString());
    }
    if (input.status !== undefined) {
      updates.push('status = ?');
      args.push(input.status);
    }
    if (input.notes !== undefined) {
      updates.push('notes = ?');
      args.push(input.notes);
    }
    if (input.reminderSentAt !== undefined) {
      updates.push('reminder_sent_at = ?');
      args.push(input.reminderSentAt.toISOString());
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    args.push(new Date().toISOString());
    args.push(id);

    await db.execute({
      sql: `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.execute({
      sql: 'DELETE FROM appointments WHERE id = ?',
      args: [id],
    });
    return result.rowsAffected > 0;
  }

  async getAvailableSlots(doctorId: string, date: Date): Promise<TimeSlot[]> {
    // This is a placeholder implementation
    // In a real implementation, we'd fetch the doctor's calendar config
    // and calculate available slots based on working hours and existing appointments
    const db = getDb();
    
    // Get doctor's calendar config
    const doctorResult = await db.execute({
      sql: 'SELECT calendar_config FROM doctors WHERE id = ?',
      args: [doctorId],
    });
    
    if (doctorResult.rows.length === 0) return [];
    
    const calendarConfig = JSON.parse(doctorResult.rows[0].calendar_config as string) as Doctor['calendarConfig'];
    
    // Get existing appointments for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const appointments = await this.findByDoctorId(doctorId, startOfDay, endOfDay);
    const bookedSlots = new Set(appointments.map(a => a.scheduledAt.toISOString()));
    
    // Generate available slots
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const workingDay = calendarConfig.workingHours.find(wh => wh.day === dayOfWeek);
    
    if (!workingDay) return []; // Doctor doesn't work on this day
    
    const [startHour, startMinute] = workingDay.start.split(':').map(Number);
    const [endHour, endMinute] = workingDay.end.split(':').map(Number);
    
    let currentSlot = new Date(date);
    currentSlot.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + calendarConfig.slotDurationMinutes);
      
      slots.push({
        start: new Date(currentSlot),
        end: slotEnd,
        available: !bookedSlots.has(currentSlot.toISOString()),
      });
      
      currentSlot = slotEnd;
    }
    
    return slots;
  }

  private mapRowToAppointment(row: Record<string, unknown>): Appointment {
    return {
      id: row.id as string,
      doctorId: row.doctor_id as string,
      patientId: row.patient_id as string,
      scheduledAt: new Date(row.scheduled_at as string),
      status: row.status as Appointment['status'],
      notes: row.notes as string | undefined,
      reminderSentAt: row.reminder_sent_at ? new Date(row.reminder_sent_at as string) : undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}
