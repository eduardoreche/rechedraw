import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { InMemoryUserRepository } from '../repositories/memory/user.repository';
import { InMemoryDrawingRepository } from '../repositories/memory/drawing.repository';
import { InMemorySceneRepository } from '../repositories/memory/scene.repository';

async function mockDiPlugin(fastify: FastifyInstance) {
    const repositories = {
        users: new InMemoryUserRepository(),
        drawings: new InMemoryDrawingRepository(),
        scenes: new InMemorySceneRepository(),
    };

    // Decorate the instance if not already decorated (tests might reuse instance)
    if (!fastify.hasDecorator('di')) {
        fastify.decorate('di', repositories);
    }

    // Decorate the request for easier access in controllers
    if (!fastify.hasRequestDecorator('di')) {
        fastify.decorateRequest('di', { getter: () => repositories });
    }
}

export default fp(mockDiPlugin, {
    name: 'di-mock',
});
