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

// Crear el objeto upload de multer
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

// Crear una versión con logging
const uploadWithLogging = (req, res, next) => {
  console.log("=".repeat(40));
  console.log("🖼️  MULTER - Procesando upload...");
  console.log("Content-Type:", req.headers['content-type']);
  console.log("=".repeat(40));
  
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("❌ ERROR EN MULTER:", err.message);
      console.error("❌ Error stack:", err.stack);
    } else {
      console.log("✅ Multer completado");
      console.log("Archivo procesado:", req.file ? "Sí" : "No");
      if (req.file) {
        console.log("📁 File details:", {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          size: req.file.size,
          path: req.file.path
        });
      }
    }
    next(err);
  });
};

// Exportar AMBOS: el objeto upload original y la versión con logging
export { upload, uploadWithLogging };

// Exportar uploadWithLogging como default para compatibilidad
export default uploadWithLogging;
