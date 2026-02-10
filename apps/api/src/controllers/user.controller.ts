import { FastifyReply, FastifyRequest } from 'fastify';
import { PostgresUserRepository } from '../repositories/postgres/user.repository';
import { successResponse } from '../types/response-types';
import { createUserSchema, updateUserSchema, userIdParamSchema } from '../validators/user.schemas';

const userRepository = new PostgresUserRepository();

export async function createUser(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const validatedData = createUserSchema.parse(request.body);
    const user = await userRepository.create(validatedData);
    return reply.status(201).send(successResponse(user));
}

export async function getUserById(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = userIdParamSchema.parse(request.params);
    const user = await userRepository.findById(id);

    if (!user) {
        return reply.status(404).send({
            success: false,
            error: { message: `User with id ${id} not found` }
        });
    }

    return reply.send(successResponse(user));
}

export async function getUserByEmail(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const params = request.params as { email: string };
    const user = await userRepository.findByEmail(params.email);

    if (!user) {
        return reply.status(404).send({
            success: false,
            error: { message: `User with email ${params.email} not found` }
        });
    }

    return reply.send(successResponse(user));
}

export async function updateUser(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = userIdParamSchema.parse(request.params);
    const validatedData = updateUserSchema.parse(request.body);
    const user = await userRepository.update(id, validatedData);
    return reply.send(successResponse(user));
}

export async function deleteUser(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = userIdParamSchema.parse(request.params);
    await userRepository.delete(id);
    return reply.status(204).send();
}

export async function getAllUsers(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const users = await userRepository.findAll();
    return reply.send(successResponse(users));
}
