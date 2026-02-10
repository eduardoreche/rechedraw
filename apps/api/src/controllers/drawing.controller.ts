import { FastifyReply, FastifyRequest } from 'fastify';
import { PostgresDrawingRepository } from '../repositories/postgres/drawing.repository';
import { successResponse } from '../types/response-types';
import { createDrawingSchema, updateDrawingSchema, drawingIdParamSchema, userIdParamSchema } from '../validators/drawing.schemas';

const drawingRepository = new PostgresDrawingRepository();

export async function createDrawing(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const validatedData = createDrawingSchema.parse(request.body);
    const drawing = await drawingRepository.create(validatedData);
    return reply.status(201).send(successResponse(drawing));
}

export async function getDrawingById(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = drawingIdParamSchema.parse(request.params);
    const drawing = await drawingRepository.findById(id);

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
    const drawings = await drawingRepository.findByUserId(userId);
    return reply.send(successResponse(drawings));
}

export async function updateDrawing(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = drawingIdParamSchema.parse(request.params);
    const validatedData = updateDrawingSchema.parse(request.body);
    const drawing = await drawingRepository.update(id, validatedData);
    return reply.send(successResponse(drawing));
}

export async function deleteDrawing(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = drawingIdParamSchema.parse(request.params);
    await drawingRepository.delete(id);
    return reply.status(204).send();
}

export async function getAllDrawings(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const drawings = await drawingRepository.findAll();
    return reply.send(successResponse(drawings));
}
