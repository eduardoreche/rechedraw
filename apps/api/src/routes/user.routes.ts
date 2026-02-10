import { FastifyInstance } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
    createUser,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
    getAllUsers,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { createUserSchema, updateUserSchema, userIdParamSchema, userEmailParamSchema } from '../validators/user.schemas';

export async function userRoutes(fastify: FastifyInstance) {
    // Create user
    fastify.post('/api/users', {
        schema: {
            body: zodToJsonSchema(createUserSchema),
            tags: ['Users'],
            description: 'Create a new user'
        }
    }, asyncHandler(createUser));

    // Protected routes
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook('preHandler', authenticate);

        protectedRoutes.get('/api/users', {
            schema: {
                tags: ['Users'],
                description: 'Get all users',
                security: [{ apiKey: [] }]
            }
        }, asyncHandler(getAllUsers));

        protectedRoutes.get('/api/users/:id', {
            schema: {
                params: zodToJsonSchema(userIdParamSchema),
                tags: ['Users'],
                description: 'Get user by ID',
                security: [{ apiKey: [] }]
            }
        }, asyncHandler(getUserById));

        protectedRoutes.get('/api/users/email/:email', {
            schema: {
                params: zodToJsonSchema(userEmailParamSchema),
                tags: ['Users'],
                description: 'Get user by email',
                security: [{ apiKey: [] }]
            }
        }, asyncHandler(getUserByEmail));

        protectedRoutes.put('/api/users/:id', {
            schema: {
                params: zodToJsonSchema(userIdParamSchema),
                body: zodToJsonSchema(updateUserSchema),
                tags: ['Users'],
                description: 'Update user',
                security: [{ apiKey: [] }]
            }
        }, asyncHandler(updateUser));

        protectedRoutes.delete('/api/users/:id', {
            schema: {
                params: zodToJsonSchema(userIdParamSchema),
                tags: ['Users'],
                description: 'Delete user',
                security: [{ apiKey: [] }]
            }
        }, asyncHandler(deleteUser));
    });
}
