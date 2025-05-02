'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ServicePassword {
  id: string;
  serviceName: string;
  password: string;
  createdAt: string;
}

export default function PasswordsAdmin() {
  const router = useRouter();
  const [passwords, setPasswords] = useState<ServicePassword[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth !== 'true') {
      router.push('/admin');
      return;
    }

    fetchPasswords();
  }, [router]);

  const fetchPasswords = async () => {
    try {
      const response = await fetch('/api/admin/passwords');

      if (!response.ok) {
        throw new Error('Error al obtener contraseñas');
      }

      const data = await response.json();
      setPasswords(
        data.passwords.map(
          (pw: { email: string; password: string; created_at: string }) => ({
            id: pw.email,
            serviceName: pw.email,
            password: pw.password,
            createdAt: pw.created_at,
          }),
        ),
      );
    } catch {
      toast.error('Error al cargar contraseñas');
    } finally {
      setLoading(false);
    }
  };

  const regeneratePassword = async (id: string) => {
    try {
      const response = await fetch('/api/admin/passwords/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: id }),
      });
      const data = await response.json();
      setPasswords(
        passwords.map((pw) =>
          pw.id === id
            ? {
                ...pw,
                password: data.password,
                createdAt: new Date().toISOString(),
              }
            : pw,
        ),
      );
      toast.success('Contraseña regenerada');
    } catch {
      toast.error('Error al regenerar contraseña');
    }
  };

  const deletePassword = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta contraseña de servicio?'))
      return;
    try {
      const response = await fetch(
        `/api/admin/passwords?email=${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      );
      if (!response.ok) throw new Error();
      setPasswords(passwords.filter((pw) => pw.id !== id));
      toast.success('Contraseña eliminada');
    } catch {
      toast.error('Error al eliminar contraseña');
    }
  };

  const navigateToGenerate = () => {
    router.push('/admin/passwords/generate');
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contraseñas de Servicio</CardTitle>
          <Button variant="outline" onClick={navigateToGenerate}>
            Generar Contraseña
          </Button>
        </CardHeader>
        <CardContent>
          {passwords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No hay contraseñas registradas
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Contraseña</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passwords.map((pw) => (
                  <TableRow key={pw.id}>
                    <TableCell className="font-medium">
                      {pw.serviceName}
                    </TableCell>
                    <TableCell>{pw.password}</TableCell>
                    <TableCell>
                      {new Date(pw.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          onClick={() => regeneratePassword(pw.id)}
                        >
                          Regenerar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePassword(pw.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
