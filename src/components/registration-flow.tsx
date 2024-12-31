'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RegistrationData } from '../types/registration';
import { DashboardSlide } from './DashboardSlide';
import { WelcomeSlide } from './WelcomeSlide';
import { CreateBotStep } from './steps/create-bot';
import { ImageUploadStep } from './steps/image-upload';
import { PhoneStep } from './steps/phone';
import { PromptStep } from './steps/prompt';
import { TrainingFilesStep } from './steps/training-files';
import { UserInfoStep } from './steps/user-info';

const steps = [
  { name: '', path: 'welcome' },
  { name: 'Información Personal', path: 'user-info' },
  { name: 'Registro de Celular', path: 'phone' },
  { name: 'Configuración del Asistente', path: 'prompt' },
  { name: 'Imágenes del Asistente', path: 'images' },
  { name: 'Archivos de Entrenamiento', path: 'training' },
  { name: 'Crear Asistente', path: 'create-assistant' },
];

export default function RegistrationFlow() {
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
  const [jwt, setJwt] = useState<string | null>(null);

  // Manejar cambios en el hash de la URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(2) || 'welcome'; // Eliminar '#/' y usar 'welcome' como default
      const path = hash.split('#')[0]; // Obtener la ruta base sin el hash adicional
      const stepIndex = steps.findIndex((step) => step.path === path);
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
      }
    };

    // Manejar el hash inicial
    handleHashChange();

    // Escuchar cambios en el hash
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<{ email: string }>(token);
        setJwt(token);
        setUserEmail(decoded.email);
        // Obtener los datos del usuario cuando tenemos el token
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          updateFormData(user); // Actualizar formData con los datos del usuario
          console.log('Datos del usuario cargados:', user); // Log para debug
        }
      } catch (error) {
        console.error('Token inválido:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Efecto para verificar datos iniciales cuando hay un usuario
  useEffect(() => {
    const checkInitialData = async () => {
      if (!userEmail) {
        setIsLoadingInitialData(false);
        return;
      }

      try {
        console.log('Verificando datos iniciales para:', userEmail); // Log para debug

        // Obtener datos del usuario
        const userResponse = await fetch(`/api/user?email=${userEmail}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('Datos del usuario recibidos:', userData); // Log para debug
          if (userData.user) {
            updateFormData(userData.user);
          }
        }

        // Verificar teléfono registrado
        const phoneResponse = await fetch(`/api/phone?email=${userEmail}`);
        if (phoneResponse.ok) {
          const phoneData = await phoneResponse.json();
          console.log('Datos del teléfono recibidos:', phoneData); // Log para debug
          if (phoneData.phone) {
            updateFormData(phoneData.phone);
          }
        }

        // Verificar prompt
        const promptResponse = await fetch(`/api/prompt?email=${userEmail}`);
        if (promptResponse.ok) {
          const promptData = await promptResponse.json();
          console.log('Datos del prompt recibidos:', promptData); // Log para debug
          if (promptData.prompt) {
            updateFormData({ prompt: promptData.prompt });
          }
        }
      } catch (error) {
        console.error('Error al verificar datos iniciales:', error);
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    checkInitialData();
  }, [userEmail]);

  const updateFormData = (data: Partial<RegistrationData>) => {
    console.log('Actualizando formData con:', data); // Log para debug
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleRegistration = async () => {
    try {
      // Validar que tengamos todos los campos necesarios
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        typeof formData.password !== 'object'
      ) {
        return; // No mostrar error aquí, ya se maneja en UserInfoStep
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || '',
          countryCode: formData.countryCode || '',
          serviceType: formData.serviceType || 'whatsapp',
          images: formData.images || [],
          trainingFiles: [],
          prompt: formData.prompt || '',
          assistantName: formData.assistantName || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUserEmail(data.user.email);
        updateFormData(data.user);
        window.location.hash = '/phone';
      }
    } catch (error) {
      console.error('Error durante el registro:', error);
      if (error instanceof Error) {
        alert(error.message);
      }
      // Regresar al paso de registro en caso de error
      window.location.hash = '/user-info';
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      handleRegistration();
      return;
    }
    const nextIndex = Math.min(currentStep + 1, steps.length - 1);
    window.location.hash = '/' + steps[nextIndex].path;
  };

  const prevStep = () => {
    const prevIndex = Math.max(currentStep - 1, 0);
    window.location.hash = '/' + steps[prevIndex].path;
  };

  const goToStep = (stepIndex: number) => {
    window.location.hash = '/' + steps[stepIndex].path;
  };

  const renderStep = () => {
    if (userEmail && currentStep === 0) {
      if (isLoadingInitialData) {
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-gray-600">Cargando información...</p>
          </div>
        );
      }
      return (
        <DashboardSlide
          data={formData}
          onNavigate={goToStep}
          userEmail={userEmail}
          onUpdate={updateFormData}
        />
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <WelcomeSlide
            onGetStarted={() => {
              window.location.hash = '/user-info';
            }}
            onLogin={() => {
              window.location.hash = '/user-info';
              // Pequeño delay para asegurar que el hash se actualice correctamente
              setTimeout(() => {
                window.location.hash = '/user-info#login';
              }, 0);
            }}
          />
        );
      case 1:
        return (
          <UserInfoStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleRegistration}
          />
        );
      case 2:
        return (
          <PhoneStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <PromptStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <ImageUploadStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <TrainingFilesStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 6:
        return <CreateBotStep />;
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
