import { NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET: Retrieve tasks with optional filtering
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');
    const name = searchParams.get('name');
    const isAdmin = searchParams.get('admin') === 'true';

    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (!isAdmin) {
      query += ' AND is_hidden = 0';
    }

    if (week) {
      query += ' AND week_date = ?';
      params.push(week);
    }
    if (name) {
      query += ' AND (roll_no = ? OR project_name LIKE ?)';
      params.push(name, `%${name}%`);
    }

    query += ' ORDER BY week_date DESC, created_at DESC';
    const tasks = db.prepare(query).all(...params);
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Save or update tasks (Upsert logic)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const tasks = Array.isArray(body) ? body : [body];

    const upsert = db.prepare(`
      INSERT INTO tasks (id, roll_no, task_description, skill_applied, project_name, progress, proof, week_date, is_hidden)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        roll_no = excluded.roll_no,
        task_description = excluded.task_description,
        skill_applied = excluded.skill_applied,
        project_name = excluded.project_name,
        progress = excluded.progress,
        proof = excluded.proof,
        week_date = excluded.week_date,
        is_hidden = excluded.is_hidden
    `);

    const transaction = db.transaction((taskList) => {
      for (const task of taskList) {
        const id = typeof task.id === 'string' || task.id > 1000000000000 ? null : task.id;
        upsert.run(
          id,
          task.roll_no,
          task.task_description,
          task.skill_applied,
          task.project_name,
          task.progress,
          task.proof,
          task.week_date,
          task.is_hidden ? 1 : 0
        );
      }
    });

    transaction(tasks);
    return NextResponse.json({ message: 'Tasks updated successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove a task by ID
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
