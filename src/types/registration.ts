export interface TrainingFile {
  id: string;
  name: string;
  file: File;
}

export interface RegistrationData {
  name: string;
  email: string;
  password:
    | string
    | {
        service: string;
        user: string;
      };
  phone: string;
  countryCode: string;
  serviceType: 'whatsapp' | 'qr';
  images: Array<{
    name: string;
    url: string;
  }>;
  trainingFiles: TrainingFile[];
  prompt: string;
  assistantName?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  file: File;
}

export interface CountryOption {
  label: string;
  value: string;
  code: string;
}
