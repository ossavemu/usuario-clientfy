'use client';

import { Card, CardContent } from '@/components/ui/card';
import { WelcomeSlide } from '@/components/WelcomeSlide';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isLoginAttempt = window.location.hash.includes('user-info');

    // Solo redirigir al dashboard si hay token y no es un intento de login
    if (token && !isLoginAttempt) {
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-[500px]">
        <CardContent className="p-6">
          <WelcomeSlide
            onGetStarted={() => {
              window.location.href = '/dashboard#/user-info';
            }}
            onLogin={() => {
              window.location.href = '/dashboard#/user-info#login';
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
