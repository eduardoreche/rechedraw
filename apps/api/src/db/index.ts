import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rechedraw-dev';

// Connection options to avoid IPv6 connection issues
const connectionOptions = {
    connect_timeout: 10,
    idle_timeout: 0,
    max_lifetime: 0,
};

// For migrations
export const migrationClient = postgres(connectionString, { ...connectionOptions, max: 1 });

// For queries
const queryClient = postgres(connectionString, connectionOptions);
export const db = drizzle(queryClient, { schema });
