'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepNavigation } from '@/components/ui/step-navigation';
import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import {
  type RegistrationData,
  type TrainingFile,
} from '@/types/registration';

interface TrainingFilesStepProps {
  data: RegistrationData;
  onNext: () => void;
  onBack: () => void;
}

export function TrainingFilesStep({
  data,
  onNext,
  onBack,
}: TrainingFilesStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; url: string }>
  >([]);
  const [pendingFiles, setPendingFiles] = useState<TrainingFile[]>([]);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    fileName: string;
  }>({ isOpen: false, fileName: '' });

  // Cargar archivos existentes
  useEffect(() => {
    const loadExistingFiles = async () => {
      if (data.countryCode && data.phone) {
        setIsLoading(true);
        try {
          const phoneNumber = `${data.countryCode}${data.phone}`.replace(
            /\+/g,
            ''
          );
          const response = await fetch(
            `/api/training-files?phoneNumber=${phoneNumber}`
          );
          const result = await response.json();

          if (result.success && result.files) {
            setUploadedFiles(result.files);
          }
        } catch (error) {
          console.error('Error al cargar archivos existentes:', error);
          setError('Error al cargar archivos existentes');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadExistingFiles();
  }, [data.countryCode, data.phone]);

  const onTrainingFilesDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name.replace(/\.[^/.]+$/, ''),
      file,
    }));
    setPendingFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onTrainingFilesDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
  });

  const removeFile = useCallback((id: string) => {
    setPendingFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const removeUploadedFile = async (name: string) => {
    setDeleteModal({ isOpen: true, fileName: name });
  };

  const updateFileName = useCallback((id: string, newName: string) => {
    setPendingFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, name: newName } : file))
    );
  }, []);

  const handleUpload = async () => {
    if (!data.countryCode || !data.phone) return;

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      pendingFiles.forEach((file) => {
        formData.append('files', file.file);
        formData.append('names', file.name);
      });
      formData.append(
        'phoneNumber',
        `${data.countryCode}${data.phone}`.replace(/\+/g, '')
      );

      const response = await fetch('/api/training-files', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFiles((prev) => [...prev, ...result.files]);
        setPendingFiles([]);
      } else {
        setError(result.error || 'Error al subir los archivos');
      }
    } catch (error) {
      console.error('Error al subir archivos:', error);
      setError('Error al subir los archivos');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    const fileName = deleteModal.fileName;
    if (!data.countryCode || !data.phone || !fileName) return;

    setIsLoading(true);
    try {
      const phoneNumber = `${data.countryCode}${data.phone}`.replace(/\+/g, '');
      const response = await fetch(
        `/api/files/delete?phoneNumber=${phoneNumber}&fileName=${fileName}&type=training`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (result.success) {
        const newFiles = uploadedFiles.filter((file) => file.name !== fileName);
        setUploadedFiles(newFiles);
        toast.success('Archivo eliminado exitosamente');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      toast.error('Error al eliminar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[400px]">
      <div className="flex-1 space-y-6">
        <div>
          <Label>Archivos de entrenamiento</Label>
          {isLoading && (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">
                  Cargando archivos...
                </span>
              </div>
            </div>
          )}

          {/* Archivos ya subidos */}
          {!isLoading && uploadedFiles.length > 0 && (
            <div className="space-y-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700">
                Archivos Subidos
              </h3>
              {uploadedFiles.map((file, index) => (
                <div
                  key={`uploaded-${index}`}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 hover:text-purple-800"
                    >
                      Ver archivo
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadedFile(file.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Subir nuevos archivos */}
          {!isLoading && (
            <div
              {...getRootProps()}
              className="mt-4 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-500"
            >
              <input {...getInputProps()} />
              <p className="text-sm text-muted-foreground">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Formatos aceptados: .txt, .pdf, .doc, .docx
              </p>
            </div>
          )}

          {/* Archivos pendientes de subir */}
          {pendingFiles.length > 0 && (
            <div className="mt-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Archivos Pendientes de Subir
              </h3>
              {pendingFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-4 border rounded-lg"
                >
                  <Input
                    value={file.name}
                    onChange={(e) => updateFileName(file.id, e.target.value)}
                    className="flex-1"
                    placeholder="Nombre del archivo"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                onClick={handleUpload}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Subiendo...' : 'Subir Archivos'}
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
      </div>

      <StepNavigation
        currentStep={5}
        totalSteps={8}
        onNext={onNext}
        onBack={onBack}
        isNextDisabled={isLoading}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, fileName: '' })}
        onConfirm={confirmDelete}
        title="Eliminar Archivo"
        message="¿Estás seguro de que deseas eliminar este archivo de entrenamiento? Esta acción no se puede deshacer."
        itemName={deleteModal.fileName}
      />
    </div>
  );
}
