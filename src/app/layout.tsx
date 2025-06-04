import { AuthProvider } from '@/components/AuthProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
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
                #7500D1 0%,    /* Violeta Vibrante 1 */
                #8F00FF 25%,   /* Violeta Brillante */
                #5C00A3 50%,   /* Violeta Vibrante 2 */
                #8F00FF 75%,   /* Violeta Brillante */
                #7500D1 100%    /* Violeta Vibrante 1 */
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
        <TooltipProvider>
          <div className="fixed inset-0 flex flex-col animated-gradient">
            <div className="flex-none h-16">
              <AuthProvider />
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
