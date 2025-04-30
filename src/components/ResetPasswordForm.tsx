'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

export function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [servicePassword, setServicePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    [],
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setServicePassword(e.target.value);
    },
    [],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, servicePassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      toast.success(
        'Se ha enviado un enlace de restablecimiento a tu correo electrónico',
      );
      setEmail('');
      setServicePassword('');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al procesar la solicitud',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="correo@ejemplo.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="servicePassword">Contraseña del Servicio</Label>
        <div className="relative">
          <Input
            id="servicePassword"
            type={showPassword ? 'text' : 'password'}
            value={servicePassword}
            onChange={handlePasswordChange}
            placeholder="Contraseña proporcionada por el servicio"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Ingrese la contraseña proporcionada por el servicio
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {useMemo(
          () =>
            isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Procesando...
              </div>
            ) : (
              'Restablecer Contraseña'
            ),
          [isLoading],
        )}
      </Button>
    </form>
  );
}
