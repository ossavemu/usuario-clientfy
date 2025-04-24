import { useBotCreation } from '@/components/AuthProvider';
import { AddressModal } from '@/components/ui/address-modal';
import { BotFeatures } from '@/components/ui/bot-features';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal';
import { WhatsAppQR } from '@/components/ui/whatsapp-qr';
import { useAddress } from '@/hooks/use-address';
import { monitorInstanceStatus } from '@/lib/do/instanceStatus';
import { Bot, QrCode, RotateCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CreateBotFlowProps {
  phoneNumber: string;
  countryCode: string;
  userEmail: string;
  companyName: string;
  existingInstance?: {
    exists: boolean;
    ip: string | null;
    isActive: boolean;
    hasQr: boolean;
  } | null;
}

export function CreateBotFlow({
  phoneNumber,
  countryCode,
  userEmail,
  companyName,
  existingInstance,
}: CreateBotFlowProps) {
  const { setIsCreatingBot } = useBotCreation();
  const [isCreating, setIsCreating] = useState(
    existingInstance?.exists ?? false,
  );
  const [instanceIp, setInstanceIp] = useState<string | null>(
    existingInstance?.ip ?? null,
  );
  const [isLinked, setIsLinked] = useState(
    (existingInstance?.exists && !existingInstance?.hasQr) ?? false,
  );
  const [showConfirmActivationModal, setShowConfirmActivationModal] =
    useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Iniciando creación del asistente...');
  const [timeLeft, setTimeLeft] = useState(240);

  const {
    companyAddress,
    showAddressModal,
    enableInPersonAppointments,
    setShowAddressModal,
    setEnableInPersonAppointments,
    handleSaveAddress,
    handleDeleteAddress,
  } = useAddress(userEmail);

  const [enableVirtualAppointments, setEnableVirtualAppointments] =
    useState(false);
  const [enableAutoInvite, setEnableAutoInvite] = useState(false);

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'creating':
        return 'Iniciando creación...';
      case 'creating_droplet':
        return 'Creando servidor...';
      case 'waiting_for_ssh':
        return 'Configurando acceso...';
      case 'configuring':
        return 'Instalando WhatsApp...';
      case 'completed':
        return 'Escanea el código QR';
      default:
        return 'Procesando...';
    }
  };

  const handleCreateBot = async () => {
    setIsCreating(true);
    setProgress(0);
    setTimeLeft(240);
    setMessage('Iniciando creación del asistente...');

    try {
      const cleanPhone = `${countryCode}${phoneNumber}`.replace(/\+/g, '');

      const response = await fetch('/api/instance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          numberphone: cleanPhone,
          companyName,
          address: companyAddress,
          features: {
            virtualAppointments: enableVirtualAppointments,
            inPersonAppointments: enableInPersonAppointments,
            autoInvite: enableAutoInvite,
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Si ya tenemos la IP del servidor, mostrar QR inmediatamente
      if (data.data?.instanceInfo?.ip) {
        setInstanceIp(data.data.instanceInfo.ip);
        toast.success('Servidor creado. Generando código QR...');
      }
    } catch (error) {
      console.error('Error al crear el bot:', error);
      toast.error('Error al crear el bot');
      setIsCreating(false);
      setInstanceIp(null);
    }
  };

  const handleRelaunch = async () => {
    try {
      setShowDeleteModal(false);
      toast.loading('Eliminando instancia...');

      const cleanPhone = `${countryCode}${phoneNumber}`.replace(/\+/g, '');

      const response = await fetch('/api/instance/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          numberphone: cleanPhone,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la instancia');
      }

      setIsCreating(false);
      setInstanceIp(null);
      setIsLinked(false);
      setProgress(0);
      setMessage('Iniciando creación del asistente...');

      toast.dismiss();
      toast.success('Instancia eliminada correctamente');

      setTimeout(() => {
        window.location.hash = '/create-assistant';
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error al relanzar el asistente:', error);
      toast.dismiss();
      toast.error('Error al relanzar el asistente');
    }
  };

  useEffect(() => {
    let isMonitoring = false;

    const startMonitoring = async () => {
      if (!isCreating || instanceIp || isMonitoring) return;

      isMonitoring = true;
      const cleanPhone = `${countryCode}${phoneNumber}`.replace(/\+/g, '');

      try {
        await monitorInstanceStatus(
          cleanPhone,
          (instanceData) => {
            setProgress(instanceData.progress);
            setMessage(getStatusMessage(instanceData.status));

            if (instanceData.instanceInfo?.ip) {
              setInstanceIp(instanceData.instanceInfo.ip);
            }
          },
          (error) => {
            console.error('Error al monitorear estado:', error);
            toast.error('Error al verificar el estado del asistente');
            setIsCreating(false);
          },
          userEmail,
        );
      } catch (error) {
        console.error('Error en el monitoreo:', error);
      } finally {
        isMonitoring = false;
      }
    };

    startMonitoring();

    return () => {
      isMonitoring = false;
    };
  }, [isCreating, instanceIp, countryCode, phoneNumber, userEmail]);

  useEffect(() => {
    if (isCreating && !instanceIp && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        // Calcular el progreso basado en el tiempo transcurrido
        const elapsedTime = 240 - timeLeft;
        const calculatedProgress = Math.min(
          Math.floor((elapsedTime / 240) * 100),
          100,
        );
        setProgress(calculatedProgress);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isCreating, instanceIp, timeLeft]);

  useEffect(() => {
    // Prevenir que el usuario salga de la página durante la creación
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isCreating && !instanceIp) {
        e.preventDefault();
        e.returnValue =
          '¿Estás seguro de que deseas salir? La creación del asistente está en progreso.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isCreating, instanceIp]);

  useEffect(() => {
    // Solo actualizar el estado global cuando estamos en el proceso de creación
    // y no tenemos IP, no cuando estamos en la pantalla de configuración
    if (!isCreating) {
      setIsCreatingBot(false);
      return;
    }

    // Si estamos creando, solo bloquear si no tenemos IP
    setIsCreatingBot(!instanceIp);
  }, [isCreating, instanceIp, setIsCreatingBot]);

  if (isCreating) {
    return (
      <>
        <div className="text-center max-w-md mx-auto">
          {!instanceIp ? (
            <div className="space-y-6">
              <div className="relative w-72 h-72 mx-auto">
                {/* Círculo de progreso animado */}
                <div
                  className="progress-circle"
                  style={
                    {
                      '--progress': `${progress}%`,
                    } as React.CSSProperties
                  }
                />

                {/* Contenido central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-white rounded-full w-56 h-56 flex flex-col items-center justify-center shadow-lg">
                    <QrCode className="w-12 h-12 text-purple-600 animate-[pulse_1.5s_ease-in-out_infinite]" />
                    <div className="space-y-1.5 px-6">
                      <p className="text-4xl font-bold text-purple-600">
                        {progress}%
                      </p>
                      <p className="text-sm text-purple-800 font-medium line-clamp-2 min-h-[2.5rem]">
                        {message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.floor(timeLeft / 60)}:
                        {(timeLeft % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-3 shadow-xs relative">
                <WhatsAppQR
                  instanceIp={instanceIp}
                  isLinked={isLinked}
                  onQrUpdate={() => setIsLinked(false)}
                />

                <div className="absolute -top-2 -right-2">
                  <div className="group relative">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        console.log('Abriendo modal de confirmación...');
                        setShowDeleteModal(true);
                      }}
                      className="rounded-full w-8 h-8 bg-white border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                      <RotateCw className="w-4 h-4 text-red-600" />
                    </Button>
                    <span className="invisible group-hover:visible absolute -top-8 right-0 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      Relanzar asistente
                    </span>
                  </div>
                </div>
              </div>

              {!isLinked && (
                <div className="bg-purple-50/70 p-3 rounded-lg text-sm">
                  <h4 className="font-medium text-purple-800 mb-1.5">
                    Instrucciones de conexión:
                  </h4>
                  <ol className="text-left list-decimal pl-5 text-purple-700">
                    <li>Ve a WhatsApp en tu teléfono</li>
                    <li>Abre Ajustes {'>'} Dispositivos vinculados</li>
                    <li>Selecciona &quot;Vincular un dispositivo&quot;</li>
                    <li>Escanea el código QR mostrado arriba</li>
                  </ol>
                </div>
              )}

              <div className="bg-gray-50/70 p-3 rounded-lg">
                <p className="text-gray-700 mb-2 text-sm">
                  {isLinked ? (
                    <span className="flex items-center justify-center gap-2 text-green-600">
                      <Bot className="w-4 h-4" />
                      ¡Asistente vinculado correctamente!
                    </span>
                  ) : (
                    'Una vez conectado, podrás administrar tu asistente desde el Panel de Control'
                  )}
                </p>

                <a
                  href={`http://${instanceIp}:5432/panel`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                >
                  Ir al Panel de Control
                </a>
              </div>
            </div>
          )}
        </div>

        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            console.log('Cerrando modal...');
            setShowDeleteModal(false);
          }}
          onConfirm={() => {
            console.log('Confirmando relanzamiento...');
            handleRelaunch();
          }}
          title="Relanzar Asistente"
          message="Esta acción eliminará la instancia actual de WhatsApp y todos sus datos asociados. Deberás crear un nuevo asistente desde cero para restablecer el servicio."
          itemName="⚠️ Esta acción es irreversible y requiere una nueva configuración completa del asistente."
          confirmButtonText="Sí, eliminar y relanzar"
          confirmVariant="destructive"
          customIcon={
            <RotateCw className="w-8 h-8 text-red-600 animate-spin" />
          }
        />
      </>
    );
  }

  return (
    <>
      <div className="text-center space-y-4">
        <Bot className="w-16 h-16 mx-auto text-purple-600" />
        <h3 className="text-xl font-semibold">
          ¡Configura tu Asistente Virtual!
        </h3>
        <p className="text-muted-foreground mb-6">
          Selecciona las funciones que deseas activar en tu asistente antes de
          crearlo.
        </p>

        <BotFeatures
          enableVirtualAppointments={enableVirtualAppointments}
          setEnableVirtualAppointments={setEnableVirtualAppointments}
          enableInPersonAppointments={enableInPersonAppointments}
          setEnableInPersonAppointments={setEnableInPersonAppointments}
          enableAutoInvite={enableAutoInvite}
          setEnableAutoInvite={setEnableAutoInvite}
          companyAddress={companyAddress}
          onDeleteAddress={handleDeleteAddress}
          onAddressClick={() => setShowAddressModal(true)}
        />

        <Button
          className="w-full mt-6"
          size="lg"
          onClick={() => setShowConfirmActivationModal(true)}
        >
          Crear Asistente Virtual
        </Button>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          console.log('Cerrando modal...');
          setShowDeleteModal(false);
        }}
        onConfirm={() => {
          console.log('Confirmando relanzamiento...');
          handleRelaunch();
        }}
        title="Relanzar Asistente"
        message="Esta acción eliminará la instancia actual de WhatsApp y todos sus datos asociados. Deberás crear un nuevo asistente desde cero para restablecer el servicio."
        itemName="⚠️ Esta acción es irreversible y requiere una nueva configuración completa del asistente."
        confirmButtonText="Sí, eliminar y relanzar"
        confirmVariant="destructive"
        customIcon={<RotateCw className="w-8 h-8 text-red-600 animate-spin" />}
      />

      <ConfirmDeleteModal
        isOpen={showConfirmActivationModal}
        onClose={() => setShowConfirmActivationModal(false)}
        onConfirm={() => {
          setShowConfirmActivationModal(false);
          handleCreateBot();
        }}
        title="Confirmar Creación del Asistente"
        message="¿Deseas proceder con la creación de tu asistente? Una vez creado, las configuraciones actuales se aplicarán de forma definitiva."
        itemName="Si quieres cambiar las configuraciones, debes volver a crear el asistente."
        confirmButtonText="Crear Asistente"
        confirmVariant="default"
        customIcon={<RotateCw className="w-8 h-8 text-purple-600" />}
      />

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          if (!companyAddress) {
            setEnableInPersonAppointments(false);
          }
        }}
        onSave={handleSaveAddress}
        countryCode={countryCode}
      />
    </>
  );
}
