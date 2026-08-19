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

// API Routes
app.use('/api', apiRoutes);

// Root Status
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to EventBridge API Server',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/patterns'
  });
});

async function startServer() {
  try {
    const dbManager = DatabaseManager.getInstance();
    await dbManager.initialize();

    // Auto-seed if database is fresh
    const db = dbManager.getDb();
    const collegeCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM COLLEGE');
    if (!collegeCount || collegeCount.count === 0) {
      console.log('Database empty. Running seed setup...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 EventBridge Backend Server running on http://localhost:${PORT}`);
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('Failed to start EventBridge backend server:', err);
    process.exit(1);
  }
}

startServer();
