import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { RegistrationData } from '../../types/registration';

interface TrainingFilesStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TrainingFilesStep({ data, onUpdate }: TrainingFilesStepProps) {
  const onTrainingFilesDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        file,
      }));
      onUpdate({ trainingFiles: [...data.trainingFiles, ...newFiles] });
    },
    [data.trainingFiles, onUpdate]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onTrainingFilesDrop,
  });

  const removeFile = (id: string) => {
    onUpdate({
      trainingFiles: data.trainingFiles.filter((file) => file.id !== id),
    });
  };

  const updateFileName = (id: string, newName: string) => {
    onUpdate({
      trainingFiles: data.trainingFiles.map((file) =>
        file.id === id ? { ...file, name: newName } : file
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Archivos de entrenamiento</Label>
        <div
          {...getRootProps()}
          className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-500"
        >
          <input {...getInputProps()} />
          <p>Arrastra archivos aquí o haz clic para seleccionar</p>
        </div>
        <div className="mt-4 space-y-2">
          {data.trainingFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-2">
              <Input
                value={file.name}
                onChange={(e) => updateFileName(file.id, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(file.id)}
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
