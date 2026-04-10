import * as z from 'zod';
import {DateDefinition} from './common';

export const GenderDefinition = z.enum(['MALE', 'FEMALE', 'OTHER']);
export const PersonDefinition = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional().nullable(),
  gender: GenderDefinition,
  dateOfBirth: DateDefinition,
  image: z.url().optional().nullable(),
  createdAt: DateDefinition,
  updatedAt: DateDefinition,
});

export type Gender = z.infer<typeof GenderDefinition>;
export type Person = z.infer<typeof PersonDefinition>;
