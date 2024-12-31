import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepNavigation } from '@/components/ui/step-navigation';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { type RegistrationData } from '../../types/registration';

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

  // Cargar prompt existente
  useEffect(() => {
    const loadExistingPrompt = async () => {
      if (!data.countryCode || !data.phone) return;

      try {
        const phoneNumber = `${data.countryCode}${data.phone}`.replace(
          /\+/g,
          ''
        );
        const response = await fetch(`/api/prompt?phoneNumber=${phoneNumber}`);

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.prompt && !data.prompt) {
            onUpdate({ prompt: result.prompt });
            setExistingPrompt(true);
          }
        } else if (response.status !== 404) {
          console.error('Error al cargar prompt:', await response.text());
        }
      } catch (error) {
        console.error('Error al cargar prompt:', error);
      }
    };

    if (!existingPrompt) {
      loadExistingPrompt();
    }
  }, [data.countryCode, data.phone, existingPrompt]);

  // Guardar prompt
  const handleSave = async () => {
    if (!data.countryCode || !data.phone || !data.prompt) {
      toast.error('Por favor, escribe un prompt antes de guardarlo');
      return;
    }

    setIsLoading(true);
    try {
      const phoneNumber = `${data.countryCode}${data.phone}`.replace(/\+/g, '');
      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          prompt: data.prompt,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Prompt guardado exitosamente');
        setExistingPrompt(true);
        onNext();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Error al guardar el prompt');
    } finally {
      setIsLoading(false);
    }
  };

  // Mejorar prompt con IA
  const handleImprove = async () => {
    if (!data.prompt) {
      toast.error('Por favor, escribe un prompt antes de mejorarlo');
      return;
    }

    setIsLoading(true);
    try {
      setOriginalPrompt(data.prompt);
      setShowRevert(true);

      const response = await fetch('/api/prompt/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: data.prompt }),
      });

      const result = await response.json();

      if (result.success && result.improvedPrompt) {
        onUpdate({ prompt: result.improvedPrompt });
        toast.success('Prompt mejorado exitosamente');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Error al mejorar el prompt');
      setShowRevert(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Revertir cambios
  const handleRevert = () => {
    onUpdate({ prompt: originalPrompt });
    setShowRevert(false);
    toast.success('Prompt revertido a la versión original');
  };

  return (
    <div className="space-y-2 relative overflow-hidden rounded-lg">
      <div className="space-y-2 overflow-auto max-h-[calc(100vh-300px)] hide-scrollbar rounded-lg">
        <Card>
          <CardContent className="pt-4">
            {existingPrompt ? (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
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
                      Ya tienes un prompt guardado. Puedes modificarlo si lo
                      deseas.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Debes crear y guardar un prompt antes de continuar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground mb-4">
              Un prompt es una instrucción o conjunto de instrucciones que le
              das a tu bot para definir su comportamiento, conocimientos y
              personalidad. Es como programar la "mente" de tu asistente
              virtual. Su importancia radica en que:
            </p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              <li>Define cómo tu bot interactuará con los usuarios</li>
              <li>Establece el tono y estilo de comunicación</li>
              <li>
                Determina qué tipo de información y ayuda puede proporcionar
              </li>
              <li>
                Ayuda a mantener la consistencia en las respuestas del bot
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Textarea
            value={data.prompt}
            onChange={(e) => onUpdate({ prompt: e.target.value })}
            placeholder="Ejemplo: Eres un vendedor experto en gafas de sol de OpticaVision. Tu objetivo es maximizar las ventas identificando las necesidades del cliente y recomendando los productos más adecuados. Tienes acceso a un catálogo de imágenes y documentos técnicos que puedes compartir con los clientes. Manejas productos que van desde 20 USD hasta 150 USD y estás ubicado en Plaza Central, Local 23. Debes mostrar empatía, conocimiento profundo del producto y usar técnicas de venta consultiva. Al interactuar con clientes, prioriza entender su estilo de vida y presupuesto. Maneja objeciones sobre precio enfatizando calidad y garantía. Nunca presiones al cliente ni menciones a la competencia..."
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

          <div className="bg-purple-50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">
              💡 Tip: Usa el botón "Mejorar con IA" para:
            </p>
            <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
              <li>Hacer tu prompt más profesional y efectivo</li>
              <li>Agregar manejo de situaciones comunes</li>
              <li>Establecer límites claros para el chatbot</li>
            </ul>
          </div>
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
