import { IRepository } from './repository.interface';

export interface Drawing {
    id: number;
    userId: number;
    name: string;
    slug: string;
    preset: string | null;
    isPermanent: boolean | null;
    thumbnail: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateDrawing {
    userId: number;
    name: string;
    slug: string;
    preset?: string;
    isPermanent?: boolean;
    thumbnail?: string;
}

export interface UpdateDrawing {
    name?: string;
    slug?: string;
    preset?: string;
    thumbnail?: string;
}

export interface IDrawingRepository extends IRepository<Drawing, CreateDrawing, UpdateDrawing> {
    findByUserId(userId: number): Promise<Drawing[]>;
    findBySlug(slug: string, userId: number): Promise<Drawing | null>;
}
