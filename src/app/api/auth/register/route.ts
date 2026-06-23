import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name, otp } = await request.json();

    if (!email || !password || !name || !otp) {
      return NextResponse.json({ success: false, error: 'All fields including name, email, password, and OTP are required' }, { status: 400 });
    }

    // 1. Verify OTP
    const otpCheck = await pool.query(
      "SELECT * FROM otps WHERE email = $1 AND code = $2 AND type = 'register' AND expires_at > NOW()",
      [email, otp]
    );

    if (otpCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid or expired registration code' }, { status: 400 });
    }

    // 2. Clear OTP
    await pool.query("DELETE FROM otps WHERE email = $1 AND type = 'register'", [email]);

    // 3. Hash Password & Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
      [email, hashedPassword, name, 'user']
    );

    const newUser = userRes.rows[0];

    // Seed default settings for the new user profile
    const defaultClauses = {
      ownership: 'Upon full payment, the Freelancer transfers all intellectual property rights to the Client. The Developer retains the right to showcase completed work in portfolios.',
      confidentiality: 'Both parties agree to keep all project information and trade secrets confidential.',
      liability: 'The Developer shall not be liable for any indirect, incidental, or business losses.',
      intellectualProperty: 'All tools, component codes, or template assets remain the property of the Developer.'
    };
    
    await pool.query(
      `INSERT INTO settings (user_id, freelancer_name, freelancer_email, default_revision_count, default_payment_terms, default_agreement_clauses)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [newUser.id, name, email, 3, '50% upfront, 50% upon project completion.', JSON.stringify(defaultClauses)]
    );

    // Activity Log
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [newUser.id, 'register', `New user registered: ${email}`]
    );

    return NextResponse.json({ success: true, message: 'User registered successfully. You can now log in.' });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
