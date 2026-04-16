import { NextResponse } from 'next/server';
import pool, { initDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const nameParam = searchParams.get('name');
    const isAdmin = searchParams.get('admin') === 'true';

    let result;
    if (isAdmin) {
      if (nameParam && nameParam !== 'All Members') {
        result = await pool.query(
          'SELECT * FROM tasks WHERE (roll_no = $1 OR project_name ILIKE $2) ORDER BY week_date DESC, created_at DESC',
          [nameParam, `%${nameParam}%`]
        );
      } else {
        result = await pool.query('SELECT * FROM tasks ORDER BY week_date DESC, created_at DESC');
      }
    } else {
      if (nameParam && nameParam !== 'All Members') {
        result = await pool.query(
          'SELECT * FROM tasks WHERE is_hidden = 0 AND (roll_no = $1 OR project_name ILIKE $2) ORDER BY week_date DESC, created_at DESC',
          [nameParam, `%${nameParam}%`]
        );
      } else {
        result = await pool.query('SELECT * FROM tasks WHERE is_hidden = 0 ORDER BY week_date DESC, created_at DESC');
      }
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET Tasks Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const tasks = Array.isArray(body) ? body : [body];
    await initDatabase();

    for (const task of tasks) {
      const isNew = !task.id || task.id > 1000000000000;
      if (isNew) {
        await pool.query(
          'INSERT INTO tasks (roll_no, task_description, skill_applied, project_name, progress, proof, week_date, is_hidden) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [task.roll_no, task.task_description, task.skill_applied, task.project_name, task.progress, task.proof, task.week_date, task.is_hidden ? 1 : 0]
        );
      } else {
        await pool.query(
          `INSERT INTO tasks (id, roll_no, task_description, skill_applied, project_name, progress, proof, week_date, is_hidden)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             roll_no = EXCLUDED.roll_no,
             task_description = EXCLUDED.task_description,
             skill_applied = EXCLUDED.skill_applied,
             project_name = EXCLUDED.project_name,
             progress = EXCLUDED.progress,
             proof = EXCLUDED.proof,
             week_date = EXCLUDED.week_date,
             is_hidden = EXCLUDED.is_hidden`,
          [task.id, task.roll_no, task.task_description, task.skill_applied, task.project_name, task.progress, task.proof, task.week_date, task.is_hidden ? 1 : 0]
        );
      }
    }

    return NextResponse.json({ message: 'Tasks updated successfully' });
  } catch (error) {
    console.error('POST Tasks Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('DELETE Task Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
