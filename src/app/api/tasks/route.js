import { NextResponse } from 'next/server';
import sql, { initDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET: Retrieve tasks with optional filtering
 */
export async function GET(request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const nameParam = searchParams.get('name');
    const isAdmin = searchParams.get('admin') === 'true';

    let rows;
    if (isAdmin) {
      if (nameParam && nameParam !== 'All Members') {
        const { rows: filtered } = await sql`
          SELECT * FROM tasks 
          WHERE (roll_no = ${nameParam} OR project_name ILIKE ${`%${nameParam}%`}) 
          ORDER BY week_date DESC, created_at DESC
        `;
        rows = filtered;
      } else {
        const { rows: all } = await sql`SELECT * FROM tasks ORDER BY week_date DESC, created_at DESC`;
        rows = all;
      }
    } else {
      // Viewer mode: only visible tasks
      if (nameParam && nameParam !== 'All Members') {
        const { rows: filtered } = await sql`
          SELECT * FROM tasks 
          WHERE is_hidden = 0 AND (roll_no = ${nameParam} OR project_name ILIKE ${`%${nameParam}%`}) 
          ORDER BY week_date DESC, created_at DESC
        `;
        rows = filtered;
      } else {
        const { rows: all } = await sql`SELECT * FROM tasks WHERE is_hidden = 0 ORDER BY week_date DESC, created_at DESC`;
        rows = all;
      }
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET Tasks Error:', error);
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
    await initDatabase();

    for (const task of tasks) {
      // If task.id is very large (Date.now()) or null, treat as new INSERT
      const isNew = !task.id || task.id > 1000000000000;

      if (isNew) {
        await sql`
          INSERT INTO tasks (roll_no, task_description, skill_applied, project_name, progress, proof, week_date, is_hidden)
          VALUES (${task.roll_no}, ${task.task_description}, ${task.skill_applied}, ${task.project_name}, ${task.progress}, ${task.proof}, ${task.week_date}, ${task.is_hidden ? 1 : 0})
        `;
      } else {
        await sql`
          INSERT INTO tasks (id, roll_no, task_description, skill_applied, project_name, progress, proof, week_date, is_hidden)
          VALUES (${task.id}, ${task.roll_no}, ${task.task_description}, ${task.skill_applied}, ${task.project_name}, ${task.progress}, ${task.proof}, ${task.week_date}, ${task.is_hidden ? 1 : 0})
          ON CONFLICT (id) DO UPDATE SET
            roll_no = EXCLUDED.roll_no,
            task_description = EXCLUDED.task_description,
            skill_applied = EXCLUDED.skill_applied,
            project_name = EXCLUDED.project_name,
            progress = EXCLUDED.progress,
            proof = EXCLUDED.proof,
            week_date = EXCLUDED.week_date,
            is_hidden = EXCLUDED.is_hidden
        `;
      }
    }

    return NextResponse.json({ message: 'Tasks updated successfully' });
  } catch (error) {
    console.error('POST Tasks Error:', error);
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

    await sql`DELETE FROM tasks WHERE id = ${id}`;
    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('DELETE Task Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
