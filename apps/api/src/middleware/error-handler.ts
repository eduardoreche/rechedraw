import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { errorResponse } from '../types/response-types';

export async function errorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    // Log error for debugging
    request.log.error(error);

    // Zod validation errors
    if (error instanceof ZodError) {
        return reply.status(400).send(errorResponse(
            'Validation failed',
            'VALIDATION_ERROR',
            error.errors
        ));
    }

    // Not found errors
    if (error.message.includes('not found')) {
        return reply.status(404).send(errorResponse(
            error.message,
            'NOT_FOUND'
        ));
    }

    // Fastify validation errors
    if (error.validation) {
        return reply.status(400).send(errorResponse(
            'Invalid request data',
            'VALIDATION_ERROR',
            error.validation
        ));
    }

    // Default to 500 internal server error
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 
        ? 'Internal server error' 
        : error.message;

    return reply.status(statusCode).send(errorResponse(
        message,
        error.code,
        process.env.NODE_ENV === 'development' ? error.stack : undefined
    ));
}
