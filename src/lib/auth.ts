import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import pool from './db';
import { sendEmail } from './email';
import { initDb } from './init-db';

export const authOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
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
          "SELECT * FROM otps WHERE email = $1 AND code = $2 AND type = 'login' AND expires_at > NOW()",
          [credentials.email, credentials.otp]
        );

        if (otpCheck.rows.length === 0) {
          throw new Error('Invalid or expired verification code');
        }

        // Delete used OTP
        await pool.query("DELETE FROM otps WHERE email = $1 AND type = 'login'", [credentials.email]);

        // Record activity log & trigger email alert asynchronously
        try {
          await pool.query(
            'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
            [user.id, 'login', `User logged in: ${user.email}`]
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
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        try {
          await initDb();
          // Check if user exists in the database
          const checkRes = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);
          let dbUser = checkRes.rows[0];

          if (!dbUser) {
            // Create a user record if none exists for this Google Account
            const insertRes = await pool.query(
              'INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING *',
              [user.email, user.name, 'user']
            );
            dbUser = insertRes.rows[0];

            // Seed default settings for Google login user profile
            const defaultClauses = {
              ownership: 'Upon full payment, the Freelancer transfers all intellectual property rights to the Client.',
              confidentiality: 'Both parties agree to keep all project information confidential.',
              liability: 'The Developer shall not be liable for any business loss.',
              intellectualProperty: 'All templates remain the property of the Developer.'
            };
            await pool.query(
              `INSERT INTO settings (user_id, freelancer_name, freelancer_email, default_revision_count, default_payment_terms, default_agreement_clauses)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [dbUser.id, user.name, user.email, 3, '50% upfront, 50% upon project completion.', JSON.stringify(defaultClauses)]
            );
          }

          user.id = dbUser.id.toString();
          user.role = dbUser.role;
          return true;
        } catch (err) {
          console.error('Google OAuth signin DB error:', err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Check if user still exists to enforce deactivation/session suspension
      if (token?.id) {
        try {
          const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [token.id]);
          if (userCheck.rows.length === 0) {
            return null; // Forces token invalidation
          }
        } catch (dbErr) {
          console.error('Error validating token user:', dbErr);
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (!token) return null; // Invalidate session if token is nullified
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 60 * 60, // 1 hour session duration
  },
  secret: process.env.NEXTAUTH_SECRET,
};
