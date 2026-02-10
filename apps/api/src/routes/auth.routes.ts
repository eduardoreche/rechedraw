import { FastifyInstance } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { login, register, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { loginSchema, registerSchema } from '../validators/auth.schemas';

export async function authRoutes(fastify: FastifyInstance) {
    console.log('Registering auth routes...');
    fastify.post('/register', {
        schema: {
            body: zodToJsonSchema(registerSchema),
            tags: ['Auth'],
            description: 'Register a new user'
        }
    }, asyncHandler(register));

    fastify.post('/login', {
        schema: {
            body: zodToJsonSchema(loginSchema),
            tags: ['Auth'],
            description: 'Login to the application'
        }
    }, asyncHandler(login));

    // Protected route example
    fastify.get('/me', {
        preHandler: [authenticate],
        schema: {
            tags: ['Auth'],
            description: 'Get current user profile',
            security: [{ apiKey: [] }]
        }
    }, asyncHandler(me));
}
