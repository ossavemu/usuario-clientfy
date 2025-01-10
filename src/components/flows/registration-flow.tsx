"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type RegistrationData } from "../../types/registration";
import { DashboardSlide } from "../DashboardSlide";
import { CreateBotStep } from "../steps/create-bot";
import { ImageUploadStep } from "../steps/image-upload";
import { PhoneStep } from "../steps/phone";
import { PromptStep } from "../steps/prompt";
import { TrainingFilesStep } from "../steps/training-files";

const steps = [
  { name: "Dashboard", path: "" },
  { name: "Registro de Celular", path: "phone" },
  { name: "Configuración del Asistente", path: "prompt" },
  { name: "Imágenes del Asistente", path: "images" },
  { name: "Archivos de Entrenamiento", path: "training" },
  { name: "Crear Asistente", path: "create-assistant" },
];

export default function RegistrationFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    countryCode: "",
    serviceType: "qr",
    images: [],
    trainingFiles: [],
    prompt: "",
    assistantName: "",
  });

  const updateFormData = (data: Partial<RegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    const nextIndex = Math.min(currentStep + 1, steps.length - 1);
    window.location.hash = "/" + steps[nextIndex].path;
    setCurrentStep(nextIndex);
  };

  const prevStep = () => {
    const prevIndex = Math.max(currentStep - 1, 0);
    window.location.hash = "/" + steps[prevIndex].path;
    setCurrentStep(prevIndex);
  };

  const goToStep = (stepIndex: number) => {
    window.location.hash = "/" + steps[stepIndex].path;
    setCurrentStep(stepIndex);
  };

  // Efecto para cargar el token y email del usuario
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }

        const decoded = jwtDecode<{ email: string }>(token);
        setUserEmail(decoded.email);

        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          updateFormData(user);
        }

        // Cargar datos adicionales del usuario
        const userResponse = await fetch(`/api/user?email=${decoded.email}`);
        if (userResponse.ok) {
          const data = await userResponse.json();
          if (data.user) {
            updateFormData(data.user);
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    loadUserData();
  }, [router]);

  // Manejar cierre de sesión
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        });
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/");
    }
  };

  const renderStep = () => {
    if (isLoadingInitialData) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <DashboardSlide
            data={formData}
            onNavigate={goToStep}
            userEmail={userEmail}
            onUpdate={updateFormData}
            onLogout={handleLogout}
          />
        );
      case 1:
        return (
          <PhoneStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 2:
        return (
          <PromptStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <ImageUploadStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <TrainingFilesStep
            data={formData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return <CreateBotStep />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-[500px]">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
