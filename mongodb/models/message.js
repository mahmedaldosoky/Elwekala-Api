import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  senderNationalId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (nationalId) {
        return /^\d{14}$/.test(nationalId);
      },
      message: (props) => `${props.value} is not a valid national ID!`,
    },
  },
  receiverNationalId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (nationalId) {
        return /^\d{14}$/.test(nationalId);
      },
      message: (props) => `${props.value} is not a valid national ID!`,
    },
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Message", messageSchema);
