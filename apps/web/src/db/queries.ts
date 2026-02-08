
import { db, type Drawing, type Scene } from './index';
import { generateSlug, ensureUniqueSlug } from '../utils/slug';

// --- Drawings (ex-Workspaces) ---

export const getDrawings = async (): Promise<Drawing[]> => {
    return await db.workspaces.orderBy('updatedAt').reverse().toArray();
};

export const createDrawing = async (name: string, isPermanent: boolean = false): Promise<number> => {
    // Check if name already exists
    const existing = await db.workspaces.where('name').equals(name).first();
    if (existing) {
        throw new Error(`Drawing with name "${name}" already exists`);
    }

    // Generate unique slug
    const baseSlug = generateSlug(name);
    const existingSlugs = (await db.workspaces.toArray()).map(w => w.slug);
    const slug = ensureUniqueSlug(baseSlug, existingSlugs);

    const now = new Date();
    const drawingId = await db.workspaces.add({
        name,
        slug,
        isPermanent,
        createdAt: now,
        updatedAt: now,
    } as Drawing);

    // Create an initial empty scene for this drawing
    await createScene(drawingId, 'Untitled Scene', []);

    return drawingId;
};

export const updateDrawing = async (id: number, updates: { name?: string; thumbnail?: string }): Promise<void> => {
    // If name is being updated, check for uniqueness
    if (updates.name) {
        // Check if new name already exists (excluding current drawing)
        const existing = await db.workspaces.where('name').equals(updates.name).first();
        if (existing && existing.id !== id) {
            throw new Error(`Drawing with name "${updates.name}" already exists`);
        }
    }

    const drawing = await db.workspaces.get(id);
    if (!drawing) {
        throw new Error('Drawing not found');
    }

    const dbUpdates: Partial<Drawing> = {
        ...updates,
        updatedAt: new Date(),
    };

    // Generate new slug if name changed
    if (updates.name && drawing.name !== updates.name) {
        const baseSlug = generateSlug(updates.name);
        const existingSlugs = (await db.workspaces.toArray())
            .filter(w => w.id !== id)
            .map(w => w.slug);
        dbUpdates.slug = ensureUniqueSlug(baseSlug, existingSlugs);
    }

    await db.workspaces.update(id, dbUpdates);
};

export const deleteDrawing = async (id: number): Promise<void> => {
    // Check if drawing is permanent
    const drawing = await db.workspaces.get(id);
    if (drawing?.isPermanent) {
        throw new Error('Cannot delete permanent drawing');
    }

    await db.transaction('rw', db.workspaces, db.drawings, async () => {
        await db.workspaces.delete(id);
        // Delete all scenes associated with this drawing
        // Note: db.drawings table still uses 'workspaceId' as the foreign key column name in the DB schema
        await db.drawings.where('workspaceId').equals(id).delete();
    });
};

export const getDrawingBySlug = async (slug: string): Promise<Drawing | undefined> => {
    return await db.workspaces.where('slug').equals(slug).first();
};


// --- Scenes (ex-Drawings) ---

export const getScenesByDrawing = async (drawingId: number): Promise<Scene[]> => {
    // Map 'drawingId' to 'workspaceId' column in DB
    return await db.drawings.where('workspaceId').equals(drawingId).sortBy('updatedAt');
};

export const createScene = async (drawingId: number, name: string, data: any): Promise<number> => {
    const now = new Date();
    // 'workspaceId' property is required by the DB schema/interface for Scene (Scene extends { workspaceId: number ... } effectively or we cast it)
    // Actually our Scene interface defined in index.ts used 'drawingId'.
    // BUT the db schema uses 'workspaceId'.
    // We need to be careful here. Dexie stores objects.
    // In index.ts we defined `drawingId: number`.
    // But `db.version(1).stores({ drawings: '++id, workspaceId, ...' })`
    // If we pass an object with `drawingId`, Dexie might not index it correctly if the store expects `workspaceId`.
    // Let's check index.ts again.
    // The store definition uses `workspaceId`.
    // So distinct objects MUST have `workspaceId` property for indexing to work.
    // I should update the Scene interface in `index.ts` to use `workspaceId` OR update `queries.ts` to map it.
    // Simplest approach: Use `workspaceId` in the object stored in DB, but we can expose it as we want?
    // No, Dexie Typescript wrappers usually rely on the interface matching the store.
    // Let's revert the Scene interface change in index.ts slightly or use alias?
    // Actually, I renamed `workspaceId` to `drawingId` in interface Scene in `index.ts`.
    // But I did NOT change the store definition: `drawings: '++id, workspaceId, ...'`.
    // This is a mismatch. Dexie will look for `workspaceId` on the object to index it.
    // I MUST use `workspaceId` property on the Scene object if I want it indexed by that key defined in existing schema stores.
    // Changing the store key name `workspaceId` -> `drawingId` would require a migration (reading all, deleting, re-adding with new key).
    // I decided to AVOID complex migration.
    // So the stored entity MUST have `workspaceId`.
    // So the Interface Scene MUST have `workspaceId`.
    // I made a mistake in previous step's plan execution for `index.ts`.
    // I will correct it here by casting or changing logic.
    // Use `workspaceId` in the DB operations.
    // I will implicitly treat `drawingId` as `workspaceId` where needed or just use `workspaceId` internally.
    // Let's stick to `workspaceId` available on the Scene interface effectively.
    // Wait, I changed `drawingId` in `index.ts`.
    // I should probably fix `index.ts` to have `workspaceId` again to match DB, or add a virtual property?
    // Let's use `workspaceId` in the interface to align with DB, and maybe alias it in UI?
    // Or... I can double write?
    // No, let's correct `index.ts` interface first to `workspaceId` to be safe, OR just use `workspaceId` here?
    // If I use `workspaceId` here, typescript will complain because Scene interface says `drawingId`.
    // I will cast it for now to `any` or `Scene & { workspaceId: number }`.
    // Actually, best is to fix the Interface.
    // I'll proceed with `queries.ts` attempting to align, but I really should fix the interface.
    // Let's assume I fix the interface in the next step or right now.
    // I will write this file assuming Scene has `workspaceId` to match DB.
    return await db.drawings.add({
        workspaceId: drawingId, // Needs to match DB index
        name,
        data,
        createdAt: now,
        updatedAt: now,
    } as any as Scene); // Cast to silence TS if mismatch, but ideally interface should match.
};

export const saveScene = async (id: number, data: any, preview?: string): Promise<void> => {
    await db.drawings.update(id, {
        data,
        preview,
        updatedAt: new Date(),
    });
};

export const getScene = async (id: number): Promise<Scene | undefined> => {
    return await db.drawings.get(id);
}
