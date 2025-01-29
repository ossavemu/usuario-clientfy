'use client';

import { DashboardSlide } from '@/components/DashboardSlide';
import { CreateBotStep } from '@/components/steps/create-bot';
import { ImageUploadStep } from '@/components/steps/image-upload';
import { PhoneStep } from '@/components/steps/phone';
import { PromptStep } from '@/components/steps/prompt';
import { TrainingFilesStep } from '@/components/steps/training-files';
import { Card, CardContent } from '@/components/ui/card';
import { type RegistrationData } from '@/types/registration';
import { AnimatePresence, motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const steps = [
  { name: 'Dashboard', path: '' },
  { name: 'Registro de Celular', path: 'phone' },
  { name: 'Configuración del Asistente', path: 'prompt' },
  { name: 'Imágenes del Asistente', path: 'images' },
  { name: 'Archivos de Entrenamiento', path: 'training' },
  { name: 'Crear Asistente', path: 'create-assistant' },
];

export default function RegistrationFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    countryCode: '',
    serviceType: 'qr',
    images: [],
    trainingFiles: [],
    prompt: '',
    assistantName: '',
  });

  const [isCheckingPanel, setIsCheckingPanel] = useState(false);
  const [existingInstance, setExistingInstance] = useState<{
    exists: boolean;
    ip: string | null;
    isActive: boolean;
    hasQr: boolean;
  } | null>(null);

  const updateFormData = useCallback((data: Partial<RegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const nextStep = () => {
    const nextIndex = Math.min(currentStep + 1, steps.length - 1);
    window.location.hash = '/' + steps[nextIndex].path;
    setCurrentStep(nextIndex);
  };

  const prevStep = () => {
    if (currentStep === 1 && userEmail) {
      window.location.href = '/dashboard';
      return;
    }

    const prevIndex = Math.max(currentStep - 1, 0);
    window.location.hash = '/' + steps[prevIndex].path;
    setCurrentStep(prevIndex);
  };

  const goToStep = (stepIndex: number) => {
    window.location.hash = '/' + steps[stepIndex].path;
    setCurrentStep(stepIndex);
  };

  // Efecto para cargar el token y email del usuario
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }

        const decoded = jwtDecode<{ email: string }>(token);
        setUserEmail(decoded.email);

        // Cargar datos del usuario desde localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          updateFormData(user);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    loadUserData();
  }, [router, updateFormData]);

  // Manejar cierre de sesión
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }),
        });
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/');
    }
  };

  useEffect(() => {
    // Limpiar estados al cambiar de paso
    if (currentStep !== 5) {
      setExistingInstance(null);
      setIsCheckingPanel(false);
    }
  }, [currentStep]);

  const handleStepChange = async (stepIndex: number) => {
    if (stepIndex === 5) {
      setIsCheckingPanel(true);
      try {
        const response = await fetch(`/api/instance/verify?email=${userEmail}`);
        const data = await response.json();
        setExistingInstance(data);
      } catch (error) {
        console.error('Error al verificar instancia:', error);
        toast.error('Error al verificar la instancia existente');
      } finally {
        setIsCheckingPanel(false);
      }
    }
    goToStep(stepIndex);
  };

  const renderStep = () => {
    if (isLoadingInitialData) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      );
    }

    if (isCheckingPanel) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Verificando instancia existente...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <DashboardSlide
            data={formData}
            onNavigate={handleStepChange}
            userEmail={userEmail}
            onUpdate={updateFormData}
            onLogout={handleLogout}
          />
        );
      case 1:
        return (
          <PhoneStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 2:
        return (
          <PromptStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <ImageUploadStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <TrainingFilesStep
            data={formData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <CreateBotStep
            phoneNumber={formData.phone}
            userEmail={userEmail || ''}
            existingInstance={existingInstance}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-[500px]">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
