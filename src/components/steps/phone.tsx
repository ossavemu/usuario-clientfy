import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepNavigation } from "@/components/ui/step-navigation";
import { jwtDecode } from "jwt-decode";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { type RegistrationData } from "../../types/registration";
import { countries } from "../ui/countries-flags";

interface PhoneStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PhoneStep({ data, onUpdate, onNext, onBack }: PhoneStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [registeredPhone, setRegisteredPhone] = useState<{
    countryCode: string;
    phone: string;
    serviceType?: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const checkExistingPhone = useCallback(
    async (email: string) => {
      try {
        const response = await fetch(`/api/phone?email=${email}`);
        const data = await response.json();
        if (data.phone) {
          setRegisteredPhone(data.phone);
          onUpdate(data.phone);
        }
      } catch (error) {
        console.error("Error al verificar teléfono:", error);
      } finally {
        setIsInitialLoading(false);
      }
    },
    [onUpdate]
  );

  useEffect(() => {
    if (!data.countryCode) {
      onUpdate({ countryCode: "+52", serviceType: "qr" });
    }
  }, [data.countryCode, onUpdate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<{ email: string }>(token);
        setUserEmail(decoded.email);
        checkExistingPhone(decoded.email);
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        setIsInitialLoading(false);
      }
    } else {
      setIsInitialLoading(false);
    }
  }, [checkExistingPhone]);

  const handleSubmit = async () => {
    if (!userEmail) return;

    setIsLoading(true);
    setError("");

    try {
      const phoneData = {
        phone: data.phone,
        countryCode: data.countryCode,
        serviceType: data.serviceType,
      };

      const response = await fetch("/api/phone", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          phoneData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRegisteredPhone(phoneData);
        setIsEditing(false);
        onNext();
      } else {
        setError(result.error || "Error al procesar la solicitud");
      }
    } catch (error) {
      setError("Error al procesar la solicitud");
      console.error("Error al procesar la solicitud:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userEmail || !window.confirm("¿Estás seguro de eliminar este número?"))
      return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/phone?email=${userEmail}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRegisteredPhone(null);
        onUpdate({
          phone: "",
          countryCode: "+57",
          serviceType: "qr",
        });
      } else {
        setError("Error al eliminar el número");
      }
    } catch (error) {
      console.error("Error al eliminar el número:", error);
      setError("Error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números
    const value = e.target.value.replace(/\D/g, "");
    // Limitar a 10 dígitos
    const truncatedValue = value.slice(0, 10);
    onUpdate({ phone: truncatedValue });
  };

  const isPhoneValid = data.phone?.length === 10;

  if (isInitialLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-gray-600">Verificando información...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[400px]">
      {registeredPhone && !isEditing ? (
        <div className="flex flex-col flex-1">
          <div className="bg-white/10 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Número Registrado
                </h3>
                <p className="text-sm text-gray-500">
                  {registeredPhone.countryCode} {registeredPhone.phone}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Servicio:{" "}
                  {registeredPhone.serviceType === "qr"
                    ? "Solo QR"
                    : "WhatsApp Business"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-gray-600"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <StepNavigation
            currentStep={3}
            totalSteps={8}
            onNext={onNext}
            onBack={() => {
              if (userEmail) {
                window.location.hash = "/welcome";
              } else {
                onBack();
              }
            }}
            isBackDisabled={false}
          />
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Celular</Label>
              <div className="flex gap-2">
                <Select
                  value={data.countryCode || "+52"}
                  onValueChange={(value) => onUpdate({ countryCode: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="México (+52)" />
                  </SelectTrigger>
                  <SelectContent
                    className="w-[240px] z-[100]"
                    position="popper"
                    side="bottom"
                    sideOffset={4}
                  >
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
                  onChange={handlePhoneChange}
                  placeholder="Número de celular (10 dígitos)"
                  className="flex-1"
                  disabled={isLoading}
                  maxLength={10}
                  type="tel"
                />
              </div>
              {data.phone && !isPhoneValid && (
                <p className="text-sm text-muted-foreground">
                  El número debe tener exactamente 10 dígitos
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Servicio</Label>
              <RadioGroup
                defaultValue="qr"
                value={data.serviceType}
                onValueChange={(value) =>
                  onUpdate({ serviceType: value as "whatsapp" | "qr" })
                }
                disabled={isLoading}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg opacity-50 cursor-not-allowed bg-gray-50/50">
                  <RadioGroupItem
                    value="whatsapp"
                    id="whatsapp"
                    disabled
                    className="mt-1 w-5 h-5 border-2 data-[state=checked]:border-purple-600 data-[state=checked]:text-purple-600"
                  />
                  <Label
                    htmlFor="whatsapp"
                    className="flex-1 cursor-not-allowed"
                  >
                    <div className="font-medium">WhatsApp Business</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Servicio completo de WhatsApp Business API
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      Feature en desarrollo
                    </div>
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50/80 transition-colors">
                  <RadioGroupItem
                    value="qr"
                    id="qr"
                    className="mt-1 w-5 h-5 border-2 data-[state=checked]:border-purple-600 data-[state=checked]:text-purple-600"
                  />
                  <Label htmlFor="qr" className="flex-1 cursor-pointer">
                    <div className="font-medium">Solo QR</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Acceso básico con código QR
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md mt-4">
              {error}
            </div>
          )}

          <div className="flex-1" />

          <StepNavigation
            currentStep={3}
            totalSteps={8}
            onNext={handleSubmit}
            onBack={onBack}
            isNextDisabled={!isPhoneValid || isLoading}
            isBackDisabled={!!userEmail}
            nextLabel={
              isEditing
                ? isLoading
                  ? "Guardando..."
                  : "Guardar Cambios"
                : isLoading
                ? "Registrando..."
                : "Registrar Número"
            }
          />
        </div>
      )}
    </div>
  );
}
