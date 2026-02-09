import { IRepository } from './repository.interface';

export interface Scene {
    id: number;
    drawingId: number;
    name: string;
    data: any; // JSON
    preview: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateScene {
    drawingId: number;
    name: string;
    data: any;
    preview?: string;
}

export interface UpdateScene {
    name?: string;
    data?: any;
    preview?: string;
}

export interface ISceneRepository extends IRepository<Scene, CreateScene, UpdateScene> {
    findByDrawingId(drawingId: number): Promise<Scene[]>;
}
