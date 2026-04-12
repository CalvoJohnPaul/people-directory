import * as z from 'zod';
import {DateDefinition} from './common';

export const GenderDefinition = z.enum(['MALE', 'FEMALE', 'OTHER'], 'Invalid gender');
export const PersonDefinition = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional().nullable(),
  emailAddress: z.email(),
  mobileNumber: z.string().optional().nullable(),
  gender: GenderDefinition.optional().nullable(),
  dateOfBirth: DateDefinition.optional().nullable(),
  image: z.url().optional().nullable(),
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
  gender: GenderDefinition.optional().nullable(),
  dateOfBirth: DateDefinition.optional().nullable(),
  image: z.url('Invalid image'),
  emailAddress: z.email('Invalid email address'),
  mobileNumber: z.string().optional().or(z.literal('')),
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
  image: z.url('Image must be a url').optional().nullable(),
  emailAddress: z.email('Invalid email address').optional().or(z.literal('')),
  mobileNumber: z.string().optional().or(z.literal('')),
});

export const UpdatePersonInputDefinition = z.object({
  id: z.number(),
  data: UpdatePersonDataInputDefinition,
});

export const PeopleInputDefinition = z
  .object({
    first: z.coerce
      .number()
      .optional()
      .nullable()
      .catch(null)
      .transform((v) => (v != null && !Number.isNaN(v) && v > 0 ? v : null)),
    after: z.coerce
      .number()
      .optional()
      .nullable()
      .catch(null)
      .transform((v) => (v != null && !Number.isNaN(v) && v > 0 ? v : null)),
    keyword: z.string().optional().nullable().catch(null),
    image: z.string().optional().nullable().catch(null),
    id: z
      .union([
        z
          .array(z.coerce.number().nullable().catch(null))
          .transform((l) => l?.filter((v): v is number => v != null && !Number.isNaN(v) && v > 0)),
        z.coerce
          .number()
          .nullable()
          .catch(null)
          .transform((v) => (v != null && !Number.isNaN(v) && v > 0 ? [v] : null)),
      ])
      .optional()
      .nullable(),
  })
  .partial();

export type Gender = z.infer<typeof GenderDefinition>;
export type Person = z.infer<typeof PersonDefinition>;
export type CreatePersonInput = z.infer<typeof CreatePersonInputDefinition>;
export type UpdatePersonDataInput = z.infer<typeof UpdatePersonDataInputDefinition>;
export type UpdatePersonInput = z.infer<typeof UpdatePersonInputDefinition>;
export type PeopleInput = z.infer<typeof PeopleInputDefinition>;
