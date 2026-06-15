import fs from 'fs';
import path from 'path';
import { db } from './db';

export const initDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Initializing database schema...');
    
    // Check if the faculties table exists to determine if we need to seed
    const res = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'faculties'
      );
    `);
    
    const isInitialized = res.rows[0].exists;

    if (!isInitialized) {
      console.log('🌱 Database is empty. Running schema and seed scripts...');
      
      const schemaPath = path.join(__dirname, '../../../database/schema.sql');
      const seedPath = path.join(__dirname, '../../../database/seed.sql');

      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const seedSql = fs.readFileSync(seedPath, 'utf8');

      // Execute schema
      await db.query(schemaSql);
      console.log('✅ Schema applied successfully.');

      // Execute seed data
      await db.query(seedSql);
      console.log('✅ Seed data applied successfully.');
    } else {
      console.log('✅ Database is already initialized.');
    }
  } catch (err) {
    console.error('⚠️ Failed to initialize database:', err);
  }
};
