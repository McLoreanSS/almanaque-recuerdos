import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true
    },
    year: {
      type: String,
      default: "Sin año"
    },
    date: {
      type: String,
      default: ""
    },
    text: {
      type: String,
      default: ""
    },
  },
  { 
    timestamps: true, // Esto agrega createdAt y updatedAt automáticamente
    versionKey: false // Elimina el campo __v
  }
);

// Asegúrate que el modelo esté exportado correctamente
export default mongoose.model("Photo", photoSchema);
