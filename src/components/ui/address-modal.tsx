import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { countries } from '@/constants/countries';
import { MapPin, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: string) => void;
  countryCode: string;
}

export function AddressModal({
  isOpen,
  onClose,
  onSave,
  countryCode,
}: AddressModalProps) {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const countryInfo = countries.find(
      (c: { value: string; label: string; code: string }) =>
        c.value === countryCode,
    );
    if (countryInfo) {
      setCountry(countryInfo.label);
    }
  }, [countryCode]);

  const handleSaveAddress = () => {
    if (street.trim().length < 5) {
      toast.error('La dirección debe tener al menos 5 caracteres');
      return;
    }
    if (city.trim().length < 3) {
      toast.error('La ciudad debe tener al menos 3 caracteres');
      return;
    }

    const formattedAddress = `${street.toUpperCase()} ${city.toUpperCase()} ${country.toUpperCase()}`;
    onSave(formattedAddress);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Dirección del Negocio</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Dirección</Label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ej: KR 8B 9 61 o CALLE 2 9B 64"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <Label>Ciudad</Label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: CALI o CANCUN"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <Label>País</Label>
              <input
                type="text"
                value={country}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAddress}>Guardar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
