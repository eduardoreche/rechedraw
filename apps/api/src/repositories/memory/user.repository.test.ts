import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from './user.repository';

describe('InMemoryUserRepository', () => {
    let repository: InMemoryUserRepository;

    beforeEach(() => {
        repository = new InMemoryUserRepository();
    });

    describe('create', () => {
        it('should create a new user with auto-incrementing id', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'hashed_password',
                name: 'Test User',
            };

            const user = await repository.create(userData);

            expect(user.id).toBe(1);
            expect(user.email).toBe(userData.email);
            expect(user.password).toBe(userData.password);
            expect(user.name).toBe(userData.name);
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
        });

        it('should create user with null name when not provided', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'hashed_password',
            };

            const user = await repository.create(userData);

            expect(user.name).toBeNull();
        });

        it('should throw error when creating user with duplicate email', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'hashed_password',
            };

            await repository.create(userData);

            await expect(repository.create(userData)).rejects.toThrow(
                'User with email test@example.com already exists'
            );
        });

        it('should auto-increment ids for multiple users', async () => {
            const user1 = await repository.create({
                email: 'user1@example.com',
                password: 'password1',
            });

            const user2 = await repository.create({
                email: 'user2@example.com',
                password: 'password2',
            });

            expect(user1.id).toBe(1);
            expect(user2.id).toBe(2);
        });
    });

    describe('findById', () => {
        it('should return user by id', async () => {
            const created = await repository.create({
                email: 'test@example.com',
                password: 'password',
            });

            const found = await repository.findById(created.id);

            expect(found).toEqual(created);
        });

        it('should return null for non-existent id', async () => {
            const found = await repository.findById(999);

            expect(found).toBeNull();
        });
    });

    describe('findByEmail', () => {
        it('should return user by email', async () => {
            const created = await repository.create({
                email: 'test@example.com',
                password: 'password',
            });

            const found = await repository.findByEmail('test@example.com');

            expect(found).toEqual(created);
        });

        it('should return null for non-existent email', async () => {
            const found = await repository.findByEmail('nonexistent@example.com');

            expect(found).toBeNull();
        });

        it('should be case-sensitive', async () => {
            await repository.create({
                email: 'test@example.com',
                password: 'password',
            });

            const found = await repository.findByEmail('TEST@example.com');

            expect(found).toBeNull();
        });
    });

    describe('findAll', () => {
        it('should return empty array when no users exist', async () => {
            const users = await repository.findAll();

            expect(users).toEqual([]);
        });

        it('should return all users', async () => {
            const user1 = await repository.create({
                email: 'user1@example.com',
                password: 'password1',
            });

            const user2 = await repository.create({
                email: 'user2@example.com',
                password: 'password2',
            });

            const users = await repository.findAll();

            expect(users).toHaveLength(2);
            expect(users).toContainEqual(user1);
            expect(users).toContainEqual(user2);
        });
    });

    describe('update', () => {
        it('should update user fields', async () => {
            const user = await repository.create({
                email: 'test@example.com',
                password: 'old_password',
                name: 'Old Name',
            });

            const updated = await repository.update(user.id, {
                name: 'New Name',
            });

            expect(updated.name).toBe('New Name');
            expect(updated.email).toBe('test@example.com');
            expect(updated.password).toBe('old_password');
            expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(user.updatedAt.getTime());
        });

        it('should update email if new email is unique', async () => {
            const user = await repository.create({
                email: 'old@example.com',
                password: 'password',
            });

            const updated = await repository.update(user.id, {
                email: 'new@example.com',
            });

            expect(updated.email).toBe('new@example.com');
        });

        it('should throw error when updating to duplicate email', async () => {
            await repository.create({
                email: 'user1@example.com',
                password: 'password',
            });

            const user2 = await repository.create({
                email: 'user2@example.com',
                password: 'password',
            });

            await expect(
                repository.update(user2.id, { email: 'user1@example.com' })
            ).rejects.toThrow('User with email user1@example.com already exists');
        });

        it('should throw error when updating non-existent user', async () => {
            await expect(
                repository.update(999, { name: 'New Name' })
            ).rejects.toThrow('User with id 999 not found');
        });

        it('should allow updating to same email', async () => {
            const user = await repository.create({
                email: 'test@example.com',
                password: 'password',
            });

            const updated = await repository.update(user.id, {
                email: 'test@example.com',
                name: 'New Name',
            });

            expect(updated.email).toBe('test@example.com');
            expect(updated.name).toBe('New Name');
        });
    });

    describe('delete', () => {
        it('should delete user by id', async () => {
            const user = await repository.create({
                email: 'test@example.com',
                password: 'password',
            });

            await repository.delete(user.id);

            const found = await repository.findById(user.id);
            expect(found).toBeNull();
        });

        it('should not throw error when deleting non-existent user', async () => {
            await expect(repository.delete(999)).resolves.toBeUndefined();
        });
    });
});
