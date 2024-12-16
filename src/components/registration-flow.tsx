'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RegistrationData } from '../types/registration';
import { WelcomeSlide } from './WelcomeSlide';
import { UserInfoStep } from './steps/user-info';
import { PhoneStep } from './steps/phone';
import { ImageUploadStep } from './steps/image-upload';
import { TrainingFilesStep } from './steps/training-files';
import { PromptStep } from './steps/prompt';
import { CreateBotStep } from './steps/create-bot';

const steps = [
  'Bienvenida',
  'Información Personal',
  'Registro de Celular',
  'Subir Imágenes',
  'Archivos de Entrenamiento',
  'Prompt',
  'Crear Bot',
];

export default function RegistrationFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    countryCode: '+57',
    serviceType: 'qr',
    images: [],
    trainingFiles: [],
    prompt: '',
  });

  const updateFormData = (data: Partial<RegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-purple-700 p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md md:max-w-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold">
              {steps[currentStep]}
            </h2>
            <div className="flex gap-1 md:gap-2">
              {steps.slice(1).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full transition-all duration-300 ${
                    index === currentStep - 1
                      ? 'bg-purple-600 scale-110'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && <WelcomeSlide onGetStarted={nextStep} />}
              {currentStep === 1 && (
                <UserInfoStep
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={nextStep}
                />
              )}
              {currentStep === 2 && (
                <PhoneStep
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 3 && (
                <ImageUploadStep
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 4 && (
                <TrainingFilesStep
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 5 && (
                <PromptStep
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 6 && <CreateBotStep onBack={prevStep} />}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="w-full md:w-auto"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}
            {currentStep < steps.length - 1 && currentStep > 0 && (
              <Button
                onClick={nextStep}
                className="w-full md:w-auto md:ml-auto"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
