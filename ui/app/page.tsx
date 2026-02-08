'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, Clock, Settings } from 'lucide-react';
import { AppointmentsTab } from './components/appointments-tab';
import { PatientsTab } from './components/patients-tab';
import { SettingsTab } from './components/settings-tab';

// TODO: Get from auth context or env
const DOCTOR_ID = 'doctor-id-placeholder';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Appointments</h1>
              <p className="text-sm text-gray-500">Panel de administración</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Activo
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Turnos</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Pacientes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuración</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <AppointmentsTab doctorId={DOCTOR_ID} />
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <PatientsTab doctorId={DOCTOR_ID} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsTab doctorId={DOCTOR_ID} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
