import { FastifyInstance } from 'fastify';
import {
    createDrawing,
    getDrawingById,
    getDrawingsByUserId,
    updateDrawing,
    deleteDrawing,
    getAllDrawings,
} from '../controllers/drawing.controller';

export async function drawingRoutes(fastify: FastifyInstance) {
    // Create drawing
    fastify.post('/api/drawings', createDrawing);

    // Get all drawings
    fastify.get('/api/drawings', getAllDrawings);

    // Get drawing by ID
    fastify.get('/api/drawings/:id', getDrawingById);

    // Get drawings by user ID
    fastify.get('/api/users/:userId/drawings', getDrawingsByUserId);

    // Update drawing
    fastify.put('/api/drawings/:id', updateDrawing);

    // Delete drawing
    fastify.delete('/api/drawings/:id', deleteDrawing);
}
