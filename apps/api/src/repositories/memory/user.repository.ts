import { IUserRepository, User, CreateUser, UpdateUser } from '../interfaces/user.repository.interface';

export class InMemoryUserRepository implements IUserRepository {
    private users: Map<number, User> = new Map();
    private nextId = 1;

    async findById(id: number): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    async findAll(): Promise<User[]> {
        return Array.from(this.users.values());
    }

    async create(data: CreateUser): Promise<User> {
        // Check for duplicate email
        const existingUser = await this.findByEmail(data.email);
        if (existingUser) {
            throw new Error(`User with email ${data.email} already exists`);
        }

        const now = new Date();
        const user: User = {
            id: this.nextId++,
            email: data.email,
            password: data.password,
            name: data.name || null,
            createdAt: now,
            updatedAt: now,
        };

        this.users.set(user.id, user);
        return user;
    }

    async update(id: number, data: UpdateUser): Promise<User> {
        const user = this.users.get(id);
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }

        // Check for email uniqueness if email is being updated
        if (data.email && data.email !== user.email) {
            const existingUser = await this.findByEmail(data.email);
            if (existingUser) {
                throw new Error(`User with email ${data.email} already exists`);
            }
        }

        const updatedUser: User = {
            ...user,
            ...data,
            updatedAt: new Date(),
        };

        this.users.set(id, updatedUser);
        return updatedUser;
    }

    async delete(id: number): Promise<void> {
        this.users.delete(id);
    }

    // Helper method for testing
    clear(): void {
        this.users.clear();
        this.nextId = 1;
    }
}
