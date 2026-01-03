import mongoose from "mongoose";

const pinSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
});

const Pin = mongoose.model("Pin", pinSchema);
export default Pin;
