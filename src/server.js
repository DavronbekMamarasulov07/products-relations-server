import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import categoriesRoutes from "./routes/categories.routes.js";
import productsRoutes from "./routes/products.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { launchBot } from "./bot/index.js";

const app = express();

// ───────── CORS ─────────
// Faqat ruxsat etilgan frontend domeni(lari) uchun.
// .env: CORS_ORIGIN=https://your-site.netlify.app  (vergul bilan bir nechta)
const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// ───────── ROUTES ─────────
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is working" });
});

// ───────── START ─────────
const PORT = process.env.PORT || 4200;

const start = async () => {
  await connectDB();

  // Telegram botni express bilan bitta processda ishga tushiramiz
  await launchBot(app);

  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
};

start();
