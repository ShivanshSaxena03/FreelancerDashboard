import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized system access' }, { status: 403 });
    }

    // 1. Fetch system users
    const usersRes = await pool.query(`
      SELECT id, email, name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    // 2. Fetch metrics
    const metricsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM clients) as total_clients,
        (SELECT COUNT(*) FROM documents) as total_documents,
        (SELECT COUNT(*) FROM activity_logs WHERE action = 'login') as total_logins
    `);

    // 3. User activity distributions
    const distributionRes = await pool.query(`
      SELECT 
        u.email,
        u.name,
        u.created_at as registered_at,
        COUNT(DISTINCT c.id) as clients_count,
        COUNT(DISTINCT d.id) as documents_count
      FROM users u
      LEFT JOIN clients c ON c.user_id = u.id
      LEFT JOIN documents d ON d.user_id = u.id
      GROUP BY u.id, u.email, u.name, u.created_at
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      metrics: metricsRes.rows[0],
      users: usersRes.rows,
      activities: distributionRes.rows
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action, email } = body;

    if (action === 'create') {
      const { name, password } = body;
      if (!email || !password || !name) {
        return NextResponse.json({ success: false, error: 'Name, email, and password are required' }, { status: 400 });
      }

      // Check if email already registered
      const existCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existCheck.rows.length > 0) {
        return NextResponse.json({ success: false, error: 'A user with this email address already exists' }, { status: 400 });
      }

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user profile
      const userRes = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING id, email, name",
        [name, email, hashedPassword]
      );
      const newUser = userRes.rows[0];

      // Seed default settings for the newly created user
      const defaultClauses = {
        ownership: 'Upon full payment, the Freelancer transfers all intellectual property rights to the Client.',
        confidentiality: 'Both parties agree to keep all project information confidential.',
        liability: 'The Developer shall not be liable for any business loss.',
        intellectualProperty: 'All templates remain the property of the Developer.'
      };
      await pool.query(
        `INSERT INTO settings (user_id, freelancer_name, freelancer_email, default_revision_count, default_payment_terms, default_agreement_clauses)
         VALUES ($1, $2, $3, 3, '50% upfront, 50% upon project completion.', $4)`,
        [newUser.id, name, email, JSON.stringify(defaultClauses)]
      );

      // Log actions
      await pool.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [session.user.id, 'admin_create_user', `Admin created user: ${email}`]
      );

      return NextResponse.json({ success: true, message: 'User created successfully' });
    }

    // Default action: Delete
    const { reason } = body;
    if (!email || !reason) {
      return NextResponse.json({ success: false, error: 'Email and reason are required for removal' }, { status: 400 });
    }

    // Get user details before deletion
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'admin') {
      return NextResponse.json({ success: false, error: 'Cannot remove administrator user' }, { status: 400 });
    }

    // Delete user (cascade settings will automatically drop matching client/doc files)
    await pool.query('DELETE FROM users WHERE email = $1', [email]);

    // Send email alert to user notifying deletion with reason
    await sendEmail({
      to: email,
      subject: 'Freelancer OS: Account Deactivation Notice',
      html: `
        <div style="font-family: sans-serif; padding: 25px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 480px; margin: 0 auto; color: #111;">
          <h2 style="color: #ea4335; font-weight: 700; font-size: 18px; margin-bottom: 20px;">Account Deactivated</h2>
          <p style="font-size: 13px; color: #444;">Hello ${user.name || 'User'},</p>
          <p style="font-size: 13px; color: #444;">We are writing to notify you that your Freelancer OS workspace account has been deactivated and removed by the system administrator.</p>
          
          <div style="background-color: #fafafa; border-left: 3px solid #ea4335; padding: 12px 15px; margin: 20px 0; font-size: 13px; color: #555; font-style: italic;">
            <strong>Reason for Removal:</strong><br />
            ${reason}
          </div>

          <p style="font-size: 11px; color: #888;">If you believe this is a mistake or have questions, please reach out to the platform administrator.</p>
        </div>
      `
    });

    // Log deletion action
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [session.user.id, 'delete_user', `Admin removed user: ${email}. Reason: ${reason}`]
    );

    return NextResponse.json({ success: true, message: 'User account removed and deactivation email sent.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
