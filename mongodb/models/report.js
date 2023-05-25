import mongoose from "mongoose";

const reportSchema = mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  problem: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Report", reportSchema);