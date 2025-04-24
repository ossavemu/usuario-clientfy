'use client';

import { AuthContentComponent } from '@/components/AuthContent';
import React, { Suspense } from 'react';

const AuthContent = React.memo(AuthContentComponent);

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AuthContent />
    </Suspense>
  );
}
