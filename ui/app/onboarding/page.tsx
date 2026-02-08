'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, completeOnboarding, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phoneNumber: '',
    specialty: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.phoneNumber) {
      setError('El número de teléfono es requerido');
      return;
    }

    try {
      await completeOnboarding(formData);
    } catch (err) {
      setError('Error al completar el registro. Intentá de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Bienvenido a Doctor Appointments</CardTitle>
          <CardDescription className="text-center">
            Completá tus datos para empezar a usar el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. Juan Pérez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                type="text"
                placeholder="Cardiología"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Número de WhatsApp</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+54 9 11 1234-5678"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">
                Este número se usará para recibir notificaciones de los pacientes
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Comenzar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
