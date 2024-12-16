import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Wand2 } from 'lucide-react';
import { type RegistrationData } from '../../types/registration';

interface PromptStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PromptStep({ data, onUpdate }: PromptStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">¿Qué es un prompt?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Un prompt es una instrucción o conjunto de instrucciones que le das
            a tu bot para definir su comportamiento, conocimientos y
            personalidad. Es como programar la "mente" de tu asistente virtual.
          </p>
          <h4 className="text-md font-medium mb-2">¿Por qué es importante?</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
            <li>Define cómo tu bot interactuará con los usuarios</li>
            <li>Establece el tono y estilo de comunicación</li>
            <li>
              Determina qué tipo de información y ayuda puede proporcionar
            </li>
            <li>Ayuda a mantener la consistencia en las respuestas del bot</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Un buen prompt puede hacer la diferencia entre un bot básico y uno
            verdaderamente útil y engaging para tus usuarios.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Textarea
          value={data.prompt}
          onChange={(e) => onUpdate({ prompt: e.target.value })}
          placeholder="Escribe tu prompt aquí. Por ejemplo: 'Eres un asistente amigable especializado en atención al cliente para una tienda de electrónicos...'"
          className="min-h-[200px]"
        />
        <Button className="w-full" variant="secondary">
          <Wand2 className="w-4 h-4 mr-2" />
          Mejorar con IA
        </Button>
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
  );
}
