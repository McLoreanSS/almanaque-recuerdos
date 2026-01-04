import express from "express";
import upload from "../config/multer.js";
import Photo from "../models/Photo.js";

const router = express.Router();

// GET all photos
router.get("/", async (req, res) => {
  console.log("📸 GET /api/photos");
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });
    console.log(`✅ Encontradas ${photos.length} fotos`);
    res.json(photos);
  } catch (error) {
    console.error("❌ Error al obtener fotos:", error);
    res.status(500).json({ message: "Error al obtener fotos", error: error.message });
  }
});

// POST new photo
router.post("/", upload.single("image"), async (req, res) => {
  console.log("📤 POST /api/photos - Iniciando subida");

  try {
    const { year, date, text } = req.body;
    console.log("📝 Datos recibidos:", { year, date, text });

    if (!req.file) {
      console.error("❌ No se recibió ningún archivo");
      return res.status(400).json({ message: "Se requiere una imagen" });
    }

    console.log("📁 Archivo recibido en req.file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    // Crear un nuevo documento de Photo
    const photo = new Photo({
      imageUrl: req.file.path,
      year: year || "Sin año",
      date: date || "",
      text: text || "",
    });

    console.log("💾 Documento Photo a guardar:", photo);

    // Intentar guardar en MongoDB
    const savedPhoto = await photo.save();
    console.log("✅ Foto guardada en MongoDB:", savedPhoto);

    // Responder con el documento guardado
    res.status(201).json(savedPhoto);
  } catch (error) {
    console.error("❌ Error al guardar la foto en MongoDB:", error);
    
    // Si es un error de validación de Mongoose, mostrar detalles
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación", 
        errors 
      });
    }

    res.status(500).json({ 
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
      return res.status(404).json({ message: "Foto no encontrada" });
    }
    console.log(`✅ Foto eliminada: ${req.params.id}`);
    res.json({ message: "Foto eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar foto:", error);
    res.status(500).json({ message: "Error al eliminar foto" });
  }
});

export default router;
