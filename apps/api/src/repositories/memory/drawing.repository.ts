import { IDrawingRepository, Drawing, CreateDrawing, UpdateDrawing } from '../interfaces/drawing.repository.interface';

export class InMemoryDrawingRepository implements IDrawingRepository {
    private drawings: Map<number, Drawing> = new Map();
    private nextId = 1;

    async findById(id: number): Promise<Drawing | null> {
        return this.drawings.get(id) || null;
    }

    async findAll(): Promise<Drawing[]> {
        return Array.from(this.drawings.values());
    }

    async findByUserId(userId: number): Promise<Drawing[]> {
        return Array.from(this.drawings.values()).filter(d => d.userId === userId);
    }

    async findBySlug(slug: string, userId: number): Promise<Drawing | null> {
        for (const drawing of this.drawings.values()) {
            if (drawing.slug === slug && drawing.userId === userId) {
                return drawing;
            }
        }
        return null;
    }

    async create(data: CreateDrawing): Promise<Drawing> {
        const now = new Date();
        const drawing: Drawing = {
            id: this.nextId++,
            userId: data.userId,
            name: data.name,
            slug: data.slug,
            preset: data.preset || null,
            isPermanent: data.isPermanent || null,
            thumbnail: data.thumbnail || null,
            createdAt: now,
            updatedAt: now,
        };

        this.drawings.set(drawing.id, drawing);
        return drawing;
    }

    async update(id: number, data: UpdateDrawing): Promise<Drawing> {
        const drawing = this.drawings.get(id);
        if (!drawing) {
            throw new Error(`Drawing with id ${id} not found`);
        }

        const updatedDrawing: Drawing = {
            ...drawing,
            ...data,
            updatedAt: new Date(),
        };

        this.drawings.set(id, updatedDrawing);
        return updatedDrawing;
    }

    async delete(id: number): Promise<void> {
        this.drawings.delete(id);
    }

    // Helper method for testing
    clear(): void {
        this.drawings.clear();
        this.nextId = 1;
    }
}
