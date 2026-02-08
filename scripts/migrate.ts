import { getDb, closeDb } from './client.js';
import { schema } from './schema.js';

async function migrate() {
  console.log('Running migrations...');
  
  const db = getDb();
  
  try {
    await db.executeMultiple(schema);
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDb();
  }
}

migrate();
