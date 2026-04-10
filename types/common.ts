import * as z from 'zod';

export const DateDefinition = z
  .union([z.date(), z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), 'Invalid date')])
  .transform((v) => (typeof v === 'string' ? new Date(v) : v));

export interface DateRange {
  from?: Date | null;
  to?: Date | null;
}

export interface Option<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}
