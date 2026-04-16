import { NextResponse } from 'next/server';
import pool, { initDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDatabase();
    const { rows } = await pool.query('SELECT * FROM members ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET Members Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, role } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    await initDatabase();
    
    // Postgres UPSERT syntax for pg library
    await pool.query(
      'INSERT INTO members (name, role) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET role = EXCLUDED.role',
      [name, role]
    );
    
    return NextResponse.json({ message: 'Member updated successfully' });
  } catch (error) {
    console.error('POST Member Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await pool.query('DELETE FROM members WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Member removed' });
  } catch (error) {
    console.error('DELETE Member Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
