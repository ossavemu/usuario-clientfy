import { Button } from '@/components/ui/button';
import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepNavigation } from '@/components/ui/step-navigation';
import { type RegistrationData } from '@/types/registration';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ImageUploadStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ImageFile {
  file: File;
  name: string;
  preview: string;
}

const MAX_DIMENSION = 1600;
const TARGET_QUALITY = 0.7;
// const MAX_FILE_SIZE = 200 * 1024; // 200KB

async function optimizeImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const imgElement = new window.Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    imgElement.onload = () => {
      // Calcular dimensiones manteniendo la relación de aspecto
      let width = imgElement.width;
      let height = imgElement.height;

      if (width > height && width > MAX_DIMENSION) {
        height = (height * MAX_DIMENSION) / width;
        width = MAX_DIMENSION;
      } else if (height > MAX_DIMENSION) {
        width = (width * MAX_DIMENSION) / height;
        height = MAX_DIMENSION;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(imgElement, 0, 0, width, height);

      // Convertir a JPEG con compresión
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        'image/jpeg',
        TARGET_QUALITY,
      );
    };

    imgElement.src = URL.createObjectURL(file);
  });
}

// Función auxiliar para procesar archivos de imagen
async function processImageFiles(files: FileList): Promise<ImageFile[]> {
  const processedFiles = await Promise.all(
    Array.from(files).map(async (file) => {
      const optimizedBlob = await optimizeImage(file);
      const optimizedFile = new File([optimizedBlob], file.name, {
        type: 'image/jpeg',
      });
      return {
        file: optimizedFile,
        name: file.name.replace(/\.[^/.]+$/, ''),
        preview: URL.createObjectURL(optimizedFile),
      };
    }),
  );
  return processedFiles;
}

export function ImageUploadStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: ImageUploadStepProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ name: string; url: string }>
  >([]);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    imageName: string;
  }>({ isOpen: false, imageName: '' });

  const getPhoneNumber = useCallback(() => {
    return data.countryCode && data.phone
      ? `${data.countryCode}${data.phone}`.replace(/\+/g, '')
      : '';
  }, [data.countryCode, data.phone]);

  const loadExistingImages = useCallback(async () => {
    const phoneNumber = getPhoneNumber();
    if (!phoneNumber) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/images?phoneNumber=${phoneNumber}`);
      const result = await response.json();

      if (result?.success && result.images) {
        setUploadedImages(result.images);
        onUpdate({ images: result.images });
      }
    } catch (error) {
      console.error('Error al cargar imágenes existentes:', error);
      setError('Error al cargar imágenes existentes');
    } finally {
      setIsLoading(false);
    }
  }, [getPhoneNumber, onUpdate]);

  useEffect(() => {
    loadExistingImages();
  }, [loadExistingImages]);

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setIsLoading(true);
    setError('');

    try {
      const optimizedFiles = await processImageFiles(e.target.files);
      setImages((prev) => [...prev, ...optimizedFiles]);
    } catch (error) {
      console.error('Error al procesar las imágenes:', error);
      setError('Error al procesar las imágenes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (index: number, newName: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, name: newName } : img)),
    );
  };

  const handleUploadedNameChange = (index: number, newName: string) => {
    const newUploadedImages = [...uploadedImages];
    newUploadedImages[index] = { ...newUploadedImages[index], name: newName };
    setUploadedImages(newUploadedImages);
    onUpdate({ images: newUploadedImages });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveUploadedImage = (name: string) => {
    setDeleteModal({ isOpen: true, imageName: name });
  };

  const confirmDelete = async () => {
    const { imageName } = deleteModal;
    const phoneNumber = getPhoneNumber();

    if (!phoneNumber || !imageName) return;

    setIsLoading(true);

    try {
      const fileName = `${imageName}.jpg`;
      const response = await fetch(
        `/api/files/delete?phoneNumber=${phoneNumber}&fileName=${fileName}&type=image`,
        { method: 'DELETE' },
      );
      const result = await response.json();

      if (!result?.success) {
        throw new Error(result?.error || 'Error al eliminar la imagen');
      }

      const newImages = uploadedImages.filter((img) => img.name !== imageName);
      setUploadedImages(newImages);
      onUpdate({ images: newImages });
      toast.success('Imagen eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      toast.error('Error al eliminar la imagen');
    } finally {
      setIsLoading(false);
      setDeleteModal({ isOpen: false, imageName: '' });
    }
  };

  const handleUpload = async () => {
    if (!images.length) {
      setError('Por favor, selecciona al menos una imagen');
      return;
    }

    if (images.some((img) => !img.name.trim())) {
      setError('Por favor, asigna un nombre a todas las imágenes');
      return;
    }

    const phoneNumber = getPhoneNumber();
    if (!phoneNumber) return;

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      images.forEach((img) => {
        formData.append('files', img.file);
        formData.append('names', img.name.trim());
      });
      formData.append('phoneNumber', phoneNumber);

      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!result?.success) {
        throw new Error(result?.error || 'Error al subir las imágenes');
      }

      const newImages = result.urls.map((url: string, index: number) => ({
        name: images[index].name,
        url: url,
      }));

      setUploadedImages([...uploadedImages, ...newImages]);
      onUpdate({ images: [...uploadedImages, ...newImages] });
      setImages([]);
      setError('');
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Error al subir las imágenes',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[400px]">
      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Imágenes del Bot (Opcional)</Label>

          {isLoading && (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">
                  Cargando imágenes...
                </span>
              </div>
            </div>
          )}

          {/* Imágenes ya subidas */}
          {!isLoading && uploadedImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Imágenes Subidas
              </h3>
              {uploadedImages.map((image, index) => (
                <div
                  key={`uploaded-${index}`}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50"
                >
                  <div className="relative w-16 h-16">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="object-cover rounded w-16 h-16"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={image.name}
                      onChange={(e) =>
                        handleUploadedNameChange(index, e.target.value)
                      }
                      placeholder="Nombre de la imagen"
                      className="mb-2"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUploadedImage(image.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Subir nuevas imágenes */}
          {!isLoading && (
            <div className="flex justify-center items-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click para subir</span> o
                    arrastra y suelta
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG o JPEG (Se optimizarán automáticamente)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  multiple
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
            </div>
          )}

          {/* Imágenes pendientes de subir */}
          {images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Imágenes Pendientes de Subir
              </h3>
              <p className="text-sm text-muted-foreground">
                Asigna nombres descriptivos a tus imágenes. Estos nombres serán
                usados por el chatbot para identificar qué imagen enviar.
              </p>
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="relative w-16 h-16">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="object-cover rounded w-16 h-16"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={image.name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder="Nombre de la imagen"
                      className="mb-2"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ejemplo: &quot;logo&quot;, &quot;producto1&quot;,
                      &quot;banner_principal&quot;
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isLoading}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {images.length > 0 && (
          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Subiendo...' : 'Subir Imágenes'}
          </Button>
        )}

        <StepNavigation
          currentStep={4}
          totalSteps={8}
          onNext={onNext}
          onBack={onBack}
          isNextDisabled={isLoading}
          isBackDisabled={isLoading}
        />
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, imageName: '' })}
        onConfirm={confirmDelete}
        title="Eliminar Imagen"
        message="¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer."
        itemName={deleteModal.imageName}
      />
    </div>
  );
}
