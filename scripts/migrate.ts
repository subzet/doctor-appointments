import { getDb, closeDb } from '../src/infrastructure/database/client.js';
import { schema } from '../src/infrastructure/database/schema.js';

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
