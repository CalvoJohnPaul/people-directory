import * as z from 'zod';
import {DateDefinition} from './common';

export const GenderDefinition = z.enum(['MALE', 'FEMALE', 'OTHER'], 'Invalid gender');
export const PersonDefinition = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional().nullable(),
  emailAddress: z.string(),
  emailAddressVerifiedAt: DateDefinition.optional().nullable(),
  mobileNumber: z.string().optional().nullable(),
  mobileNumberVerifiedAt: DateDefinition.optional().nullable(),
  gender: GenderDefinition.optional().nullable(),
  dateOfBirth: DateDefinition.optional().nullable(),
  currentAddress: z.string().optional().nullable(),
  permanentAddress: z.string().optional().nullable(),
  image: z.url(),
  idDocument: z.string().optional().nullable(),
  verifiedAt: DateDefinition.optional().nullable(),
  createdAt: DateDefinition,
  updatedAt: DateDefinition,
});

export const CreatePersonInputDefinition = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters'),
  middleName: z
    .string()
    .trim()
    .min(2, 'Middle name must be at least 2 characters')
    .max(50, 'Middle name must be at most 50 characters')
    .optional()
    .or(z.literal('')),
  image: z.url('Invalid image'),
  emailAddress: z.email('Invalid email address'),
  password: z
    .string()
    .trim()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters'),
});

export const UpdatePersonDataInputDefinition = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters')
    .optional()
    .or(z.literal('')),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters')
    .optional()
    .or(z.literal('')),
  middleName: z
    .string()
    .trim()
    .min(2, 'Middle name must be at least 2 characters')
    .max(50, 'Middle name must be at most 50 characters')
    .optional()
    .or(z.literal('')),
  gender: GenderDefinition.optional().nullable(),
  dateOfBirth: DateDefinition.optional().nullable(),
  image: z.url('Image must be a url').optional().or(z.literal('')),
  emailAddress: z.email('Invalid email address').optional().or(z.literal('')),
  mobileNumber: z.string().optional().or(z.literal('')),
  currentAddress: z.string().optional().or(z.literal('')),
  permanentAddress: z.string().optional().or(z.literal('')),
  idDocument: z.url().optional().or(z.literal('')),
  password: z
    .string()
    .trim()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters')
    .optional()
    .or(z.literal('')),
});

export const UpdatePersonInputDefinition = z.object({
  id: z.number(),
  data: UpdatePersonDataInputDefinition,
});

export const PeopleInputDefinition = z
  .object({
    q: z.string().nullable().catch(null),
    id: z
      .array(z.coerce.number().nullable().catch(null))
      .nullable()
      .catch(null)
      .transform(
        (l) => l?.filter((v): v is number => v != null && !Number.isNaN(v) && v > 0) ?? null,
      ),
    gender: z
      .array(GenderDefinition.nullable().catch(null))
      .nullable()
      .catch(null)
      .transform((l) => l?.filter(Boolean) ?? null),
    emailAddress: z.string().nullable().catch(null),
    mobileNumber: z.string().nullable().catch(null),
    dateOfBirth__from: DateDefinition.nullable().catch(null),
    dateOfBirth__to: DateDefinition.nullable().catch(null),
    createdAt__from: DateDefinition.nullable().catch(null),
    createdAt__to: DateDefinition.nullable().catch(null),
    limit: z.coerce.number().int().min(1).max(100).nullable().catch(null),
  })
  .partial();

export type Gender = z.infer<typeof GenderDefinition>;
export type Person = z.infer<typeof PersonDefinition>;
export type CreatePersonInput = z.infer<typeof CreatePersonInputDefinition>;
export type UpdatePersonDataInput = z.infer<typeof UpdatePersonDataInputDefinition>;
export type UpdatePersonInput = z.infer<typeof UpdatePersonInputDefinition>;
export type PeopleInput = z.infer<typeof PeopleInputDefinition>;
