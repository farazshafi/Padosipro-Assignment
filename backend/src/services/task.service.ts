import { query } from '../db';

export interface TaskCategory {
    id: string;
    name: string;
    slug: string;
    description: string;
}

export interface TaskItem {
    id: string;
    category_id: string;
    category_name: string;
    category_slug: string;
    name: string;
    description: string;
    created_at: string;
}

export interface CategoryWithTasks extends TaskCategory {
    tasks: TaskItem[];
}

export class TaskService {
    /**
     * Fetch all categories
     */
    public async getCategories(): Promise<TaskCategory[]> {
        const res = await query('SELECT id, name, slug, description FROM task_categories ORDER BY name ASC');
        return res.rows;
    }

    /**
     * Fetch task catalogue with optional category filter and search query
     */
    public async getCatalogue(categorySlugOrId?: string, searchQuery?: string): Promise<CategoryWithTasks[]> {
        const categories = await this.getCategories();

        let sql = `
      SELECT t.id, t.category_id, t.name, t.description, t.created_at,
             c.name as category_name, c.slug as category_slug
      FROM tasks t
      JOIN task_categories c ON t.category_id = c.id
      WHERE 1=1
    `;
        const params: any[] = [];

        if (categorySlugOrId && categorySlugOrId.trim() !== '') {
            params.push(categorySlugOrId.trim());
            sql += ` AND (c.slug = $${params.length} OR c.id::text = $${params.length})`;
        }

        if (searchQuery && searchQuery.trim() !== '') {
            params.push(`%${searchQuery.trim()}%`);
            sql += ` AND (t.name ILIKE $${params.length} OR t.description ILIKE $${params.length})`;
        }

        sql += ` ORDER BY c.name ASC, t.name ASC`;

        const res = await query(sql, params);
        const tasks: TaskItem[] = res.rows;

        // Group tasks under categories
        const categoryMap = new Map<string, CategoryWithTasks>();

        for (const cat of categories) {
            categoryMap.set(cat.id, { ...cat, tasks: [] });
        }

        for (const task of tasks) {
            const cat = categoryMap.get(task.category_id);
            if (cat) {
                cat.tasks.push(task);
            }
        }

        // Filter out categories with 0 matching tasks if a search/category filter was active
        const result = Array.from(categoryMap.values());
        if (categorySlugOrId || searchQuery) {
            return result.filter(c => c.tasks.length > 0);
        }

        return result;
    }
}

export const taskService = new TaskService();
