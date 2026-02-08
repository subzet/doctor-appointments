'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { Appointment, AppointmentStatus } from '@/lib/types';
import { CalendarIcon, XCircle, Clock, CheckCircle } from 'lucide-react';

interface AppointmentsTabProps {
  doctorId: string;
}

const statusLabels: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  paid: 'Pagado',
  completed: 'Completado',
  cancelled: 'Cancelado',
  no_show: 'No asistió',
};

const statusColors: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-orange-100 text-orange-800',
};

export function AppointmentsTab({ doctorId }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    loadAppointments();
  }, [doctorId, date]);

  async function loadAppointments() {
    try {
      setLoading(true);
      const from = date ? format(date, 'yyyy-MM-dd') : undefined;
      const to = date ? format(new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') : undefined;
      const data = await api.getAppointments(doctorId, from, to);
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(appointmentId: string) {
    if (!confirm('¿Estás seguro de que querés cancelar este turno?')) return;
    
    try {
      await api.cancelAppointment(appointmentId);
      await loadAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('Error al cancelar el turno');
    }
  }

  const upcomingAppointments = appointments.filter(
    (a) => ['pending', 'confirmed', 'paid'].includes(a.status)
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos turnos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">En los próximos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter((a) => a.status === 'confirmed' || a.status === 'paid').length}
            </div>
            <p className="text-xs text-muted-foreground">Pagados y confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter((a) => a.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Esperando confirmación</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Calendario</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Cargando turnos...</p>
          ) : appointments.length === 0 ? (
            <p className="text-muted-foreground">No hay turnos programados</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {format(parseISO(appointment.scheduledAt), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(appointment.scheduledAt), 'HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {appointment.patientId}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[appointment.status]}>
                        {statusLabels[appointment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(appointment.id)}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
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
