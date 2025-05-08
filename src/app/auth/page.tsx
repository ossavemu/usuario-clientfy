'use client';

import { AuthContentComponent } from '@/components/AuthContent';
import { motion } from 'framer-motion';
import React, { Suspense } from 'react';

// Componente de carga con animación
const LoadingSpinner = () => {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-24 h-24">
        {/* Círculo de puntos giratorios */}
        {Array.from({ length: 12 }).map((_, i) => {
          const rotate = i * 30; // 360 / 12 = 30 grados
          const delay = i * 0.1;
          const baseOpacity = 0.2 + (i / 12) * 0.7;

          return (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 bg-purple-500 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0',
              }}
              initial={{ opacity: baseOpacity, x: 30, y: 0, rotate }}
              animate={{
                opacity: [baseOpacity, 1, baseOpacity],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </div>
      <motion.p
        className="mt-4 text-gray-600"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        Cargando...
      </motion.p>
    </motion.div>
  );
};

const AuthContent = React.memo(AuthContentComponent);

export default function AuthPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <AuthContent />
        </motion.div>
      </Suspense>
    </motion.div>
  );
}
