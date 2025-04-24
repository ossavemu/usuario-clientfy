'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function GeneratePassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    email: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth !== 'true') {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor ingrese un email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/passwords/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al generar contraseña');
      }

      setResult({
        email: data.email,
        password: data.password,
      });

      toast.success('Contraseña generada exitosamente');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al generar contraseña',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/passwords');
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Generar Contraseña de Servicio</CardTitle>
            <Button variant="outline" onClick={handleBack}>
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email del Usuario</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled={loading || !!result}
              />
            </div>

            {!result ? (
              <Button type="submit" disabled={loading}>
                {loading ? 'Generando...' : 'Generar Contraseña'}
              </Button>
            ) : (
              <div className="mt-6 p-4 border rounded-md bg-gray-50">
                <h3 className="font-semibold text-lg mb-2">
                  Contraseña Generada
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <span className="text-gray-500">Email:</span> {result.email}
                  </div>
                  <div>
                    <span className="text-gray-500">Contraseña:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {result.password}
                    </code>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  La contraseña ha sido enviada por correo electrónico al
                  usuario.
                </p>
                <div className="mt-4 flex space-x-2">
                  <Button
                    onClick={() => {
                      setResult(null);
                      setEmail('');
                    }}
                  >
                    Generar otra contraseña
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
