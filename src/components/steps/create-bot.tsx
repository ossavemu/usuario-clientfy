'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Bot, Calendar, QrCode, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface InstanceInfo {
  instanceName: string;
  ip: string;
  state: string;
  created: string;
  provider: string;
  numberphone: string;
  dropletId: number;
}

export function CreateBotStep() {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutos en segundos
  const [instanceInfo, setInstanceInfo] = useState<InstanceInfo | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Creando el bot...');
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qrIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Nuevos estados para las opciones
  const [enableAppointments, setEnableAppointments] = useState(false);
  const [enableAutoInvite, setEnableAutoInvite] = useState(false);

  useEffect(() => {
    if (isCreating) {
      // Crear instancia
      //crearInstancia();

      // Iniciar contador de tiempo
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setIsCreating(false);
            setMessage('Tiempo de espera agotado.');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
        }
        if (qrIntervalRef.current) {
          clearInterval(qrIntervalRef.current);
        }
      };
    }
  }, [isCreating]);

  /*   const crearInstancia = async () => {
    try {
      const response = await fetch(`${ORQUESTA_URL}/api/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numberphone,
          provider: 'baileys',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Instancia creada. Verificando estado...');
        // Iniciar verificación de estado cada 10 segundos
        statusIntervalRef.current = setInterval(() => {
          verificarEstado();
        }, 10000);
      } else {
        // Manejar error
        setMessage('Error al crear la instancia.');
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error al crear la instancia:', error);
      setMessage('Error al crear la instancia.');
      setIsCreating(false);
    }
  };

  const verificarEstado = async () => {
    try {
      const response = await fetch(
        `${ORQUESTA_URL}/api/instance/status/${numberphone}`
      );
      const data = await response.json();

      if (data.status === 'completed') {
        setMessage('Instancia creada exitosamente. Obteniendo QR...');
        setInstanceInfo(data.instanceInfo);
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
        }
        // Obtener el QR inicial
        actualizarQr(data.instanceInfo.ip);
        // Iniciar actualización del QR cada 30 segundos
        qrIntervalRef.current = setInterval(() => {
          actualizarQr(data.instanceInfo.ip);
        }, 30000);
      } else {
        setProgress(data.progress);
        setMessage(`Estado: ${data.status}. Progreso: ${data.progress}%`);
      }
    } catch (error) {
      console.error('Error al verificar el estado:', error);
      setMessage('Error al verificar el estado de la instancia.');
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      setIsCreating(false);
    }
  };

  const actualizarQr = async (ip: string) => {
    try {
      const response = await fetch(`http://${ip}:3008`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setQrUrl(url);
        setMessage(
          'Actualizando QR. Por favor, escanea el código en WS > Dispositivos Vinculados. Si no funciona, espera unos segundos a que se refresque el QR.'
        );
      } else {
        console.error('Error al obtener el QR:', response.statusText);
        setMessage('Error al obtener el QR. Intentando de nuevo...');
      }
    } catch (error) {
      console.error('Error al actualizar el QR:', error);
      setMessage('Error al actualizar el QR. Intentando de nuevo...');
    }
  };
 */
  const handleCreateBot = () => {
    setIsCreating(true);
    setProgress(0);
    setTimeLeft(180);
    setInstanceInfo(null);
    setQrUrl(null);
    setMessage('Iniciando creación del asistente inteligente...');
  };

  return (
    <div className="text-center space-y-4">
      {!isCreating && !instanceInfo ? (
        <>
          <Bot className="w-16 h-16 mx-auto text-purple-600" />
          <h3 className="text-xl font-semibold">
            ¡Configura tu Asistente Inteligente!
          </h3>
          <p className="text-muted-foreground mb-6">
            Selecciona las funciones que deseas activar en tu asistente antes de
            crearlo.
          </p>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <Label htmlFor="appointments" className="font-medium">
                      Agendar Citas
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Permite a los clientes programar citas automáticamente
                    </p>
                  </div>
                </div>
                <Switch
                  id="appointments"
                  checked={enableAppointments}
                  onCheckedChange={setEnableAppointments}
                />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <Label htmlFor="auto-invite" className="font-medium">
                      Invitación Automática
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Invita automáticamente a clientes potenciales
                    </p>
                  </div>
                </div>
                <Switch
                  id="auto-invite"
                  checked={enableAutoInvite}
                  onCheckedChange={setEnableAutoInvite}
                />
              </div>
            </Card>
          </div>

          <Button className="w-full mt-6" size="lg" onClick={handleCreateBot}>
            Crear Asistente Inteligente
          </Button>
        </>
      ) : (
        <div className="space-y-6">
          <div className="relative w-64 h-64 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="5"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#4ECDC4"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                transform="rotate(-90 50 50)"
                animate={{
                  strokeDashoffset: [2 * Math.PI * 45, 0],
                  stroke: [
                    '#FF6B6B',
                    '#4ECDC4',
                    '#45B7D1',
                    '#FFA07A',
                    '#98D8C8',
                  ],
                }}
                transition={{
                  strokeDashoffset: {
                    duration: 180,
                    ease: 'linear',
                  },
                  stroke: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }}
              />
            </svg>
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="QR del Asistente Inteligente"
                className="absolute inset-0 flex items-center justify-center w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <QrCode className="w-40 h-40 text-gray-800" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">{formatTime(timeLeft)}</p>
            <p className="text-lg font-medium mt-2">{message}</p>
            {!qrUrl && (
              <p className="text-sm text-muted-foreground mt-2">
                Por favor, espera mientras se crea tu asistente inteligente.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
