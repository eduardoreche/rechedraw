import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { scenes } from '../../db/schema';
import { ISceneRepository, Scene, CreateScene, UpdateScene } from '../interfaces/scene.repository.interface';

export class PostgresSceneRepository implements ISceneRepository {
    async findById(id: number): Promise<Scene | null> {
        const result = await db.select().from(scenes).where(eq(scenes.id, id)).limit(1);
        return result[0] || null;
    }

    async findByDrawingId(drawingId: number): Promise<Scene[]> {
        return db.select().from(scenes).where(eq(scenes.drawingId, drawingId));
    }

    async findAll(): Promise<Scene[]> {
        return db.select().from(scenes);
    }

    async create(data: CreateScene): Promise<Scene> {
        const now = new Date();
        const result = await db.insert(scenes).values({
            ...data,
            createdAt: now,
            updatedAt: now,
        }).returning();

        return result[0];
    }

    async update(id: number, data: UpdateScene): Promise<Scene> {
        const result = await db.update(scenes)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(scenes.id, id))
            .returning();

        if (!result[0]) {
            throw new Error(`Scene with id ${id} not found`);
        }

        return result[0];
    }

    async delete(id: number): Promise<void> {
        await db.delete(scenes).where(eq(scenes.id, id));
    }
}
