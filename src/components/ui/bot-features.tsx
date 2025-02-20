import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ZoomIcon } from '@/components/ui/zoom-icon';
import { Calendar, MapPin, Trash2, Users } from 'lucide-react';

interface BotFeaturesProps {
  enableVirtualAppointments: boolean;
  setEnableVirtualAppointments: (value: boolean) => void;
  enableInPersonAppointments: boolean;
  setEnableInPersonAppointments: (value: boolean) => void;
  enableAutoInvite: boolean;
  setEnableAutoInvite: (value: boolean) => void;
  companyAddress: string;
  onDeleteAddress: () => void;
  onAddressClick: () => void;
}

export function BotFeatures({
  enableVirtualAppointments,
  setEnableVirtualAppointments,
  enableInPersonAppointments,
  setEnableInPersonAppointments,
  enableAutoInvite,
  setEnableAutoInvite,
  companyAddress,
  onDeleteAddress,
  onAddressClick,
}: BotFeaturesProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ZoomIcon className="w-10 h-10 -translate-x-1" />
            <div className="text-left -translate-x-[8px]">
              <Label htmlFor="virtualAppointments" className="font-medium">
                Agendar citas virtuales
              </Label>
              <p className="text-sm text-muted-foreground mr-8">
                Permite a los clientes programar citas virtuales y reuniones en
                la plataforma Zoom
              </p>
            </div>
          </div>
          <Switch
            id="virtualAppointments"
            checked={enableVirtualAppointments}
            onCheckedChange={setEnableVirtualAppointments}
          />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <Label htmlFor="inPersonAppointments" className="font-medium">
                  Agendar citas presenciales
                </Label>
                <p className="text-sm text-muted-foreground mr-8">
                  Permite a los clientes programar citas presenciales en tu
                  negocio
                </p>
                {companyAddress && (
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-purple-600 flex items-center gap-1 text-sm">
                      <MapPin className="w-4 h-4" />
                      {companyAddress}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDeleteAddress}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 relative group"
                      title="Eliminar dirección"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="absolute right-full mr-2 bg-black/75 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        Eliminar dirección
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <Switch
              id="inPersonAppointments"
              checked={enableInPersonAppointments}
              onCheckedChange={setEnableInPersonAppointments}
              disabled={!companyAddress}
            />
          </div>
          <div className="ml-8 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddressClick}
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
            >
              {companyAddress ? 'Cambiar dirección' : 'Agregar dirección'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <Label htmlFor="auto-invite" className="font-medium">
                Seguimiento Automático
              </Label>
              <p className="text-sm text-muted-foreground mr-8">
                Da seguimiento automático a tus clientes potenciales y eleva tus
                ventas
              </p>
            </div>
          </div>
          <Switch
            id="auto-invite"
            checked={enableAutoInvite}
            onCheckedChange={setEnableAutoInvite}
          />
        </div>
      </Card>
    </div>
  );
}
