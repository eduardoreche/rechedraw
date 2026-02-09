import { ISceneRepository, Scene, CreateScene, UpdateScene } from '../interfaces/scene.repository.interface';

export class InMemorySceneRepository implements ISceneRepository {
    private scenes: Map<number, Scene> = new Map();
    private nextId = 1;

    async findById(id: number): Promise<Scene | null> {
        return this.scenes.get(id) || null;
    }

    async findAll(): Promise<Scene[]> {
        return Array.from(this.scenes.values());
    }

    async findByDrawingId(drawingId: number): Promise<Scene[]> {
        return Array.from(this.scenes.values()).filter(s => s.drawingId === drawingId);
    }

    async create(data: CreateScene): Promise<Scene> {
        const now = new Date();
        const scene: Scene = {
            id: this.nextId++,
            drawingId: data.drawingId,
            name: data.name,
            data: data.data,
            preview: data.preview || null,
            createdAt: now,
            updatedAt: now,
        };

        this.scenes.set(scene.id, scene);
        return scene;
    }

    async update(id: number, data: UpdateScene): Promise<Scene> {
        const scene = this.scenes.get(id);
        if (!scene) {
            throw new Error(`Scene with id ${id} not found`);
        }

        const updatedScene: Scene = {
            ...scene,
            ...data,
            updatedAt: new Date(),
        };

        this.scenes.set(id, updatedScene);
        return updatedScene;
    }

    async delete(id: number): Promise<void> {
        this.scenes.delete(id);
    }

    // Helper method for testing
    clear(): void {
        this.scenes.clear();
        this.nextId = 1;
    }
}
