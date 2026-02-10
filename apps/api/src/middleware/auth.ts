import { FastifyReply, FastifyRequest } from 'fastify';
import { verifyToken } from '../utils/jwt';

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: number;
            email: string;
        };
    }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        return reply.status(401).send({
            success: false,
            error: { message: 'No authorization header' }
        });
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return reply.status(401).send({
            success: false,
            error: { message: 'Invalid authorization header format' }
        });
    }

    try {
        const payload = verifyToken(token);
        // We could also verify if user exists in DB here if strictness is needed
        // const user = await request.di.users.findById(payload.userId);
        // if (!user) throw new Error('User not found');

        request.user = {
            id: payload.userId,
            email: payload.email
        };
    } catch (error) {
        return reply.status(401).send({
            success: false,
            error: { message: 'Invalid or expired token' }
        });
    }
}
