import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { IDrawingRepository } from '../repositories/interfaces/drawing.repository.interface';
import { ISceneRepository } from '../repositories/interfaces/scene.repository.interface';

declare module 'fastify' {
    interface FastifyInstance {
        di: {
            users: IUserRepository;
            drawings: IDrawingRepository;
            scenes: ISceneRepository;
        };
    }

    interface FastifyRequest {
        di: {
            users: IUserRepository;
            drawings: IDrawingRepository;
            scenes: ISceneRepository;
        };
    }
}
