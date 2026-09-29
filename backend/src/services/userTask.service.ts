import { pool, query } from '../db';
import { BadRequestError } from '../errors/appError';

export interface SelectedTask {
    id: string;
    task_id: string;
    name: string;
    description: string;
    category_id: string;
    category_name: string;
    category_slug: string;
    selected_at: string;
}

export class UserTaskService {
    /**
     * Fetch all tasks selected by a user
     */
    public async getUserSelectedTasks(userId: string): Promise<SelectedTask[]> {
        const sql = `
      SELECT ust.id, ust.task_id, t.name, t.description, t.category_id,
             c.name as category_name, c.slug as category_slug, ust.created_at as selected_at
      FROM user_selected_tasks ust
      JOIN tasks t ON ust.task_id = t.id
      JOIN task_categories c ON t.category_id = c.id
      WHERE ust.user_id = $1
      ORDER BY c.name ASC, t.name ASC
    `;
        const res = await query(sql, [userId]);
        return res.rows;
    }

    /**
     * Replaces user's selected tasks in a database transaction after validating task IDs
     */
    public async saveUserSelectedTasks(userId: string, taskIds: string[]): Promise<SelectedTask[]> {
        if (!Array.isArray(taskIds)) {
            throw new BadRequestError('taskIds must be an array of UUIDs');
        }

        // Deduplicate IDs
        const uniqueTaskIds = Array.from(new Set(taskIds.map(id => String(id).trim()).filter(Boolean)));

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const invalidFormatIds = uniqueTaskIds.filter(id => !uuidRegex.test(id));
        if (invalidFormatIds.length > 0) {
            throw new BadRequestError(`Invalid task ID format: ${invalidFormatIds.join(', ')}`);
        }

        if (uniqueTaskIds.length > 0) {
            // Validate all task IDs exist in database
            const checkSql = 'SELECT id FROM tasks WHERE id = ANY($1::uuid[])';
            const checkRes = await query(checkSql, [uniqueTaskIds]);

            const foundIds = new Set(checkRes.rows.map((r: { id: string }) => r.id));
            const invalidIds = uniqueTaskIds.filter(id => !foundIds.has(id));

            if (invalidIds.length > 0) {
                throw new BadRequestError(`Invalid task ID(s) provided: ${invalidIds.join(', ')}`);
            }
        }

        // Transaction execution
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Clear previous selections for this user
            await client.query('DELETE FROM user_selected_tasks WHERE user_id = $1', [userId]);

            // 2. Insert new selections if any
            if (uniqueTaskIds.length > 0) {
                const insertValues = uniqueTaskIds.map((taskId, index) => `($1, $${index + 2})`).join(', ');
                const insertSql = `INSERT INTO user_selected_tasks (user_id, task_id) VALUES ${insertValues}`;
                await client.query(insertSql, [userId, ...uniqueTaskIds]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        return this.getUserSelectedTasks(userId);
    }
}

export const userTaskService = new UserTaskService();
