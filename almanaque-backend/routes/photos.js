import express from "express";
import upload from "../config/multer.js";
import Photo from "../models/Photo.js";

const router = express.Router();

// GET all photos
router.get("/", async (req, res) => {
  console.log("📸 GET /api/photos");
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${photos.length} photos`);
    res.json(photos);
  } catch (error) {
    console.error("❌ Error getting photos:", error);
    res.status(500).json({ message: "Error al obtener fotos" });
  }
});

// POST new photo - VERSIÓN CORREGIDA
router.post("/", upload.single("image"), async (req, res) => {
  console.log("📤 POST /api/photos - Upload started");
  
  try {
    const { year, date, text } = req.body;

    // Validar que haya archivo
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ message: "Se requiere una imagen" });
    }

    console.log("📁 File uploaded to Cloudinary:", {
      path: req.file.path,
      filename: req.file.filename,
      size: req.file.size
    });

    // Crear nueva foto
    const photo = new Photo({
      imageUrl: req.file.path,
      year: year || "Sin año",
      date: date || "",
      text: text || "",
    });

    console.log("💾 Guardando en MongoDB...");
    
    // GUARDAR y esperar a que termine
    await photo.save();
    
    console.log(`✅ Photo saved successfully:`, {
      id: photo._id,
      imageUrl: photo.imageUrl,
      year: photo.year
    });

    // IMPORTANTE: Devolver la foto guardada
    res.status(201).json({
      _id: photo._id,
      imageUrl: photo.imageUrl,
      year: photo.year,
      date: photo.date,
      text: photo.text,
      createdAt: photo.createdAt,
      updatedAt: photo.updatedAt,
      success: true,
      message: "Foto guardada correctamente"
    });

  } catch (error) {
    console.error("❌ Error completo al subir foto:", error);
    console.error("❌ Stack trace:", error.stack);
    
    // Error de Cloudinary
    if (error.message.includes('cloudinary') || error.message.includes('Invalid')) {
      return res.status(500).json({ 
        success: false,
        message: "Error de Cloudinary. Verifica las credenciales.",
        error: error.message 
      });
    }
    
    // Error de MongoDB
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ 
        success: false,
        message: "Error de base de datos. Verifica la conexión a MongoDB.",
        error: error.message 
      });
    }
    
    // Error general
    res.status(500).json({ 
      success: false,
      message: "Error al subir foto", 
      error: error.message
    });
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
    res.json({ 
      success: true,
      message: "Foto eliminada correctamente" 
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
