'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Doctor } from '@/lib/types';
import { Save, Clock, CreditCard, MessageSquare } from 'lucide-react';

interface SettingsTabProps {
  doctorId: string;
}

export function SettingsTab({ doctorId }: SettingsTabProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [slotDuration, setSlotDuration] = useState(30);

  useEffect(() => {
    loadDoctor();
  }, [doctorId]);

  async function loadDoctor() {
    try {
      setLoading(true);
      const data = await api.getDoctor(doctorId);
      setDoctor(data);
      setWelcomeMessage(data.welcomeMessage);
      setPaymentLink(data.paymentLink || '');
      setSlotDuration(data.calendarConfig.slotDurationMinutes);
    } catch (error) {
      console.error('Failed to load doctor:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      // TODO: Implement update API
      alert('Configuración guardada (simulado)');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Cargando configuración...</p>;
  }

  if (!doctor) {
    return <p className="text-muted-foreground">No se encontró el perfil</p>;
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado de suscripción</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge 
              variant={doctor.subscriptionStatus === 'active' ? 'default' : 'secondary'}
              className={
                doctor.subscriptionStatus === 'active' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                  : doctor.subscriptionStatus === 'trial'
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                  : ''
              }
            >
              {doctor.subscriptionStatus === 'active' 
                ? 'Activa' 
                : doctor.subscriptionStatus === 'trial'
                ? 'Período de prueba'
                : 'Inactiva'}
            </Badge>
            {doctor.subscriptionExpiresAt && (
              <span className="text-sm text-muted-foreground">
                Vence: {new Date(doctor.subscriptionExpiresAt).toLocaleDateString('es-AR')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Mensaje de bienvenida</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcome">
              Mensaje que reciben los pacientes al iniciar una conversación
            </Label>
            <Textarea
              id="welcome"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={4}
              placeholder="¡Hola! Soy el asistente virtual..."
            />
            <p className="text-xs text-muted-foreground">
              Este mensaje se envía automáticamente cuando un paciente te escribe por primera vez.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Configuración de pago</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment">Link de Mercado Pago</Label>
            <Input
              id="payment"
              value={paymentLink}
              onChange={(e) => setPaymentLink(e.target.value)}
              placeholder="https://mpago.la/..."
            />
            <p className="text-xs text-muted-foreground">
              Este link se envía a los pacientes para que puedan abonar la consulta antes del turno.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Configuración de turnos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración de cada turno (minutos)</Label>
            <Input
              id="duration"
              type="number"
              value={slotDuration}
              onChange={(e) => setSlotDuration(parseInt(e.target.value))}
              min={15}
              max={120}
              step={15}
            />
          </div>

          <div className="space-y-2">
            <Label>Horarios de atención</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctor.calendarConfig.workingHours.map((wh, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][wh.day]}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {wh.start} - {wh.end}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Los horarios de atención se configuran manualmente. Contactá soporte para modificarlos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
}
