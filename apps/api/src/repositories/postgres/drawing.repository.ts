import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { drawings } from '../../db/schema';
import { IDrawingRepository, Drawing, CreateDrawing, UpdateDrawing } from '../interfaces/drawing.repository.interface';

export class PostgresDrawingRepository implements IDrawingRepository {
    async findById(id: number): Promise<Drawing | null> {
        const result = await db.select().from(drawings).where(eq(drawings.id, id)).limit(1);
        return result[0] || null;
    }

    async findByUserId(userId: number): Promise<Drawing[]> {
        return db.select().from(drawings).where(eq(drawings.userId, userId));
    }

    async findBySlug(slug: string, userId: number): Promise<Drawing | null> {
        const result = await db.select()
            .from(drawings)
            .where(and(eq(drawings.slug, slug), eq(drawings.userId, userId)))
            .limit(1);
        return result[0] || null;
    }

    async findAll(): Promise<Drawing[]> {
        return db.select().from(drawings);
    }

    async create(data: CreateDrawing): Promise<Drawing> {
        const now = new Date();
        const result = await db.insert(drawings).values({
            ...data,
            createdAt: now,
            updatedAt: now,
        }).returning();

        return result[0];
    }

    async update(id: number, data: UpdateDrawing): Promise<Drawing> {
        const result = await db.update(drawings)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(drawings.id, id))
            .returning();

        if (!result[0]) {
            throw new Error(`Drawing with id ${id} not found`);
        }

        return result[0];
    }

    async delete(id: number): Promise<void> {
        await db.delete(drawings).where(eq(drawings.id, id));
    }
}
