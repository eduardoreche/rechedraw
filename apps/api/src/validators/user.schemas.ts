import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().optional(),
});

export const updateUserSchema = z.object({
    email: z.string().email('Invalid email format').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    name: z.string().optional(),
});

export const userIdParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

export const userEmailParamSchema = z.object({
    email: z.string().email('Invalid email format'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type UserEmailParam = z.infer<typeof userEmailParamSchema>;
