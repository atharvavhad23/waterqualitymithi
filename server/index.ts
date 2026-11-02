// server/index.ts
import express from "express";
import { handleRegression, handleClassification, handleClustering } from "./routes/ml";
import { handleAgentStream, handleAgent } from "./routes/agent";

export function createServer() {
  const app = express();

  // ...existing code (app setup, middleware)...
  // Ensure JSON body parsing for agent endpoints
  app.use(express.json());

  // ML endpoints
  app.post("/api/ml/regression", handleRegression);
  app.post("/api/ml/classify", handleClassification);
  app.post("/api/ml/cluster", handleClustering);

  // Agent endpoints
  app.post("/api/agent/stream", handleAgentStream);
  app.post("/api/agent", handleAgent);

  // ...existing code (other routes, vite integration, listen)...

  return app;
}