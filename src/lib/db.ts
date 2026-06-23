import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Force load env files
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

let pool: Pool;


if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Fallback to empty pool if DATABASE_URL is missing
  pool = new Pool();
}

export default pool;

// Query helper
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', error);
    throw error;
  }
}
