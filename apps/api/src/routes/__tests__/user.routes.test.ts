
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { userRoutes } from '../user.routes';
import diMockPlugin from '../../plugins/di.mock';
import { errorHandler } from '../../middleware/error-handler';

describe('User Routes', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify();
        app.setErrorHandler(errorHandler);
        await app.register(diMockPlugin);
        await app.register(userRoutes);
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should create a user', async () => {
        const payload = {
            email: `test-${Date.now()}@example.com`,
            password: 'password123',
            name: 'Test User'
        };

        const response = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.email).toBe(payload.email);
        expect(body.data.id).toBeDefined();
    });

    it('should fail to create user with invalid email', async () => {
        const payload = {
            email: 'invalid-email',
            password: 'password123'
        };

        const response = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload
        });

        expect(response.statusCode).toBe(400); // Bad Request due to validation
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
    });
});
