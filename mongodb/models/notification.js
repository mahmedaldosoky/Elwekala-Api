import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
