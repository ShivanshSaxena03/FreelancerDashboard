import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const settings = await pool.query('SELECT * FROM settings WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [userId]);
    return NextResponse.json({ success: true, data: settings.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const {
      freelancer_name,
      freelancer_email,
      phone_number,
      address,
      portfolio_link,
      signature_url,
      logo_url,
      default_revision_count,
      default_payment_terms,
      default_agreement_clauses
    } = body;

    if (phone_number && !/^\d{10}$/.test(phone_number)) {
      return NextResponse.json({ success: false, error: 'Contact number must be exactly 10 digits' }, { status: 400 });
    }

    // Check if configuration profile exists for this tenant, update or insert
    const existCheck = await pool.query('SELECT id FROM settings WHERE user_id = $1 LIMIT 1', [userId]);

    let res;
    if (existCheck.rows.length > 0) {
      const id = existCheck.rows[0].id;
      res = await pool.query(
        `UPDATE settings
         SET freelancer_name = $1, freelancer_email = $2, phone_number = $3, address = $4,
             portfolio_link = $5, signature_url = $6, logo_url = $7, default_revision_count = $8,
             default_payment_terms = $9, default_agreement_clauses = $10, updated_at = CURRENT_TIMESTAMP
         WHERE id = $11 AND user_id = $12 RETURNING *`,
        [
          freelancer_name,
          freelancer_email,
          phone_number,
          address,
          portfolio_link,
          signature_url,
          logo_url,
          default_revision_count,
          default_payment_terms,
          JSON.stringify(default_agreement_clauses),
          id,
          userId
        ]
      );
    } else {
      res = await pool.query(
        `INSERT INTO settings (
          user_id, freelancer_name, freelancer_email, phone_number, address, portfolio_link,
          signature_url, logo_url, default_revision_count, default_payment_terms, default_agreement_clauses
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          userId,
          freelancer_name,
          freelancer_email,
          phone_number,
          address,
          portfolio_link,
          signature_url,
          logo_url,
          default_revision_count,
          default_payment_terms,
          JSON.stringify(default_agreement_clauses)
        ]
      );
    }

    // Activity Log
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'update_settings', 'Updated settings and defaults']
    );

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
