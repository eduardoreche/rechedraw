
import Dexie, { type EntityTable } from 'dexie';

export interface Drawing {
    id: number;
    name: string;
    slug: string;
    isPermanent?: boolean;
    thumbnail?: string; // Data URL
    createdAt: Date;
    updatedAt: Date;
}



export interface Scene {
    id: number;
    workspaceId: number; // kept as workspaceId to match DB schema
    name: string;
    data: any; // Excalidraw elements
    preview?: string; // Data URL for thumbnail
    createdAt: Date;
    updatedAt: Date;
}

const db = new Dexie('RecheDrawDatabase') as Dexie & {
    workspaces: EntityTable<Drawing, 'id'>; // Table name kept as 'workspaces' for Drawing entities
    drawings: EntityTable<Scene, 'id'>;    // Table name kept as 'drawings' for Scene entities
};

// Schema declaration:
db.version(1).stores({
    workspaces: '++id, name, createdAt, updatedAt',
    drawings: '++id, workspaceId, name, createdAt, updatedAt' // data & preview are stored but not indexed
});

// Version 2: Add slug and isPermanent fields
db.version(2).stores({
    workspaces: '++id, name, slug, isPermanent, createdAt, updatedAt',
    drawings: '++id, workspaceId, name, createdAt, updatedAt'
}).upgrade(tx => {
    // Migrate existing workspaces to have slugs
    return tx.table('workspaces').toCollection().modify(workspace => {
        if (!workspace.slug) {
            workspace.slug = workspace.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        if (workspace.isPermanent === undefined) {
            workspace.isPermanent = workspace.name === 'Base';
        }
    });
});

// Version 3: Add thumbnail field
db.version(3).stores({
    workspaces: '++id, name, slug, isPermanent, createdAt, updatedAt', // thumbnail is not indexed
    drawings: '++id, workspaceId, name, createdAt, updatedAt'
});

// Version 4: Rename "Base" to "Draft" and rename internal fields if necessary
// Note: We are NOT renaming the tables 'workspaces' and 'drawings' to avoid complex data migration.
// We are mapping Drawing -> workspaces table, and Scene -> drawings table.
// The field 'workspaceId' in 'drawings' table is kept as is in the DB schema for compatibility,
// but mapped to 'drawingId' in the Scene interface if we want, OR we just keep using workspaceId in the interface for simplicity with Dexie.
// Let's keep 'workspaceId' in the Scene interface to match the DB column, but we will call it 'drawingId' in the rest of the app.
// Actually, let's keep the interface matching the DB column for Dexie simplicity.
db.version(4).upgrade(tx => {
    return tx.table('workspaces').toCollection().modify(workspace => {
        if (workspace.name === 'Base') {
            workspace.name = 'Draft';
            workspace.slug = 'draft';
        }
    });
});

export { db };
