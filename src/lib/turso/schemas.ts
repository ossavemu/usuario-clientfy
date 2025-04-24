import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  company_name: z.string().min(1),
  password: z.string().min(6),
  phone: z.string().optional().nullable(),
  country_code: z.string().optional().nullable(),
  service_type: z.enum(['whatsapp', 'qr']),
  images: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
      }),
    )
    .default([]),
  training_files: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string().url().optional(),
      }),
    )
    .default([]),
  prompt: z.string().default(''),
  assistant_name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const SessionSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  expires_at: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const InstanceSchema = z.object({
  email: z.string().email(),
  ip_address: z.string().min(1),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Instance = z.infer<typeof InstanceSchema>;
