import pool from './db';
import bcrypt from 'bcryptjs';

export async function initDb() {
  console.log('Initializing database schema in Neon Postgres...');

  try {
    // Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Clients Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
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

    // Settings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
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

    // Documents Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
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

    // Document Versions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_versions (
        id SERIAL PRIMARY KEY,
        document_id VARCHAR(50) NOT NULL,
        version INTEGER NOT NULL,
        content JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Activity Logs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // OTP verification Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);


    // Create default admin user if none exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['shivanshsaxena03102006@gmail.com']);
    if (userCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Shivanshadmin03', 10);
      await pool.query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
        ['shivanshsaxena03102006@gmail.com', hashedPassword, 'Shivansh Saxena']
      );
      console.log('Created default admin user: shivanshsaxena03102006@gmail.com / Shivanshadmin03');
    }



    // Create default settings if none exists
    const settingsCheck = await pool.query('SELECT * FROM settings LIMIT 1');
    if (settingsCheck.rows.length === 0) {
      const defaultClauses = {
        ownership: 'Upon full payment, the Freelancer transfers all intellectual property rights to the Client. The Developer retains the right to showcase completed work in portfolios and presentations.',
        confidentiality: 'Both parties agree to keep all project information, access credentials, and trade secrets strictly confidential.',
        liability: 'The Developer shall not be liable for any indirect, incidental, business loss, revenue loss, data loss, security breaches caused by third parties, or third-party service limitations.',
        intellectualProperty: 'All tools, pre-existing component codes, or template assets remain the property of the Developer.',
        projectScope: 'The project includes only the features, pages, integrations, and deliverables specifically mentioned in the approved quotation. Additional requests shall be treated as change requests.',
        clientResponsibilities: 'The client shall provide all necessary content, images, business credentials, and approvals in a timely manner. Delays may impact project timeline.',
        thirdPartyDisclaimer: 'The developer is not responsible for pricing changes, downtime, service interruptions, or limitations imposed by third-party hosting/API providers.',
        maintenancePlans: 'Essential Plan (₹299/mo or ₹2,999/yr): Includes uptime monitoring, minor updates, basic maintenance, and domain renewal assistance. Premium Plan (₹549/mo or ₹5,499/yr): Includes everything in Essential, priority support, regular security monitoring, and performance checks.'
      };
      await pool.query(`
        INSERT INTO settings (
          freelancer_name, freelancer_email, default_revision_count, default_payment_terms, default_agreement_clauses
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        'Shivansh Saxena',
        'shivanshsaxena03102006@gmail.com',
        3,
        '30% upfront deposit, 30% on Design Approval, 30% on Development Completion, 10% upon Final Handover.',
        JSON.stringify(defaultClauses)
      ]);
      console.log('Created default Settings profile.');
    }


    console.log('Database schema check complete.');
  } catch (error) {
    console.error('Failed to initialize database schemas:', error);
    throw error;
  }
}
