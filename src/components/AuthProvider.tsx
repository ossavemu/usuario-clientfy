'use client';

import { Button } from '@/components/ui/button';
import { jwtDecode } from 'jwt-decode';
import { Home, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Dispatch, SetStateAction } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface AuthProviderProps {
  children?: React.ReactNode;
}

// Crear el contexto para el estado de creación del bot
export const BotCreationContext = createContext<{
  isCreatingBot: boolean;
  setIsCreatingBot: Dispatch<SetStateAction<boolean>>;
}>({
  isCreatingBot: false,
  setIsCreatingBot: () => {},
});

export const useBotCreation = () => useContext(BotCreationContext);

export const AuthProvider = React.memo(function AuthProvider({
  children,
}: AuthProviderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBot, setIsCreatingBot] = useState(false);

  const botCreationContextValue = useMemo(
    () => ({ isCreatingBot, setIsCreatingBot }),
    [isCreatingBot, setIsCreatingBot],
  );

  const validateSession = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Evitar caché en la validación
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Sesión inválida');
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Error validando sesión:', error);
      return false;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const isValid = await validateSession(token);
      if (!isValid) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        router.replace('/');
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error validando token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  }, [validateSession, router]);

  useEffect(() => {
    checkAuth();

    // Observar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Crear un observador para cambios en localStorage dentro de la misma ventana
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && !isAuthenticated) {
        checkAuth();
      } else if (!token && isAuthenticated) {
        setIsAuthenticated(false);
        router.replace('/');
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [checkAuth, isAuthenticated, router]);

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<{ email: string }>(token);
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: decoded.email }),
        });
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    router.push('/');
  }, [router]);

  const handleGoHome = useCallback(() => {
    window.location.href = '/dashboard';
  }, []);

  const authButtons = useMemo(
    () => (
      <div className="absolute top-0 right-0 p-4 z-50 flex gap-2">
        <Button
          variant="ghost"
          onClick={handleGoHome}
          disabled={isCreatingBot}
          className={`text-white hover:text-white/80 hover:bg-purple-700/20 ${
            isCreatingBot ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          size="sm"
        >
          <Home className="h-4 w-4 mr-2" />
          Inicio
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isCreatingBot}
          className={`text-white hover:text-white/80 hover:bg-purple-700/20 ${
            isCreatingBot ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          size="sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    ),
    [isCreatingBot, handleGoHome, handleLogout],
  );

  if (isLoading) {
    return null;
  }

  return (
    <BotCreationContext.Provider value={botCreationContextValue}>
      {isAuthenticated && authButtons}
      {children}
    </BotCreationContext.Provider>
  );
});
