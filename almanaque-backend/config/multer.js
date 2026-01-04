import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

console.log("🔧 Configurando Multer con Cloudinary...");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "almanaque",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 1200, crop: "limit" }]
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log(`🔍 Multer filtrando archivo: ${file.originalname}, ${file.mimetype}`);
    
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      console.error(`❌ Multer rechazó archivo: ${file.mimetype} no es imagen`);
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// Middleware de logging para multer
const uploadWithLogging = (req, res, next) => {
  console.log("=".repeat(40));
  console.log("🖼️  MULTER - Procesando upload...");
  console.log("Content-Type:", req.headers['content-type']);
  console.log("=".repeat(40));
  
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("❌ ERROR EN MULTER:", err.message);
    } else {
      console.log("✅ Multer completado");
      console.log("Archivo procesado:", req.file ? "Sí" : "No");
    }
    next(err);
  });
};

export default uploadWithLogging;
