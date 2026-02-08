import { Doctor, Patient, Appointment, TimeSlot, WhitelistEntry } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth / Onboarding
  createOrGetDoctor: (data: { uid: string; name: string; email: string }) =>
    fetchApi<{ doctor: Doctor; isNew: boolean }>('/auth/doctor', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Doctors
  getDoctor: (id: string) => fetchApi<Doctor>(`/doctors/${id}`),
  updateDoctor: (id: string, data: Partial<Doctor>) =>
    fetchApi<Doctor>(`/doctors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Whitelist
  getWhitelist: (doctorId: string) =>
    fetchApi<WhitelistEntry[]>(`/doctors/${doctorId}/whitelist`),
  addToWhitelist: (doctorId: string, data: { phoneNumber: string; patientName?: string; notes?: string }) =>
    fetchApi<WhitelistEntry>(`/doctors/${doctorId}/whitelist`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  removeFromWhitelist: (id: string) =>
    fetchApi<{ status: string }>(`/whitelist/${id}`, { method: 'DELETE' }),

  // Patients
  getPatients: (doctorId: string) => fetchApi<Patient[]>(`/doctors/${doctorId}/patients`),
  getPatient: (id: string) => fetchApi<Patient>(`/patients/${id}`),

  // Appointments
  getAppointments: (doctorId: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return fetchApi<Appointment[]>(`/doctors/${doctorId}/appointments?${params}`);
  },
  getPatientAppointments: (patientId: string) =>
    fetchApi<Appointment[]>(`/patients/${patientId}/appointments`),
  cancelAppointment: (id: string) =>
    fetchApi<{ status: string }>(`/appointments/${id}/cancel`, { method: 'POST' }),

  // Slots
  getSlots: (doctorId: string, date: string) =>
    fetchApi<TimeSlot[]>(`/doctors/${doctorId}/slots?date=${date}`),
};
