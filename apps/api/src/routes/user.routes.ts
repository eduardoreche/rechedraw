import { FastifyInstance } from 'fastify';
import {
    createUser,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
    getAllUsers,
} from '../controllers/user.controller';

export async function userRoutes(fastify: FastifyInstance) {
    // Create user
    fastify.post('/api/users', createUser);

    // Get all users
    fastify.get('/api/users', getAllUsers);

    // Get user by ID
    fastify.get('/api/users/:id', getUserById);

    // Get user by email
    fastify.get('/api/users/email/:email', getUserByEmail);

    // Update user
    fastify.put('/api/users/:id', updateUser);

    // Delete user
    fastify.delete('/api/users/:id', deleteUser);
}
