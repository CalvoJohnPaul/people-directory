import * as z from 'zod';
import {DateDefinition} from './common';

export const GenderDefinition = z.enum(['MALE', 'FEMALE', 'OTHER'], 'Invalid gender');
export const PersonDefinition = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional().nullable(),
  email: z.email(),
  mobileNumber: z.string().optional().nullable(),
  gender: GenderDefinition,
  dateOfBirth: DateDefinition,
  image: z.url().optional().nullable(),
  createdAt: DateDefinition,
  updatedAt: DateDefinition,
});

export const CreatePersonInputDefinition = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters'),
  middleName: z
    .string()
    .trim()
    .min(2, 'Middle name must be at least 2 characters')
    .max(50, 'Middle name must be at most 50 characters')
    .optional()
    .or(z.literal('')),
  gender: GenderDefinition,
  dateOfBirth: DateDefinition,
  image: z.url('Image must be a url').optional().or(z.literal('')),
  email: z.email('Email address must be valid'),
  mobileNumber: z.string().optional().or(z.literal('')),
});

export type Gender = z.infer<typeof GenderDefinition>;
export type Person = z.infer<typeof PersonDefinition>;
export type CreatePersonInput = z.infer<typeof CreatePersonInputDefinition>;
