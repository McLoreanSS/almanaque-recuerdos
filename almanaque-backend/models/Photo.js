import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    imageUrl: String,
    year: String,
    date: String,
    text: String,
  },
  { timestamps: true }
);

export default mongoose.model("Photo", photoSchema);
