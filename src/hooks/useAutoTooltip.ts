import { useEffect, useState } from 'react';

export const useAutoTooltip = (initialDelay = 500, duration = 3000) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Solo mostrar el tooltip después del delay inicial
    const showTimer = setTimeout(() => {
      setIsOpen(true);
    }, initialDelay);

    // Ocultar el tooltip después de la duración especificada
    const hideTimer = setTimeout(() => {
      setIsOpen(false);
    }, initialDelay + duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, initialDelay]); // Solo se ejecuta una vez al montar el componente

  return {
    isOpen,
    setIsOpen: (value: boolean) => {
      // Solo permitir cambios manuales después de que el tooltip inicial se haya ocultado
      if (!isOpen || value === false) {
        setIsOpen(value);
      }
    },
  };
};
