import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool from './db';
import { sendEmail } from './email';
import { initDb } from './init-db';


export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@example.com' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP Code', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        // Auto initialize schemas to prevent missing tables errors
        try {
          await initDb();
        } catch (initErr) {
          console.error('Auto schema init failed:', initErr);
        }

        // Fetch user from DB
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [credentials.email]);
        const user = res.rows[0];

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          throw new Error('Incorrect password');
        }

        // Enforce OTP Code Check
        if (!credentials?.otp) {
          throw new Error('Verification code is required');
        }

        const otpCheck = await pool.query(
          'SELECT * FROM otps WHERE email = $1 AND code = $2 AND expires_at > NOW()',
          [credentials.email, credentials.otp]
        );

        if (otpCheck.rows.length === 0) {
          throw new Error('Invalid or expired verification code');
        }

        // Delete used OTP
        await pool.query('DELETE FROM otps WHERE email = $1', [credentials.email]);


        // Record activity log & trigger email alert asynchronously
        try {
          await pool.query(
            'INSERT INTO activity_logs (action, details) VALUES ($1, $2)',
            ['login', `User logged in: ${user.email}`]
          );

          // Send notification email alert
          await sendEmail({
            to: process.env.NOTIFY_EMAIL || user.email,
            subject: 'Freelancer Dashboard: Login Alert',
            html: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #000; font-weight: 700;">Login Notification</h2>
                <p>Hello,</p>
                <p>A login was recorded for the account: <strong>${user.email}</strong></p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">If this wasn't you, please secure your credentials immediately.</p>
              </div>
            `
          });
        } catch (e) {
          console.error('Error handling post-login processes', e);
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 60 * 60, // 1 hour session duration
  },
  secret: process.env.NEXTAUTH_SECRET,
};

