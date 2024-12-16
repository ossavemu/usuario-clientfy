'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bot, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateBotStepProps {
  onBack: () => void;
}

export function CreateBotStep({ onBack }: CreateBotStepProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    if (isCreating) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setIsCreating(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      const progressTimer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return prevProgress + 1;
        });
      }, 1800); // 180 seconds / 100 steps = 1.8 seconds per step

      return () => {
        clearInterval(timer);
        clearInterval(progressTimer);
      };
    }
  }, [isCreating]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressMessage = () => {
    if (progress < 33) return 'Iniciando creación del bot...';
    if (progress < 66) return 'Configurando parámetros...';
    return 'Finalizando proceso...';
  };

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  return (
    <div className="text-center space-y-4">
      {!isCreating ? (
        <>
          <Bot className="w-16 h-16 mx-auto text-purple-600" />
          <h3 className="text-xl font-semibold">¡Todo listo!</h3>
          <p className="text-muted-foreground">
            Has completado toda la información necesaria. Haz clic en el botón
            para crear tu bot.
          </p>
          <Button
            className="w-full"
            size="lg"
            onClick={() => setIsCreating(true)}
          >
            Crear Bot
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
                stroke={colors[Math.floor((progress / 100) * colors.length)]}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                transform="rotate(-90 50 50)"
                animate={{
                  strokeDashoffset: [2 * Math.PI * 45, 0],
                  stroke: colors,
                }}
                transition={{
                  strokeDashoffset: {
                    duration: 180,
                    ease: 'linear',
                  },
                  stroke: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <QrCode className="w-40 h-40 text-gray-800" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">{formatTime(timeLeft)}</p>
            <p className="text-lg font-medium mt-2">{getProgressMessage()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
