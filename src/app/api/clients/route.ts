import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { initDb } from '@/lib/init-db';

export async function GET() {
  try {
    await initDb();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const clients = await pool.query(
      'SELECT * FROM clients WHERE user_id = $1 AND (is_deleted = FALSE OR is_deleted IS NULL) ORDER BY created_at DESC',
      [userId]
    );
    return NextResponse.json({ success: true, data: clients.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, company_name, contact_number, email, address, project_type, project_description, id } = body;

    let res;
    if (id) {
      // Edit Client profile
      res = await pool.query(
        `UPDATE clients
         SET name = $1, company_name = $2, contact_number = $3, email = $4, address = $5,
             project_type = $6, project_description = $7, is_deleted = FALSE, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 AND user_id = $9 RETURNING *`,
        [name, company_name, contact_number, email, address, project_type, project_description, id, userId]
      );

      await pool.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'update_client', `Updated client profile: ${name}`]
      );
    } else {
      // Create Client profile
      res = await pool.query(
        `INSERT INTO clients (user_id, name, company_name, contact_number, email, address, project_type, project_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [userId, name, company_name, contact_number, email, address, project_type, project_description]
      );

      await pool.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'create_client', `Created client profile: ${name}`]
      );
    }

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initDb();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Client ID is required' }, { status: 400 });
    }

    await pool.query('UPDATE clients SET is_deleted = TRUE WHERE id = $1 AND user_id = $2', [id, userId]);

    await pool.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'delete_client', `Deleted client profile ID: ${id}`]
    );

    return NextResponse.json({ success: true, message: 'Client profile deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
