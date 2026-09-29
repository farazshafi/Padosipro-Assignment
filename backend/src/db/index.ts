import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://padosi_user:padosi_password@localhost:5432/padosipro_db';

export const pool = new Pool({
    connectionString,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
