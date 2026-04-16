import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const members = db.prepare('SELECT * FROM members ORDER BY name COLLATE NOCASE').all();
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, role } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const stmt = db.prepare('INSERT OR REPLACE INTO members (name, role) VALUES (?, ?)');
    stmt.run(name, role);
    
    return NextResponse.json({ message: 'Member updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    db.prepare('DELETE FROM members WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Member removed' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
