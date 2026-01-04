import dotenv from 'dotenv';

dotenv.config();

// Opcional: Verificar que las variables necesarias estén presentes
const requiredEnvVars = ['MONGO_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'ALBUM_PIN'];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`⚠️  Advertencia: La variable de entorno ${varName} no está definida.`);
  }
});
