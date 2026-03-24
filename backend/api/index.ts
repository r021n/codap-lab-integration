import express from "express";
import cors from "cors";
import path from "path";
import * as dotenv from "dotenv";
import authRoutes from "../src/routes/auth.routes";
import datasetsRoutes from "../src/routes/datasets.routes";
import quizRoutes from "../src/routes/quiz.routes";

dotenv.config();

const app = express();

// ─── CORS Configuration ────────────────────────────────────────────
// Ganti URL di bawah dengan URL frontend Vercel Anda nanti
const allowedOrigins = [
  "http://localhost:5173", // Development
  "https://codap-frontend.vercel.app", // Production (ganti dengan URL asli)
  /\.vercel\.app$/, // Semua subdomain vercel.app
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

// Main Routes
app.use("/api/auth", authRoutes);
app.use("/api/datasets", datasetsRoutes);
app.use("/api/quizzes", quizRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running on Vercel" });
});

export default app;
