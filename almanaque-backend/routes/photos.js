import express from "express";
import upload from "../config/multer.js";
import Photo from "../models/Photo.js";
import mongoose from "mongoose";

const router = express.Router();

// Middleware para verificar conexión a DB
const checkDB = async (req, res, next) => {
  const state = mongoose.connection.readyState;
  console.log(`📡 Estado conexión MongoDB: ${state}`);
  
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
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
    console.error("Stack:", error.stack);
    
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

// POST new photo - VERSIÓN DEFINITIVA
router.post("/", checkDB, upload.single("image"), async (req, res) => {
  console.log("=".repeat(50));
  console.log("📤 POST /api/photos - INICIANDO");
  console.log("=".repeat(50));
  
  try {
    // 1. LOG DETALLADO DE ENTRADA
    console.log("📦 HEADERS:", req.headers);
    console.log("📦 BODY FIELDS:", Object.keys(req.body));
    console.log("📦 BODY VALUES:", req.body);
    
    // 2. VERIFICAR ARCHIVO
    if (!req.file) {
      console.error("❌ ERROR: No se recibió archivo");
      return res.status(400).json({
        success: false,
        message: "Se requiere una imagen",
        receivedFields: Object.keys(req.body)
      });
    }
    
    console.log("📁 ARCHIVO RECIBIDO:");
    console.log("  - Fieldname:", req.file.fieldname);
    console.log("  - Original:", req.file.originalname);
    console.log("  - Mimetype:", req.file.mimetype);
    console.log("  - Size:", req.file.size, "bytes");
    console.log("  - Cloudinary URL:", req.file.path);
    
    // 3. EXTRAER Y VALIDAR DATOS
    const year = req.body.year ? String(req.body.year).trim() : "Sin año";
    const date = req.body.date ? String(req.body.date).trim() : "";
    const text = req.body.text ? String(req.body.text).trim() : "";
    
    console.log("📝 DATOS PROCESADOS:");
    console.log("  - Año:", year);
    console.log("  - Fecha:", date);
    console.log("  - Texto:", text.substring(0, 50) + (text.length > 50 ? "..." : ""));
    
    // 4. VALIDAR URL DE CLOUDINARY
    if (!req.file.path || !req.file.path.startsWith('http')) {
      console.error("❌ ERROR: URL de Cloudinary inválida");
      return res.status(500).json({
        success: false,
        message: "Error en Cloudinary: URL inválida",
        cloudinaryUrl: req.file.path
      });
    }
    
    // 5. CREAR DOCUMENTO
    const photoData = {
      imageUrl: req.file.path,
      year: year,
      date: date,
      text: text
    };
    
    console.log("💾 CREANDO DOCUMENTO:");
    console.log("  - Datos:", JSON.stringify(photoData, null, 2));
    
    // 6. CREAR INSTANCIA DE MONGOOSE
    const photo = new Photo(photoData);
    
    // 7. VALIDAR MANUALMENTE ANTES DE GUARDAR
    const validationError = photo.validateSync();
    if (validationError) {
      console.error("❌ ERROR DE VALIDACIÓN:");
      console.error(validationError.errors);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: validationError.errors
      });
    }
    
    console.log("✅ Validación de esquema pasada");
    
    // 8. CONTAR DOCUMENTOS ANTES
    const countBefore = await Photo.countDocuments();
    console.log(`📊 Documentos en DB antes: ${countBefore}`);
    
    // 9. INTENTAR GUARDAR CON MÚLTIPLES ESTRATEGIAS
    console.log("💾 INTENTANDO GUARDAR...");
    
    let savedPhoto;
    
    // Estrategia 1: Usar save() normal
    try {
      savedPhoto = await photo.save();
      console.log("✅ Estrategia 1 (save()) exitosa");
    } catch (saveError) {
      console.error("❌ Estrategia 1 falló:", saveError.message);
      
      // Estrategia 2: Usar create()
      try {
        console.log("🔄 Intentando estrategia 2 (create())...");
        savedPhoto = await Photo.create(photoData);
        console.log("✅ Estrategia 2 (create()) exitosa");
      } catch (createError) {
        console.error("❌ Estrategia 2 falló:", createError.message);
        
        // Estrategia 3: Usar insertOne directamente
        try {
          console.log("🔄 Intentando estrategia 3 (insertOne directo)...");
          const db = mongoose.connection.db;
          const result = await db.collection('photos').insertOne(photoData);
          savedPhoto = { ...photoData, _id: result.insertedId };
          console.log("✅ Estrategia 3 (insertOne) exitosa");
        } catch (insertError) {
          console.error("❌ Estrategia 3 falló:", insertError.message);
          throw new Error(`Todas las estrategias fallaron: ${saveError.message}, ${createError.message}, ${insertError.message}`);
        }
      }
    }
    
    // 10. VERIFICAR QUE REALMENTE SE GUARDÓ
    console.log("🔍 VERIFICANDO GUARDADO...");
    
    const countAfter = await Photo.countDocuments();
    console.log(`📊 Documentos en DB después: ${countAfter}`);
    
    if (countAfter <= countBefore) {
      console.error("❌ CRÍTICO: El conteo no aumentó");
      throw new Error("El documento no se guardó en la base de datos");
    }
    
    // 11. BUSCAR EL DOCUMENTO RECIÉN GUARDADO
    const foundPhoto = await Photo.findById(savedPhoto._id);
    
    if (!foundPhoto) {
      console.error("❌ CRÍTICO: No se pudo encontrar el documento recién guardado");
      throw new Error("Documento no encontrado después de guardar");
    }
    
    console.log("✅ DOCUMENTO ENCONTRADO EN DB:", {
      id: foundPhoto._id,
      year: foundPhoto.year,
      imageUrl: foundPhoto.imageUrl?.substring(0, 50) + '...'
    });
    
    // 12. PREPARAR RESPUESTA
    const responseData = {
      success: true,
      message: "¡Recuerdo guardado exitosamente!",
      photo: {
        _id: foundPhoto._id.toString(),
        imageUrl: foundPhoto.imageUrl,
        year: foundPhoto.year,
        date: foundPhoto.date,
        text: foundPhoto.text,
        createdAt: foundPhoto.createdAt,
        updatedAt: foundPhoto.updatedAt
      },
      debug: {
        countBefore,
        countAfter,
        dbName: mongoose.connection.db.databaseName,
        collection: 'photos'
      }
    };
    
    console.log("📤 ENVIANDO RESPUESTA EXITOSA");
    
    res.status(201).json(responseData);
    
  } catch (error) {
    console.error("=".repeat(50));
    console.error("❌ ERROR CRÍTICO EN POST /api/photos");
    console.error(`❌ Mensaje: ${error.message}`);
    console.error(`❌ Nombre: ${error.name}`);
    console.error(`❌ Stack: ${error.stack}`);
    console.error("=".repeat(50));
    
    // Error de validación
    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      
      return res.status(400).json({
        success: false,
        message: "Error de validación de datos",
        errors: errors
      });
    }
    
    // Error de MongoDB
    if (error.name.includes('Mongo') || error.code === 11000) {
      return res.status(500).json({
        success: false,
        message: "Error de base de datos",
        error: error.message,
        code: error.code
      });
    }
    
    // Error de Cloudinary
    if (error.message.includes('cloudinary')) {
      return res.status(500).json({
        success: false,
        message: "Error al procesar la imagen",
        error: error.message
      });
    }
    
    // Error general
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  } finally {
    console.log("=".repeat(50));
    console.log("📤 POST /api/photos - FINALIZADO");
    console.log("=".repeat(50));
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
