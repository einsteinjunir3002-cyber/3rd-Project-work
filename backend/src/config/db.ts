import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let isDbOnline = false;

// Create a connection pool for PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/smartlearn',
  // Use SSL if required in production (e.g. Heroku, AWS RDS)
  ssl: process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false
});

// Test the connection
pool.on('connect', () => {
  isDbOnline = true;
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  isDbOnline = false;
  process.exit(-1);
});

export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully to database instance.');
    isDbOnline = true;
    client.release();
  } catch (err) {
    console.error('⚠️ Failed to connect to PostgreSQL database:', err);
    isDbOnline = false;
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('🔌 PostgreSQL connection pool closed.');
  } catch (err) {
    console.error('Error closing database connections:', err);
  }
};

export { isDbOnline, pool as db };
