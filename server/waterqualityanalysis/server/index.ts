import express from "express";
import { Pool } from "pg";
import { json } from "body-parser";
import { handlePing } from "./routes/ping"; // Example route
import { handleDemo } from "./routes/demo"; // Example route

const app = express();
const PORT = process.env.PORT || 8080;

// PostgreSQL database connection setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Middleware
app.use(json());

// Example API routes
app.get("/api/ping", handlePing);
app.get("/api/demo", handleDemo);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export { pool };