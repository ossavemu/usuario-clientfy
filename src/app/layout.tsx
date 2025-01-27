import { AuthProvider } from "@/components/AuthProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClientFy tu asistente inteligente para tu negocio",
  description: "ClientFy es tu asistente inteligente para tu negocio",
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
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }

            .animated-gradient {
              background: linear-gradient(
                -45deg,
                #6b46c1,
                #9333ea,
                #7e22ce,
                #6b21a8
              );
              background-size: 400% 400%;
              animation: gradientAnimation 15s ease infinite;
            }
          `}
        </style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col animated-gradient`}
      >
        <div className="fixed inset-0 flex flex-col">
          <div className="flex-none h-16">
            <AuthProvider />
          </div>
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </body>
    </html>
  );
}
