import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    // Verify user credentials first
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = res.rows[0];

    if (!user) {
      return NextResponse.json({ success: false, error: 'No user found with this email' }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Remove any previous OTPs for this email to prevent spam
    await pool.query('DELETE FROM otps WHERE email = $1', [email]);

    // Insert new OTP record
    await pool.query(
      'INSERT INTO otps (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, otpCode, expiresAt]
    );

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'Freelancer Dashboard: Login Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 25px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 450px; margin: 0 auto; color: #111;">
          <h2 style="color: #000; font-weight: 700; font-size: 18px; margin-bottom: 20px;">Verification Code Required</h2>
          <p style="font-size: 13px; color: #444;">Please use the following 6-digit verification code to complete your login process:</p>
          <div style="background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px; padding: 15px; text-align: center; margin: 25px 0;">
            <span style="font-family: monospace; font-size: 26px; font-weight: bold; letter-spacing: 6px; color: #000;">${otpCode}</span>
          </div>
          <p style="font-size: 11px; color: #888;">This code is valid for the next 5 minutes. If you did not request this login, please change your credentials immediately.</p>
        </div>
      `
    });

    // Success response to transition UI to verification stage
    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('OTP Send error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
