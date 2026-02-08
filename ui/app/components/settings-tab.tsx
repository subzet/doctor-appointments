'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { Doctor, WhitelistEntry } from '@/lib/types';
import { Save, Clock, CreditCard, MessageSquare, Phone, Shield, Trash2, Plus } from 'lucide-react';

interface SettingsTabProps {
  doctorId: string;
}

export function SettingsTab({ doctorId }: SettingsTabProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whitelistMode, setWhitelistMode] = useState(false);
  const [slotDuration, setSlotDuration] = useState(30);
  
  // New whitelist entry
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [addingToWhitelist, setAddingToWhitelist] = useState(false);

  useEffect(() => {
    loadData();
  }, [doctorId]);

  async function loadData() {
    try {
      setLoading(true);
      const [doctorData, whitelistData] = await Promise.all([
        api.getDoctor(doctorId),
        api.getWhitelist(doctorId),
      ]);
      setDoctor(doctorData);
      setWhitelist(whitelistData);
      setWelcomeMessage(doctorData.welcomeMessage);
      setPaymentLink(doctorData.paymentLink || '');
      setWhatsappNumber(doctorData.whatsappNumber || '');
      setWhitelistMode(doctorData.whitelistMode);
      setSlotDuration(doctorData.calendarConfig.slotDurationMinutes);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await api.updateDoctor(doctorId, {
        welcomeMessage,
        paymentLink,
        whatsappNumber,
        whitelistMode,
      });
      alert('Configuración guardada');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddToWhitelist() {
    if (!newPhoneNumber) return;
    
    try {
      setAddingToWhitelist(true);
      await api.addToWhitelist(doctorId, {
        phoneNumber: newPhoneNumber,
        patientName: newPatientName || undefined,
      });
      setNewPhoneNumber('');
      setNewPatientName('');
      await loadData();
    } catch (error) {
      console.error('Failed to add to whitelist:', error);
      alert('Error al agregar el número');
    } finally {
      setAddingToWhitelist(false);
    }
  }

  async function handleRemoveFromWhitelist(id: string) {
    if (!confirm('¿Estás seguro de que querés eliminar este número?')) return;
    
    try {
      await api.removeFromWhitelist(id);
      await loadData();
    } catch (error) {
      console.error('Failed to remove from whitelist:', error);
      alert('Error al eliminar el número');
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

      {/* WhatsApp Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            <CardTitle>Configuración de WhatsApp</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Número de WhatsApp Business</Label>
            <Input
              id="whatsapp"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+54 9 11 1234-5678"
            />
            <p className="text-xs text-muted-foreground">
              Este es el número que los pacientes usarán para contactarte por WhatsApp.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Whitelist Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Lista de autorizados (Whitelist)</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="whitelist-mode" className="text-sm">Activar</Label>
              <Switch
                id="whitelist-mode"
                checked={whitelistMode}
                onCheckedChange={setWhitelistMode}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {whitelistMode ? (
            <>
              <p className="text-sm text-muted-foreground">
                Cuando está activo, solo los números en esta lista pueden usar el bot para reservar turnos.
                Útil para períodos de prueba.
              </p>

              {/* Add new entry */}
              <div className="flex gap-2">
                <Input
                  placeholder="Número de teléfono"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                />
                <Input
                  placeholder="Nombre del paciente (opcional)"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                />
                <Button 
                  onClick={handleAddToWhitelist} 
                  disabled={!newPhoneNumber || addingToWhitelist}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Whitelist entries */}
              {whitelist.length > 0 ? (
                <div className="space-y-2">
                  {whitelist.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{entry.phoneNumber}</p>
                        {entry.patientName && (
                          <p className="text-sm text-muted-foreground">{entry.patientName}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFromWhitelist(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay números en la lista. Agregá números para permitirles usar el bot.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              El modo whitelist está desactivado. Cualquier paciente puede usar el bot para reservar turnos.
              Activá esta opción si querés restringir el acceso solo a números autorizados.
            </p>
          )}
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
