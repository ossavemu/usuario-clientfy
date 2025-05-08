'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bot, Sparkles, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect } from 'react';
import { StripeButton } from './StripeButton';

export const WelcomeSlide = React.memo(function WelcomeSlide() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleRegisterClick = useCallback(() => router.push('/auth'), [router]);
  const handleLoginClick = useCallback(
    () => router.push('/auth?mode=login'),
    [router],
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="bg-white rounded-3xl shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="px-8 py-12">
          {/* Título y subtítulo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col items-center text-center mb-10"
          >
            <div className="flex items-center">
              <h1 className="text-4xl font-semibold text-[#37265a] mb-3">
                ClientFy
              </h1>
              <motion.div
                className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-400 to-pink-500"
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
            <p className="text-base text-gray-600/90">
              Tu Asistente Inteligente para una Atención Excepcional
            </p>
          </motion.div>

          {/* Botón de Stripe */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="w-full mb-5"
          >
            <StripeButton />
          </motion.div>

          {/* Botones de registro e inicio de sesión */}
          <div className="w-full grid grid-cols-2 gap-4 mb-8">
            <Button
              onClick={handleRegisterClick}
              className="bg-[#37265a] hover:bg-[#462d72] py-5 flex items-center justify-center rounded-xl shadow-sm"
            >
              <span>Registro</span>
            </Button>
            <Button
              onClick={handleLoginClick}
              variant="outline"
              className="border-[#37265a]/10 text-[#37265a] hover:bg-[#37265a]/5 py-5 flex items-center justify-center rounded-xl"
            >
              <span>Iniciar Sesión</span>
            </Button>
          </div>

          {/* Características */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full grid grid-cols-3 gap-2 text-xs text-center"
          >
            <div className="flex flex-col items-center">
              <div className="flex justify-center mb-1">
                <UserPlus className="w-5 h-5 text-[#37265a]" />
              </div>
              <h3 className="font-medium text-sm mb-1">Registro Simple</h3>
              <p className="text-gray-500">Rápido y fácil</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex justify-center mb-1">
                <Bot className="w-5 h-5 text-[#37265a]" />
              </div>
              <h3 className="font-medium text-sm mb-1">Personalización IA</h3>
              <p className="text-gray-500">Tu asistente único</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex justify-center mb-1">
                <Sparkles className="w-5 h-5 text-[#37265a]" />
              </div>
              <h3 className="font-medium text-sm mb-1">Atención 24/7</h3>
              <p className="text-gray-500">Siempre disponible</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
});
