import { Button } from '@/components/ui/button';
import { QrCode, RotateCw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface WhatsAppQRProps {
  instanceIp: string | null;
  isLinked: boolean;
  onQrUpdate: () => void;
}

export function WhatsAppQR({
  instanceIp,
  isLinked,
  onQrUpdate,
}: WhatsAppQRProps) {
  const qrUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (instanceIp) {
      qrUpdateIntervalRef.current = setInterval(() => {
        const qrImage = document.getElementById(
          'whatsapp-qr'
        ) as HTMLImageElement;
        if (qrImage) {
          qrImage.src = `http://${instanceIp}:3008/qr?t=${Date.now()}`;
        }
      }, 30000);

      return () => {
        if (qrUpdateIntervalRef.current !== null) {
          clearInterval(qrUpdateIntervalRef.current);
        }
      };
    }
  }, [instanceIp]);

  if (!instanceIp) return null;

  if (isLinked) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <QrCode className="w-48 h-48 text-gray-400" />
        <p className="mt-4 text-gray-500 text-lg">WhatsApp ya está vinculado</p>
        <div className="flex flex-col gap-2 mt-4">
          <a
            href={`http://${instanceIp}:5432/panel`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline text-sm"
          >
            Ir al Panel de Control
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={onQrUpdate}
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Consultar QR
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-fit flex items-center justify-center">
      <img
        id="whatsapp-qr"
        src={`http://${instanceIp}:3008/qr`}
        alt="WhatsApp QR"
        className="max-w-full max-h-full"
        onError={() => {
          toast.info('Vinculación detectada');
        }}
      />
    </div>
  );
}
