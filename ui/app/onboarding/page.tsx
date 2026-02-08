'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, ExternalLink, Smartphone } from 'lucide-react';
import { api } from '@/lib/api';

export default function OnboardingPage() {
  const { user, completeOnboarding, loading: authLoading } = useAuth();
  const [step, setStep] = useState<'profile' | 'whatsapp'>('profile');
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    specialty: '',
  });
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [setupLinkUrl, setSetupLinkUrl] = useState<string | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<'pending' | 'connected' | 'error'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check WhatsApp status periodically when in whatsapp step
  useEffect(() => {
    if (step !== 'whatsapp' || !doctorId) return;

    const checkStatus = async () => {
      try {
        const status = await api.getWhatsappStatus(doctorId);
        setWhatsappStatus(status.status);
        
        if (status.status === 'connected') {
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (err) {
        console.error('Error checking WhatsApp status:', err);
      }
    };

    // Check immediately and then every 5 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, [step, doctorId]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name) {
      setError('El nombre es requerido');
      setLoading(false);
      return;
    }

    try {
      const result = await completeOnboarding({
        name: formData.name,
        specialty: formData.specialty,
      });
      
      if (result.doctor) {
        setDoctorId(result.doctor.id);
        setStep('whatsapp');
      }
    } catch (err) {
      setError('Error al completar el registro. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSetupLink = async () => {
    if (!doctorId) return;
    
    setLoading(true);
    setError('');

    try {
      const result = await api.createSetupLink(doctorId);
      setSetupLinkUrl(result.url);
      
      // Open Kapso setup link in new tab
      window.open(result.url, '_blank');
    } catch (err) {
      setError('Error al crear el link de configuración. Intentá de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Skip WhatsApp setup and go to dashboard
    window.location.href = '/';
  };

  if (step === 'profile') {
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
            <form onSubmit={handleProfileSubmit} className="space-y-4">
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

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || authLoading}
              >
                {loading || authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // WhatsApp Setup Step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Conectá tu WhatsApp</CardTitle>
          <CardDescription className="text-center">
            Conectá tu número de WhatsApp para recibir mensajes de los pacientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {whatsappStatus === 'connected' ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-lg font-medium">¡WhatsApp conectado! ✅</p>
              <p className="text-sm text-gray-500">
                Tu número de WhatsApp está listo para recibir mensajes de los pacientes.
              </p>
              <p className="text-sm text-gray-500">
                Redirigiendo al dashboard...
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-600">
                  Para que los pacientes puedan contactarte por WhatsApp, necesitás conectar tu número 
                  a través de nuestra plataforma segura.
                </p>
                <p className="text-xs text-gray-500">
                  El proceso toma solo 2 minutos y es completamente seguro.
                </p>
              </div>

              {setupLinkUrl ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      ✅ Link de configuración generado
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Se abrió en una nueva pestaña. Completá el proceso y volvé acá.
                    </p>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Esperando conexión... </span>
                  </div>

                  <a
                    href={setupLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center justify-center"
                  >
                    Abrir link nuevamente
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              ) : (
                <Button 
                  onClick={handleCreateSetupLink}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando link...
                    </>
                  ) : (
                    'Conectar WhatsApp'
                  )}
                </Button>
              )}

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <div className="pt-4 border-t">
                <Button 
                  variant="ghost" 
                  onClick={handleSkip}
                  className="w-full text-gray-500"
                >
                  Conectar después
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
