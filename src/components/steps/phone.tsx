import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type RegistrationData } from '../../types/registration';

interface PhoneStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const countries = [
  {
    label: 'Colombia',
    value: '+57',
    code: 'CO',
    flag: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="15"
        viewBox="0 0 5 3"
      >
        <rect width="5" height="3" fill="#FCD116" />
        <rect width="5" height="2" y="1" fill="#003893" />
        <rect width="5" height="1" y="2" fill="#CE1126" />
      </svg>
    ),
  },
  {
    label: 'México',
    value: '+52',
    code: 'MX',
    flag: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="15"
        viewBox="0 0 3 2"
      >
        <rect width="1" height="2" fill="#006847" />
        <rect width="1" height="2" x="1" fill="#fff" />
        <rect width="1" height="2" x="2" fill="#ce1126" />
      </svg>
    ),
  },
  {
    label: 'Brasil',
    value: '+55',
    code: 'BR',
    flag: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="15"
        viewBox="0 0 4 3"
      >
        <rect width="4" height="3" fill="#009c3b" />
        <path d="M2,0.5 L3.5,1.5 L2,2.5 L0.5,1.5 Z" fill="#ffdf00" />
        <circle cx="2" cy="1.5" r="0.7" fill="#002776" />
      </svg>
    ),
  },
  {
    label: 'Estados Unidos',
    value: '+1',
    code: 'US',
    flag: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="15"
        viewBox="0 0 190 100"
      >
        <rect width="190" height="100" fill="#bf0a30" />
        <rect width="190" height="76.9" fill="#fff" />
        <rect width="190" height="53.8" fill="#bf0a30" />
        <rect width="190" height="30.8" fill="#fff" />
        <rect width="190" height="7.7" fill="#bf0a30" />
        <rect width="80" height="53.8" fill="#002868" />
      </svg>
    ),
  },
];

export function PhoneStep({ data, onUpdate }: PhoneStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Celular</Label>
        <div className="flex gap-2">
          <Select
            value={data.countryCode}
            onValueChange={(value) => onUpdate({ countryCode: value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.value}>
                  <div className="flex items-center">
                    <span className="mr-2">{country.flag}</span>
                    <span>
                      {country.label} ({country.value})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={data.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            placeholder="Número de celular"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Servicio</Label>
        <RadioGroup
          value={data.serviceType}
          onValueChange={(value) =>
            onUpdate({ serviceType: value as 'whatsapp' | 'qr' })
          }
        >
          <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50 cursor-not-allowed">
            <RadioGroupItem value="whatsapp" id="whatsapp" disabled />
            <Label htmlFor="whatsapp" className="flex-1">
              <div>WhatsApp Business</div>
              <div className="text-sm text-muted-foreground">
                Servicio completo de WhatsApp Business API
              </div>
              <div className="text-xs text-purple-600">
                Feature en desarrollo
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <RadioGroupItem value="qr" id="qr" />
            <Label htmlFor="qr" className="flex-1">
              <div>Solo QR</div>
              <div className="text-sm text-muted-foreground">
                Acceso básico con código QR
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
