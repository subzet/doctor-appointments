'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { Patient, Appointment } from '@/lib/types';
import { Search, Phone, Calendar, User } from 'lucide-react';

interface PatientsTabProps {
  doctorId: string;
}

export function PatientsTab({ doctorId }: PatientsTabProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    loadPatients();
  }, [doctorId]);

  async function loadPatients() {
    try {
      setLoading(true);
      const data = await api.getPatients(doctorId);
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPatientAppointments(patientId: string) {
    try {
      const data = await api.getPatientAppointments(patientId);
      setPatientAppointments(data);
    } catch (error) {
      console.error('Failed to load patient appointments:', error);
    }
  }

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phoneNumber.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de pacientes</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{patients.length}</div>
          <p className="text-xs text-muted-foreground">Pacientes registrados</p>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pacientes</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Cargando pacientes...</p>
          ) : filteredPatients.length === 0 ? (
            <p className="text-muted-foreground">No se encontraron pacientes</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {patient.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(patient.createdAt), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              loadPatientAppointments(patient.id);
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Historial
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{patient.name}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Teléfono</p>
                                <p className="font-medium">{patient.phoneNumber}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Registrado</p>
                                <p className="font-medium">
                                  {format(parseISO(patient.createdAt), 'dd/MM/yyyy', { locale: es })}
                                </p>
                              </div>
                            </div>

                            {patient.notes && (
                              <div>
                                <p className="text-sm text-muted-foreground">Notas</p>
                                <p className="font-medium">{patient.notes}</p>
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-medium mb-2">Historial de turnos</p>
                              {patientAppointments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay turnos registrados</p>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Fecha</TableHead>
                                      <TableHead>Estado</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {patientAppointments.map((apt) => (
                                      <TableRow key={apt.id}>
                                        <TableCell>
                                          {format(parseISO(apt.scheduledAt), 'dd/MM/yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell className="capitalize">{apt.status}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
