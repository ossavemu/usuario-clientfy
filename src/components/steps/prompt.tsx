import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StepNavigation } from '@/components/ui/step-navigation';
import { Textarea } from '@/components/ui/textarea';
import { try$ } from '@/lib/try';
import { type RegistrationData } from '@/types/registration';
import { RotateCcw, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PromptStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PromptStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: PromptStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [showRevert, setShowRevert] = useState(false);
  const [existingPrompt, setExistingPrompt] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  const requiredPrefix = data.companyName
    ? `Eres un asistente de la empresa ${data.companyName}`
    : 'Eres un asistente de la empresa';

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (
      value.length < requiredPrefix.length ||
      !value.startsWith(requiredPrefix)
    ) {
      onUpdate({
        prompt:
          requiredPrefix +
          ' ' +
          (value.length > 0 ? value.slice(requiredPrefix.length) : ''),
      });
    } else {
      onUpdate({ prompt: value });
    }
  };

  useEffect(() => {
    const loadExistingPrompt = async () => {
      if (!data.countryCode || !data.phone || hasAttemptedLoad || data.prompt)
        return;

      const phoneNumber = `${data.countryCode}${data.phone}`.replace(/\+/g, '');

      const [error, result] = await try$(
        fetch(`/api/prompt?phoneNumber=${phoneNumber}`).then((res) =>
          res.json()
        )
      );

      if (!error && result?.success && result.prompt) {
        onUpdate({ prompt: result.prompt });
        setExistingPrompt(true);
      }

      setHasAttemptedLoad(true);
    };

    loadExistingPrompt();
  }, [data.countryCode, data.phone, hasAttemptedLoad, data.prompt, onUpdate]);

  const handleSave = async () => {
    if (!data.countryCode || !data.phone || !data.prompt) {
      toast.error('Por favor, escribe un prompt antes de guardarlo');
      return;
    }

    setIsLoading(true);
    const phoneNumber = `${data.countryCode}${data.phone}`.replace(/\+/g, '');

    const [error, result] = await try$(
      fetch('/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          prompt: data.prompt,
        }),
      }).then((res) => res.json())
    );

    setIsLoading(false);

    if (error || !result?.success) {
      toast.error('Error al guardar el prompt');
      return;
    }

    toast.success('Prompt guardado exitosamente');
    setExistingPrompt(true);
    onNext();
  };

  const handleImprove = async () => {
    if (!data.prompt) {
      toast.error('Por favor, escribe un prompt antes de mejorarlo');
      return;
    }

    setIsLoading(true);
    setOriginalPrompt(data.prompt);
    setShowRevert(true);

    const [error, result] = await try$(
      fetch('/api/prompt/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: data.prompt }),
      }).then((res) => res.json())
    );

    setIsLoading(false);

    if (error || !result?.success) {
      toast.error('Error al mejorar el prompt');
      setShowRevert(false);
      return;
    }

    let improvedPrompt = result.improvedPrompt;

    if (improvedPrompt.startsWith('Eres un')) {
      if (data.companyName && !improvedPrompt.includes(data.companyName)) {
        improvedPrompt = improvedPrompt.replace(
          /empresa\s+([^\s.,]+)/i,
          `empresa ${data.companyName}`
        );
      }
    } else {
      improvedPrompt = requiredPrefix + ' ' + improvedPrompt;
    }

    onUpdate({ prompt: improvedPrompt });
    toast.success('Prompt mejorado exitosamente');
  };

  const handleRevert = () => {
    onUpdate({ prompt: originalPrompt });
    setShowRevert(false);
    toast.success('Prompt revertido a la versión original');
  };

  return (
    <div className="space-y-2 relative overflow-hidden rounded-lg">
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>¿Qué es un Prompt?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Un prompt es una instrucción o conjunto de instrucciones que le
              das a tu bot para definir su comportamiento, conocimientos y
              personalidad. Es como programar la &quot;mente&quot; de tu
              asistente virtual.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Su importancia radica en que:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Define cómo tu bot interactuará con los usuarios</li>
                <li>Establece el tono y estilo de comunicación</li>
                <li>
                  Determina qué tipo de información y ayuda puede proporcionar
                </li>
                <li>
                  Ayuda a mantener la consistencia en las respuestas del bot
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4 overflow-auto max-h-[calc(100vh-300px)] hide-scrollbar rounded-lg">
        {existingPrompt && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Ya tienes un prompt guardado. Puedes modificarlo si lo deseas.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Textarea
            value={data.prompt}
            onChange={handlePromptChange}
            placeholder={
              data.companyName
                ? `Ejemplo: Eres un asistente de la empresa ${data.companyName}. Tu objetivo es maximizar las ventas identificando las necesidades del cliente y recomendando los productos más adecuados...`
                : 'Escribe tu prompt'
            }
            className="min-h-[200px] hide-scrollbar"
            disabled={isLoading}
          />

          <div className="flex gap-4">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={handleImprove}
              disabled={isLoading}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Mejorar con IA
            </Button>

            {showRevert && (
              <Button
                className="flex-1"
                variant="outline"
                onClick={handleRevert}
                disabled={isLoading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Revertir Cambios
              </Button>
            )}
          </div>

          <Card className="bg-purple-50 p-4 space-y-2 border-purple-100">
            <p className="text-sm font-medium">
              💡 Tip: Usa el botón &quot;Mejorar con IA&quot; para:
            </p>
            <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
              <li>Hacer tu prompt más profesional y efectivo</li>
              <li>Agregar manejo de situaciones comunes</li>
              <li>Establecer límites claros para el chatbot</li>
            </ul>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white pt-2">
        <StepNavigation
          currentStep={6}
          totalSteps={8}
          onNext={handleSave}
          onBack={onBack}
          isNextDisabled={
            isLoading || !data.prompt || (!existingPrompt && !data.prompt)
          }
          nextLabel={
            existingPrompt ? 'Actualizar y Continuar' : 'Guardar y Continuar'
          }
        />
      </div>
    </div>
  );
}
