import "./config/env.js"; // 👈 SIEMPRE PRIMERO

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import photoRoutes from "./routes/photos.js";

connectDB();

const app = express();

app.use(cors({
  origin: [
    'https://almanaque-recuerdos-2.onrender.com', // ← TU FRONTEND
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);

app.get("/", (req, res) => {
  res.send("Backend del Almanaque activo");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en puerto ${PORT}`)
);
