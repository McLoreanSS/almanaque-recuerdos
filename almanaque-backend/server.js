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
    'https://almanaque-frontend.onrender-2.com',
    'https://almanaque-recuerdos-1.onrender.com',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.send("Backend del Almanaque activo 🚀");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "almanaque-backend",
    dbState: mongoose.connection.readyState // 1 para conectado
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal en el servidor!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
