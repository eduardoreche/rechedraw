import { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../types/response-types';
import { createDrawingSchema, updateDrawingSchema, drawingIdParamSchema, userIdParamSchema } from '../validators/drawing.schemas';

export async function createDrawing(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const validatedData = createDrawingSchema.parse(request.body);
    const drawing = await request.di.drawings.create(validatedData);
    return reply.status(201).send(successResponse(drawing));
}

export async function getDrawingById(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = drawingIdParamSchema.parse(request.params);
    const drawing = await request.di.drawings.findById(id);

    if (!drawing) {
        return reply.status(404).send({
            success: false,
            error: { message: `Drawing with id ${id} not found` }
        });
    }

    return reply.send(successResponse(drawing));
}

export async function getDrawingsByUserId(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { userId } = userIdParamSchema.parse(request.params);
    const drawings = await request.di.drawings.findByUserId(userId);
    return reply.send(successResponse(drawings));
}

export async function updateDrawing(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = drawingIdParamSchema.parse(request.params);
    const validatedData = updateDrawingSchema.parse(request.body);
    const drawing = await request.di.drawings.update(id, validatedData);
    return reply.send(successResponse(drawing));
}

export async function deleteDrawing(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = drawingIdParamSchema.parse(request.params);
    await request.di.drawings.delete(id);
    return reply.status(204).send();
}

export async function getAllDrawings(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const drawings = await request.di.drawings.findAll();
    return reply.send(successResponse(drawings));
}
