export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  phone: string;
  countryCode: string;
  serviceType: 'whatsapp' | 'qr';
  images: UploadedFile[];
  trainingFiles: UploadedFile[];
  prompt: string;
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

