import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
// import authRoutes from "./routes/auth.js";
import { getRealDashboardStats, getLatestWaterQuality } from "./routes/dashboard-stats.js";
import { handleLogin, handleRegister, handleProfile } from "./routes/auth-simple.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  // app.use("/api/auth", authRoutes);

  // Authentication endpoints
  app.post("/api/login/", handleLogin);
  app.post("/api/register/", handleRegister);
  app.get("/api/profile/", handleProfile);

  // Real data API endpoints
  app.get("/api/dashboard/real-stats", getRealDashboardStats);
  app.get("/api/dashboard/latest", getLatestWaterQuality);

  return app;
}
