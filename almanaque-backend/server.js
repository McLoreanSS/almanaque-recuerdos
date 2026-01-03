import "./config/env.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import photoRoutes from "./routes/photos.js";

connectDB();

const app = express();

// Configurar CORS
app.use(cors({
  origin: [
    'https://almanaque-recuerdos-2.onrender.com',
    'https://almanaque-recuerdos-1.onrender.com',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.send("Backend del Almanaque activo 🚀");
});

// Health check (IMPORTANTE para Render)
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "almanaque-backend"
  });
});

// Si no encuentra la ruta
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
