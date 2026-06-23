import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const clients = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    return NextResponse.json({ success: true, data: clients.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company_name, contact_number, email, address, project_type, project_description } = body;

    const res = await pool.query(
      `INSERT INTO clients (name, company_name, contact_number, email, address, project_type, project_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, company_name, contact_number, email, address, project_type, project_description]
    );

    // Activity Log
    await pool.query(
      'INSERT INTO activity_logs (action, details) VALUES ($1, $2)',
      ['create_client', `Created client profile for: ${name} (${company_name})`]
    );

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Client ID is required' }, { status: 400 });
    }

    // Delete corresponding client
    await pool.query('DELETE FROM clients WHERE id = $1', [id]);

    // Activity Log
    await pool.query(
      'INSERT INTO activity_logs (action, details) VALUES ($1, $2)',
      ['delete_client', `Deleted client profile ID: ${id}`]
    );

    return NextResponse.json({ success: true, message: 'Client profile deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
