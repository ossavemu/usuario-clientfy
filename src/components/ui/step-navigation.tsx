import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  showBackButton?: boolean;
  showNextButton?: boolean;
  nextLabel?: string;
  backLabel?: string;
  isUserRegistered?: boolean;
  isPhoneStep?: boolean;
  className?: string;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isNextDisabled = false,
  isBackDisabled = false,
  showBackButton = true,
  showNextButton = true,
  nextLabel = 'Siguiente',
  backLabel = 'Anterior',
  isUserRegistered = false,
  isPhoneStep = false,
  className = '',
}: StepNavigationProps) {
  // No mostrar navegación en el paso inicial (Bienvenida)
  if (currentStep === 0) return null;

  // Determinar si mostrar el botón de anterior
  const shouldShowBackButton = showBackButton && currentStep > 0;

  // Determinar si mostrar el botón de siguiente
  const shouldShowNextButton = showNextButton && currentStep < totalSteps - 1;

  // Manejar el caso especial del paso de teléfono
  const backDisabled = isPhoneStep && isUserRegistered ? true : isBackDisabled;

  return (
    <div
      className={`flex flex-col md:flex-row gap-2 justify-between mt-6 ${className}`}
    >
      {shouldShowBackButton && (
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full md:w-auto order-2 md:order-1"
          disabled={backDisabled}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {backLabel}
        </Button>
      )}
      {shouldShowNextButton && (
        <Button
          onClick={onNext}
          className="w-full md:w-auto order-1 md:order-2"
          disabled={isNextDisabled}
        >
          {nextLabel}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
