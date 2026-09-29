import fs from 'fs';
import path from 'path';
import { pool } from './index';

async function initDB() {
    try {
        console.log('Starting PostgreSQL Database Initialization...');

        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
        console.log('Executing schema DDL...');
        await pool.query(schemaSql);
        console.log('Schema DDL created successfully.');

        const seedsSql = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf-8');
        console.log('Executing seed data insertion...');
        await pool.query(seedsSql);
        console.log('Seed data inserted successfully (4 categories, 20 tasks).');

        console.log('Database initialization completed.');
    } catch (error) {
        console.error('Database initialization failed:', error);
    } finally {
        await pool.end();
    }
}

initDB();
