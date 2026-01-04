import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    console.log(`📁 Base de datos: ${conn.connection.db.databaseName}`);

    // Verificar que la colección 'photos' exista
    const collections = await conn.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    console.log("📂 Colecciones disponibles:", collectionNames);

    if (!collectionNames.includes('photos')) {
      console.warn("⚠️  La colección 'photos' no existe. Se creará al guardar el primer documento.");
    }

  } catch (error) {
    console.error(`❌ Error MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
