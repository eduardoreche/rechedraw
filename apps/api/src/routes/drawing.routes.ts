import { FastifyInstance } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
    createDrawing,
    getDrawingById,
    getDrawingsByUserId,
    updateDrawing,
    deleteDrawing,
    getAllDrawings,
} from '../controllers/drawing.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { createDrawingSchema, updateDrawingSchema, drawingIdParamSchema, userIdParamSchema } from '../validators/drawing.schemas';

export async function drawingRoutes(fastify: FastifyInstance) {
    // Protect all drawing routes
    fastify.addHook('preHandler', authenticate);

    // Create drawing
    fastify.post('/api/drawings', {
        schema: {
            body: zodToJsonSchema(createDrawingSchema),
            tags: ['Drawings'],
            description: 'Create a new drawing',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(createDrawing));

    // Get all drawings
    fastify.get('/api/drawings', {
        schema: {
            tags: ['Drawings'],
            description: 'Get all drawings',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(getAllDrawings));

    // Get drawing by ID
    fastify.get('/api/drawings/:id', {
        schema: {
            params: zodToJsonSchema(drawingIdParamSchema),
            tags: ['Drawings'],
            description: 'Get drawing by ID',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(getDrawingById));

    // Get drawings by user ID
    fastify.get('/api/users/:userId/drawings', {
        schema: {
            params: zodToJsonSchema(userIdParamSchema),
            tags: ['Drawings'],
            description: 'Get drawings by user ID',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(getDrawingsByUserId));

    // Update drawing
    fastify.put('/api/drawings/:id', {
        schema: {
            params: zodToJsonSchema(drawingIdParamSchema),
            body: zodToJsonSchema(updateDrawingSchema),
            tags: ['Drawings'],
            description: 'Update drawing',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(updateDrawing));

    // Delete drawing
    fastify.delete('/api/drawings/:id', {
        schema: {
            params: zodToJsonSchema(drawingIdParamSchema),
            tags: ['Drawings'],
            description: 'Delete drawing',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(deleteDrawing));
}
