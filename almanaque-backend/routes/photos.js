// POST new photo
router.post("/", upload.single("image"), async (req, res) => {
  console.log("📤 POST /api/photos - Upload started");
  
  try {
    const { year, date, text } = req.body;

    // Verificar que haya archivo
    if (!req.file) {
      console.error("❌ No file in request");
      return res.status(400).json({ message: "Se requiere una imagen" });
    }

    console.log("📁 File info:", {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      cloudinary: {
        url: req.file.path,
        public_id: req.file.filename,
        format: req.file.format
      }
    });

    // Verificar que la URL de Cloudinary sea válida
    if (!req.file.path || !req.file.path.includes('cloudinary.com')) {
      console.error("❌ URL de Cloudinary inválida:", req.file.path);
      return res.status(500).json({ 
        message: "Error al subir imagen a Cloudinary",
        receivedPath: req.file.path
      });
    }

    // Crear documento de foto
    const photo = new Photo({
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename, // Guardar también el ID de Cloudinary
      year: year || "Sin año",
      date: date || "",
      text: text || "",
    });

    console.log("💾 Guardando en MongoDB...");
    const savedPhoto = await photo.save();
    
    console.log("✅ Foto guardada exitosamente:", {
      id: savedPhoto._id,
      imageUrl: savedPhoto.imageUrl,
      cloudinaryId: savedPhoto.cloudinaryId
    });
    
    // Devolver la foto guardada
    res.status(201).json(savedPhoto);
    
  } catch (error) {
    console.error("❌ Error completo al subir foto:", error);
    
    // Error específico de Cloudinary
    if (error.message.includes('cloudinary') || error.message.includes('Invalid')) {
      console.error("❌ Cloudinary error details:", error);
      return res.status(500).json({ 
        message: "Error de Cloudinary. Verifica las credenciales en Render.",
        hint: "Revisa CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
        error: error.message 
      });
    }
    
    // Error general
    res.status(500).json({ 
      message: "Error al subir foto", 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});
