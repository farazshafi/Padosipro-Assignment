import { Router, Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { pool } from '../db';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
    try {
        // Check PostgreSQL connection
        const dbResult = await pool.query('SELECT NOW()');

        return sendSuccess(res, {
            status: 'ok',
            service: 'PadosiPro Backend API',
            timestamp: new Date().toISOString(),
            database: {
                status: 'connected',
                serverTime: dbResult.rows[0].now,
            },
        }, 'Service health check successful');
    } catch (error: any) {
        return sendError(res, 'Health check failed: database unreachable', 503, {
            database: 'disconnected',
            error: error.message,
        });
    }
});

export default router;
