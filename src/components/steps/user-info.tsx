import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RegistrationData } from '../../types/registration';

interface UserInfoStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
}

export function UserInfoStep({ data, onUpdate }: UserInfoStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Tu nombre"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => onUpdate({ email: e.target.value })}
          placeholder="correo@ejemplo.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={data.password}
          onChange={(e) => onUpdate({ password: e.target.value })}
          placeholder="Contraseña del servicio"
        />
      </div>
    </div>
  );
}
