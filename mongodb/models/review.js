import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
  user: {
    type: Number,
    // ref: "User",
    required: true,
    index: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);