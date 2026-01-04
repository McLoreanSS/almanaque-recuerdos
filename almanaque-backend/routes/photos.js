import express from "express";
import { upload } from "../config/multer.js";  // <-- Importa el objeto upload, no uploadWithLogging
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

// POST new photo - CON LOGGING Y upload.single
router.post("/", checkDB, (req, res, next) => {
  console.log("=".repeat(60));
  console.log("🟢 POST /api/photos - ANTES DE MULTER");
  console.log("=".repeat(60));
  console.log("📦 Headers recibidos:", {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length']
  });
  console.log("📦 Body keys (antes de multer):", Object.keys(req.body));
  next();
}, upload.single("image"), async (req, res) => {  // <-- Usa upload.single normalmente
  console.log("=".repeat(60));
  console.log("🟢 POST /api/photos - DESPUÉS DE MULTER");
  console.log("=".repeat(60));
  
  try {
    // 1. VERIFICAR SI MULTER PROCESÓ EL ARCHIVO
    console.log("🔍 Verificando si multer procesó el archivo...");
    
    if (!req.file) {
      console.error("❌ ERROR: Multer no procesó ningún archivo");
      console.error("❌ Posibles causas:");
      console.error("   1. El campo no se llama 'image'");
      console.error("   2. El archivo es muy grande");
      console.error("   3. Tipo de archivo no permitido");
      console.error("   4. Error de Cloudinary");
      
      return res.status(400).json({
        success: false,
        message: "No se pudo procesar la imagen",
        details: "Multer no recibió archivo",
        requiredField: "image (form-data field)"
      });
    }
    
    console.log("✅ Multer procesó el archivo:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      cloudinaryUrl: req.file.path
    });
    
    // 2. EXTRAER DATOS DEL FORMULARIO
    const year = req.body.year ? String(req.body.year).trim() : "Sin año";
    const date = req.body.date ? String(req.body.date).trim() : "";
    const text = req.body.text ? String(req.body.text).trim() : "";
    
    console.log("📝 Datos del formulario:", { year, date, text });
    
    // 3. CREAR Y GUARDAR DOCUMENTO
    console.log("💾 Creando documento Photo...");
    
    const photo = new Photo({
      imageUrl: req.file.path,
      year: year,
      date: date,
      text: text
    });
    
    console.log("💾 Intentando guardar en MongoDB...");
    const savedPhoto = await photo.save();
    
    console.log("✅ Documento guardado exitosamente:", {
      id: savedPhoto._id,
      year: savedPhoto.year
    });
    
    // 4. RESPONDER CON ÉXITO
    res.status(201).json({
      success: true,
      message: "Foto guardada correctamente",
      photo: {
        _id: savedPhoto._id,
        imageUrl: savedPhoto.imageUrl,
        year: savedPhoto.year,
        date: savedPhoto.date,
        text: savedPhoto.text,
        createdAt: savedPhoto.createdAt
      }
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
    
    // Contar fotos restantes
    const remaining = await Photo.countDocuments();
    console.log(`📊 Fotos restantes en DB: ${remaining}`);
    
    res.json({
      success: true,
      message: "Foto eliminada correctamente",
      remaining: remaining
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
