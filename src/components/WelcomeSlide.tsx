import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bot, LogIn, Sparkles, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface WelcomeSlideProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function WelcomeSlide({ onGetStarted, onLogin }: WelcomeSlideProps) {
  const router = useRouter();

  // Efecto para verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-purple-600 mb-4">ClientFy</h1>
        <p className="text-xl text-gray-600">
          Tu Asistente Inteligente para una Atención Excepcional
        </p>
      </motion.div>

      <div className="w-full grid grid-cols-2 gap-4 mb-8">
        <Button
          onClick={() => router.push('/auth')}
          size="lg"
          className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Registro
        </Button>
        <Button
          onClick={() => router.push('/auth?mode=login')}
          variant="outline"
          size="lg"
          className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Iniciar Sesión
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full">
        <div className="text-center">
          <div className="bg-purple-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-800">Registro Simple</h3>
          <p className="text-sm text-gray-600">Rápido y fácil</p>
        </div>

        <div className="text-center">
          <div className="bg-purple-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Bot className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-800">Personalización IA</h3>
          <p className="text-sm text-gray-600">Tu asistente único</p>
        </div>

        <div className="text-center">
          <div className="bg-purple-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-800">Atención 24/7</h3>
          <p className="text-sm text-gray-600">Siempre disponible</p>
        </div>
      </div>
    </div>
  );
}
