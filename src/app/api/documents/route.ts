import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const clientId = searchParams.get('clientId');
    const search = searchParams.get('search');

    let queryStr = `
      SELECT d.*, c.name as client_name, c.company_name as client_company
      FROM documents d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.user_id = $1 AND (d.is_deleted = FALSE OR d.is_deleted IS NULL)
    `;
    const params: any[] = [userId];

    if (type) {
      params.push(type);
      queryStr += ` AND d.type = $${params.length}`;
    }

    if (clientId) {
      params.push(clientId);
      queryStr += ` AND d.client_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryStr += ` AND (d.title ILIKE $${params.length} OR d.document_id ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
    }

    queryStr += ` ORDER BY d.updated_at DESC`;

    const res = await pool.query(queryStr, params);
    return NextResponse.json({ success: true, data: res.rows });
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
    const { document_id, client_id, type, title, content, status } = body;

    // Check if document exists for version tracking
    const existCheck = await pool.query('SELECT id, version FROM documents WHERE document_id = $1 AND user_id = $2', [document_id, userId]);

    let res;
    if (existCheck.rows.length > 0) {
      const currentDoc = existCheck.rows[0];
      const nextVersion = currentDoc.version + 1;

      // Update document
      res = await pool.query(
        `UPDATE documents
         SET client_id = $1, title = $2, content = $3, status = $4, version = $5, is_deleted = FALSE, updated_at = CURRENT_TIMESTAMP
         WHERE document_id = $6 AND user_id = $7 RETURNING *`,
        [client_id, title, JSON.stringify(content), status || 'draft', nextVersion, document_id, userId]
      );

      // Save version copy
      await pool.query(
        `INSERT INTO document_versions (user_id, document_id, version, content)
         VALUES ($1, $2, $3, $4)`,
        [userId, document_id, nextVersion, JSON.stringify(content)]
      );

      // Activity Log
      await pool.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'update_document', `Updated document ${document_id} (${type}) to version ${nextVersion}`]
      );
    } else {
      // Insert new document
      res = await pool.query(
        `INSERT INTO documents (user_id, document_id, client_id, type, title, content, version, status)
         VALUES ($1, $2, $3, $4, $5, $6, 1, $7) RETURNING *`,
        [userId, document_id, client_id, type, title, JSON.stringify(content), status || 'draft']
      );

      // Save version 1 copy
      await pool.query(
        `INSERT INTO document_versions (user_id, document_id, version, content)
         VALUES ($1, $2, 1, $3)`,
        [userId, document_id, JSON.stringify(content)]
      );

      // Activity Log
      await pool.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'create_document', `Created new document: ${document_id} (${type})`]
      );
    }

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ success: false, error: 'Document ID is required' }, { status: 400 });
    }

    await pool.query('UPDATE documents SET is_deleted = TRUE WHERE document_id = $1 AND user_id = $2', [documentId, userId]);

    // Activity Log
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'delete_document', `Deleted document ID: ${documentId}`]
    );

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
