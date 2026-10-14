import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DatabaseManager } from "./db/DatabaseManager.js";
import apiRoutes from "./routes/index.js";
import { seedDatabase } from "./seed/seedData.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5e3;
app.use(cors());
app.use(express.json());
let initPromise = null;
function ensureDbInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      const dbManager = DatabaseManager.getInstance();
      await dbManager.initialize();
      const db = dbManager.getDb();
      const userCount = await db.get("SELECT COUNT(*) as count FROM USER");
      if (!userCount || userCount.count === 0) {
        await seedDatabase();
      }
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}
app.use(async (req, res, next) => {
  try {
    await ensureDbInitialized();
    next();
  } catch (err) {
    console.error("Server DB Init Error:", err);
    return res.status(500).json({
      success: false,
      message: `Database initialization failed: ${err?.message || "Unknown database error"}`
    });
  }
});
app.use("/api", apiRoutes);
app.use("/", apiRoutes);
app.get("/status", (req, res) => {
  res.json({
    message: "Welcome to EventBridge API Server",
    status: "ONLINE",
    version: "1.0.0",
    documentation: "/api/patterns"
  });
});
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`\u{1F680} EventBridge Backend Server running on http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
}
export default app;
