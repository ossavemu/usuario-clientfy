'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAutoTooltip } from '@/hooks/useAutoTooltip';
import try$ from '@/lib/try';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface StripeButtonProps {
  showTooltip?: boolean;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}

export function StripeButton({
  showTooltip = false,
  tooltipSide = 'top',
}: StripeButtonProps) {
  const { isOpen, setIsOpen } = useAutoTooltip();

  const handlePayment = async () => {
    const [error, response] = await try$(fetch('/api/buy'));

    if (error || !response) {
      toast.error('Error al conectar con el servicio de pago');
      return;
    }

    const [parseError, data] = await try$(response.json());

    if (parseError || !data?.url) {
      toast.error('Error al procesar la información de pago');
      return;
    }

    window.location.href = data.url;
  };

  const button = (
    <Button
      onClick={handlePayment}
      className="w-full bg-[#635BFF] hover:bg-[#4B45C6] text-white font-medium py-6 rounded-lg transition-all duration-200"
    >
      <CreditCard className="w-5 h-5 mr-2" />
      Pagar con Stripe
    </Button>
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
}
