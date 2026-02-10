import { FastifyReply, FastifyRequest } from 'fastify';

// Wrapper for async route handlers to catch errors
export function asyncHandler(
    fn: (request: FastifyRequest, reply: FastifyReply) => Promise<any>
) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            return await fn(request, reply);
        } catch (error) {
            throw error; // Let Fastify's error handler deal with it
        }
    };
}
