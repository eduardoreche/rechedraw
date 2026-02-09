import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDrawingRepository } from './drawing.repository';

describe('InMemoryDrawingRepository', () => {
    let repository: InMemoryDrawingRepository;

    beforeEach(() => {
        repository = new InMemoryDrawingRepository();
    });

    describe('create', () => {
        it('should create a new drawing with all fields', async () => {
            const drawingData = {
                userId: 1,
                name: 'My Drawing',
                slug: 'my-drawing',
                preset: 'default',
                isPermanent: true,
                thumbnail: 'base64_image_data',
            };

            const drawing = await repository.create(drawingData);

            expect(drawing.id).toBe(1);
            expect(drawing.userId).toBe(drawingData.userId);
            expect(drawing.name).toBe(drawingData.name);
            expect(drawing.slug).toBe(drawingData.slug);
            expect(drawing.preset).toBe(drawingData.preset);
            expect(drawing.isPermanent).toBe(true);
            expect(drawing.thumbnail).toBe(drawingData.thumbnail);
            expect(drawing.createdAt).toBeInstanceOf(Date);
            expect(drawing.updatedAt).toBeInstanceOf(Date);
        });

        it('should create drawing with null optional fields', async () => {
            const drawingData = {
                userId: 1,
                name: 'My Drawing',
                slug: 'my-drawing',
            };

            const drawing = await repository.create(drawingData);

            expect(drawing.preset).toBeNull();
            expect(drawing.isPermanent).toBeNull();
            expect(drawing.thumbnail).toBeNull();
        });

        it('should auto-increment ids', async () => {
            const drawing1 = await repository.create({
                userId: 1,
                name: 'Drawing 1',
                slug: 'drawing-1',
            });

            const drawing2 = await repository.create({
                userId: 1,
                name: 'Drawing 2',
                slug: 'drawing-2',
            });

            expect(drawing1.id).toBe(1);
            expect(drawing2.id).toBe(2);
        });
    });

    describe('findById', () => {
        it('should return drawing by id', async () => {
            const created = await repository.create({
                userId: 1,
                name: 'Test Drawing',
                slug: 'test-drawing',
            });

            const found = await repository.findById(created.id);

            expect(found).toEqual(created);
        });

        it('should return null for non-existent id', async () => {
            const found = await repository.findById(999);

            expect(found).toBeNull();
        });
    });

    describe('findByUserId', () => {
        it('should return all drawings for a user', async () => {
            const drawing1 = await repository.create({
                userId: 1,
                name: 'Drawing 1',
                slug: 'drawing-1',
            });

            const drawing2 = await repository.create({
                userId: 1,
                name: 'Drawing 2',
                slug: 'drawing-2',
            });

            await repository.create({
                userId: 2,
                name: 'Other User Drawing',
                slug: 'other-drawing',
            });

            const userDrawings = await repository.findByUserId(1);

            expect(userDrawings).toHaveLength(2);
            expect(userDrawings).toContainEqual(drawing1);
            expect(userDrawings).toContainEqual(drawing2);
        });

        it('should return empty array when user has no drawings', async () => {
            const drawings = await repository.findByUserId(999);

            expect(drawings).toEqual([]);
        });
    });

    describe('findBySlug', () => {
        it('should return drawing by slug and userId', async () => {
            const created = await repository.create({
                userId: 1,
                name: 'My Drawing',
                slug: 'my-drawing',
            });

            const found = await repository.findBySlug('my-drawing', 1);

            expect(found).toEqual(created);
        });

        it('should return null when slug exists but for different user', async () => {
            await repository.create({
                userId: 1,
                name: 'User 1 Drawing',
                slug: 'shared-slug',
            });

            const found = await repository.findBySlug('shared-slug', 2);

            expect(found).toBeNull();
        });

        it('should return null for non-existent slug', async () => {
            const found = await repository.findBySlug('nonexistent', 1);

            expect(found).toBeNull();
        });

        it('should handle multiple users with same slug', async () => {
            const user1Drawing = await repository.create({
                userId: 1,
                name: 'User 1 Drawing',
                slug: 'my-drawing',
            });

            const user2Drawing = await repository.create({
                userId: 2,
                name: 'User 2 Drawing',
                slug: 'my-drawing',
            });

            const found1 = await repository.findBySlug('my-drawing', 1);
            const found2 = await repository.findBySlug('my-drawing', 2);

            expect(found1).toEqual(user1Drawing);
            expect(found2).toEqual(user2Drawing);
        });
    });

    describe('findAll', () => {
        it('should return empty array when no drawings exist', async () => {
            const drawings = await repository.findAll();

            expect(drawings).toEqual([]);
        });

        it('should return all drawings', async () => {
            const drawing1 = await repository.create({
                userId: 1,
                name: 'Drawing 1',
                slug: 'drawing-1',
            });

            const drawing2 = await repository.create({
                userId: 2,
                name: 'Drawing 2',
                slug: 'drawing-2',
            });

            const drawings = await repository.findAll();

            expect(drawings).toHaveLength(2);
            expect(drawings).toContainEqual(drawing1);
            expect(drawings).toContainEqual(drawing2);
        });
    });

    describe('update', () => {
        it('should update drawing fields', async () => {
            const drawing = await repository.create({
                userId: 1,
                name: 'Old Name',
                slug: 'old-slug',
            });

            const updated = await repository.update(drawing.id, {
                name: 'New Name',
                thumbnail: 'new_thumbnail',
            });

            expect(updated.name).toBe('New Name');
            expect(updated.thumbnail).toBe('new_thumbnail');
            expect(updated.slug).toBe('old-slug');
            expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(drawing.updatedAt.getTime());
        });

        it('should throw error when updating non-existent drawing', async () => {
            await expect(
                repository.update(999, { name: 'New Name' })
            ).rejects.toThrow('Drawing with id 999 not found');
        });
    });

    describe('delete', () => {
        it('should delete drawing by id', async () => {
            const drawing = await repository.create({
                userId: 1,
                name: 'Test Drawing',
                slug: 'test-drawing',
            });

            await repository.delete(drawing.id);

            const found = await repository.findById(drawing.id);
            expect(found).toBeNull();
        });

        it('should not throw error when deleting non-existent drawing', async () => {
            await expect(repository.delete(999)).resolves.toBeUndefined();
        });
    });
});
