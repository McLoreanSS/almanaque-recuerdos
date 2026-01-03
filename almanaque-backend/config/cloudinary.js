import cloudinary from 'cloudinary';

// Configurar con logging
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true  // ← IMPORTANTE: usar HTTPS
});

console.log("✅ Cloudinary configurado para:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("✅ API Key:", process.env.CLOUDINARY_API_KEY ? "Configurada" : "FALTA");

// Probar conexión
cloudinary.v2.api.ping()
  .then(result => console.log("✅ Cloudinary ping exitoso:", result))
  .catch(err => console.error("❌ Cloudinary error:", err));

export default cloudinary;
