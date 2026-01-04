import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("=".repeat(60));
    console.log("🔗 CONEXIÓN MONGODB - INICIANDO");
    console.log("=".repeat(60));
    
    const uri = process.env.MONGO_URI;
    console.log("📡 URI (oculta contraseña):", 
      uri.replace(/:(.*)@/, ':****@'));
    
    console.log("🔄 Conectando a MongoDB...");
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log("✅ CONEXIÓN MONGODB EXITOSA");
    console.log(`📁 Base de datos: ${mongoose.connection.db.databaseName}`);
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    console.log(`📊 Puerto: ${mongoose.connection.port}`);
    
    // Verificar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📂 Colecciones encontradas:");
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Verificar si existe la colección photos
    const hasPhotos = collections.some(c => c.name === 'photos');
    if (!hasPhotos) {
      console.warn("⚠️  La colección 'photos' no existe aún.");
      console.warn("⚠️  Se creará automáticamente al guardar el primer documento.");
    }
    
    // Event listeners para debug
    mongoose.connection.on('error', err => {
      console.error('❌ Error de conexión MongoDB:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado');
    });
    
    console.log("=".repeat(60));
    console.log("🚀 MONGODB LISTO PARA USAR");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("=".repeat(60));
    console.error("❌ ERROR CRÍTICO DE CONEXIÓN MONGODB");
    console.error(`❌ Mensaje: ${error.message}`);
    console.error(`❌ Nombre: ${error.name}`);
    console.error(`❌ Código: ${error.code}`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error("❌ Problema de red o autenticación");
      console.error("❌ Verifica:");
      console.error("  1. La URI de conexión");
      console.error("  2. Las credenciales");
      console.error("  3. El whitelist de IPs en MongoDB Atlas");
    }
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error("❌ No se pudo conectar al servidor");
    }
    
    console.error("=".repeat(60));
    process.exit(1);
  }
};

export default connectDB;
