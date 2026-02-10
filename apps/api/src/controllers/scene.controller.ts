import { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../types/response-types';
import { createSceneSchema, updateSceneSchema, sceneIdParamSchema, drawingIdParamSchema } from '../validators/scene.schemas';

export async function createScene(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const validatedData = createSceneSchema.parse(request.body);
    const scene = await request.di.scenes.create(validatedData);
    return reply.status(201).send(successResponse(scene));
}

export async function getSceneById(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = sceneIdParamSchema.parse(request.params);
    const scene = await request.di.scenes.findById(id);

    if (!scene) {
        return reply.status(404).send({
            success: false,
            error: { message: `Scene with id ${id} not found` }
        });
    }

    return reply.send(successResponse(scene));
}

export async function getScenesByDrawingId(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { drawingId } = drawingIdParamSchema.parse(request.params);
    const scenes = await request.di.scenes.findByDrawingId(drawingId);
    return reply.send(successResponse(scenes));
}

export async function updateScene(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = sceneIdParamSchema.parse(request.params);
    const validatedData = updateSceneSchema.parse(request.body);
    const scene = await request.di.scenes.update(id, validatedData);
    return reply.send(successResponse(scene));
}

export async function deleteScene(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { id } = sceneIdParamSchema.parse(request.params);
    await request.di.scenes.delete(id);
    return reply.status(204).send();
}

export async function getAllScenes(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const scenes = await request.di.scenes.findAll();
    return reply.send(successResponse(scenes));
}
