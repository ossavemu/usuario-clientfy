'use client';

import RegistrationFlow from '@/components/flows/registration-flow';
import { useEffect } from 'react';

export default function DashboardPage() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isLoginAttempt = window.location.hash.includes('user-info');

    // Solo redirigir si no hay token Y no es un intento de login/registro
    if (!token && !isLoginAttempt) {
      window.location.href = '/';
    }
  }, []);

  return <RegistrationFlow />;
}
