import pool from './db';
import bcrypt from 'bcryptjs';

export async function initDb() {
  console.log('Initializing database schema in Neon Postgres...');

  try {
    // Users Table (Added role column)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Clients Table (Added user_id link)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        contact_number VARCHAR(50),
        email VARCHAR(255) NOT NULL,
        address TEXT,
        project_type VARCHAR(255),
        project_description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Settings Table (Added user_id link)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        freelancer_name VARCHAR(255) NOT NULL,
        freelancer_email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50),
        address TEXT,
        portfolio_link VARCHAR(255),
        signature_url TEXT,
        logo_url TEXT,
        default_revision_count INTEGER DEFAULT 3,
        default_payment_terms TEXT,
        default_agreement_clauses JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Documents Table (Added user_id link)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        document_id VARCHAR(50) UNIQUE NOT NULL,
        client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content JSONB NOT NULL,
        version INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Document Versions Table (Added user_id link)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_versions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        document_id VARCHAR(50) NOT NULL,
        version INTEGER NOT NULL,
        content JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Activity Logs Table (Added user_id link)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // OTP verification Table (Added type for login/register separation)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        type VARCHAR(50) DEFAULT 'login', -- 'login' or 'register'
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns are added if tables already existed
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';`);
      await pool.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;`);
      await pool.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;`);
      await pool.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE;`);
      await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;`);
      await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;`);
      await pool.query(`ALTER TABLE document_versions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;`);
      await pool.query(`ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`);
      await pool.query(`ALTER TABLE otps ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'login';`);
    } catch (columnErr) {
      console.log('Some columns already initialized.');
    }

    // Seed/Update Admin User
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['shivanshsaxena03102006@gmail.com']);
    if (userCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Shivanshadmin03', 10);
      await pool.query(
        "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, 'admin')",
        ['shivanshsaxena03102006@gmail.com', hashedPassword, 'Shivansh Saxena']
      );
      console.log('Created admin user.');
    } else {
      // Ensure Shivansh has the admin role
      await pool.query(
        "UPDATE users SET role = 'admin' WHERE email = $1",
        ['shivanshsaxena03102006@gmail.com']
      );
    }

    console.log('Database schema check complete.');
  } catch (error) {
    console.error('Failed to initialize database schemas:', error);
    throw error;
  }
}
