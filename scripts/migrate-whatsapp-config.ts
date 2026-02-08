import { getDb, closeDb } from '../src/infrastructure/database/client.js';

const migration = `
-- Add whatsapp_number and whitelist_mode to doctors table
ALTER TABLE doctors ADD COLUMN whatsapp_number TEXT;
ALTER TABLE doctors ADD COLUMN whitelist_mode INTEGER NOT NULL DEFAULT 0;

-- Create whitelist table for allowed phone numbers
CREATE TABLE IF NOT EXISTS doctor_whitelist (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  patient_name TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  UNIQUE(doctor_id, phone_number)
);

CREATE INDEX IF NOT EXISTS idx_whitelist_doctor ON doctor_whitelist(doctor_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_phone ON doctor_whitelist(phone_number);
`;

async function migrate() {
  console.log('Running migration: add whatsapp config and whitelist...');
  
  const db = getDb();
  
  try {
    await db.executeMultiple(migration);
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDb();
  }
}

migrate();
