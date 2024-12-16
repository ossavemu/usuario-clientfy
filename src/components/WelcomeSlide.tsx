import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Bot, Sparkles, Zap } from 'lucide-react'

interface WelcomeSlideProps {
  onGetStarted: () => void
}

export function WelcomeSlide({ onGetStarted }: WelcomeSlideProps) {
  return (
    <div className="text-center space-y-6">
      <motion.h1 
        className="text-3xl md:text-4xl font-bold text-purple-600 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Bienvenido a ClientFy
      </motion.h1>
      <motion.p 
        className="text-lg text-gray-600 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Crea chatbots inteligentes que transformarán la experiencia de tus clientes.
      </motion.p>
      <motion.div
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="p-4 flex flex-col items-center text-center">
          <Bot className="w-8 h-8 md:w-12 md:h-12 text-purple-500 mb-2" />
          <h3 className="font-semibold mb-1 text-sm md:text-base">IA Avanzada</h3>
          <p className="text-xs md:text-sm text-gray-600">Chatbots con la última tecnología en IA</p>
        </div>
        <div className="p-4 flex flex-col items-center text-center">
          <Zap className="w-8 h-8 md:w-12 md:h-12 text-purple-500 mb-2" />
          <h3 className="font-semibold mb-1 text-sm md:text-base">Rápido y Fácil</h3>
          <p className="text-xs md:text-sm text-gray-600">Configura tu chatbot en minutos</p>
        </div>
        <div className="p-4 flex flex-col items-center text-center">
          <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-purple-500 mb-2" />
          <h3 className="font-semibold mb-1 text-sm md:text-base">Personalizable</h3>
          <p className="text-xs md:text-sm text-gray-600">Adapta el bot a tu marca</p>
        </div>
        <div className="p-4 flex flex-col items-center text-center">
          <svg className="w-8 h-8 md:w-12 md:h-12 text-purple-500 mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 14.66V20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V14.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3L8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="font-semibold mb-1 text-sm md:text-base">Integración</h3>
          <p className="text-xs md:text-sm text-gray-600">Conecta con tus sistemas</p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Button onClick={onGetStarted} size="lg" className="w-full md:w-auto">
          Comenzar ahora
        </Button>
      </motion.div>
    </div>
  )
}

