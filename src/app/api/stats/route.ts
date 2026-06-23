import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const clientsCount = await pool.query('SELECT COUNT(*) as count FROM clients');
    const quotationsCount = await pool.query("SELECT COUNT(*) as count FROM documents WHERE type = 'quotation'");
    const agreementsCount = await pool.query("SELECT COUNT(*) as count FROM documents WHERE type = 'agreement'");
    const invoicesCount = await pool.query("SELECT COUNT(*) as count FROM documents WHERE type = 'invoice'");
    const handoversCount = await pool.query("SELECT COUNT(*) as count FROM documents WHERE type = 'handover'");

    const recentClients = await pool.query('SELECT * FROM clients ORDER BY created_at DESC LIMIT 5');
    const recentDocs = await pool.query(`
      SELECT d.*, c.name as client_name
      FROM documents d
      LEFT JOIN clients c ON d.client_id = c.id
      ORDER BY d.updated_at DESC LIMIT 5
    `);

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
