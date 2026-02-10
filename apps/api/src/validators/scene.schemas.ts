import { z } from 'zod';

// Scene validation schemas
export const createSceneSchema = z.object({
    drawingId: z.number().int().positive('Drawing ID must be a positive integer'),
    name: z.string().min(1, 'Name is required'),
    data: z.any(), // Excalidraw elements - can be any JSON
    preview: z.string().optional(),
});

export const updateSceneSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    data: z.any().optional(),
    preview: z.string().optional(),
});

export const sceneIdParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

export const drawingIdParamSchema = z.object({
    drawingId: z.string().regex(/^\d+$/, 'Drawing ID must be a number').transform(Number),
});

export type CreateSceneInput = z.infer<typeof createSceneSchema>;
export type UpdateSceneInput = z.infer<typeof updateSceneSchema>;
export type SceneIdParam = z.infer<typeof sceneIdParamSchema>;
export type DrawingIdParam = z.infer<typeof drawingIdParamSchema>;
