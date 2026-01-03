import express from "express";
import upload from "../config/multer.js";
import Photo from "../models/Photo.js";

const router = express.Router();

// Obtener todas las fotos
router.get("/", async (req, res) => {
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener fotos" });
  }
});

// Obtener una foto específica
router.get("/:id", async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la foto" });
  }
});

// Subir nueva foto
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { year, date, text } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Se requiere una imagen" });
    }

    const photo = new Photo({
      imageUrl: req.file.path,
      year,
      date,
      text,
    });

    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al subir foto" });
  }
});

// Eliminar foto
router.delete("/:id", async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }
    res.json({ message: "Foto eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar foto" });
  }
});

export default router;