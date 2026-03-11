import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive('User id must be a positive integer'),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters')
      .max(255, 'Name must be at most 255 characters')
      .optional(),
    email: z.string()
      .email('Invalid email address')
      .max(255, 'Email must be at most 255 characters')
      .optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
