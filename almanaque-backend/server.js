import "./config/env.js";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import photoRoutes from "./routes/photos.js";

console.log("=".repeat(60));
console.log("🚀 INICIANDO SERVIDOR DEL ALMANAQUE");
console.log("=".repeat(60));

connectDB();

const app = express();

// Configurar CORS amplio para debug
app.use(cors({
  origin: '*', // Temporalmente permitir todos
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Logging middleware para TODAS las peticiones
app.use((req, res, next) => {
  const start = Date.now();
  
  // Interceptar la respuesta para loggear
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    console.log(`🌐 ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    return originalSend.call(this, body);
  };
  
  console.log(`📥 ${req.method} ${req.url} - INICIANDO`);
  console.log(`📦 Headers: ${req.headers['content-type'] || 'No content-type'}`);
  
  next();
});

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: "Backend del Almanaque activo 🚀",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      photos: "/api/photos",
      auth: "/api/auth/login"
    },
    database: {
      connected: mongoose.connection.readyState === 1,
      name: mongoose.connection.db?.databaseName || "Desconocida"
    }
  });
});

// Health check detallado
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "almanaque-backend",
    database: {
      state: dbState,
      stateText: dbStates[dbState] || 'unknown',
      name: mongoose.connection.db?.databaseName || "N/A",
      host: mongoose.connection.host || "N/A"
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.url}`
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error("❌ ERROR GLOBAL NO MANEJADO:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: err.message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log("=".repeat(60));
});
