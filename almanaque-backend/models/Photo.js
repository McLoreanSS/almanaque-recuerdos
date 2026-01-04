import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "URL de imagen es requerida"],
      trim: true
    },
    year: {
      type: String,
      required: [true, "Año es requerido"],
      trim: true
    },
    date: {
      type: String,
      default: "",
      trim: true
    },
    text: {
      type: String,
      default: "",
      trim: true
    }
  },
  { 
    timestamps: true,
    versionKey: false
  }
);

// Middleware para logging
photoSchema.pre('save', function(next) {
  console.log(`🔍 PRE-SAVE: Intentando guardar documento Photo`);
  console.log(`🔍 Datos:`, {
    imageUrl: this.imageUrl?.substring(0, 50) + '...',
    year: this.year,
    date: this.date,
    text: this.text?.substring(0, 30) + '...'
  });
  next();
});

photoSchema.post('save', function(doc, next) {
  console.log(`✅ POST-SAVE: Documento guardado EXITOSAMENTE`);
  console.log(`✅ ID generado: ${doc._id}`);
  console.log(`✅ Timestamp: ${doc.createdAt}`);
  next();
});

photoSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error(`❌ ERROR EN SAVE: ${error.message}`);
    console.error(`❌ Error name: ${error.name}`);
    console.error(`❌ Error code: ${error.code}`);
    console.error(`❌ Error stack: ${error.stack}`);
    
    // Errores de validación específicos
    if (error.name === 'ValidationError') {
      console.error('❌ Errores de validación:');
      for (const field in error.errors) {
        console.error(`  - ${field}: ${error.errors[field].message}`);
      }
    }
  }
  next(error);
});

const Photo = mongoose.model("Photo", photoSchema);

// Verificar que el modelo se creó
console.log("✅ Modelo Photo inicializado");

export default Photo;
