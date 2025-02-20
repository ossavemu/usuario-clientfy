import { AddressModal } from '@/components/ui/address-modal';
import { BotFeatures } from '@/components/ui/bot-features';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal';
import { WhatsAppQR } from '@/components/ui/whatsapp-qr';
import { useAddress } from '@/hooks/use-address';
import { Bot, Zap } from 'lucide-react';
import { useState } from 'react';
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
  const [isCreating, setIsCreating] = useState(
    existingInstance?.exists ?? false
  );
  const [instanceIp, setInstanceIp] = useState<string | null>(
    existingInstance?.ip ?? null
  );
  const [isLinked, setIsLinked] = useState(
    (existingInstance?.exists && !existingInstance?.hasQr) ?? false
  );
  const [showConfirmActivationModal, setShowConfirmActivationModal] =
    useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [enableVirtualAppointments, setEnableVirtualAppointments] =
    useState(false);
  const [enableAutoInvite, setEnableAutoInvite] = useState(false);

  const {
    companyAddress,
    showAddressModal,
    enableInPersonAppointments,
    setShowAddressModal,
    setEnableInPersonAppointments,
    handleSaveAddress,
    handleDeleteAddress,
  } = useAddress(userEmail);

  const handleCreateBot = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/instance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          phoneNumber,
          companyName,
          features: {
            virtualAppointments: enableVirtualAppointments,
            inPersonAppointments: enableInPersonAppointments,
            autoInvite: enableAutoInvite,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setInstanceIp(data.ip);
        toast.success('Bot creado correctamente');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error al crear el bot:', error);
      toast.error('Error al crear el bot');
      setIsCreating(false);
    }
  };

  const handleRelaunch = async () => {
    try {
      await fetch('/api/instance/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      setIsCreating(false);
      setInstanceIp(null);
      setIsLinked(false);
      toast.success('Instancia reiniciada correctamente');
      window.location.hash = '/create-assistant';
    } catch (error) {
      console.error('Error al relanzar el asistente:', error);
      toast.error('Error al relanzar el asistente');
    }
  };

  if (isCreating) {
    return (
      <div className="text-center space-y-4">
        <div className="relative w-[400px] h-[550px] mx-auto">
          <WhatsAppQR
            instanceIp={instanceIp}
            isLinked={isLinked}
            onQrUpdate={() => setIsLinked(false)}
          />
        </div>
      </div>
    );
  }

  return (
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

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleRelaunch}
        title="¿Estás seguro?"
        message="Esta acción reiniciará completamente tu asistente. Solo hazlo si estás teniendo problemas de sincronización, el QR no se muestra correctamente o el panel de control no responde."
        itemName="¡Esta acción no se puede deshacer!"
        confirmButtonText="Relanzar"
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
        customIcon={<Zap className="w-8 h-8 text-purple-600" />}
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
    </div>
  );
}
