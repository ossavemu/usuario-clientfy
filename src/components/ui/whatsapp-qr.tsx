import { Button } from '@/components/ui/button';
import { QrCode, RotateCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [qrError, setQrError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const qrUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qrCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearIntervals = useCallback(() => {
    if (qrUpdateIntervalRef.current) {
      clearInterval(qrUpdateIntervalRef.current);
    }
    if (qrCheckIntervalRef.current) {
      clearInterval(qrCheckIntervalRef.current);
    }
  }, []);

  const updateQR = useCallback(() => {
    if (!instanceIp) return;

    const qrImage = document.getElementById('whatsapp-qr') as HTMLImageElement;
    if (qrImage) {
      qrImage.src = `/api/qr?ip=${instanceIp}&t=${Date.now()}`;
    }
  }, [instanceIp]);

  const checkQRStatus = useCallback(async () => {
    if (!instanceIp || isLinked) return;

    try {
      const response = await fetch(`http://${instanceIp}:3008`);
      if (response.status === 404) {
        onQrUpdate();
        toast.success('WhatsApp vinculado correctamente');
        clearIntervals();
      }
    } catch (error) {
      console.error('Error al verificar QR:', error);
      setQrError(true);
    }
  }, [instanceIp, isLinked, clearIntervals, onQrUpdate]);

  useEffect(() => {
    if (instanceIp && !isLinked) {
      // Actualizar QR cada 30 segundos
      updateQR();
      qrUpdateIntervalRef.current = setInterval(updateQR, 30000);

      // Verificar estado cada 10 segundos
      qrCheckIntervalRef.current = setInterval(checkQRStatus, 10000);

      return () => clearIntervals();
    }
  }, [instanceIp, isLinked, updateQR, checkQRStatus, clearIntervals]);

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
            onClick={() => {
              onQrUpdate();
              updateQR();
            }}
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Actualizar QR
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-fit flex flex-col items-center justify-center">
      {qrError ? (
        <div className="text-center space-y-4">
          <QrCode className="w-48 h-48 text-red-400 mx-auto" />
          <p className="text-red-500">Error al cargar el código QR</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQrError(false);
              updateQR();
            }}
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      ) : (
        <img
          id="whatsapp-qr"
          src={`/api/qr?ip=${instanceIp}&t=${Date.now()}`}
          alt="WhatsApp QR"
          className="max-w-full max-h-full"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setQrError(true);
            setIsLoading(false);
          }}
        />
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      )}
    </div>
  );
}
