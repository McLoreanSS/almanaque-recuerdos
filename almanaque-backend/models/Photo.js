import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "La URL de la imagen es obligatoria"],
    },
    year: {
      type: String,
      default: "Sin año",
    },
    date: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Agregar un índice para mejorar las búsquedas por año
photoSchema.index({ year: 1 });

const Photo = mongoose.model("Photo", photoSchema);

export default Photo;
