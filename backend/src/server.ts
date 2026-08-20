import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DatabaseManager } from './db/DatabaseManager';
import apiRoutes from './routes';
import { seedDatabase } from './seed/seedData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Singleton initialization promise to prevent race conditions during high concurrency
let initPromise: Promise<void> | null = null;

function ensureDbInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const dbManager = DatabaseManager.getInstance();
      await dbManager.initialize();
      const db = dbManager.getDb();
      const userCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM USER');
      if (!userCount || userCount.count < 100) {
        await seedDatabase();
      }
    })().catch((err) => {
      initPromise = null; // allow retry if failed
      throw err;
    });
  }
  return initPromise;
}

// Initialize DB middleware for serverless and concurrent invocations
app.use(async (req, res, next) => {
  try {
    await ensureDbInitialized();
    next();
  } catch (err: any) {
    console.error('Server DB Init Error:', err);
    return res.status(500).json({
      success: false,
      message: `Database initialization failed: ${err?.message || 'Unknown database error'}`
    });
  }
});

// API Routes (mounted on both /api and / to handle all Vercel rewrite modes)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Root Status
app.get('/status', (req, res) => {
  res.json({
    message: 'Welcome to EventBridge API Server',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/patterns'
  });
});

// Global JSON Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 EventBridge Backend Server running on http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
}

export default app;
