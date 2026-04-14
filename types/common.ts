import * as z from 'zod';

/*
 *------------------------------------------------
 *  HTTP RESPONSE
 *------------------------------------------------
 */

export const HttpErrorDefinition = z.object({
  name: z.string(),
  message: z.string(),
});

export const HttpFailedResponseDefinition = z.object({
  ok: z.literal(false),
  error: HttpErrorDefinition,
});

export const HttpSuccessResponseDefinition = <T extends z.ZodTypeAny>(def: T) =>
  z.object({
    ok: z.literal(true),
    data: def,
  });

export const HttpVoidSuccessResponseDefinition = z.object({
  ok: z.literal(true),
});

export const HttpVoidResponseDefinition = z.union([
  HttpVoidSuccessResponseDefinition,
  HttpFailedResponseDefinition,
]);

export const HttpResponseDefinition = <T extends z.ZodTypeAny>(def: T) =>
  z.union([HttpSuccessResponseDefinition(def), HttpFailedResponseDefinition]);

/*
 *------------------------------------------------
 *  MISC
 *------------------------------------------------
 */

export const DateDefinition = z
  .union([z.date(), z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), 'Invalid date')])
  .transform((v) => (typeof v === 'string' ? new Date(v) : v));

export const DateRangeDefinition = z.object({
  from: z.date().optional().nullable(),
  to: z.date().optional().nullable(),
});

export const NumberRangeDefinition = z.object({
  from: z.number().optional().nullable(),
  to: z.number().optional().nullable(),
});

export const OptionDefinition = z.object({
  value: z.string(),
  label: z.string(),
  disabled: z.boolean().optional(),
});

/*
 *------------------------------------------------
 *  TYPES
 *------------------------------------------------
 */

export type HttpError = z.infer<typeof HttpErrorDefinition>;
export type HttpFailedResponse = z.infer<typeof HttpFailedResponseDefinition>;
export type HttpSuccessResponse<T> = z.infer<
  ReturnType<typeof HttpSuccessResponseDefinition<z.ZodType<T>>>
>;
export type HttpVoidSuccessResponse = z.infer<typeof HttpVoidSuccessResponseDefinition>;
export type HttpVoidResponse = z.infer<typeof HttpVoidResponseDefinition>;
export type HttpResponse<T> = z.infer<ReturnType<typeof HttpResponseDefinition<z.ZodType<T>>>>;
export type DateRange = z.infer<typeof DateRangeDefinition>;
export type NumberRange = z.infer<typeof NumberRangeDefinition>;
export type Option = z.infer<typeof OptionDefinition>;
