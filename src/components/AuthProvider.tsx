'use client';

import { Button } from '@/components/ui/button';
import { jwtDecode } from 'jwt-decode';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AuthProviderProps {
  children?: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = async (token: string) => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  };

  const checkAuth = async () => {
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
        window.location.hash = '/welcome';
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error validando token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      window.location.hash = '/welcome';
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Observar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    // Observar cambios en el hash de la URL
    const handleHashChange = () => {
      const token = localStorage.getItem('token');
      if (token && !isAuthenticated) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hashchange', handleHashChange);

    // Crear un observador para cambios en localStorage dentro de la misma ventana
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && !isAuthenticated) {
        checkAuth();
      } else if (!token && isAuthenticated) {
        setIsAuthenticated(false);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hashchange', handleHashChange);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
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
    window.location.hash = '/welcome';
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      {isAuthenticated && (
        <div className="absolute top-0 right-0 p-4 z-50">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-white hover:text-white/80 hover:bg-purple-700/20"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      )}
      {children}
    </>
  );
}