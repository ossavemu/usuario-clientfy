'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAutoTooltip } from '@/hooks/useAutoTooltip';
import { CreditCard } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

interface StripeButtonProps {
  showTooltip?: boolean;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}

const StripeButton = React.memo(function StripeButton({
  showTooltip = false,
  tooltipSide = 'top',
}: StripeButtonProps) {
  const { isOpen, setIsOpen } = useAutoTooltip();

  const handlePayment = useCallback(async () => {
    try {
      const response = await fetch('/api/buy');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Error en la respuesta del servidor',
        );
      }
      const data = await response.json();
      if (!data?.link) {
        throw new Error('Enlace de pago no encontrado');
      }
      window.location.href = data.link;
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.error('Error al procesar el pago');
    }
  }, []);

  const button = useMemo(
    () => (
      <Button
        onClick={handlePayment}
        className="w-full bg-[#635BFF] hover:bg-[#4B45C6] text-white font-medium py-6 rounded-lg transition-all duration-200"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        Pagar con Stripe
      </Button>
    ),
    [handlePayment],
  );

  if (!showTooltip) return button;

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side={tooltipSide} sideOffset={5}>
          <p>Es necesario realizar el pago antes de registrarte</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export { StripeButton };
