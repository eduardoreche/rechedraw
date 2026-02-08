
import { db, type Workspace, type Drawing } from './index';
import { generateSlug, ensureUniqueSlug } from '../utils/slug';

// --- Workspaces ---

export const getWorkspaces = async (): Promise<Workspace[]> => {
    return await db.workspaces.orderBy('updatedAt').reverse().toArray();
};

export const createWorkspace = async (name: string, isPermanent: boolean = false): Promise<number> => {
    // Check if name already exists
    const existing = await db.workspaces.where('name').equals(name).first();
    if (existing) {
        throw new Error(`Workspace with name "${name}" already exists`);
    }

    // Generate unique slug
    const baseSlug = generateSlug(name);
    const existingSlugs = (await db.workspaces.toArray()).map(w => w.slug);
    const slug = ensureUniqueSlug(baseSlug, existingSlugs);

    const now = new Date();
    const workspaceId = await db.workspaces.add({
        name,
        slug,
        isPermanent,
        createdAt: now,
        updatedAt: now,
    } as Workspace);

    // Create an initial empty drawing for this workspace
    await createDrawing(workspaceId, 'Untitled Drawing', []);

    return workspaceId;
};

export const updateWorkspace = async (id: number, name: string): Promise<void> => {
    // Check if new name already exists (excluding current workspace)
    const existing = await db.workspaces.where('name').equals(name).first();
    if (existing && existing.id !== id) {
        throw new Error(`Workspace with name "${name}" already exists`);
    }

    // Generate new slug if name changed
    const workspace = await db.workspaces.get(id);
    if (!workspace) {
        throw new Error('Workspace not found');
    }

    const updates: Partial<Workspace> = {
        name,
        updatedAt: new Date(),
    };

    if (workspace.name !== name) {
        const baseSlug = generateSlug(name);
        const existingSlugs = (await db.workspaces.toArray())
            .filter(w => w.id !== id)
            .map(w => w.slug);
        updates.slug = ensureUniqueSlug(baseSlug, existingSlugs);
    }

    await db.workspaces.update(id, updates);
};

export const deleteWorkspace = async (id: number): Promise<void> => {
    // Check if workspace is permanent
    const workspace = await db.workspaces.get(id);
    if (workspace?.isPermanent) {
        throw new Error('Cannot delete permanent workspace');
    }

    await db.transaction('rw', db.workspaces, db.drawings, async () => {
        await db.workspaces.delete(id);
        await db.drawings.where('workspaceId').equals(id).delete();
    });
};

export const getWorkspaceBySlug = async (slug: string): Promise<Workspace | undefined> => {
    return await db.workspaces.where('slug').equals(slug).first();
};


// --- Drawings ---

export const getDrawingsByWorkspace = async (workspaceId: number): Promise<Drawing[]> => {
    return await db.drawings.where('workspaceId').equals(workspaceId).sortBy('updatedAt');
};

export const createDrawing = async (workspaceId: number, name: string, data: any): Promise<number> => {
    const now = new Date();
    return await db.drawings.add({
        workspaceId,
        name,
        data,
        createdAt: now,
        updatedAt: now,
    } as Drawing);
}

export const saveDrawing = async (id: number, data: any, preview?: string): Promise<void> => {
    await db.drawings.update(id, {
        data,
        preview,
        updatedAt: new Date(),
    });
};

export const getDrawing = async (id: number): Promise<Drawing | undefined> => {
    return await db.drawings.get(id);
}
