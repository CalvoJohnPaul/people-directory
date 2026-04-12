import * as z from 'zod';

export const CreateSessionInputDefinition = z.union([
  z.object({
    emailAddress: z.email('Invalid email').trim().toLowerCase(),
    otpCode: z.string().trim().min(6, 'Invalid OTP code').max(6, 'Invalid OTP code'),
  }),
  z.object({
    emailAddress: z.email('Invalid email').trim().toLowerCase(),
    password: z.string().trim().min(1, 'Password is required'),
  }),
]);

export type CreateSessionInput = z.infer<typeof CreateSessionInputDefinition>;
