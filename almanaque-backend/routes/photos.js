import express from "express";
import upload from "../config/multer.js";
import Photo from "../models/Photo.js";
import mongoose from "mongoose";

const router = express.Router();

// GET all photos
router.get("/", async (req, res) => {
  console.log("📸 GET /api/photos");
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${photos.length} photos in DB`);
    
    // Verificar estructura de cada foto
    photos.forEach((photo, i) => {
      console.log(`📷 Foto ${i}:`, {
        id: photo._id,
        year: photo.year,
        hasImageUrl: !!photo.imageUrl,
        createdAt: photo.createdAt
      });
    });
    
    res.json(photos);
  } catch (error) {
    console.error("❌ Error getting photos:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ message: "Error al obtener fotos", error: error.message });
  }
});

// POST new photo - VERSIÓN CON VALIDACIÓN EXTREMA
router.post("/", upload.single("image"), async (req, res) => {
  console.log("=".repeat(50));
  console.log("📤 POST /api/photos - INICIANDO SUBIDA");
  console.log("=".repeat(50));
  
  try {
    // 1. LOG DE TODO LO QUE LLEGA
    console.log("📦 Request body fields:", Object.keys(req.body));
    console.log("📦 Request body values:", req.body);
    console.log("📁 Request file:", req.file ? "PRESENTE" : "AUSENTE");
    
    if (req.file) {
      console.log("📁 File details:", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        filename: req.file.filename
      });
    }
    
    // 2. VALIDACIONES BÁSICAS
    if (!req.file) {
      console.error("❌ ERROR: No se recibió archivo");
      return res.status(400).json({ 
        success: false, 
        message: "Se requiere una imagen",
        receivedData: {
          body: req.body,
          hasFile: false
        }
      });
    }
    
    // 3. EXTRAER DATOS CON VALORES POR DEFECTO
    const year = req.body.year || "2024";
    const date = req.body.date || "";
    const text = req.body.text || "";
    
    console.log("📝 Datos extraídos:", { year, date, text });
    
    // 4. VERIFICAR QUE LA URL DE CLOUDINARY SEA VÁLIDA
    if (!req.file.path || typeof req.file.path !== 'string') {
      console.error("❌ ERROR: Cloudinary path inválido:", req.file.path);
      return res.status(500).json({
        success: false,
        message: "Error: URL de Cloudinary inválida",
        fileInfo: req.file
      });
    }
    
    // 5. CREAR DOCUMENTO
    const photoData = {
      imageUrl: req.file.path,
      year: String(year).trim(),
      date: String(date).trim(),
      text: String(text).trim()
    };
    
    console.log("💾 Datos para guardar en MongoDB:", photoData);
    
    // 6. VERIFICAR QUE EL MODELO Photo EXISTE
    if (!Photo || typeof Photo !== 'function') {
      console.error("❌ ERROR CRÍTICO: Modelo Photo no está definido");
      return res.status(500).json({
        success: false,
        message: "Error interno: Modelo no disponible"
      });
    }
    
    // 7. CREAR INSTANCIA
    const photo = new Photo(photoData);
    console.log("📄 Instancia Photo creada:", photo);
    
    // 8. INTENTAR GUARDAR CON TRY-CATCH ESPECÍFICO
    let savedPhoto;
    try {
      console.log("💾 Intentando photo.save()...");
      savedPhoto = await photo.save();
      console.log("✅ photo.save() exitoso");
    } catch (saveError) {
      console.error("❌ ERROR en photo.save():", saveError.message);
      console.error("❌ Error name:", saveError.name);
      console.error("❌ Error stack:", saveError.stack);
      
      // Error de validación de Mongoose
      if (saveError.name === 'ValidationError') {
        const errors = {};
        Object.keys(saveError.errors).forEach(key => {
          errors[key] = saveError.errors[key].message;
        });
        console.error("❌ Validation errors:", errors);
        
        return res.status(400).json({
          success: false,
          message: "Error de validación",
          errors: errors,
          fieldErrors: saveError.errors
        });
      }
      
      throw saveError; // Re-lanzar para manejo general
    }
    
    // 9. VERIFICAR QUE REALMENTE SE GUARDÓ
    console.log("🔍 Verificando guardado en DB...");
    const verified = await Photo.findById(savedPhoto._id);
    
    if (!verified) {
      console.error("❌ ERROR: La foto no se encontró después de guardar");
      return res.status(500).json({
        success: false,
        message: "Error: La foto no se persistió en la base de datos"
      });
    }
    
    console.log("✅ Verificación exitosa. Foto en DB:", {
      id: verified._id,
      imageUrl: verified.imageUrl,
      year: verified.year,
      date: verified.date,
      text: verified.text,
      createdAt: verified.createdAt
    });
    
    // 10. CONTAR TOTAL DE FOTOS EN DB
    const totalPhotos = await Photo.countDocuments();
    console.log(`📊 Total de fotos en DB ahora: ${totalPhotos}`);
    
    // 11. RESPONDER CON ÉXITO
    const responseData = {
      success: true,
      message: "Foto guardada correctamente",
      photo: {
        _id: savedPhoto._id,
        imageUrl: savedPhoto.imageUrl,
        year: savedPhoto.year,
        date: savedPhoto.date,
        text: savedPhoto.text,
        createdAt: savedPhoto.createdAt,
        updatedAt: savedPhoto.updatedAt
      },
      debug: {
        totalInDB: totalPhotos,
        savedId: savedPhoto._id.toString()
      }
    };
    
    console.log("📤 Enviando respuesta:", responseData);
    res.status(201).json(responseData);
    
  } catch (error) {
    console.error("=".repeat(50));
    console.error("❌ ERROR GENERAL en POST /api/photos:");
    console.error("❌ Mensaje:", error.message);
    console.error("❌ Nombre:", error.name);
    console.error("❌ Stack completo:", error.stack);
    console.error("=".repeat(50));
    
    // Error de Cloudinary
    if (error.message.includes('cloudinary') || error.message.includes('Invalid')) {
      return res.status(500).json({
        success: false,
        message: "Error de Cloudinary. Verifica las credenciales en Render.",
        error: error.message
      });
    }
    
    // Error de MongoDB
    if (error.name.includes('Mongo') || error.code === 11000) {
      return res.status(500).json({
        success: false,
        message: "Error de base de datos MongoDB",
        error: error.message,
        code: error.code
      });
    }
    
    // Error general
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al guardar la foto",
      error: error.message
    });
  } finally {
    console.log("=".repeat(50));
    console.log("🏁 POST /api/photos - FINALIZADO");
    console.log("=".repeat(50));
  }
});

// DELETE photo
router.delete("/:id", async (req, res) => {
  console.log(`🗑️ DELETE /api/photos/${req.params.id}`);
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) {
      return res.status(404).json({ 
        success: false, 
        message: "Foto no encontrada" 
      });
    }
    console.log(`✅ Photo deleted: ${req.params.id}`);
    
    // Contar fotos restantes
    const remaining = await Photo.countDocuments();
    console.log(`📊 Fotos restantes en DB: ${remaining}`);
    
    res.json({ 
      success: true,
      message: "Foto eliminada correctamente",
      remaining: remaining
    });
  } catch (error) {
    console.error("❌ Error deleting photo:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar foto" 
    });
  }
});

export default router;
