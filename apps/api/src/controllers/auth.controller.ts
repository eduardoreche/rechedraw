import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserInput } from '../validators/user.schemas'; // Re-use schema type if possible or create new auth schemas
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { successResponse } from '../types/response-types';
import { z } from 'zod';

import { registerSchema, loginSchema } from '../validators/auth.schemas';

// Validation schemas for Auth
// Moved to validators/auth.schemas.ts

export async function register(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = registerSchema.parse(request.body);

    // Check if user exists
    const existingUser = await request.di.users.findByEmail(validatedData.email);
    if (existingUser) {
        return reply.status(409).send({
            success: false,
            error: { message: 'User with this email already exists' }
        });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const newUser = await request.di.users.create({
        ...validatedData,
        password: hashedPassword
    });

    // Generate token
    const token = signToken({ userId: newUser.id, email: newUser.email });

    const { password: _, ...userWithoutPassword } = newUser;

    return reply.status(201).send(successResponse({ user: userWithoutPassword, token }));
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = loginSchema.parse(request.body);

    const user = await request.di.users.findByEmail(email);
    if (!user) {
        return reply.status(401).send({
            success: false,
            error: { message: 'Invalid credentials' }
        });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
        return reply.status(401).send({
            success: false,
            error: { message: 'Invalid credentials' }
        });
    }

    const token = signToken({ userId: user.id, email: user.email });

    const { password: _, ...userWithoutPassword } = user;

    return reply.send(successResponse({ user: userWithoutPassword, token }));
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
    // User is attached to request by auth middleware (which we need to create)
    // For now assuming request.user is populated
    const user = (request as any).user;
    return reply.send(successResponse(user));
}
