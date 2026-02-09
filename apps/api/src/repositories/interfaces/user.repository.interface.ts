import { IRepository } from './repository.interface';

export interface User {
    id: number;
    email: string;
    password: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUser {
    email: string;
    password: string;
    name?: string;
}

export interface UpdateUser {
    email?: string;
    password?: string;
    name?: string;
}

export interface IUserRepository extends IRepository<User, CreateUser, UpdateUser> {
    findByEmail(email: string): Promise<User | null>;
}
