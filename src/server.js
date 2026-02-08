import express from "express";
import "dotenv/config"
import connectDB from "./config/db.js";
import categoriesRoutes from "./routes/categories.routes.js";
import productsRoutes from "./routes/products.routes.js"
import authRoutes from "./routes/auth.routes.js";


const app = express();
app.use(express.json());
connectDB();


app.use('/api/categories', categoriesRoutes);
app.use("/api/products", productsRoutes );
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is working" });
});

const PORT = process.env.PORT || 4200;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`),
);
