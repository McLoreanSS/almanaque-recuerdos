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

// POST new photo
router.post("/", upload.single("image"), async (req, res) => {
  console.log("📤 POST /api/photos - Upload started");
  
  try {
    const { year, date, text } = req.body;

    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ message: "Se requiere una imagen" });
    }

    console.log("📁 File uploaded to Cloudinary:", req.file.path);

    const photo = new Photo({
      imageUrl: req.file.path,
      year: year || "Sin año",
      date: date || "",
      text: text || "",
    });

    await photo.save();
    console.log(`✅ Photo saved to MongoDB: ${photo._id}`);
    
    res.status(201).json(photo);
  } catch (error) {
    console.error("❌ Error uploading photo:", error);
    
    if (error.message.includes('cloudinary')) {
      return res.status(500).json({ 
        message: "Error de Cloudinary",
        error: error.message 
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
    console.log(`✅ Photo deleted: ${req.params.id}`);
    res.json({ message: "Foto eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error deleting photo:", error);
    res.status(500).json({ message: "Error al eliminar foto" });
  }
});

export default router;
