import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = (await import('@/lib/db')).default;
    const members = db.prepare('SELECT * FROM members ORDER BY name COLLATE NOCASE').all();
    console.log(`Fetched ${members.length} members from DB`);
    return NextResponse.json(members);
  } catch (error) {
    console.error('GET Members Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = (await import('@/lib/db')).default;
    const { name, role } = await request.json();
    console.log('Adding member:', { name, role });
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const stmt = db.prepare('INSERT OR REPLACE INTO members (name, role) VALUES (?, ?)');
    const info = stmt.run(name, role);
    console.log('Member saved:', info);
    
    return NextResponse.json({ message: 'Member updated successfully' });
  } catch (error) {
    console.error('POST Member Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = (await import('@/lib/db')).default;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('Deleting member ID:', id);
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const info = db.prepare('DELETE FROM members WHERE id = ?').run(id);
    console.log('Member deleted:', info);
    return NextResponse.json({ message: 'Member removed' });
  } catch (error) {
    console.error('DELETE Member Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
