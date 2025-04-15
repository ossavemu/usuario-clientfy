'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAutoTooltip } from '@/hooks/useAutoTooltip';
import { motion } from 'framer-motion';
import { Bot, LogIn, Sparkles, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { StripeButton } from './StripeButton';

export function WelcomeSlide() {
  const router = useRouter();
  const { isOpen, setIsOpen } = useAutoTooltip(1000, 3000);

  // Efecto para verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  // Animaciones para elementos que aparecen en secuencia
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="bg-white/80 backdrop-blur-xs rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="px-8 py-10 space-y-8">
          {/* Encabezado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-semibold bg-linear-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent mb-3">
              ClientFy
            </h1>
            <p className="text-base text-gray-600/90 max-w-xs mx-auto">
              Tu Asistente Inteligente para una Atención Excepcional
            </p>
          </motion.div>

          {/* Botón principal */}
          <div>
            <StripeButton />
          </div>

          {/* Botones de autenticación */}
          <div className="flex gap-4">
            <TooltipProvider delayDuration={100}>
              <Tooltip open={isOpen}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => router.push('/auth')}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 py-6 flex items-center justify-center gap-2 transition-all duration-300 rounded-2xl shadow-xs"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Registro</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={5}
                  className="z-50 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg shadow-lg"
                >
                  <p className="text-sm text-gray-700">
                    Es necesario realizar el pago antes de registrarse
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              onClick={() => router.push('/auth?mode=login')}
              variant="outline"
              className="flex-1 border-purple-100 text-purple-600 hover:bg-purple-50 py-6 flex items-center justify-center gap-2 transition-all duration-300 rounded-2xl"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Button>
          </div>

          {/* Características */}
          <motion.div
            className="grid grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center">
              <div className="bg-purple-50/50 rounded-2xl p-3 w-14 h-14 flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-medium text-sm text-gray-800 mb-1">
                Registro Simple
              </h3>
              <p className="text-xs text-gray-500/90">Rápido y fácil</p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <div className="bg-purple-50/50 rounded-2xl p-3 w-14 h-14 flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-medium text-sm text-gray-800 mb-1">
                Personalización IA
              </h3>
              <p className="text-xs text-gray-500/90">Tu asistente único</p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <div className="bg-purple-50/50 rounded-2xl p-3 w-14 h-14 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-medium text-sm text-gray-800 mb-1">
                Atención 24/7
              </h3>
              <p className="text-xs text-gray-500/90">Siempre disponible</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
