
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

// Mock authentication middleware
vi.mock('../../middleware/auth', () => ({
    authenticate: async (request: any, reply: any) => {
        request.user = { id: 1, email: 'test@example.com' };
    }
}));

import { sceneRoutes } from '../scene.routes';
import diMockPlugin from '../../plugins/di.mock';
import { errorHandler } from '../../middleware/error-handler';

describe('Scene Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify();
        app.setErrorHandler(errorHandler);
        await app.register(diMockPlugin);
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

        // Should succeed with 201
        expect(response.statusCode).toBe(201);
    });
});
