import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useAddress(userEmail: string) {
  const [companyAddress, setCompanyAddress] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [enableInPersonAppointments, setEnableInPersonAppointments] =
    useState(false);

  const loadAddress = useCallback(async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(`/api/address?email=${userEmail}`);
      const data = await response.json();

      if (data.success && data.address) {
        setCompanyAddress(data.address);
      }
    } catch (error) {
      console.error('Error al cargar la dirección:', error);
    }
  }, [userEmail]);

  const handleAddressStateUpdate = useCallback(() => {
    if (!showAddressModal && !companyAddress && enableInPersonAppointments) {
      setEnableInPersonAppointments(false);
    }
  }, [showAddressModal, companyAddress, enableInPersonAppointments]);

  useEffect(() => {
    loadAddress();
  }, [loadAddress]);

  useEffect(() => {
    handleAddressStateUpdate();
  }, [handleAddressStateUpdate]);

  const handleSaveAddress = async (address: string) => {
    if (!userEmail) return;

    try {
      const method = companyAddress ? 'PUT' : 'POST';
      const response = await fetch('/api/address', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCompanyAddress(address);
        setEnableInPersonAppointments(true);
        setShowAddressModal(false);
        toast.success('Dirección guardada correctamente');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error al guardar la dirección:', error);
      toast.error('Error al guardar la dirección');
    }
  };

  const handleDeleteAddress = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(`/api/address?email=${userEmail}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setCompanyAddress('');
        setEnableInPersonAppointments(false);
        toast.success('Dirección eliminada correctamente');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error al eliminar la dirección:', error);
      toast.error('Error al eliminar la dirección');
    }
  };

  return {
    companyAddress,
    showAddressModal,
    enableInPersonAppointments,
    setShowAddressModal,
    setEnableInPersonAppointments,
    handleSaveAddress,
    handleDeleteAddress,
  };
}
