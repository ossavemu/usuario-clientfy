import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { type RegistrationData } from '../../types/registration';

interface ImageUploadStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ImageUploadStep({ data, onUpdate }: ImageUploadStepProps) {
  const onImageDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        file,
      }));
      onUpdate({ images: [...data.images, ...newImages] });
    },
    [data.images, onUpdate]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onImageDrop,
    accept: { 'image/*': [] },
  });

  const removeImage = (id: string) => {
    onUpdate({ images: data.images.filter((img) => img.id !== id) });
  };

  const updateFileName = (id: string, newName: string) => {
    onUpdate({
      images: data.images.map((img) =>
        img.id === id ? { ...img, name: newName } : img
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Imágenes</Label>
        <div
          {...getRootProps()}
          className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-500"
        >
          <input {...getInputProps()} />
          <p>Arrastra imágenes aquí o haz clic para seleccionar</p>
        </div>
        <div className="mt-4 space-y-2">
          {data.images.map((img) => (
            <div key={img.id} className="flex items-center gap-2">
              <Input
                value={img.name}
                onChange={(e) => updateFileName(img.id, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeImage(img.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
