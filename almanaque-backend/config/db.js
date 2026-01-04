import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("🔗 Conectando a MongoDB...");
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    console.log(`📁 Base de datos: ${conn.connection.db.databaseName}`);
    
    // Verificar colecciones
    const collections = await conn.connection.db.listCollections().toArray();
    console.log("📂 Colecciones disponibles:", collections.map(c => c.name));
    
  } catch (error) {
    console.error(`❌ Error MongoDB: ${error.message}`);
    console.error(`🔧 Stack: ${error.stack}`);
    process.exit(1);
  }
};

// Event listeners para debug
mongoose.connection.on('connected', () => {
  console.log('🎯 Mongoose conectado a DB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose desconectado');
});

export default connectDB;
