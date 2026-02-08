export const schema = `
-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  specialty TEXT,
  welcome_message TEXT NOT NULL DEFAULT '¡Hola! Soy el asistente virtual del Dr./Dra. {name}. ¿En qué puedo ayudarte?',
  payment_link TEXT,
  calendar_config TEXT NOT NULL, -- JSON: { workingHours: [...], slotDurationMinutes: number }
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('active', 'inactive', 'trial')),
  subscription_expires_at TEXT,
  -- Kapso WhatsApp integration
  kapso_setup_link_id TEXT,
  kapso_phone_number_id TEXT,
  kapso_waba_id TEXT,
  whatsapp_status TEXT DEFAULT 'pending' CHECK (whatsapp_status IN ('pending', 'connected', 'error')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  UNIQUE(doctor_id, phone_number)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  reminder_sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder ON appointments(status, scheduled_at, reminder_sent_at) 
  WHERE status IN ('confirmed', 'paid') AND reminder_sent_at IS NULL;
`;
