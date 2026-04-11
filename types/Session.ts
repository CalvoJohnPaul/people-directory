import * as z from 'zod';

export const CreateSessionInputDefinition = z.object({
  emailAddress: z.email('Invalid email').trim().toLowerCase(),
  otpCode: z.string().trim().min(6, 'Invalid OTP code').max(6, 'Invalid OTP code'),
});

export type CreateSessionInput = z.infer<typeof CreateSessionInputDefinition>;
