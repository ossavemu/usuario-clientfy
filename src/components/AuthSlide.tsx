import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SuccessModal } from "@/components/ui/success-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type RegistrationData } from "@/types/registration";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserInfoStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  defaultMode?: "login" | "register";
}

const SERVICE_PASSWORD = "ItLY51H2fh";

export function UserInfoStep({
  data,
  onUpdate,
  defaultMode = "register",
}: UserInfoStepProps) {
  const [error, setError] = useState("");
  const [showServicePassword, setShowServicePassword] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(defaultMode === "login");
  const [servicePassword, setServicePassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  // Actualizar el hash cuando cambia la pestaña
  const handleTabChange = (value: string) => {
    const newIsLogin = value === "login";
    setIsLogin(newIsLogin);
    setError("");
    setUserPassword("");
    setServicePassword("");
    router.push(`/auth${newIsLogin ? "?mode=login" : ""}`);
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return {
      minLength,
      hasLetter,
      hasNumber,
      isValid: minLength && hasLetter && hasNumber,
    };
  };

  const passwordValidation = validatePassword(userPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!isLogin) {
        // Validaciones de registro
        if (!data.name || !data.email || !servicePassword || !userPassword) {
          throw new Error("Todos los campos son requeridos");
        }

        if (!passwordValidation.isValid) {
          throw new Error("La contraseña no cumple con los requisitos mínimos");
        }

        if (servicePassword !== SERVICE_PASSWORD) {
          throw new Error("La contraseña del servicio no es válida");
        }

        // Realizar el registro
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: {
              service: servicePassword,
              user: userPassword,
            },
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Error en el registro");
        }

        // Solo mostrar el modal de éxito
        setShowSuccessModal(true);
      } else {
        // Login
        if (!data.email || !userPassword) {
          throw new Error("Email y contraseña son requeridos");
        }

        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            password: userPassword,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Credenciales incorrectas");
        }

        if (result.token) {
          // Guardar datos en localStorage
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));

          // Verificar que la sesión se haya establecido correctamente
          const validationResponse = await fetch("/api/auth/validate", {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          });

          if (!validationResponse.ok) {
            throw new Error("Error al establecer la sesión");
          }

          // Esperar un momento y redirigir al dashboard
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Error en la operación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Limpiar los campos
    setServicePassword("");
    setUserPassword("");
    // Cambiar a la pestaña de login
    router.push("/auth?mode=login");
  };

  return (
    <>
      <Tabs
        value={isLogin ? "login" : "register"}
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="register">Registro</TabsTrigger>
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicePassword">Contraseña del Servicio</Label>
              <div className="relative">
                <Input
                  id="servicePassword"
                  type={showServicePassword ? "text" : "password"}
                  value={servicePassword}
                  onChange={(e) => setServicePassword(e.target.value)}
                  placeholder="Contraseña proporcionada por el servicio"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowServicePassword(!showServicePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showServicePassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ingrese la contraseña proporcionada por el servicio
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPassword">Crear Contraseña Personal</Label>
              <div className="relative">
                <Input
                  id="userPassword"
                  type={showUserPassword ? "text" : "password"}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Crea una contraseña segura"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowUserPassword(!showUserPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showUserPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2 text-sm">
                  {passwordValidation.minLength ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-red-500" />
                  )}
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {passwordValidation.hasLetter ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-red-500" />
                  )}
                  <span>Al menos una letra</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {passwordValidation.hasNumber ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-red-500" />
                  )}
                  <span>Al menos un número</span>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-red-500"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (!isLogin && !passwordValidation.isValid)}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isLogin ? "Iniciando sesión..." : "Registrando..."}
                </div>
              ) : isLogin ? (
                "Iniciar Sesión"
              ) : (
                "Registrarse"
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="login">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPassword">Contraseña</Label>
              <div className="relative">
                <Input
                  id="userPassword"
                  type={showUserPassword ? "text" : "password"}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowUserPassword(!showUserPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showUserPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-red-500"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Procesando...
                </div>
              ) : (
                <span>{!isLogin ? "Registrarse" : "Iniciar Sesión"}</span>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
      />
    </>
  );
}
