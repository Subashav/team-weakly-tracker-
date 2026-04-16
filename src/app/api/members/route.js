import { NextResponse } from 'next/server';
import sql, { initDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDatabase();
    const { rows } = await sql`SELECT * FROM members ORDER BY name ASC`;
    console.log(`Fetched ${rows.length} members from Postgres`);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET Members Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, role } = await request.json();
    console.log('Adding member:', { name, role });
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    await initDatabase();
    
    // Postgres UPSERT syntax
    await sql`
      INSERT INTO members (name, role)
      VALUES (${name}, ${role})
      ON CONFLICT (name) DO UPDATE SET role = EXCLUDED.role
    `;
    
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
    console.log('Deleting member ID:', id);
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await sql`DELETE FROM members WHERE id = ${id}`;
    return NextResponse.json({ message: 'Member removed' });
  } catch (error) {
    console.error('DELETE Member Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
