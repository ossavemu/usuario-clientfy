'use client';

import { UserInfoStep } from '@/components/AuthSlide';
import { Card, CardContent } from '@/components/ui/card';
import { type RegistrationData } from '@/types/registration';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = searchParams.get('mode') === 'login';
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    companyName: '',
    email: '',
    password: '',
    phone: '',
    countryCode: '',
    serviceType: 'qr',
    images: [],
    trainingFiles: [],
    prompt: '',
    assistantName: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleUpdate = (data: Partial<RegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    router.push('/dashboard');
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-[500px]">
        <CardContent className="p-6">
          <UserInfoStep
            data={formData}
            onUpdate={handleUpdate}
            onNext={handleNext}
            defaultMode={isLogin ? 'login' : 'register'}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AuthContent />
    </Suspense>
  );
}
