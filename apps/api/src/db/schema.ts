import { pgTable, text, serial, timestamp, boolean, json, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(), // hashed
    name: text('name'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Drawings table
export const drawings = pgTable('drawings', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    preset: text('preset').default('default'),
    isPermanent: boolean('is_permanent').default(false),
    thumbnail: text('thumbnail'), // base64 or URL
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Scenes table (drawing data/versions)
export const scenes = pgTable('scenes', {
    id: serial('id').primaryKey(),
    drawingId: integer('drawing_id').notNull().references(() => drawings.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    data: json('data').notNull(), // Excalidraw elements
    preview: text('preview'), // thumbnail
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Collaboration rooms table
export const collaborationRooms = pgTable('collaboration_rooms', {
    id: serial('id').primaryKey(),
    drawingId: integer('drawing_id').notNull().references(() => drawings.id, { onDelete: 'cascade' }),
    createdBy: integer('created_by').notNull().references(() => users.id),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Room participants table
export const roomParticipants = pgTable('room_participants', {
    id: serial('id').primaryKey(),
    roomId: integer('room_id').notNull().references(() => collaborationRooms.id, { onDelete: 'cascade' }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    lastSeen: timestamp('last_seen').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    drawings: many(drawings),
    roomParticipants: many(roomParticipants),
}));

export const drawingsRelations = relations(drawings, ({ one, many }) => ({
    user: one(users, {
        fields: [drawings.userId],
        references: [users.id],
    }),
    scenes: many(scenes),
    collaborationRooms: many(collaborationRooms),
}));

export const scenesRelations = relations(scenes, ({ one }) => ({
    drawing: one(drawings, {
        fields: [scenes.drawingId],
        references: [drawings.id],
    }),
}));

export const collaborationRoomsRelations = relations(collaborationRooms, ({ one, many }) => ({
    drawing: one(drawings, {
        fields: [collaborationRooms.drawingId],
        references: [drawings.id],
    }),
    creator: one(users, {
        fields: [collaborationRooms.createdBy],
        references: [users.id],
    }),
    participants: many(roomParticipants),
}));

export const roomParticipantsRelations = relations(roomParticipants, ({ one }) => ({
    room: one(collaborationRooms, {
        fields: [roomParticipants.roomId],
        references: [collaborationRooms.id],
    }),
    user: one(users, {
        fields: [roomParticipants.userId],
        references: [users.id],
    }),
}));
