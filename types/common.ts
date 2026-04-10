import * as z from 'zod';

export const DateDefinition = z
  .union([z.date(), z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), 'Invalid date')])
  .transform((v) => (typeof v === 'string' ? new Date(v) : v));
