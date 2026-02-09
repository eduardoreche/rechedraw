// Generic repository interface
export interface IRepository<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
    findById(id: number): Promise<T | null>;
    findAll(filters?: any): Promise<T[]>;
    create(data: TCreate): Promise<T>;
    update(id: number, data: TUpdate): Promise<T>;
    delete(id: number): Promise<void>;
}
