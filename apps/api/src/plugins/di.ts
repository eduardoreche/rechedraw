import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { PostgresUserRepository } from '../repositories/postgres/user.repository';
import { PostgresDrawingRepository } from '../repositories/postgres/drawing.repository';
import { PostgresSceneRepository } from '../repositories/postgres/scene.repository';

// In the future, we can switch implementations here based on env vars
// e.g., if (process.env.DB_TYPE === 'memory') ...

async function diPlugin(fastify: FastifyInstance) {
    const repositories = {
        users: new PostgresUserRepository(),
        drawings: new PostgresDrawingRepository(),
        scenes: new PostgresSceneRepository(),
    };

    // Decorate the instance
    fastify.decorate('di', repositories);

    // Decorate the request for easier access in controllers
    fastify.decorateRequest('di', { getter: () => repositories });
}

export default fp(diPlugin, {
    name: 'di',
});
