import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

console.log("✅ Multer configurando con Cloudinary...");

// Configurar Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "almanaque",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 1200, crop: "limit" }]
  },
});

// Crear middleware de multer
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

console.log("✅ Multer configurado exitosamente");

export default upload;
