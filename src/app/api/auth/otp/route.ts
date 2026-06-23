import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, type } = await request.json();
    const actionType = type || 'login'; // 'login' or 'register'

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address format' }, { status: 400 });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    if (actionType === 'login') {
      if (!password) {
        return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
      }

      // Verify user credentials first
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [sanitizedEmail]);
      const user = res.rows[0];

      if (!user) {
        return NextResponse.json({ success: false, error: 'No user found with this email' }, { status: 401 });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
      }
    } else if (actionType === 'register') {
      // Check if user already exists
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [sanitizedEmail]);
      if (res.rows.length > 0) {
        return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 400 });
      }
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Remove any previous OTPs for this email to prevent spam
    await pool.query('DELETE FROM otps WHERE email = $1 AND type = $2', [sanitizedEmail, actionType]);

    // Insert new OTP record
    await pool.query(
      'INSERT INTO otps (email, code, type, expires_at) VALUES ($1, $2, $3, $4)',
      [sanitizedEmail, otpCode, actionType, expiresAt]
    );

    // Send OTP email
    await sendEmail({
      to: sanitizedEmail,
      subject: `Freelancer OS: Verification Code for ${actionType === 'register' ? 'Registration' : 'Login'}`,
      html: `
        <div style="font-family: sans-serif; padding: 25px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 450px; margin: 0 auto; color: #111;">
          <h2 style="color: #000; font-weight: 700; font-size: 18px; margin-bottom: 20px;">Verification Code Required</h2>
          <p style="font-size: 13px; color: #444;">Please use the following 6-digit verification code to complete your ${actionType === 'register' ? 'registration' : 'login'} process:</p>
          <div style="background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px; padding: 15px; text-align: center; margin: 25px 0;">
            <span style="font-family: monospace; font-size: 26px; font-weight: bold; letter-spacing: 6px; color: #000;">${otpCode}</span>
          </div>
          <p style="font-size: 11px; color: #888;">This code is valid for the next 5 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('OTP Send error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
