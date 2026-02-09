import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema';
import { IUserRepository, User, CreateUser, UpdateUser } from '../interfaces/user.repository.interface';

export class PostgresUserRepository implements IUserRepository {
    async findById(id: number): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0] || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0] || null;
    }

    async findAll(): Promise<User[]> {
        return db.select().from(users);
    }

    async create(data: CreateUser): Promise<User> {
        const now = new Date();
        const result = await db.insert(users).values({
            ...data,
            createdAt: now,
            updatedAt: now,
        }).returning();

        return result[0];
    }

    async update(id: number, data: UpdateUser): Promise<User> {
        const result = await db.update(users)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id))
            .returning();

        if (!result[0]) {
            throw new Error(`User with id ${id} not found`);
        }

        return result[0];
    }

    async delete(id: number): Promise<void> {
        await db.delete(users).where(eq(users.id, id));
    }
}
