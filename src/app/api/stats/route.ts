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
    const clientsCount = await pool.query('SELECT COUNT(*) as count FROM clients WHERE user_id = $1', [userId]);
    const quotationsCount = await pool.query("SELECT COUNT(*) as count FROM documents WHERE type = 'quotation' AND user_id = $1", [userId]);
    const agreementsCount = await pool.query("SELECT COUNT(*) as count FROM documents WHERE type = 'agreement' AND user_id = $1", [userId]);
    const invoicesCount = await pool.query("SELECT COUNT(*) as count FROM documents WHERE type = 'invoice' AND user_id = $1", [userId]);
    const handoversCount = await pool.query("SELECT COUNT(*) as count FROM documents WHERE type = 'handover' AND user_id = $1", [userId]);

    const recentClients = await pool.query('SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [userId]);
    const recentDocs = await pool.query(`
      SELECT d.*, c.name as client_name
      FROM documents d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.user_id = $1
      ORDER BY d.updated_at DESC LIMIT 5
    `, [userId]);

    return NextResponse.json({
      success: true,
      stats: {
        clients: parseInt(clientsCount.rows[0].count),
        quotations: parseInt(quotationsCount.rows[0].count),
        agreements: parseInt(agreementsCount.rows[0].count),
        invoices: parseInt(invoicesCount.rows[0].count),
        handovers: parseInt(handoversCount.rows[0].count)
      },
      recentClients: recentClients.rows,
      recentDocuments: recentDocs.rows
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
