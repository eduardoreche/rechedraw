
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { sceneRoutes } from '../scene.routes';
import { errorHandler } from '../../middleware/error-handler';

describe('Scene Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify();
        app.setErrorHandler(errorHandler);
        await app.register(sceneRoutes);
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should fail validation with invalid data type', async () => {
        const payload = {
            drawingId: 'not-a-number', // Should be number
            name: 'Scene 1',
            data: {}
        };

        const response = await app.inject({
            method: 'POST',
            url: '/api/scenes',
            payload
        });

        expect(response.statusCode).toBe(400);
    });

    it('should pass validation with valid data', async () => {
        const payload = {
            drawingId: 1,
            name: 'Scene 1',
            data: { some: 'data' }
        };

        const response = await app.inject({
            method: 'POST',
            url: '/api/scenes',
            payload
        });

        // Similar to drawings, check if validation passed (not 400)
        expect(response.statusCode).not.toBe(400);
    });
});
