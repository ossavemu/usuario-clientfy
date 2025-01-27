import { AuthProvider } from '@/components/AuthProvider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ClientFy tu asistente inteligente para tu negocio',
  description: 'ClientFy es tu asistente inteligente para tu negocio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <style>
          {`
            @keyframes gradientAnimation {
              0% {
                background-position: 0% 50%;
                background-size: 200% 200%;
              }
              50% {
                background-position: 100% 50%;
                background-size: 300% 300%;
              }
              100% {
                background-position: 0% 50%;
                background-size: 200% 200%;
              }
            }

            .animated-gradient {
              background: linear-gradient(
                -45deg,
                #420075 0%,   /* Morado Oscuro Base */
                #7954A1 20%,  /* Violeta Medio-Oscuro */
                #7954A1 35%,  /* Violeta Medio-Oscuro */
                #8F00FF 45%,  /* Violeta Brillante (reducido) */
                #A32EFF 50%,  /* Violeta Medio */
                #8F00FF 55%,  /* Violeta Brillante (reducido) */
                #7954A1 65%,  /* Violeta Medio-Oscuro */
                #7954A1 80%,  /* Violeta Medio-Oscuro */
                #420075 100%  /* Morado Oscuro Base */
              );
              background-size: 300% 300%;
              animation: gradientAnimation 20s ease-in-out infinite;
            }
          `}
        </style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}
      >
        <div className="fixed inset-0 flex flex-col animated-gradient">
          <div className="flex-none h-16">
            <AuthProvider />
          </div>
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
