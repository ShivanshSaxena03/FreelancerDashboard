import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const { documentId } = await params;

    const res = await pool.query(
      `SELECT d.*, c.name as client_name, c.company_name as client_company
       FROM documents d
       LEFT JOIN clients c ON d.client_id = c.id
       WHERE d.document_id = $1`,
      [documentId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
