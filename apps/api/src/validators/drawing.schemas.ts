import { z } from 'zod';

// Drawing validation schemas
export const createDrawingSchema = z.object({
    userId: z.number().int().positive('User ID must be a positive integer'),
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    preset: z.string().optional(),
    isPermanent: z.boolean().optional(),
    thumbnail: z.string().optional(),
});

export const updateDrawingSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    slug: z.string().min(1, 'Slug cannot be empty').optional(),
    preset: z.string().optional(),
    thumbnail: z.string().optional(),
});

export const drawingIdParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

export const userIdParamSchema = z.object({
    userId: z.string().regex(/^\d+$/, 'User ID must be a number').transform(Number),
});

export type CreateDrawingInput = z.infer<typeof createDrawingSchema>;
export type UpdateDrawingInput = z.infer<typeof updateDrawingSchema>;
export type DrawingIdParam = z.infer<typeof drawingIdParamSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
