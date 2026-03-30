import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import authRoutes from "./src/routes/authRoutes";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // ✅ DEBUG (full env check)
  console.log("ENV CHECK:", process.env);

  // ✅ Safe Mongo URI (fallback added)
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/timetableDB";

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth Routes
  app.use("/api/auth", authRoutes);

  // Vite middleware (dev)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();