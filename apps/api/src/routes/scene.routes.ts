import { FastifyInstance } from 'fastify';
import {
    createScene,
    getSceneById,
    getScenesByDrawingId,
    updateScene,
    deleteScene,
    getAllScenes,
} from '../controllers/scene.controller';

export async function sceneRoutes(fastify: FastifyInstance) {
    // Create scene
    fastify.post('/api/scenes', createScene);

    // Get all scenes
    fastify.get('/api/scenes', getAllScenes);

    // Get scene by ID
    fastify.get('/api/scenes/:id', getSceneById);

    // Get scenes by drawing ID
    fastify.get('/api/drawings/:drawingId/scenes', getScenesByDrawingId);

    // Update scene
    fastify.put('/api/scenes/:id', updateScene);

    // Delete scene
    fastify.delete('/api/scenes/:id', deleteScene);
}
