import express from "express";
import upload from "../config/multer.js";  // <-- Importa el default export
import Photo from "../models/Photo.js";
import mongoose from "mongoose";

const router = express.Router();

// Middleware para verificar conexión a DB
const checkDB = async (req, res, next) => {
  const state = mongoose.connection.readyState;
  console.log(`📡 Estado conexión MongoDB: ${state}`);
  
  if (state !== 1) {
    console.error("❌ MongoDB no está conectado");
    return res.status(500).json({
      success: false,
      message: "Base de datos no disponible",
      dbState: state
    });
  }
  
  next();
};

// GET all photos
router.get("/", checkDB, async (req, res) => {
  console.log("=".repeat(50));
  console.log("📸 GET /api/photos - SOLICITADO");
  console.log("=".repeat(50));
  
  try {
    console.log("🔍 Buscando fotos en MongoDB...");
    
    const photos = await Photo.find({}).sort({ createdAt: -1 });
    
    console.log(`✅ Encontradas ${photos.length} fotos`);
    
    if (photos.length > 0) {
      console.log("📊 Resumen de fotos:");
      photos.forEach((photo, index) => {
        console.log(`  ${index + 1}. ID: ${photo._id}, Año: ${photo.year}, URL: ${photo.imageUrl?.substring(0, 50)}...`);
      });
    }
    
    res.json(photos);
    
  } catch (error) {
    console.error("❌ Error en GET /api/photos:", error.message);
    
    res.status(500).json({
      success: false,
      message: "Error al obtener fotos",
      error: error.message
    });
  } finally {
    console.log("=".repeat(50));
    console.log("📸 GET /api/photos - FINALIZADO");
    console.log("=".repeat(50));
  }
});

// POST new photo - VERSIÓN SIMPLIFICADA
router.post("/", checkDB, (req, res, next) => {
  console.log("=".repeat(60));
  console.log("🟢 POST /api/photos - INICIANDO");
  console.log("=".repeat(60));
  console.log("📦 Headers:", req.headers['content-type']);
  next();
}, upload.single("image"), async (req, res) => {
  
  try {
    console.log("✅ Multer completado, verificando archivo...");
    
    // 1. VERIFICAR ARCHIVO
    if (!req.file) {
      console.error("❌ ERROR: No se recibió archivo después de multer");
      return res.status(400).json({
        success: false,
        message: "No se recibió ninguna imagen",
        hint: "Asegúrate de enviar el campo 'image' en form-data"
      });
    }
    
    console.log("📁 Archivo recibido:", {
      name: req.file.originalname,
      size: req.file.size,
      url: req.file.path
    });
    
    // 2. EXTRAER DATOS
    const year = req.body.year ? String(req.body.year).trim() : "Sin año";
    const date = req.body.date ? String(req.body.date).trim() : "";
    const text = req.body.text ? String(req.body.text).trim() : "";
    
    console.log("📝 Datos:", { year, date, text });
    
    // 3. GUARDAR EN MONGODB
    console.log("💾 Guardando en MongoDB...");
    
    const photo = new Photo({
      imageUrl: req.file.path,
      year: year,
      date: date,
      text: text
    });
    
    const savedPhoto = await photo.save();
    
    console.log("✅ Documento guardado:", {
      id: savedPhoto._id,
      year: savedPhoto.year
    });
    
    // 4. RESPONDER
    res.status(201).json({
      success: true,
      message: "Foto guardada correctamente",
      photo: savedPhoto
    });
    
  } catch (error) {
    console.error("❌ Error en POST /api/photos:", error.message);
    console.error("Stack:", error.stack);
    
    res.status(500).json({
      success: false,
      message: "Error al guardar la foto",
      error: error.message
    });
  } finally {
    console.log("=".repeat(60));
    console.log("🟢 POST /api/photos - FINALIZADO");
    console.log("=".repeat(60));
  }
});

// DELETE photo
router.delete("/:id", checkDB, async (req, res) => {
  console.log(`🗑️ DELETE /api/photos/${req.params.id}`);
  
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    
    if (!photo) {
      console.warn(`⚠️ Foto no encontrada: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: "Foto no encontrada"
      });
    }
    
    console.log(`✅ Foto eliminada: ${req.params.id}`);
    
    res.json({
      success: true,
      message: "Foto eliminada correctamente"
    });
    
  } catch (error) {
    console.error("❌ Error eliminando foto:", error);
    
    res.status(500).json({
      success: false,
      message: "Error al eliminar foto",
      error: error.message
    });
  }
});

export default router;
