'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAutoTooltip } from '@/hooks/useAutoTooltip';
import { motion } from 'framer-motion';
import { Bot, LogIn, Sparkles, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo } from 'react';
import { StripeButton } from './StripeButton';

// Fuera del componente
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

export const WelcomeSlide = React.memo(function WelcomeSlide() {
  const router = useRouter();
  const { isOpen, setIsOpen } = useAutoTooltip(1000, 3000);

  // Efecto para verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const headerMotion = useMemo(
    () => (
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
    ),
    [],
  );

  const tooltipContent = useMemo(
    () => (
      <TooltipContent
        side="top"
        sideOffset={5}
        className="z-50 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg shadow-lg"
      >
        <p className="text-sm text-gray-700">
          Es necesario realizar el pago antes de registrarse
        </p>
      </TooltipContent>
    ),
    [],
  );

  const stripeButton = useMemo(() => <StripeButton />, []);

  const handleRegisterClick = useCallback(() => router.push('/auth'), [router]);
  const handleMouseEnter = useCallback(() => setIsOpen(true), [setIsOpen]);
  const handleMouseLeave = useCallback(() => setIsOpen(false), [setIsOpen]);
  const handleLoginClick = useCallback(
    () => router.push('/auth?mode=login'),
    [router],
  );

  const userPlusIcon = useMemo(
    () => <UserPlus className="w-6 h-6 text-purple-500" />,
    [],
  );

  const botIcon = useMemo(
    () => <Bot className="w-6 h-6 text-purple-500" />,
    [],
  );

  const sparklesIcon = useMemo(
    () => <Sparkles className="w-6 h-6 text-purple-500" />,
    [],
  );

  const tooltip = useMemo(
    () => (
      <Tooltip open={isOpen}>
        <TooltipTrigger asChild>
          <Button
            onClick={handleRegisterClick}
            className="flex-1 bg-purple-600 hover:bg-purple-500 py-6 flex items-center justify-center gap-2 transition-all duration-300 rounded-2xl shadow-xs"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {userPlusIcon}
            <span>Registro</span>
          </Button>
        </TooltipTrigger>
        {tooltipContent}
      </Tooltip>
    ),
    [
      isOpen,
      handleRegisterClick,
      handleMouseEnter,
      handleMouseLeave,
      tooltipContent,
      userPlusIcon,
    ],
  );

  const loginButton = useMemo(
    () => (
      <Button
        onClick={handleLoginClick}
        variant="outline"
        className="flex-1 border-purple-100 text-purple-600 hover:bg-purple-50 py-6 flex items-center justify-center gap-2 transition-all duration-300 rounded-2xl"
      >
        <LogIn className="w-4 h-4" />
        <span>Iniciar Sesión</span>
      </Button>
    ),
    [handleLoginClick],
  );

  const featuresBlock = useMemo(
    () => (
      <motion.div
        className="grid grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center">
          <div className="bg-purple-50/50 rounded-2xl p-3 w-14 h-14 flex items-center justify-center mx-auto mb-3">
            {userPlusIcon}
          </div>
          <h3 className="font-medium text-sm text-gray-800 mb-1">
            Registro Simple
          </h3>
          <p className="text-xs text-gray-500/90">Rápido y fácil</p>
        </motion.div>
        <motion.div variants={itemVariants} className="text-center">
          <div className="bg-purple-50/50 rounded-2xl p-3 w-14 h-14 flex items-center justify-center mx-auto mb-3">
            {botIcon}
          </div>
          <h3 className="font-medium text-sm text-gray-800 mb-1">
            Personalización IA
          </h3>
          <p className="text-xs text-gray-500/90">Tu asistente único</p>
        </motion.div>
        <motion.div variants={itemVariants} className="text-center">
          <div className="bg-purple-50/50 rounded-2xl p-3 w-14 h-14 flex items-center justify-center mx-auto mb-3">
            {sparklesIcon}
          </div>
          <h3 className="font-medium text-sm text-gray-800 mb-1">
            Atención 24/7
          </h3>
          <p className="text-xs text-gray-500/90">Siempre disponible</p>
        </motion.div>
      </motion.div>
    ),
    [userPlusIcon, botIcon, sparklesIcon],
  );

  const mainMotionBlock = useMemo(
    () => (
      <motion.div
        className="bg-white/80 backdrop-blur-xs rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="px-8 py-10 space-y-8">
          {headerMotion}
          <div>{stripeButton}</div>
          <div className="flex gap-4">
            {tooltip}
            {loginButton}
          </div>
          {featuresBlock}
        </div>
      </motion.div>
    ),
    [headerMotion, stripeButton, tooltip, loginButton, featuresBlock],
  );

  return <div className="w-full max-w-md mx-auto">{mainMotionBlock}</div>;
});
