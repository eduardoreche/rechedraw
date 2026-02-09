import { config } from 'dotenv';
config({ path: '.env.local' });
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, migrationClient } from './index';

async function runMigrations() {
    console.log('Running migrations...');
    console.log('Database URL:', process.env.DATABASE_URL || 'Using default connection string');

    await migrate(db, { migrationsFolder: './drizzle' });

    console.log('Migrations completed!');
    await migrationClient.end();
    process.exit(0);
}

runMigrations().catch((err) => {
    console.error('Migration failed!', err);
    process.exit(1);
});
