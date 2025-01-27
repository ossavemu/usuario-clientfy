"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Bot, Calendar, QrCode, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface InstanceInfo {
  instanceName: string;
  ip: string;
  state: string;
  created: string;
  provider: string;
  numberphone: string;
  dropletId: number;
}

interface CreateBotStepProps {
  phoneNumber: string;
}

export function CreateBotStep({ phoneNumber }: CreateBotStepProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string>("Creando el bot...");
  const [enableAppointments, setEnableAppointments] = useState(false);
  const [enableAutoInvite, setEnableAutoInvite] = useState(false);

  useEffect(() => {
    if (isCreating) {
      let intentos = 0;
      const maxIntentos = 50;

      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(
            `http://localhost:3001/api/instance/status/57${phoneNumber}`,
            {
              method: "GET",
              headers: {
                "x-api-key": "2rgIgH4GXmVzRsr8juvS3dDTxr3",
              },
            }
          );
          const data = await response.json();
          console.log("Estado actual:", data);
          
          intentos++;
          if (intentos >= maxIntentos) {
            console.log("Se alcanzó el máximo de intentos de verificación");
            clearInterval(pollInterval);
            setIsCreating(false);
          }
        } catch (error) {
          console.error("Error al verificar estado:", error);
          // Continuamos el polling a pesar del error
        }
      }, 20000);

      return () => clearInterval(pollInterval);
    }
  }, [isCreating, phoneNumber]);

  const crearInstancia = async (requestBody: {
    numberphone: string;
    provider?: string;
    enableAppointments: boolean;
    enableAutoInvite: boolean;
  }) => {
    try {
      console.log("Enviando solicitud con:", requestBody);

      const response = await fetch(
        "http://localhost:3001/api/instance/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "2rgIgH4GXmVzRsr8juvS3dDTxr3",
          },
          body: JSON.stringify({
            ...requestBody,
            numberphone: `57${requestBody.numberphone}`,
            provider: "baileys",
          }),
        }
      );

      const data = await response.json();
      console.log("Respuesta del servidor:", data);
    } catch (error) {
      console.error("Error al crear la instancia:", error);
    }
  };

  const handleCreateBot = () => {
    setIsCreating(true);
    setProgress(0);
    setMessage("Iniciando creación del asistente inteligente...");

    const requestBody = {
      numberphone: phoneNumber,
      enableAppointments,
      enableAutoInvite,
    };

    crearInstancia(requestBody);
  };

  return (
    <div className="text-center space-y-4">
      {!isCreating ? (
        <>
          <Bot className="w-16 h-16 mx-auto text-purple-600" />
          <h3 className="text-xl font-semibold">
            ¡Configura tu Asistente Inteligente!
          </h3>
          <p className="text-muted-foreground mb-6">
            Selecciona las funciones que deseas activar en tu asistente antes de
            crearlo.
          </p>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <Label htmlFor="appointments" className="font-medium">
                      Agendar Citas
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Permite a los clientes programar citas automáticamente
                    </p>
                  </div>
                </div>
                <Switch
                  id="appointments"
                  checked={enableAppointments}
                  onCheckedChange={setEnableAppointments}
                />
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
                    <p className="text-sm text-muted-foreground">
                      Dale seguimiento a tus clientes potenciales
                      automáticamente
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

          <Button className="w-full mt-6" size="lg" onClick={handleCreateBot}>
            Crear Asistente Inteligente
          </Button>
        </>
      ) : (
        <div className="space-y-6">
          <div className="relative w-64 h-64 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="5"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#4ECDC4"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                transform="rotate(-90 50 50)"
                animate={{
                  strokeDashoffset: [2 * Math.PI * 45, 0],
                  stroke: [
                    "#FF6B6B",
                    "#4ECDC4",
                    "#45B7D1",
                    "#FFA07A",
                    "#98D8C8",
                  ],
                }}
                transition={{
                  strokeDashoffset: {
                    duration: 180,
                    ease: "linear",
                  },
                  stroke: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <QrCode className="w-40 h-40 text-gray-800" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">{formatTime(180)}</p>
            <p className="text-lg font-medium mt-2">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
