import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySceneRepository } from './scene.repository';

describe('InMemorySceneRepository', () => {
    let repository: InMemorySceneRepository;

    beforeEach(() => {
        repository = new InMemorySceneRepository();
    });

    describe('create', () => {
        it('should create a new scene with all fields', async () => {
            const sceneData = {
                drawingId: 1,
                name: 'Version 1',
                data: { elements: [], appState: {} },
                preview: 'base64_preview',
            };

            const scene = await repository.create(sceneData);

            expect(scene.id).toBe(1);
            expect(scene.drawingId).toBe(sceneData.drawingId);
            expect(scene.name).toBe(sceneData.name);
            expect(scene.data).toEqual(sceneData.data);
            expect(scene.preview).toBe(sceneData.preview);
            expect(scene.createdAt).toBeInstanceOf(Date);
            expect(scene.updatedAt).toBeInstanceOf(Date);
        });

        it('should create scene with null preview', async () => {
            const sceneData = {
                drawingId: 1,
                name: 'Version 1',
                data: { elements: [] },
            };

            const scene = await repository.create(sceneData);

            expect(scene.preview).toBeNull();
        });

        it('should handle complex JSON data', async () => {
            const complexData = {
                elements: [
                    { id: '1', type: 'rectangle', x: 0, y: 0 },
                    { id: '2', type: 'ellipse', x: 100, y: 100 },
                ],
                appState: {
                    viewBackgroundColor: '#ffffff',
                    currentItemStrokeColor: '#000000',
                },
                files: {},
            };

            const scene = await repository.create({
                drawingId: 1,
                name: 'Complex Scene',
                data: complexData,
            });

            expect(scene.data).toEqual(complexData);
        });

        it('should auto-increment ids', async () => {
            const scene1 = await repository.create({
                drawingId: 1,
                name: 'Scene 1',
                data: {},
            });

            const scene2 = await repository.create({
                drawingId: 1,
                name: 'Scene 2',
                data: {},
            });

            expect(scene1.id).toBe(1);
            expect(scene2.id).toBe(2);
        });
    });

    describe('findById', () => {
        it('should return scene by id', async () => {
            const created = await repository.create({
                drawingId: 1,
                name: 'Test Scene',
                data: { test: 'data' },
            });

            const found = await repository.findById(created.id);

            expect(found).toEqual(created);
        });

        it('should return null for non-existent id', async () => {
            const found = await repository.findById(999);

            expect(found).toBeNull();
        });
    });

    describe('findByDrawingId', () => {
        it('should return all scenes for a drawing', async () => {
            const scene1 = await repository.create({
                drawingId: 1,
                name: 'Version 1',
                data: {},
            });

            const scene2 = await repository.create({
                drawingId: 1,
                name: 'Version 2',
                data: {},
            });

            await repository.create({
                drawingId: 2,
                name: 'Other Drawing Scene',
                data: {},
            });

            const drawingScenes = await repository.findByDrawingId(1);

            expect(drawingScenes).toHaveLength(2);
            expect(drawingScenes).toContainEqual(scene1);
            expect(drawingScenes).toContainEqual(scene2);
        });

        it('should return empty array when drawing has no scenes', async () => {
            const scenes = await repository.findByDrawingId(999);

            expect(scenes).toEqual([]);
        });

        it('should maintain scene order', async () => {
            for (let i = 1; i <= 5; i++) {
                await repository.create({
                    drawingId: 1,
                    name: `Version ${i}`,
                    data: { version: i },
                });
            }

            const scenes = await repository.findByDrawingId(1);

            expect(scenes).toHaveLength(5);
            expect(scenes[0].name).toBe('Version 1');
            expect(scenes[4].name).toBe('Version 5');
        });
    });

    describe('findAll', () => {
        it('should return empty array when no scenes exist', async () => {
            const scenes = await repository.findAll();

            expect(scenes).toEqual([]);
        });

        it('should return all scenes across all drawings', async () => {
            const scene1 = await repository.create({
                drawingId: 1,
                name: 'Drawing 1 Scene',
                data: {},
            });

            const scene2 = await repository.create({
                drawingId: 2,
                name: 'Drawing 2 Scene',
                data: {},
            });

            const scenes = await repository.findAll();

            expect(scenes).toHaveLength(2);
            expect(scenes).toContainEqual(scene1);
            expect(scenes).toContainEqual(scene2);
        });
    });

    describe('update', () => {
        it('should update scene fields', async () => {
            const scene = await repository.create({
                drawingId: 1,
                name: 'Old Name',
                data: { old: 'data' },
            });

            const updated = await repository.update(scene.id, {
                name: 'New Name',
                data: { new: 'data' },
                preview: 'new_preview',
            });

            expect(updated.name).toBe('New Name');
            expect(updated.data).toEqual({ new: 'data' });
            expect(updated.preview).toBe('new_preview');
            expect(updated.drawingId).toBe(1);
            expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(scene.updatedAt.getTime());
        });

        it('should allow partial updates', async () => {
            const scene = await repository.create({
                drawingId: 1,
                name: 'Original Name',
                data: { original: 'data' },
            });

            const updated = await repository.update(scene.id, {
                name: 'Updated Name',
            });

            expect(updated.name).toBe('Updated Name');
            expect(updated.data).toEqual({ original: 'data' });
        });

        it('should throw error when updating non-existent scene', async () => {
            await expect(
                repository.update(999, { name: 'New Name' })
            ).rejects.toThrow('Scene with id 999 not found');
        });
    });

    describe('delete', () => {
        it('should delete scene by id', async () => {
            const scene = await repository.create({
                drawingId: 1,
                name: 'Test Scene',
                data: {},
            });

            await repository.delete(scene.id);

            const found = await repository.findById(scene.id);
            expect(found).toBeNull();
        });

        it('should not affect other scenes', async () => {
            const scene1 = await repository.create({
                drawingId: 1,
                name: 'Scene 1',
                data: {},
            });

            const scene2 = await repository.create({
                drawingId: 1,
                name: 'Scene 2',
                data: {},
            });

            await repository.delete(scene1.id);

            const found = await repository.findById(scene2.id);
            expect(found).toEqual(scene2);
        });

        it('should not throw error when deleting non-existent scene', async () => {
            await expect(repository.delete(999)).resolves.toBeUndefined();
        });
    });
});
