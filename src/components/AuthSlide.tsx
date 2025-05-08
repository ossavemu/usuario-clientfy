'use client';

import { StripeButton } from '@/components/StripeButton';
import { Button } from '@/components/ui/button';
import { Input as RawInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SuccessModal } from '@/components/ui/success-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAutoTooltip } from '@/hooks/useAutoTooltip';
import { validateServicePassword } from '@/lib/passwordService';
import { type RegistrationData } from '@/types/registration';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, EyeOff, Home, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const Input = React.memo(RawInput);

interface UserInfoStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  defaultMode?: 'login' | 'register';
}

export const UserInfoStep = React.memo(function UserInfoStep({
  data,
  onUpdate,
  defaultMode = 'register',
}: UserInfoStepProps) {
  const [error, setError] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [servicePassword, setServicePassword] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isUserPasswordFocused, setIsUserPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  const { isOpen, setIsOpen } = useAutoTooltip(0, 0);
  const [showPassword, setShowPassword] = useState(false);
  const eyeOffIcon = useMemo(() => <EyeOff size={20} />, []);
  const eyeIcon = useMemo(() => <Eye size={20} />, []);
  const [showStripeMsg, setShowStripeMsg] = useState(!isLogin);
  const tabValue = useMemo(() => (isLogin ? 'login' : 'register'), [isLogin]);

  useEffect(() => {
    if (!isLogin) {
      setShowStripeMsg(true);
      const timer = setTimeout(() => setShowStripeMsg(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowStripeMsg(false);
    }
  }, [isLogin]);

  const tooltipServicePassword = useMemo(
    () => (
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <span
            className="cursor-help text-purple-600 border-b border-dashed border-purple-400 hover:text-purple-700 hover:border-purple-600 transition-colors"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            ¿No tienes una contraseña?
          </span>
        </TooltipTrigger>
        <TooltipContent className="p-4 max-w-[300px]">
          <p className="mb-3">
            Recibirás una contraseña de servicio al correo electrónico cuando
            realices el pago
          </p>
          <StripeButton />
        </TooltipContent>
      </Tooltip>
    ),
    [isOpen, setIsOpen],
  );

  const handleTabChange = useCallback((value: string) => {
    setIsLogin(value === 'login');
  }, []);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ name: e.target.value });
    },
    [onUpdate],
  );

  const handleCompanyNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ companyName: e.target.value });
    },
    [onUpdate],
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ email: e.target.value });
    },
    [onUpdate],
  );

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
    setError('');
    setIsLoading(true);

    try {
      if (!isLogin) {
        // Validaciones de registro
        if (
          !data.name ||
          !data.companyName ||
          !data.email ||
          !servicePassword ||
          !userPassword
        ) {
          toast.error('Todos los campos son requeridos');
          throw new Error('Todos los campos son requeridos');
        }

        if (!passwordValidation.isValid) {
          toast.error('La contraseña no cumple con los requisitos mínimos');
          throw new Error('La contraseña no cumple con los requisitos mínimos');
        }

        // Validar contraseña del servicio
        const validationResult = await validateServicePassword(
          data.email,
          servicePassword,
        );

        console.log('Resultado de validación:', validationResult); // Para depuración

        if (!validationResult.success) {
          const errorMessage = validationResult.message;
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }

        if (!validationResult.isValid) {
          toast.error('La contraseña del servicio es incorrecta');
          throw new Error('La contraseña del servicio es incorrecta');
        }

        // Realizar el registro
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            companyName: data.companyName,
            email: data.email,
            password: {
              service: servicePassword,
              user: userPassword,
            },
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error || 'Error en el registro');
          throw new Error(result.error || 'Error en el registro');
        }

        toast.success('Registro exitoso');
        setShowSuccessModal(true);
      } else {
        // Login
        if (!data.email || !userPassword) {
          toast.error('Email y contraseña son requeridos');
          throw new Error('Email y contraseña son requeridos');
        }

        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: userPassword,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error || 'Credenciales incorrectas');
          throw new Error(result.error || 'Credenciales incorrectas');
        }

        if (result.token) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));

          const validationResponse = await fetch('/api/auth/validate', {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          });

          if (!validationResponse.ok) {
            toast.error('Error al establecer la sesión');
            throw new Error('Error al establecer la sesión');
          }

          toast.success('Inicio de sesión exitoso');
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error en la operación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    setServicePassword('');
    setUserPassword('');
    setIsLogin(true);
    router.push('/auth?mode=login');
  }, [router]);

  // Campo de contraseña de servicio sin memoización
  const handleServicePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setServicePassword(e.target.value);
  };

  const handleTogglePassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const handleUserPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserPassword(e.target.value);
    },
    [],
  );

  const handleToggleUserPassword = useCallback(() => {
    setShowUserPassword(!showUserPassword);
  }, [showUserPassword]);

  const handleForgotPassword = useCallback(() => {
    router.push('/forgot-password');
  }, [router]);

  const handleHomeClick = useCallback(() => router.push('/'), [router]);

  const homeButton = useMemo(
    () => (
      <Button
        onClick={handleHomeClick}
        variant="ghost"
        size="icon"
        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2"
      >
        <Home className="h-5 w-5" />
      </Button>
    ),
    [handleHomeClick],
  );

  const passwordValidationBlock = useMemo(
    () => (
      <AnimatePresence>
        {(isUserPasswordFocused || userPassword.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center items-center space-x-4 mt-2 pt-2"
          >
            <div className="flex items-center space-x-1 text-xs">
              {passwordValidation.minLength ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <X size={16} className="text-red-500" />
              )}
              <span>Mínimo 8 caracteres</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {passwordValidation.hasLetter ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <X size={16} className="text-red-500" />
              )}
              <span>Al menos una letra</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {passwordValidation.hasNumber ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <X size={16} className="text-red-500" />
              )}
              <span>Al menos un número</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    [
      isUserPasswordFocused,
      userPassword.length,
      passwordValidation.minLength,
      passwordValidation.hasLetter,
      passwordValidation.hasNumber,
    ],
  );

  const submitButton = useMemo(
    () => (
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || (!isLogin && !passwordValidation.isValid)}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {isLogin ? 'Iniciando sesión...' : 'Registrando...'}
          </div>
        ) : isLogin ? (
          'Iniciar Sesión'
        ) : (
          'Registrarse'
        )}
      </Button>
    ),
    [isLoading, isLogin, passwordValidation.isValid],
  );

  const errorBlock = useMemo(
    () => (
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
    ),
    [error],
  );

  const handleSuccessModalAction = useCallback(() => {
    setShowSuccessModal(false);
    setServicePassword('');
    setUserPassword('');
    setIsLogin(true);
    router.push('/auth?mode=login');
  }, [router]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <Tabs
          value={tabValue}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="flex flex-col items-center">
            <TabsList className="w-full max-w-xs mb-6">
              <TabsTrigger
                value="register"
                className="w-full transition-all duration-300"
              >
                Registro
              </TabsTrigger>
              <TabsTrigger
                value="login"
                className="w-full transition-all duration-300"
              >
                Iniciar Sesión
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tabValue}
              initial={{ opacity: 0, x: tabValue === 'login' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tabValue === 'login' ? -20 : 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <TabsContent value="register" className="space-y-4 mt-0">
                {showStripeMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-purple-50 p-3 rounded-lg mb-4"
                  >
                    <p className="text-sm text-purple-800 text-center">
                      Es necesario realizar el pago antes de registrarse
                    </p>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      placeholder="Juan Pérez"
                      value={data.name}
                      onChange={handleNameChange}
                      autoCapitalize="words"
                      autoComplete="name"
                      autoCorrect="off"
                      type="text"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Nombre de Empresa</Label>
                    <Input
                      id="companyName"
                      placeholder="Mi Empresa S.A."
                      value={data.companyName}
                      onChange={handleCompanyNameChange}
                      autoCapitalize="words"
                      autoComplete="organization"
                      autoCorrect="off"
                      type="text"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="usuario@ejemplo.com"
                      value={data.email}
                      onChange={handleEmailChange}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      type="email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="servicePassword">
                        Contraseña de Servicio
                      </Label>
                      <div className="text-xs">{tooltipServicePassword}</div>
                    </div>
                    <div className="relative">
                      <Input
                        id="servicePassword"
                        value={servicePassword}
                        onChange={handleServicePasswordChange}
                        autoCapitalize="none"
                        autoComplete="off"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={handleTogglePassword}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? eyeOffIcon : eyeIcon}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="userPassword"
                      className="flex items-center justify-between"
                    >
                      <span>Contraseña Personal</span>
                      {isUserPasswordFocused && userPassword && (
                        <div className="flex gap-2 items-center text-xs">
                          <div className="flex items-center gap-1">
                            {passwordValidation.minLength ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <X className="w-3 h-3 text-red-500" />
                            )}
                            <span
                              className={
                                passwordValidation.minLength
                                  ? 'text-green-600'
                                  : 'text-red-500'
                              }
                            >
                              8+ caracteres
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordValidation.hasLetter ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <X className="w-3 h-3 text-red-500" />
                            )}
                            <span
                              className={
                                passwordValidation.hasLetter
                                  ? 'text-green-600'
                                  : 'text-red-500'
                              }
                            >
                              Letras
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordValidation.hasNumber ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <X className="w-3 h-3 text-red-500" />
                            )}
                            <span
                              className={
                                passwordValidation.hasNumber
                                  ? 'text-green-600'
                                  : 'text-red-500'
                              }
                            >
                              Números
                            </span>
                          </div>
                        </div>
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="userPassword"
                        value={userPassword}
                        onChange={handleUserPasswordChange}
                        onFocus={() => setIsUserPasswordFocused(true)}
                        onBlur={() => setIsUserPasswordFocused(false)}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        type={showUserPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={handleToggleUserPassword}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showUserPassword ? eyeOffIcon : eyeIcon}
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="login" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input
                      id="email-login"
                      placeholder="usuario@ejemplo.com"
                      value={data.email}
                      onChange={handleEmailChange}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      type="email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password-login">Contraseña</Label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password-login"
                        value={userPassword}
                        onChange={handleUserPasswordChange}
                        autoCapitalize="none"
                        autoComplete="current-password"
                        type={showUserPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={handleToggleUserPassword}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showUserPassword ? eyeOffIcon : eyeIcon}
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 p-3 rounded-lg"
          >
            <p className="text-sm text-red-800">{error}</p>
          </motion.div>
        )}

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              ></motion.div>
            ) : isLogin ? (
              'Iniciar Sesión'
            ) : (
              'Registrarse'
            )}
          </Button>
        </motion.div>

        {!isLogin && !showStripeMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <StripeButton />
          </motion.div>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Registro Exitoso"
        description="Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión."
        icon={<Check className="h-6 w-6 text-green-600" />}
        actionText="Iniciar Sesión"
        onAction={handleSuccessModalAction}
      />
      <div className="flex justify-between items-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            type="button"
            onClick={handleHomeClick}
            className="inline-flex items-center text-sm text-gray-500 hover:text-purple-600"
          >
            <Home className="h-4 w-4 mr-1" />
            Regresar a inicio
          </button>
        </motion.div>
      </div>
    </form>
  );
});
