
import Dexie, { type EntityTable } from 'dexie';

export interface Workspace {
    id: number;
    name: string;
    slug: string;
    isPermanent?: boolean;
    thumbnail?: string; // Data URL
    createdAt: Date;
    updatedAt: Date;
}



export interface Drawing {
    id: number;
    workspaceId: number;
    name: string;
    data: any; // Excalidraw elements
    preview?: string; // Data URL for thumbnail
    createdAt: Date;
    updatedAt: Date;
}

const db = new Dexie('RecheDrawDatabase') as Dexie & {
    workspaces: EntityTable<Workspace, 'id'>;
    drawings: EntityTable<Drawing, 'id'>;
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

export { db };
