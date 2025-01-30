'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Bot, Calendar, QrCode, RotateCw, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/*
interface InstanceInfo {
  instanceName: string;
  ip: string;
  state: string;
  created: string;
  provider: string;
  numberphone: string;
  dropletId: number;
}
*/

interface CreateBotStepProps {
  phoneNumber: string;
  userEmail: string;
  existingInstance?: {
    exists: boolean;
    ip: string | null;
    isActive: boolean;
    hasQr: boolean;
  } | null;
}
/*
interface InstanceStatus {
  status: string;
  progress: number;
  error?: string;
  instanceInfo?: {
    ip: string | null;
    instanceName: string;
    state: string;
  };
}
*/

export function CreateBotStep({
  phoneNumber,
  userEmail,
  existingInstance,
}: CreateBotStepProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string>('Creando el bot...');
  const [enableAppointments, setEnableAppointments] = useState(false);
  const [enableAutoInvite, setEnableAutoInvite] = useState(false);
  const [instanceIp, setInstanceIp] = useState<string | null>(
    existingInstance?.ip || null
  );
  const [timeLeft, setTimeLeft] = useState(240);
  const [isLinked, setIsLinked] = useState(
    existingInstance?.exists && !existingInstance?.hasQr
  );
  const [showRelaunchButton, setShowRelaunchButton] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [retryQR, setRetryQR] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qrUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const saveInstanceToRedis = useCallback(
    async (ip: string) => {
      try {
        await fetch('/api/instance/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            ip: ip,
          }),
        });
      } catch (error) {
        console.error('Error al guardar la instancia en Redis:', error);
      }
    },
    [userEmail]
  );

  useEffect(() => {
    if (existingInstance?.exists) {
      if (existingInstance.isActive) {
        setIsCreating(true);
        setInstanceIp(existingInstance.ip);
        setIsLinked(!existingInstance.hasQr);

        if (!existingInstance.hasQr) {
          toast.success('Panel de control detectado y WhatsApp vinculado');
        } else {
          toast.info(
            'Panel de control detectado. Escanea el código QR para vincular WhatsApp'
          );
        }
      } else {
        // Si la instancia existe en Redis pero no está activa,
        // mostramos el flujo de creación normal
        setIsCreating(false);
        setInstanceIp(null);
        setIsLinked(false);
      }
    }
  }, [existingInstance]);

  useEffect(() => {
    if (isCreating) {
      const startTime = Date.now();
      let lastStatus = '';
      let hasCompleted = false;
      let hasSeenConfiguring = false;
      let lastProgressUpdate = 0;

      pollIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/instance/status/57${phoneNumber}`);
          const responseData = await response.json();

          if (!responseData || !responseData.data) {
            console.error('Respuesta inesperada:', responseData);
            return;
          }

          const { data } = responseData;

          if (
            data &&
            typeof data.status === 'string' &&
            typeof data.progress === 'number'
          ) {
            const currentTime = Date.now();
            const elapsedSeconds = (currentTime - startTime) / 1000;

            if (data.progress > lastProgressUpdate) {
              lastProgressUpdate = data.progress;
              setProgress(data.progress);
            }

            if (data.status !== lastStatus) {
              console.log(
                `Estado (${elapsedSeconds.toFixed(1)}s):`,
                data.status,
                `(${data.progress}%)`
              );

              switch (data.status) {
                case 'creating_droplet':
                  setMessage('Creando asistente inteligente...');
                  break;
                case 'installing':
                  setMessage('Instalando componentes...');
                  break;
                case 'configuring':
                  setMessage('Configurando asistente...');
                  hasSeenConfiguring = true;
                  break;
                case 'completed':
                  if (hasSeenConfiguring && elapsedSeconds >= 120) {
                    if (data.instanceInfo?.ip) {
                      const ip = data.instanceInfo.ip;
                      setInstanceIp(ip);
                      await saveInstanceToRedis(ip);
                      toast.success('¡Asistente creado exitosamente!');
                      setMessage('Escanea el código QR con WhatsApp');
                      hasCompleted = true;
                    }
                  } else {
                    setMessage('Verificando la configuración...');
                  }
                  break;
                case 'failed':
                  const errorMsg = data.error || 'Error desconocido';
                  toast.error(`Error: ${errorMsg}`);
                  setMessage(`Error: ${errorMsg}`);
                  if (pollIntervalRef.current !== null) {
                    clearInterval(pollIntervalRef.current);
                    setIsCreating(false);
                  }
                  break;
              }

              if (!hasCompleted) {
                toast.info(`Estado: ${data.status} (${data.progress}%)`);
              }
              lastStatus = data.status;
            }
          }
        } catch (error) {
          console.error('Error al verificar estado:', error);
          if (!hasCompleted) {
            toast.error('Error al verificar el estado de la instancia');
          }
        }
      }, 5000);

      return () => {
        if (pollIntervalRef.current !== null) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [isCreating, phoneNumber, saveInstanceToRedis, userEmail]);

  // Efecto para actualizar el QR cada 30 segundos
  useEffect(() => {
    if (instanceIp) {
      qrUpdateIntervalRef.current = setInterval(() => {
        // Forzar actualización del QR
        const qrImage = document.getElementById(
          'whatsapp-qr'
        ) as HTMLImageElement;
        if (qrImage) {
          qrImage.src = `/api/qr?ip=${instanceIp}&t=${Date.now()}`;
        }
      }, 30000);

      return () => {
        if (qrUpdateIntervalRef.current !== null) {
          clearInterval(qrUpdateIntervalRef.current);
        }
      };
    }
  }, [instanceIp]);

  // Efecto para el contador regresivo
  useEffect(() => {
    if (isCreating && !instanceIp && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isCreating, instanceIp, timeLeft]);

  // Mostrar el botón de relanzamiento cuando tengamos IP
  useEffect(() => {
    setShowRelaunchButton(Boolean(instanceIp));
  }, [instanceIp]);

  // Efecto para verificar el estado de vinculación
  useEffect(() => {
    const checkLinkStatus = async () => {
      if (!instanceIp) return;

      try {
        const response = await fetch(`/api/qr?ip=${instanceIp}`);
        if (response.status === 404) {
          setIsLinked(true);
          toast.success('WhatsApp vinculado correctamente');
        } else {
          setIsLinked(false);
        }
      } catch (error) {
        console.error('Error verificando estado de QR:', error);
      }
    };

    if (instanceIp && !isLinked) {
      const interval = setInterval(checkLinkStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [instanceIp, isLinked]);

  // Efecto para reintentar obtener el QR
  useEffect(() => {
    if (retryQR && instanceIp) {
      const qrInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/qr?ip=${instanceIp}`);
          if (response.ok) {
            setIsLinked(false);
            setRetryQR(false);
            toast.info('Nuevo código QR generado');
          }
        } catch (error) {
          console.error('Error verificando QR:', error);
        }
      }, 30000);

      return () => clearInterval(qrInterval);
    }
  }, [retryQR, instanceIp]);

  const crearInstancia = async (requestBody: {
    numberphone: string;
    provider?: string;
    enableAppointments: boolean;
    enableAutoInvite: boolean;
  }) => {
    try {
      const response = await fetch('/api/instance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestBody,
          email: userEmail,
          numberphone: `57${requestBody.numberphone}`,
          provider: 'baileys',
        }),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
    } catch (error) {
      console.error('Error al crear la instancia:', error);
      setMessage('Error al crear la instancia. Por favor intenta de nuevo.');
      setIsCreating(false);
    }
  };

  const handleCreateBot = () => {
    setIsCreating(true);
    setProgress(0);
    setTimeLeft(240);
    setMessage('Iniciando creación del asistente inteligente...');

    const requestBody = {
      numberphone: phoneNumber,
      enableAppointments,
      enableAutoInvite,
    };

    crearInstancia(requestBody);
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current !== null) {
        clearInterval(pollIntervalRef.current);
      }
      if (qrUpdateIntervalRef.current !== null) {
        clearInterval(qrUpdateIntervalRef.current);
      }
      setIsCreating(false);
      setProgress(0);
      setInstanceIp(null);
      setTimeLeft(240);
      setIsLinked(false);
      setMessage('Creando el bot...');
    };
  }, []);

  // Reiniciar estados cuando cambia la ruta
  useEffect(() => {
    const handleRouteChange = () => {
      setIsCreating(false);
      setProgress(0);
      setInstanceIp(null);
      setTimeLeft(240);
      setIsLinked(false);
      setMessage('Creando el bot...');
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRelaunch = async () => {
    try {
      // Solo borrar la IP de la instancia, no todos los datos
      await fetch('/api/instance/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      // Reiniciar solo los estados relacionados con la instancia
      setIsCreating(false);
      setProgress(0);
      setInstanceIp(null);
      setTimeLeft(240);
      setIsLinked(false);
      setMessage('Creando el bot...');

      toast.success('Instancia reiniciada correctamente');

      // Recargar solo el componente, no toda la página
      window.location.hash = '/create-assistant';
    } catch (error) {
      console.error('Error al relanzar el asistente:', error);
      toast.error('Error al relanzar el asistente');
    }
  };

  return (
    <div className="text-center space-y-4">
      {!isCreating ? (
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
                      Seguimiento Automático
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Dale seguimiento a tus clientes potenciales
                      automáticamente
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
          <div className="relative w-[400px] h-[550px] mx-auto">
            {!instanceIp ? (
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-8">
                  Prepárate: Abre WhatsApp, ve a Vincular Dispositivos y espera
                  el QR
                </p>
                <div className="relative w-full h-full">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <QrCode className="w-48 h-48 text-gray-800" />
                  </div>
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
                          duration: 240,
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
                </div>
                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <p className="text-4xl font-bold text-purple-600">
                    {formatTime(timeLeft || 0)}
                  </p>
                </div>
                <p className="text-xl font-medium">{message}</p>
              </div>
            ) : isLinked ? (
              <div className="flex flex-col items-center justify-center h-full">
                <QrCode className="w-48 h-48 text-gray-400" />
                <p className="mt-4 text-gray-500 text-lg">
                  WhatsApp ya está vinculado
                </p>
                <div className="flex flex-col gap-2 mt-4">
                  <a
                    href={`/api/proxy/panel?ip=${instanceIp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline text-sm"
                  >
                    Ir al Panel de Control
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const qrImage = document.getElementById(
                        'whatsapp-qr'
                      ) as HTMLImageElement;
                      if (qrImage) {
                        qrImage.src = `/api/qr?ip=${instanceIp}&t=${Date.now()}`;
                        setIsLinked(false);
                        toast.info('Actualizando código QR...');
                      }
                    }}
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Consultar QR
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-fit flex items-center justify-center">
                <img
                  id="whatsapp-qr"
                  src={`/api/qr?ip=${instanceIp}`}
                  alt="WhatsApp QR"
                  className="max-w-full max-h-full"
                  onError={() => {
                    setIsLinked(true);
                    toast.info('Vinculación detectada');
                  }}
                />
              </div>
            )}
          </div>
          <div className="text-center">
            {instanceIp && !isLinked && (
              <div className="space-y-4 " style={{ marginTop: '-150px' }}>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">
                    Instrucciones de conexión:
                  </h4>
                  <ol className="text-left list-decimal pl-6 text-purple-700">
                    <li>Ve a WhatsApp en tu teléfono</li>
                    <li>Abre Ajustes {'>'} Dispositivos vinculados</li>
                    <li>Selecciona &quot;Vincular un dispositivo&quot;</li>
                    <li>Escanea el código QR mostrado arriba</li>
                  </ol>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    Una vez conectado, podrás administrar tu asistente desde el{' '}
                    <a
                      href={`${instanceIp}:5432/panel`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline font-medium"
                    >
                      Panel de Control
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showRelaunchButton && (
        <div className="fixed bottom-8 right-8 group">
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full w-12 h-12 shadow-lg relative"
            onClick={() => setShowDeleteModal(true)}
          >
            <RotateCw className="w-6 h-6" />
            <span className="absolute right-full mr-3 bg-black/75 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Relanzar Asistente Inteligente
            </span>
          </Button>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleRelaunch}
        title="¿Estás seguro?"
        message="Esta acción reiniciará completamente tu asistente. Solo hazlo si estás teniendo problemas de sincronización, el QR no se muestra correctamente o el panel de control no responde."
        itemName="¡Esta acción no se puede deshacer!"
        confirmButtonText="Relanzar"
      />
    </div>
  );
}
