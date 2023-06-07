import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (phone) {
        return /^01\d{9}$/.test(phone);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  nationalId: {
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
  profileImage: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  token: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  favoriteProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      // unique: true,
    },
  ],
  inCart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        // required: true,
        default: 1,
      },
    },
  ],
});

export default mongoose.model("User", userSchema);
