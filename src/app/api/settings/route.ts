import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const settings = await pool.query('SELECT * FROM settings ORDER BY id DESC LIMIT 1');
    return NextResponse.json({ success: true, data: settings.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    // Check if configuration profile exists, update or insert
    const existCheck = await pool.query('SELECT id FROM settings LIMIT 1');

    let res;
    if (existCheck.rows.length > 0) {
      const id = existCheck.rows[0].id;
      res = await pool.query(
        `UPDATE settings
         SET freelancer_name = $1, freelancer_email = $2, phone_number = $3, address = $4,
             portfolio_link = $5, signature_url = $6, logo_url = $7, default_revision_count = $8,
             default_payment_terms = $9, default_agreement_clauses = $10, updated_at = CURRENT_TIMESTAMP
         WHERE id = $11 RETURNING *`,
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
          id
        ]
      );
    } else {
      res = await pool.query(
        `INSERT INTO settings (
          freelancer_name, freelancer_email, phone_number, address, portfolio_link,
          signature_url, logo_url, default_revision_count, default_payment_terms, default_agreement_clauses
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
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
          JSON.stringify(default_agreement_clauses)
        ]
      );
    }

    // Activity Log
    await pool.query(
      'INSERT INTO activity_logs (action, details) VALUES ($1, $2)',
      ['update_settings', 'Updated settings and defaults']
    );

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
