import { FastifyInstance } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
    createScene,
    getSceneById,
    getScenesByDrawingId,
    updateScene,
    deleteScene,
    getAllScenes,
} from '../controllers/scene.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { createSceneSchema, updateSceneSchema, sceneIdParamSchema, drawingIdParamSchema } from '../validators/scene.schemas';

export async function sceneRoutes(fastify: FastifyInstance) {
    // Create scene
    fastify.post('/api/scenes', {
        preHandler: [authenticate],
        schema: {
            body: zodToJsonSchema(createSceneSchema),
            tags: ['Scenes'],
            description: 'Create a new scene',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(createScene));

    // Get all scenes
    fastify.get('/api/scenes', {
        preHandler: [authenticate],
        schema: {
            tags: ['Scenes'],
            description: 'Get all scenes',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(getAllScenes));

    // Get scene by ID
    fastify.get('/api/scenes/:id', {
        preHandler: [authenticate],
        schema: {
            params: zodToJsonSchema(sceneIdParamSchema),
            tags: ['Scenes'],
            description: 'Get scene by ID',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(getSceneById));

    // Get scenes by drawing ID
    fastify.get('/api/drawings/:drawingId/scenes', {
        preHandler: [authenticate],
        schema: {
            params: zodToJsonSchema(drawingIdParamSchema),
            tags: ['Scenes'],
            description: 'Get scenes by drawing ID',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(getScenesByDrawingId));

    // Update scene
    fastify.put('/api/scenes/:id', {
        preHandler: [authenticate],
        schema: {
            params: zodToJsonSchema(sceneIdParamSchema),
            body: zodToJsonSchema(updateSceneSchema),
            tags: ['Scenes'],
            description: 'Update scene',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(updateScene));

    // Delete scene
    fastify.delete('/api/scenes/:id', {
        preHandler: [authenticate],
        schema: {
            params: zodToJsonSchema(sceneIdParamSchema),
            tags: ['Scenes'],
            description: 'Delete scene',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(deleteScene));
}
