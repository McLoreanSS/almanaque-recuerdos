import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Conectando a MongoDB...");
    console.log("URI:", process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'test'  // ← Fuerza el nombre de la DB
    });
    
    console.log("✅ MongoDB conectado a DB:", mongoose.connection.db.databaseName);
    
    // Verificar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Colecciones disponibles:", collections.map(c => c.name));
    
  } catch (error) {
    console.error("❌ Error MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
