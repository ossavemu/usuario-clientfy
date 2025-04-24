'use client';

import { Card } from '@/components/ui/card';
import { countries } from '@/lib/constants/countries';
import { type RegistrationData } from '@/types/registration';
import { motion } from 'framer-motion';
import {
  Bot,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Rocket,
  Sparkles,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface DashboardSlideProps {
  data: RegistrationData;
  onNavigate: (step: number) => void;
  userEmail: string | null;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onLogout: () => void;
}

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'optional' | 'special';
  onClick: () => void;
  delay: number;
  isLast?: boolean;
}

const StepCard = React.memo(function StepCard({
  icon,
  title,
  description = '',
  status,
  onClick,
  delay,
  isLast = false,
}: StepCardProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 hover:border-green-300';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 hover:border-yellow-300';
      case 'optional':
        return 'bg-purple-50/50 border-purple-200 hover:border-purple-300';
      case 'special':
        return 'bg-linear-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return (
          <div className="absolute top-2 right-2">
            <svg
              className="h-5 w-5 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'optional':
        return (
          <div className="absolute top-2 right-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
      >
        <Card
          className={`relative p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${getStatusStyles()}`}
          onClick={onClick}
        >
          {getStatusIcon()}
          <div className="flex items-center space-x-3">
            <div
              className={`rounded-full p-1.5 ${
                status === 'special' ? 'bg-white/20' : 'bg-white/80'
              }`}
            >
              <div
                className={
                  status === 'special' ? 'text-white' : 'text-purple-600'
                }
              >
                {icon}
              </div>
            </div>
            <div>
              <h3
                className={`font-medium ${
                  status === 'special' ? 'text-white' : ''
                }`}
              >
                {title} {description}
              </h3>
            </div>
          </div>
        </Card>
      </motion.div>
      {!isLast && (
        <div className="absolute left-5 top-full h-4 w-0.5 bg-linear-to-b from-purple-300 to-purple-100" />
      )}
    </div>
  );
});

const capitalizeWords = (name: string) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Si no existe el componente Skeleton, defino uno mínimo aquí
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`} />
);

export function DashboardSlide({
  data,
  onNavigate,
  userEmail,
  onUpdate,
  onLogout,
}: DashboardSlideProps) {
  const [isVerifyingBot, setIsVerifyingBot] = useState(true);
  const [canCreateBot, setCanCreateBot] = useState(false);
  const [hasExistingBot, setHasExistingBot] = useState(false);
  const [hasCheckedData, setHasCheckedData] = useState(false);

  // Verificar datos locales de manera más precisa
  const hasPhone = Boolean(data?.phone && data?.countryCode);
  const hasPrompt = Boolean(data?.prompt);
  const hasImages = Boolean(data?.images && data?.images.length > 0);
  const hasTrainingFiles = Boolean(
    data?.trainingFiles && data?.trainingFiles.length > 0,
  );

  const phoneIcon = useMemo(() => <Phone className="w-5 h-5" />, []);
  const botIcon = useMemo(() => <Bot className="w-5 h-5" />, []);
  const imageIcon = useMemo(() => <ImageIcon className="w-5 h-5" />, []);
  const fileIcon = useMemo(() => <FileText className="w-5 h-5" />, []);
  const loaderIcon = useMemo(
    () => <Loader2 className="w-5 h-5 animate-spin" />,
    [],
  );
  const rocketIcon = useMemo(() => <Rocket className="w-5 h-5" />, []);
  const finalIcon = useMemo(() => {
    if (isVerifyingBot) return loaderIcon;
    if (hasExistingBot) return botIcon;
    return rocketIcon;
  }, [isVerifyingBot, hasExistingBot, botIcon, loaderIcon, rocketIcon]);

  const handlePhoneClick = useCallback(() => onNavigate(1), [onNavigate]);
  const handleBotClick = useCallback(() => onNavigate(2), [onNavigate]);
  const handleImageClick = useCallback(() => onNavigate(3), [onNavigate]);
  const handleFileClick = useCallback(() => onNavigate(4), [onNavigate]);
  const handleFinalClick = useCallback(() => {
    if (!isVerifyingBot) {
      if (hasExistingBot || canCreateBot) {
        onNavigate(5);
      } else if (!hasPhone) {
        onNavigate(1);
      } else if (!hasPrompt) {
        onNavigate(2);
      }
    }
  }, [
    isVerifyingBot,
    hasExistingBot,
    canCreateBot,
    hasPhone,
    hasPrompt,
    onNavigate,
  ]);

  useEffect(() => {
    const verifyBotData = async () => {
      try {
        // Petición de teléfono
        const phoneResponse = await fetch(`/api/phone?email=${userEmail}`);
        const phoneData = await phoneResponse.json();
        if (phoneData.success && phoneData.phone) {
          onUpdate({
            phone: phoneData.phone.phone,
            countryCode: phoneData.phone.countryCode,
            serviceType: phoneData.phone.serviceType,
          });
        }

        if (phoneData.phone) {
          let phoneNumber = phoneData.phone.phone;
          if (
            !phoneNumber.startsWith(
              phoneData.phone.countryCode.replace('+', ''),
            )
          ) {
            phoneNumber = `${phoneData.phone.countryCode.replace(
              '+',
              '',
            )}${phoneNumber}`;
          }
          // Paralelizar todas las peticiones
          const [instanceRes, promptRes, imagesRes, trainingRes] =
            await Promise.all([
              fetch(`/api/instance/verify?email=${userEmail}`),
              fetch(`/api/prompt?phoneNumber=${phoneNumber}`),
              fetch(`/api/images?phoneNumber=${phoneNumber}`),
              fetch(`/api/training-files?phoneNumber=${phoneNumber}`),
            ]);
          const [instanceData, promptData, imagesData, trainingData] =
            await Promise.all([
              instanceRes.json(),
              promptRes.json(),
              imagesRes.json(),
              trainingRes.json(),
            ]);
          setHasExistingBot(instanceData.exists && instanceData.isActive);
          setCanCreateBot(!instanceData.exists);
          const hasPrompt = promptData.success && promptData.prompt;
          const hasImages = imagesData.success && imagesData.images?.length > 0;
          const hasTraining =
            trainingData.success && trainingData.files?.length > 0;
          onUpdate({
            prompt: hasPrompt ? promptData.prompt : data.prompt,
            images: hasImages ? imagesData.images : data.images,
            trainingFiles: hasTraining
              ? trainingData.files
              : data.trainingFiles,
          });
        }
      } catch (error) {
        console.error('Error al verificar datos:', error);
      } finally {
        setIsVerifyingBot(false);
        setHasCheckedData(true);
      }
    };
    verifyBotData();
  }, [
    userEmail,
    hasCheckedData,
    onUpdate,
    data.prompt,
    data.images,
    data.trainingFiles,
  ]);

  // Función para obtener el saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        text: '¡Buenos días',
        color: 'text-amber-500',
        emoji: '🌅',
      };
    } else if (hour >= 12 && hour < 19) {
      return {
        text: '¡Buenas tardes',
        color: 'text-fuchsia-600',
        emoji: '🌤️',
      };
    } else {
      return {
        text: '¡Buenas noches',
        color: 'text-blue-600',
        emoji: '🌙',
      };
    }
  };

  const greeting = getGreeting();

  // Log para verificar los estados calculados
  useEffect(() => {
    console.log('Estados calculados:', {
      hasPhone,
      hasPrompt,
      hasImages,
      hasTrainingFiles,
      name: data?.name,
      formattedPhone:
        data?.phone && data?.countryCode
          ? `${data.countryCode}${data.phone}`
          : null,
    });
  }, [data, hasPhone, hasPrompt, hasImages, hasTrainingFiles]);

  // Formatear el teléfono para mostrar
  const formattedPhone =
    data?.phone && data?.countryCode
      ? `${data.countryCode}${data.phone}`
      : null;

  // Skeletons para feedback visual
  const SkeletonLine = () => (
    <div className="flex items-center gap-2 text-sm">
      <Skeleton className="w-4 h-4 rounded-full bg-gray-200" />
      <Skeleton className="h-4 w-24 bg-gray-200 rounded" />
    </div>
  );

  const skeletonLine = useMemo(() => <SkeletonLine />, []);

  return (
    <div className="space-y-6">
      <motion.div
        className="text-center relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={onLogout}
          className="absolute right-0 top-0 text-gray-500 hover:text-gray-700"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <h2 className={`text-2xl font-bold ${greeting.color}`}>
          {greeting.text}
          {data?.name ? <span>, {capitalizeWords(data.name)}</span> : null}!
          {greeting.emoji}
        </h2>
      </motion.div>

      <motion.div
        className="bg-white/50 rounded-lg p-4 space-y-3"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isVerifyingBot ? (
          <>
            {skeletonLine}
            {skeletonLine}
            {skeletonLine}
          </>
        ) : (
          <>
            {formattedPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">País:</span>
                <span className="font-medium">
                  {countries.find((c) => c.value === data.countryCode)?.label ||
                    'Desconocido'}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-purple-600" />
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{userEmail}</span>
            </div>
            {formattedPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">Teléfono:</span>
                <span className="font-medium">{formattedPhone}</span>
              </div>
            )}
            {data.companyName && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Empresa:</span>
                <span className="font-medium text-xs">{data.companyName}</span>
              </div>
            )}
          </>
        )}
      </motion.div>

      <div className="space-y-3">
        <StepCard
          icon={phoneIcon}
          title="Registro de Celular"
          description=""
          status={hasPhone ? 'completed' : 'pending'}
          onClick={handlePhoneClick}
          delay={0.3}
        />

        <StepCard
          icon={botIcon}
          title="Configura tu Asistente"
          description=""
          status={hasPrompt ? 'completed' : 'pending'}
          onClick={handleBotClick}
          delay={0.4}
        />

        <StepCard
          icon={imageIcon}
          title="Imágenes del Asistente"
          description=""
          status={hasImages ? 'completed' : 'optional'}
          onClick={handleImageClick}
          delay={0.5}
        />

        <StepCard
          icon={fileIcon}
          title="Archivos de Entrenamiento"
          description=""
          status={hasTrainingFiles ? 'completed' : 'optional'}
          onClick={handleFileClick}
          delay={0.6}
        />

        <StepCard
          icon={finalIcon}
          title={
            isVerifyingBot
              ? 'Verificando información...'
              : hasExistingBot
              ? 'Revisa tu Asistente Inteligente'
              : canCreateBot
              ? '¡Crear tu Asistente Ahora!'
              : 'Crear Asistente (Completa los pasos requeridos)'
          }
          description=""
          status={
            isVerifyingBot
              ? 'pending'
              : hasExistingBot
              ? 'completed'
              : canCreateBot
              ? 'special'
              : 'pending'
          }
          onClick={handleFinalClick}
          delay={0.7}
          isLast={true}
        />
      </div>
    </div>
  );
}
